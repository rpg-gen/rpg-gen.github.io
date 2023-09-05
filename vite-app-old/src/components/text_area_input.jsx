import { useState } from "react";
import Colors from "../utility/colors.jsx";

function noop() {}

export default function TextAreaInput({id, label, value="", on_change=noop, required=false, read_only=false}) {

    function handle_change(event) {
        event.preventDefault();

        if (on_change != null) {
            on_change(event.target.value)
        }
    };

    // const container_style = {
    //     display: "flex"
    // }

    const textarea_style = {
        backgroundColor: read_only ? Colors.disabled_grey : Colors.white,
        borderWidth: read_only ? "1px" : "1px",
        // maxWidth: "30rem",
        width: "100%",
        height: "6rem",
        resize: "none",
        boxSizing: "border-box",
    }

    return (
        <>
            {/* <div style={container_style}> */}
            {/* </div> */}
            {
                label != undefined
                ?
                    <div>
                        <label htmlFor={id}>{label}:</label>{" "}
                    </div>
                : ""
            }
            <div>
                <textarea style={textarea_style} value={value} onChange={handle_change} required={required} readOnly={read_only ? "readOnly" : ""} />
            </div>
                {/* <input style={input_style} type="text" id={id} onChange={handle_change} value={value} required={required} readOnly={read_only ? "readOnly" : ""}></input> */}
        </>
    );
};