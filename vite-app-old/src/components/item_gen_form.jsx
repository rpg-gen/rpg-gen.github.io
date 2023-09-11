import { useState, useContext } from "react";
import GlobalContext from "../contexts/global_context.jsx";
import ajax_loader from "../../assets/ajax_loader.gif";
import { get_random_int, get_random_array_element, get_array_between } from "../routes/generator.jsx";
import capitalize_each_word from "../utility/capitalize_each_word.js";
import download_object_to_json_file from "../utility/download_object_to_json_file.jsx";
import item_file from "../official_data/items.json";
import attribute_file from "../official_data/attributes.json";
import power_file from "../official_data/powers.json";
import build_array_repeat from "../utility/build_array_repeat.jsx";
import colors from "../utility/colors.jsx";

const item_output_style = {
    width: "20em"
}

export default function ItemGenForm () {
    const global_context = useContext(GlobalContext);
    const [item_output, set_item_output] = useState("");
    const [power_output, set_power_output] = useState("");
    const [is_loading_item, set_is_loading_item] = useState(false);

    const generate_modes = [
        {key: "weighted", value: "Weighted Random"},
        {key: "full_random", value: "Full Random"},
        {key: "specific", value: "Specific Structure"},
    ];

    const introduction_options = [
        {key: "The", value: "The"},
        {key: "A", value: "A/An"}
    ];

    const weight_options = get_array_between(0,100).map((num) => ({key: num, value: num}));

    const [generate_mode, set_generate_mode] = useState(generate_modes[0].key);

    const [no_attribute_weight, set_no_attribute_weight] = useState(1);
    const [one_attribute_weight, set_one_attribute_weight] = useState(10);
    const [two_attribute_weight, set_two_attribute_weight] = useState(2);
    const [three_attribute_weight, set_three_attribute_weight] = useState(1);

    const [introduction, set_introduction] = useState(introduction_options[0].key);
    const [is_force_prefix, set_is_force_prefix] = useState(false);
    const [is_force_suffix, set_is_force_suffix] = useState(false);
    const [is_force_suffix_prefix, set_is_force_suffix_prefix] = useState(false);
    const [is_force_power, set_is_force_power] = useState(false);

    const [power_chance, set_power_chance] = useState(10);

    function handle_mode_change(event) {
        const new_mode = event.target.value;

        set_generate_mode(new_mode);

        if (new_mode == "full_random") {
            set_no_attribute_weight(1);
            set_one_attribute_weight(1);
            set_two_attribute_weight(1);
            set_three_attribute_weight(1);
            set_power_chance(50);
        }
        if (new_mode == "weighted") {
            set_no_attribute_weight(1);
            set_one_attribute_weight(10);
            set_two_attribute_weight(2);
            set_three_attribute_weight(1);
            set_power_chance(10);
        }
    }

    function handle_force_suffix_change(event) {
        const new_value = event.target.checked;
        if (new_value == false && is_force_suffix_prefix == true) {
            set_is_force_suffix_prefix(false);
        }
        set_is_force_suffix(new_value);
    }

    function handle_force_suffix_prefix_change(event) {
        const new_value = event.target.checked;
        if (new_value == true && is_force_suffix == false) {
            set_is_force_suffix(true);
        }
        set_is_force_suffix_prefix(new_value);
    }

    async function handle_gen_item_click(event) {
        event.preventDefault();
        set_is_loading_item(true);

        const item_obj = item_file;
        const picked_item = {
            ...get_random_array_element(item_obj)[1],
            introduction: "",
            prefix: "",
            suffix_prefix: "",
            suffix: "",
            power: "",
        };

        let num_attributes = 0;
        let is_power = false;

        // =====================================================================
        // Generate the item based on weighted values
        // =====================================================================
        if (generate_mode == "weighted" || generate_mode == "full_random") {
            const num_attributes_weighted_array = [
                ...build_array_repeat(no_attribute_weight, 0),
                ...build_array_repeat(one_attribute_weight, 1),
                ...build_array_repeat(two_attribute_weight, 2),
                ...build_array_repeat(three_attribute_weight, 3),
            ]

            num_attributes = get_random_array_element(num_attributes_weighted_array)[1];

            // (num_attributes_weighted_array)

            is_power = get_random_array_element([
                ...Array(power_chance).fill(true),
                ...Array(100-power_chance).fill(false)
            ])[1];

            picked_item.introduction = "The";

            if (num_attributes == 0) {
                picked_item.introduction = "A";
            }

            // 50/50 chance of a single attribute item of having "the" or "a"
            if (num_attributes == 1 && get_weighted_is_true(1) == true) {
                picked_item.introduction = "A";
            }
        }
        else if (generate_mode == "specific") {

            picked_item.introduction = introduction;

            num_attributes = 3;

            if (!is_force_prefix) {
                picked_item.prefix = undefined;
                num_attributes = num_attributes - 1;
            }
            if (!is_force_suffix) {
                picked_item.suffix = undefined;
                num_attributes = num_attributes - 1;
            }
            if (!is_force_suffix_prefix) {
                picked_item.suffix_prefix = undefined;
                num_attributes = num_attributes - 1;
            }
            if (is_force_power) {
                // picked_item.power = undefined;
                is_power = true;
            }
        }
        else {
            global_context.set_banner_style("failure");
            global_context.replace_banner("This generating mode is not supported.")
        }

        const picked_attributes = [];

        const restructured_attribute_file = attribute_file.map((group) => {
            const return_array = [];
            group.prefixes.forEach((attribute) => return_array.push({type: "prefix", value: attribute}))
            group.suffixes.forEach((attribute) => return_array.push({type: "suffix", value: attribute}))
            return return_array;
        });

        // download_object_to_json_file(restructured_attribute_file, "test.json");

        for (let i = 0; i < num_attributes; i++) {
            // Filter to just the attribute groups that have values the item doesn't have yet
            const filtered_attribute_file = restructured_attribute_file.filter((row) => {
                let is_valid_row = false;

                row.forEach((attribute_form) => {
                    if (picked_item.prefix != undefined && picked_item.prefix == "" && attribute_form.type == "prefix") {
                        is_valid_row = true;
                    }
                    if (picked_item.suffix != undefined && picked_item.suffix == "" && attribute_form.type == "suffix") {
                        is_valid_row = true;
                    }
                    if (picked_item.suffix_prefix != undefined && picked_item.suffix_prefix == "" && picked_item.suffix != undefined && picked_item.suffix != "" && attribute_form.type == "prefix") {
                        is_valid_row = true;
                    }
                });

                return is_valid_row;
            });
            const [picked_attribute_index, picked_attribute_group] = get_random_array_element(filtered_attribute_file, picked_attributes.map((item) => item[0]));

            // Keep track of picked attributes so we don't repick them again
            picked_attributes.push([picked_attribute_index, picked_attribute_group]);

            // Randomly pick one of the attribute forms that's compatible with the remaining empty item slots
            const filtered_attribute_group = picked_attribute_group.filter((attribute_form) => {
                let is_valid_attribute = false;

                if (attribute_form.type == "prefix") {
                    if (picked_item.prefix != undefined && picked_item.prefix == "") {
                        is_valid_attribute = true;
                    }
                    else if (picked_item.suffix_prefix != undefined && picked_item.suffix_prefix == "" && picked_item.suffix != undefined && picked_item.suffix != "") {
                        is_valid_attribute = true;
                    }
                }
                else if (picked_item.suffix != undefined && attribute_form.type == "suffix" && picked_item.suffix == "") {
                    is_valid_attribute = true;
                }

                return is_valid_attribute;
            });

            const picked_attribute_form = get_random_array_element(filtered_attribute_group)[1];

            if (picked_attribute_form.type == "prefix") {
                // If both the prefix and the suffix-prefix are available, do a 50/50 chance of either
                if (picked_item.prefix == "" && picked_item.suffix != undefined && picked_item.suffix != "" && picked_item.suffix_prefix == "") {
                    if (get_weighted_is_true(1)) {
                        picked_item.prefix = picked_attribute_form.value;
                    }
                    else {
                        picked_item.suffix_prefix = picked_attribute_form.value;
                    }
                }
                // Otherwise go with whichever is available
                else if (picked_item.prefix == "") {
                    picked_item.prefix = picked_attribute_form.value;
                }
                else if (picked_item.suffix_prefix == "") {
                    picked_item.suffix_prefix = picked_attribute_form.value;
                }
            }
            else if (picked_attribute_form.type == "suffix") {
                picked_item.suffix = picked_attribute_form.value;
            }
        }

        set_item_output(build_name_string_from_obj(picked_item));

        if (is_power) {
            const picked_power = get_random_array_element(power_file)[1];
            set_power_output(picked_power.value);
        }
        else {
            set_power_output("");
        }

        set_is_loading_item(false);
    }

    const form_title_style = {
        fontWeight: "bold",
        fontSize: "1.25em"
    }

    let item_output_style = {
        padding: ".5em",
        backgroundColor: colors.banner_grey,
        display: "inline-block"
    }

    return (
        <form>
            <div className="gapdiv" style={form_title_style}>Generate an Item</div>
            <div className="gapdiv">
                <label htmlFor="generation_mode">Generation Method:</label>{" "}
                <select value={generate_mode} onChange={handle_mode_change} id="generation_mode">
                    {generate_modes.map((mode) => <option key={mode.key} value={mode.key}>{mode.value}</option>)}
                </select>
            </div>
            {
                ["weighted", "full_random"].includes(generate_mode) && <>
                    <div className="gapdiv">Attribute Count Weights</div>
                    <div style={{paddingLeft: "2em"}}>
                        <GenSelect label="No Attributes" id_name="no_attribute_weight" start_val={no_attribute_weight} set_val={set_no_attribute_weight} option_array={weight_options} />
                        <GenSelect label="One Attribute" id_name="one_attribute_weight" start_val={one_attribute_weight} set_val={set_one_attribute_weight} option_array={weight_options} />
                        <GenSelect label="Two Attributes" id_name="two_attribute_weight" start_val={two_attribute_weight} set_val={set_two_attribute_weight} option_array={weight_options} />
                        <GenSelect label="Three Attributes" id_name="three_attribute_weight" start_val={three_attribute_weight} set_val={set_three_attribute_weight} option_array={weight_options} />
                    </div>
                    <div className="gapdiv">Percent Chances</div>
                    <div style={{paddingLeft: "2em"}}>
                        <GenSelect label="Power/Limitation" id_name="power_chance" start_val={power_chance} set_val={set_power_chance} option_array={weight_options} note="%"/>
                    </div>
                </>
            }
            {
                generate_mode == "specific" && <>
                    <div className="gapdiv">Pick Item Name Structure</div>
                    <div className="gapdiv">&lt;introduction&gt; &lt;prefix&gt; &lt;item&gt; of &lt;suffix_prefix&gt; &lt;suffix&gt;</div>
                    {/* <div className="gapdiv"><label>Introduction:{" "}</label><input type="checkbox" checked={is_force_prefix} onChange={(event) => set_is_force_prefix(event.target.value)} /></div> */}
                    <GenSelect label="Introduction" id_name="item_introduction" start_val={introduction} set_val={set_introduction} option_array={introduction_options} />
                    <div className="gapdiv"><label>Prefix:{" "}</label><input type="checkbox" checked={is_force_prefix} onChange={(event) => set_is_force_prefix(event.target.checked)} /></div>
                    <div className="gapdiv"><label>Suffix Prefix:{" "}</label><input type="checkbox" checked={is_force_suffix_prefix} onChange={handle_force_suffix_prefix_change} /></div>
                    <div className="gapdiv">
                        <label>Suffix:{" "}</label>
                        <input type="checkbox" checked={is_force_suffix} onChange={handle_force_suffix_change} />
                    </div>
                    <div className="gapdiv"><label>Power:{" "}</label><input type="checkbox" checked={is_force_power} onChange={(event) => set_is_force_power(event.target.checked)} /></div>
                </>
            }
            <div className="gapdiv"><button type="submit" onClick={handle_gen_item_click}>Generate</button></div>
            {
                is_loading_item
                ? <img height="25rem" width="25rem" src={ajax_loader} />
                : item_output != "" && <>
                    {/* <div className="gapdiv">Generated Item:{" "}<input style={item_output_style} type="text" value={item_output} readOnly></input></div> */}
                    <div className="gapdiv" style={item_output_style}>{item_output}</div>
                    <br />
                    {
                        power_output != "" &&
                        <div className="gapdiv" style={item_output_style}>Power/Limitation: {capitalize_each_word(power_output)}</div>
                    }
                </>
            }
        </form>
    );
}

