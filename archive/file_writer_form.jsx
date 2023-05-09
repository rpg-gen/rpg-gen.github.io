import capitalize_each_word from "../utility/capitalize_each_word";
import { get_all_documents } from "../utility/firebase.jsx";

export default function FileWriterForm ({ collection_name, download_format="json" }) {

    async function handle_download(event) {
        event.preventDefault();
        const all_docs = await get_all_documents(collection_name);

        let all_data_objs = {};
        let all_data_string = "";

        all_docs.forEach((doc) => {
            all_data_objs[doc.id] = doc.data();
            all_data_string += doc.data().display_name + "\n";
        });

        const data_json = JSON.stringify(all_data_objs);

        let to_blob_string = data_json;
        let file_suffix = "json";

        if (download_format == "text") {
            to_blob_string = all_data_string;
            file_suffix = "txt";
        }

        const the_blob = new Blob([to_blob_string], {type: "text/plain" });

        const the_url = URL.createObjectURL(the_blob);
        const link = document.createElement("a");
        link.download = "rpg_assistant_" + collection_name + "." + file_suffix;
        link.href = the_url;

        link.click();
    }

    return (
        <button type="submit" onClick={handle_download}>Download {capitalize_each_word(collection_name)}</button>
    );
}