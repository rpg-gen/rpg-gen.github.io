import { useState, useContext } from "react";
import GlobalContext from "../contexts/global_context.jsx";
import DataContext from "../contexts/data_context.jsx";

export default function DataManager() {

    const global_context = useContext(GlobalContext);
    const data_context = useContext(DataContext);


    function handle_download_click(event) {
        event.preventDefault();

        const download_iterable = Object.entries(data_context);

        download_object_as_json_file(data_context.characters, "rpg_assistant_characters_backup.json");
        download_object_as_json_file(data_context.items, "rpg_assistant_items_backup.json");
        download_object_as_json_file(data_context.data_reload_ping, "rpg_assistant_data_reload_ping_backup.json");
    }

    return (
        <>
            <p>Download collections as JSON files. Useful for backups</p>
            <div>
                <button onClick={handle_download_click}>Download</button>
            </div>

        </>
    )
}

function download_object_as_json_file(json_object, file_name) {
    const to_blob_string = JSON.stringify(json_object, null, 2);
    const the_blob = new Blob([to_blob_string], {type: "text/plain"});
    const the_url = URL.createObjectURL(the_blob);
    const the_link = document.createElement("a");
    the_link.download = file_name;
    the_link.href = the_url;
    the_link.click();
}