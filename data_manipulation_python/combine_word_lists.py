#!/usr/bin/env python3
"""
Script to combine word lists into a single accepted_words file.
Combines saved_words_2025-07-20.txt, words_with_definitions.txt, and non_dictionary_candidates.txt
into a single file with definitions where available.
"""

import os
from pathlib import Path

def read_saved_words(filepath):
    """Read words from saved_words file (one word per line)."""
    words = set()
    with open(filepath, 'r', encoding='utf-8') as f:
        for line in f:
            word = line.strip()
            if word and not word.startswith('#'):
                words.add(word.lower())
    return words

def read_words_with_definitions(filepath):
    """Read words and definitions from words_with_definitions file (word|definition format)."""
    word_definitions = {}
    with open(filepath, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line and '|' in line:
                parts = line.split('|', 1)
                if len(parts) == 2:
                    word = parts[0].strip().lower()
                    definition = parts[1].strip()
                    word_definitions[word] = definition
    return word_definitions

def read_non_dictionary_candidates(filepath):
    """Read words and definitions from non_dictionary_candidates file."""
    word_definitions = {}
    with open(filepath, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and ' - ' in line:
                parts = line.split(' - ', 1)
                if len(parts) == 2:
                    word = parts[0].strip().lower()
                    definition = parts[1].strip()
                    word_definitions[word] = definition
    return word_definitions

def combine_word_lists():
    """Combine all word lists into a single accepted_words file."""
    # Define file paths
    base_dir = Path(__file__).parent / "word_lists"
    saved_words_file = base_dir / "saved_words_2025-07-20.txt"
    words_with_definitions_file = base_dir / "words_with_definitions.txt"
    non_dictionary_candidates_file = base_dir / "non_dictionary_candidates.txt"
    output_file = base_dir / "accepted_words.txt"
    
    print("Reading saved_words_2025-07-20.txt...")
    saved_words = read_saved_words(saved_words_file)
    print(f"Found {len(saved_words)} words in saved_words file")
    
    print("Reading words_with_definitions.txt...")
    words_with_defs = read_words_with_definitions(words_with_definitions_file)
    print(f"Found {len(words_with_defs)} words with definitions")
    
    print("Reading non_dictionary_candidates.txt...")
    non_dict_candidates = read_non_dictionary_candidates(non_dictionary_candidates_file)
    print(f"Found {len(non_dict_candidates)} non-dictionary candidates")
    
    # Combine all words
    all_words = set()
    all_words.update(saved_words)
    all_words.update(words_with_defs.keys())
    all_words.update(non_dict_candidates.keys())
    
    print(f"Total unique words: {len(all_words)}")
    
    # Create combined dictionary with definitions
    combined_words = {}
    for word in all_words:
        # Check if word has definition in words_with_definitions
        if word in words_with_defs:
            combined_words[word] = words_with_defs[word]
        # Check if word has definition in non_dictionary_candidates
        elif word in non_dict_candidates:
            combined_words[word] = non_dict_candidates[word]
        # Word has no definition
        else:
            combined_words[word] = ""
    
    # Write to output file
    print(f"Writing {len(combined_words)} words to {output_file}...")
    with open(output_file, 'w', encoding='utf-8') as f:
        for word in sorted(combined_words.keys()):
            definition = combined_words[word]
            if definition:
                f.write(f"{word}|{definition}\n")
            else:
                f.write(f"{word}|\n")
    
    print(f"Successfully created {output_file}")
    
    # Print some statistics
    words_with_defs_count = sum(1 for defn in combined_words.values() if defn)
    words_without_defs_count = len(combined_words) - words_with_defs_count
    
    print(f"\nStatistics:")
    print(f"Words with definitions: {words_with_defs_count}")
    print(f"Words without definitions: {words_without_defs_count}")
    print(f"Total words: {len(combined_words)}")

if __name__ == "__main__":
    combine_word_lists() 