// Keep this draw-agnostic, meaning nothing that depends on the zoom etc. This is just the information we'd need to re-draw the same hexagon in whatever context

type type_hexagon_definition = {
    row_number: number,
    column_number: number,
    background_color_hexidecimal: string,
    is_top_left_river: boolean,
    is_top_right_river: boolean,
    is_right_river: boolean,
    is_bottom_right_river: boolean,
    is_bottom_left_river: boolean,
    is_left_river: boolean,
    is_top_left_road: boolean,
    is_top_right_road: boolean,
    is_right_road: boolean,
    is_bottom_right_road: boolean,
    is_bottom_left_road: boolean,
    is_left_road: boolean,
    text: string,
    icon_name: string,
}

export default type_hexagon_definition