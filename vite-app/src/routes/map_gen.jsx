import DataContext from "../contexts/data_context.jsx";
import { useContext } from "react";
import GlobalContext from "../contexts/global_context.jsx";
import HexagonGrid from "../components/hexagon_grid.jsx";
import { Link } from "react-router-dom";


export default function MapGen() {
    const global_context = useContext(GlobalContext);

    return (
        <>
            <p><Link key="map_gen_rules" to={'rules'}><button>Map Gen Rules</button></Link> - Note this is just a sample grid. It has no interaction yet. The real deal will allow you to "draw" your map right in the browser in a collaborative experience.</p>
            <HexagonGrid num_hexes_wide = "4" num_hexes_tall = "4" hex_edge_px_length="60" />
        </>
    );
};

