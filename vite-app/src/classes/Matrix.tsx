import { DocumentData } from "firebase/firestore";

import defaults from "../configs/defaults";
import Hexagon from "./Hexagon";

class Matrix {
  num_rows: number = defaults.num_hexes_tall
  num_columns: number = defaults.num_hexes_wide
  hexagons: Hexagon[] = []
  firebase_map_doc: DocumentData = {}
  hexagon_edge_pixels: number = defaults.hexagon_edge_pixels
  canvas_context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | undefined

  // Don't include size information in the constructor so that we can retain matrix information 
  // even when we resize the scale contxt
  constructor() {}

  // This is NOT done in the constructor because the hex_grid needs to create this before rendering, where the context isn't created yet
  set_context(canvas_context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | undefined) {
    this.canvas_context = canvas_context
  }

  resize(hexagon_edge_pixels: number, num_rows: number, num_columns: number) {
    this.hexagon_edge_pixels = this.hexagon_edge_pixels
    this.num_rows = num_rows
    this.num_columns = num_columns
  }

  populate_matrix(firebase_map_doc?: DocumentData) {
    this.hexagons = []
    if (firebase_map_doc) {
      this.firebase_map_doc = firebase_map_doc
    }

    if (this.firebase_map_doc) {
      if (this.firebase_map_doc.height) {
        this.num_rows = parseInt(this.firebase_map_doc.height)
      }
      if (this.firebase_map_doc.width) {
        this.num_columns = parseInt(this.firebase_map_doc.width)
      }
    }

    for (let row_number = 1; row_number <= this.num_rows; row_number++) {
      for (let column_number = 1; column_number <= this.num_columns; column_number++) {
          const hexagon = new Hexagon(
            row_number,
            column_number,
            this.hexagon_edge_pixels,
            this.canvas_context
          )

          if (this.firebase_map_doc) {
            const firebase_hex_key = hexagon.get_firebase_hex_key()
            const firebase_hex_data = this.firebase_map_doc[firebase_hex_key]

            if (firebase_hex_data != undefined) {
                hexagon.populate_from_firebase_hex_data(firebase_hex_data)
            }
          }

          this.hexagons.push(hexagon)
      }
    }
  }

  get_firebase_map_doc() {

    if (!this.firebase_map_doc) {
      const firebase_map_doc: DocumentData = {
        "height": this.num_rows,
        "width": this.num_columns
      }

      this.hexagons.forEach((hexagon) => {
        firebase_map_doc[hexagon.get_firebase_hex_key()] = hexagon.get_firebase_hex_data()
      })

      return firebase_map_doc
    }
    else {
      return this.firebase_map_doc
    }
  }

  paint_hexagons() {
    this.hexagons.forEach((hexagon) => hexagon.paint())
  }

  get_hexagon(row_number: number, column_number: number) {
    let return_hexagon = undefined

    for (let hexagon_index: number = 0; hexagon_index < this.hexagons.length; hexagon_index++) {
      const hexagon = this.hexagons[hexagon_index]
      if (hexagon.row_number == row_number && hexagon.column_number == column_number) {
        return_hexagon = hexagon
      }
    }

    return return_hexagon
  }

  are_neighbors(hexagon_1: Hexagon, hexagon_2: Hexagon) {
    const neighboring_columns = [hexagon_1.column_number]

    if (hexagon_1.row_number == hexagon_2.row_number || hexagon_1.row_number % 2 == 1) {
        neighboring_columns.push(hexagon_1.column_number + 1)
    }

    if (hexagon_1.row_number == hexagon_2.row_number || hexagon_1.row_number % 2 == 0) {
        neighboring_columns.push(hexagon_1.column_number - 1)
    }

    if (
        // (hexagon_1.row_number != hexagon_2.row_number || hexagon_1.column_number != hexagon_2.column_number) // Not the same hex
        Math.abs(hexagon_1.row_number - hexagon_2.row_number) < 2 // in a neighboring or same row
        && (
            neighboring_columns.includes(hexagon_2.column_number) // Neighboring column, adjusted for row offsets
        )
    ) {
        return true
    }
    else {
        return false
    }
  }

