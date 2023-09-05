import { useState } from "react";

export default function useControlledField (type) {
    const default_field_value = '';

    const [field_value, set_field_value] = useState(default_field_value);

    function on_change(event) {
        set_field_value(event.target.value)
    }

    function reset_value () {
        set_field_value(default_field_value)
    }

    return {field_value, on_change, reset_value}
}