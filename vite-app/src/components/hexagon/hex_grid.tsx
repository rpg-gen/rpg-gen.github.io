import type_hexagon_definition from "../../types/type_hexagon_definition"
import { useEffect, memo, useRef, MutableRefObject, MouseEvent } from "react"
import type_canvas_hook from "../../types/type_canvas_hook"

export default memo(function HexGrid(props: {
    edge_length: number,
    set_is_show_loading: Function,
    num_rows: number,
    num_columns: number,
    hexagon_definitions_ref: MutableRefObject<type_hexagon_definition[]>,
    ref_paint_brush_id: MutableRefObject<string>,
    set_is_show_civ_picker: Function,
    canvas: type_canvas_hook
}) {    

    useEffect(() => {
        if (!is_too_large) {draw_map()}
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
            ref={canvas.ref_canvas_container}
            onClick={canvashandle_map_click}
        >
            {props.canvas.get_canvas_html()}

        </div>
    )
})