import { useEffect, memo, useContext, useRef, MouseEvent, MouseEventHandler, MutableRefObject } from "react"

import { get_hexagon_short_diagonal_length } from "../helpers/geometry"
import feature_flags from "../configs/feature_flags"

import Hexagon from "../classes/Hexagon"
import userContext from "../contexts/user_context"
import scale_context from "../contexts/scale_context"
import spacing from "../configs/spacing"
import limits from "../configs/limits"
import worker_url from "../worker/worker?worker&url"
import useFirebaseMap from "../hooks/use_firebase_map"
import Matrix from "../classes/Matrix"
import { calculate_canvas_height, calculate_canvas_width } from "../helpers/sizing"
import paint_brushes from "../configs/paint_brushes"
import { paint_category } from "../types/type_paint_brush"

export default memo(function HexGrid(props: {
    set_is_show_loading: React.Dispatch<React.SetStateAction<boolean>>,
    ref_paint_brush_id: MutableRefObject<string>,
    ref_clicked_hexagon: MutableRefObject<Hexagon | undefined>,
    ref_previous_clicked_hexagon: MutableRefObject<Hexagon | undefined>,
    reset_path_edit: Function
}) {

    const firebase_map_hook = useFirebaseMap()

    const CANVAS_ID = "canvas_id"
    let is_canvas_too_large = false

    const current_scale_context = useContext(scale_context)

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

    const matrix = new Matrix(current_scale_context.hexagon_edge_pixels)

    function handle_map_click(event: MouseEvent) {
        if (!ref_html_canvas_container.current || !ref_html_canvas.current) {
            return
        }

        const offset_x = ref_html_canvas_container.current.scrollLeft
        const offset_y = ref_html_canvas_container.current.scrollTop
        const clicked_x = event.clientX + offset_x
        const clicked_y = event.clientY + offset_y

        matrix.hexagons.forEach((hexagon) => {
            if (hexagon.contains_point(clicked_x, clicked_y)) {
               if (props.ref_clicked_hexagon.current) {
                    props.ref_previous_clicked_hexagon.current = props.ref_clicked_hexagon.current
                }
                // else {
                //     props.ref_previous_clicked_hexagon.current = hexagon
                // }

                props.ref_clicked_hexagon.current = hexagon

                const paint_brush = paint_brushes[props.ref_paint_brush_id.current]

                if (paint_brush.paint_category == paint_category.background) {
                    hexagon.background_color_hexidecimal = paint_brush.hexidecimal_color
                    firebase_map_hook.save_hexagon_definitions([hexagon])
                    hexagon.paint()
                }
                else if (paint_brush.paint_category == paint_category.icon) {
                    if (paint_brush.id == "clear_icon") {
                        hexagon.icon_name = ""
                    }
                    else {
                        hexagon.icon_name = paint_brush.id
                    }

                    hexagon.paint()
                    firebase_map_hook.save_hexagon_definitions([hexagon])
                }
                else if (paint_brush.paint_category == paint_category.path) {

                    if (paint_brush.id == "clear_path") {
                        props.ref_clicked_hexagon.current.is_top_left_river = false
                        props.ref_clicked_hexagon.current.is_top_right_river = false
                        props.ref_clicked_hexagon.current.is_right_river = false
                        props.ref_clicked_hexagon.current.is_bottom_right_river = false
                        props.ref_clicked_hexagon.current.is_bottom_left_river = false
                        props.ref_clicked_hexagon.current.is_left_river = false
                        props.ref_clicked_hexagon.current.is_top_left_road = false
                        props.ref_clicked_hexagon.current.is_top_right_road = false
                        props.ref_clicked_hexagon.current.is_right_road = false
                        props.ref_clicked_hexagon.current.is_bottom_right_road = false
                        props.ref_clicked_hexagon.current.is_bottom_left_road = false
                        props.ref_clicked_hexagon.current.is_left_road = false

                        firebase_map_hook.save_hexagon_definitions([hexagon])
                        hexagon.paint()
                        return
                    }

                    // If they click on the same hex as before, we want to treat the path as "ended" and reset things
                    if (props.ref_clicked_hexagon.current == props.ref_previous_clicked_hexagon.current) {
                        props.reset_path_edit()
                    }

                    else {
                        if (props.ref_previous_clicked_hexagon.current && props.ref_clicked_hexagon.current) {
                            const are_neighbors = matrix.are_neighbors(hexagon, props.ref_previous_clicked_hexagon.current as Hexagon)

                            if (are_neighbors) {
                                matrix.add_path(props.ref_previous_clicked_hexagon.current, props.ref_clicked_hexagon.current, paint_brush.id)

                                props.ref_previous_clicked_hexagon.current.paint()
                                props.ref_clicked_hexagon.current.paint()
                                firebase_map_hook.save_hexagon_definitions([props.ref_previous_clicked_hexagon.current, props.ref_clicked_hexagon.current])
                            }
                            else {
                                // Reset the last clicked so we are still at the previous spot
                                // Then stop the path chain. Clicking on a non-neighbor is a way to stop the chain
                                props.ref_clicked_hexagon.current = props.ref_previous_clicked_hexagon.current
                                props.reset_path_edit()
                            }
                        }

                        if (props.ref_clicked_hexagon.current) {
                            props.ref_clicked_hexagon.current.paint_temporary_circle(paint_brush.hexidecimal_color)
                        }
                    }
                }
            }
        })
    }

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
        matrix.set_context(get_context())

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
            onClick={handle_map_click}
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
},

// Memo arePropsEqual function
function (previous_props, new_props) {
    return true
}
)