/*
  For logic related to geometry and figuring out where a shape's points are
*/

function get_hexagon_short_diagonal_length(edge_length: number) {
  return Math.round(Math.sqrt(3) * edge_length)
}

function get_hexagon_svg(hexagon_edge_pixels: number, stroke_color: string) {
  const edge = hexagon_edge_pixels
  const short_diagonal = get_hexagon_short_diagonal_length(hexagon_edge_pixels)
  const height = edge * 2
  const width = short_diagonal
  const points_string = [
    (width / 2).toString() + "," + "0",
    width.toString() + "," + (edge / 2).toString(),
    width.toString() + "," + (edge * 1.5).toString(),
    (width / 2).toString() + "," + height.toString(),
    "0" + "," + (edge * 1.5).toString(),
    "0" + "," + (edge / 2).toString(),
  ].join(" ")

  return <svg height={height} width={width}>
      <polygon
          points={points_string}
          stroke={stroke_color}
          strokeWidth="2"
          fillOpacity="0%"
      />
  </svg>
}

function get_hexagon_corner_points(center_x: number, center_y: number, edge_length: number) {
  const short_diagonal = get_hexagon_short_diagonal_length(edge_length)

  return [
    {x: center_x, y: center_y - edge_length}, // top peak
    {x: center_x + (short_diagonal / 2), y: center_y - (edge_length / 2)},
    {x: center_x + (short_diagonal / 2), y: center_y + (edge_length / 2)},
    {x: center_x, y: center_y + edge_length}, // bottom peak
    {x: center_x - (short_diagonal / 2), y: center_y + (edge_length / 2)},
    {x: center_x - (short_diagonal / 2), y: center_y - (edge_length / 2)},
  ]
}

function get_hexagon_edge_points(center_x: number, center_y: number, edge_length: number) {
  const short_diagonal = get_hexagon_short_diagonal_length(edge_length)
  return {
    top_left: {x: center_x - (short_diagonal / 4), y: center_y - edge_length*.75},
    top_right: {x: center_x + (short_diagonal / 4), y: center_y - (edge_length*.75)},
    right: {x: center_x + (short_diagonal / 2), y: center_y},
    bottom_right: {x: center_x + (short_diagonal / 4), y: center_y + edge_length*.75},
    bottom_left: {x: center_x - (short_diagonal / 4), y: center_y + (edge_length*.75)},
    left: {x: center_x - (short_diagonal / 2), y: center_y},
  }
}

export {
  get_hexagon_short_diagonal_length,
  get_hexagon_svg,
  get_hexagon_corner_points,
  get_hexagon_edge_points
}