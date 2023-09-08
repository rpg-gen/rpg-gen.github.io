import paint_brush from "../types/paint_brush"
import colors from "../configs/colors"

const paint_brushes: {[key: string]: paint_brush} = {
    unset: {name: "unset", is_full_hex_color: true, hotkey: "u", hexidecimal_color: colors.unset, font_color: "black"},
    ocean: {name: "ocean", is_full_hex_color: true, hotkey: "u", hexidecimal_color: colors.ocean, font_color: "white"},
    query: {name: "query", is_full_hex_color: true, hotkey: "u", hexidecimal_color: colors.query, font_color: "black"},
    mountain: {name: "mountain", is_full_hex_color: true, hotkey: "u", hexidecimal_color: colors.mountain, font_color: "white"},
    bog: {name: "bog", is_full_hex_color: true, hotkey: "u", hexidecimal_color: colors.bog, font_color: "white"},
    plains: {name: "plains", is_full_hex_color: true, hotkey: "u", hexidecimal_color: colors.plains, font_color: "black"},
    forest: {name: "forest", is_full_hex_color: true, hotkey: "u", hexidecimal_color: colors.forest, font_color: "white"},
    desert: {name: "desert", is_full_hex_color: true, hotkey: "u", hexidecimal_color: colors.desert, font_color: "black"},
    hills: {name: "hills", is_full_hex_color: true, hotkey: "u", hexidecimal_color: colors.hills, font_color: "white"}
}

export default paint_brushes