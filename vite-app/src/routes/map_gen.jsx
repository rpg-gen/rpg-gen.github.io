import DataContext from "../contexts/data_context.jsx";
import { useContext } from "react";
import GlobalContext from "../contexts/global_context.jsx";
import Cookies from "universal-cookie";


export default function MapGen() {
    const global_context = useContext(GlobalContext);

    return (
        <>
            <p>Hello world MapGen</p>
            {/* <div>
                <button onClick={query_data}>Query Data</button>
            </div> */}
            {/* <button onClick={refresh_user}>Refresh User</button> */}
        </>
    );
};