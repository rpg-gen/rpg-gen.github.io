import { useContext, useState } from "react";

import DataContext from "../contexts/data_context";

export default function Abilities () {

    const [ability_name_search_value, set_ability_name_search_value] = useState("");

    return <div>
        <AbilitySearchForm ability_name_search_value={ability_name_search_value} set_ability_name_search_value={set_ability_name_search_value} />
        <AbilityList ability_name_search_value={ability_name_search_value} />
    </div>
}

function AbilityList({ability_name_search_value}) {
    const data_context = useContext(DataContext);
    const sorted_abilities = data_context.get_sorted_abilities();

    const filtered_abilities = sorted_abilities.filter(ability => {
        const search_for_value = ability_name_search_value.toLowerCase();
        const compare_against_value = ability.ability_name.toLowerCase();

        return (ability_name_search_value == "" || compare_against_value.includes(search_for_value))
    })

    return <div>
        {
            filtered_abilities.map((ability) => (<AbilitySection key={ability.ability_key} ability_data={ability} />))
        }
    </div>

}

function AbilitySection({ability_data}) {
    return <div>
        <h2>{ability_data.ability_name}</h2>
        <p>Class: {ability_data.class}</p>
        <p>Class Tree: {ability_data.tree}</p>
        <p>Tree Level: {ability_data.tree_level}</p>
        <p>Action Point Cost: {ability_data.action_point_cost}</p>
        <p>{ability_data.description}</p>
    </div>
}

function AbilitySearchForm({ability_name_search_value, set_ability_name_search_value}) {
    function on_change_search_value(event) {
        event.preventDefault();
        set_ability_name_search_value(event.target.value);
    }

    function on_click_clear_button (event) {
        event.preventDefault();
        set_ability_name_search_value("");
    }

    return <div>
        <form>
            <div style={{display: "inline-block", marginRight: "5px"}}>
                <label htmlFor="search_value"><span style={{marginRight: "5px"}}>Search Ability Name:</span></label>
                <input id="search_value" value={ability_name_search_value} onChange={on_change_search_value} />
            </div>
            <div style={{display: "inline-block"}}>
                <button onClick={on_click_clear_button}>clear</button>
            </div>
        </form>
    </div>
}