function get_short_diagonal_length(edge_length: number) {
    return Math.round(Math.sqrt(3) * edge_length)
}

function get_long_diagonal_length(edge_length: number) {
    return edge_length * 2
}

function get_peak_height(edge_length: number) {
    return edge_length / 2
}

function get_points(edge_length: number) {
    const short_diagonal_length = get_short_diagonal_length(edge_length)
    const peak_height = get_peak_height(edge_length)

    return {
        center: short_diagonal_length / 2 + " " + edge_length / 2,
        top_left: "0" + " " + "0",
        top_mid: short_diagonal_length / 2 + " " + (peak_height * -1),
        top_right: short_diagonal_length + " " + "0",
        bottom_right: short_diagonal_length + " " + edge_length,
        bottom_mid: short_diagonal_length / 2 + " " + (edge_length + peak_height),
        bottom_left: "0" + " " + (edge_length),
        top_left_edge: short_diagonal_length / 4 + " " + (peak_height / 2) * -1,
        top_right_edge: short_diagonal_length * .75 + " " + (peak_height / 2) * -1,
        right_edge: short_diagonal_length + " " + edge_length / 2,
        bottom_right_edge: short_diagonal_length * .75 + " " + (edge_length + peak_height / 2),
        bottom_left_edge: short_diagonal_length / 4 + " " + (edge_length + peak_height / 2),
        left_edge: "0" + " " + edge_length / 2,
    }
}

const hexagon_math = {
    get_short_diagonal_length,
    get_long_diagonal_length,
    get_peak_height,
    get_points
}

export default hexagon_math