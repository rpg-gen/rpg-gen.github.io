type type_paint_brush = {
    id: string,
    display_name: string,
    description: string,
    paint_category: paint_category,
    hotkey: string,
    hexidecimal_color: string,
    color_type: color_type
    icon: string | null,
    dark_icon: string | null,
    light_icon: string | null
}

enum color_type {
    light="light",
    dark="dark"
}

enum paint_category {
    background="background",
    action="action",
    icon="icon",
    path="path"
}

export { paint_category, color_type}

export default type_paint_brush