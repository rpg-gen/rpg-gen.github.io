// // Use this for information we need to remember about the canvas, such as what was clicked, etc

// import { useRef, useState, MutableRefObject, MouseEventHandler, MouseEvent} from "react"
// import type_hexagon_definition from "../types/type_hexagon_definition"
// import hexagon_math from "../utility/hexagon_math"
// import spacing from "../configs/spacing"
// import type_canvas_hook from "../types/type_canvas_hook"
// import colors from "../configs/colors"
// import { paint_category } from "../types/type_paint_brush"
// import paint_brushes from "../configs/paint_brushes"
// import useFirebaseMap from "../hooks/usåe_firebase_map"
// import feature_flags from "../configs/feature_flags"
// import limits from "../configs/limits"


//     const ref_clicked_hex_def = useRef<type_hexagon_definition>()
//     const ref_previous_clicked_hex_def = useRef<type_hexagon_definition>()

//     function save_to_firebase(hexagon_definition: type_hexagon_definition) {
//         if (param_is_logged_in && feature_flags.is_persist_to_firebase) {
//             firebase_map_hook.save_hexagon_definitions([hexagon_definition])
//         }
//     }

//     function multi_save_to_firebase(hexagon_definitions: type_hexagon_definition[]) {
//         if (param_is_logged_in && feature_flags.is_persist_to_firebase) {
//             firebase_map_hook.save_hexagon_definitions(hexagon_definitions)
//         }
//     }

//     const handle_map_click: MouseEventHandler = function(event: MouseEvent) {

//     }