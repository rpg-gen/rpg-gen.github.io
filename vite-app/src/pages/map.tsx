import TopBar from "../components/top_bar/top_bar"
import { useState, useRef, useContext, useEffect } from "react"
import BrushPicker from "./brush_picker"
import ZoomPicker from "../pages/zoom_picker"
import HexGrid from "../components/hex_grid"
import HamMenu from "../components/top_bar/ham_menu"
import EditBrushButton from "../components/top_bar/edit_brush_button"
import ZoomButton from "../components/top_bar/zoom_button"
import Loading from "../pages/loading"

import scale_context from "../contexts/scale_context"
import UserContext from "../contexts/user_context"

import Account from "../pages/account"
import MainMenu from "../pages/main_menu"
import { useParams } from "react-router-dom"
import defaults from "../configs/defaults"

function noop() {}

export default function Map () {

    const { subpage } = useParams()

    const user_context = useContext(UserContext)
    const map_scale_context = useContext(scale_context)

    const firebase_map_data = useRef<{[index: string]: string}>({})
    const firebase_listener_unsub_function = useRef<Function>(noop)

    const [paint_brush_id, set_paint_brush_id] = useState(defaults.brush_id) // This is used for changing the display to show the current paint brush
    const ref_paint_brush_id = useRef(paint_brush_id)// This is using so processes can know what the current paint brush is without having to re-render every time the paint brush changes

    const [is_show_loading, set_is_show_loading] = useState(false)
    const loading_function_ref = useRef<Function>(noop)

    // useEffect(function(){
    //     if (user_context.is_logged_in && feature_flags.is_persist_to_firebase) {
    //         const firebase_map_hook = useFirebaseMap()
    //         firebase_map_hook.get_map_document().then(function(data: any) {
    //             const previous_length = ref_hexagon_definitions.current.length
    //             firebase_map_data.current = data
    //             // if (previous_length == 0) {
    //                 // Draw the whole map async if this is the first load
    //                 ref_hexagon_definitions.current = hexagon_math.build_hexagon_matrix(firebase_map_data.current)
    //                 canvas.draw_map()

    //                 firebase_listener_unsub_function.current()
    //                 firebase_listener_unsub_function.current = firebase_map_hook.create_listener(function(data: any) {
    //                     const changed_hexagon_definitions = hexagon_math.get_changed_hexagon_definitions(ref_hexagon_definitions.current, data)
    //                     for (let i = 0; i < changed_hexagon_definitions.length; i++) {
    //                         hexagon_math.paint_hexagon(changed_hexagon_definitions[i], canvas.get_canvas_context(), map_scale_context.hexagon_edge_pixels)
    //                         ref_hexagon_definitions
    //                     }
    //                 })
    //             // }
    //         })
    //     }
    //     else {
    //         ref_hexagon_definitions.current = hexagon_math.get_starting_hexagon_definitions({})
    //         canvas.draw_map()
    //     }
    // }, [user_context.is_logged_in, scale_context])

    return (
        <>

        <HexGrid
            set_is_show_loading={set_is_show_loading}
            ref_paint_brush_id={ref_paint_brush_id}
        />

        <TopBar>
            <HamMenu />
            <EditBrushButton
                paint_brush_id={paint_brush_id}
                // canvas={canvas}
            />
            <ZoomButton />
        </TopBar>

        {
            is_show_loading
            ? <Loading loading_function_ref={loading_function_ref} set_is_show_loading={set_is_show_loading} />
            : ""
        }

        { subpage == "account" ? <Account set_is_show_loading={set_is_show_loading} /> : "" }
        { subpage == "main_menu" ? <MainMenu /> : "" }
        { subpage == "brush_picker" ? <BrushPicker set_paint_brush_id={set_paint_brush_id} ref_paint_brush_id={ref_paint_brush_id} /> : "" }
        { subpage == "zoom" ? <ZoomPicker /> : "" }

        </>
    )
}