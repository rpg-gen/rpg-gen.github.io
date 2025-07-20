#!/usr/bin/env python3
"""
Script to add definitions to words that are already confirmed to be in the dictionary.
Reads from words_in_dictionary.txt and creates a new file with words and their definitions.

Features:
- Fetches definitions from the Dictionary API
- Writes results to files as it processes each word
- Can resume from where it left off if interrupted
- Creates checkpoint file to track progress
- Handles API rate limiting and errors gracefully
"""

import requests
import time
import os
import json
from typing import List, Dict, Optional

# Configuration
DICTIONARY_API_ENDPOINT = "https://api.dictionaryapi.dev/api/v2/entries/en/"
INPUT_FILE = "word_lists/words_in_dictionary.txt"
OUTPUT_FILE = "word_lists/words_with_definitions.txt"
CHECKPOINT_FILE = "definitions_checkpoint.json"
REQUEST_DELAY = 1.0  # Delay between requests to be respectful to the API
ERROR_DELAY = 60  # Extended delay after errors (1 minute)
BATCH_SIZE = 10  # Process words in batches for progress reporting

def read_words_from_file(filename: str) -> List[str]:
    """Read words from the input file and return as a list."""
    try:
        with open(filename, 'r', encoding='utf-8') as file:
            words = [word.strip() for word in file.readlines() if word.strip()]
        print(f"Loaded {len(words)} words from {filename}")
        return words
    except FileNotFoundError:
        print(f"Error: File {filename} not found!")
        return []
    except Exception as e:
        print(f"Error reading file {filename}: {e}")
        return []

def load_checkpoint() -> str:
    """Load the checkpoint file to see the latest word that was successfully processed."""
    if not os.path.exists(CHECKPOINT_FILE):
        return ""
    
    try:
        with open(CHECKPOINT_FILE, 'r', encoding='utf-8') as file:
            checkpoint_data = json.load(file)
            latest_word = checkpoint_data.get('latest_word', "")
            print(f"Loaded checkpoint: latest processed word was '{latest_word}'")
            return latest_word
    except Exception as e:
        print(f"Warning: Could not load checkpoint file: {e}")
        return ""

def save_checkpoint(latest_word: str):
    """Save the latest processed word to the checkpoint file."""
    try:
        checkpoint_data = {
            'latest_word': latest_word,
            'timestamp': time.time()
        }
        with open(CHECKPOINT_FILE, 'w', encoding='utf-8') as file:
            json.dump(checkpoint_data, file, indent=2)
    except Exception as e:
        print(f"Warning: Could not save checkpoint: {e}")

def append_word_with_definition(word: str, definition: str, filename: str):
    """Append a word and its definition to a file."""
    try:
        with open(filename, 'a', encoding='utf-8') as file:
            # Format: word|definition
            file.write(f"{word}|{definition}\n")
    except Exception as e:
        print(f"Error writing word '{word}' to {filename}: {e}")

def get_existing_words_from_file(filename: str) -> set:
    """Get words that already exist in the output file."""
    if not os.path.exists(filename):
        return set()
    
    try:
        with open(filename, 'r', encoding='utf-8') as file:
            words = set()
            for line in file:
                if '|' in line:
                    word = line.split('|')[0].strip()
                    words.add(word)
        return words
    except Exception as e:
        print(f"Warning: Could not read existing words from {filename}: {e}")
        return set()

def extract_definition_from_api_response(api_data: List[Dict]) -> Optional[str]:
    """
    Extract a concise definition from the API response.
    Returns the first available definition or None if no definition found.
    """
    try:
        if not api_data:
            return None
        
        # Get the first entry
        first_entry = api_data[0]
        
        # Look for meanings
        meanings = first_entry.get('meanings', [])
        if not meanings:
            return None
        
        # Get the first meaning
        first_meaning = meanings[0]
        
        # Look for definitions
        definitions = first_meaning.get('definitions', [])
        if not definitions:
            return None
        
        # Get the first definition
        first_definition = definitions[0].get('definition', '')
        
        # Clean up the definition (remove extra whitespace, limit length)
        if first_definition:
            # Remove extra whitespace
            cleaned_definition = ' '.join(first_definition.split())
            # Limit to reasonable length (e.g., 200 characters)
            if len(cleaned_definition) > 200:
                cleaned_definition = cleaned_definition[:197] + "..."
            return cleaned_definition
        
        return None
        
    except Exception as e:
        print(f"Error extracting definition from API response: {e}")
        return None

