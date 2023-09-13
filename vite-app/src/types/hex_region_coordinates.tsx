enum hex_region {
    top_left= "top-left",
    top_right="top_right",
    right="right",
    bottom_right="bottom_right",
    bottom_left="bottom_left",
    left="left"
}

type hex_region_coordinates = {
    column_number: number,
    row_number: number,
    hex_region: hex_region
}

export default hex_region_coordinates
export { hex_region }