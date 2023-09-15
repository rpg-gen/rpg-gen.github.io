import { useState } from "react"
import paint_brushes from "../configs/paint_brushes"
import paint_brush from "../types/paint_brush"

export default function usePaintTool() {

    const [paint_brush, set_paint_brush] = useState(paint_brushes.road)
    const [is_show_paint_picker, set_is_show_paint_picker] = useState(false)

    function set_valid_paint_brush(new_brush: string) {

        for (const key in paint_brushes){
            if (new_brush == paint_brushes[key].id) {
                set_paint_brush(paint_brushes[key])
            }
        }
    }

    const paint_context: {
        paint_brush: paint_brush,
        set_valid_paint_brush: Function,
        is_show_paint_picker: boolean,
        set_is_show_paint_picker: Function,
    } = {
        paint_brush,
        set_valid_paint_brush,
        is_show_paint_picker,
        set_is_show_paint_picker,
    }

    return paint_context

}