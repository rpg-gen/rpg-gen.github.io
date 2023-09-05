import DataContext from "../contexts/data_context.jsx";
import { useContext, useState, createContext } from "react";
import ButtonLink from "../components/button_link.jsx";
import Colors from "../utility/colors.jsx";
import FormItemEdit from "../forms/form_item_edit.jsx";

export default function Items() {

    const default_form_mode = "create";

    const [item_id_to_edit, set_item_id_to_edit] = useState(undefined);
    const [flash_message, set_flash_message] = useState(undefined);
    const [form_mode, set_form_mode] = useState(default_form_mode);

    const data_context = useContext(DataContext);

    const sorted_items = data_context.get_sorted_item_list();

    // console.log(sorted_items)

    const form_props = {
        form_mode: form_mode,
        set_form_mode: set_form_mode,
        item_id_to_edit: item_id_to_edit,
        set_item_id_to_edit: set_item_id_to_edit,
        set_flash_message: set_flash_message
    }

    return (
        <>
            {/* <FormItemEdit form_mode={form_mode} item_id_to_edit={item_id_to_edit} set_item_id_to_edit={set_item_id_to_edit} set_flash_message={set_flash_message}/> */}
            <FormItemEdit {...form_props} />
            <div>&nbsp;</div>
            {flash_message != undefined ? <div>{" "}{flash_message}</div> : <div>&nbsp;</div>}
            <h3>Items</h3>
            {
                sorted_items.map((item, index) => {
                    const item_row_props = {
                        key: item.id,
                        item_data: item,
                        row_num: index + 1,
                        set_item_id_to_edit: set_item_id_to_edit,
                        set_flash_message: set_flash_message,
                        form_mode: form_mode,
                        set_form_mode: set_form_mode,
                    }
                    return <ItemRow {...item_row_props} />
                })
            }
        </>
    );
}

function ItemRow ({item_data, row_num, set_item_id_to_edit, set_flash_message, form_mode, set_form_mode}) {

    const row_style = {
        display: "flex",
        backgroundColor: (row_num % 2 == 1 ? Colors.disabled_grey : Colors.white),
        justifyContent: "space-between",
        maxWidth: "20rem"
    }

    function setup_edit(event) {
        event.preventDefault();
        set_item_id_to_edit(event.target.value);
        set_flash_message(undefined);
        set_form_mode("edit");
    }

    function setup_view(event) {
        event.preventDefault();
        set_item_id_to_edit(event.target.value);
        set_flash_message(undefined);
        set_form_mode("view");
    }

    return (<>
        <div style={row_style} key={item_data.id}>
            <div>{item_data.display_name}</div>
            <div>
                {
                    form_mode == "edit" ? "" : 
                    <>
                        <button value={item_data.id} onClick={setup_view}>view</button>{" "}
                        <button value={item_data.id} onClick={setup_edit}>edit</button>
                    </>
                }
            </div>
        </div>
    </>);
}