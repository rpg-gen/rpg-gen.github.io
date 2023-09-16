import spacing from "../../configs/spacing"
import type_hexagon_definitions from "../../types/type_hexagon_definitions"
import HexagonRow from "./hexagon_row"

export default function HexagonGrid(props: {hexagon_definitions: type_hexagon_definitions, edge_length: number}) {



    const hexagon_rows: JSX.Element[] = []

    for (const row_number in props.hexagon_definitions) {
        hexagon_rows.push(<HexagonRow key={row_number} row_number={row_number} edge_length={props.edge_length} hexagon_definitions={props.hexagon_definitions} />)
    }

    return (
        <>
        <div style={{
            minWidth: "100%",
            maxWidth: "100%",
            overflow: "scroll",
            maxHeight: "100%",
            minHeight: "100%",
            height: "100%",
            overscrollBehavior: "none",
            position: "relative"
        }}>
            <div style={{height: (spacing.top_bar_height + spacing.top_bar_margin).toString() + "rem"}}></div>
            {hexagon_rows}
        </div>

        </>
    )
}