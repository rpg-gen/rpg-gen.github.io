import get_css_filter from "../utility/get_css_filter"

export default function Hexagon({edge_length, color_hexidecimal} : {edge_length: number, color_hexidecimal: String}) {

    const short_diagonal_length = Math.round(Math.sqrt(3) * edge_length)
    const long_diagonal_length = edge_length * 2
    const peak_height = edge_length / 2

    const boundary_height = edge_length * 2
    const boundary_width = short_diagonal_length

    const top_left_point = "0" + " " + peak_height
    const top_mid_point = short_diagonal_length / 2 + " 0"
    const top_right_point = short_diagonal_length + " " + peak_height
    const bottom_right_point = short_diagonal_length + " " + (boundary_height - peak_height)
    const bottom_mid_point = short_diagonal_length / 2 + " " + long_diagonal_length
    const bottom_left_point = "0" + " " + (boundary_height - peak_height)

    const polygon_points = [top_left_point, top_mid_point, top_right_point, bottom_right_point, bottom_mid_point, bottom_left_point]
    const polygon_points_string = polygon_points.join(",")

    const css_color_filter = get_css_filter(color_hexidecimal)

    function handle_hexagon_click() {
        console.log("clicked")
    }


    return (
        <svg 
            style={{filter: css_color_filter, display: "inline-block"}}
            height={boundary_height} 
            width={boundary_width}>
            <polygon 
                onClick={handle_hexagon_click}
                points={polygon_points_string}
                stroke="black"
            />
        </svg>
    )
}