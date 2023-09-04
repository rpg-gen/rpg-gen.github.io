import DataContext from "../contexts/data_context.jsx";
import { useContext, useState } from "react";
import GlobalContext from "../contexts/global_context.jsx";
import HexagonGrid from "../components/hexagon_grid.jsx";
import { Link } from "react-router-dom";
import LoadingProtected from "../components/loading_protected.jsx";
import HexagonMath from "../utility/hexagon_math.jsx";
import LoginProtected from "../components/login_protected.jsx"


export default function MapGen() {
    const global_context = useContext(GlobalContext);
    const data_context = useContext(DataContext);

    const [ map_name, set_map_name ] = useState("tarron_test");
    const [ hex_edge_length, set_hex_edge_length] = useState(60);

    function handle_click_load_map() {
        data_context.load_map(map_name)
    }

    function handle_map_name_change(event) {
        set_map_name(event.target.value)
    }

    function zoom_in() {
        set_hex_edge_length(previous_width => previous_width + 10)
    }

    function zoom_out() {
        set_hex_edge_length(previous_width => previous_width - 10)
    }

    return (
        <>
            <p><Link key="map_gen_rules" to={'rules'}><button>Map Gen Rules</button></Link></p>
            <LoginProtected>
                <input onChange={handle_map_name_change} value={map_name} ></input>{" "}<button onClick={handle_click_load_map}>Load Map</button>{" "}
            </LoginProtected>
            <button onClick={zoom_in}>Zoom In</button>{" "}
            <button onClick={zoom_out}>Zoom Out</button>{" "}
            <div></div>
            <LoadingProtected is_loading={data_context.is_loading}>
                <HexagonGrid map_document={data_context?.maps?.[data_context?.loaded_map_name] || {height: 5, width: 5}} hex_edge_px_length={hex_edge_length} />
            </LoadingProtected>
        </>
    );
};