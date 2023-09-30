import { RefObject, MouseEventHandler, MutableRefObject } from "react"

type type_canvas_hook = {
    set_edge_length: Function
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
    ref_clicked_row_number: MutableRefObject<number>,
    ref_clicked_column_number: MutableRefObject<number>,
    paint_civ_text: Function,
    repaint_hexagon: Function,
}

export default type_canvas_hook