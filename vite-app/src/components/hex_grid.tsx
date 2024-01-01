import { useEffect, memo, useContext } from "react"
import type_canvas_hook from "../types/type_canvas_hook"
import feature_flags from "../configs/feature_flags"

import userContext from "../contexts/user_context"
import scale_context from "../contexts/scale_context"

export default memo(function HexGrid(props: {
    canvas: type_canvas_hook
}) {

    const user_context = useContext(userContext)
    const grid_scale_context = useContext(scale_context)

    useEffect(() => {
        if (!props.canvas.is_too_large && (!feature_flags.is_persist_to_firebase || !user_context.is_logged_in)) {
            props.canvas.draw_map()
            // const context = props.canvas.get_canvas_context()
            // context.lineWidth = 1
            // context.beginPath()
            // context.moveTo(50,50)
            // context.lineTo(100,100)
            // context.stroke()

        }
    },[grid_scale_context])

    return (

        <div
            style={{
                minWidth: "100%",
                maxWidth: "100%",
                overflow: "scroll",
                maxHeight: "100%",
                minHeight: "100%",
                height: "100%",
                overscrollBehavior: "none",
                boxSizing: "border-box",
                position: "relative",
            }}
            ref={props.canvas.ref_canvas_container}
            onClick={props.canvas.handle_map_click}
        >
            {props.canvas.get_canvas_html()}

        </div>
    )
})