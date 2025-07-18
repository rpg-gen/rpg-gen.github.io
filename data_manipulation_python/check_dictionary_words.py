#!/usr/bin/env python3
"""
Script to check words against the dictionary API and split them into two files:
- words_in_dictionary.txt: Words that return valid definitions from the API
- words_not_in_dictionary.txt: Words that return 404 or other errors from the API

Features:
- Writes results to files as it processes each word
- Can resume from where it left off if interrupted
- Creates checkpoint file to track progress
"""

import requests
import time
import os
import json
from typing import List, Tuple, Set

# Configuration
DICTIONARY_API_ENDPOINT = "https://api.dictionaryapi.dev/api/v2/entries/en/"
INPUT_FILE = "../vite-app/src/assets/words_alpha_shuffled.txt"
WORDS_IN_DICT_FILE = "words_in_dictionary.txt"
WORDS_NOT_IN_DICT_FILE = "words_not_in_dictionary.txt"
CHECKPOINT_FILE = "dictionary_checkpoint.json"
REQUEST_DELAY = .5  # Delay between requests to be respectful to the API
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

def append_word_to_file(word: str, filename: str):
    """Append a single word to a file."""
    try:
        with open(filename, 'a', encoding='utf-8') as file:
            file.write(word + '\n')
    except Exception as e:
        print(f"Error writing word '{word}' to {filename}: {e}")

def get_existing_words_from_file(filename: str) -> Set[str]:
    """Get words that already exist in an output file."""
    if not os.path.exists(filename):
        return set()
    
    try:
        with open(filename, 'r', encoding='utf-8') as file:
            words = {word.strip() for word in file.readlines() if word.strip()}
        return words
    except Exception as e:
        print(f"Warning: Could not read existing words from {filename}: {e}")
        return set()

def check_word_in_dictionary(word: str) -> bool:
    """
    Check if a word exists in the dictionary API.
    Returns True if the word has a definition, False otherwise.
    Raises SystemExit if unexpected response code persists after retry.
    """
    for attempt in range(2):  # Try twice
        try:
            url = f"{DICTIONARY_API_ENDPOINT}{word}"
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                return True
            elif response.status_code == 404:
                return False
            else:
                print(f"Warning: Unexpected status code {response.status_code} for word '{word}' (attempt {attempt + 1}/2)")
                if attempt == 0:  # First attempt failed
                    print("Waiting 30 seconds before retrying...")
                    time.sleep(30)
                else:  # Second attempt also failed
                    print(f"Fatal error: Unexpected status code {response.status_code} persisted after retry for word '{word}'")
                    print("Stopping script due to API issues.")
                    raise SystemExit(1)
                    
        except requests.exceptions.RequestException as e:
            print(f"Error checking word '{word}' (attempt {attempt + 1}/2): {e}")
            if attempt == 0:  # First attempt failed
                print("Waiting 30 seconds before retrying...")
                time.sleep(30)
            else:  # Second attempt also failed
                print(f"Fatal error: Request exception persisted after retry for word '{word}': {e}")
                print("Stopping script due to network issues.")
                raise SystemExit(1)
        except Exception as e:
            print(f"Unexpected error checking word '{word}' (attempt {attempt + 1}/2): {e}")
            if attempt == 0:  # First attempt failed
                print("Waiting 30 seconds before retrying...")
                time.sleep(30)
            else:  # Second attempt also failed
                print(f"Fatal error: Unexpected error persisted after retry for word '{word}': {e}")
                print("Stopping script due to unexpected errors.")
                raise SystemExit(1)
    
    # This should never be reached, but just in case
    return False

