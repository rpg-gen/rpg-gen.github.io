import { DocumentData } from "firebase/firestore";

import defaults from "../configs/defaults";
import Hexagon from "./Hexagon";
import enum_neighbor_type from "../types/enum_neighbor_type";
import { get_opposite_neighbor_type } from "../helpers/geometry";

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

    /* ------------------- Functions for neighbor logic, paths ------------------ */

    are_neighbors(hexagon_1: Hexagon, hexagon_2: Hexagon) {
        let are_neighbors_return = false
        const neighbors = this.get_all_neighbors(hexagon_1)

        neighbors.forEach((neighbor) => {
            if (neighbor == hexagon_2) {
                are_neighbors_return = true
            }
        })

        return are_neighbors_return
    }

    is_pushed_right_row(row_number: number) {
        return (row_number % 2 == 1)
    }

    get_all_neighbors(hexagon: Hexagon) {
        const neighbors_array: Hexagon[] = []
        const neighbor_types = Object.values(enum_neighbor_type)

        neighbor_types.forEach((neighbor_type) => {
            const neighbor = this.get_neighbor(hexagon, neighbor_type)
            if (neighbor) {
                neighbors_array.push(neighbor)
            }
        })

        return neighbors_array
    }

    get_neighbor(hexagon: Hexagon, neighbor_type: enum_neighbor_type) {
        let return_value: Hexagon | undefined = undefined
        const is_pushed_right_row = this.is_pushed_right_row(hexagon.row_number)

        // Start with our current hex and adjust based on specific directional and grid logic
        let neighbor_row_number = hexagon.row_number
        let neighbor_column_number = hexagon.column_number

        /* ------------------------ See if we move up or down ----------------------- */
        if ([enum_neighbor_type.top_left,enum_neighbor_type.top_right].includes(neighbor_type)) {
            neighbor_row_number -= 1
        }

        else if ([enum_neighbor_type.bottom_right, enum_neighbor_type.bottom_left].includes(neighbor_type)) {
            neighbor_row_number += 1
        }

        /* ----------------------- see if we move side to side ---------------------- */
        if (
            neighbor_type == enum_neighbor_type.right
            || (
                [enum_neighbor_type.top_right, enum_neighbor_type.bottom_right].includes(neighbor_type)
                && is_pushed_right_row
            )
        ) {
            neighbor_column_number += 1
        }
        else if (
            neighbor_type == enum_neighbor_type.left
            || (
                [enum_neighbor_type.top_left, enum_neighbor_type.bottom_left].includes(neighbor_type)
                && !is_pushed_right_row
            )
        ) {
            neighbor_column_number -= 1
        }

        // If this is a valid location on the grid, return the hexagon referenced by it
        if (
            neighbor_row_number > 0
            && neighbor_row_number <= this.num_rows
            && neighbor_column_number > 0
            && neighbor_column_number <= this.num_columns
        ) {
            return_value = this.get_hexagon(neighbor_row_number, neighbor_column_number)
        }

        return return_value
    }

    get_neighbor_direction(start_hexagon: Hexagon, end_hexagon: Hexagon) {
        const neighbor_types = Object.values(enum_neighbor_type)
        const return_neighbor_type = neighbor_types.find((neighbor_type) => {
            const possible_end_hexagon = this.get_neighbor(start_hexagon, neighbor_type)
            if (possible_end_hexagon) {
                const end_hex_key = possible_end_hexagon.get_firebase_hex_key()
                const possible_end_hex_key = end_hexagon.get_firebase_hex_key()

                return (possible_end_hex_key == end_hex_key)
            }
        })

        if (!return_neighbor_type) {
            throw new Error("Unable to get neighbor direction, Possibly attempting with non-neighbors")
        }

        return return_neighbor_type
    }

    add_path(start_hexagon: Hexagon, target_hexagon: Hexagon, path_brush_id: string) {
        const neighbor_type = this.get_neighbor_direction(start_hexagon, target_hexagon)

        if (!this.are_neighbors(start_hexagon, target_hexagon)) {
            throw new Error("Attempted to add a path between hexes that are not neighbors")
        }

        const inverse_neighbor_type = get_opposite_neighbor_type(neighbor_type)

        start_hexagon.path_dictionaries[path_brush_id][neighbor_type] = true
        target_hexagon.path_dictionaries[path_brush_id][inverse_neighbor_type] = true
    }

    remove_paths(hexagon: Hexagon) {
        hexagon.clear_paths()

        Object.values(enum_neighbor_type).forEach((neighbor_type) => {
            const neighbor_hexagon = this.get_neighbor(hexagon, neighbor_type)

            if (neighbor_hexagon) {
                const inverse_neighbor_type = get_opposite_neighbor_type(neighbor_type)
                neighbor_hexagon.clear_paths(inverse_neighbor_type)
            }
        })
    }

    /* ---------------------------------- misc ---------------------------------- */

    // This is NOT done in the constructor because the hex_grid needs to create this before rendering, where the context isn't created yet
    set_context(canvas_context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | undefined) {
        this.canvas_context = canvas_context
    }

    resize(hexagon_edge_pixels: number, num_rows?: number, num_columns?: number) {
        this.hexagon_edge_pixels = hexagon_edge_pixels
        this.num_rows = num_rows || this.num_rows
        this.num_columns = num_columns || this.num_columns
    }

    update_matrix_from_firebase_doc(firebase_map_doc: DocumentData) {
        /*
            Similar to the "populate_matrix" method, but this will look at the incoming data and compare
            hexagon by hexagon and only update the ones that are different in the incoming data. Then it will redraw
            only the different hexagons, to reduce total redraw load
        */
        this.hexagons.forEach(function(hexagon){
            const firebase_hex_key = hexagon.get_firebase_hex_key()
            const incoming_firebase_hex_data = firebase_map_doc[firebase_hex_key]
            const current_firebase_hex_data = hexagon.get_firebase_hex_data()

            if (incoming_firebase_hex_data != undefined && incoming_firebase_hex_data != current_firebase_hex_data) {
                hexagon.populate_from_firebase_hex_data(incoming_firebase_hex_data)
                hexagon.paint()
            }
        })
    }

    populate_matrix(firebase_map_doc?: DocumentData) {
        /*
            Fill in the matrix with hexagons to represent each row+column combination.
            If there are values in the firebase_map_doc for that location use those values
            otherwise just create a default blank hexagon.
            Meant to be used for a complete re-load, not updates
        */
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

}

export default Matrix