type paint_brush = {
    name: string,
    category: category,
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

enum category {
    background="background",
    action="action",
    icon="icon",
    path="path"
}

export { category, color_type}

export default paint_brush