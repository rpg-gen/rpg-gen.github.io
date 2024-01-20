// These are independent, stateless functions, just to move isolated computing into a separate location

import spacing from "../configs/spacing"
import type_hexagon_definition from "../types/type_hexagon_definition"
import colors from "../configs/colors"
import useFirebaseMap from "../hooks/use_firebase_map"
import feature_flags from "../configs/feature_flags"
import defaults from "../configs/defaults"
import Hexagon from "../classes/Hexagon"

function get_house_points(hexagon_definition: type_hexagon_definition, edge_length: number) {

    const short_diagonal = get_short_diagonal_length(edge_length)
    const [center_x, center_y] = get_center_point(hexagon_definition, edge_length)

    return [
        {x: center_x, y:  (center_y - (edge_length/1.5))}, // peak
        {x: center_x + short_diagonal / 2.5, y:  (center_y - edge_length / 5)},
        {x: center_x + short_diagonal / 3, y:  (center_y - edge_length / 5)},
        {x: center_x + short_diagonal / 3, y:  (center_y + edge_length / 2)},
        {x: center_x - short_diagonal / 3, y:  (center_y + edge_length / 2)},
        {x: center_x - short_diagonal / 3, y:  (center_y - edge_length / 5)},
        {x: center_x - short_diagonal / 2.5, y:  (center_y - edge_length / 5)},
    ]

}


// function get_points(edge_length: number, row_number: number, column_number: number) {

//     const short_diagonal_length = get_short_diagonal_length(edge_length)
//     const peak_height = get_peak_height(edge_length)
//     const long_diagonal_length = get_long_diagonal_length(edge_length)

//     const x_offset = short_diagonal_length * (column_number - 1) + spacing.hex_grid_side_border + (row_number % 2 == 1 ? short_diagonal_length / 2 : 0)
//     const y_offset = (edge_length + peak_height) * (row_number - 1) + spacing.hex_grid_top_border

//     return {
//         center: (short_diagonal_length / 2 + x_offset) + " " + (edge_length / 2 + y_offset),
//         top_left: x_offset + " " + y_offset,
//         top_mid: (short_diagonal_length / 2 + x_offset) + " " + ((peak_height * -1) + y_offset),
//         top_right: (short_diagonal_length + x_offset) + " " + y_offset,
//         bottom_right: (short_diagonal_length + x_offset) + " " + (edge_length + y_offset),
//         bottom_mid: (short_diagonal_length / 2 + x_offset) + " " + ((edge_length + peak_height) + y_offset),
//         bottom_left: x_offset + " " + ((edge_length) + y_offset),
//         top_left_edge: (short_diagonal_length / 4 + x_offset) + " " + ((peak_height / 2) * -1 + y_offset),
//         top_right_edge: (short_diagonal_length * .75 + x_offset) + " " + ((peak_height / 2) * -1 + y_offset),
//         right_edge: (short_diagonal_length + x_offset) + " " + (edge_length / 2 + y_offset),
//         bottom_right_edge: (short_diagonal_length * .75 + x_offset) + " " + ((edge_length + peak_height / 2) + y_offset),
//         bottom_left_edge: (short_diagonal_length / 4 + x_offset) + " " + ((edge_length + peak_height / 2) + y_offset),
//         left_edge: x_offset + " " + (edge_length / 2 + y_offset),
//     }
// }

// function get_fabric_points(edge_length: number, row_number: number, column_number: number) {

//     const short_diagonal_length = get_short_diagonal_length(edge_length)
//     const peak_height = get_peak_height(edge_length)
//     const long_diagonal_length = get_long_diagonal_length(edge_length)

//     const x_offset = short_diagonal_length * (column_number - 1) + spacing.hex_grid_side_border + (row_number % 2 == 1 ? short_diagonal_length / 2 : 0)
//     const y_offset = (edge_length + peak_height) * (row_number - 1) + 65

