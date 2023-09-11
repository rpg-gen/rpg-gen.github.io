import { useState, useContext } from "react"
import MapContext from "../contexts/map_context"

export default function useMapContext() {

    const map_context = useContext(MapContext)

    const [zoom_level, set_zoom_level] = useState(map_context.zoom_level)
    const [is_show_zoom_picker, set_is_show_zoom_picker] = useState(map_context.is_show_zoom_picker)

    map_context.zoom_level = zoom_level
    map_context.set_zoom_level = set_zoom_level
    map_context.is_show_zoom_picker = is_show_zoom_picker
    map_context.set_is_show_zoom_picker = set_is_show_zoom_picker

    return map_context

}