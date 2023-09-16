import TopBar from "../components/top_bar/top_bar"
// import PaintContext from "../contexts/paint_context"
// import MapContext from "../contexts/map_context"
import { useState } from "react"
import PaintPicker from "../pages/paint_picker"
import PaintPickerSection from "../components/paint_picker/paint_picker_section"
import ZoomPicker from "../pages/zoom_picker"
import ZoomPickerOption from "../components/zoom_picker_option"
import HexagonGrid from "../components/hexagon/hexagon_grid"
import HamMenu from "../components/top_bar/ham_menu"
import EditBrushButton from "../components/top_bar/edit_brush_button"
import ZoomButton from "../components/top_bar/zoom_button"
import paint_brushes from "../configs/paint_brushes"
import { paint_category } from "../types/type_paint_brush"
import type_hexagon_definitions from "../types/type_hexagon_definitions"
import build_starting_hexagon_definitions from "../utility/build_starting_hexagon_definitions"

export default function Map () {

    // const paint_context = useContext(PaintContext)
    // const map_context = useContext(MapContext)

    // const [hexagon_definitions, set_hexagon_definitions] = useState<>([])
    const NUM_COLUMNS = 2
    const NUM_ROWS = 2

    const [zoom_level, set_zoom_level] = useState(5);
    const [is_show_zoom_picker, set_is_show_zoom_picker] = useState(false)
    const [paint_brush_id, set_paint_brush_id] = useState("road");
    const [is_show_paint_picker, set_is_show_paint_picker] = useState(false)
    const [hexagon_definitions, set_hexagon_definitions] = useState<type_hexagon_definitions>(build_starting_hexagon_definitions(NUM_COLUMNS, NUM_ROWS))

    const default_edge_length = 60
    const zoom_edge_length = default_edge_length * (zoom_level / 5) // Sets zoom "5" to have the default edge length

    return (
        <>

        <TopBar>
            {/* <HamMenu /> */}
            <EditBrushButton paint_brush_id={paint_brush_id} set_is_show_paint_picker={set_is_show_paint_picker} />
            <ZoomButton zoom_level={zoom_level} set_is_show_zoom_picker={set_is_show_zoom_picker} />
        </TopBar>

        <HexagonGrid hexagon_definitions={hexagon_definitions} edge_length={zoom_edge_length} />

        {/* // <HexagonGrid num_columns={map_context.num_columns} num_rows={map_context.num_rows} edge_length={current_edge_length} /> */}

        {
            is_show_paint_picker
            ? <PaintPicker>
                <PaintPickerSection this_paint_category={paint_category.background} set_is_show_paint_picker={set_is_show_paint_picker} set_paint_brush_id={set_paint_brush_id} />
                {/* <PainPickerSection category={paint_category.background}></PainPickerSection> */}
                <PaintPickerSection this_paint_category={paint_category.icon} set_is_show_paint_picker={set_is_show_paint_picker} set_paint_brush_id={set_paint_brush_id} />
                <PaintPickerSection this_paint_category={paint_category.path} set_is_show_paint_picker={set_is_show_paint_picker} set_paint_brush_id={set_paint_brush_id} />
            </PaintPicker>
            : ""
        }

        {
            is_show_zoom_picker
            ? <ZoomPicker>
                {Array.from({length: 10}, (_, index) => {
                    return <ZoomPickerOption key={index} zoom_level={index+1} set_zoom_level={set_zoom_level} set_is_show_zoom_picker={set_is_show_zoom_picker} />
                })}
            </ZoomPicker>
            : ""
        }

        </>
    )
}