import { useEffect, memo, MutableRefObject } from "react"
import type_canvas_hook from "../../types/type_canvas_hook"
import feature_flags from "../../configs/feature_flags"

export default memo(function HexGrid(props: {
    edge_length: number,
    num_rows: number,
    num_columns: number,
    canvas: type_canvas_hook
}) {

    useEffect(() => {
        if (!props.canvas.is_too_large && !feature_flags.is_persist_to_firebase) {
            props.canvas.draw_map()
        }
    },[props.edge_length, props.num_rows, props.num_columns])



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