import { createContext } from 'react';

function noop() {}

const context_obj: {
    zoom_level: number,
    set_zoom_level: Function,
    is_show_zoom_picker: boolean,
    set_is_show_zoom_picker: Function,
    num_columns: number,
    num_rows: number,
    get_neighbor_hex_region_coordinates: Function,
} = {
    zoom_level: 10,
    set_zoom_level: noop,
    is_show_zoom_picker: false,
    set_is_show_zoom_picker: noop,
    num_columns: 20,
    num_rows: 20,
    get_neighbor_hex_region_coordinates: noop
}

const MapContext = createContext(context_obj);

export default MapContext;