import colors from "../../configs/colors"
import { useState, useContext, MouseEvent, memo, MouseEventHandler } from "react"
// import PaintContext from "../../contexts/paint_context"
// import MapContext from "../../contexts/map_context"
import { paint_category, color_type } from "../../types/type_paint_brush"
import hex_region_coordinates from "../../types/hex_region_coordinates"
import { hex_regions } from "../../types/hex_region_coordinates"
import type_hexagon_definition from "../../types/type_hexagon_definition"
import paint_brushes from "../../configs/paint_brushes"
import ClickableHexagon from "./clickable_hexagon"
import hexagon_math from "../../utility/hexagon_math"
import enum_grid_type from "../../types/enum_grid_type"

function default_handle_hex_click(e: MouseEvent) {e.preventDefault}

export default memo(function Hexagon(props: {
    edge_length: number,
    row_number: string,
    column_number: string,
    hexagon_definition: type_hexagon_definition,
}) {

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

    const all_points = hexagon_math.get_points(props.edge_length, parseInt(props.row_number), parseInt(props.column_number))
    const polygon_points = [
        all_points.top_left,
        all_points.top_mid,
        all_points.top_right,
        all_points.bottom_right,
        all_points.bottom_mid,
        all_points.bottom_left,
    ]
    const polygon_points_string = polygon_points.join(",")

    const polygons_to_render = []

    // if (props.type == enum_grid_type.background) {
    polygons_to_render.push(
        <polygon
            key={props.row_number + "_" + props.column_number}
            points={polygon_points_string}
            fill={props.hexagon_definition.background_color_hexidecimal}
            stroke="black"
            strokeWidth=".2"
        />
    )
    polygons_to_render.push(
        <polygon
            key={props.row_number + "_1" + props.column_number}
            points={polygon_points_string}
            fill={props.hexagon_definition.background_color_hexidecimal}
            stroke="black"
            strokeWidth=".2"
        />
    )
    polygons_to_render.push(
        <polygon
            key={props.row_number + "_2" + props.column_number}
            points={polygon_points_string}
            fill={props.hexagon_definition.background_color_hexidecimal}
            stroke="black"
            strokeWidth=".2"
        />
    )
    // }
    // else if (props.type == enum_grid_type.clickable) {
    //     polygons_to_render.push(
    //         <polygon
    //             key={props.row_number + "_" + props.column_number}
    //             points={polygon_points_string}
    //             fill="transparent"
    //             stroke="transparent"
    //             className="hover-element"
    //             data-column-number={props.column_number}
    //             data-row-number={props.row_number}
    //             onClick={props.click_function || default_handle_hex_click}
    //         />
    //     )
    // }

    return (

        // <svg
        //     overflow={"visible"}
        //     height={props.edge_length + hexagon_math.get_peak_height(props.edge_length)}
        //     width={hexagon_math.get_short_diagonal_length(props.edge_length)}
        // >
            <>{polygons_to_render}</>
        // </svg>

    )

    // return (
    //     <>

    //     {/* <div
    //         style={{
    //             height: props.edge_length,
    //             width: short_diagonal_length,
    //             position: "relative",
    //             display: "flex",
    //             justifyContent: "center",
    //             alignItems: "center",
    //             flexShrink: 0,
    //             zIndex: 0,
    //             marginTop: props.edge_length / 2 + "px"
    //         }}
    //     > */}
    //         <BackgroundHexagon color_hexidecimal={props.hexagon_definition.background_color_hexidecimal} edge_length={props.edge_length} />
    //         {/* <HexIcons /> */}
    //         {/* <ClickableHexagon edge_length={props.edge_length} row_number={props.row_number} column_number={props.column_number} /> */}

    //     {/* </div> */}

    //     </>
    // )
})
// ,(previous_props: {[index: string]: any}, next_props: {[index: string]: any}) => {

//     let are_props_equal = true

//     // if (previous_props.type == enum_grid_type.clickable) {
//     //     if (previous_props.edge_length != next_props.edge_length) {
//     //         are_props_equal = false
//     //     }
//     // }
//     // if (previous_props.type == enum_grid_type.background)
//     // else {

//     for (const prop_key in previous_props) {
//         if (prop_key != "hexagon_definition") {
//             if (!Object.is(previous_props[prop_key], next_props[prop_key])) {
//                 are_props_equal = false
//             }
//         }
//         else {
//             const prev_hex_def = previous_props.hexagon_definition
//             const next_hex_def = next_props.hexagon_definition
//             // if (previous_props.type == enum_grid_type.background && prev_hex_def.background_color_hexidecimal != next_hex_def.background_color_hexidecimal) {
//             //     are_props_equal = false
//             // }
//         }
//     }

//     return are_props_equal
// }