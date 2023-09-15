import spacing from "../configs/spacing"
import paint_brushes from "../configs/paint_brushes"
import { useContext } from "react"
import PaintContext from "../contexts/paint_context"
import paint_brush from "../types/paint_brush"
import { category, color_type } from "../types/paint_brush"
import colors from "../configs/colors"

export default function PaintPicker() {

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

            <Section category={category.background} />
            <Section category={category.action} />
            <Section category={category.icon} />
            <Section category={category.path} />

        </div>

        </>
    )
}

function Section(props: {category: category}) {
    const brushes = []

    for (const key in paint_brushes) {
        const paint_brush = paint_brushes[key]
        if (paint_brush.category == props.category) {
            brushes.push(<PaintOption key={key} paint_brush={paint_brushes[key]} />)
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
                    {brushes}
                </div>
            </div>

        </>
    )
}

function PaintOption({paint_brush}: {paint_brush: paint_brush}) {

    const paint_context = useContext(PaintContext)

    function handle_click() {
        paint_context.set_valid_paint_brush(paint_brush.id)
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
                color: (paint_brush.color_type == color_type.light ? colors.black : colors.white),
                boxSizing: "border-box",
                flexShrink: 0
            }}

            className="hover-element"

            onClick={handle_click}
        >
            {paint_brush.display_name}
        </div>

        </>
    )
}