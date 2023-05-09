// const attributes_array = create_array_from_file(attribute_file_string);

// const attribute_obj_array = [];

// attributes_array.forEach((element) => {
//     const attribute_object = get_attribute_obj_from_line(element);

//     const new_attribute_object = {
//         prefixes: [],
//         suffixes: [],
//     }

//     if (attribute_object.prefix_1 != "") {
//         new_attribute_object.prefixes.push(attribute_object.prefix_1);
//     }

//     if (attribute_object.prefix_2 != "") {
//         new_attribute_object.prefixes.push(attribute_object.prefix_2);
//     }

//     if (attribute_object.suffix_1 != "") {
//         new_attribute_object.suffixes.push(attribute_object.suffix_1);
//     }

//     if (attribute_object.suffix_2 != "") {
//         new_attribute_object.suffixes.push(attribute_object.suffix_2);
//     }


//     attribute_obj_array.push(new_attribute_object);
// });

// download_object_to_json_file(attribute_obj_array, "json_file.json");