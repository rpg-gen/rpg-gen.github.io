import { createContext } from "react"
import type_scale_context from "../types/ScaleContext"
import defaults from "../configs/defaults"

const noop: React.Dispatch<React.SetStateAction<type_scale_context>> = function (){}

const scale_context_raw: type_scale_context = {
    hexagon_edge_pixels: defaults.hexagon_edge_pixels,
    num_hexes_tall: defaults.num_hexes_tall,
    num_hexes_wide: defaults.num_hexes_wide,
    set_scale_context: noop,
}

const scale_context = createContext(scale_context_raw)

export default scale_context