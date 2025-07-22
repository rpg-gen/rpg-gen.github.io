#!/usr/bin/env python3
"""
Script to apply definitions from definitions_to_add.txt to accepted_words_shuffled.txt
"""

def load_definitions():
    """Load definitions from the temporary file."""
    definitions = {}
    try:
        with open('definitions_to_add.txt', 'r', encoding='utf-8') as file:
            for line in file:
                line = line.strip()
                if '|' in line:
                    word, definition = line.split('|', 1)
                    definitions[word] = definition
        print(f"Loaded {len(definitions)} definitions from definitions_to_add.txt")
        return definitions
    except FileNotFoundError:
        print("definitions_to_add.txt not found!")
        return {}
    except Exception as e:
        print(f"Error loading definitions: {e}")
        return {}

def apply_definitions():
    """Apply definitions to the main file."""
    input_file = "vite-app/src/assets/accepted_words_shuffled.txt"
    output_file = "vite-app/src/assets/accepted_words_shuffled_updated.txt"
    
    definitions = load_definitions()
    if not definitions:
        return
    
    updated_count = 0
    
    try:
        with open(input_file, 'r', encoding='utf-8') as infile:
            with open(output_file, 'w', encoding='utf-8') as outfile:
                for line in infile:
                    line = line.strip()
                    if '|a word or term' in line:
                        word = line.split('|')[0]
                        if word in definitions:
                            new_line = f"{word}|{definitions[word]}"
                            outfile.write(new_line + '\n')
                            updated_count += 1
                            print(f"Updated: {word} -> {definitions[word]}")
                        else:
                            outfile.write(line + '\n')
                    else:
                        outfile.write(line + '\n')
        
        print(f"\nUpdated {updated_count} words with definitions.")
        
        # Replace the original file
        import shutil
        shutil.move(output_file, input_file)
        print(f"Replaced original file with updated version.")
        
    except Exception as e:
        print(f"Error processing file: {e}")

if __name__ == "__main__":
    apply_definitions() 