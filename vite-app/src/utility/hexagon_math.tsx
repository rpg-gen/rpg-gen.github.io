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

function get_points(edge_length: number, row_number: number, column_number: number) {

    const short_diagonal_length = get_short_diagonal_length(edge_length)
    const peak_height = get_peak_height(edge_length)
    const long_diagonal_length = get_long_diagonal_length(edge_length)

    const x_offset = short_diagonal_length * (column_number - 1) + spacing.hex_grid_side_border + (row_number % 2 == 1 ? short_diagonal_length / 2 : 0)
    const y_offset = (edge_length + peak_height) * (row_number - 1) + spacing.hex_grid_top_border

    return {
        center: (short_diagonal_length / 2 + x_offset) + " " + (edge_length / 2 + y_offset),
        top_left: x_offset + " " + y_offset,
        top_mid: (short_diagonal_length / 2 + x_offset) + " " + ((peak_height * -1) + y_offset),
        top_right: (short_diagonal_length + x_offset) + " " + y_offset,
        bottom_right: (short_diagonal_length + x_offset) + " " + (edge_length + y_offset),
        bottom_mid: (short_diagonal_length / 2 + x_offset) + " " + ((edge_length + peak_height) + y_offset),
        bottom_left: x_offset + " " + ((edge_length) + y_offset),
        top_left_edge: (short_diagonal_length / 4 + x_offset) + " " + ((peak_height / 2) * -1 + y_offset),
        top_right_edge: (short_diagonal_length * .75 + x_offset) + " " + ((peak_height / 2) * -1 + y_offset),
        right_edge: (short_diagonal_length + x_offset) + " " + (edge_length / 2 + y_offset),
        bottom_right_edge: (short_diagonal_length * .75 + x_offset) + " " + ((edge_length + peak_height / 2) + y_offset),
        bottom_left_edge: (short_diagonal_length / 4 + x_offset) + " " + ((edge_length + peak_height / 2) + y_offset),
        left_edge: x_offset + " " + (edge_length / 2 + y_offset),
    }
}


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

const hexagon_math = {
    get_short_diagonal_length,
    get_long_diagonal_length,
    get_peak_height,
    get_points,
    get_fabric_points
}

export default hexagon_math