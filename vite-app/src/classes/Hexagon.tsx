import colors from "../configs/colors"
import { get_hexagon_short_diagonal_length, get_hexagon_edge_points, get_hexagon_corner_points } from "../helpers/geometry"
import spacing from "../configs/spacing"
import { paint_hexagon, paint_line, get_2d_path, paint_circle } from "../helpers/canvas"
import enum_neighbor_type from "../types/enum_neighbor_type"
import type_path_dictionary from "../types/type_path_dictionary"
import paint_brushes from "../configs/paint_brushes"
import { paint_category } from "../types/type_paint_brush"

class Hexagon {
  row_number: number
  column_number: number

  background_color_hexidecimal: string = colors.white

  path_dictionaries = this.build_empty_path_dictionaries()

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
    this.row_number = row_number
    this.column_number = column_number
    this.edge_pixels = edge_pixels
    this.canvas_context = canvas_context

    const short_diagonal = get_hexagon_short_diagonal_length(this.edge_pixels)
    const center_x = (this.row_number % 2 == 1 ? short_diagonal / 2 : 0) + short_diagonal / 2 + short_diagonal * (this.column_number - 1) + spacing.hex_grid_side_border
    const center_y = spacing.hex_grid_top_border + this.edge_pixels + (this.edge_pixels*1.5) * (this.row_number - 1)

    this.center_x = center_x
    this.center_y = center_y
  }

  clear_paths_from_hex() {

  }

  get_attribute_index_array() {
    const attribute_array: String[] = []
    attribute_array.push('another_background_color_hexidecimal')
    // attribute_array.push(...Object.keys(this.river_dict).map((key) => ("is_" + key + "_river")))
    // attribute_array.push(...Object.keys(this.road_dict).map((key) => ("is_" + key + "_road")))
    // attribute_array.push('text')
    // attribute_array.push('icon_name')
    return attribute_array
  }

  // get_serialized_attribute_index(attribute_name: string) {
  //   let return_index = undefined

  //   switch (attribute_name) {
  //     case 'background_color_hexidecimal':

  //       break;
  //   }
  // }

  build_empty_path_dictionaries() {
    const path_brushes = Object.entries(paint_brushes).filter((brush) => {
      const brush_data = brush[1]
      return brush_data.paint_category == paint_category.path && brush_data.id != 'clear_path'
    })

    const path_dictionaries: {[index: string]: type_path_dictionary} = {}

    path_brushes.forEach((path_brush) => {
      path_dictionaries[path_brush[0]] = Object.fromEntries(Object.values(enum_neighbor_type).map((neighbor_type) => [neighbor_type, false])) as type_path_dictionary
    });

    return path_dictionaries
  }

  populate_from_firebase_hex_data(firebase_hex_data: string) {
    const split_array = firebase_hex_data.split("_")

    this.background_color_hexidecimal = split_array[0]

    // Object.keys(this.river_dict).sort().forEach(()

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
    
    const typesafe_canvas_context = this.canvas_context as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D

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

    Object.entries(this.path_dictionaries).forEach((path_dictionary_entry) => {
      const paint_brush_id = path_dictionary_entry[0]
      const path_dictionary = path_dictionary_entry[1]

      Object.values(enum_neighbor_type).forEach((neighbor_type) => {
        const edge_type = neighbor_type
        const is_path = path_dictionary[neighbor_type]
        const edge_point = edge_points[edge_type]
        const dash_array = [this.edge_pixels/4]
        let is_dashed = false

        if (paint_brush_id == 'road' && this.path_dictionaries.river[edge_type]) {
          is_dashed = true
        }

        if (is_path) {
          paint_line(
            typesafe_canvas_context,
            this.center_x,
            this.center_y,
            edge_point.x,
            edge_point.y,
            paint_brushes[paint_brush_id].hexidecimal_color,
            is_dashed,
            dash_array
          )
        }
      })
    })
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