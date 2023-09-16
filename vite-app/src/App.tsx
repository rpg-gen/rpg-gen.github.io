import './App.css'
import { Outlet } from "react-router-dom"
import usePaintTool from "./hooks/use_paint_tool"
import useMapContext from "./hooks/use_map_context"
import PaintContext from "./contexts/paint_context"
import MapContext from "./contexts/map_context"

function App() {

    // const paint_context = usePaintTool()
    // const map_context = useMapContext(20, 20)

    return (
        <>
        {/* <MapContext.Provider value={map_context}> */}
        {/* <PaintContext.Provider value={paint_context}> */}

        <Outlet />

        {/* </PaintContext.Provider> */}
        {/* </MapContext.Provider> */}

        </>
    )
}

export default App
