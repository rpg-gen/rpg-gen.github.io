import spacing from "../configs/spacing"
import paint_brushes from "../configs/paint_brushes"
import { useContext } from "react"
import PaintContext from "../contexts/paint_context"
import paint_brush from "../types/paint_brush"

export default function PaintPicker() {

    const paint_brush_options = []

    for (const key in paint_brushes) {
        paint_brush_options.push(<PaintOption key={key} paint_brush={paint_brushes[key]} />)
    }

    return (
        <>

        <div style={{
            position: "fixed",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "rgba(0, 0, 0, .75)",
            zIndex: 100,
            display: "flex",
            justifyContent: "center",
            flexDirection: "column"
        }}>

        <div style={{
            display: "flex",
            // alignItems: "center",
            // justifyContent: "center",
            justifyContent: "center",
            flexWrap: "wrap"
        }}>
            {paint_brush_options}
        </div>

        </div>

        </>
    )
}

function PaintOption({paint_brush}: {paint_brush: paint_brush}) {

    const paint_context = useContext(PaintContext)

    function handle_click() {
        paint_context.set_valid_paint_brush(paint_brush.name)
        paint_context.set_is_show_paint_picker(false)
    }

    return (
        <>

        <div
            style={{
                width: (spacing.top_bar_height * 2.5).toString() + "rem",
                height: spacing.top_bar_height.toString() + "rem",
                backgroundColor: paint_brush.hexidecimal_color,
                margin: spacing.top_bar_margin.toString() + "rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid black",
                borderRadius: "10%",
                color: paint_brush.font_color
            }}

            className="hover-element"

            onClick={handle_click}
        >
            {paint_brush.name}
        </div>

        </>
    )
}