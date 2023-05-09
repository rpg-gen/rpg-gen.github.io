export default function deep_object_copy(original_object) {
    if (original_object == undefined) {
        return original_object
    }
    return JSON.parse(JSON.stringify(original_object));
}