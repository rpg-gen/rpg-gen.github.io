import { MouseEvent, MutableRefObject, Dispatch, SetStateAction } from "react"
import { useNavigate } from "react-router-dom"

import { paint_category } from "../types/type_paint_brush"
import paint_brushes from "../configs/paint_brushes"
import spacing from "../configs/spacing"
import colors from "../configs/colors"
import FullPageOverlay from "../components/full_page_overlay"
import class_names from "../configs/class_names"

export default function PaintPicker(props: {
    set_paint_brush_id: Dispatch<SetStateAction<string>>
}) {

    const navigate = useNavigate()

    function handle_off_click(event: MouseEvent) {
        navigate("/")
    }

    return (
        <FullPageOverlay>
            <Section this_paint_category={paint_category.background} set_paint_brush_id={props.set_paint_brush_id} />
            <Section this_paint_category={paint_category.icon} set_paint_brush_id={props.set_paint_brush_id}  />
            <Section this_paint_category={paint_category.path} set_paint_brush_id={props.set_paint_brush_id}  />
        </FullPageOverlay>
    )
}

function Section(props: {
    this_paint_category: paint_category, 
    set_paint_brush_id: Dispatch<SetStateAction<string>>
}) {
    const brush_buttons = []
    const navigate = useNavigate()

    function handle_paint_brush_click(event: MouseEvent) {
        const clicked_paint_brush_id = ((event.target as HTMLElement).dataset.paintBrushId as string)
        props.set_paint_brush_id(clicked_paint_brush_id)
        // navigate("/")
    }

    const PaintOption = function (props: {paint_brush_id: string}) {
        const this_paint_brush = paint_brushes[props.paint_brush_id]
        return (
            <div 
                style={{
                    display: "flex",
                    alignItems: "Center",
                    marginTop: spacing.top_bar_margin.toString() + "rem",
                }}

                className={class_names.count_as_off_click}
            >
                <div
                    style={{
                        width: (spacing.top_bar_height * 2.5).toString() + "rem",
                        height: spacing.top_bar_height.toString() + "rem",
                        backgroundColor: this_paint_brush.hexidecimal_color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid black",
                        borderRadius: "10%",
                        boxSizing: "border-box",
                        flexShrink: 0,
                        marginRight: spacing.top_bar_margin + "rem"
                    }}

                    data-paint-brush-id={props.paint_brush_id}

                    className="hover-element"

                    onClick={handle_paint_brush_click}
                >
                    {this_paint_brush.display_name}
                </div>

                <div 
                    style={{
                        color: colors.white
                    }}
                >
                    {this_paint_brush.description}
                </div>
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

        <div 
            style={{
                margin: spacing.top_bar_margin + "rem"
            }}

            className={class_names.count_as_off_click}
        >
            {brush_buttons}
        </div>

        </>
    )
}
