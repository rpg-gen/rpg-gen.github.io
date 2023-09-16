import { createContext } from 'react';
import paint_brushes from "../configs/paint_brushes"
import paint_brush from "../types/type_paint_brush"

function noop() {}

const paint_context: {
    paint_brush: paint_brush,
    set_valid_paint_brush: Function,
    is_show_paint_picker: boolean,
    set_is_show_paint_picker: Function,
}  = {
    paint_brush: paint_brushes.unset,
    set_valid_paint_brush: noop,
    is_show_paint_picker: false,
    set_is_show_paint_picker: noop,
}

const PaintContext = createContext(paint_context);

export default PaintContext;