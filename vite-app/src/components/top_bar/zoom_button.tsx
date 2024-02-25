import top_bar_button_style from "./top_bar_button_style"
import { memo, useContext } from "react"
import scale_context from "../../contexts/scale_context"
import { useNavigate } from "react-router-dom"
import defaults from "../../configs/defaults"
import { nav_paths } from "../../configs/constants"

export default memo(function ZoomButton(props: {
    navigate_away_from_map: Function
}) {

    const current_scale_context = useContext(scale_context)
    const current_zoom_level = current_scale_context.hexagon_edge_pixels / (defaults.hexagon_edge_pixels / defaults.zoom_level)

    function handle_click() {
        props.navigate_away_from_map(nav_paths.map + "/zoom")
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

            x{current_zoom_level}

        </div>

        </>
    )
})