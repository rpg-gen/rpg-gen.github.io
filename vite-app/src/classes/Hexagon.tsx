import colors from "../configs/colors"
import { get_hexagon_short_diagonal_length } from "../helpers/geometry"
import spacing from "../configs/spacing"
import { paint_hexagon } from "../helpers/canvas"

class Hexagon {
  row_number: number
  column_number: number

  background_color_hexidecimal: string = colors.white

  is_top_left_river: boolean = false
  is_top_right_river: boolean = false
  is_right_river: boolean = false
  is_bottom_right_river: boolean = false
  is_bottom_left_river: boolean = false
  is_left_river: boolean = false

  is_top_left_road: boolean = false
  is_top_right_road: boolean = false
  is_right_road: boolean = false
  is_bottom_right_road: boolean = false
  is_bottom_left_road: boolean = false
  is_left_road: boolean = false

  text: string = ""
  icon_name: string = ""

  constructor(row_number?: number, column_number?: number, firebase_hex_key?: string, firebase_hex_data?: string) {
    if (row_number && column_number) {
      this.row_number = row_number
      this.column_number = column_number
    }
    else if (firebase_hex_key && firebase_hex_data) {

      this.row_number = parseInt(firebase_hex_key.split("_")[0])
      this.column_number = parseInt(firebase_hex_key.split("_")[1])

      this.populate_from_firebase_hex_data(firebase_hex_data)
    }
    else {
      this.row_number = 0
      this.column_number = 0
    }
  }

  populate_from_firebase_hex_data(firebase_hex_data: string) {
    const split_array = firebase_hex_data.split("_")

    this.background_color_hexidecimal = split_array[0]
    this.is_top_left_river = (split_array[1] == "1" ? true : false)
    this.is_top_right_river = (split_array[2] == "1" ? true : false)
    this.is_right_river = (split_array[3] == "1" ? true : false)
    this.is_bottom_right_river = (split_array[4] == "1" ? true : false)
    this.is_bottom_left_river = (split_array[5] == "1" ? true : false)
    this.is_left_river = (split_array[6] == "1" ? true : false)
    this.is_top_left_road = (split_array[7] == "1" ? true : false)
    this.is_top_right_road = (split_array[8] == "1" ? true : false)
    this.is_right_road = (split_array[9] == "1" ? true : false)
    this.is_bottom_right_road = (split_array[10] == "1" ? true : false)
    this.is_bottom_left_road = (split_array[11] == "1" ? true : false)
    this.is_left_road = (split_array[12] == "1" ? true : false)
    this.text = split_array[13]
    this.icon_name = split_array[14]

  }

  get_firebase_hex_data() {
    return this.background_color_hexidecimal + "_"
        + (this.is_top_left_river ? 1 : 0) + "_"
        + (this.is_top_right_river ? 1 : 0) + "_"
        + (this.is_right_river ? 1 : 0) + "_"
        + (this.is_bottom_right_river ? 1 : 0) + "_"
        + (this.is_bottom_left_river ? 1 : 0) + "_"
        + (this.is_left_river ? 1 : 0) + "_"
        + (this.is_top_left_road ? 1 : 0) + "_"
        + (this.is_top_right_road ? 1 : 0) + "_"
        + (this.is_right_road ? 1 : 0) + "_"
        + (this.is_bottom_right_road ? 1 : 0) + "_"
        + (this.is_bottom_left_road ? 1 : 0) + "_"
        + (this.is_left_road ? 1 : 0) + "_"
        + this.text + "_"
        + this.icon_name
  }

  get_firebase_hex_key() {
    const PAD_LENGTH = 3
    const PAD_STRING = "0"
    const row_string = this.row_number.toString().padStart(PAD_LENGTH, PAD_STRING)
    const column_string = this.column_number.toString().padStart(PAD_LENGTH, PAD_STRING)
    const firebase_hex_key = row_string + "_" + column_string
    return firebase_hex_key
  }

  get_center_point(edge_length: number) {
    const short_diagonal = get_hexagon_short_diagonal_length(edge_length)
    const center_x = (this.row_number % 2 == 1 ? short_diagonal / 2 : 0) + short_diagonal / 2 + short_diagonal * (this.column_number - 1) + spacing.hex_grid_side_border
    const center_y = spacing.hex_grid_top_border + edge_length + (edge_length*1.5) * (this.row_number - 1)

    return {x: center_x, y: center_y}
  }

  paint(
    canvas_context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    hexagon_edge_pixels: number
  ) {
    const center = this.get_center_point(hexagon_edge_pixels)

    paint_hexagon(
      canvas_context,
      hexagon_edge_pixels,
      center.x,
      center.y,
      this.background_color_hexidecimal
    )

    
  }

}

export default Hexagon