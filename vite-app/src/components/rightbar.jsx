import { useContext } from "react";
import GlobalContext from "../contexts/global_context.jsx";
import Colors from "../utility/colors.jsx";

export default function Rightbar() {
    const global_context = useContext(GlobalContext);

    function handle_off_click(event) {
        event.preventDefault();
        global_context.update_global_context({is_show_rightbar: false});
    }

    let sidebar_style = {
        backgroundColor: Colors.sidebar_grey,// padding: "1rem",
        borderRight: "solid 1px #e3e3e3",
        display: "flex",
        flexDirection: "column",
        // justifyContent: "center",
        alignItems: "stretch",
        // textAlign: "center",
        paddingTop: "1rem",
        // paddingLeft: "1rem",
        // paddingRight: "1rem",
        // width: "15em",
        flexShrink: "0",
        paddingRight: "1em",
        paddingLeft: "1em",
        width: "18em",
    }

    if (global_context.is_mobile_view) {
        sidebar_style = {
            ...sidebar_style,
            flexShrink: "1",
        }
    }

    const overlay_style = {
        position: "fixed",
        top: "0",
        left: "0",
        bottom: "0",
        right: "0",
        zIndex: "10",
        display: "flex",
        alignItems: "stretch",
    }

    const off_click_area_style = {
        flexShrink: 0,
        flexGrow: 1,
        backgroundColor: Colors.sidebar_grey,
        opacity: ".75",
    }

    return (
        <div style={overlay_style}>
            <div style={off_click_area_style} onClick={handle_off_click} className="hover-element"></div>
            <div style={sidebar_style}>
                {global_context.rightbar_content}
            </div>
        </div>
    );
}