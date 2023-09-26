// import Hexagon from "./hexagon"
// import type_hexagon_definitions from "../../types/type_hexagon_definitions"

// export default function HexagonRow(props: {children: JSX.Element[], row_number: string, edge_length: number}) {
//         // const this_row = props.hexagon_definitions[props.row_number]
//         // const row_hexagons: JSX.Element[] = []

//         // for (const column_number in this_row) {
//         //     row_hexagons.push(
//         //         <Hexagon
//         //             key={props.row_number + "_" + column_number}
//         //             type={props.type}
//         //             row_number={props.row_number}
//         //             column_number={column_number}
//         //             edge_length={props.edge_length}
//         //             hexagon_definition={this_row[column_number]}
//         //         />
//         //     )
//         // }

//         return (
//             <div style={{
//                 display: "flex",
//                 flexWrap: "nowrap",
//                 lineHeight: "0px",
//                 marginLeft: ((parseInt(props.row_number) % 2 == 1) ? (Math.round(Math.sqrt(3) * props.edge_length) / 2).toString() + "px" : 0)
//             }}>
//                 {props.children}
//             </div>
//         )
//     }