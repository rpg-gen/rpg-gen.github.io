import './App.css'
import { Outlet } from "react-router-dom"

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
