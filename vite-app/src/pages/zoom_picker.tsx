import { useContext} from "react"
import { useNavigate } from "react-router-dom"

import spacing from "../configs/spacing"
import limits from "../configs/limits"
import defaults from "../configs/defaults"
import colors from "../configs/colors"
import { get_hexagon_svg } from "../helpers/geometry"
import scale_context from "../contexts/scale_context"
import class_names from "../configs/class_names"
import FullPageOverlay from "../components/full_page_overlay"
import { calculate_canvas_height, calculate_canvas_width } from "../helpers/sizing"

export default function ZoomPicker() {

    return (

        <FullPageOverlay>
            {/* <div style={{
                display: "flex",
                justifyContent: "center",
            }}> */}
                {/* <div style={{
                    display: "flex",
                    maxWidth: ((spacing.top_bar_height * 2.5 + spacing.top_bar_margin * 2) * 3) + "rem",
                    flexWrap: "wrap",
                }}> */}
                    {Array.from({length: 10}, (_, index) => {
                        return <ZoomOption
                            key={index}
                            zoom_level={index+1}
                        />
                    })}
                {/* </div> */}
            {/* </div> */}
        </FullPageOverlay>

        // <div style={{
        //     position: "fixed",
        //     top: 0,
        //     bottom: 0,
        //     left: 0,
        //     right: 0,
        //     backgroundColor: "rgba(0, 0, 0, .75)",
        //     zIndex: 100,
        //     display: "flex",
        //     justifyContent: "center",
        //     flexDirection: "column"
        // }}>


        // </div>

    )
}

function ZoomOption(props: {zoom_level: number}) {

    const current_scale_context = useContext(scale_context)
    const navigate = useNavigate()

    function handle_click() {
        current_scale_context.set_scale_context((previous_context) => {
            return {
                ...previous_context,
                hexagon_edge_pixels: new_edge_length
            }
        })
        navigate("/")
    }

    const new_edge_length = props.zoom_level * (defaults.hexagon_edge_pixels / defaults.zoom_level)
    const new_height = calculate_canvas_height(new_edge_length, current_scale_context.num_hexes_tall)
    const new_width = calculate_canvas_width(new_edge_length, current_scale_context.num_hexes_wide)
    const is_valid_zoom = (new_height < limits.canvas_width_pixels && new_width < limits.canvas_width_pixels)

    const HexagonSvg = get_hexagon_svg(new_edge_length, colors.white)

    return (
        <>

        <div
            style={{
                display: "flex",
                alignItems: "center",
                marginBottom: spacing.top_bar_margin + "rem"
            }}

            className={class_names.count_as_off_click}
        >
            <div
                style={{
                    width: (spacing.top_bar_height * 2.5).toString() + "rem",
                    height: spacing.top_bar_height.toString() + "rem",
                    backgroundColor: is_valid_zoom ? colors.white : colors.disabled,
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

                className={is_valid_zoom ? "hover-element" : "not-allowed"}

                onClick={handle_click}
            >
                {props.zoom_level}
            </div>

            {HexagonSvg}

        </div>


        </>
    )
}