import paint_brush from "../types/paint_brush"
import { category, color_type } from "../types/paint_brush"
import colors from "../configs/colors"

import svg_url_magnifying_glass from "../assets/magnifying_glass.svg"
// import svg_url_mountain from "../assets/mountain.svg"
// import svg_url_ocean from "../assets/waves.svg"
// import svg_url_wetland from "../assets/wetland.svg"
// import svg_url_plains from "../assets/plains.svg"
import svg_url_unset from "../assets/unset.svg"
// import svg_url_pine_tree from "../assets/pine_tree.svg"
// import svg_url_desert from "../assets/desert.svg"
// import svg_url_hills from "../assets/hills.svg"

import svg_url_village_black from "../assets/village_black.svg"
import svg_url_village_white from "../assets/village_white.svg"

import svg_url_river from "../assets/river.svg"
import svg_url_road from "../assets/road.svg"

const paint_brushes: {[key: string]: paint_brush} = {
    query: {
        id: "query",
        display_name: "Query",
        category: category.action,
        hotkey: "u",
        hexidecimal_color: colors.white,
        color_type: color_type.light,
        icon: svg_url_magnifying_glass,
        dark_icon: null,
        light_icon: null
    },
    unset: {
        id: "unset",
        display_name: "Unset",
        category: category.background,
        hotkey: "u",
        hexidecimal_color: colors.unset,
        color_type: color_type.light,
        icon: null,
        dark_icon: null,
        light_icon: null
    },
    ocean: {
        id: "ocean",
        display_name: "Ocean",
        category: category.background,
        hotkey: "u",
        hexidecimal_color: colors.ocean,
        color_type: color_type.light,
        icon: null,
        dark_icon: null,
        light_icon: null
    },
    mountain: {
        id: "mountain",
        display_name: "Mountain",
        category: category.background,
        hotkey: "u",
        hexidecimal_color: colors.mountain,
        color_type: color_type.light,
        icon: null,
        dark_icon: null,
        light_icon: null
    },
    bog: {
        id: "bog",
        display_name: "Bog",
        category: category.background,
        hotkey: "u",
        hexidecimal_color: colors.bog,
        color_type: color_type.light,
        icon: null,
        dark_icon: null,
        light_icon: null
    },
    plains: {
        id: "plains",
        display_name: "Plains",
        category: category.background,
        hotkey: "u",
        hexidecimal_color: colors.plains,
        color_type: color_type.light,
        icon: null,
        dark_icon: null,
        light_icon: null
    },
    forest: {
        id: "forest",
        display_name: "Forest",
        category: category.background,
        hotkey: "u",
        hexidecimal_color: colors.forest,
        color_type: color_type.light,
        icon: null,
        dark_icon: null,
        light_icon: null
    },
    desert: {
        id: "desert",
        display_name: "Desert",
        category: category.background,
        hotkey: "u",
        hexidecimal_color: colors.desert,
        color_type: color_type.light,
        icon: null,
        dark_icon: null,
        light_icon: null
    },
    hills: {
        id: "hills",
        display_name: "Hills",
        category: category.background,
        hotkey: "u",
        hexidecimal_color: colors.hills,
        color_type: color_type.light,
        icon: null,
        dark_icon: null,
        light_icon: null
    },
    village: {
        id: "village",
        display_name: "Village",
        category: category.icon,
        hotkey: "u",
        hexidecimal_color: colors.white,
        color_type: color_type.light,
        icon: svg_url_village_black,
        dark_icon: svg_url_village_black,
        light_icon: svg_url_village_white
    },
    clear_icon: {
        id: "clear_icon",
        display_name: "Clear",
        category: category.icon,
        hotkey: "u",
        hexidecimal_color: colors.white,
        color_type: color_type.light,
        icon: svg_url_unset,
        dark_icon: null,
        light_icon: null
    },
    river: {
        id: "river",
        display_name: "River",
        category: category.path,
        hotkey: "u",
        hexidecimal_color: colors.white,
        color_type: color_type.light,
        icon: svg_url_river,
        dark_icon: null,
        light_icon: null
    },
    road: {
        id: "road",
        display_name: "Road",
        category: category.path,
        hotkey: "u",
        hexidecimal_color: colors.white,
        color_type: color_type.light,
        icon: svg_url_road,
        dark_icon: null,
        light_icon: null
    },
    clear_path: {
        id: "clear_path",
        display_name: "Clear",
        category: category.path,
        hotkey: "u",
        hexidecimal_color: colors.white,
        color_type: color_type.light,
        icon: svg_url_unset,
        dark_icon: null,
        light_icon: null
    },
}

export default paint_brushes