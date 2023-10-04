// These are independent, stateless functions, just to move isolated computing into a separate location

import spacing from "../configs/spacing"
import type_hexagon_definition from "../types/type_hexagon_definition"
import colors from "../configs/colors"

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
    const row_number = hexagon_definition.row_number
    const column_number = hexagon_definition.column_number

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
    const corner_points = get_hexagon_points(hexagon_definition, edge_length)
    const path_2d = hexagon_math.get_canvas_path_2d(get_hexagon_points(hexagon_definition, edge_length))
    context.fillStyle = hexagon_definition.background_color_hexidecimal
    context.fill(path_2d)
    context.lineWidth = spacing.hexagon_stroke_width
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

function paint_circle(
    hexagon_definition: type_hexagon_definition,
    context: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D,
    edge_length: number,
) {
    context.fillStyle = colors.ocean
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
    // paint_circle(hexagon_definition, context, edge_length)
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
}

export default hexagon_math