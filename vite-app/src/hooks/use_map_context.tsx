import { useState, useContext } from "react"
import MapContext from "../contexts/map_context"
import hex_region_coordinates from "../types/hex_region_coordinates"
import {hex_region} from "../types/hex_region_coordinates"

export default function useMapContext(num_columns: number, num_rows: number) {

    const map_context = useContext(MapContext)

    const [zoom_level, set_zoom_level] = useState(map_context.zoom_level)
    const [is_show_zoom_picker, set_is_show_zoom_picker] = useState(map_context.is_show_zoom_picker)

    map_context.zoom_level = zoom_level
    map_context.set_zoom_level = set_zoom_level
    map_context.is_show_zoom_picker = is_show_zoom_picker
    map_context.set_is_show_zoom_picker = set_is_show_zoom_picker
    map_context.num_columns = num_columns
    map_context.num_rows = num_rows

    function get_neighbor_hex_region_coordinates(starting_column_number: number, starting_row_number: number, starting_hex_region: hex_region): hex_region_coordinates | boolean {

        let has_top_left_neighbor = true
        let has_top_right_neighbor = true
        let has_right_neighbor = true
        let has_bottom_right_neighbor = true
        let has_bottom_left_neighbor = true
        let has_left_neighbor = true

        // Check for has_neighbor
        if (starting_column_number == 1) {
            has_left_neighbor = false
            if (starting_row_number % 2 == 0) {has_top_left_neighbor = false; has_bottom_left_neighbor = false}
        }
        if (starting_column_number == num_columns) {
            has_right_neighbor = false
            if (starting_row_number % 2 == 1) {has_top_right_neighbor = false; has_bottom_right_neighbor = false}
        }
        if (starting_row_number == 1) {has_top_left_neighbor = false; has_top_right_neighbor = false;}
        if (starting_row_number == num_rows) {has_bottom_left_neighbor = false; has_bottom_right_neighbor = false}

        // Compute neighbor coordinates
        if (starting_hex_region == hex_region.top_left && has_top_left_neighbor) {
            return {
                column_number: ((starting_row_number % 2 == 1) ? starting_column_number : starting_column_number - 1),
                row_number: starting_row_number - 1,
                hex_region: hex_region.bottom_right
            }
        }
        else if (starting_hex_region == hex_region.top_right && has_top_right_neighbor) {
            return {
                column_number: (starting_row_number % 2 == 1) ? starting_column_number + 1 : starting_column_number,
                row_number: starting_row_number - 1,
                hex_region: hex_region.bottom_left
            }
        }
        else if (starting_hex_region == hex_region.right && has_right_neighbor) {
            return {
                column_number: starting_column_number + 1,
                row_number: starting_row_number,
                hex_region: hex_region.left
            }
        }
        else if (starting_hex_region == hex_region.bottom_right && has_bottom_right_neighbor) {
            return {
                column_number: (starting_row_number % 2 == 1) ? starting_column_number + 1 : starting_column_number,
                row_number: starting_row_number + 1,
                hex_region: hex_region.top_left
            }
        }
        else if (starting_hex_region == hex_region.bottom_left && has_bottom_left_neighbor) {
            return {
                column_number: (starting_row_number % 2 == 1) ? starting_column_number : starting_column_number - 1,
                row_number: starting_row_number + 1,
                hex_region: hex_region.top_right
            }
        }
        else if (starting_hex_region == hex_region.left && has_left_neighbor) {
            return {
                column_number: starting_column_number - 1,
                row_number: starting_row_number,
                hex_region: hex_region.right
            }
        }
        else {
            return false
        }

    }

    map_context.get_neighbor_hex_region_coordinates = get_neighbor_hex_region_coordinates

    return map_context
}

