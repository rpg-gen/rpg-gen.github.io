import colors from "../configs/colors"
import { useState, useContext, MouseEvent } from "react"
import PaintContext from "../contexts/paint_context"
import { category, color_type } from "../types/paint_brush"

export default function Hexagon({edge_length, row_number, column_number} : {edge_length: number, row_number: number, column_number: number}) {

    const paint_context = useContext(PaintContext)

    const [color_hexidecimal, set_color_hexidecimal] = useState(colors.unset)
    const [hex_color_type, set_hex_color_type] = useState(color_type.light)
    const [light_icon_url, set_light_icon_url]: [null | string, Function] = useState(null)
    const [dark_icon_url, set_dark_icon_url]: [null | string, Function] = useState(null)
    const [river_edges, set_river_edges] = useState<{[index: string]: boolean}>({
        top_left: false,
        top_right: false,
        right: false,
        bottom_right: false,
        bottom_left: false,
        left: false
    })

    // const css_filter = "invert(100%) sepia(0%) saturate(0%) hue-rotate(326deg) brightness(106%) contrast(101%);"

    const short_diagonal_length = Math.round(Math.sqrt(3) * edge_length)
    const long_diagonal_length = edge_length * 2
    const peak_height = edge_length / 2

    const boundary_height = edge_length
    const boundary_width = short_diagonal_length

    const top_left_point = "0" + " " + "0"
    const top_mid_point = short_diagonal_length / 2 + " " + (peak_height * -1)
    const top_right_point = short_diagonal_length + " " + "0"
    const bottom_right_point = short_diagonal_length + " " + edge_length
    const bottom_mid_point = short_diagonal_length / 2 + " " + (edge_length + peak_height)
    const bottom_left_point = "0" + " " + (edge_length)

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

        console.log(target.hexColumn + " " + target.hexRow + " " + target.hexRegion)

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
            <polygon
                data-hex-region="top-left"
                data-hex-row={row_number}
                data-hex-column={column_number}
                onClick={handle_hexagon_click}
                points={[top_left_point, top_mid_point, mid_mid_point].join(",")}
                stroke="transparent"
                fill="transparent"
                style={{
                    zIndex: "9"
                }}
            />
            <polygon
                data-hex-region="top-right"
                data-hex-row={row_number}
                data-hex-column={column_number}
                onClick={handle_hexagon_click}
                points={[top_mid_point, top_right_point, mid_mid_point].join(",")}
                stroke="transparent"
                fill="transparent"
                style={{
                    zIndex: "9"
                }}
            />
            <polygon
                data-hex-region="right"
                data-hex-row={row_number}
                data-hex-column={column_number}
                onClick={handle_hexagon_click}
                points={[top_right_point, bottom_right_point, mid_mid_point].join(",")}
                stroke="transparent"
                fill="transparent"
                style={{
                    zIndex: "9"
                }}
            />
            <polygon
                data-hex-region="bottom-right"
                data-hex-row={row_number}
                data-hex-column={column_number}
                onClick={handle_hexagon_click}
                points={[bottom_right_point, bottom_mid_point, mid_mid_point].join(",")}
                stroke="transparent"
                fill="blue"
                style={{
                    zIndex: "12"
                }}
            />
            <polygon
                data-hex-region="bottom-left"
                data-hex-row={row_number}
                data-hex-column={column_number}
                onClick={handle_hexagon_click}
                points={[bottom_mid_point, bottom_left_point, mid_mid_point].join(",")}
                stroke="transparent"
                fill="transparent"
                style={{
                    zIndex: "9"
                }}
            />
            <polygon
                data-hex-region="left"
                data-hex-row={row_number}
                data-hex-column={column_number}
                onClick={handle_hexagon_click}
                points={[bottom_left_point, top_left_point, mid_mid_point].join(",")}
                stroke="transparent"
                fill="transparent"
                style={{
                    zIndex: "9"
                }}
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

        {/* <svg

            style={{
                minWidth: boundary_width,
                position: "absolute",
                top: "0",
                bottom: "0",
                left: "0",
                right: "0",
                zIndex: "10"
            }}
            height={boundary_height}
            width={boundary_width}>
            <polygon
                data-hex-region="top-left"
                onClick={handle_hexagon_click}
                points={[top_left_point, top_mid_point, mid_mid_point].join(",")}
                stroke="transparent"
                fill="blue"
            />
        </svg> */}

        </>
    )
}