
import hexagon_math from "../utility/hexagon_math"
import spacing from "../configs/spacing"
import type_hexagon_definition from "../types/type_hexagon_definition"
import colors from "../configs/colors"

// let currentTime = new Date().getTime();
// while (currentTime + 2000 >= new Date().getTime()) {}

const default_definitions = {
    background_color_hexidecimal: colors.white,
    is_top_left_river: false,
    is_top_right_river: false,
    is_right_river: false,
    is_bottom_right_river: false,
    is_bottom_left_river: false,
    is_left_river: false,
    is_top_left_road: false,
    is_top_right_road: false,
    is_right_road: false,
    is_bottom_right_road: false,
    is_bottom_left_road: false,
    is_left_road: false,
    town_size: 0,
}

onmessage = (message: MessageEvent) => {

    const edge_length = message.data.edge_length
    const num_rows = message.data.num_rows
    const num_columns = message.data.num_columns
    const hexagon_definitions: type_hexagon_definition[] = message.data.hexagon_definitions

    const canvas_height = hexagon_math.get_canvas_height(edge_length, num_rows)
    const canvas_width = hexagon_math.get_canvas_width(edge_length, num_columns)

    for (let row_number = 1; row_number <= num_rows; row_number++) {
        for (let column_number = 1; column_number <= num_rows; column_number++) {

            let is_definition_found = false

            const hexagon_points = hexagon_math.get_hexagon_points(row_number, column_number, edge_length)
            const [center_x, center_y] = hexagon_math.get_center_point(row_number, column_number, edge_length)

            for (let hexagon_definitions_index = 0; hexagon_definitions_index < hexagon_definitions.length; hexagon_definitions_index++) {
                const hexagon_definition = hexagon_definitions[hexagon_definitions_index]
                if (hexagon_definition.row_number == row_number && hexagon_definition.column_number == column_number) {
                    is_definition_found = true
                    hexagon_definition.points = hexagon_points
                    hexagon_definition.center_x = center_x
                    hexagon_definition.center_y = center_y
                    break
                }
            }

            if (!is_definition_found) {
                hexagon_definitions.push({
                    row_number: row_number,
                    column_number: column_number,
                    points: hexagon_math.get_hexagon_points(row_number, column_number, edge_length),
                    center_x: center_x,
                    center_y: center_y,
                    ...default_definitions
                })
            }
        }
    }

    const offscreen_canvas = new OffscreenCanvas(canvas_width, canvas_height) as OffscreenCanvas
    const offscreen_context = offscreen_canvas.getContext("2d") as OffscreenCanvasRenderingContext2D

    for (let hexagon_index = 0; hexagon_index < hexagon_definitions.length; hexagon_index++) {
        const hexagon_definition: type_hexagon_definition = hexagon_definitions[hexagon_index]
        // console.log("drawing " + hexagon_definition.row_number + " " + hexagon_definition.column_number)
        const path_2d = hexagon_math.get_canvas_path_2d(hexagon_definition.points)
        offscreen_context.fillStyle = hexagon_definition.background_color_hexidecimal
        offscreen_context.fill(path_2d)
        offscreen_context.lineWidth = spacing.hexagon_stroke_width
        offscreen_context.stroke(path_2d)
    }

    postMessage({
        bitmap: offscreen_canvas.transferToImageBitmap(),
        hexagon_definitions: hexagon_definitions
    })
}
