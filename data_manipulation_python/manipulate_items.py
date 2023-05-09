import json

# Load the input JSON from a file
with open('C:\\repos\\onewhit.github.io\\vite-app\\src\\official_data\\items.json') as f:
    old_json = json.load(f)

new_json = {}

for item in old_json:
    item_name = item['item_name']
    item_type = item['item_type']

    # Check if the item has a plurality_adapter attribute and use its value if present
    plurality_adapter = item.get('plurality_adapter')

    # Add the item to the new JSON dictionary
    new_item = {'item_type': item_type}
    if plurality_adapter:
        new_item['plurality_adapter'] = plurality_adapter
    new_json[item_name] = new_item

# Write the new JSON to a file named output.json
with open('C:\\repos\\onewhit.github.io\\vite-app\\src\\official_data\\items_generated.json', 'w') as f:
    json.dump(new_json, f, indent=4)

# Print the new JSON to the console
print(json.dumps(new_json, indent=4))