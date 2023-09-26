import type_hexagon_definition from "../../types/type_hexagon_definition"
import { useEffect, memo, useRef, MutableRefObject, MouseEvent } from "react"
import hexagon_math from "../../utility/hexagon_math"
import worker_url from "../../worker/worker?worker&url"

export default memo(function HexGrid(props: {
    edge_length: number,
    set_is_show_loading: Function,
    loading_function_ref: MutableRefObject<Function>,
    num_rows: number,
    num_columns: number,
    hexagon_definitions_ref: MutableRefObject<type_hexagon_definition[]>,
    // fabric_hook: type_fabric_hook
}) {
    // console.log("hexgrid rerender")

    const canvas_ref = useRef<HTMLCanvasElement>(null)
    const canvas_container_ref = useRef<HTMLDivElement>(null)

    const canvas_height = hexagon_math.get_canvas_height(props.edge_length, props.num_rows)
    const canvas_width = hexagon_math.get_canvas_width(props.edge_length, props.num_columns)

    // function draw_map() {
        // console.log("drawing_map")

        // context.clearRect(0, 0, canvas.width, canvas.height)

        // const bitmap = offscreen_canvas.transferToImageBitmap()
    // }

    function handle_map_click(event: MouseEvent) {
        // console.log(canvas_ref.current)
        // const canvas = (canvas_ref.current as unknown as HTMLCanvasElement)
        // console.log(context)

        if (!canvas_container_ref.current || !canvas_ref.current) {
            return
        }

        const context = canvas_ref.current.getContext("2d") as CanvasRenderingContext2D

        // console.log(event.clientX + " " + event.clientY)

        // console.log(canvas_container_ref.current.offsetTop + " " + canvas_container_ref.current.offsetLeft)

        const offset_x = canvas_container_ref.current.scrollLeft
        const offset_y = canvas_container_ref.current.scrollTop

        // console.log(offset_x, " ", offset_y)

        // context.beginPath()
        // context.moveTo(offset_x, offset_y + 100)
        // context.lineTo(offset_x, offset_y)
        // context.lineTo(offset_x + 100, offset_y)
        // context.closePath()
        // context.fill()

        const clicked_x = event.clientX + offset_x
        const clicked_y = event.clientY + offset_y

        // console.log(clicked_x + " " + clicked_y)

        for (const hexagon_index in props.hexagon_definitions_ref.current) {
            const hexagon_definition = props.hexagon_definitions_ref.current[hexagon_index]

            if (context.isPointInPath(hexagon_math.get_canvas_path_2d(hexagon_definition.points), clicked_x, clicked_y)) {
                console.log(hexagon_definition.row_number.toString() + " " + hexagon_definition.column_number.toString())
            }
        }
    }

    useEffect(() => {
        // props.loading_function_ref.current = draw_map
        draw_map()
        // console.log('starting loading')
        // props.set_is_show_loading(true)
    },[props.edge_length, props.num_rows, props.num_columns])

    function draw_map() {
        props.set_is_show_loading(true)
        // const worker = new Worker(new URL("../../worker/worker.ts", import.meta.url), {type: "module"})
        const worker = new Worker(worker_url, {type: "module"})
        setTimeout(() => {
            worker.postMessage({edge_length: props.edge_length, num_rows: props.num_rows, num_columns: props.num_columns})
        }, 500)
        worker.onmessage = (message) => {
            // const context = (canvas_ref.current as HTMLCanvasElement).getContext("bitmaprenderer") as ImageBitmapRenderingContext
            // context.transferFromImageBitmap(message.data.bitmap)
            const context = (canvas_ref.current as HTMLCanvasElement).getContext("2d") as CanvasRenderingContext2D
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
            <canvas
                // style={{

                //     overflow: "scroll",
                // }}
                ref={canvas_ref}
                id="canvas"
                height={canvas_height}
                width={canvas_width}
            ></canvas>
        </div>
    )
})