def process_words(words: List[str]) -> Tuple[int, int]:
    """
    Process all words and write results to files as we go.
    Returns counts of words in dictionary and words not in dictionary.
    """
    # Load checkpoint and existing results
    latest_processed_word = load_checkpoint()
    existing_in_dict = get_existing_words_from_file(WORDS_IN_DICT_FILE)
    existing_not_in_dict = get_existing_words_from_file(WORDS_NOT_IN_DICT_FILE)
    
    # Count existing results
    words_in_dict_count = len(existing_in_dict)
    words_not_in_dict_count = len(existing_not_in_dict)
    
    # Find the starting position for processing
    start_index = find_start_position(words, latest_processed_word)
    
    # Filter out already processed words
    words_to_process = words[start_index:]
    
    if not words_to_process:
        print("All words have already been processed!")
        return words_in_dict_count, words_not_in_dict_count
    
    total_words = len(words)
    remaining_words = len(words_to_process)
    
    # Calculate how many words were already processed
    already_processed_count = start_index
    
    print(f"Starting to process {remaining_words} remaining words out of {total_words} total...")
    print(f"Already processed: {already_processed_count} words (starting from position {start_index})")
    print(f"Already found in dictionary: {words_in_dict_count} words")
    print(f"Already not in dictionary: {words_not_in_dict_count} words")
    print(f"Using delay of {REQUEST_DELAY} seconds between requests")
    
    for i, word in enumerate(words_to_process, 1):
        # Calculate total progress including previously processed words
        total_processed_so_far = already_processed_count + i
        total_progress_percentage = min((total_processed_so_far / total_words) * 100, 100.0)
        
        # Progress reporting
        if i % BATCH_SIZE == 0 or i == remaining_words:
            print(f"Progress: {i}/{remaining_words} remaining ({total_processed_so_far}/{total_words} total) - {total_progress_percentage:.1f}% complete")
        
        # Check word against dictionary
        try:
            is_in_dict = check_word_in_dictionary(word)
            
            # Write result immediately to file
            if is_in_dict:
                append_word_to_file(word, WORDS_IN_DICT_FILE)
                words_in_dict_count += 1
            else:
                append_word_to_file(word, WORDS_NOT_IN_DICT_FILE)
                words_not_in_dict_count += 1
            
            # Mark as processed and save checkpoint
            latest_processed_word = word # Update the latest processed word
            save_checkpoint(latest_processed_word)
            
            # Be respectful to the API with a delay
            time.sleep(REQUEST_DELAY)
            
        except SystemExit:
            # If we hit a fatal error, wait longer before stopping
            print(f"Waiting {ERROR_DELAY} seconds after fatal error before stopping...")
            time.sleep(ERROR_DELAY)
            raise  # Re-raise the SystemExit to stop the script
    
    # Final checkpoint save
    save_checkpoint(latest_processed_word)
    
    return words_in_dict_count, words_not_in_dict_count

def find_start_position(words: List[str], latest_processed_word: str) -> int:
    """Find the position in the words list to start processing from."""
    if not latest_processed_word:
        return 0
    
    try:
        # Find the index of the latest processed word
        start_index = words.index(latest_processed_word)
        # Start from the next word
        return start_index + 1
    except ValueError:
        # Word not found in current list, start from beginning
        print(f"Warning: Latest processed word '{latest_processed_word}' not found in current input file. Starting from beginning.")
        return 0

def write_words_to_file(words: List[str], filename: str):
    """Write a list of words to a file."""
    try:
        with open(filename, 'w', encoding='utf-8') as file:
            for word in words:
                file.write(word + '\n')
        print(f"Wrote {len(words)} words to {filename}")
    except Exception as e:
        print(f"Error writing to {filename}: {e}")

def main():
    print("Dictionary Word Checker")
    print("=" * 50)
    
    # Check if input file exists
    if not os.path.exists(INPUT_FILE):
        print(f"Error: Input file {INPUT_FILE} not found!")
        print("Please make sure you're running this script from the project root directory.")
        return
    
    # Read words from input file
    words = read_words_from_file(INPUT_FILE)
    if not words:
        return
    
    # Process words
    print("\nStarting dictionary checks...")
    words_in_dict_count, words_not_in_dict_count = process_words(words)
    
    # Summary
    print("\nSummary:")
    print(f"Total words processed: {len(words)}")
    print(f"Words in dictionary: {words_in_dict_count}")
    print(f"Words not in dictionary: {words_not_in_dict_count}")
    print(f"Results saved to: {WORDS_IN_DICT_FILE} and {WORDS_NOT_IN_DICT_FILE}")
    print(f"Checkpoint saved to: {CHECKPOINT_FILE}")
    
    # Clean up checkpoint file if processing is complete
    # Check if we've processed all words by seeing if the latest processed word is the last word in the list
    latest_processed_word = load_checkpoint()
    if latest_processed_word and latest_processed_word == words[-1]:
        try:
            os.remove(CHECKPOINT_FILE)
            print("Processing complete! Checkpoint file removed.")
        except Exception as e:
            print(f"Warning: Could not remove checkpoint file: {e}")
    else:
        print("Processing incomplete. You can restart the script to continue from where it left off.")

if __name__ == "__main__":
    main() 