//     return {
//         center: {x: (short_diagonal_length / 2 + x_offset), y: (edge_length / 2 + y_offset)},
//         top_left: {x: x_offset, y: y_offset},
//         top_mid: {x: (short_diagonal_length / 2 + x_offset), y: ((peak_height * -1) + y_offset)},
//         top_right: {x: (short_diagonal_length + x_offset), y: y_offset},
//         bottom_right: {x: (short_diagonal_length + x_offset), y: (edge_length + y_offset)},
//         bottom_mid: {x: (short_diagonal_length / 2 + x_offset), y: ((edge_length + peak_height) + y_offset)},
//         bottom_left: {x: x_offset, y: ((edge_length) + y_offset)},
//         top_left_edge: {x: (short_diagonal_length / 4 + x_offset), y: ((peak_height / 2) * -1 + y_offset)},
//         top_right_edge: {x: (short_diagonal_length * .75 + x_offset), y: ((peak_height / 2) * -1 + y_offset)},
//         right_edge: {x: (short_diagonal_length + x_offset), y: (edge_length / 2 + y_offset)},
//         bottom_right_edge: {x: (short_diagonal_length * .75 + x_offset), y: ((edge_length + peak_height / 2) + y_offset)},
//         bottom_left_edge: {x: (short_diagonal_length / 4 + x_offset), y: ((edge_length + peak_height / 2) + y_offset)},
//         left_edge: {x: x_offset, y: (edge_length / 2 + y_offset)},
//     }
// }

function get_icon_points(hexagon_definition: type_hexagon_definition, edge_length: number, icon_name: string) {
    if (icon_name == "town") {
        return get_house_points(hexagon_definition, edge_length)
    }
    else {
        return [{x: 0, y: 0}] // Blank icon
    }
}

// function get_circle_points(hexagon_definition: type_hexagon_definition, edge_length: number) {

// }

// =============================================================================
// Canvas painting Functions
// =============================================================================

function paint_icon(
    hexagon_definition: type_hexagon_definition,
    context: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D,
    edge_length: number,
) {
    if (hexagon_definition.icon_name) {
        const path_2d = hexagon_math.get_canvas_path_2d(get_icon_points(hexagon_definition, edge_length, "town"))
        context.lineJoin = "round"
        context.lineWidth = 10
        context.fillStyle = colors.black
        context.strokeStyle = colors.black
        context.setLineDash([])
        context.stroke(path_2d)
        context.fill(path_2d)
    }
}

function paint_text(
    hexagon_definition: type_hexagon_definition,
    context: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D,
    edge_length: number,
) {
    // if (hexagon_definition.town_size > 0) {
    //     context.fillStyle = colors.white
    //     context.textAlign = "center"
    //     context.textBaseline = "middle"
    //     const font_px = edge_length / 2
    //     context.font = font_px + "px sans-serif"
    //     const [center_x, center_y] = get_center_point(hexagon_definition, edge_length)
    //     context.fillText(
    //         hexagon_definition.town_size.toString() + hexagon_definition.race.toString() + hexagon_definition.affinity.toString(),
    //         center_x,
    //         center_y
    //     )
    // }
    // /////
    // if (hexagon_definition.text)
}

function paint_hexagon(
    hexagon_definition: type_hexagon_definition,
    context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    edge_length: number,
) {
    paint_background(hexagon_definition, context, edge_length)
    paint_paths(hexagon_definition, context, edge_length)
    // paint_icon(hexagon_definition, context, edge_length)
    paint_text(hexagon_definition, context, edge_length)
}

function get_changed_hexagon_definitions(hexagon_definitions: type_hexagon_definition[], firebase_map_document: {[index: string]: string}) {
    const modified_hexagons = []
    for (let i = 0; i < hexagon_definitions.length; i++) {
        const hexagon_definition = hexagon_definitions[i]
        const local_string = get_encoded_hexagon_definition(hexagon_definition)
        const remote_key = get_hexagon_definition_key(hexagon_definition.row_number, hexagon_definition.column_number)
        const remote_string = firebase_map_document[remote_key]

        if (remote_string != undefined && local_string != remote_string) {
            // const remote_hexagon_definition = get_decoded_hexagon_definition(remote_key, remote_string)
            replace_with_decoded_hexagon_definition(remote_key, remote_string, hexagon_definition)
            modified_hexagons.push(hexagon_definition)
        }
    }

    return modified_hexagons
}
