import TopBar from "../components/top_bar/top_bar"
// import PaintContext from "../contexts/paint_context"
// import MapContext from "../contexts/map_context"
import { useState, MouseEvent, useCallback, useRef } from "react"
import PaintPicker from "../pages/paint_picker"
import PaintPickerSection from "../components/paint_picker/paint_picker_section"
import ZoomPicker from "../pages/zoom_picker"
import ZoomPickerOption from "../components/zoom_picker_option"
import HexagonGridContainer from "../components/hexagon/hexagon_grid_container"
import HexGrid from "../components/hexagon/hex_grid"
import HamMenu from "../components/top_bar/ham_menu"
import EditBrushButton from "../components/top_bar/edit_brush_button"
import ZoomButton from "../components/top_bar/zoom_button"
import paint_brushes from "../configs/paint_brushes"
import { paint_category } from "../types/type_paint_brush"
import type_hexagon_definitions from "../types/type_hexagon_definitions"
import build_starting_hexagon_definitions from "../utility/build_starting_hexagon_definitions"
import enum_grid_type from '../types/enum_grid_type'
import Loading from "../pages/loading"
import CivPicker from "../pages/civ_picker"
import useFabric from "../hooks/use_fabric"

function noop() {}

export default function Map () {

    const NUM_ROWS = 5
    const NUM_COLUMNS = NUM_ROWS
    const DEFAULT_BRUSH = "town"

    const [zoom_level, set_zoom_level] = useState(10);
    const [is_show_zoom_picker, set_is_show_zoom_picker] = useState(false)

    const [display_paint_brush_id, set_display_paint_brush_id] = useState(DEFAULT_BRUSH);
    const ref_paint_brush_id = useRef<string>(DEFAULT_BRUSH)

    const [is_show_loading, set_is_show_loading] = useState(false)
    const loading_function_ref = useRef<Function>(noop)

    const [is_show_paint_picker, set_is_show_paint_picker] = useState(false)
    const [hexagon_definitions, set_hexagon_definitions] = useState<type_hexagon_definitions>(build_starting_hexagon_definitions(NUM_COLUMNS, NUM_ROWS))

    const [is_show_civ_picker, set_is_show_civ_picker] = useState(false)

    const default_edge_length = 30
    const zoom_edge_length = default_edge_length * (zoom_level / 5) // Sets zoom "5" to have the default edge length

    const fabric_hook = useFabric(
        zoom_edge_length,
        hexagon_definitions,
        ref_paint_brush_id,
        set_is_show_civ_picker,
    )

    function apply_current_paint_to_hex(row_number: string, column_number: string) {
        const current_brush = paint_brushes[ref_paint_brush_id.current]
        const current_brush_category = current_brush.paint_category

        if (current_brush_category == paint_category.background) {
            const current_brush_background_color = current_brush.hexidecimal_color

            set_hexagon_definitions((previous_definitions) => {
                const previous_row = previous_definitions[row_number]
                const previous_hexagon = previous_definitions[row_number][column_number]

                const new_hexagon_definitions = {
                    ...previous_definitions,
                    [row_number]: {
                        ...previous_row,
                        [column_number]: {
                            ...previous_hexagon,
                            background_color_hexidecimal: current_brush_background_color
                        }
                    }
                }

                return new_hexagon_definitions
            })
        }
    }

    const handle_hex_click = useCallback(function (event: MouseEvent) {
        const target = (event.target as HTMLElement).dataset
        const clicked_row_number = (target.rowNumber as string)
        const clicked_column_number = (target.columnNumber as string)
        apply_current_paint_to_hex(clicked_row_number, clicked_column_number)
    },[])

    return (
        <>

        <TopBar>
            {/* <HamMenu /> */}
            <EditBrushButton paint_brush_id={display_paint_brush_id} set_is_show_paint_picker={set_is_show_paint_picker} />
            <ZoomButton zoom_level={zoom_level} set_is_show_zoom_picker={set_is_show_zoom_picker} />
        </TopBar>

        <HexGrid
            edge_length={zoom_edge_length}
            fabric_hook={fabric_hook}
        />

        {
            is_show_loading
            ? <Loading loading_function={loading_function_ref.current} />
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
                        set_is_show_loading={set_is_show_loading}
                        loading_function_ref={loading_function_ref}
                    />
                })}
            </ZoomPicker>
            : ""
        }

        {is_show_civ_picker ? <CivPicker set_is_show_civ_picker={set_is_show_civ_picker} fabric_hook={fabric_hook} /> : ""}

        </>
    )
}