function build_name_string_from_obj(picked_item_obj) {

    const is_prefix = (picked_item_obj.prefix != undefined && picked_item_obj.prefix != "" ? true : false);
    const is_suffix_prefix = (picked_item_obj.suffix_prefix != undefined && picked_item_obj.suffix_prefix != "" ? true : false);
    const is_suffix = (picked_item_obj.suffix != undefined && picked_item_obj.suffix != "" ? true : false);
    const is_suffix_has_the = (is_suffix && picked_item_obj.suffix.slice(0,4).toLowerCase() == "the ");
    // const is_item_an = (["a","e","i","o","u"].includes(picked_item_obj.item_name[0].toLowerCase()));

    // Injext the plurality_adapter value that makes the item work better with a singular prefix
    if (picked_item_obj.plurality_adapter != undefined && picked_item_obj.introduction == "A") {
        picked_item_obj.introduction = get_a_an(picked_item_obj.plurality_adapter) + " " + picked_item_obj.plurality_adapter;
    }

    if (picked_item_obj.introduction == "A") {
        picked_item_obj.introduction = get_a_an((is_prefix ? picked_item_obj.prefix : picked_item_obj.item_name));
    }

    let item_string = picked_item_obj.introduction;

    if (is_prefix) {
        item_string += " " + picked_item_obj.prefix
    }

    item_string += " " + picked_item_obj.item_name;

    if (is_suffix) {

        item_string += " of";

        if (is_suffix_has_the) {
            item_string += " the";
        }

        if (is_suffix_prefix) {
            item_string += " " + picked_item_obj.suffix_prefix;
        }

        item_string += " " + (is_suffix_has_the ? picked_item_obj.suffix.slice(4,picked_item_obj.suffix.length) : picked_item_obj.suffix);

    }

    // const prefix_string = picked_item_obj.prefix != undefined && picked_item_obj.prefix != "" ? capitalize_each_word(picked_item_obj.prefix) + " ": "";
    // const suffix_prefix_string = picked_item_obj.suffix_prefix != undefined && picked_item_obj.suffix_prefix != "" ? capitalize_each_word(picked_item_obj.suffix_prefix) + " ": "";
    // const suffix_string = picked_item_obj.suffix != undefined && picked_item_obj.suffix != "" ? " of " + suffix_prefix_string + capitalize_each_word(picked_item_obj.suffix): "";
    // const introduction = (picked_item_obj.prefix == "" && picked_item_obj.suffix == "" ? "" : "The ");

    return capitalize_each_word(item_string);
}

