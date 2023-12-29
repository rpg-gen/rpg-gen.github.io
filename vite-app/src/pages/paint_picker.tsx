import { paint_category } from "../types/type_paint_brush"
import paint_brushes from "../configs/paint_brushes"
import spacing from "../configs/spacing"
import { MouseEvent, MutableRefObject } from "react"


export default function PaintPicker(props: {children: JSX.Element[]}) {

    return (
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

            {props.children}

        </div>
    )
}

function Section(props: {this_paint_category: paint_category, set_is_show_paint_picker: Function, set_display_paint_brush_id: Function, ref_paint_brush_id: MutableRefObject<string>}) {
    const brush_buttons = []

    function handle_paint_brush_click(event: MouseEvent) {
        const clicked_paint_brush_id = (event.target as HTMLElement).dataset.paintBrushId
        props.ref_paint_brush_id.current = (clicked_paint_brush_id as string)
        props.set_display_paint_brush_id(clicked_paint_brush_id)

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
