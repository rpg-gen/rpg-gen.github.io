import { RefObject } from "react"

type type_canvas_hook = {
    set_edge_length: Function
    set_num_rows: Function,
    set_num_columns: Function,
    is_too_large: Boolean,
    ref_canvas: RefObject<HTMLCanvasElement>,
    ref_canvas_container: RefObject<HTMLDivElement>,
    canvas_height: number,
    canvas_width: number,
    get_canvas_html: Function
}

export default type_canvas_hook