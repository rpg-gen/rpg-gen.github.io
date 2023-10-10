import TopBar from "../components/top_bar/top_bar"
// import PaintContext from "../contexts/paint_context"
// import MapContext from "../contexts/map_context"
import { useState, useRef } from "react"
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

function noop() {}

export default function Map () {

    const DEFAULT_NUM_ROWS = 4
    const DEFAULT_NUM_COLUMNS = DEFAULT_NUM_ROWS
    const DEFAULT_BRUSH = "river"
    const DEFAULT_ZOOM_LEVEL = 5
    const DEFAULT_EDGE_LENGTH = 40

    const ref_hexagon_definitions = useRef<type_hexagon_definition[]>([])

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

    const canvas = useCanvas(
        zoom_edge_length,
        DEFAULT_NUM_ROWS,
        DEFAULT_NUM_COLUMNS,
        ref_hexagon_definitions,
        ref_paint_brush_id,
        set_is_show_loading,
        set_is_show_civ_picker,
    )

    // function apply_current_paint_to_hex(row_number: string, column_number: string) {
    //     const current_brush = paint_brushes[ref_paint_brush_id.current]
    //     const current_brush_category = current_brush.paint_category

    //     if (current_brush_category == paint_category.background) {
    //         const current_brush_background_color = current_brush.hexidecimal_color

    //         set_hexagon_definitions((previous_definitions) => {
    //             const previous_row = previous_definitions[row_number]
    //             const previous_hexagon = previous_definitions[row_number][column_number]

    //             const new_hexagon_definitions = {
    //                 ...previous_definitions,
    //                 [row_number]: {
    //                     ...previous_row,
    //                     [column_number]: {
    //                         ...previous_hexagon,
    //                         background_color_hexidecimal: current_brush_background_color
    //                     }
    //                 }
    //             }

    //             return new_hexagon_definitions
    //         })
    //     }
    // }

    // const handle_hex_click = useCallback(function (event: MouseEvent) {
    //     const target = (event.target as HTMLElement).dataset
    //     const clicked_row_number = (target.rowNumber as string)
    //     const clicked_column_number = (target.columnNumber as string)
    //     apply_current_paint_to_hex(clicked_row_number, clicked_column_number)
    // },[])

    return (
        <>

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