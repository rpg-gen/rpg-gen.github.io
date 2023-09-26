import spacing from "../configs/spacing"
import colors from "../configs/colors"
import hexagon_math from "../utility/hexagon_math"

export default function ZoomOption(props: {
    zoom_level: number,
    set_zoom_level: Function,
    set_is_show_zoom_picker: Function,
    default_edge_length: number,
    default_zoom_level: number,
    num_rows: number
    // set_is_show_loading: Function,
    // loading_function_ref: MutableRefObject<Function>
}) {

    // function update_zoom_level() {
    //     props.set_zoom_level(props.zoom_level)
    //     props.set_is_show_loading(false)
    // }

    function handle_click() {
        // props.set_is_show_loading(true)
        // props.loading_function_ref.current = update_zoom_level
        if (is_valid_zoom) {
            props.set_zoom_level(props.zoom_level)
            props.set_is_show_zoom_picker(false)
        }
    }

    const new_edge_length = props.default_edge_length * (props.zoom_level / props.default_zoom_level)

    const new_height = hexagon_math.get_canvas_height(new_edge_length, props.num_rows)
    const new_width = hexagon_math.get_canvas_width(new_edge_length, props.num_rows)

    const is_valid_zoom = (new_height < spacing.canvas_pixel_limit && new_width < spacing.canvas_pixel_limit)

    return (
        <>

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

        </>
    )
}