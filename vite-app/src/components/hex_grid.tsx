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
import DataContext from "../contexts/DataContext"

export default memo(function HexGrid(props: {
    set_loading_state: Function,
    ref_paint_brush_id: MutableRefObject<string>,
    ref_clicked_hexagon: MutableRefObject<Hexagon | undefined>,
    ref_previous_clicked_hexagon: MutableRefObject<Hexagon | undefined>,
    reset_path_edit: Function,
}) {

    // Hooks
    const firebase_map_hook = useFirebaseMap()

    // Contexts
    const current_scale_context = useContext(scale_context)
    const data_context = useContext(DataContext)

    // Refs
    const ref_html_canvas = useRef<HTMLCanvasElement>(null)
    const ref_html_canvas_container = useRef<HTMLDivElement>(null)
    const is_after_first_map_draw = useRef<Boolean>(false)

    // Constants
    const CANVAS_ID = "canvas_id"
    const matrix = data_context.matrix
    const canvas_height_pixels = calculate_canvas_height(current_scale_context.hexagon_edge_pixels, current_scale_context.num_hexes_tall)
    const canvas_width_pixels = calculate_canvas_width(current_scale_context.hexagon_edge_pixels, current_scale_context.num_hexes_wide)

    // Variables
    let is_canvas_too_large = false

    if (canvas_height_pixels > limits.canvas_height_pixels || canvas_width_pixels > limits.canvas_width_pixels) {
        is_canvas_too_large = true
    }

    function get_context() {
        return (ref_html_canvas.current as HTMLCanvasElement).getContext("2d") as CanvasRenderingContext2D
    }

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

                        matrix.remove_paths(props.ref_clicked_hexagon.current)

                        hexagon.paint()

                        const neighbor_hexes = matrix.get_all_neighbors(props.ref_clicked_hexagon.current)

                        neighbor_hexes.forEach((hex) => {hex.paint()})

                        firebase_map_hook.save_hexagon_definitions([hexagon, ...neighbor_hexes])

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
        props.set_loading_state(true) // In case it isn't already (sometimes it is)

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
            props.set_loading_state(false)
        }
    }

    useEffect(() => {
        matrix.set_context(get_context())
        props.set_loading_state(true)

        // Create a listener that will populate fields whenever the firebase database changes
        // This does a initial load when it's created, so we won't don't need to do that separately
        // This is done here so that the map doesn't load unless they are on the map page
        const unsub = firebase_map_hook.create_listener(function(data: any) {
            const is_initial_load = (Object.keys(matrix.firebase_map_doc).length == 0)

            if (is_initial_load) {
                matrix.populate_matrix(data)
                if (!is_canvas_too_large) {
                    draw_map()
                    is_after_first_map_draw.current = true
                }
            }
            else {
                matrix.update_matrix_from_firebase_doc(data)
            }

        })

        // The value returned here is the "cleanup" function. This will unsubscribe the listener
        // so that we aren't getting firebase updates anymore once the hex map unmounts
        return unsub

    },[])

    // Anytime the scale context changes, we need to redraw the whole map
    useEffect(function() {
        if (is_after_first_map_draw.current) {
            matrix.resize(
                current_scale_context.hexagon_edge_pixels,
                current_scale_context.num_hexes_tall,
                current_scale_context.num_hexes_wide
            )
            draw_map()
        }
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