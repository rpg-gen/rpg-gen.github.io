#!/usr/bin/env python3
"""
Migration script to convert the old checkpoint format to the new format.
The old format stored a list of all processed words.
The new format stores only the latest processed word.

This script finds the latest processed word by determining which word
appears lowest in the source file (highest index).
"""

import json
import os
from typing import List, Set

# Configuration
OLD_CHECKPOINT_FILE = "dictionary_checkpoint.json"
NEW_CHECKPOINT_FILE = "dictionary_checkpoint_new.json"
BACKUP_CHECKPOINT_FILE = "dictionary_checkpoint_backup.json"
INPUT_FILE = "../vite-app/src/assets/words_alpha_shuffled.txt"

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

def load_old_checkpoint() -> Set[str]:
    """Load the old checkpoint file format."""
    if not os.path.exists(OLD_CHECKPOINT_FILE):
        print(f"Old checkpoint file {OLD_CHECKPOINT_FILE} not found.")
        return set()
    
    try:
        with open(OLD_CHECKPOINT_FILE, 'r', encoding='utf-8') as file:
            checkpoint_data = json.load(file)
            processed_words = set(checkpoint_data.get('processed_words', []))
            print(f"Loaded old checkpoint: {len(processed_words)} processed words")
            return processed_words
    except Exception as e:
        print(f"Error loading old checkpoint file: {e}")
        return set()

def find_latest_processed_word(words: List[str], processed_words: Set[str]) -> str:
    """
    Find the latest processed word by finding which processed word
    appears at the highest index in the source file.
    """
    if not processed_words:
        return ""
    
    # Create a mapping of word to its index in the source file
    word_to_index = {word: index for index, word in enumerate(words)}
    
    # Find the processed word with the highest index
    latest_word = ""
    highest_index = -1
    
    for word in processed_words:
        if word in word_to_index:
            index = word_to_index[word]
            if index > highest_index:
                highest_index = index
                latest_word = word
    
    if latest_word:
        print(f"Found latest processed word: '{latest_word}' at position {highest_index}")
    else:
        print("Warning: No processed words found in the current input file")
    
    return latest_word

def create_new_checkpoint(latest_word: str, timestamp: float = None) -> dict:
    """Create the new checkpoint format."""
    import time
    return {
        'latest_word': latest_word,
        'timestamp': timestamp or time.time()
    }

def backup_old_checkpoint():
    """Create a backup of the old checkpoint file."""
    if os.path.exists(OLD_CHECKPOINT_FILE):
        try:
            import shutil
            shutil.copy2(OLD_CHECKPOINT_FILE, BACKUP_CHECKPOINT_FILE)
            print(f"Backed up old checkpoint to {BACKUP_CHECKPOINT_FILE}")
        except Exception as e:
            print(f"Warning: Could not create backup: {e}")

def migrate_checkpoint():
    """Main migration function."""
    print("Checkpoint Migration Script")
    print("=" * 40)
    
    # Check if input file exists
    if not os.path.exists(INPUT_FILE):
        print(f"Error: Input file {INPUT_FILE} not found!")
        print("Please make sure you're running this script from the data_manipulation_python directory.")
        return
    
    # Read the source words
    words = read_words_from_file(INPUT_FILE)
    if not words:
        print("No words loaded from input file. Cannot proceed with migration.")
        return
    
    # Load the old checkpoint
    processed_words = load_old_checkpoint()
    if not processed_words:
        print("No processed words found in old checkpoint. Nothing to migrate.")
        return
    
    # Find the latest processed word
    latest_word = find_latest_processed_word(words, processed_words)
    
    if not latest_word:
        print("No valid processed words found. Creating empty checkpoint.")
        latest_word = ""
    
    # Create backup of old checkpoint
    backup_old_checkpoint()
    
    # Create new checkpoint
    new_checkpoint = create_new_checkpoint(latest_word)
    
    # Save new checkpoint
    try:
        with open(NEW_CHECKPOINT_FILE, 'w', encoding='utf-8') as file:
            json.dump(new_checkpoint, file, indent=2)
        print(f"Created new checkpoint file: {NEW_CHECKPOINT_FILE}")
        print(f"Latest processed word: '{latest_word}'")
        
        # Replace old checkpoint with new one
        if os.path.exists(OLD_CHECKPOINT_FILE):
            os.remove(OLD_CHECKPOINT_FILE)
        os.rename(NEW_CHECKPOINT_FILE, OLD_CHECKPOINT_FILE)
        print(f"Replaced old checkpoint with new format")
        
    except Exception as e:
        print(f"Error saving new checkpoint: {e}")
        return
    
    print("\nMigration completed successfully!")
    print(f"Old checkpoint backed up to: {BACKUP_CHECKPOINT_FILE}")
    print(f"New checkpoint format saved to: {OLD_CHECKPOINT_FILE}")

if __name__ == "__main__":
    migrate_checkpoint() 