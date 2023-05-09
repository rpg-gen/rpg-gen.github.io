import json

# Load the input JSON from a file
with open('C:\\repos\\onewhit.github.io\\vite-app\\src\\official_data\\attributes.json') as f:
    old_json = json.load(f)

new_json = {}

# Loop through each item in the old JSON
for item in old_json:
    prefixes = item.get('prefixes', [])
    suffixes = item.get('suffixes', [])

    # Loop through each prefix and add it to the new JSON
    for prefix in prefixes:
        if prefix not in new_json:
            new_json[prefix] = {"tags": []}
        new_json[prefix]["tags"].append("prefix")

    # Loop through each suffix and add it to the new JSON
    for suffix in suffixes:
        if suffix not in new_json:
            new_json[suffix] = {"tags": []}
        new_json[suffix]["tags"].append("suffix")

# Write the new JSON to a file named output.json
with open('C:\\repos\\onewhit.github.io\\vite-app\\src\\official_data\\attributes_generated.json', 'w') as f:
    f.write("{\n")

    rows_enumerated = enumerate(list(new_json.keys()))

    for index, key in rows_enumerated:
        
        row_to_write = '    "' + key + '": ' + json.dumps(new_json[key])

        if (index + 1) != len(new_json.keys()):
            row_to_write += ','

        row_to_write += "\n"

        f.write(row_to_write)

    f.write("}")

# Print the new JSON to the console
# print('{')
# for key in new_json.keys():
#     print('    "' + key + '": ' + json.dumps(new_json[key]) + ',')
# print('}')