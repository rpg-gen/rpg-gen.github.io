import type_hexagon_definitions from "../../types/type_hexagon_definitions"
import HexagonRow from "./hexagon_row"
import spacing from "../../configs/spacing"
import enum_grid_type from "../../types/enum_grid_type"
import hexagon_math from "../../utility/hexagon_math"
import Hexagon from "./hexagon"
import { MouseEventHandler, useState, useEffect, memo, useRef } from "react"
import { fabric } from "fabric"
import colors from "../../configs/colors"

export default memo(function HexGrid(props: {
    edge_length: number,
    hexagon_definitions: type_hexagon_definitions,
    click_function?: MouseEventHandler
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

    const fabric_ref = useRef<fabric.Canvas>()

    function init_canvas() {

        if (fabric_ref.current != undefined) {
            fabric_ref.current.dispose()
        }

        const num_rows = Object.keys(props.hexagon_definitions).length
        const num_columns = num_rows
        const short_diagonal_length = hexagon_math.get_short_diagonal_length(props.edge_length)
        const peak_height = hexagon_math.get_peak_height(props.edge_length)
        const container_width = (num_columns * short_diagonal_length) + (short_diagonal_length/2) + (spacing.hex_grid_side_border * 2)
        const container_height = (num_rows * (peak_height + props.edge_length)) + spacing.hex_grid_top_border + peak_height


        const the_canvas = new fabric.Canvas('canvas', {
            height: container_height,
            width: container_width,
            backgroundColor: colors.white,
            hoverCursor: "pointer"
        })

        for (let row_number = 1; row_number<= num_rows; row_number++) {
            for (let column_number = 1; column_number <= num_columns; column_number++) {
                const points = hexagon_math.get_fabric_points(props.edge_length, row_number, column_number)
                const fabric_hexagon = Object.assign(new fabric.Polygon(
                    [points.top_left, points.top_mid, points.top_right, points.bottom_right, points.bottom_mid, points.bottom_left],
                    {fill: colors.white, stroke: colors.black, strokeWidth: .2, "selectable": false}
                ), {row_number: row_number, column_number: column_number})

                the_canvas.add(fabric_hexagon)
            }
        }

        the_canvas.on("mouse:down", function(options) {
            const target = options.target as fabric.Polygon & {row_number: string, column_number: string}
            if (target != undefined) {
                console.log(target.row_number + " " + target.column_number)
                target.set("fill", "red")
            }
        })

        return the_canvas
    }

    useEffect(() => {
        fabric_ref.current = init_canvas()
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
            <canvas id="canvas"></canvas>
        </div>
    )
})