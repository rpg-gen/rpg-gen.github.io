import { paint_category } from "../../types/type_paint_brush"
import paint_brushes from "../../configs/paint_brushes"
import spacing from "../../configs/spacing"
import { MouseEvent } from "react"

export default function Section(props: {this_paint_category: paint_category, set_is_show_paint_picker: Function, set_paint_brush_id: Function}) {
    const brush_buttons = []

    function handle_paint_brush_click(event: MouseEvent) {
        const clicked_paint_brush_id = (event.target as HTMLElement).dataset.paintBrushId
        // console.log(clicked_paint_brush_id)
        props.set_paint_brush_id(clicked_paint_brush_id)
        props.set_is_show_paint_picker(false)
    }

    const PaintOption = function (props: {paint_brush_id: string}) {
        const this_paint_brush = paint_brushes[props.paint_brush_id]
        return (
            <div
                style={{
                    width: (spacing.top_bar_height * 2.5).toString() + "rem",
                    height: spacing.top_bar_height.toString() + "rem",
                    backgroundColor: this_paint_brush.hexidecimal_color,
                    margin: spacing.top_bar_margin.toString() + "rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid black",
                    borderRadius: "10%",
                    boxSizing: "border-box",
                    flexShrink: 0
                }}

                data-paint-brush-id={props.paint_brush_id}

                className="hover-element"

                onClick={handle_paint_brush_click}
            >
                {this_paint_brush.display_name}
            </div>
        )
    }

    for (const key in paint_brushes) {
        const this_paint_brush = paint_brushes[key]
        if (this_paint_brush.paint_category == props.this_paint_category) {
            brush_buttons.push(<PaintOption key={key} paint_brush_id={key} />)
        }
    }

    return (
        <>

        <div style={{
                display: "flex",
                justifyContent: "center",
                margin: (spacing.top_bar_margin * 2) + "rem"
            }}>
                <div style={{
                    display: "flex",
                    maxWidth: ((spacing.top_bar_height * 2.5 + spacing.top_bar_margin * 2) * 3) + "rem",
                    flexWrap: "wrap",
                }}>
                    {brush_buttons}
                </div>
            </div>

        </>
    )
}
