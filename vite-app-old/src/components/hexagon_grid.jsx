import Hexagon from "./hexagon";
import HexagonMath from "../utility/hexagon_math";
import { useState, useContext } from "react";
import GlobalContext from "../contexts/global_context.jsx"

// export default function HexagonGrid({num_hexes_wide, num_hexes_tall, hex_edge_px_length}) {
export default function HexagonGrid({map_document, hex_edge_px_length}) {

    const num_hexes_wide = map_document.width
    const num_hexes_tall = map_document.height

    const [selected_row, set_selected_row] = useState()
    const [selected_column, set_selected_column] = useState()

    const hex_rows = Array.from({length: num_hexes_tall}, (_, index) => {
        return <HexRow hex_edge_px_length={hex_edge_px_length} num_hexes={num_hexes_wide} key={index} row_number={index+1}/>
    })

    function Spacer() {
        const spacer_style = {
            display: "inline-block",
            width: "0px"
        }
    
        return <div style={spacer_style} />
    }
    
    function HexRow({hex_edge_px_length, num_hexes, row_number}) {
    
        const hex_row_style = {
            fontSize: "0",
            whiteSpace: "nowrap"
        };
    
        if (row_number > 1) {
            hex_row_style.marginTop = "-" + HexagonMath.convert_edge_to_point_height(hex_edge_px_length + 2).toString() + "px"
        }
    
        if (row_number % 2 == 0) {
            hex_row_style.marginLeft = (HexagonMath.convert_edge_to_short_diagonal(hex_edge_px_length) / 2).toString() + "px"
        }
    
        const hexes = Array.from({length: num_hexes}, (_, index) => {
            const column_number = index + 1
            const hexagon_key = row_number.toString().padStart(3,"0") + "_" + column_number.toString().padStart(3,"0")
            const hex_data = map_document?.[hexagon_key]
            let is_selected = false

            if (selected_row == row_number && selected_column == column_number) {
                is_selected = true
            }

            return (
                <Hexagon 
                    key={hexagon_key}
                    hex_key={hexagon_key}
                    hex_data={hex_data} 
                    location_column={index + 1} 
                    location_row={row_number} 
                    edge_length={hex_edge_px_length} 
                    is_show_border={true} 
                    is_selected={is_selected}
                    set_selected_row={set_selected_row}
                    set_selected_column={set_selected_column}
                />
            );
        });
    
        return (
            <div style={hex_row_style}>{hexes}</div>
        );
    };

    return <>
        {hex_rows}
    </>
};
