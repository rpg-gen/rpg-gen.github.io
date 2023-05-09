import { useContext } from "react";
import DataContext from "../contexts/data_context.jsx";
import Colors from "../utility/colors.jsx";

export default function CharacterInventory({character_id}) {
    const data_context = useContext(DataContext);
    const this_character = data_context.characters[character_id];
    const items = (this_character && this_character["items"]) || []; // If the character is not NULL, get the items, or default to empty list

    const item_html_rows = items.map((item, index) => {
        function handle_drop_item(event) {
            event.preventDefault();

            const is_confirmed = confirm("Drop the item \"" + item.item_name + "\"");

            if (!is_confirmed) {
                return;
            }

            const item_name_to_drop = item.item_name;
            const item_datetime_to_drop = item.date_added;

            // const item_list_copy = [...data_context.characters[character_id].items];
            const item_list_copy = [...items];

            const filtered_item_list = item_list_copy.filter(({item_name, date_added}, index) => {
                const is_item_to_delete = (item_name == item_name_to_drop && date_added == item_datetime_to_drop);
                return !is_item_to_delete;
            })

            data_context.save_document_data(configs.character_collection_name, character_id, {items: filtered_item_list} )
        }

        const row_style = {
            display: "flex",
            justifyContent: "space-between",
            backgroundColor: Colors.banner_grey,
        }

        if (index % 2 == 1) {
            row_style.backgroundColor = Colors.lighter_grey;
        }

        return <div key={item.date_added || item.item_name} style={row_style}>
            <div style={{flexGrow: 1, flexShrink: 1}}>{index + 1}. {item.item_name}</div>
            <div><button type="button" onClick={handle_drop_item}>Drop</button></div>
        </div>

    })

    return (
        <div>
            {item_html_rows.map(row=>row)}
        </div>
    )
}