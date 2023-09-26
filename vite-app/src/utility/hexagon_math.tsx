import spacing from "../configs/spacing"

function get_short_diagonal_length(edge_length: number) {
    return Math.round(Math.sqrt(3) * edge_length)
}

function get_long_diagonal_length(edge_length: number) {
    return edge_length * 2
}

function get_peak_height(edge_length: number) {
    return edge_length / 2
}

function get_hexagon_points(row_number: number, column_number: number, edge_length: number) {
    const short_diagonal = get_short_diagonal_length(edge_length)

    const center_x = (row_number % 2 == 1 ? short_diagonal / 2 : 0) + short_diagonal / 2 + short_diagonal * (column_number - 1) + spacing.hex_grid_side_border
    const center_y = spacing.hex_grid_top_border + edge_length + (edge_length*1.5) * (row_number - 1)

    return [
        {x: center_x, y: center_y - edge_length}, // top peak
        {x: center_x + (short_diagonal / 2), y: center_y - (edge_length / 2)},
        {x: center_x + (short_diagonal / 2), y: center_y + (edge_length / 2)},
        {x: center_x, y: center_y + edge_length}, // bottom peak
        {x: center_x - (short_diagonal / 2), y: center_y + (edge_length / 2)},
        {x: center_x - (short_diagonal / 2), y: center_y - (edge_length / 2)},
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

function get_fabric_points(edge_length: number, row_number: number, column_number: number) {

    const short_diagonal_length = get_short_diagonal_length(edge_length)
    const peak_height = get_peak_height(edge_length)
    const long_diagonal_length = get_long_diagonal_length(edge_length)

    const x_offset = short_diagonal_length * (column_number - 1) + spacing.hex_grid_side_border + (row_number % 2 == 1 ? short_diagonal_length / 2 : 0)
    const y_offset = (edge_length + peak_height) * (row_number - 1) + 65

    return {
        center: {x: (short_diagonal_length / 2 + x_offset), y: (edge_length / 2 + y_offset)},
        top_left: {x: x_offset, y: y_offset},
        top_mid: {x: (short_diagonal_length / 2 + x_offset), y: ((peak_height * -1) + y_offset)},
        top_right: {x: (short_diagonal_length + x_offset), y: y_offset},
        bottom_right: {x: (short_diagonal_length + x_offset), y: (edge_length + y_offset)},
        bottom_mid: {x: (short_diagonal_length / 2 + x_offset), y: ((edge_length + peak_height) + y_offset)},
        bottom_left: {x: x_offset, y: ((edge_length) + y_offset)},
        top_left_edge: {x: (short_diagonal_length / 4 + x_offset), y: ((peak_height / 2) * -1 + y_offset)},
        top_right_edge: {x: (short_diagonal_length * .75 + x_offset), y: ((peak_height / 2) * -1 + y_offset)},
        right_edge: {x: (short_diagonal_length + x_offset), y: (edge_length / 2 + y_offset)},
        bottom_right_edge: {x: (short_diagonal_length * .75 + x_offset), y: ((edge_length + peak_height / 2) + y_offset)},
        bottom_left_edge: {x: (short_diagonal_length / 4 + x_offset), y: ((edge_length + peak_height / 2) + y_offset)},
        left_edge: {x: x_offset, y: (edge_length / 2 + y_offset)},
    }
}

// function build_hexagon_definitions(edge_length: number, num_rows: number, num_columns: number) {

// }

const hexagon_math = {
    get_short_diagonal_length,
    get_long_diagonal_length,
    get_peak_height,
    // get_points,
    // get_fabric_points,
    get_hexagon_points,
    get_canvas_path_2d,
    get_canvas_height,
    get_canvas_width,
}

export default hexagon_math