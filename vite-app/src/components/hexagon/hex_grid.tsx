import type_hexagon_definitions from "../../types/type_hexagon_definitions"
import HexagonRow from "./hexagon_row"
import spacing from "../../configs/spacing"
import enum_grid_type from "../../types/enum_grid_type"
import hexagon_math from "../../utility/hexagon_math"
import Hexagon from "./hexagon"
import { MouseEventHandler } from "react"

export default function HexGrid(props: {
    type: string,
    edge_length: number,
    hexagon_definitions: type_hexagon_definitions,
    click_function?: MouseEventHandler
}) {

    const hexagon_rows: JSX.Element[] = []

    for (const row_number in props.hexagon_definitions) {
        const this_row = props.hexagon_definitions[row_number]
        const row_hexagons: JSX.Element[] = []

        for (const column_number in this_row) {
            row_hexagons.push(
                <Hexagon
                    key={row_number + "_" + column_number}
                    type={props.type}
                    row_number={row_number}
                    column_number={column_number}
                    edge_length={props.edge_length}
                    hexagon_definition={this_row[column_number]}
                    click_function={props.click_function}
                />
            )
        }

        hexagon_rows.push(
            <HexagonRow key={row_number} row_number={row_number} edge_length={props.edge_length}>
                {row_hexagons}
            </HexagonRow>
        )
    }

    // let z_index = 5;

    // if (props.type == enum_grid_type.background) {
    //     z_index = 1;
    // }
    // else if (props.type == enum_grid_type.icons) {
    //     z_index = 2;
    // }
    // else if (props.type == enum_grid_type.clickable) {
    //     z_index = 3;
    // }

    return (
        <div style={{
            position: "absolute",
            top: "calc(" + (spacing.top_bar_height + spacing.top_bar_margin).toString() + "rem + " + hexagon_math.get_peak_height(props.edge_length + 5) + "px)",
            left: 0
        }}>
            {hexagon_rows}
        </div>
    )
}