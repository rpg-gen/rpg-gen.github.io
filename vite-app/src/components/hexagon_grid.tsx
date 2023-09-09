import HexagonRow from "../components/hexagon_row"
import spacing from "../configs/spacing"

export default function HexagonGrid({num_columns, num_rows, edge_length}: {num_columns: number, num_rows: number, edge_length: number}) {

    const hexagon_rows = Array.from({length: num_rows}, (_, index) => {
        const row_number = index + 1
        return <HexagonRow key={row_number} row_number={row_number} num_hexes={num_columns} edge_length={edge_length} />
    })

    return (
        <>
        <div style={{
            minWidth: "100%",
            maxWidth: "100%",
            overflow: "scroll",
            maxHeight: "100%",
            minHeight: "100%",
            height: "100%",
            // overscrollBehavior: "none"
        }}>
            <div style={{height: (spacing.top_bar_height + spacing.top_bar_margin).toString() + "rem" }}></div>
            {hexagon_rows}
        </div>

        </>
    )
}