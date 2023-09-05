import GlobalContext from "../contexts/global_context.jsx";
import { useContext, useState } from "react";
import ItemGenForm from "../components/item_gen_form.jsx";

export default function Generator() {
    // const global_context = useContext(GlobalContext);
    return (<>
        <DieRollerForm />
        <br />
        <CardPickerForm />
        <br />
        <ItemGenForm />
    </>);
}

// =============================================================================
// Die Roller Form
// =============================================================================

function DieRollerForm () {
    const [roll_result, set_roll_result] = useState("");
    const [die_size, set_die_size] = useState(20);

    function handle_roll (event) {
        event.preventDefault();
        const roll_result = get_random_int(1,die_size);
        set_roll_result(roll_result);
    }

    const output_style = {
        width: "2em",
        textAlign: "center",
        // marginLeft: "1em",
    }

    const die_size_options = get_array_between(2, 20);

    return (<>
        <form>
            <label htmlFor="die_size_selector">Die Size:</label>{" "}
            <select id="die_size_selector" name="die_size" value={die_size} onChange={(event) => set_die_size(event.target.value)}>
                {die_size_options.map((num) => <option key={num} value={num}>{num}</option>)}
            </select>
            {" "}
            <button type="submit" onClick={handle_roll}>Roll the Die</button>
            {" "}
            <input type="text" style={output_style} value={roll_result} readOnly></input>

        </form>
    </>);
}

// =============================================================================
// Card Picker Form
// =============================================================================

function CardPickerForm () {

    const [card_result, set_card_result] = useState("");

    function handle_submit (event) {
        event.preventDefault();
        set_card_result(pick_random_card());
    }

    const output_style = {
        textAlign: "center",
        marginLeft: "1em",
        width:  "8em"
    }

    return (
        <form>
            <button type="submit" onClick={handle_submit}>Pick a Card</button>
            <input type="text" style={output_style} value={card_result} readOnly></input>
        </form>
    );
}

function pick_random_card () {
    const suit_options = [
        "Spades",
        "Hearts",
        "Clubs",
        "Diamonds",
    ];

    const value_options = [
        "Ace",
        ...Array.from({length:9},(_, i) => i + 2),
        "Jack",
        "Queen",
        "King",
    ];

    const all_card_options = [];

    suit_options.forEach((suit) => {
        value_options.forEach((value) => {
            all_card_options.push(value + " of " + suit)
        });
    });

    all_card_options.push("Black Joker");
    all_card_options.push("Red Joker");

    return all_card_options[get_random_int(0,all_card_options.length-1)];
}

function get_random_int (min_value, max_value) {
    const spread = max_value - min_value + 1;
    return Math.floor(Math.random() * (max_value-min_value + 1)) + min_value;
}

function get_random_array_element(the_array, indexes_to_exclude=[]) {
    let picked_index = get_random_array_index(the_array);

    while (indexes_to_exclude.includes(picked_index)) {
        picked_index = get_random_array_index(the_array);
    }

    // return {picked_index: picked_index, picked_value: the_array[picked_index]};
    return [picked_index, the_array[picked_index]];
}

function get_random_array_index(the_array) {
    return get_random_int(0,the_array.length-1);
}

function get_array_between(start_int, stop_int) {
    return Array.from({ length: (stop_int - start_int) + 1 }, (_, i) => start_int + i * 1);
}

export { get_random_int, get_random_array_element, get_array_between };