// These are independent, stateless functions, just to move isolated computing into a separate location

import spacing from "../configs/spacing"
import type_hexagon_definition from "../types/type_hexagon_definition"
import colors from "../configs/colors"
import useFirebaseMap from "../hooks/use_firebase_map"
import feature_flags from "../configs/feature_flags"
import defaults from "../configs/defaults"

function get_short_diagonal_length(edge_length: number) {
    return Math.round(Math.sqrt(3) * edge_length)
}

function get_long_diagonal_length(edge_length: number) {
    return edge_length * 2
}

function get_peak_height(edge_length: number) {
    return edge_length / 2
}

function get_center_point(hexagon_definition: type_hexagon_definition, edge_length: number) {
    const row_number = hexagon_definition.row_number
    const column_number = hexagon_definition.column_number
    const short_diagonal = get_short_diagonal_length(edge_length)
    const center_x = (row_number % 2 == 1 ? short_diagonal / 2 : 0) + short_diagonal / 2 + short_diagonal * (column_number - 1) + spacing.hex_grid_side_border
    const center_y = spacing.hex_grid_top_border + edge_length + (edge_length*1.5) * (row_number - 1)

    return [center_x, center_y]
}

function get_hexagon_points(hexagon_definition: type_hexagon_definition, edge_length: number) {
    const short_diagonal = get_short_diagonal_length(edge_length)
    const [center_x, center_y] = get_center_point(hexagon_definition, edge_length)

    return [
        {x: center_x, y: center_y - edge_length}, // top peak
        {x: center_x + (short_diagonal / 2), y: center_y - (edge_length / 2)},
        {x: center_x + (short_diagonal / 2), y: center_y + (edge_length / 2)},
        {x: center_x, y: center_y + edge_length}, // bottom peak
        {x: center_x - (short_diagonal / 2), y: center_y + (edge_length / 2)},
        {x: center_x - (short_diagonal / 2), y: center_y - (edge_length / 2)},
    ]
}

function get_hexagon_edge_points(hexagon_definition: type_hexagon_definition, edge_length: number) {
    const short_diagonal = get_short_diagonal_length(edge_length)
    const [center_x, center_y] = get_center_point(hexagon_definition, edge_length)

    return {
        top_left: {x: center_x - (short_diagonal / 4), y: center_y - edge_length*.75},
        top_right: {x: center_x + (short_diagonal / 4), y: center_y - (edge_length*.75)},
        right: {x: center_x + (short_diagonal / 2), y: center_y},
        bottom_right: {x: center_x + (short_diagonal / 4), y: center_y + edge_length*.75},
        bottom_left: {x: center_x - (short_diagonal / 4), y: center_y + (edge_length*.75)},
        left: {x: center_x - (short_diagonal / 2), y: center_y},
    }
}

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

function get_canvas_path_2d(points: {x: number, y: number}[]) {

    const path = new Path2D()
    path.moveTo(points[0].x, points[0].y)
    for (let index = 1; index < points.length; index++) {
        path.lineTo(points[index].x, points[index].y)
    }
    path.closePath()
    return path
}

function get_canvas_height(edge_length: number, num_rows: number) {
    return num_rows * (edge_length * 1.5) + spacing.hex_grid_top_border + edge_length/2 + spacing.hex_grid_bottom_border
}

