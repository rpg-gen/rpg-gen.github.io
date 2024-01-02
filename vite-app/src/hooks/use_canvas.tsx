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
import useFirebaseMap from "../hooks/use_firebase_map"
import feature_flags from "../configs/feature_flags"
import limits from "../configs/limits"

export default function useCanvas(
    param_edge_length: number,
    param_num_rows: number,
    param_num_columns: number,
    param_ref_hexagon_definitions: MutableRefObject<type_hexagon_definition[]>,
    param_ref_paint_brush_id: string,
    set_is_show_loading: Function,
    set_is_show_civ_picker: Function,
    param_is_logged_in: boolean,
) {

    const firebase_map_hook = useFirebaseMap()

    const ref_canvas = useRef<HTMLCanvasElement>(null)
    const ref_canvas_container = useRef<HTMLDivElement>(null)

    const CANVAS_ID = "canvas"

    // const [edge_length, set_edge_length] = useState<number>(param_edge_length)
    const edge_length = param_edge_length
    const [num_rows, set_num_rows] = useState<number>(param_num_rows)
    const [num_columns, set_num_columns] = useState<number>(param_num_columns)

    // const ref_previous_clicked_row_number = useRef<number>(0)
    // const ref_previous_clicked_column_number = useRef<number>(0)

    // const ref_clicked_row_number = useRef<number>(0)
    // const ref_clicked_column_number = useRef<number>(0)

    const ref_clicked_hex_def = useRef<type_hexagon_definition>()
    const ref_previous_clicked_hex_def = useRef<type_hexagon_definition>()

    const canvas_height = hexagon_math.get_canvas_height(edge_length, num_rows)
    const canvas_width = hexagon_math.get_canvas_width(edge_length, num_columns)
    let is_too_large: boolean = false

    if (canvas_height > limits.canvas_width_pixels || canvas_width > limits.canvas_width_pixels) {
        is_too_large = true
    }

    function get_canvas_context() {
        return (ref_canvas.current as HTMLCanvasElement).getContext("2d") as CanvasRenderingContext2D
    }

    function save_to_firebase(hexagon_definition: type_hexagon_definition) {
        if (param_is_logged_in && feature_flags.is_persist_to_firebase) {
            firebase_map_hook.save_hexagon_definitions([hexagon_definition])
        }
    }

    function multi_save_to_firebase(hexagon_definitions: type_hexagon_definition[]) {
        if (param_is_logged_in && feature_flags.is_persist_to_firebase) {
            firebase_map_hook.save_hexagon_definitions(hexagon_definitions)
        }
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

                if (ref_clicked_hex_def.current) {
                    ref_previous_clicked_hex_def.current = ref_clicked_hex_def.current
                }
                else {
                    ref_previous_clicked_hex_def.current = hexagon_definition
                }

                ref_clicked_hex_def.current = hexagon_definition

                const paint_brush = paint_brushes[param_ref_paint_brush_id]

                if (paint_brush.paint_category == paint_category.background) {
                    hexagon_definition.background_color_hexidecimal = paint_brush.hexidecimal_color
                    hexagon_math.paint_hexagon(hexagon_definition, get_canvas_context(), edge_length)
                    save_to_firebase(hexagon_definition)
                }
                else if (paint_brush.paint_category == paint_category.icon) {
                    if (paint_brush.id == "clear_icon") {
                        hexagon_definition.icon_name = ""
                        hexagon_definition.town_size = 0
                        hexagon_definition.affinity = 0
                        hexagon_definition.race = 0
                        hexagon_math.paint_hexagon(hexagon_definition, get_canvas_context(), edge_length)
                        save_to_firebase(hexagon_definition)
                        return
                    }

                    hexagon_definition.icon_name = paint_brush.id
                   save_to_firebase(hexagon_definition)
                    set_is_show_civ_picker(true)
                }
                else if (paint_brush.paint_category == paint_category.path) {

                    if (paint_brush.id == "clear_path") {
                        ref_clicked_hex_def.current.is_top_left_river = false
                        ref_clicked_hex_def.current.is_top_right_river = false
                        ref_clicked_hex_def.current.is_right_river = false
                        ref_clicked_hex_def.current.is_bottom_right_river = false
                        ref_clicked_hex_def.current.is_bottom_left_river = false
                        ref_clicked_hex_def.current.is_left_river = false
                        ref_clicked_hex_def.current.is_top_left_road = false
                        ref_clicked_hex_def.current.is_top_right_road = false
                        ref_clicked_hex_def.current.is_right_road = false
                        ref_clicked_hex_def.current.is_bottom_right_road = false
                        ref_clicked_hex_def.current.is_bottom_left_road = false
                        ref_clicked_hex_def.current.is_left_road = false
                        hexagon_math.paint_hexagon(ref_clicked_hex_def.current, get_canvas_context(), edge_length)
                        save_to_firebase(ref_clicked_hex_def.current)
                        return
                    }

                    const is_neighbor = hexagon_math.is_neighboring_hex(
                        ref_previous_clicked_hex_def.current as type_hexagon_definition,
                        ref_clicked_hex_def.current as type_hexagon_definition,
                    )

                    if (is_neighbor) {
                        hexagon_math.add_path_definition(ref_previous_clicked_hex_def.current, ref_clicked_hex_def.current, paint_brush.id)
                        hexagon_math.paint_hexagon(ref_previous_clicked_hex_def.current, get_canvas_context(), edge_length)
                        hexagon_math.paint_hexagon(ref_clicked_hex_def.current, get_canvas_context(), edge_length)
                        hexagon_math.paint_circle(ref_clicked_hex_def.current, get_canvas_context(), edge_length, paint_brush.hexidecimal_color)
                        multi_save_to_firebase([ref_clicked_hex_def.current,ref_previous_clicked_hex_def.current])
                    }
                    else {
                        // Reset the last clicked so we are still at the previous spot
                        ref_clicked_hex_def.current = {...ref_previous_clicked_hex_def.current}
                    }
                }
            }
        }
    }

    function draw_map() {
        set_is_show_loading(true)

        const worker = new Worker(worker_url, {type: "module"})

        // Ensure at least a half-second delay while drawing map, to prevent un-readable flicker
        setTimeout(() => {
            worker.postMessage({
                edge_length: edge_length,
                num_rows: num_rows,
                num_columns: num_columns,
                hexagon_definitions: param_ref_hexagon_definitions.current
            })
        }, 500 /* milliseconds */)

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
        ref_clicked_hex_def,
        ref_previous_clicked_hex_def,
        get_canvas_context,
    }

    return canvas_hook
}