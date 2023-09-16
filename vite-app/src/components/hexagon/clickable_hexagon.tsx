import ClickableHexTrianglePolygon from "./clickable_hex_triangle_polygon"
import hexagon_math from "../../utility/hexagon_math"
import enum_hex_triangles from "../../types/enum_hex_triangles"

export default function ClickableHexagon(props: {edge_length: number, row_number: string, column_number: string}) {
    return (<>

        <svg
            style={{
                marginTop: props.edge_length / 2
                // minWidth: boundary_width,
                // position: "absolute",
                // top: "0",
                // bottom: "0",
                // left: "0",
                // right: "0",
                // zIndex: 9
            }}
            height={hexagon_math.get_long_diagonal_length(props.edge_length) / 2}
            width={hexagon_math.get_short_diagonal_length(props.edge_length)}
            overflow={"visible"}
        >
            <ClickableHexTrianglePolygon hex_triangle={enum_hex_triangles.top_left} edge_length={props.edge_length} row_number={props.row_number} column_number={props.column_number} />
            <ClickableHexTrianglePolygon hex_triangle={enum_hex_triangles.top_right} edge_length={props.edge_length} row_number={props.row_number} column_number={props.column_number} />
            <ClickableHexTrianglePolygon hex_triangle={enum_hex_triangles.right} edge_length={props.edge_length} row_number={props.row_number} column_number={props.column_number} />
            <ClickableHexTrianglePolygon hex_triangle={enum_hex_triangles.bottom_right} edge_length={props.edge_length} row_number={props.row_number} column_number={props.column_number} />
            <ClickableHexTrianglePolygon hex_triangle={enum_hex_triangles.bottom_left} edge_length={props.edge_length} row_number={props.row_number} column_number={props.column_number} />
            <ClickableHexTrianglePolygon hex_triangle={enum_hex_triangles.left} edge_length={props.edge_length} row_number={props.row_number} column_number={props.column_number} />
        </svg>

    </>)
}