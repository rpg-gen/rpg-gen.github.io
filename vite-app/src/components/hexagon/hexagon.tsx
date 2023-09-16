import colors from "../../configs/colors"
import { useState, useContext, MouseEvent, memo } from "react"
// import PaintContext from "../../contexts/paint_context"
// import MapContext from "../../contexts/map_context"
import { paint_category, color_type } from "../../types/type_paint_brush"
import hex_region_coordinates from "../../types/hex_region_coordinates"
import { hex_regions } from "../../types/hex_region_coordinates"
import type_hexagon_definition from "../../types/type_hexagon_definition"
import paint_brushes from "../../configs/paint_brushes"
import ClickableHexagon from "./clickable_hexagon"

export default memo(function Hexagon(props : {edge_length: number, row_number: string, column_number: string, hexagon_definition: type_hexagon_definition}) {

    console.log("hexagon rerendered")

    // const paint_context = useContext(PaintContext)
    // const map_context = useContext(MapContext)

    // const local_row_number = props.row_number
    // const local_column_number = props.column_number
    // const local_map_definition_record = props.map_definition_record
    // const local_edge_length = props.edge_length

    // const [color_hexidecimal, set_color_hexidecimal] = useState(colors.unset)
    // const [hex_color_type, set_hex_color_type] = useState(color_type.light)
    // const [light_icon_url, set_light_icon_url]: [null | string, Function] = useState(null)
    // const [dark_icon_url, set_dark_icon_url]: [null | string, Function] = useState(null)

    // const short_diagonal_length = Math.round(Math.sqrt(3) * props.edge_length)
    // const long_diagonal_length = props.edge_length * 2
    // const peak_height = props.edge_length / 2

    // const boundary_height = props.edge_length
    // const boundary_width = short_diagonal_length

    // Corner points
    // const top_left_point = "0" + " " + "0"
    // const top_mid_point = short_diagonal_length / 2 + " " + (peak_height * -1)
    // const top_right_point = short_diagonal_length + " " + "0"
    // const bottom_right_point = short_diagonal_length + " " + props.edge_length
    // const bottom_mid_point = short_diagonal_length / 2 + " " + (props.edge_length + peak_height)
    // const bottom_left_point = "0" + " " + (props.edge_length)

    // Mid-edge points
    // const top_left_road_edge = short_diagonal_length / 4 + " " + (peak_height / 2) * -1
    // const top_right_road_edge = short_diagonal_length * .75 + " " + (peak_height / 2) * -1
    // const right_road_edge = short_diagonal_length + " " + props.edge_length / 2
    // const bottom_right_road_edge = short_diagonal_length * .75 + " " + (props.edge_length + peak_height / 2)
    // const bottom_left_road_edge = short_diagonal_length / 4 + " " + (props.edge_length + peak_height / 2)
    // const left_road_edge = "0" + " " + props.edge_length / 2

    // const top_left_river_edge = (short_diagonal_length / 4) + " " + ((peak_height / 2) * -1)
    // const top_right_river_edge = (short_diagonal_length * .75) + " " + ((peak_height / 2) * -1)
    // const right_river_edge = short_diagonal_length + " " + (props.edge_length / 2)
    // const bottom_right_river_edge = (short_diagonal_length * .75) + " " + (props.edge_length + peak_height / 2)
    // const bottom_left_river_edge = (short_diagonal_length / 4) + " " + (props.edge_length + peak_height / 2)
    // const left_river_edge = "0" + " " + (props.edge_length / 2)

    // const mid_mid_point = short_diagonal_length / 2 + " " + (props.edge_length / 2)
    // const mid_mid_road_point = mid_mid_point
    // const mid_mid_river_point = (short_diagonal_length / 2) + " " + (props.edge_length / 2)

    // const polygon_points = [top_left_point, top_mid_point, top_right_point, bottom_right_point, bottom_mid_point, bottom_left_point]
    // const polygon_points_string = polygon_points.join(",")

    // function get_correct_icon_color() {
    //     if (hex_color_type == color_type.dark) {
    //         return light_icon_url || undefined
    //     }
    //     else {
    //         return dark_icon_url || undefined
    //     }
    // }

    // function handle_hexagon_click(event: MouseEvent) {

        // const target = (event.target as HTMLElement).dataset

        // const this_hex_region = target.hexRegion
        // const hex_column = target.hexColumn
        // const hex_row = target.hexRow

        // const map_definition_key = hex_column + "_" + hex_row

        // if (paint_context.paint_brush.category == category.background) {
        //     set_color_hexidecimal(paint_context.paint_brush.hexidecimal_color)
        //     set_hex_color_type(paint_context.paint_brush.color_type)
        // }

        // if (paint_context.paint_brush.category == category.icon) {
        //     if (paint_context.paint_brush.display_name == "Clear") {
        //         map_context.update_map_definition(map_definition_key, "town_size", 0)
        //     }
        //     else if (paint_context.paint_brush.id == "village") {
        //         map_context.update_map_definition(map_definition_key, "town_size", 1)
        //     }
        //     else if (paint_context.paint_brush.id == "town") {
        //         map_context.update_map_definition(map_definition_key, "town_size", 2)
        //     }
        //     else if (paint_context.paint_brush.id == "city") {
        //         map_context.update_map_definition(map_definition_key, "town_size", 3)
        //     }
        // }

        // if (paint_context.paint_brush.category == category.path) {
        //     const neighboring_hex_region_coordinates: hex_region_coordinates = map_context.get_neighbor_hex_region_coordinates(hex_column, hex_row, this_hex_region)

        //     const neighbor_map_definition_key = neighboring_hex_region_coordinates.column_number + "_" + neighboring_hex_region_coordinates.row_number

        //     function set_path(paint_brush_id: string, value: boolean) {
        //         const map_definition_segment = "is_" + this_hex_region + "_" + paint_brush_id
        //         map_context.update_map_definition(map_definition_key, map_definition_segment, value)

        //         if (neighboring_hex_region_coordinates) {
        //             const neighbor_map_definition_segment = "is_" + neighboring_hex_region_coordinates.hex_region + "_" + paint_brush_id
        //             map_context.update_map_definition(neighbor_map_definition_key, neighbor_map_definition_segment, value)
        //         }
        //     }

        //     if (paint_context.paint_brush.display_name == "Clear") {
        //         for (const paint_brush_index in paint_brushes) {
        //             const this_paint_brush = paint_brushes[paint_brush_index]
        //             if (this_paint_brush.category == category.path) {
        //                     set_path(this_paint_brush.id, false)
        //             }
        //         }
        //     }
        //     else {
        //         set_path(paint_context.paint_brush.id, true)
        //     }
        // }
    // }

    // function RiverPolygon(props: {edge_point: string}) {
    //     return (<>
    //         <polygon
    //             stroke={colors.ocean}
    //             strokeWidth={local_edge_length / 10}
    //             points={[mid_mid_river_point, props.edge_point].join(",")}
    //             strokeLinejoin="miter"
    //         />
    //     </>)
    // }

    // function RoadPolygon(props: {edge_point: string, dash_pattern: string}) {
    //     return (<>
    //         <polygon
    //             stroke={colors.road}
    //             strokeWidth={local_edge_length / 10}
    //             points={[mid_mid_road_point, props.edge_point].join(",")}
    //             strokeLinejoin="miter"
    //             strokeDasharray={props.dash_pattern}
    //         />
    //     </>)
    // }

    // function EdgePolygonWhiteBackground(props: {edge_point: string}) {
    //     return (<>

    //         {/* <polygon
    //             stroke={colors.white}
    //             strokeWidth={local_edge_length / 8}
    //             points={[mid_mid_river_point, props.edge_point].join(",")}
    //             strokeLinejoin="miter"
    //         /> */}



    //     </>)
    // }

    // function get_edge_polygons(edge_point: string, is_river: boolean | undefined, is_road: boolean| undefined) {
    //     const dash_pattern = ((is_river && is_road) ? "10%,20%" : "")

    //     const draw_array: {draw_order: number, jsx_element: JSX.Element}[] = []

    //     if (is_river || is_road) {draw_array.push({draw_order: 1, jsx_element: <EdgePolygonWhiteBackground key={"back_" + edge_point} edge_point={edge_point} />})}
    //     if (is_river) {draw_array.push({draw_order: 2, jsx_element: <RiverPolygon key={"river_" + edge_point} edge_point={edge_point} />})}
    //     if (is_road) {draw_array.push({draw_order: 3, jsx_element: <RoadPolygon key={"road_" + edge_point} edge_point={edge_point} dash_pattern={dash_pattern} />})}


    //     return draw_array
    // }

    // function HexIcons() {

    //     let path_array: {draw_order: number, jsx_element: JSX.Element}[] = []

    //     path_array = path_array.concat([...get_edge_polygons(top_left_road_edge, local_map_definition_record.is_top_left_river, local_map_definition_record.is_top_left_road)])
    //     path_array = path_array.concat([...get_edge_polygons(top_right_road_edge, local_map_definition_record.is_top_right_river, local_map_definition_record.is_top_right_road)])
    //     path_array = path_array.concat([...get_edge_polygons(right_road_edge, local_map_definition_record.is_right_river, local_map_definition_record.is_right_road)])
    //     path_array = path_array.concat([...get_edge_polygons(bottom_right_road_edge, local_map_definition_record.is_bottom_right_river, local_map_definition_record.is_bottom_right_road)])
    //     path_array = path_array.concat([...get_edge_polygons(bottom_left_road_edge, local_map_definition_record.is_bottom_left_river, local_map_definition_record.is_bottom_left_road)])
    //     path_array = path_array.concat([...get_edge_polygons(left_road_edge, local_map_definition_record.is_left_river, local_map_definition_record.is_left_road)])

    //     path_array.push({draw_order: 4, jsx_element: <TownIcon key={"town"} town_size={local_map_definition_record.town_size} />})

    //     path_array.sort((a, b) => (a.draw_order > b.draw_order ? 1 : -1))

    //     return (
    //         <>

    //         <svg
    //             style={{
    //                 minWidth: boundary_width,
    //                 position: "absolute",
    //                 top: "0",
    //                 bottom: "0",
    //                 left: "0",
    //                 right: "0",
    //                 zIndex: 8
    //             }}
    //             height={boundary_height}
    //             width={boundary_width}
    //             overflow={"visible"}
    //         >
    //             {path_array.map((x) => x.jsx_element)}
    //         </svg>
    //             {/* {
    //                 dark_icon_url || light_icon_url
    //                 ?
    //                     <img
    //                         style={{
    //                             zIndex: "8",
    //                             height: "100%",
    //                             position: "absolute",

    //                         }}
    //                         src={get_correct_icon_color()}
    //                     />

    //                 : ""
    //             } */}
    //         </>

    //     )
    // }

    // function TownIcon(props: {town_size: number | undefined}) {
    //     const polygon_array: JSX.Element[] = []

    //     const center_x_point = boundary_width / 2
    //     const center_y_point = boundary_height / 2

    //     if (props.town_size == undefined || props.town_size == 0) {

    //     }
    //     else if (props.town_size == 1) {
    //         polygon_array.push(<HouseIcon key={"town_1"} center_x_point={center_x_point} center_y_point={center_y_point} />)
    //     }
    //     else if (props.town_size == 2) {
    //         polygon_array.push(<HouseIcon key={"town_1"} center_x_point={center_x_point + boundary_width/7} center_y_point={center_y_point} />)
    //         polygon_array.push(<HouseIcon key={"town_2"} center_x_point={center_x_point - boundary_width/7} center_y_point={center_y_point} />)
    //     }
    //     else if (props.town_size == 3) {
    //         polygon_array.push(<HouseIcon key={"town_1"} center_x_point={center_x_point} center_y_point={center_y_point - boundary_height/6} />)
    //         polygon_array.push(<HouseIcon key={"town_2"} center_x_point={center_x_point + boundary_width/7} center_y_point={center_y_point + boundary_height/6} />)
    //         polygon_array.push(<HouseIcon key={"town_3"} center_x_point={center_x_point - boundary_width/7} center_y_point={center_y_point + boundary_height/6} />)
    //     }

    //     return (<>

    //         {polygon_array}

    //     </>)
    // }

    // function HouseIcon(props: {center_x_point: number, center_y_point: number}) {

    //     const rectangle_height = boundary_height / 5
    //     const rectangle_width = boundary_height / 3

    //     const points_array = [
    //         (props.center_x_point - rectangle_width / 2) + " " + (props.center_y_point - rectangle_height / 2),
    //         (props.center_x_point - rectangle_width / 1.5) + " " + (props.center_y_point - rectangle_height / 2),
    //         (props.center_x_point) + " " + (props.center_y_point - rectangle_height*1.25),
    //         (props.center_x_point + rectangle_width / 1.5) + " " + (props.center_y_point - rectangle_height / 2),
    //         (props.center_x_point + rectangle_width / 2) + " " + (props.center_y_point - rectangle_height / 2),
    //         (props.center_x_point + rectangle_width / 2) + " " + (props.center_y_point + rectangle_height / 2),
    //         (props.center_x_point - rectangle_width / 2) + " " + (props.center_y_point + rectangle_height / 2),
    //     ]

    //     return (<polygon points={points_array.join(",")} strokeWidth={5} stroke={"black"} strokeLinejoin={"round"} />)
    // }




    // function BackgroundHexagon(props: {color_hexidecimal: string}) {
    //     return (<>

    //         <svg
    //             // style={{
    //             //     minWidth: boundary_width,
    //             //     position: "absolute",
    //             //     top: "0",
    //             //     bottom: "0",
    //             //     left: "0",
    //             //     right: "0",
    //             // }}
    //             height={boundary_height}
    //             width={boundary_width}
    //             overflow={"visible"}
    //         >
    //             <polygon
    //                 points={polygon_points_string}
    //                 fill={props.color_hexidecimal}
    //                 stroke="black"
    //                 strokeWidth=".2"
    //                 // style={{
    //                 //     zIndex: "7"
    //                 // }}
    //             />
    //         </svg>

    //     </>)
    // }

    return (
        <>

        {/* <div
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
        > */}
            {/* <BackgroundHexagon color_hexidecimal={props.hexagon_definition.background_color_hexidecimal} /> */}
            {/* <HexIcons /> */}
            <ClickableHexagon edge_length={props.edge_length} row_number={props.row_number} column_number={props.column_number} />

        {/* </div> */}

        </>
    )
})