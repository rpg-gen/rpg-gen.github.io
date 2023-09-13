import colors from "../configs/colors"
import { useState, useContext, MouseEvent } from "react"
import PaintContext from "../contexts/paint_context"
import MapContext from "../contexts/map_context"
import { category, color_type } from "../types/paint_brush"
import hex_region_coordinates from "../types/hex_region_coordinates"
import { hex_region } from "../types/hex_region_coordinates"

const RIVER_WIDTH = 5

export default function Hexagon({edge_length, row_number, column_number} : {edge_length: number, row_number: number, column_number: number}) {

    const paint_context = useContext(PaintContext)
    const map_context = useContext(MapContext)

    const [color_hexidecimal, set_color_hexidecimal] = useState(colors.unset)
    const [hex_color_type, set_hex_color_type] = useState(color_type.light)
    const [light_icon_url, set_light_icon_url]: [null | string, Function] = useState(null)
    const [dark_icon_url, set_dark_icon_url]: [null | string, Function] = useState(null)

    const [is_top_left_river, set_is_top_left_river] = useState<boolean>(false)
    const [is_top_right_river, set_is_top_right_river] = useState<boolean>(false)
    const [is_right_river, set_is_right_river] = useState<boolean>(false)
    const [is_bottom_right_river, set_is_bottom_right_river] = useState<boolean>(false)
    const [is_bottom_left_river, set_is_bottom_left_river] = useState<boolean>(false)
    const [is_left_river, set_is_left_river] = useState<boolean>(false)

    const short_diagonal_length = Math.round(Math.sqrt(3) * edge_length)
    const long_diagonal_length = edge_length * 2
    const peak_height = edge_length / 2

    const boundary_height = edge_length
    const boundary_width = short_diagonal_length

    // Corner points
    const top_left_point = "0" + " " + "0"
    const top_mid_point = short_diagonal_length / 2 + " " + (peak_height * -1)
    const top_right_point = short_diagonal_length + " " + "0"
    const bottom_right_point = short_diagonal_length + " " + edge_length
    const bottom_mid_point = short_diagonal_length / 2 + " " + (edge_length + peak_height)
    const bottom_left_point = "0" + " " + (edge_length)

    // Mid-edge points
    const top_left_edge = short_diagonal_length / 4 + " " + (peak_height / 2) * -1
    const top_right_edge = short_diagonal_length * .75 + " " + (peak_height / 2) * -1
    const right_edge = short_diagonal_length + " " + edge_length / 2
    const bottom_right_edge = short_diagonal_length * .75 + " " + (edge_length + peak_height / 2)
    const bottom_left_edge = short_diagonal_length / 4 + " " + (edge_length + peak_height / 2)
    const left_edge = "0" + " " + edge_length / 2

    const mid_mid_point = short_diagonal_length / 2 + " " + (edge_length / 2)

    const polygon_points = [top_left_point, top_mid_point, top_right_point, bottom_right_point, bottom_mid_point, bottom_left_point]
    const polygon_points_string = polygon_points.join(",")

    function get_correct_icon_color() {
        if (hex_color_type == color_type.dark) {
            return light_icon_url || undefined
        }
        else {
            return dark_icon_url || undefined
        }
    }

    function handle_hexagon_click(event: MouseEvent) {

        const target = (event.target as HTMLElement).dataset

        const this_hex_region = target.hexRegion
        const hex_column = target.hexColumn
        const hex_row = target.hexRow

        if (paint_context.paint_brush.category == category.background) {
            set_color_hexidecimal(paint_context.paint_brush.hexidecimal_color)
            set_hex_color_type(paint_context.paint_brush.color_type)
        }

        if (paint_context.paint_brush.category == category.icon) {
            if (paint_context.paint_brush.name == "Clear") {
                set_dark_icon_url(null)
                set_light_icon_url(null)
            }
            else {
                set_light_icon_url(paint_context.paint_brush.light_icon)
                set_dark_icon_url(paint_context.paint_brush.dark_icon)
            }
        }
        if (paint_context.paint_brush.category == category.path) {
            const neighboring_hex_region_coordinates: hex_region_coordinates = map_context.get_neighbor_hex_region_coordinates(hex_column, hex_row, this_hex_region)

            const value_to_set = (paint_context.paint_brush.name == "Clear") ? false : true

            if (this_hex_region == hex_region.top_left) {set_is_top_left_river(value_to_set)}
            if (this_hex_region == hex_region.top_right) {set_is_top_right_river(value_to_set)}
            if (this_hex_region == hex_region.right) {set_is_right_river(value_to_set)}
            if (this_hex_region == hex_region.bottom_right) {set_is_bottom_right_river(value_to_set)}
            if (this_hex_region == hex_region.bottom_left) {set_is_bottom_left_river(value_to_set)}
            if (this_hex_region == hex_region.left) {set_is_left_river(value_to_set)}

            if (neighboring_hex_region_coordinates) {

            }
        }
    }

    function HexRegion(props: {this_hex_region: hex_region, point_a: string, point_mid: string, point_b: string, has_river: boolean}) {
        return (
            <>
            <polygon
                data-hex-region={props.this_hex_region}
                data-hex-row={row_number}
                data-hex-column={column_number}
                onClick={handle_hexagon_click}
                points={[props.point_a, props.point_b, mid_mid_point].join(",")}
                stroke="transparent"
                fill="transparent"
                style={{
                    zIndex: "9"
                }}
            />
            {
                props.has_river
                ? <polygon
                    stroke={colors.ocean}
                    strokeWidth={RIVER_WIDTH}
                    points={[mid_mid_point, props.point_mid].join(",")}
                    style={{zIndex: 1}}
                />
                : ""
            }
            </>
        )
    }

    return (
        <>

        <svg
            // style={{filter: css_color_filter, display: "inline-block"}}
            style={{
                minWidth: boundary_width,
                position: "absolute",
                top: "0",
                bottom: "0",
                left: "0",
                right: "0",
            }}
            height={boundary_height}
            width={boundary_width}
            overflow={"visible"}
        >
            {/* Background polygon */}
            <polygon
                onClick={handle_hexagon_click}
                points={polygon_points_string}
                fill={color_hexidecimal}
                stroke="black"
                strokeWidth=".2"
                style={{
                    zIndex: "9"
                }}
            />
            {/* Overlay transparent triangles */}
            <HexRegion
                this_hex_region={hex_region.top_left}
                point_a={top_left_point}
                point_mid={top_left_edge}
                point_b={top_mid_point}
                has_river={is_top_left_river}
            />
            <HexRegion
                this_hex_region={hex_region.top_right}
                point_a={top_mid_point}
                point_mid={top_right_edge}
                point_b={top_right_point}
                has_river={is_top_right_river}
            />
            <HexRegion
                this_hex_region={hex_region.right}
                point_a={top_right_point}
                point_mid={right_edge}
                point_b={bottom_right_point}
                has_river={is_right_river}
            />
            <HexRegion
                this_hex_region={hex_region.bottom_right}
                point_a={bottom_right_point}
                point_mid={bottom_right_edge}
                point_b={bottom_mid_point}
                has_river={is_bottom_right_river}
            />
            <HexRegion
                this_hex_region={hex_region.bottom_left}
                point_a={bottom_mid_point}
                point_mid={bottom_left_edge}
                point_b={bottom_left_point}
                has_river={is_bottom_left_river}
            />
            <HexRegion
                this_hex_region={hex_region.left}
                point_a={bottom_left_point}
                point_mid={left_edge}
                point_b={top_left_point}
                has_river={is_left_river}
            />
        </svg>

        {
            dark_icon_url || light_icon_url
            ?
                <img
                    style={{
                        zIndex: "9",
                        height: "50%",
                        // filter: css_filter

                    }}
                    src={get_correct_icon_color()}
                />

            : ""
        }

        </>
    )
}