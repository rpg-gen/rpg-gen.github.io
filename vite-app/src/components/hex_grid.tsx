import { useEffect, memo, useContext, useRef, MouseEvent, MouseEventHandler } from "react"

import { get_hexagon_short_diagonal_length } from "../helpers/geometry"
import feature_flags from "../configs/feature_flags"

import userContext from "../contexts/user_context"
import scale_context from "../contexts/scale_context"
import spacing from "../configs/spacing"
import limits from "../configs/limits"
import worker_url from "../worker/worker?worker&url"
import useFirebaseMap from "../hooks/use_firebase_map"
import Matrix from "../classes/Matrix"
import { calculate_canvas_height, calculate_canvas_width } from "../helpers/sizing"

export default memo(function HexGrid(props: {
    set_is_show_loading: React.Dispatch<React.SetStateAction<boolean>>,
}) {

    const CANVAS_ID = "canvas_id"
    let is_canvas_too_large = false

    const user_context = useContext(userContext)
    const current_scale_context = useContext(scale_context)

    const matrix = new Matrix()

    const short_diagonal_pixels = get_hexagon_short_diagonal_length(current_scale_context.hexagon_edge_pixels)

    const canvas_height_pixels = calculate_canvas_height(current_scale_context.hexagon_edge_pixels, current_scale_context.num_hexes_tall)
    const canvas_width_pixels = calculate_canvas_width(current_scale_context.hexagon_edge_pixels, current_scale_context.num_hexes_wide)

    if (canvas_height_pixels > limits.canvas_height_pixels || canvas_width_pixels > limits.canvas_width_pixels) {
        is_canvas_too_large = true
    }

    const ref_html_canvas = useRef<HTMLCanvasElement>(null)
    const ref_html_canvas_container = useRef<HTMLDivElement>(null)

    function get_context() {
        return (ref_html_canvas.current as HTMLCanvasElement).getContext("2d") as CanvasRenderingContext2D
    }

    // function handle_map_click(event: MouseEvent) {
    //     if (!ref_html_canvas_container.current || !ref_html_canvas.current) {
    //         return
    //     }

    //     const context = get_context()
    //     const offset_x = ref_html_canvas_container.current.scrollLeft
    //     const offset_y = ref_html_canvas_container.current.scrollTop
    //     const clicked_x = event.clientX + offset_x
    //     const clicked_y = event.clientY + offset_y


    //     for (const hexagon_index in param_ref_hexagon_definitions.current) {
    //         const hexagon_definition = param_ref_hexagon_definitions.current[hexagon_index]

    //         if (context.isPointInPath(hexagon_math.get_canvas_path_2d(hexagon_math.get_hexagon_points(hexagon_definition, edge_length)), clicked_x, clicked_y)) {

    //             if (ref_clicked_hex_def.current) {
    //                 ref_previous_clicked_hex_def.current = ref_clicked_hex_def.current
    //             }
    //             else {
    //                 ref_previous_clicked_hex_def.current = hexagon_definition
    //             }

    //             ref_clicked_hex_def.current = hexagon_definition

    //             const paint_brush = paint_brushes[param_ref_paint_brush_id]

    //             if (paint_brush.paint_category == paint_category.background) {
    //                 hexagon_definition.background_color_hexidecimal = paint_brush.hexidecimal_color
    //                 hexagon_math.paint_hexagon(hexagon_definition, get_canvas_context(), edge_length)
    //                 save_to_firebase(hexagon_definition)
    //             }
    //             else if (paint_brush.paint_category == paint_category.icon) {
    //                 if (paint_brush.id == "clear_icon") {
    //                     hexagon_definition.icon_name = ""
    //                     hexagon_definition.town_size = 0
    //                     hexagon_definition.affinity = 0
    //                     hexagon_definition.race = 0
    //                     hexagon_math.paint_hexagon(hexagon_definition, get_canvas_context(), edge_length)
    //                     save_to_firebase(hexagon_definition)
    //                     return
    //                 }

    //                 hexagon_definition.icon_name = paint_brush.id
    //                save_to_firebase(hexagon_definition)
    //                 set_is_show_civ_picker(true)
    //             }
    //             else if (paint_brush.paint_category == paint_category.path) {

    //                 if (paint_brush.id == "clear_path") {
    //                     ref_clicked_hex_def.current.is_top_left_river = false
    //                     ref_clicked_hex_def.current.is_top_right_river = false
    //                     ref_clicked_hex_def.current.is_right_river = false
    //                     ref_clicked_hex_def.current.is_bottom_right_river = false
    //                     ref_clicked_hex_def.current.is_bottom_left_river = false
    //                     ref_clicked_hex_def.current.is_left_river = false
    //                     ref_clicked_hex_def.current.is_top_left_road = false
    //                     ref_clicked_hex_def.current.is_top_right_road = false
    //                     ref_clicked_hex_def.current.is_right_road = false
    //                     ref_clicked_hex_def.current.is_bottom_right_road = false
    //                     ref_clicked_hex_def.current.is_bottom_left_road = false
    //                     ref_clicked_hex_def.current.is_left_road = false
    //                     hexagon_math.paint_hexagon(ref_clicked_hex_def.current, get_canvas_context(), edge_length)
    //                     save_to_firebase(ref_clicked_hex_def.current)
    //                     return
    //                 }

    //                 const is_neighbor = hexagon_math.is_neighboring_hex(
    //                     ref_previous_clicked_hex_def.current as type_hexagon_definition,
    //                     ref_clicked_hex_def.current as type_hexagon_definition,
    //                 )

    //                 if (is_neighbor) {
    //                     hexagon_math.add_path_definition(ref_previous_clicked_hex_def.current, ref_clicked_hex_def.current, paint_brush.id)
    //                     hexagon_math.paint_hexagon(ref_previous_clicked_hex_def.current, get_canvas_context(), edge_length)
    //                     hexagon_math.paint_hexagon(ref_clicked_hex_def.current, get_canvas_context(), edge_length)
    //                     hexagon_math.paint_circle(ref_clicked_hex_def.current, get_canvas_context(), edge_length, paint_brush.hexidecimal_color)
    //                     multi_save_to_firebase([ref_clicked_hex_def.current,ref_previous_clicked_hex_def.current])
    //                 }
    //                 else {
    //                     // Reset the last clicked so we are still at the previous spot
    //                     ref_clicked_hex_def.current = {...ref_previous_clicked_hex_def.current}
    //                 }
    //             }
    //         }
    //     }
    // }

    async function draw_map() {
        props.set_is_show_loading(true)
        const worker = new Worker(worker_url, {type: "module"})



        // Ensure at least a half-second delay while drawing map, to prevent un-readable flicker
        setTimeout(() => {
            worker.postMessage({
                firebase_map_doc: matrix.get_firebase_map_doc(),
                canvas_width_pixels: canvas_width_pixels,
                canvas_height_pixels: canvas_height_pixels,
                hexagon_edge_pixels: current_scale_context.hexagon_edge_pixels
            })
        }, 500 /* milliseconds */)

        worker.onmessage = (message) => {
            const context = get_context()
            context.drawImage(message.data.bitmap, 0, 0)
            message.data.bitmap.close()
            props.set_is_show_loading(false)
        }
    }

    useEffect(() => {
        const firebase_map_hook = useFirebaseMap()

        firebase_map_hook.get_map_doc().then((data: any) => {
            matrix.populate_matrix(data)
            if (!is_canvas_too_large) {
                draw_map()
            }
        })

    },[current_scale_context])

    return (

        <div
            style={{
                minWidth: "100%",
                maxWidth: "100%",
                overflow: "auto", // or "scroll"?
                maxHeight: "100%", //
                minHeight: "100%",
                height: "100%", // These three commented-out settings, not sure effect of leaving out, but done to allow full-page-overlay to scroll on grid instead of below it
                overscrollBehavior: "none",
                boxSizing: "border-box",
                position: "relative",
            }}
            ref={ref_html_canvas_container}
            // onClick={handle_map_click}
        >
            {
                !is_canvas_too_large
                ?
                    <canvas
                        ref={ref_html_canvas}
                        id={CANVAS_ID}
                        height={canvas_height_pixels}
                        width={canvas_width_pixels}
                    >
                    </canvas>
                :
                    <p style={{paddingTop: spacing.top_bar_height + "rem"}}>Canvas is too large</p>
            }

        </div>
    )
})