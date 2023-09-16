import top_bar_button_style from "./top_bar_button_style"
import { memo } from "react"

export default memo(function ZoomButton(props: {zoom_level: number, set_is_show_zoom_picker: Function}) {

    function handle_click() {
        props.set_is_show_zoom_picker(true)
    }

    return (
        <>

        <div

            style={{
                ...top_bar_button_style,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "white"
            }}

            className="hover-element"

            onClick={handle_click}
        >

            x{props.zoom_level}
        </div>

        </>
    )
})