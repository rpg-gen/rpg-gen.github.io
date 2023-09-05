const HexagonMath = {
    convert_edge_to_long_diagonal,
    convert_edge_to_short_diagonal,
    convert_edge_to_point_height
};

function convert_edge_to_long_diagonal(edge_length) {
    return edge_length * 2;
};

function convert_edge_to_short_diagonal(edge_length) {
    return Math.sqrt(3) * edge_length;
};

function convert_edge_to_point_height(edge_length) {
    return (convert_edge_to_long_diagonal(edge_length) - edge_length) / 2;
};

export default HexagonMath;