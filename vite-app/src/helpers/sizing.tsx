import { get_hexagon_short_diagonal_length } from "./geometry";
import spacing from "../configs/spacing";

function calculate_canvas_height(hexagon_edge_pixels: number, num_hexes_tall: number) {
  return num_hexes_tall * (hexagon_edge_pixels * 1.5) + spacing.hex_grid_top_border + hexagon_edge_pixels / 2 + spacing.hex_grid_bottom_border
}

function calculate_canvas_width(hexagon_edge_pixels: number, num_hexes_wide: number) {
  return spacing.hex_grid_side_border * 2 + get_hexagon_short_diagonal_length(hexagon_edge_pixels) / 2 + get_hexagon_short_diagonal_length(hexagon_edge_pixels) * num_hexes_wide
}

export { calculate_canvas_height, calculate_canvas_width}