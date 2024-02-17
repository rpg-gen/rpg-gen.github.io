import { MouseEvent, Dispatch, SetStateAction, MutableRefObject } from "react"
import { useNavigate } from "react-router-dom"

import { paint_category } from "../types/type_paint_brush"
import paint_brushes from "../configs/paint_brushes"
import spacing from "../configs/spacing"
import colors from "../configs/colors"
import FullPageOverlay from "../components/full_page_overlay"
import class_names from "../configs/class_names"
import { nav_paths } from "../configs/constants"


export default function BrushPicker(props: {
    set_paint_brush_id: Dispatch<SetStateAction<string>>,
    ref_paint_brush_id: MutableRefObject<string>
}) {


    return (
        <FullPageOverlay>
            <Section this_paint_category={paint_category.background} set_paint_brush_id={props.set_paint_brush_id} ref_paint_brush_id={props.ref_paint_brush_id} />
            <Section this_paint_category={paint_category.icon} set_paint_brush_id={props.set_paint_brush_id} ref_paint_brush_id={props.ref_paint_brush_id}  />
            <Section this_paint_category={paint_category.path} set_paint_brush_id={props.set_paint_brush_id} ref_paint_brush_id={props.ref_paint_brush_id}  />
        </FullPageOverlay>
    )
}

function Section(props: {
    this_paint_category: paint_category,
    set_paint_brush_id: Dispatch<SetStateAction<string>>,
    ref_paint_brush_id: MutableRefObject<string>
}) {
    const brush_buttons = []
    const navigate = useNavigate()

    function handle_paint_brush_click(event: MouseEvent) {
        const clicked_paint_brush_id = ((event.target as HTMLElement).dataset.paintBrushId as string)

        // Paint brush id has to be set in both places so we can change the state value and have it re-render visible elements like the paint brush button
        // as well as change the un-rendered value so any processes can know what the current paint brush id is without having to had re-rendered whenever it changed
        props.set_paint_brush_id(clicked_paint_brush_id)
        props.ref_paint_brush_id.current = clicked_paint_brush_id

        navigate(nav_paths.map)
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
