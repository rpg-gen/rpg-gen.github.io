import TopBar from "../components/top_bar/top_bar"
// import MapContext from "../contexts/map_context"
import { useState, useRef, useContext, useEffect } from "react"
import PaintPicker from "../pages/paint_picker"
import ZoomPicker from "../pages/zoom_picker"
import HexGrid from "../components/hex_grid"
import HamMenu from "../components/top_bar/ham_menu"
import EditBrushButton from "../components/top_bar/edit_brush_button"
import ZoomButton from "../components/top_bar/zoom_button"
import { paint_category } from "../types/type_paint_brush"
import type_hexagon_definition from "../types/type_hexagon_definition"
import Loading from "../pages/loading"
// import useFabric from "../hooks/use_fabric"
// import MapSize from "../components/top_bar/map_size"
import useCanvas from "../hooks/use_canvas"
import CivPicker from "./civ_picker"
import hexagon_math from "../utility/hexagon_math"

import scale_context from "../contexts/scale_context"
import UserContext from "../contexts/user_context"

import useFirebaseMap from "../hooks/use_firebase_map"
import Account from "../pages/account"
import feature_flags from "../configs/feature_flags"
import MainMenu from "../pages/main_menu"
import { useParams, Link } from "react-router-dom"
import defaults from "../configs/defaults"

function noop() {}

export default function Map () {

    const { subpage } = useParams()

    const user_context = useContext(UserContext)
    const map_scale_context = useContext(scale_context)

    const firebase_map_data = useRef<{[index: string]: string}>({})
    const firebase_listener_unsub_function = useRef<Function>(noop)

    const ref_hexagon_definitions = useRef<type_hexagon_definition[]>([])

    const [paint_brush_id, set_paint_brush_id] = useState(defaults.brush_id)

    console.log("map rerender with ", paint_brush_id) /*debuggery*/

    const [is_show_loading, set_is_show_loading] = useState(false)
    const loading_function_ref = useRef<Function>(noop)

    const [is_show_main_menu, set_is_show_main_menu] = useState(false)
    const [is_show_civ_picker, set_is_show_civ_picker] = useState(false)
    const [is_show_account, set_is_show_account] = useState(false)

    useEffect(function(){
        if (user_context.is_logged_in && feature_flags.is_persist_to_firebase) {
            const firebase_map_hook = useFirebaseMap()
            firebase_map_hook.get_map_document().then(function(data: any) {
                const previous_length = ref_hexagon_definitions.current.length
                firebase_map_data.current = data
                // if (previous_length == 0) {
                    // Draw the whole map async if this is the first load
                    ref_hexagon_definitions.current = hexagon_math.get_starting_hexagon_definitions(firebase_map_data.current)
                    canvas.draw_map()

                    firebase_listener_unsub_function.current()
                    firebase_listener_unsub_function.current = firebase_map_hook.create_listener(function(data: any) {
                        const changed_hexagon_definitions = hexagon_math.get_changed_hexagon_definitions(ref_hexagon_definitions.current, data)
                        for (let i = 0; i < changed_hexagon_definitions.length; i++) {
                            hexagon_math.paint_hexagon(changed_hexagon_definitions[i], canvas.get_canvas_context(), map_scale_context.hexagon_edge_pixels)
                            ref_hexagon_definitions
                        }
                    })
                // }
            })
        }
        else {
            ref_hexagon_definitions.current = hexagon_math.get_starting_hexagon_definitions({})
            canvas.draw_map()
        }
    }, [user_context.is_logged_in, scale_context])

    const canvas = useCanvas(
        map_scale_context.hexagon_edge_pixels,
        defaults.num_hexes_tall,
        defaults.num_hexes_wide,
        ref_hexagon_definitions,
        paint_brush_id,
        set_is_show_loading,
        set_is_show_civ_picker,
        user_context.is_logged_in
    )

    return (
        <>

        <HexGrid
            canvas={canvas}
        />

        <TopBar>
            <HamMenu ham_menu_action={() => {set_is_show_main_menu(true)}} />
            <EditBrushButton
                paint_brush_id={paint_brush_id}
                canvas={canvas}
            />
            <ZoomButton />
            {/* <MapSize
                default_edge_length={DEFAULT_EDGE_LENGTH}
                default_num_rows={DEFAULT_NUM_ROWS}
                set_num_rows={set_num_rows}
                set_edge_length={set_edge_length}
                is_show_loading={is_show_loading}
            /> */}
        </TopBar>


        {
            is_show_main_menu
            ? <MainMenu
                set_is_show_main_menu={set_is_show_main_menu}
                set_is_show_account={set_is_show_account}
            />
            : ""
        }

        {
            is_show_account
            ? <Account set_is_show_account={set_is_show_account} set_is_show_loading={set_is_show_loading} />
            : ""
        }

        {
            is_show_loading
            ? <Loading loading_function_ref={loading_function_ref} set_is_show_loading={set_is_show_loading} />
            : ""
        }

        {
            // is_show_paint_picker
            // ? <PaintPicker>

            // </PaintPicker>
            // : ""
        }

        { subpage == "brush_picker" ? <PaintPicker set_paint_brush_id={set_paint_brush_id} /> : "" }
        { subpage == "zoom" ? <ZoomPicker /> : "" }

        {
            // is_show_civ_picker
            // ?
                // <CivPicker
                //     set_is_show_civ_picker={set_is_show_civ_picker}
                //     canvas={canvas}
                //     ref_hexagon_definitions={ref_hexagon_definitions}
                //     edge_length={zoom_edge_length}
                // />
            // : ""
        }

        </>
    )
}