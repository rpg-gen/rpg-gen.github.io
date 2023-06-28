import DataContext from "../contexts/data_context.jsx";
import { useContext } from "react";
import GlobalContext from "../contexts/global_context.jsx";
import HexagonGrid from "../components/hexagon_grid.jsx";


export default function MapGen() {
    const global_context = useContext(GlobalContext);

    return (
        <>
            <HexagonGrid num_hexes_wide = "4" num_hexes_tall = "4" hex_edge_px_length="60" />
        </>
    );
};

