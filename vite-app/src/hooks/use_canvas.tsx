// Use this for information we need to remember about the canvas, such as what was clicked, etc

import { useRef, useState, MutableRefObject, MouseEventHandler, MouseEvent} from "react"
import type_hexagon_definition from "../types/type_hexagon_definition"
import hexagon_math from "../utility/hexagon_math"
import spacing from "../configs/spacing"
import type_canvas_hook from "../types/type_canvas_hook"
import colors from "../configs/colors"
import { paint_category } from "../types/type_paint_brush"
import paint_brushes from "../configs/paint_brushes"
import worker_url from "../worker/worker?worker&url"

export default function useCanvas(
    param_edge_length: number, 
    param_num_rows: number, 
    param_num_columns: number,
    param_ref_hexagon_definitions: MutableRefObject<type_hexagon_definition[]>,
    param_ref_paint_brush_id: MutableRefObject<string>,
    set_is_show_loading: Function,
    set_is_show_civ_picker: Function
) {

    const ref_canvas = useRef<HTMLCanvasElement>(null)
    const ref_canvas_container = useRef<HTMLDivElement>(null)

    const CANVAS_ID = "canvas"

    // const [edge_length, set_edge_length] = useState<number>(param_edge_length)
    const edge_length = param_edge_length
    const [num_rows, set_num_rows] = useState<number>(param_num_rows)
    const [num_columns, set_num_columns] = useState<number>(param_num_columns)

    const ref_clicked_row_number = useRef<number>(0)
    const ref_clicked_column_number = useRef<number>(0)

    const canvas_height = hexagon_math.get_canvas_height(edge_length, num_rows)
    const canvas_width = hexagon_math.get_canvas_width(edge_length, num_columns)
    let is_too_large: boolean = false
    
    if (canvas_height > spacing.canvas_pixel_limit || canvas_width > spacing.canvas_pixel_limit) {
        is_too_large = true
    }

    function get_canvas_context() {
        return (ref_canvas.current as HTMLCanvasElement).getContext("2d") as CanvasRenderingContext2D
    }

    function get_canvas_html() {
        return (
            !is_too_large
            ?
                <canvas
                    ref={ref_canvas}
                    id={CANVAS_ID}
                    height={canvas_height}
                    width={canvas_width}
                >
                </canvas>
            :
                <p style={{paddingTop: spacing.top_bar_height + "rem"}}>Canvas is too large</p>
        )
    }

    const handle_map_click: MouseEventHandler = function(event: MouseEvent) {
        if (!ref_canvas_container.current || !ref_canvas.current) {
            return
        }

        const context = ref_canvas.current.getContext("2d") as CanvasRenderingContext2D

        const offset_x = ref_canvas_container.current.scrollLeft
        const offset_y = ref_canvas_container.current.scrollTop

        const clicked_x = event.clientX + offset_x
        const clicked_y = event.clientY + offset_y

        for (const hexagon_index in param_ref_hexagon_definitions.current) {
            const hexagon_definition = param_ref_hexagon_definitions.current[hexagon_index]

            if (context.isPointInPath(hexagon_math.get_canvas_path_2d(hexagon_math.get_hexagon_points(hexagon_definition, edge_length)), clicked_x, clicked_y)) {
                ref_clicked_row_number.current = hexagon_definition.row_number
                ref_clicked_column_number.current = hexagon_definition.column_number
                const paint_brush = paint_brushes[param_ref_paint_brush_id.current]

                if (paint_brush.paint_category == paint_category.background) {
                    hexagon_definition.background_color_hexidecimal = paint_brush.hexidecimal_color
                    hexagon_math.paint_hexagon(hexagon_definition, get_canvas_context(), edge_length)
                }

                if (paint_brush.paint_category == paint_category.icon && paint_brush.id == "town") {
                    hexagon_definition.icon_name = "town"
                    set_is_show_civ_picker(true)
                }
                // console.log(hexagon_definition.row_number.toString() + " " + hexagon_definition.column_number.toString())
                // console.log(props.ref_paint_brush_id.current)
            }
        }
    }

    function draw_map() {
        set_is_show_loading(true)
        const worker = new Worker(worker_url, {type: "module"})
        setTimeout(() => {
            worker.postMessage({
                edge_length: edge_length,
                num_rows: num_rows,
                num_columns: num_columns,
                hexagon_definitions: param_ref_hexagon_definitions.current
            })
        }, 500)
        worker.onmessage = (message) => {
            const context = get_canvas_context()
            context.drawImage(message.data.bitmap, 0, 0)
            message.data.bitmap.close()
            param_ref_hexagon_definitions.current = message.data.hexagon_definitions
            set_is_show_loading(false)
        }
    }

    const canvas_hook: type_canvas_hook = {
        set_num_rows,
        set_num_columns,
        is_too_large,
        ref_canvas,
        ref_canvas_container,
        canvas_height,
        canvas_width,
        get_canvas_html,
        handle_map_click,
        draw_map,
        ref_clicked_row_number,
        ref_clicked_column_number,
        get_canvas_context,
    }

    return canvas_hook
}