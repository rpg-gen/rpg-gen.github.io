import Hexagon from "./hexagon";
import HexagonMath from "../utility/hexagon_math";

export default function HexagonGrid({num_hexes_wide, num_hexes_tall, hex_edge_px_length}) {

    const hex_rows = Array.from({length: num_hexes_tall}, (_, index) => {
        return <HexRow hex_edge_px_length={hex_edge_px_length} num_hexes={num_hexes_wide} key={index} row_number={index+1}/>
    })

    return <>
        {hex_rows}
    </>
};

function Spacer() {
    const spacer_style = {
        display: "inline-block",
        width: "2px"
    }

    return <div style={spacer_style} />
}

function HexRow({hex_edge_px_length, num_hexes, row_number}) {

    const hex_row_style = {
        fontSize: "0",
        whiteSpace: "nowrap"
    };

    if (row_number > 1) {
        hex_row_style.marginTop = "-" + HexagonMath.convert_edge_to_point_height(hex_edge_px_length - 2).toString() + "px"
    }

    if (row_number % 2 == 0) {
        hex_row_style.marginLeft = (HexagonMath.convert_edge_to_short_diagonal(hex_edge_px_length) / 2).toString() + "px"
    }

    const hexes = Array.from({length: num_hexes}, (_, index) => {
        return (
            <div key={index} style={{display: "inline-block"}}>
                <Hexagon edge_length={hex_edge_px_length} />
                <Spacer />
            </div>
        );
    });

    return (
        <div style={hex_row_style}>{hexes}</div>
    );
};