import React, { useState, useContext } from 'react';
import { clear_collection, create_document, get_is_collection_exists } from "../utility/firebase.jsx";
import GlobalContext from "../contexts/global_context.jsx";
import capitalize_each_word from "../utility/capitalize_each_word.js";

const FileReaderForm = () => {
    const [file, set_file] = useState(null);
    const global_context = useContext(GlobalContext);

    const file_format_options = [
        {id: "text", display_name: "Text"},
        {id: "json", display_name: "Json"}
    ];

    const merge_options = [
        {id: "merge", display_name: "Merge to Existing"},
        {id: "drop", display_name: "Drop and Recreate"}
    ]

    const collection_options = [
        {id: "item", display_name: "Items"},
        {id: "attribute", display_name: "Attributes"}
    ]

    const [file_format, set_file_format] = useState(file_format_options[0].id);
    const [merge_type, set_merge_type] = useState(merge_options[0].id);
    const [collection_name, set_collection_name] = useState(collection_options[0].id);

    const handle_file_change = (event) => {set_file(event.target.files[0]);};

    const handle_submit = async (event) => {
        event.preventDefault();

        if (merge_type != "merge") {
            const confirm_message = "This will remove all documents from the " + collection_name + " collection, and replace them with the lines in the specified file. Do you want to proceed?";
            const is_proceed = confirm(confirm_message);
            if (!is_proceed) {
                global_context.replace_banner("Cancelled collection overwrite.");
                return;
            }

            await clear_collection(collection_name, global_context.append_indent_banner);
            global_context.append_indent_banner("Done deleting existing documents.");
        }

        global_context.replace_banner("Starting collection update...");

        const fileReader = new FileReader();

        fileReader.onload = (event) => {
            const file_content = event.target.result;

            if (file_format == "text") {
                create_documents_from_lines(file_content);
            }
            else if (file_format == "json") {
               create_documents_from_json(file_content)
            }
            global_context.append_inline_banner("Success.");
        }

        fileReader.readAsText(file);
    };

    function create_documents_from_lines(file_content) {

        const lines = file_content.split('\n');

        // De-duplicate the lines and make them all lowercase, and trim leading and trailing whitespace and newlines
        const deduped_lines = [...new Set(lines.map((string) => string.toLowerCase().replace(/^\s+|\s+$/g, '')))]

        deduped_lines.forEach((line) => {

            if (line == undefined || line == null || line == "") {
                return;
            }

            const document_key = line.replaceAll(" ", "_");
            const document_display_name = capitalize_each_word(line);
            // global_context.append_indent_banner("Creating document \"" + document_display_name + "\"");
            create_document(collection_name, document_key, {
                display_name: document_display_name
            });
        });
    }

    function create_documents_from_json(file_json) {
        const doc_objs = JSON.parse(file_json);
        Object.entries(doc_objs).forEach((entry) => {
            // global_context.append_indent_banner("Creating document \"" + entry[1].display_name + "\"");
            return create_document(collection_name, entry[0], entry[1])
        });
    }

    const form_style = {
        paddingBottom: "2em"
    }

    return (<>
        <form style={form_style} onSubmit={handle_submit}>
            <div className="gapdiv">
                <label>Collection to Update: </label>
                <select value={collection_name} onChange={(event) => set_collection_name(event.target.value)}>
                    {collection_options.map((item) => <option key={item.id} value={item.id}>{item.display_name}</option>)}
                </select>
            </div>
            <div className="gapdiv">
                <label>File: </label>
                <input id="id_file_upload" type="file" onChange={handle_file_change} required />
            </div>
            <div className="gapdiv">
                <label>File Format: </label>
                <select value={file_format} onChange={(event) => set_file_format(event.target.value)}>
                    {file_format_options.map((item) => <option key={item.id} value={item.id}>{item.display_name}</option>)}
                </select>
            </div>
            <div className="gapdiv">
                <label>Merge Type: </label>
                <select value={merge_type} onChange={(event) => set_merge_type(event.target.value)}>
                    {merge_options.map((item) => <option key={item.id} value={item.id}>{item.display_name}</option>)}
                </select>
            </div>
            <button type="submit">Upload</button>
        </form>
    </>);
};

export default FileReaderForm;