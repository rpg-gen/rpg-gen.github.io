// import enum_hex_triangles from "../../types/enum_hex_triangles"
// import hexagon_math from "../../utility/hexagon_math"

// export default function ClickableHexTrianglePolygon(props: {hex_triangle: string, edge_length: number, row_number: string, column_number: string}) {

    // const short_diagonal_length = hexagon_math.get_short_diagonal_length(props.edge_length)
    // const peak_height = hexagon_math.get_peak_height(props.edge_length)

    // const center_x = short_diagonal_length / 2
    // const center_y = props.edge_length / 2

    // const center_point = [center_x + " " + center_y]

    // const points = hexagon_math.get_points(props.edge_length)

    // const polygon_points: string[] = [points.center]

    // if (props.hex_triangle == enum_hex_triangles.top_left) {polygon_points.push(points.top_left, points.top_mid)}
    // else if (props.hex_triangle == enum_hex_triangles.top_right) {polygon_points.push(points.top_mid, points.top_right)}
    // else if (props.hex_triangle == enum_hex_triangles.right) {polygon_points.push(points.top_right, points.bottom_right)}
    // else if (props.hex_triangle == enum_hex_triangles.bottom_right) {polygon_points.push(points.bottom_right, points.bottom_mid)}
    // else if (props.hex_triangle == enum_hex_triangles.bottom_left) {polygon_points.push(points.bottom_mid, points.bottom_left)}
    // else if (props.hex_triangle == enum_hex_triangles.left) {polygon_points.push(points.bottom_left, points.top_left)}

    // return (
    //     <polygon
    //         data-hex-triangle={props.hex_triangle}
    //         data-hex-row={props.row_number}
    //         data-hex-column={props.column_number}
    //         // onClick={handle_hexagon_click}
    //         points={polygon_points.join(",")}
    //         fill="transparent"
    //         stroke="black"
    //         className="hover-element"
    //         strokeWidth={.2}
    //     />
    // )
// }