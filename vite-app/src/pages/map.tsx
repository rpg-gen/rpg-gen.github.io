import TopBar from "../components/top_bar"
import PaintContext from "../contexts/paint_context"
import { useContext } from "react"
import PaintPicker from "../pages/paint_picker"
import HexagonGrid from "../components/hexagon_grid"

export default function Map () {

    const paint_context = useContext(PaintContext)

    return (
        <>

        <TopBar />
        <HexagonGrid num_columns={20} num_rows={20} edge_length={60} />

        {
            paint_context.is_show_paint_picker
            ? <PaintPicker />
            : ""
        }

        </>
    )
}