function get_canvas_width(edge_length: number, num_columns: number) {
    const short_diagonal = get_short_diagonal_length(edge_length)
    return spacing.hex_grid_side_border*2 + short_diagonal/2 + short_diagonal*num_columns
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

function paint_background(
    hexagon_definition: type_hexagon_definition,
    context: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D,
    edge_length: number,
) {
    const path_2d = hexagon_math.get_canvas_path_2d(get_hexagon_points(hexagon_definition, edge_length))
    context.fillStyle = hexagon_definition.background_color_hexidecimal
    context.fill(path_2d)
    context.lineWidth = defaults.hexagon_stroke_width
    context.strokeStyle = colors.disabled
    context.stroke(path_2d)
}

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

function paint_civ_text(
    hexagon_definition: type_hexagon_definition,
    context: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D,
    edge_length: number,
) {
    if (hexagon_definition.town_size > 0) {
        context.fillStyle = colors.white
        context.textAlign = "center"
        context.textBaseline = "middle"
        const font_px = edge_length / 2
        context.font = font_px + "px sans-serif"
        const [center_x, center_y] = get_center_point(hexagon_definition, edge_length)
        context.fillText(
            hexagon_definition.town_size.toString() + hexagon_definition.race.toString() + hexagon_definition.affinity.toString(),
            center_x,
            center_y
        )
    }
}

function paint_line(
    context: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D,
    start_x:number,
    start_y:number,
    end_x:number,
    end_y:number,
    color: string,
    is_dashed: boolean,
    edge_length: number
) {
    context.setLineDash([])
    if (is_dashed) {
        context.setLineDash([edge_length/4])
    }
    context.strokeStyle = color
    context.lineCap = "butt"
    context.lineWidth = 10
    context.fillStyle = color
    context.beginPath()
    context.arc(start_x, start_y, 5, 0, 2*Math.PI)
    context.fill()
    context.beginPath()
    context.moveTo(start_x, start_y)
    context.lineTo(end_x, end_y)
    context.stroke()

}

function paint_paths(
    hexagon_definition: type_hexagon_definition,
    context: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D,
    edge_length: number
) {
    const [center_x, center_y] = get_center_point(hexagon_definition, edge_length)
    const edge_points = get_hexagon_edge_points(hexagon_definition, edge_length)
    if (hexagon_definition.is_top_left_river) {paint_line(context, center_x, center_y, edge_points.top_left.x, edge_points.top_left.y, colors.ocean, false, edge_length)}
    if (hexagon_definition.is_top_right_river) {paint_line(context, center_x, center_y, edge_points.top_right.x, edge_points.top_right.y, colors.ocean, false, edge_length)}
    if (hexagon_definition.is_right_river) {paint_line(context, center_x, center_y, edge_points.right.x, edge_points.right.y, colors.ocean, false, edge_length)}
    if (hexagon_definition.is_bottom_right_river) {paint_line(context, center_x, center_y, edge_points.bottom_right.x, edge_points.bottom_right.y, colors.ocean, false, edge_length)}
    if (hexagon_definition.is_bottom_left_river) {paint_line(context, center_x, center_y, edge_points.bottom_left.x, edge_points.bottom_left.y, colors.ocean, false, edge_length)}
    if (hexagon_definition.is_left_river) {paint_line(context, center_x, center_y, edge_points.left.x, edge_points.left.y, colors.ocean, false, edge_length)}

    if (hexagon_definition.is_top_left_road) {paint_line(context, center_x, center_y, edge_points.top_left.x, edge_points.top_left.y, colors.road, (hexagon_definition.is_top_left_river ? true : false), edge_length)}
    if (hexagon_definition.is_top_right_road) {paint_line(context, center_x, center_y, edge_points.top_right.x, edge_points.top_right.y, colors.road, (hexagon_definition.is_top_right_river ? true : false), edge_length)}
    if (hexagon_definition.is_right_road) {paint_line(context, center_x, center_y, edge_points.right.x, edge_points.right.y, colors.road, (hexagon_definition.is_right_river ? true : false), edge_length)}
    if (hexagon_definition.is_bottom_right_road) {paint_line(context, center_x, center_y, edge_points.bottom_right.x, edge_points.bottom_right.y, colors.road, (hexagon_definition.is_bottom_right_river ? true : false), edge_length)}
    if (hexagon_definition.is_bottom_left_road) {paint_line(context, center_x, center_y, edge_points.bottom_left.x, edge_points.bottom_left.y, colors.road, (hexagon_definition.is_bottom_left_river ? true : false), edge_length)}
    if (hexagon_definition.is_left_road) {paint_line(context, center_x, center_y, edge_points.left.x, edge_points.left.y, colors.road, (hexagon_definition.is_left_river ? true : false), edge_length)}
}

function paint_circle(
    hexagon_definition: type_hexagon_definition,
    context: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D,
    edge_length: number,
    color: string,
) {
    context.fillStyle = color
    const [center_x, center_y] = get_center_point(hexagon_definition, edge_length)
    context.beginPath()
    context.arc(center_x, center_y, edge_length/2, 0, 2*Math.PI)
    context.fill()
}

function paint_hexagon(
    hexagon_definition: type_hexagon_definition,
    context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    edge_length: number,
) {
    paint_background(hexagon_definition, context, edge_length)
    paint_paths(hexagon_definition, context, edge_length)
    paint_icon(hexagon_definition, context, edge_length)
    paint_civ_text(hexagon_definition, context, edge_length)
}

// =============================================================================
// Neighboring hexes
// =============================================================================

function is_neighboring_hex(start_hex_def: type_hexagon_definition, target_hex_def: type_hexagon_definition) {

    const neighboring_columns = [start_hex_def.column_number]

    if (start_hex_def.row_number == target_hex_def.row_number || start_hex_def.row_number % 2 == 1) {
        neighboring_columns.push(start_hex_def.column_number + 1)
    }

    if (start_hex_def.row_number == target_hex_def.row_number || start_hex_def.row_number % 2 == 0) {
        neighboring_columns.push(start_hex_def.column_number - 1)
    }

    if (
        // (start_hex_def.row_number != target_hex_def.row_number || start_hex_def.column_number != target_hex_def.column_number) // Not the same hex
        Math.abs(start_hex_def.row_number - target_hex_def.row_number) < 2 // in a neighboring or same row
        && (
            neighboring_columns.includes(target_hex_def.column_number) // Neighboring column, adjusted for row offsets
        )
    ) {
        return true
    }
    else {
        return false
    }
}

function add_path_definition(start_hex_def: type_hexagon_definition, target_hex_def: type_hexagon_definition, path_id: string) {
    if (start_hex_def.row_number == target_hex_def.row_number && start_hex_def.column_number == target_hex_def.column_number) {
        return
    }

    // Left and Right Neighbors
    if (start_hex_def.row_number == target_hex_def.row_number) {
        if (target_hex_def.column_number > start_hex_def.column_number) {
            if (path_id == "river") {
                start_hex_def.is_right_river = true
                target_hex_def.is_left_river = true
            }
            else if (path_id == "road") {
                start_hex_def.is_right_road = true
                target_hex_def.is_left_road = true
            }
        }
        else {
            if (path_id == "river") {
                start_hex_def.is_left_river = true
                target_hex_def.is_right_river = true
            }
            else if (path_id == "road") {
                start_hex_def.is_left_road = true
                target_hex_def.is_right_road = true
            }
        }
    }
    // Upwards neighbors
    else if (target_hex_def.row_number < start_hex_def.row_number) {
        if (start_hex_def.row_number % 2 == 1) {
            // Top Left Neighbor of odd rows
            if (target_hex_def.column_number == start_hex_def.column_number) {
                if (path_id == "river") {
                    start_hex_def.is_top_left_river = true
                    target_hex_def.is_bottom_right_river = true
                }
                else if (path_id == "road") {
                    start_hex_def.is_top_left_road = true
                    target_hex_def.is_bottom_right_road = true
                }
            }
            // Top right of odd rows
            else {
                if (path_id == "river") {
                    start_hex_def.is_top_right_river = true
                    target_hex_def.is_bottom_left_river = true
                }
                else if (path_id == "road") {
                    start_hex_def.is_top_right_road = true
                    target_hex_def.is_bottom_left_road = true
                }
            }
        }
        else {
            // Top Right Neighbor of even rows
            if (target_hex_def.column_number == start_hex_def.column_number) {
                if (path_id == "river") {
                    start_hex_def.is_top_right_river = true
                    target_hex_def.is_bottom_left_river = true
                }
                else if (path_id == "road") {
                    start_hex_def.is_top_right_road = true
                    target_hex_def.is_bottom_left_road = true
                }
            }
            // top left of even rows
            else {
                if (path_id == "river") {
                    start_hex_def.is_top_left_river = true
                    target_hex_def.is_bottom_right_river = true
                }
                else if (path_id == "road") {
                    start_hex_def.is_top_left_road = true
                    target_hex_def.is_bottom_right_road = true
                }
            }
        }
    }
    // Downwards neighbors
    else {
        if (start_hex_def.row_number % 2 == 1) {
            // Bottom Left Neighbor of odd rows
            if (target_hex_def.column_number == start_hex_def.column_number) {
                if (path_id == "river") {
                    start_hex_def.is_bottom_left_river = true
                    target_hex_def.is_top_right_river = true
                }
                else if (path_id == "road") {
                    start_hex_def.is_bottom_left_road = true
                    target_hex_def.is_top_right_road = true
                }
            }
            // Bottom right of odd rows
            else {
                if (path_id == "river") {
                    start_hex_def.is_bottom_right_river = true
                    target_hex_def.is_top_left_river = true
                }
                else if (path_id == "road") {
                    start_hex_def.is_bottom_right_road = true
                    target_hex_def.is_top_left_road = true
                }
            }
        }
        else {
            // Bottom Right Neighbor of even rows
            if (target_hex_def.column_number == start_hex_def.column_number) {
                if (path_id == "river") {
                    start_hex_def.is_bottom_right_river = true
                    target_hex_def.is_top_left_river = true
                }
                else if (path_id == "road") {
                    start_hex_def.is_bottom_right_road = true
                    target_hex_def.is_top_left_road = true
                }
            }
            // Bottom left of even rows
            else {
                if (path_id == "river") {
                    start_hex_def.is_bottom_left_river = true
                    target_hex_def.is_top_right_river = true
                }
                else if (path_id == "road") {
                    start_hex_def.is_bottom_left_road = true
                    target_hex_def.is_top_right_road = true
                }
            }
        }
    }
}

function get_default_hexagon_definition() {
    const default_definition: type_hexagon_definition = {
        row_number: 1,
        column_number: 1,
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

    return default_definition
}

function get_hexagon_definition_key(row_number: number, column_number: number) {
    const PAD_LENGTH = 3
    const PAD_STRING = "0"
    const row_string = row_number.toString().padStart(PAD_LENGTH, PAD_STRING)
    const column_string = column_number.toString().padStart(PAD_LENGTH, PAD_STRING)
    const field_key = row_string + "_" + column_string
    return field_key
}

function get_starting_hexagon_definitions(firebase_map_data: {[index: string]: string}) {
    const hexagon_definitions = []

    const num_rows = parseInt(firebase_map_data.height)
    const num_columns = parseInt(firebase_map_data.width)

    for (let row_number = 1; row_number <= num_rows; row_number++) {
        for (let column_number = 1; column_number <= num_columns; column_number++) {

            const field_key = get_hexagon_definition_key(row_number, column_number)

            const encoded_hexagon_definition = firebase_map_data[field_key]

            const hexagon_definition = get_default_hexagon_definition()

            if (encoded_hexagon_definition != undefined) {
                replace_with_decoded_hexagon_definition(field_key, encoded_hexagon_definition, hexagon_definition)
            }
            else {
                hexagon_definition.row_number = row_number
                hexagon_definition.column_number = column_number
            }

            hexagon_definitions.push(hexagon_definition)
        }
    }

    return hexagon_definitions
}

function get_encoded_hexagon_definition(decoded_hexagon_definition: type_hexagon_definition) {
    return decoded_hexagon_definition.background_color_hexidecimal + "_"
        + (decoded_hexagon_definition.is_top_left_river ? 1 : 0) + "_"
        + (decoded_hexagon_definition.is_top_right_river ? 1 : 0) + "_"
        + (decoded_hexagon_definition.is_right_river ? 1 : 0) + "_"
        + (decoded_hexagon_definition.is_bottom_right_river ? 1 : 0) + "_"
        + (decoded_hexagon_definition.is_bottom_left_river ? 1 : 0) + "_"
        + (decoded_hexagon_definition.is_left_river ? 1 : 0) + "_"
        + (decoded_hexagon_definition.is_top_left_road ? 1 : 0) + "_"
        + (decoded_hexagon_definition.is_top_right_road ? 1 : 0) + "_"
        + (decoded_hexagon_definition.is_right_road ? 1 : 0) + "_"
        + (decoded_hexagon_definition.is_bottom_right_road ? 1 : 0) + "_"
        + (decoded_hexagon_definition.is_bottom_left_road ? 1 : 0) + "_"
        + (decoded_hexagon_definition.is_left_road ? 1 : 0) + "_"
        + decoded_hexagon_definition.town_size + "_"
        + decoded_hexagon_definition.affinity + "_"
        + decoded_hexagon_definition.race + "_"
        + decoded_hexagon_definition.icon_name
}

function replace_with_decoded_hexagon_definition(definition_key: string, encoded_hexagon_definition: string, hexagon_definition: type_hexagon_definition) {
    const split_array = encoded_hexagon_definition.split("_")
    // const hexagon_definition = hexagon_math.get_default_hexagon_definition()
    const row_number = parseInt(definition_key.split("_")[0])
    const column_number = parseInt(definition_key.split("_")[1])
    hexagon_definition.row_number = row_number
    hexagon_definition.column_number = column_number
    hexagon_definition.background_color_hexidecimal = split_array[0]
    hexagon_definition.is_top_left_river = (split_array[1] == "1" ? true : false)
    hexagon_definition.is_top_right_river = (split_array[2] == "1" ? true : false)
    hexagon_definition.is_right_river = (split_array[3] == "1" ? true : false)
    hexagon_definition.is_bottom_right_river = (split_array[4] == "1" ? true : false)
    hexagon_definition.is_bottom_left_river = (split_array[5] == "1" ? true : false)
    hexagon_definition.is_left_river = (split_array[6] == "1" ? true : false)
    hexagon_definition.is_top_left_road = (split_array[7] == "1" ? true : false)
    hexagon_definition.is_top_right_road = (split_array[8] == "1" ? true : false)
    hexagon_definition.is_right_road = (split_array[9] == "1" ? true : false)
    hexagon_definition.is_bottom_right_road = (split_array[10] == "1" ? true : false)
    hexagon_definition.is_bottom_left_road = (split_array[11] == "1" ? true : false)
    hexagon_definition.is_left_road = (split_array[12] == "1" ? true : false)
    hexagon_definition.town_size = parseInt(split_array[13])
    hexagon_definition.affinity = parseInt(split_array[14])
    hexagon_definition.race = parseInt(split_array[15])
    hexagon_definition.icon_name = split_array[16]
    return hexagon_definition
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

// =============================================================================
// Final Return
// =============================================================================

const hexagon_math = {
    get_short_diagonal_length,
    get_long_diagonal_length,
    get_peak_height,
    get_hexagon_points,
    get_canvas_path_2d,
    get_canvas_height,
    get_canvas_width,
    get_center_point,
    get_house_points,
    paint_hexagon,
    is_neighboring_hex,
    paint_circle,
    add_path_definition,
    get_default_hexagon_definition,
    get_starting_hexagon_definitions,
    get_hexagon_definition_key,
    get_encoded_hexagon_definition,
    get_changed_hexagon_definitions,
}

export default hexagon_math