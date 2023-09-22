import type_hexagon_definitions from "../../types/type_hexagon_definitions"
import HexagonRow from "./hexagon_row"
import enum_grid_type from "../../types/enum_grid_type"
import Hexagon from "./hexagon"
import { MouseEventHandler, useState, useEffect, memo, useRef, MutableRefObject } from "react"
import type_fabric_hook from "../../types/type_fabric_hook"

export default memo(function HexGrid(props: {
    edge_length: number,
    fabric_hook: type_fabric_hook
}) {

    // const hexagon_rows: JSX.Element[] = []

    // const hexagon_polygons: JSX.Element[] = []

    // for (const row_number in props.hexagon_definitions) {
    //     const this_row = props.hexagon_definitions[row_number]
    //     // const row_hexagons: JSX.Element[] = []

    //     for (const column_number in this_row) {
    //         hexagon_polygons.push(
    //             <Hexagon
    //                 key={row_number + "_" + column_number}
    //                 row_number={row_number}
    //                 column_number={column_number}
    //                 edge_length={props.edge_length}
    //                 hexagon_definition={this_row[column_number]}
    //                 // click_function={props.click_function}
    //             />
    //         )
    //     }

        // hexagon_rows.push(
        //     <HexagonRow key={row_number} row_number={row_number} edge_length={props.edge_length}>
        //         {row_hexagons}
        //     </HexagonRow>
        // )
    // }

    // return (
    //     <div style={{
    //         position: "absolute",
    //         top: "calc(" + (spacing.top_bar_height + spacing.top_bar_margin).toString() + "rem + " + hexagon_math.get_peak_height(props.edge_length + 5) + "px)",
    //         left: 0
    //     }}>
    //         {hexagon_rows}
    //     </div>
    // )




    useEffect(() => {
        props.fabric_hook.init_canvas()
    },[props.edge_length])

    return (

        <div style={{
            minWidth: "100%",
            maxWidth: "100%",
            overflow: "scroll",
            maxHeight: "100%",
            minHeight: "100%",
            height: "100%",
            overscrollBehavior: "none",
            boxSizing: "border-box",
            position: "relative",
            // marginTop: (spacing.top_bar_height + spacing.top_bar_margin + .5).toString() + "rem"
        }}>
            {/* <div style={{height: (spacing.top_bar_height + spacing.top_bar_margin).toString() + "rem"}}></div> */}

            {/* <svg style={{
                height: (props.edge_length + peak_height) * Object.keys(props.hexagon_definitions).length + long_diagonal_length,
                width: (short_diagonal_length) * Object.keys(props.hexagon_definitions[1]).length + (short_diagonal_length / 2) + (spacing.hex_grid_side_border * 2)
            }}>
                {hexagon_polygons}
            </svg> */}
            {props.fabric_hook.get_html_stub()}
        </div>
    )
})