import { useState } from "react";
import Colors from "../utility/colors.jsx";

function noop() {}

export default function TextInput({id, label, value="", on_change=noop, required=true, read_only=false}) {

    function handle_change(event) {
        event.preventDefault();

        if (on_change != null) {
            on_change(event.target.value)
        }
    };

    const input_style = {
        backgroundColor: read_only ? Colors.disabled_grey : Colors.white,
        borderWidth: read_only ? "1px" : "1px",
    }

    return (
        <>
            {
                label != undefined
                ?
                    <div>
                        <label htmlFor={id}>{label}:</label>{" "}
                    </div>
                :
                    ""
            }
            <div>
                <input style={input_style} type="text" id={id} onChange={handle_change} value={value} required={required} readOnly={read_only ? "readOnly" : ""}></input>
            </div>
        </>
    );
};