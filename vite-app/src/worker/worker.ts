
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
    affinity: 0,
    race: 0,
    icon_name: "",
}

onmessage = (message: MessageEvent) => {

    const edge_length = message.data.edge_length
    const num_rows = message.data.num_rows
    const num_columns = message.data.num_columns
    const hexagon_definitions: type_hexagon_definition[] = message.data.hexagon_definitions

    const canvas_height = hexagon_math.get_canvas_height(edge_length, num_rows)
    const canvas_width = hexagon_math.get_canvas_width(edge_length, num_columns)

    // Take the expected row and column counts and build out a full matrix
    // For any missing hexagon definitions, just use the default values defined in this file
    for (let row_number = 1; row_number <= num_rows; row_number++) {
        for (let column_number = 1; column_number <= num_rows; column_number++) {

            let is_definition_found = false

            for (let hexagon_definitions_index = 0; hexagon_definitions_index < hexagon_definitions.length; hexagon_definitions_index++) {
                const hexagon_definition = hexagon_definitions[hexagon_definitions_index]
                if (hexagon_definition.row_number == row_number && hexagon_definition.column_number == column_number) {
                    is_definition_found = true
                    break
                }
            }

            if (!is_definition_found) {
                hexagon_definitions.push({
                    row_number: row_number,
                    column_number: column_number,
                    ...default_definitions
                })
            }
        }
    }

    const offscreen_canvas = new OffscreenCanvas(canvas_width, canvas_height) as OffscreenCanvas
    const offscreen_context = offscreen_canvas.getContext("2d") as OffscreenCanvasRenderingContext2D

    for (let hexagon_index = 0; hexagon_index < hexagon_definitions.length; hexagon_index++) {
        const hexagon_definition: type_hexagon_definition = hexagon_definitions[hexagon_index]
        hexagon_math.paint_hexagon(hexagon_definition, offscreen_context, edge_length)
    }

    postMessage({
        bitmap: offscreen_canvas.transferToImageBitmap(),
        hexagon_definitions: hexagon_definitions // Return full matrix so editing each hex works, even if there were not data for them to start
    })
}
