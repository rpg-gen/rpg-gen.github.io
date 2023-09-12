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

const paint_brushes: {[key: string]: paint_brush} = {
    query: {
        name: "Query",
        category: category.action,
        hotkey: "u",
        hexidecimal_color: colors.white,
        color_type: color_type.light,
        icon: svg_url_magnifying_glass,
        dark_icon: null,
        light_icon: null
    },
    unset: {
        name: "Unset",
        category: category.background,
        hotkey: "u",
        hexidecimal_color: colors.unset,
        color_type: color_type.light,
        icon: null,
        dark_icon: null,
        light_icon: null
    },
    ocean: {
        name: "Ocean",
        category: category.background,
        hotkey: "u",
        hexidecimal_color: colors.ocean,
        color_type: color_type.dark,
        icon: null,
        dark_icon: null,
        light_icon: null
    },
    mountain: {
        name: "Mountain",
        category: category.background,
        hotkey: "u",
        hexidecimal_color: colors.mountain,
        color_type: color_type.dark,
        icon: null,
        dark_icon: null,
        light_icon: null
    },
    bog: {
        name: "Bog",
        category: category.background,
        hotkey: "u",
        hexidecimal_color: colors.bog,
        color_type: color_type.dark,
        icon: null,
        dark_icon: null,
        light_icon: null
    },
    plains: {
        name: "Plains",
        category: category.background,
        hotkey: "u",
        hexidecimal_color: colors.plains,
        color_type: color_type.light,
        icon: null,
        dark_icon: null,
        light_icon: null
    },
    forest: {
        name: "Forest",
        category: category.background,
        hotkey: "u",
        hexidecimal_color: colors.forest,
        color_type: color_type.dark,
        icon: null,
        dark_icon: null,
        light_icon: null
    },
    desert: {
        name: "Desert",
        category: category.background,
        hotkey: "u",
        hexidecimal_color: colors.desert,
        color_type: color_type.light,
        icon: null,
        dark_icon: null,
        light_icon: null
    },
    hills: {
        name: "Hills",
        category: category.background,
        hotkey: "u",
        hexidecimal_color: colors.hills,
        color_type: color_type.dark,
        icon: null,
        dark_icon: null,
        light_icon: null
    },
    village: {
        name: "Village",
        category: category.icon,
        hotkey: "u",
        hexidecimal_color: colors.white,
        color_type: color_type.light,
        icon: svg_url_village_black,
        dark_icon: svg_url_village_black,
        light_icon: svg_url_village_white
    },
    clear: {
        name: "Clear",
        category: category.icon,
        hotkey: "u",
        hexidecimal_color: colors.white,
        color_type: color_type.light,
        icon: svg_url_unset,
        dark_icon: null,
        light_icon: null
    },
    river: {
        name: "River",
        category: category.icon,
        hotkey: "u",
        hexidecimal_color: colors.white,
        color_type: color_type.light,
        icon: svg_url_river,
        dark_icon: null,
        light_icon: null
    },
}

export default paint_brushes