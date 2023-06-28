import HexagonMath from "../utility/hexagon_math";

export default function Hexagon({edge_length}) {
    const container_style = {
        position: "relative",
        height: HexagonMath.convert_edge_to_long_diagonal(edge_length) + "px",
        width: HexagonMath.convert_edge_to_short_diagonal(edge_length) + "px",
        // backgroundColor: "grey",
        display: "inline-block",
        fontSize: "0"
    };

    return (
        <div style={container_style}>
            <HexagonTop edge_length={edge_length} />
            <HexagonCenter edge_length={edge_length} />
            <HexagonBottom edge_length={edge_length} />
        </div>
    );
};

function HexagonCenter({edge_length}) {
    const element_style = {
        height: edge_length.toString() + "px",
        width: HexagonMath.convert_edge_to_short_diagonal(edge_length).toString() + "px",
        marginTop: HexagonMath.convert_edge_to_point_height(edge_length) + "px",
        // position: "relative",
        // display: "inline-block",
        backgroundColor: "green"
    };

    return (
        <div style={element_style}></div>
    );
};

function HexagonTop({edge_length}) {
    const element_style = {
        width: "0",
        borderBottom: "",
        position: "absolute",
        top: 0,//convert_edge_to_point_height(edge_length) + "px",
        borderBottom: HexagonMath.convert_edge_to_point_height(edge_length) + "px solid green",
        borderLeft: HexagonMath.convert_edge_to_short_diagonal(edge_length) / 2 + "px solid transparent",
        borderRight: HexagonMath.convert_edge_to_short_diagonal(edge_length) / 2 + "px solid transparent",
    };

    return (
        <div style={element_style}></div>
    );
};

function HexagonBottom({edge_length}) {
    const element_style = {
        width: "0",
        borderBottom: "",
        position: "absolute",
        bottom: 0,//convert_edge_to_point_height(edge_length) + "px",
        borderTop: HexagonMath.convert_edge_to_point_height(edge_length) + "px solid green",
        borderLeft: HexagonMath.convert_edge_to_short_diagonal(edge_length) / 2 + "px solid transparent",
        borderRight: HexagonMath.convert_edge_to_short_diagonal(edge_length) / 2 + "px solid transparent",
    };

    return (
        <div style={element_style}></div>
    );
};