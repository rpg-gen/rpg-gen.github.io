import TopBar from "../components/top_bar"
import PaintContext from "../contexts/paint_context"
import MapContext from "../contexts/map_context"
import { useContext } from "react"
import PaintPicker from "../pages/paint_picker"
import ZoomPicker from "../pages/zoom_picker"
import HexagonGrid from "../components/hexagon_grid"

export default function Map () {

    const paint_context = useContext(PaintContext)
    const map_context = useContext(MapContext)

    const default_edge_length = 60

    let current_edge_length = default_edge_length * (map_context.zoom_level / 5)

    return (
        <>

        <TopBar />
        {/* <HexagonGrid num_columns={5} num_rows={5} edge_length={current_edge_length} /> */}
        <HexagonGrid num_columns={map_context.num_columns} num_rows={map_context.num_rows} edge_length={current_edge_length} />

        {
            paint_context.is_show_paint_picker
            ? <PaintPicker />
            : ""
        }

        {
            map_context.is_show_zoom_picker
            ? <ZoomPicker />
            : ""
        }

        </>
    )
}