import { createContext } from 'react';

function noop() {}

const context_obj: {
    zoom_level: number,
    set_zoom_level: Function,
    is_show_zoom_picker: boolean,
    set_is_show_zoom_picker: Function
} = {
    zoom_level: 10,
    set_zoom_level: noop,
    is_show_zoom_picker: false,
    set_is_show_zoom_picker: noop
}

const MapContext = createContext(context_obj);

export default MapContext;