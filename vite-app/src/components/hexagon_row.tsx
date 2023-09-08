import Hexagon from "./hexagon"
import CSS from "csstype"

export default function HexagonRow ({row_number, num_hexes, edge_length} : {row_number: number, num_hexes: number, edge_length: number}) {
    const hexes = Array.from({length: num_hexes}, (_, index) => {
        const column_number = index + 1
        const hexagon_key = row_number.toString().padStart(3,"0") + "_" + column_number.toString().padStart(3,"0")
        // const hex_data = map_document?.[hexagon_key]

        // if (selected_row == row_number && selected_column == column_number) {
        //     is_selected = true
        // }

        return (
            <Hexagon
                key={hexagon_key}
                // hex_key={hexagon_key}
                // hex_data={hex_data}
                column_number={column_number}
                row_number={row_number}
                edge_length={edge_length}
                // is_show_border={true}
                // is_selected={is_selected}
                // set_selected_row={set_selected_row}
                // set_selected_column={set_selected_column}
            />
        );
    });

    const row_style: CSS.Properties = {
        display: "flex",
        flexWrap: "nowrap"
    }

    if (row_number % 2 == 1) {
        row_style.marginLeft = (Math.round(Math.sqrt(3) * edge_length) / 2).toString() + "px"
    }
    else {
        row_style.marginTop = (edge_length * -1 / 2).toString() + "px"
        row_style.marginBottom = (edge_length * -1 / 2).toString() + "px"
    }

    return (
        <div style={row_style}>
            {hexes}
        </div>
    );

}