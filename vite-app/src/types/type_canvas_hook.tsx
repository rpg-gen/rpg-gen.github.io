import { RefObject, MouseEventHandler, MutableRefObject } from "react"
import type_hexagon_definition from "../types/type_hexagon_definition"

type type_canvas_hook = {
    // set_edge_length: Function
    set_num_rows: Function,
    set_num_columns: Function,
    is_too_large: Boolean,
    ref_canvas: RefObject<HTMLCanvasElement>,
    ref_canvas_container: RefObject<HTMLDivElement>,
    canvas_height: number,
    canvas_width: number,
    get_canvas_html: Function,
    handle_map_click: MouseEventHandler,
    draw_map: Function,
    ref_clicked_hex_def: MutableRefObject<type_hexagon_definition | undefined>,
    get_canvas_context: Function
}

export default type_canvas_hook