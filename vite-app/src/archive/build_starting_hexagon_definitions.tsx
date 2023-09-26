// import type_hexagon_definitions from "../types/type_hexagon_definitions"
// import type_hexagon_definition from "../types/type_hexagon_definition"
// import colors from "../configs/colors"

// export default function build_starting_hexagon_definitions( num_rows: number, num_columns: number) {
//     const hexagon_definitions: type_hexagon_definitions = {}

//     for (let row_number = 1; row_number <= num_rows; row_number++) {
//         if (hexagon_definitions[row_number] == undefined) {
//             hexagon_definitions[row_number] = {}
//         }

//         for (let column_number = 1; column_number <= num_columns; column_number++) {
//             hexagon_definitions[row_number][column_number] = {
//                 background_color_hexidecimal: colors.white,
//                 is_top_left_river: false,
//                 is_top_right_river: false,
//                 is_right_river: false,
//                 is_bottom_right_river: false,
//                 is_bottom_left_river: false,
//                 is_left_river: false,
//                 is_top_left_road: false,
//                 is_top_right_road: false,
//                 is_right_road: false,
//                 is_bottom_right_road: false,
//                 is_bottom_left_road: false,
//                 is_left_road: false,
//                 town_size: 0,
//             }

//         }
//     }

//     return hexagon_definitions
// }