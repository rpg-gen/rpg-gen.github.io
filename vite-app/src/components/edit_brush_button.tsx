import paint_brush from "../assets/paint_brush.svg";
import spacing from "../configs/spacing"
import PaintContext from "../contexts/paint_context"
import { useContext } from "react"

export default function EditBrushButton() {

    const {top_bar_height, top_bar_margin} = spacing
    const paint_context = useContext(PaintContext)

    function handle_click() {
        paint_context.set_is_show_paint_picker(true)
    }

    return (
        <>

        <img

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

        />

        <div>{paint_context.paint_brush.name}</div>




        {/* <div style={{height: (top_bar_height + top_bar_margin).toString() + "rem" }}></div> */}

        </>
    )
}