def get_word_definition(word: str) -> Optional[str]:
    """
    Get the definition of a word from the Dictionary API.
    Returns the definition string or None if not found or error.
    """
    for attempt in range(2):  # Try twice
        try:
            url = f"{DICTIONARY_API_ENDPOINT}{word}"
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                api_data = response.json()
                definition = extract_definition_from_api_response(api_data)
                return definition
            elif response.status_code == 404:
                print(f"Warning: Word '{word}' not found in dictionary (404)")
                return None
            else:
                print(f"Warning: Unexpected status code {response.status_code} for word '{word}' (attempt {attempt + 1}/2)")
                if attempt == 0:  # First attempt failed
                    print("Waiting 30 seconds before retrying...")
                    time.sleep(30)
                else:  # Second attempt also failed
                    print(f"Error: Unexpected status code {response.status_code} persisted after retry for word '{word}'")
                    return None
                    
        except requests.exceptions.RequestException as e:
            print(f"Error checking word '{word}' (attempt {attempt + 1}/2): {e}")
            if attempt == 0:  # First attempt failed
                print("Waiting 30 seconds before retrying...")
                time.sleep(30)
            else:  # Second attempt also failed
                print(f"Error: Request exception persisted after retry for word '{word}': {e}")
                return None
        except Exception as e:
            print(f"Unexpected error checking word '{word}' (attempt {attempt + 1}/2): {e}")
            if attempt == 0:  # First attempt failed
                print("Waiting 30 seconds before retrying...")
                time.sleep(30)
            else:  # Second attempt also failed
                print(f"Error: Unexpected error persisted after retry for word '{word}': {e}")
                return None
    
    return None

def find_start_position(words: List[str], latest_processed_word: str) -> int:
    """Find the index to start processing from based on the checkpoint."""
    if not latest_processed_word:
        return 0
    
    try:
        start_index = words.index(latest_processed_word) + 1
        print(f"Resuming from word at index {start_index} (after '{latest_processed_word}')")
        return start_index
    except ValueError:
        print(f"Warning: Checkpoint word '{latest_processed_word}' not found in word list. Starting from beginning.")
        return 0

def process_words(words: List[str]) -> int:
    """
    Process all words and write results to files as we go.
    Returns count of words with definitions added.
    """
    # Load checkpoint and existing results
    latest_processed_word = load_checkpoint()
    existing_words = get_existing_words_from_file(OUTPUT_FILE)
    
    # Count existing results
    words_with_definitions_count = len(existing_words)
    
    # Find the starting position for processing
    start_index = find_start_position(words, latest_processed_word)
    
    # Filter out already processed words
    words_to_process = [word for word in words[start_index:] if word not in existing_words]
    
    if not words_to_process:
        print("All words have already been processed!")
        return words_with_definitions_count
    
    total_words = len(words)
    remaining_words = len(words_to_process)
    
    # Calculate how many words were already processed
    already_processed_count = start_index
    
    print(f"Starting to process {remaining_words} remaining words out of {total_words} total...")
    print(f"Already processed: {already_processed_count} words (starting from position {start_index})")
    print(f"Already have definitions: {words_with_definitions_count} words")
    print(f"Using delay of {REQUEST_DELAY} seconds between requests")
    
    for i, word in enumerate(words_to_process, 1):
        # Calculate total progress including previously processed words
        total_processed_so_far = already_processed_count + i
        total_progress_percentage = min((total_processed_so_far / total_words) * 100, 100.0)
        
        # Progress reporting
        if i % BATCH_SIZE == 0 or i == remaining_words:
            print(f"Progress: {i}/{remaining_words} remaining ({total_processed_so_far}/{total_words} total) - {total_progress_percentage:.1f}% complete")
        
        # Get definition for word
        try:
            definition = get_word_definition(word)
            
            # Write result immediately to file
            if definition:
                append_word_with_definition(word, definition, OUTPUT_FILE)
                words_with_definitions_count += 1
                print(f"✓ Added definition for '{word}': {definition[:50]}...")
            else:
                print(f"✗ No definition found for '{word}'")
            
            # Mark as processed and save checkpoint
            latest_processed_word = word
            save_checkpoint(latest_processed_word)
            
            # Be respectful to the API with a delay
            time.sleep(REQUEST_DELAY)
            
        except KeyboardInterrupt:
            print("\nScript interrupted by user. Progress has been saved.")
            return words_with_definitions_count
        except Exception as e:
            print(f"Unexpected error processing word '{word}': {e}")
            # Continue with next word
            continue
    
    print(f"\nCompleted! Added definitions for {words_with_definitions_count} words.")
    return words_with_definitions_count

def main():
    """Main function to run the script."""
    print("=== Word Definition Adder ===")
    print(f"Input file: {INPUT_FILE}")
    print(f"Output file: {OUTPUT_FILE}")
    print(f"Checkpoint file: {CHECKPOINT_FILE}")
    print()
    
    # Read words from input file
    words = read_words_from_file(INPUT_FILE)
    if not words:
        print("No words to process. Exiting.")
        return
    
    # Process words
    try:
        words_with_definitions = process_words(words)
        print(f"\nFinal result: {words_with_definitions} words now have definitions")
        print(f"Results saved to: {OUTPUT_FILE}")
        
    except KeyboardInterrupt:
        print("\nScript interrupted by user.")
    except Exception as e:
        print(f"Unexpected error: {e}")

if __name__ == "__main__":
    main() 