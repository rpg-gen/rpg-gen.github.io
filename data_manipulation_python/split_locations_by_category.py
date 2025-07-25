#!/usr/bin/env python3
"""
Script to split locations_sensory.json into separate files organized by category
Creates a folder structure with subfolders for each category
"""

import json
import os
from collections import defaultdict

def split_locations_by_category():
    # Path to the input file
    input_file = "word_lists/locations_sensory.json"
    output_dir = "word_lists/locations_by_category"
    
    # Check if input file exists
    if not os.path.exists(input_file):
        print(f"Error: Input file '{input_file}' not found!")
        return
    
    try:
        # Read the locations_sensory.json file
        with open(input_file, 'r', encoding='utf-8') as f:
            locations_data = json.load(f)
        
        # Group locations by category
        categories = defaultdict(list)
        
        for location in locations_data:
            category = location.get("category", "Unknown")
            categories[category].append(location)
        
        # Create output directory if it doesn't exist
        os.makedirs(output_dir, exist_ok=True)
        
        # Create a file for each category
        total_locations = 0
        for category, locations in categories.items():
            # Create a safe filename from the category name
            safe_category_name = category.replace(" ", "_").replace("-", "_").lower()
            category_file = os.path.join(output_dir, f"{safe_category_name}.json")
            
            # Write the category file
            with open(category_file, 'w', encoding='utf-8') as f:
                json.dump(locations, f, indent=2, ensure_ascii=False)
            
            print(f"Created '{category_file}' with {len(locations)} locations")
            total_locations += len(locations)
        
        # Create a summary file with category statistics
        summary_data = {
            "total_locations": total_locations,
            "categories": {}
        }
        
        for category, locations in categories.items():
            summary_data["categories"][category] = {
                "count": len(locations),
                "filename": f"{category.replace(' ', '_').replace('-', '_').lower()}.json"
            }
        
        summary_file = os.path.join(output_dir, "summary.json")
        with open(summary_file, 'w', encoding='utf-8') as f:
            json.dump(summary_data, f, indent=2, ensure_ascii=False)
        
        print(f"\nSummary:")
        print(f"Total locations processed: {total_locations}")
        print(f"Categories found: {len(categories)}")
        print(f"Output directory: '{output_dir}'")
        print(f"Summary file: '{summary_file}'")
        
        # Print category breakdown
        print(f"\nCategory breakdown:")
        for category, info in summary_data["categories"].items():
            print(f"  {category}: {info['count']} locations -> {info['filename']}")
        
    except json.JSONDecodeError as e:
        print(f"Error reading JSON file: {e}")
    except Exception as e:
        print(f"Unexpected error: {e}")

if __name__ == "__main__":
    split_locations_by_category() 