import type_hexagon_definition from "../../types/type_hexagon_definition"
import { useEffect, memo, useRef, MutableRefObject, MouseEvent } from "react"
import hexagon_math from "../../utility/hexagon_math"
import worker_url from "../../worker/worker?worker&url"
import spacing from "../../configs/spacing"
import paint_brushes from "../../configs/paint_brushes"
import { paint_category } from "../../types/type_paint_brush"
import colors from "../../configs/colors"

export default memo(function HexGrid(props: {
    edge_length: number,
    set_is_show_loading: Function,
    num_rows: number,
    num_columns: number,
    hexagon_definitions_ref: MutableRefObject<type_hexagon_definition[]>,
    ref_paint_brush_id: MutableRefObject<string>
}) {
    const canvas_ref = useRef<HTMLCanvasElement>(null)
    const canvas_container_ref = useRef<HTMLDivElement>(null)

    const canvas_height = hexagon_math.get_canvas_height(props.edge_length, props.num_rows)
    const canvas_width = hexagon_math.get_canvas_width(props.edge_length, props.num_columns)

    let is_too_large: boolean = false

    if (canvas_height > spacing.canvas_pixel_limit || canvas_width > spacing.canvas_pixel_limit) {
        is_too_large = true
    }

    function paint_background(color_hexidecimal: string, hexagon_definition: type_hexagon_definition) {
        const context = get_canvas_context()
        const path_2d = hexagon_math.get_canvas_path_2d(hexagon_definition.points)
        context.fillStyle = color_hexidecimal
        context.fill(path_2d)
        context.lineWidth = spacing.hexagon_stroke_width
        context.stroke(path_2d)
        hexagon_definition.background_color_hexidecimal = color_hexidecimal
    }

    function paint_town(hexagon_definition: type_hexagon_definition) {
        const context = get_canvas_context()
        const house_points = hexagon_math.get_house_points(hexagon_definition.row_number, hexagon_definition.column_number, props.edge_length)
        const path_2d = hexagon_math.get_canvas_path_2d(house_points)
        // context.fill(path_2d)
        context.lineJoin = "round"
        context.lineWidth = 10
        context.fillStyle = colors.black
        context.stroke(path_2d)
        context.fill(path_2d)
    }

    function paint_civ_text(hexagon_definition: type_hexagon_definition) {
        const context = get_canvas_context()
        context.fillStyle = colors.white
        context.textAlign = "center"
        context.textBaseline = "middle"
        const font_px = props.edge_length / 2
        context.font = font_px + "px sans-serif"
        context.fillText("111", hexagon_definition.center_x, hexagon_definition.center_y)
    }

    function get_canvas_context() {
        return (canvas_ref.current as HTMLCanvasElement).getContext("2d") as CanvasRenderingContext2D
    }

    function handle_map_click(event: MouseEvent) {
        if (!canvas_container_ref.current || !canvas_ref.current) {
            return
        }

        const context = canvas_ref.current.getContext("2d") as CanvasRenderingContext2D

        const offset_x = canvas_container_ref.current.scrollLeft
        const offset_y = canvas_container_ref.current.scrollTop

        const clicked_x = event.clientX + offset_x
        const clicked_y = event.clientY + offset_y

        for (const hexagon_index in props.hexagon_definitions_ref.current) {
            const hexagon_definition = props.hexagon_definitions_ref.current[hexagon_index]

            if (context.isPointInPath(hexagon_math.get_canvas_path_2d(hexagon_definition.points), clicked_x, clicked_y)) {
                // const row_number = hexagon_definition.row_number
                // const column_number = hexagon_definition.column_number
                const paint_brush = paint_brushes[props.ref_paint_brush_id.current]

                if (paint_brush.paint_category == paint_category.background) {
                    paint_background(paint_brush.hexidecimal_color, hexagon_definition)
                }

                if (paint_brush.paint_category == paint_category.icon && paint_brush.id == "town") {
                    paint_town(hexagon_definition)
                    paint_civ_text(hexagon_definition)
                }
                // console.log(hexagon_definition.row_number.toString() + " " + hexagon_definition.column_number.toString())
                // console.log(props.ref_paint_brush_id.current)
            }
        }
    }

    useEffect(() => {
        if (!is_too_large) {draw_map()}
    },[props.edge_length, props.num_rows, props.num_columns])

    function draw_map() {
        props.set_is_show_loading(true)
        const worker = new Worker(worker_url, {type: "module"})
        setTimeout(() => {
            worker.postMessage({
                edge_length: props.edge_length,
                num_rows: props.num_rows,
                num_columns: props.num_columns,
                hexagon_definitions: props.hexagon_definitions_ref.current
            })
        }, 500)
        worker.onmessage = (message) => {
            const context = get_canvas_context()
            context.drawImage(message.data.bitmap, 0, 0)
            message.data.bitmap.close()
            props.hexagon_definitions_ref.current = message.data.hexagon_definitions
            props.set_is_show_loading(false)
        }
    }

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
            ref={canvas_container_ref}
            onClick={handle_map_click}
        >
            {
                !is_too_large
                ?
                    <canvas
                        ref={canvas_ref}
                        id="canvas"
                        height={canvas_height}
                        width={canvas_width}
                    ></canvas>
                :
                    <p style={{paddingTop: spacing.top_bar_height + "rem"}}>Canvas is too large</p>
            }

        </div>
    )
})