import colors from "../configs/colors"
import { get_hexagon_short_diagonal_length, get_hexagon_edge_points, get_hexagon_corner_points } from "../helpers/geometry"
import spacing from "../configs/spacing"
import { paint_hexagon, paint_line, get_2d_path, paint_circle } from "../helpers/canvas"

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

  edge_pixels: number
  canvas_context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | undefined
  center_x: number
  center_y: number

  constructor(
    row_number: number,
    column_number: number,
    edge_pixels: number,
    canvas_context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | undefined
  ) {
    // if (row_number && column_number) {
    this.row_number = row_number
    this.column_number = column_number
    this.edge_pixels = edge_pixels
    this.canvas_context = canvas_context

    const short_diagonal = get_hexagon_short_diagonal_length(this.edge_pixels)
    const center_x = (this.row_number % 2 == 1 ? short_diagonal / 2 : 0) + short_diagonal / 2 + short_diagonal * (this.column_number - 1) + spacing.hex_grid_side_border
    const center_y = spacing.hex_grid_top_border + this.edge_pixels + (this.edge_pixels*1.5) * (this.row_number - 1)

    this.center_x = center_x
    this.center_y = center_y
    // }
    // else if (firebase_hex_key && firebase_hex_data) {

    //   this.row_number = parseInt(firebase_hex_key.split("_")[0])
    //   this.column_number = parseInt(firebase_hex_key.split("_")[1])

    //   this.populate_from_firebase_hex_data(firebase_hex_data)
    // }
    // else {
    //   this.row_number = 0
    //   this.column_number = 0
    // }
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

  contains_point(point_x: number, point_y: number) {
    let return_val = false

    if (this.canvas_context && this.canvas_context.isPointInPath(
      get_2d_path(
        get_hexagon_corner_points(
          this.center_x,
          this.center_y,
          this.edge_pixels)
      ),
      point_x,
      point_y
    )) {
      return_val = true
    }

    return return_val
  }

  paint() {
    if (!this.canvas_context) {
      return
    }

    /* ---------------------------- background color ---------------------------- */
    paint_hexagon(
      this.canvas_context,
      this.edge_pixels,
      this.center_x,
      this.center_y,
      this.background_color_hexidecimal
    )

    /* ---------------------------------- paths --------------------------------- */
    const edge_points = get_hexagon_edge_points(this.center_x, this.center_y, this.edge_pixels)

    if (this.is_top_left_river) {paint_line(this.canvas_context, this.center_x, this.center_y, edge_points.top_left.x, edge_points.top_left.y, colors.ocean, false, [this.edge_pixels/4])}
    if (this.is_top_right_river) {paint_line(this.canvas_context, this.center_x, this.center_y, edge_points.top_right.x, edge_points.top_right.y, colors.ocean, false, [this.edge_pixels/4])}
    if (this.is_right_river) {paint_line(this.canvas_context, this.center_x, this.center_y, edge_points.right.x, edge_points.right.y, colors.ocean, false, [this.edge_pixels/4])}
    if (this.is_bottom_right_river) {paint_line(this.canvas_context, this.center_x, this.center_y, edge_points.bottom_right.x, edge_points.bottom_right.y, colors.ocean, false, [this.edge_pixels/4])}
    if (this.is_bottom_left_river) {paint_line(this.canvas_context, this.center_x, this.center_y, edge_points.bottom_left.x, edge_points.bottom_left.y, colors.ocean, false, [this.edge_pixels/4])}
    if (this.is_left_river) {paint_line(this.canvas_context, this.center_x, this.center_y, edge_points.left.x, edge_points.left.y, colors.ocean, false, [this.edge_pixels/4])}

    if (this.is_top_left_road) {paint_line(this.canvas_context, this.center_x, this.center_y, edge_points.top_left.x, edge_points.top_left.y, colors.road, (this.is_top_left_river ? true : false), [this.edge_pixels/4])}
    if (this.is_top_right_road) {paint_line(this.canvas_context, this.center_x, this.center_y, edge_points.top_right.x, edge_points.top_right.y, colors.road, (this.is_top_right_river ? true : false), [this.edge_pixels/4])}
    if (this.is_right_road) {paint_line(this.canvas_context, this.center_x, this.center_y, edge_points.right.x, edge_points.right.y, colors.road, (this.is_right_river ? true : false), [this.edge_pixels/4])}
    if (this.is_bottom_right_road) {paint_line(this.canvas_context, this.center_x, this.center_y, edge_points.bottom_right.x, edge_points.bottom_right.y, colors.road, (this.is_bottom_right_river ? true : false), [this.edge_pixels/4])}
    if (this.is_bottom_left_road) {paint_line(this.canvas_context, this.center_x, this.center_y, edge_points.bottom_left.x, edge_points.bottom_left.y, colors.road, (this.is_bottom_left_river ? true : false), [this.edge_pixels/4])}
    if (this.is_left_road) {paint_line(this.canvas_context, this.center_x, this.center_y, edge_points.left.x, edge_points.left.y, colors.road, (this.is_left_river ? true : false), [this.edge_pixels/4])}

  }

  paint_temporary_circle(
    color: string
  ) {
    if (this.canvas_context) {
      paint_circle(
        this.canvas_context,
        this.edge_pixels / 2,
        this.center_x,
        this.center_y,
        color
      )
    }
  }

}

export default Hexagon