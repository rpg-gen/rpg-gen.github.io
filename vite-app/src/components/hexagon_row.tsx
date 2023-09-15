import Hexagon from "./hexagon"
import CSS from "csstype"
import { useContext } from "react"
import MapContext from "../contexts/map_context"

export default function HexagonRow ({row_number, num_hexes, edge_length} : {row_number: number, num_hexes: number, edge_length: number}) {
    const map_context = useContext(MapContext)

    const hexes = Array.from({length: num_hexes}, (_, index) => {
        const column_number = index + 1
        const hexagon_key = row_number.toString().padStart(3,"0") + "_" + column_number.toString().padStart(3,"0")

        return (
            <Hexagon
                key={hexagon_key}
                column_number={column_number}
                row_number={row_number}
                edge_length={edge_length}
                map_definition_record={(map_context.map_definition[column_number + "_" + row_number]) || {}}
            />
        );
    });

    const row_style: CSS.Properties = {
        display: "flex",
        flexWrap: "nowrap",
        lineHeight: "0px"
    }

    if (row_number % 2 == 1) {
        row_style.marginLeft = (Math.round(Math.sqrt(3) * edge_length) / 2).toString() + "px"
    }
    else {
        // row_style.marginTop = (edge_length * -1 / 2).toString() + "px"
        // row_style.marginBottom = (edge_length * -1 / 2).toString() + "px"
    }

    return (
        <div style={row_style}>
            {hexes}
        </div>
    );

}