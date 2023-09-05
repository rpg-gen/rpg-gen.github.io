import HexagonMath from "../utility/hexagon_math";
import { useContext } from "react";
import GlobalContext from "../contexts/global_context";
import FormEditHex from "../forms/form_edit_hex"

export default function Hexagon({
        hex_key,
        hex_data,
        edge_length, 
        is_show_border, 
        location_column, 
        location_row, 
        is_selected, 
        set_selected_row, 
        set_selected_column
}) {

    if (hex_data == undefined) {
        hex_data = "aliceblue"
    }

    const short_diagonal = HexagonMath.convert_edge_to_short_diagonal(edge_length)
    
    const global_context = useContext(GlobalContext)

    function on_click_hexagon() {
        set_selected_row(location_row)
        set_selected_column(location_column)
        global_context.update_global_context({
            rightbar_content: <FormEditHex hex_key={hex_key} hex_column={location_column} hex_row={location_row} hex_data={hex_data} />,
            is_show_rightbar: true
        })
    }

    const outer_style = {
        height: edge_length * 2,
        width: short_diagonal,
        position: "relative",
        display: "inline-block"
        // background: "grey"
    }

    const inner_rectangle_style = {
        height: edge_length/2,
        width: short_diagonal / 2,
        backgroundColor: "green",
        position: "absolute",
    }

    const large_rectangle_style = {
        height: edge_length,
        width: short_diagonal,
        backgroundColor: hex_data,
        position: "absolute",
        top: edge_length / 2,
        boxSizing: "border-box",
        border: "1px solid " + hex_data
    }

    if (is_show_border) {
        large_rectangle_style.borderLeft = "1px solid black"
    }

    if (is_selected) {
        large_rectangle_style.borderLeft = "5px solid black"
        large_rectangle_style.borderRight = "5px solid black"
    }

    // function FourPartRectangle({rotate_degrees}) {

    //     if (rotate_degrees == undefined) {
    //         rotate_degrees = "0"
    //     }
    //     else {}

    //     return (
    //         <>
            
    //         <div style={{...inner_rectangle_style, top: edge_length / 2, left: "0", transformOrigin: "bottom right", transform: "rotate(" + rotate_degrees + "deg)"}}></div>
    //         <div style={{...inner_rectangle_style, top: edge_length / 2, left: short_diagonal / 2, transformOrigin: "bottom left", transform: "rotate(" + rotate_degrees + "deg)"}}></div>
    //         <div style={{...inner_rectangle_style, top: edge_length, left: short_diagonal / 2, transformOrigin: "top left", transform: "rotate(" + rotate_degrees + "deg)"}}></div>
    //         <div style={{...inner_rectangle_style, top: edge_length, left: "0", transformOrigin: "top right", transform: "rotate(" + rotate_degrees + "deg)"}}></div>
            
    //         </>
    //     )
    // }

    function InnerRectangle({rotate_degrees}) {
        return (
            <div onClick={on_click_hexagon} style={{...large_rectangle_style, transform: "rotate(" + rotate_degrees + "deg)"}}></div>
        )
    }

    return (
        <div style={outer_style}>
            <InnerRectangle rotate_degrees="0" />
            <InnerRectangle rotate_degrees="60" />
            <InnerRectangle rotate_degrees="120" />
            {/* <FourPartRectangle rotate_degrees="0" /> */}
            {/* <FourPartRectangle rotate_degrees="60" /> */}
            {/* <FourPartRectangle rotate_degrees="120" /> */}
        </div>
    )
}


// function OldHexagon({edge_length}) {
//     const container_style = {
//         position: "relative",
//         height: HexagonMath.convert_edge_to_long_diagonal(edge_length) + "px",
//         width: HexagonMath.convert_edge_to_short_diagonal(edge_length) + "px",
//         // backgroundColor: "grey",
//         display: "inline-block",
//         fontSize: "0"
//     };

//     return (
//         <div style={container_style}>
//             <HexagonTop edge_length={edge_length} />
//             <HexagonCenter edge_length={edge_length} />
//             <HexagonBottom edge_length={edge_length} />
//         </div>
//     );
// };

// function HexagonCenter({edge_length}) {
//     const element_style = {
//         height: edge_length.toString() + "px",
//         width: HexagonMath.convert_edge_to_short_diagonal(edge_length).toString() + "px",
//         marginTop: HexagonMath.convert_edge_to_point_height(edge_length) + "px",
//         // position: "relative",
//         // display: "inline-block",
//         backgroundColor: "green"
//     };

//     return (
//         <div style={element_style}></div>
//     );
// };

// function HexagonTop({edge_length}) {
//     const element_style = {
//         width: "0",
//         borderBottom: "",
//         position: "absolute",
//         top: 0,//convert_edge_to_point_height(edge_length) + "px",
//         borderBottom: HexagonMath.convert_edge_to_point_height(edge_length) + "px solid green",
//         borderLeft: HexagonMath.convert_edge_to_short_diagonal(edge_length) / 2 + "px solid transparent",
//         borderRight: HexagonMath.convert_edge_to_short_diagonal(edge_length) / 2 + "px solid transparent",
//     };

//     return (
//         <div style={element_style}></div>
//     );
// };

// function HexagonBottom({edge_length}) {
//     const element_style = {
//         width: "0",
//         borderBottom: "",
//         position: "absolute",
//         bottom: 0,//convert_edge_to_point_height(edge_length) + "px",
//         borderTop: HexagonMath.convert_edge_to_point_height(edge_length) + "px solid green",
//         borderLeft: HexagonMath.convert_edge_to_short_diagonal(edge_length) / 2 + "px solid transparent",
//         borderRight: HexagonMath.convert_edge_to_short_diagonal(edge_length) / 2 + "px solid transparent",
//     };

//     return (
//         <div style={element_style}></div>
//     );
// };