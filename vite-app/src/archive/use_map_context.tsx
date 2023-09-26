// import { useState, useContext } from "react"
// import MapContext from "../contexts/map_context"
// import hex_region_coordinates from "../types/hex_region_coordinates"
// import {hex_regions} from "../types/hex_region_coordinates"
// import type_map_definition from "../types/type_hexagon_definitions"
// import type_map_definition_record from "../types/type_hexagon_definition"

// export default function useMapContext(num_columns: number, num_rows: number) {

//     const map_context = useContext(MapContext)

//     const [zoom_level, set_zoom_level] = useState(map_context.zoom_level)
//     const [is_show_zoom_picker, set_is_show_zoom_picker] = useState(map_context.is_show_zoom_picker)
//     const [map_definition, set_map_definition] = useState<type_map_definition>({})

//     map_context.zoom_level = zoom_level
//     map_context.set_zoom_level = set_zoom_level
//     map_context.is_show_zoom_picker = is_show_zoom_picker
//     map_context.set_is_show_zoom_picker = set_is_show_zoom_picker
//     map_context.num_columns = num_columns
//     map_context.num_rows = num_rows
//     map_context.map_definition = map_definition

//     function get_neighbor_hex_region_coordinates(starting_column_number: number, starting_row_number: number, starting_hex_region: hex_regions): hex_region_coordinates | boolean {

//         let has_top_left_neighbor = true
//         let has_top_right_neighbor = true
//         let has_right_neighbor = true
//         let has_bottom_right_neighbor = true
//         let has_bottom_left_neighbor = true
//         let has_left_neighbor = true

//         // Check for has_neighbor
//         if (starting_column_number == 1) {
//             has_left_neighbor = false
//             if (starting_row_number % 2 == 0) {has_top_left_neighbor = false; has_bottom_left_neighbor = false}
//         }
//         if (starting_column_number == num_columns) {
//             has_right_neighbor = false
//             if (starting_row_number % 2 == 1) {has_top_right_neighbor = false; has_bottom_right_neighbor = false}
//         }
//         if (starting_row_number == 1) {has_top_left_neighbor = false; has_top_right_neighbor = false;}
//         if (starting_row_number == num_rows) {has_bottom_left_neighbor = false; has_bottom_right_neighbor = false}

//         // Compute neighbor coordinates
//         if (starting_hex_region == hex_regions.top_left && has_top_left_neighbor) {
//             return {
//                 column_number: ((Number(starting_row_number) % 2 == 1) ? starting_column_number : Number(starting_column_number) - 1),
//                 row_number: Number(starting_row_number) - 1,
//                 hex_region: hex_regions.bottom_right
//             }
//         }
//         else if (starting_hex_region == hex_regions.top_right && has_top_right_neighbor) {
//             return {
//                 column_number: (Number(starting_row_number) % 2 == 1) ? Number(starting_column_number) + 1 : starting_column_number,
//                 row_number: Number(starting_row_number) - 1,
//                 hex_region: hex_regions.bottom_left
//             }
//         }
//         else if (starting_hex_region == hex_regions.right && has_right_neighbor) {
//             return {
//                 column_number: Number(starting_column_number) + 1,
//                 row_number: starting_row_number,
//                 hex_region: hex_regions.left
//             }
//         }
//         else if (starting_hex_region == hex_regions.bottom_right && has_bottom_right_neighbor) {
//             return {
//                 column_number: (Number(starting_row_number) % 2 == 1) ? Number(starting_column_number) + 1 : starting_column_number,
//                 row_number: Number(starting_row_number) + 1,
//                 hex_region: hex_regions.top_left
//             }
//         }
//         else if (starting_hex_region == hex_regions.bottom_left && has_bottom_left_neighbor) {
//             return {
//                 column_number: (Number(starting_row_number) % 2 == 1) ? starting_column_number : Number(starting_column_number) - 1,
//                 row_number: Number(starting_row_number) + 1,
//                 hex_region: hex_regions.top_right
//             }
//         }
//         else if (starting_hex_region == hex_regions.left && has_left_neighbor) {
//             return {
//                 column_number: Number(starting_column_number) - 1,
//                 row_number: starting_row_number,
//                 hex_region: hex_regions.right
//             }
//         }
//         else {
//             return false
//         }

//     }

//     function update_map_definition(key: string, segment: string, new_value: string) {
//         set_map_definition((previous_state) => {
//             const previous_value: type_map_definition_record = previous_state[key]
//             let new_json_value: type_map_definition_record = {[segment]: new_value}

//             if (previous_value != undefined) {
//                 new_json_value = {...previous_value}
//                 new_json_value[segment] = new_value
//             }

//             return {
//                 ...previous_state,
//                 [key]: new_json_value
//             }
//         })
//     }

//     map_context.get_neighbor_hex_region_coordinates = get_neighbor_hex_region_coordinates
//     map_context.update_map_definition = update_map_definition

//     return map_context
// }

