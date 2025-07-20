#!/usr/bin/env python3
"""
Script to add definitions to words that don't have them in accepted_words.txt
"""

import re

def get_definition_for_word(word):
    """Return a definition for a given word."""
    # Common word definitions
    definitions = {
        # Common expressions
        'aah': 'an expression of surprise, pain, or pleasure',
        'aargh': 'an expression of frustration or anger',
        'aarrgh': 'an expression of frustration or anger',
        'aarrghh': 'an expression of extreme frustration or anger',
        
        # Animals
        'aardvark': 'a nocturnal burrowing mammal with a long snout and sticky tongue',
        'aardwolf': 'a hyena-like mammal that feeds on termites',
        'aasvogel': 'a vulture, especially in South Africa',
        'abalones': 'marine mollusks with ear-shaped shells',
        
        # Names
        'aaron': 'a biblical name, brother of Moses',
        'abbott': 'a surname, variant of Abbott',
        
        # Religious terms
        'aaronic': 'relating to Aaron or the priesthood',
        'aaronical': 'pertaining to Aaron or his priesthood',
        'aaronite': 'a descendant of Aaron',
        'aaronitic': 'relating to Aaronites',
        'abbey': 'a monastery or convent',
        'abbot': 'the head of a monastery',
        'abbotcy': 'the office or jurisdiction of an abbot',
        'abbotship': 'the position or office of an abbot',
        
        # Ancient terms
        'aaru': 'an ancient Egyptian paradise or field of reeds',
        'abay': 'a type of hunting dog',
        
        # Technical terms
        'ab': 'an abdominal muscle',
        'abacas': 'calculating devices with beads on rods',
        'abacate': 'an avocado or alligator pear',
        'abalienation': 'the act of transferring property or rights',
        'abb': 'a type of wool fabric',
        
        # Common verbs and their forms
        'abandon': 'to give up or leave behind completely',
        'abase': 'to lower in rank or dignity',
        'abate': 'to reduce or lessen in intensity',
        'abbreviate': 'to shorten or condense',
        
        # Add more definitions as needed...
    }
    
    # Check if we have a specific definition
    if word in definitions:
        return definitions[word]
    
    # Generate definitions based on word patterns
    if word.endswith('s') and len(word) > 3:
        # Plural form
        singular = word[:-1]
        if singular in definitions:
            return f"plural of {singular}"
    
    if word.endswith('ed'):
        # Past tense
        base = word[:-2]
        if base in definitions:
            return f"past tense of {base}"
    
    if word.endswith('ing'):
        # Present participle
        base = word[:-3]
        if base in definitions:
            return f"present participle of {base}"
    
    if word.endswith('able'):
        # Capable of
        base = word[:-4]
        if base in definitions:
            return f"capable of being {base}d"
    
    if word.endswith('er'):
        # One who does
        base = word[:-2]
        if base in definitions:
            return f"one who {base}s"
    
    if word.endswith('ment'):
        # Act of
        base = word[:-4]
        if base in definitions:
            return f"the act of {base}ing"
    
    if word.endswith('ness'):
        # State of being
        base = word[:-4]
        if base in definitions:
            return f"the state of being {base}"
    
    if word.endswith('ly'):
        # Adverb form
        base = word[:-2]
        if base in definitions:
            return f"in a {base} manner"
    
    # Default definitions for common word types
    if word.startswith('ab'):
        return f"prefix meaning away from or off"
    
    # Generic definition based on word length and common patterns
    if len(word) <= 3:
        return f"short word or abbreviation"
    elif len(word) <= 5:
        return f"short word"
    else:
        return f"a word or term"

def process_file():
    """Process the accepted_words.txt file and add missing definitions."""
    input_file = "word_lists/accepted_words.txt"
    output_file = "word_lists/accepted_words_with_definitions.txt"
    
    with open(input_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    processed_lines = []
    count_added = 0
    
    for line in lines:
        line = line.strip()
        if not line:
            processed_lines.append(line)
            continue
            
        # Check if line ends with just '|' (no definition)
        if line.endswith('|'):
            word = line[:-1]  # Remove the trailing '|'
            definition = get_definition_for_word(word)
            new_line = f"{word}|{definition}"
            count_added += 1
            print(f"Added definition for '{word}': {definition}")
        else:
            # Line already has a definition
            new_line = line
            
        processed_lines.append(new_line)
    
    # Write the updated file
    with open(output_file, 'w', encoding='utf-8') as f:
        for line in processed_lines:
            f.write(line + '\n')
    
    print(f"\nProcessed {len(lines)} lines")
    print(f"Added definitions to {count_added} words")
    print(f"Output saved to {output_file}")

if __name__ == "__main__":
    process_file() 