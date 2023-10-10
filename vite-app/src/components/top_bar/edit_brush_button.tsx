import top_bar_button_style from "./top_bar_button_style"
import paint_brushes from "../../configs/paint_brushes"
import { memo } from "react"
import type_canvas_hook from "../../types/type_canvas_hook"
import hexagon_math from "../../utility/hexagon_math"
import type_hexagon_definition from "../../types/type_hexagon_definition"

export default memo(function EditBrushButton(props: {
    paint_brush_id: string,
    set_is_show_paint_picker: Function,
    canvas: type_canvas_hook,
    edge_length: number,
}) {

    const this_paint_brush = paint_brushes[props.paint_brush_id]

    function handle_click() {
        const last_clicked_hex_def = props.canvas.ref_clicked_hex_def.current as type_hexagon_definition

        if (last_clicked_hex_def) {
            hexagon_math.paint_hexagon(last_clicked_hex_def, props.canvas.get_canvas_context(), props.edge_length)
            props.canvas.ref_clicked_hex_def.current = undefined
            props.canvas.ref_previous_clicked_hex_def.current = undefined
        }
        props.set_is_show_paint_picker(true)
    }

    return (
        <div
            style={{
                ...top_bar_button_style,
                backgroundColor: this_paint_brush.hexidecimal_color,
            }}

            onClick={handle_click}

            className="hover-element"

        >
            {
               this_paint_brush.icon
                ? <img src={this_paint_brush.icon} style={{height: "100%", width: "100%"}} />
                : ""
            }

        </div>
    )
})