export default function build_array_repeat(array_length, value) {
    const return_array = [];

    for (let i = 0; i < array_length; i++) {
        return_array.push(value);
    }

    return return_array;
}