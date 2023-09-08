import './App.css'
import { Outlet } from "react-router-dom"
import usePaintTool from "./hooks/use_paint_tool"
import PaintContext from "./contexts/paint_context"

function App() {

    const paint_context = usePaintTool()

    return (
        <>
        <PaintContext.Provider value={paint_context}>

        <Outlet />

        </PaintContext.Provider>

        </>
    )
}

export default App
