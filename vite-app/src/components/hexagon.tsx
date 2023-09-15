import colors from "../configs/colors"
import { useState, useContext, MouseEvent } from "react"
import PaintContext from "../contexts/paint_context"
import MapContext from "../contexts/map_context"
import { category, color_type } from "../types/paint_brush"
import hex_region_coordinates from "../types/hex_region_coordinates"
import { hex_regions } from "../types/hex_region_coordinates"
import type_map_definition_record from "../types/type_map_definition_record"
import paint_brushes from "../configs/paint_brushes"

export default function Hexagon(props : {edge_length: number, row_number: number, column_number: number, map_definition_record: type_map_definition_record}) {

    const paint_context = useContext(PaintContext)
    const map_context = useContext(MapContext)

    const local_row_number = props.row_number
    const local_column_number = props.column_number
    const local_map_definition_record = props.map_definition_record
    const local_edge_length = props.edge_length

    const [color_hexidecimal, set_color_hexidecimal] = useState(colors.unset)
    const [hex_color_type, set_hex_color_type] = useState(color_type.light)
    const [light_icon_url, set_light_icon_url]: [null | string, Function] = useState(null)
    const [dark_icon_url, set_dark_icon_url]: [null | string, Function] = useState(null)

    const short_diagonal_length = Math.round(Math.sqrt(3) * props.edge_length)
    const long_diagonal_length = props.edge_length * 2
    const peak_height = props.edge_length / 2

    const boundary_height = props.edge_length
    const boundary_width = short_diagonal_length

    // Corner points
    const top_left_point = "0" + " " + "0"
    const top_mid_point = short_diagonal_length / 2 + " " + (peak_height * -1)
    const top_right_point = short_diagonal_length + " " + "0"
    const bottom_right_point = short_diagonal_length + " " + props.edge_length
    const bottom_mid_point = short_diagonal_length / 2 + " " + (props.edge_length + peak_height)
    const bottom_left_point = "0" + " " + (props.edge_length)

    // Mid-edge points
    const top_left_road_edge = short_diagonal_length / 4 + " " + (peak_height / 2) * -1
    const top_right_road_edge = short_diagonal_length * .75 + " " + (peak_height / 2) * -1
    const right_road_edge = short_diagonal_length + " " + props.edge_length / 2
    const bottom_right_road_edge = short_diagonal_length * .75 + " " + (props.edge_length + peak_height / 2)
    const bottom_left_road_edge = short_diagonal_length / 4 + " " + (props.edge_length + peak_height / 2)
    const left_road_edge = "0" + " " + props.edge_length / 2

    const top_left_river_edge = (short_diagonal_length / 4) + " " + ((peak_height / 2) * -1)
    const top_right_river_edge = (short_diagonal_length * .75) + " " + ((peak_height / 2) * -1)
    const right_river_edge = short_diagonal_length + " " + (props.edge_length / 2)
    const bottom_right_river_edge = (short_diagonal_length * .75) + " " + (props.edge_length + peak_height / 2)
    const bottom_left_river_edge = (short_diagonal_length / 4) + " " + (props.edge_length + peak_height / 2)
    const left_river_edge = "0" + " " + (props.edge_length / 2)

    const mid_mid_point = short_diagonal_length / 2 + " " + (props.edge_length / 2)
    const mid_mid_road_point = mid_mid_point
    const mid_mid_river_point = (short_diagonal_length / 2) + " " + (props.edge_length / 2)

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
            if (paint_context.paint_brush.display_name == "Clear") {
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
            const map_definition_key = hex_column + "_" + hex_row
            const neighbor_map_definition_key = neighboring_hex_region_coordinates.column_number + "_" + neighboring_hex_region_coordinates.row_number

            function set_path(paint_brush_id: string, value: boolean) {
                const map_definition_segment = "is_" + this_hex_region + "_" + paint_brush_id
                map_context.update_map_definition(map_definition_key, map_definition_segment, value)

                if (neighboring_hex_region_coordinates) {
                    const neighbor_map_definition_segment = "is_" + neighboring_hex_region_coordinates.hex_region + "_" + paint_brush_id
                    map_context.update_map_definition(neighbor_map_definition_key, neighbor_map_definition_segment, value)
                }
            }

            if (paint_context.paint_brush.display_name == "Clear") {
                for (const paint_brush_index in paint_brushes) {
                    const this_paint_brush = paint_brushes[paint_brush_index]
                    if (this_paint_brush.category == category.path) {
                            set_path(this_paint_brush.id, false)
                    }
                }
            }
            else {
                set_path(paint_context.paint_brush.id, true)
            }
        }
    }

    function RiverPolygon(props: {edge_point: string}) {
        return (<>
            <polygon
                stroke={colors.ocean}
                strokeWidth={local_edge_length / 10}
                points={[mid_mid_river_point, props.edge_point].join(",")}
                strokeLinejoin="round"
            />
        </>)
    }

    function RoadPolygon(props: {edge_point: string, dash_pattern: string}) {
        return (<>
            <polygon
                stroke={colors.road}
                strokeWidth={local_edge_length / 10}
                points={[mid_mid_road_point, props.edge_point].join(",")}
                strokeLinejoin="round"
                strokeDasharray={props.dash_pattern}
            />
        </>)
    }

    function EdgePolygonWhiteBackground(props: {edge_point: string}) {
        return (<>

            {/* <polygon
                stroke={colors.white}
                strokeWidth={local_edge_length / 8}
                points={[mid_mid_river_point, props.edge_point].join(",")}
                strokeLinejoin="miter"
            /> */}



        </>)
    }

    function get_edge_polygons(edge_point: string, is_river: boolean | undefined, is_road: boolean| undefined) {
        const dash_pattern = ((is_river && is_road) ? "10%,20%" : "")

        const draw_array: {draw_order: number, jsx_element: JSX.Element}[] = []

        if (is_river || is_road) {draw_array.push({draw_order: 1, jsx_element: <EdgePolygonWhiteBackground key={"back_" + edge_point} edge_point={edge_point} />})}
        if (is_river) {draw_array.push({draw_order: 2, jsx_element: <RiverPolygon key={"river_" + edge_point} edge_point={edge_point} />})}
        if (is_road) {draw_array.push({draw_order: 3, jsx_element: <RoadPolygon key={"road_" + edge_point} edge_point={edge_point} dash_pattern={dash_pattern} />})}


        return draw_array
    }

    function HexIcons() {

        let path_array: {draw_order: number, jsx_element: JSX.Element}[] = []

        path_array = path_array.concat([...get_edge_polygons(top_left_road_edge, local_map_definition_record.is_top_left_river, local_map_definition_record.is_top_left_road)])
        path_array = path_array.concat([...get_edge_polygons(top_right_road_edge, local_map_definition_record.is_top_right_river, local_map_definition_record.is_top_right_road)])
        path_array = path_array.concat([...get_edge_polygons(right_road_edge, local_map_definition_record.is_right_river, local_map_definition_record.is_right_road)])
        path_array = path_array.concat([...get_edge_polygons(bottom_right_road_edge, local_map_definition_record.is_bottom_right_river, local_map_definition_record.is_bottom_right_road)])
        path_array = path_array.concat([...get_edge_polygons(bottom_left_road_edge, local_map_definition_record.is_bottom_left_river, local_map_definition_record.is_bottom_left_road)])
        path_array = path_array.concat([...get_edge_polygons(left_road_edge, local_map_definition_record.is_left_river, local_map_definition_record.is_left_road)])

        path_array.sort((a, b) => (a.draw_order > b.draw_order ? 1 : -1))

        return (
            <>

            <svg
                style={{
                    minWidth: boundary_width,
                    position: "absolute",
                    top: "0",
                    bottom: "0",
                    left: "0",
                    right: "0",
                    zIndex: 8
                }}
                height={boundary_height}
                width={boundary_width}
                overflow={"visible"}
            >
                {path_array.map((x) => x.jsx_element)}
            </svg>
                {/* {
                    dark_icon_url || light_icon_url
                    ?
                        <img
                            style={{
                                zIndex: "8",
                                height: "100%",
                                position: "absolute",

                            }}
                            src={get_correct_icon_color()}
                        />

                    : ""
                } */}
            </>

        )
    }

    function ClickableHexRegion(props: {this_hex_region: hex_regions, point_a: string, point_b: string}) {

        return (
            <>
                <polygon
                    data-hex-region={props.this_hex_region}
                    data-hex-row={local_row_number}
                    data-hex-column={local_column_number}
                    onClick={handle_hexagon_click}
                    points={[props.point_a, props.point_b, mid_mid_point].join(",")}
                    fill="transparent"
                    className="hover-element"
                    strokeWidth={0}
                />

            </>
        )
    }

    function ClickableHexagon() {
        return (<>

            <svg
                style={{
                    minWidth: boundary_width,
                    position: "absolute",
                    top: "0",
                    bottom: "0",
                    left: "0",
                    right: "0",
                    zIndex: 9
                }}
                height={boundary_height}
                width={boundary_width}
                overflow={"visible"}
            >
                <ClickableHexRegion this_hex_region={hex_regions.top_left} point_a={top_left_point} point_b={top_mid_point} />
                <ClickableHexRegion this_hex_region={hex_regions.top_right} point_a={top_mid_point} point_b={top_right_point} />
                <ClickableHexRegion this_hex_region={hex_regions.right} point_a={top_right_point} point_b={bottom_right_point} />
                <ClickableHexRegion this_hex_region={hex_regions.bottom_right} point_a={bottom_right_point} point_b={bottom_mid_point} />
                <ClickableHexRegion this_hex_region={hex_regions.bottom_left} point_a={bottom_mid_point} point_b={bottom_left_point} />
                <ClickableHexRegion this_hex_region={hex_regions.left} point_a={bottom_left_point} point_b={top_left_point} />
            </svg>

        </>)
    }

    function BackgroundHexagon() {
        return (<>

            <svg
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
                    points={polygon_points_string}
                    fill={color_hexidecimal}
                    stroke="black"
                    strokeWidth=".2"
                    style={{
                        zIndex: "7"
                    }}
                />
            </svg>

        </>)
    }

    return (
        <>

        <div
            style={{
                height: props.edge_length,
                width: short_diagonal_length,
                position: "relative",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexShrink: 0,
                zIndex: 0,
                marginTop: props.edge_length / 2 + "px"
            }}
        >
            <BackgroundHexagon />
            <HexIcons />
            <ClickableHexagon />

        </div>

        </>
    )
}