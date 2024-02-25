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

  text: string = ""
  icon_name: string = ""

  firebase_serialization_indexes = this.get_firebase_serialization_indexes()

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

  clear_paths(neighbor_type?: enum_neighbor_type) {
    // If no neighbor type passed in, remove all paths from the hexagon

    if (!neighbor_type) {
      this.path_dictionaries = this.build_empty_path_dictionaries()
    }
    else {
      Object.keys(this.path_dictionaries).forEach((path_id: string) => {
        this.path_dictionaries[path_id][neighbor_type] = false
      })
    }

  }

  get_path_brushes() {
    return Object.entries(paint_brushes).filter((brush) => {
      const brush_data = brush[1]
      return brush_data.paint_category == paint_category.path && brush_data.id != 'clear_path'
    })
  }

  build_empty_path_dictionaries() {
    const path_brushes = this.get_path_brushes()

    const path_dictionaries: {[index: string]: type_path_dictionary} = {}

    path_brushes.forEach((path_brush) => {
      path_dictionaries[path_brush[0]] = Object.fromEntries(Object.values(enum_neighbor_type).map((neighbor_type) => [neighbor_type, false])) as type_path_dictionary
    });

    return path_dictionaries
  }

  /* ------------------------- Firebase serialization ------------------------- */

  get_firebase_serialization_indexes() {
    const attribute_array: String[] = []
    attribute_array.push('background_color_hexidecimal')
    attribute_array.push('text')
    attribute_array.push('icon_name')

    Object.keys(this.path_dictionaries).forEach((path_key) => {
      Object.keys(this.path_dictionaries[path_key]).forEach((neighbor_key) => {
        attribute_array.push(this.get_path_attribute_key(path_key, neighbor_key))
      })
    })

    return attribute_array
  }

  get_path_attribute_key(path_key: string, neighbor_type: string) {
    return path_key + "_" + neighbor_type
  }

  get_firebase_serialization_index(attribute_name: string) {
    let return_value = 0

    this.firebase_serialization_indexes.forEach((value: String, index: number) => {

      if (value == attribute_name) {
        return_value = index
      }
    })

    return return_value
  }

  populate_from_firebase_hex_data(firebase_hex_data: string) {
    const firebase_array = firebase_hex_data.split("_")

    this.background_color_hexidecimal = firebase_array[this.get_firebase_serialization_index('background_color_hexidecimal')]
    this.text = firebase_array[this.get_firebase_serialization_index('text')]
    this.icon_name = firebase_array[this.get_firebase_serialization_index('icon_name')]

    Object.keys(this.path_dictionaries).forEach((path_key) => {
      Object.values(enum_neighbor_type).forEach((neighbor_type) => {
        const firebase_string_value = firebase_array[this.get_firebase_serialization_index(this.get_path_attribute_key(path_key, neighbor_type))]
        this.path_dictionaries[path_key][neighbor_type] = (firebase_string_value == '1' ? true : false)
      })
    })
  }

  get_firebase_hex_data() {
    let hex_data_array: [number, string][] = []

    hex_data_array.push([this.get_firebase_serialization_index('background_color_hexidecimal'), this.background_color_hexidecimal])
    hex_data_array.push([this.get_firebase_serialization_index('text'), this.text])
    hex_data_array.push([this.get_firebase_serialization_index('icon_name'), this.icon_name])

    Object.keys(this.path_dictionaries).forEach((path_key) => {
      Object.values(enum_neighbor_type).forEach((neighbor_type) => {
        const firebase_array_index = this.get_firebase_serialization_index(this.get_path_attribute_key(path_key, neighbor_type))
        const firebase_value = (this.path_dictionaries[path_key][neighbor_type] == true ? '1' : '0')
        hex_data_array.push([firebase_array_index, firebase_value])
      })
    })

    hex_data_array.sort((start_element: [number, string], next_element: [number, string]) => {
      if (start_element[0] < next_element[0]) {
        return -1
      }
      else {
        return 1
      }
    })

    const just_values_array = hex_data_array.map((element) => element[1])

    return just_values_array.join("_")
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