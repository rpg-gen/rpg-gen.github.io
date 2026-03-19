import { RefObject, MouseEventHandler, MutableRefObject } from "react"
import type_hexagon_definition from "../types/type_hexagon_definition"

type type_canvas_hook = {
    // set_edge_length: (val: number) => void
    set_num_rows: (val: number) => void,
    set_num_columns: (val: number) => void,
    is_too_large: boolean,
    ref_canvas: RefObject<HTMLCanvasElement>,
    ref_canvas_container: RefObject<HTMLDivElement>,
    canvas_height: number,
    canvas_width: number,
    get_canvas_html: () => HTMLCanvasElement,
    handle_map_click: MouseEventHandler,
    draw_map: () => void,
    ref_clicked_hex_def: MutableRefObject<type_hexagon_definition | undefined>,
    ref_previous_clicked_hex_def: MutableRefObject<type_hexagon_definition | undefined>,
    get_canvas_context: () => CanvasRenderingContext2D
}

export default type_canvas_hook