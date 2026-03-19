import { memo } from "react"

// import top_bar_button_style from "./top_bar_button_style"
import spacing from "../../configs/spacing"
import paint_brushes from "../../configs/paint_brushes"
import { nav_paths } from "../../configs/constants"

// eslint-disable-next-line react-refresh/only-export-components
export default memo(function EditBrushButton(props: {
    paint_brush_id: string,
    navigate_away_from_map: (url: string) => void
}) {

    const this_paint_brush = paint_brushes[props.paint_brush_id]

    function handle_click() {
        props.navigate_away_from_map(nav_paths.map + "/brush_picker")
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