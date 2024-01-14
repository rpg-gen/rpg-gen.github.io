import { DocumentData } from "firebase/firestore";

import defaults from "../configs/defaults";
import Hexagon from "./Hexagon";

class Matrix {
  num_rows: number = defaults.num_hexes_tall
  num_columns: number = defaults.num_hexes_wide
  hexagons: Hexagon[] = []
  firebase_map_doc: DocumentData = {}
  hexagon_edge_pixels: number = defaults.hexagon_edge_pixels

  constructor(num_rows?: number, num_columns?: number) {
    this.resize(num_rows||defaults.num_hexes_tall, num_columns||defaults.num_hexes_wide)
    this.populate_matrix()
  }

  resize(num_rows: number, num_columns: number) {
    this.num_rows = num_rows
    this.num_columns = num_columns
  }

  populate_matrix(firebase_map_doc?: DocumentData) {
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
          const hexagon = new Hexagon(row_number, column_number)

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

  paint_hexagons(
    canvas_context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    hexagon_edge_pixels: number
  ) {
    this.hexagons.forEach((hexagon) => hexagon.paint(
      canvas_context,
      hexagon_edge_pixels
    ))
  }
}

export default Matrix