function get_a_an(following_word) {
    if (["a","e","i","o","u"].includes(following_word[0].toLowerCase())) {
        return "An";
    }
    else {
        return "A"
    }
}


function GenSelect ({ label, id_name, start_val, set_val, option_array, note="" }) {
    return (
        <div className="gapdiv">
            <label htmlFor={id_name}>{label}:{" "}</label>
            <select value={start_val} onChange={(event) => set_val(event.target.value)} id={id_name}>
                {option_array.map((option) => <option key={option.key} value={option.key}>{option.value}</option>)}
            </select>{" "}{note}
        </div>
    );
}

function clean_and_split_attribute_row(attribute_row) {
    return attribute_row.split(",").map((element) => {
        return element.replace("\r","");
    });
}

function get_attribute_obj_from_line(line) {
    const attribute_row = line.split(",").map((element) => element.replace("\r", ""));
    return {
        rarity: attribute_row[0],
        prefix_1: attribute_row[1],
        prefix_2: attribute_row[2],
        suffix_1: attribute_row[3],
        suffix_2: attribute_row[4],
    };
}

function get_column_of_array_list(the_array_list, column_index) {
    const single_column_array = the_array_list.map((row) => {
        return (row.split(",")[column_index] || "").replace("\r", "");
    });
    return single_column_array.filter((value) => ![null, undefined, "", "\r"].includes(value));
}

