import spacing from "../configs/spacing"
import { MutableRefObject } from "react"

export default function ZoomOption(props: {
    zoom_level: number,
    set_zoom_level: Function,
    set_is_show_zoom_picker: Function,
    set_is_show_loading: Function,
    loading_function_ref: MutableRefObject<Function>
}) {

    function update_zoom_level() {
        props.set_zoom_level(props.zoom_level)
        props.set_is_show_loading(false)
    }

    function handle_click() {
        props.set_is_show_loading(true)
        props.loading_function_ref.current = update_zoom_level
        props.set_is_show_zoom_picker(false)
    }

    return (
        <>

        <div
            style={{
                width: (spacing.top_bar_height * 2.5).toString() + "rem",
                height: spacing.top_bar_height.toString() + "rem",
                backgroundColor: "white",
                margin: spacing.top_bar_margin.toString() + "rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid black",
                borderRadius: "10%",
                color: "black",
                boxSizing: "border-box",
                flexShrink: 0
            }}

            className="hover-element"

            onClick={handle_click}
        >
            {props.zoom_level}
        </div>

        </>
    )
}