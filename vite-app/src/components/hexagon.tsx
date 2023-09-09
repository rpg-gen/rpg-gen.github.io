import colors from "../configs/colors"
import { useState, useContext } from "react"
import PaintContext from "../contexts/paint_context"

export default function Hexagon({edge_length, row_number, column_number} : {edge_length: number, row_number: number, column_number: number}) {

    const paint_context = useContext(PaintContext)

    const [color_hexidecimal, set_color_hexidecimal] = useState(colors.unset)

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

    // const css_color_filter = get_css_filter(color_hexidecimal)

    function handle_hexagon_click() {
        if (paint_context.paint_brush.is_full_hex_color) {
            console.log(row_number, column_number)
            set_color_hexidecimal(paint_context.paint_brush.hexidecimal_color)
        }
    }

    return (
        <svg
            // style={{filter: css_color_filter, display: "inline-block"}}
            style={{
                minWidth: boundary_width
            }}
            height={boundary_height}
            width={boundary_width}>
            <polygon
                onClick={handle_hexagon_click}
                points={polygon_points_string}
                fill={color_hexidecimal}
                stroke="black"
                strokeWidth=".2"
            />
        </svg>
    )
}