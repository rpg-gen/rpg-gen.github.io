import CSS from "csstype"
import MapContext from "../contexts/map_context"
import { useContext } from "react"

export default function ZoomButton(props: {top_bar_button_style: CSS.Properties}) {

    const map_context = useContext(MapContext)

    function handle_click() {
        map_context.set_is_show_zoom_picker(true)
    }

    return (
        <>

        <div

            style={{
                ...props.top_bar_button_style,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "white"
            }}

            className="hover-element"

            onClick={handle_click}
        >

            x{map_context.zoom_level}
        </div>

        </>
    )
}