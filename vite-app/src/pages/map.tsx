import TopBar from "../components/top_bar/top_bar"
// import PaintContext from "../contexts/paint_context"
// import MapContext from "../contexts/map_context"
import { useState, useRef, useContext, useEffect } from "react"
import PaintPicker from "../pages/paint_picker"
import PaintPickerSection from "../components/paint_picker/paint_picker_section"
import ZoomPicker from "../pages/zoom_picker"
import ZoomPickerOption from "../components/zoom_picker_option"
import HexGrid from "../components/hexagon/hex_grid"
// import HamMenu from "../components/top_bar/ham_menu"
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
import UserContext from "../contexts/user_context"
import useFirebaseMap from "../hooks/use_firebase_map"

function noop() {}

export default function Map () {

    const DEFAULT_NUM_ROWS = 4
    const DEFAULT_NUM_COLUMNS = DEFAULT_NUM_ROWS
    const DEFAULT_BRUSH = "mountain"
    const DEFAULT_ZOOM_LEVEL = 5
    const DEFAULT_EDGE_LENGTH = 40

    const user_context = useContext(UserContext)
    // console.log("map user_context", user_context)

    const ref_hexagon_definitions = useRef<type_hexagon_definition[]>([])

    const [firebase_map_data, set_firebase_map_data] = useState([hexagon_math.get_default_hexagon_definition()])

    const [num_rows, set_num_rows] = useState(DEFAULT_NUM_ROWS)
    const [edge_length, set_edge_length] = useState(DEFAULT_EDGE_LENGTH)

    const [zoom_level, set_zoom_level] = useState(DEFAULT_ZOOM_LEVEL);
    const [is_show_zoom_picker, set_is_show_zoom_picker] = useState(false)

    const [display_paint_brush_id, set_display_paint_brush_id] = useState(DEFAULT_BRUSH);
    const ref_paint_brush_id = useRef<string>(DEFAULT_BRUSH)

    const [is_show_loading, set_is_show_loading] = useState(false)
    const loading_function_ref = useRef<Function>(noop)

    const [is_show_paint_picker, set_is_show_paint_picker] = useState(false)

    const [is_show_civ_picker, set_is_show_civ_picker] = useState(false)

    const zoom_edge_length = edge_length * (zoom_level / 5) // Sets zoom "5" to have the default edge length

    function handle_click() {
        const firebase_map_hook = useFirebaseMap()
        const definition_to_save = hexagon_math.get_default_hexagon_definition()
        firebase_map_hook.save_hexagon_definition(definition_to_save)
    }

    useEffect(function(){
        if (user_context.username) {
            const firebase_map_hook = useFirebaseMap()
            firebase_map_hook.get_map_document().then(function(data: any) {
                console.log("firebase data fetched", data)
            })
        }
    }, [user_context])

    const canvas = useCanvas(
        zoom_edge_length,
        DEFAULT_NUM_ROWS,
        DEFAULT_NUM_COLUMNS,
        ref_hexagon_definitions,
        ref_paint_brush_id,
        set_is_show_loading,
        set_is_show_civ_picker,
    )

    return (
        <>

        <button onClick={handle_click}>save</button>

        <HexGrid
            edge_length={zoom_edge_length}
            num_rows={num_rows}
            num_columns={num_rows}
            canvas={canvas}
        />

        <TopBar>
            {/* <HamMenu /> */}
            <EditBrushButton
                paint_brush_id={display_paint_brush_id}
                set_is_show_paint_picker={set_is_show_paint_picker}
                edge_length={zoom_edge_length}
                canvas={canvas}
            />
            <ZoomButton zoom_level={zoom_level} set_is_show_zoom_picker={set_is_show_zoom_picker} />
            {/* <MapSize
                default_edge_length={DEFAULT_EDGE_LENGTH}
                default_num_rows={DEFAULT_NUM_ROWS}
                set_num_rows={set_num_rows}
                set_edge_length={set_edge_length}
                is_show_loading={is_show_loading}
            /> */}
        </TopBar>

        {
            is_show_loading
            ? <Loading loading_function_ref={loading_function_ref} set_is_show_loading={set_is_show_loading} />
            : ""
        }

        {
            is_show_paint_picker
            ? <PaintPicker>
                <PaintPickerSection this_paint_category={paint_category.background} set_is_show_paint_picker={set_is_show_paint_picker} set_display_paint_brush_id={set_display_paint_brush_id} ref_paint_brush_id={ref_paint_brush_id} />
                <PaintPickerSection this_paint_category={paint_category.icon} set_is_show_paint_picker={set_is_show_paint_picker} set_display_paint_brush_id={set_display_paint_brush_id} ref_paint_brush_id={ref_paint_brush_id}  />
                <PaintPickerSection this_paint_category={paint_category.path} set_is_show_paint_picker={set_is_show_paint_picker} set_display_paint_brush_id={set_display_paint_brush_id} ref_paint_brush_id={ref_paint_brush_id}  />
            </PaintPicker>
            : ""
        }

        {
            is_show_zoom_picker
            ? <ZoomPicker>
                {Array.from({length: 10}, (_, index) => {
                    return <ZoomPickerOption
                        key={index}
                        zoom_level={index+1}
                        set_zoom_level={set_zoom_level}
                        set_is_show_zoom_picker={set_is_show_zoom_picker}
                        default_edge_length={DEFAULT_EDGE_LENGTH}
                        default_zoom_level={DEFAULT_ZOOM_LEVEL}
                        num_rows={num_rows}
                        // set_is_show_loading={set_is_show_loading}
                        // loading_function_ref={loading_function_ref}
                    />
                })}
            </ZoomPicker>
            : ""
        }

        {
            is_show_civ_picker
            ?
                <CivPicker
                    set_is_show_civ_picker={set_is_show_civ_picker}
                    canvas={canvas}
                    ref_hexagon_definitions={ref_hexagon_definitions}
                    edge_length={zoom_edge_length}
                />
            : ""
        }

        </>
    )
}