function create_array_from_file (raw_string_import) {
    // const file_request = await fetch(path);
    // const file_string = await file_request.text();
    const line_array = raw_string_import.split("\n");
    line_array.shift();
    return line_array;
}

function get_weighted_is_true(n_to_1_false) {
    const weighted_binary_array = [
        ...Array(9).fill(false),
        true
    ];

    return weighted_binary_array[get_random_int(0,weighted_binary_array.length-1)]
}

function get_random_attribute_form(attribute_row, is_exclude_prefix=false, is_exclude_suffix=false) {

    // =====================================================================
    // Pick a random form of the picked attribute
    // =====================================================================

    const attribute = {
        rarity: attribute_row[0].replace("\r", ""),
        prefix_1: attribute_row[1].replace("\r", ""),
        prefix_2: attribute_row[2].replace("\r", ""),
        suffix_1: attribute_row[3].replace("\r", ""),
        suffix_2: attribute_row[4].replace("\r", ""),
    };

    const attribute_forms = []

    if (!is_exclude_prefix) {
        if (attribute.prefix_1 != "") {
            attribute_forms.push({type: "prefix", value: attribute.prefix_1});
        }

        if (attribute.prefix_2 != "") {
            attribute_forms.push({type: "prefix", value: attribute.prefix_2});
        }
    }

    if (!is_exclude_suffix) {
        if (attribute.suffix_1 != "") {
            attribute_forms.push({type: "suffix", value: attribute.suffix_1});
        }

        if (attribute.suffix_2 != "") {
            attribute_forms.push({type: "suffix", value: attribute.suffix_2});
        }
    }

    return get_random_array_element(attribute_forms)[1];
}