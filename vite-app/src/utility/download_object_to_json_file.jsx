export default function download_object_to_json_file(the_object, file_name) {
    const data_json = JSON.stringify(the_object, null, 4);

    const the_blob = new Blob([data_json], {type: "text/plain" });

    const the_url = URL.createObjectURL(the_blob);
    const link = document.createElement("a");
    link.download = file_name;
    link.href = the_url;

    link.click();
}