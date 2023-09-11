import PaintContext from "../contexts/paint_context"
import { useContext } from "react"
import CSS from "csstype"

export default function EditBrushButton(props: {top_bar_button_style: CSS.Properties}) {

    const paint_context = useContext(PaintContext)

    function handle_click() {
        paint_context.set_is_show_paint_picker(true)
    }

    return (
        <>

        {/* <img

        style={{
            height: top_bar_height.toString() + "rem",
            width: top_bar_height.toString() + "rem",
            border: "1px solid black",
            padding: ".1rem",
            boxSizing: "border-box",
            borderRadius: "20%",
            backgroundColor: "white",
            marginRight: top_bar_margin.toString() + "rem"
        }}

        src={paint_brush}

        onClick={handle_click}

        /> */}

        <div
            style={{
                ...props.top_bar_button_style,
                backgroundColor: paint_context.paint_brush.hexidecimal_color,
            }}

            onClick={handle_click}

            className="hover-element"

        >
            {
                paint_context.paint_brush.icon
                ? <img src={paint_context.paint_brush.icon} style={{height: "100%", width: "100%"}} />
                : ""
            }

        </div>

        {/* <div>{paint_context.paint_brush.name}</div> */}




        {/* <div style={{height: (top_bar_height + top_bar_margin).toString() + "rem" }}></div> */}

        </>
    )
}