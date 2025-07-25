#!/usr/bin/env python3
"""
Script to create locations_sensory.json from locations.json
Extracts name and category fields, adds blank sensory_immersion field
"""

import json
import os

def create_locations_sensory():
    # Path to the input and output files
    input_file = "word_lists/locations.json"
    output_file = "word_lists/locations_sensory.json"
    
    # Check if input file exists
    if not os.path.exists(input_file):
        print(f"Error: Input file '{input_file}' not found!")
        return
    
    try:
        # Read the original locations.json file
        with open(input_file, 'r', encoding='utf-8') as f:
            locations_data = json.load(f)
        
        # Create new data structure with required fields
        sensory_data = []
        
        for location in locations_data:
            sensory_location = {
                "name": location.get("name", ""),
                "category": location.get("category", ""),
                "sensory_immersion": ""
            }
            sensory_data.append(sensory_location)
        
        # Write the new file
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(sensory_data, f, indent=2, ensure_ascii=False)
        
        print(f"Successfully created '{output_file}' with {len(sensory_data)} locations")
        print(f"Each location has: name, category, and blank sensory_immersion fields")
        
    except json.JSONDecodeError as e:
        print(f"Error reading JSON file: {e}")
    except Exception as e:
        print(f"Unexpected error: {e}")

if __name__ == "__main__":
    create_locations_sensory() 