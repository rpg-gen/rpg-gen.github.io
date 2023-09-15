type type_map_definition_record = {
    [index: string]: string | boolean | undefined,
    background_color_hexidecimal?: string,

    is_top_left_river?: boolean,
    is_top_right_river?: boolean,
    is_right_river?: boolean,
    is_bottom_right_river?: boolean,
    is_bottom_left_river?: boolean,
    is_left_river?: boolean,

    is_top_left_road?: boolean,
    is_top_right_road?: boolean,
    is_right_road?: boolean,
    is_bottom_right_road?: boolean,
    is_bottom_left_road?: boolean,
    is_left_road?: boolean
}

export default type_map_definition_record