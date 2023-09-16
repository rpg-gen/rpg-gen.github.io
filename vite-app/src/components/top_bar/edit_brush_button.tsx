import top_bar_button_style from "./top_bar_button_style"
import paint_brushes from "../../configs/paint_brushes"
import { memo } from "react"

export default memo(function EditBrushButton(props: {paint_brush_id: string, set_is_show_paint_picker: Function}) {

    const this_paint_brush = paint_brushes[props.paint_brush_id]

    function handle_click() {
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