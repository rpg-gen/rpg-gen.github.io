import { useContext } from "react";
import GlobalContext from "../contexts/global_context.jsx";
import { NavLink } from "react-router-dom";

export default function MainNavigation () {

    const global_context = useContext(GlobalContext);

    const link_style = {
        textDecoration: "none",
        paddingTop: "1rem",
        paddingBottom: "1rem",
        display: "block",
        textAlign: "center",
        borderTop: "solid 1px #e3e3e3",
        padding: "1rem",
    }

    const list_items = [];

    function handle_main_nav_click(event) {
        global_context.clear_banner();
        global_context.update_global_context({is_show_sidebar: false});
    }


    list_items.push(<NavLink key="/" className="main_nav_link" style={link_style} onClick={handle_main_nav_click} to={'/'}>Generator</NavLink>);
    // list_items.push(<NavLink key="npc_generator" className="main_nav_link" style={link_style} onClick={handle_main_nav_click} to={'npc_generator'}>NPC Generator</NavLink>);
    // list_items.push(<NavLink key="character_tracker" className="main_nav_link" style={link_style} onClick={handle_main_nav_click} to={'character_tracker'}>Character Tracker</NavLink>);
    list_items.push(<NavLink key="characters" className="main_nav_link" style={link_style} onClick={handle_main_nav_click} to={'characters'}>Characters</NavLink>);
    list_items.push(<NavLink key="items" className="main_nav_link" style={link_style} onClick={handle_main_nav_click} to={'items'}>Items</NavLink>);
    list_items.push(<NavLink key="abilities" className="main_nav_link" style={link_style} onClick={handle_main_nav_click} to={'abilities'}>Abilities</NavLink>);
    list_items.push(<NavLink key="data_manager" className="main_nav_link" style={link_style} onClick={handle_main_nav_click} to={'data_manager'}>Data Manager</NavLink>);
    list_items.push(<NavLink key="account_info" className="main_nav_link" style={link_style} onClick={handle_main_nav_click} to={'account_info'}>Account Info</NavLink>);

    return (
        <>{list_items}</>
    );
}