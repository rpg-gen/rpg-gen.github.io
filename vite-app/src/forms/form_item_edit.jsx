import { useState, useContext, useEffect } from "react";
import DataContext from "../contexts/data_context.jsx";
import useControlledField from "../hooks/use_controlled_field.jsx"
import TextInput from "../components/text_input.jsx";
import TextAreaInput from "../components/text_area_input.jsx";
import configs from "../utility/configs.jsx";

export default function FormItemEdit({form_mode, set_form_mode, item_id_to_edit, set_item_id_to_edit, set_flash_message}) {

    const data_context = useContext(DataContext);

    let default_display_name = "";
    let default_description = "";
    // let default_form_title = "Create New Item";
    // let default_submit_text = "Create";

    // const [form_mode, set_form_mode] = useState(default_form_mode)

    const [display_name, set_display_name] = useState(default_display_name);
    const [description, set_description] = useState(default_description);
    // const [form_title, set_form_title] = useState(default_form_title);
    // const [submit_text, set_submit_text] = useState(default_submit_text);

    useEffect(() => {
        const item_to_edit = data_context.items[item_id_to_edit]

        if (item_to_edit != undefined){
            set_display_name(item_to_edit.display_name);
            set_description(item_to_edit.description);
        }
        else {
            set_display_name(default_display_name);
            set_description(default_description);
        }

    },[item_id_to_edit])

    function handle_submit (event) {
        event.preventDefault();

        const submitted_item_id = item_id_to_edit || display_name.toLowerCase().replaceAll(" ", "_");
        const existing_item = (data_context.items[submitted_item_id]);

        if (item_id_to_edit == undefined && existing_item != undefined) {
            set_flash_message("Item already exists, under the name \"" + existing_item.display_name + "\" with key \"" + submitted_item_id + "\". Delete that one in order to free up the display name (which is used to generate the database key");
            return;
        }

        data_context.save_document_data(
            configs.item_collection_name, 
            submitted_item_id, 
            {
                "display_name": display_name,
                "description": description
            }
        );

        if (item_id_to_edit != undefined) {
            set_flash_message("Item Edited!");
        }
        else {
            set_flash_message("Item Created!");
            set_item_id_to_edit(submitted_item_id);
        }

        set_form_mode("view");
    }

    function back_to_create (event) {
        event.preventDefault();
        set_form_mode("create");
        set_flash_message(undefined);
        set_item_id_to_edit(undefined);
    }

    function delete_item (event) {
        event.preventDefault();
        data_context.delete_document(configs.item_collection_name, event_target_value);
        set_flash_message("Item Deleted");
        set_item_id_to_edit(undefined);
    }

    function enter_edit (event) {
        event.preventDefault();
        set_item_id_to_edit(event.target.value);
        set_flash_message(undefined);
        set_form_mode("edit");
    }

    return (
        <form onSubmit={handle_submit}>
            <h3>{form_mode == "create" ? "Create Item" : (form_mode == "edit" ? "Edit Item" : "Item Details")}</h3>
            <TextInput id="item_display_name" label="Display Name" value={display_name} on_change={set_display_name} read_only={form_mode == "view" ? "readonly" : ""} />
            <TextAreaInput id="item_display_name" label="Description" value={description} on_change={set_description} read_only={form_mode == "view" ? "readonly" : ""} />
            {form_mode != "view" ? <button type='submit'>{(form_mode == "create" ? "Create" : "Save")}</button> : <button value={item_id_to_edit} onClick={enter_edit}>Edit</button>}
            {form_mode == "edit" && <>{" "}<button value={item_id_to_edit} onClick={delete_item}>Delete</button></>}
            {(form_mode == "edit" || form_mode == "view") && <>{" "}<button onClick={back_to_create}>Back to Create New</button></>}
        </form>
    );
}