  add_path(start_hexagon: Hexagon, target_hexagon: Hexagon, path_brush_id: string) {
    if (start_hexagon.row_number == target_hexagon.row_number && start_hexagon.column_number == target_hexagon.column_number) {
        return
    }

    // Left and Right Neighbors
    if (start_hexagon.row_number == target_hexagon.row_number) {
        if (target_hexagon.column_number > start_hexagon.column_number) {
            if (path_brush_id == "river") {
                start_hexagon.is_right_river = true
                target_hexagon.is_left_river = true
            }
            else if (path_brush_id == "road") {
                start_hexagon.is_right_road = true
                target_hexagon.is_left_road = true
            }
        }
        else {
            if (path_brush_id == "river") {
                start_hexagon.is_left_river = true
                target_hexagon.is_right_river = true
            }
            else if (path_brush_id == "road") {
                start_hexagon.is_left_road = true
                target_hexagon.is_right_road = true
            }
        }
    }
    // Upwards neighbors
    else if (target_hexagon.row_number < start_hexagon.row_number) {
        if (start_hexagon.row_number % 2 == 1) {
            // Top Left Neighbor of odd rows
            if (target_hexagon.column_number == start_hexagon.column_number) {
                if (path_brush_id == "river") {
                    start_hexagon.is_top_left_river = true
                    target_hexagon.is_bottom_right_river = true
                }
                else if (path_brush_id == "road") {
                    start_hexagon.is_top_left_road = true
                    target_hexagon.is_bottom_right_road = true
                }
            }
            // Top right of odd rows
            else {
                if (path_brush_id == "river") {
                    start_hexagon.is_top_right_river = true
                    target_hexagon.is_bottom_left_river = true
                }
                else if (path_brush_id == "road") {
                    start_hexagon.is_top_right_road = true
                    target_hexagon.is_bottom_left_road = true
                }
            }
        }
        else {
            // Top Right Neighbor of even rows
            if (target_hexagon.column_number == start_hexagon.column_number) {
                if (path_brush_id == "river") {
                    start_hexagon.is_top_right_river = true
                    target_hexagon.is_bottom_left_river = true
                }
                else if (path_brush_id == "road") {
                    start_hexagon.is_top_right_road = true
                    target_hexagon.is_bottom_left_road = true
                }
            }
            // top left of even rows
            else {
                if (path_brush_id == "river") {
                    start_hexagon.is_top_left_river = true
                    target_hexagon.is_bottom_right_river = true
                }
                else if (path_brush_id == "road") {
                    start_hexagon.is_top_left_road = true
                    target_hexagon.is_bottom_right_road = true
                }
            }
        }
    }
    // Downwards neighbors
    else {
        if (start_hexagon.row_number % 2 == 1) {
            // Bottom Left Neighbor of odd rows
            if (target_hexagon.column_number == start_hexagon.column_number) {
                if (path_brush_id == "river") {
                    start_hexagon.is_bottom_left_river = true
                    target_hexagon.is_top_right_river = true
                }
                else if (path_brush_id == "road") {
                    start_hexagon.is_bottom_left_road = true
                    target_hexagon.is_top_right_road = true
                }
            }
            // Bottom right of odd rows
            else {
                if (path_brush_id == "river") {
                    start_hexagon.is_bottom_right_river = true
                    target_hexagon.is_top_left_river = true
                }
                else if (path_brush_id == "road") {
                    start_hexagon.is_bottom_right_road = true
                    target_hexagon.is_top_left_road = true
                }
            }
        }
        else {
            // Bottom Right Neighbor of even rows
            if (target_hexagon.column_number == start_hexagon.column_number) {
                if (path_brush_id == "river") {
                    start_hexagon.is_bottom_right_river = true
                    target_hexagon.is_top_left_river = true
                }
                else if (path_brush_id == "road") {
                    start_hexagon.is_bottom_right_road = true
                    target_hexagon.is_top_left_road = true
                }
            }
            // Bottom left of even rows
            else {
                if (path_brush_id == "river") {
                    start_hexagon.is_bottom_left_river = true
                    target_hexagon.is_top_right_river = true
                }
                else if (path_brush_id == "road") {
                    start_hexagon.is_bottom_left_road = true
                    target_hexagon.is_top_right_road = true
                }
            }
        }
    }
  }
}

export default Matrix