import { memo, useContext } from "react"
import { useNavigate } from "react-router-dom"

// import top_bar_button_style from "./top_bar_button_style"
import spacing from "../../configs/spacing"
import paint_brushes from "../../configs/paint_brushes"


import scale_context from "../../contexts/scale_context"

export default memo(function EditBrushButton(props: {
    paint_brush_id: string,
    // canvas: type_canvas_hook,
}) {

    const current_scale_context = useContext(scale_context)
    const navigate = useNavigate()

    const this_paint_brush = paint_brushes[props.paint_brush_id]

    function handle_click() {
        // const last_clicked_hex_def = props.canvas.ref_clicked_hex_def.current as type_hexagon_definition

        // if (last_clicked_hex_def) {
        //     hexagon_math.paint_hexagon(last_clicked_hex_def, props.canvas.get_canvas_context(), current_scale_context.hexagon_edge_pixels)
        //     props.canvas.ref_clicked_hex_def.current = undefined
        //     props.canvas.ref_previous_clicked_hex_def.current = undefined
        // }

        navigate("/brush_picker")
    }

    return (<>
        <div
            style={{
                // ...top_bar_button_style,
                backgroundColor: this_paint_brush.hexidecimal_color,
                height: spacing.top_bar_height.toString() + "rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                marginRight: spacing.top_bar_margin.toString() + "rem",
                paddingLeft: ".5rem",
                paddingRight: ".5rem",
                border: "1px solid black",
                borderRadius: "5px"
            }}

            onClick={handle_click}

            className="hover-element"

        >
            {/* {
                this_paint_brush.icon
                ? <img src={this_paint_brush.icon} style={{height: "100%", width: "100%"}} />
                : ""
            } */}

            {this_paint_brush.display_name}

        </div>
    </>)
})