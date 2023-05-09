import React, { useState, useContext, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import GlobalContext from "../contexts/global_context.jsx";
import ajax_loader from "../../assets/ajax_loader.gif";
import Colors from "../utility/colors.jsx";
import configs from "../utility/configs.jsx";
import ham_menu_black from "../../assets/ham_menu_black.svg";
import back_arrow from "../../assets/back_arrow.svg";
import MainNavigation from "../components/main_navigation.jsx";
import ErrorPage from "./error_page";
import useFirestoreData from "../hooks/use_firestore_data.jsx";
import useGlobalContext from "../hooks/use_global_context.jsx";
import DataContext from "../contexts/data_context.jsx";
import Rightbar from "../components/rightbar.jsx";

export default function Root({ is_error=false }) {

    const is_spoof = true;
    const global_context = useGlobalContext();

    // Add the global context user variable to the state, since when the user changes we want to re-render things

    const data_context = useFirestoreData(is_spoof, (global_context.user != undefined ? true : false));

    const root_style = {
        display: "flex",
        flexGrow: "1",
        fontFamily: "sans-serif",
        position: "relative",
    }

    if (global_context.is_mobile_view) {
        // root_style.flexDirection = "column"
    }

    return (
        <GlobalContext.Provider value={global_context}>
            <DataContext.Provider value={data_context}>
                <div style={root_style}>
                    {(global_context.is_show_sidebar || !global_context.is_mobile_view) && <Sidebar />}
                    {global_context.is_auth_checked ? <Details is_error={is_error} /> : <LoadingScreen />}
                    {global_context.is_show_rightbar ? <Rightbar /> : ""}
                </div>
            </DataContext.Provider>
        </GlobalContext.Provider>
    );
}

// =============================================================================
// Title Bar
// =============================================================================

function TitleBar () {

    const global_context = useContext(GlobalContext);

    const navigate = useNavigate();

    function handle_title_icon_click(event) {
        event.preventDefault();
        const is_show_sidebar_toggled = !global_context.is_show_sidebar;
        global_context.update_global_context({is_show_sidebar: is_show_sidebar_toggled})
    }

    const title_bar_style = {
        display: "flex",
        justifyContent: "center",
        position: "relative",
        marginBottom: "1em",
    }

    const title_link_style = {
        textDecoration: 'none',
        color: '#121212',
        display: "inline",
        paddingLeft: "2em",
        paddingRight: "2em",
        fontSize: "1.5em",
        fontWeight: "bold",
        // flexGrow: "1",
    }

    const title_icon_style = {
        height: "1em",
        width: "auto",
        marginRight: "1em",
        marginLeft: "1em",
        position: "absolute",
        left: "0"
    }

    const title_icon = (global_context.is_show_sidebar ? back_arrow : ham_menu_black)

    function handle_title_click() {
        navigate("/");
        global_context.update_global_context({is_show_sidebar: false})
    }

    return (
        <div style={title_bar_style}>
            {global_context.is_mobile_view && <img className="hover-element" src={title_icon} style={title_icon_style} onClick={handle_title_icon_click}/>}
            <div className="hover-element" style={title_link_style} onClick={handle_title_click}>{global_context.site_title}</div>
        </div>
    );
}

// =============================================================================
// Sidebar
// =============================================================================

function Sidebar () {
    const global_context = useContext(GlobalContext);

    function handle_off_click(event) {
        event.preventDefault();
        global_context.update_global_context({is_show_sidebar: false})
    }

    let sidebar_style = {
        backgroundColor: Colors.sidebar_grey,
        // padding: "1rem",
        borderRight: "solid 1px #e3e3e3",
        display: "flex",
        flexDirection: "column",
        // justifyContent: "center",
        alignItems: "stretch",
        textAlign: "center",
        paddingTop: "1rem",
        // paddingLeft: "1rem",
        // paddingRight: "1rem",
        // width: "15em",
        flexShrink: "0",
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
        global_context.is_mobile_view
        ?
            <div style={overlay_style}>
                <div style={sidebar_style}>
                    <TitleBar />
                    { global_context.is_auth_checked ? <MainNavigation /> : <LoadingScreen />}
                </div>
                <div style={off_click_area_style} onClick={handle_off_click} className="hover-element"></div>
            </div>

        :
            <div style={sidebar_style}>
                <TitleBar />
                { global_context.is_auth_checked ? <MainNavigation /> : <LoadingScreen />}
            </div>
    );
}

function LoadingScreen() {
    return (
        <img height="25rem" width="25rem" src={ajax_loader} />
    );
}

function Details({ is_error = false }) {
    const global_context = useContext(GlobalContext);

    const detail_style = {
        padding: "1rem",
        flexGrow: "1",
        flexShrink: "1",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
    }

    return (
        <div id="detail" style={detail_style}>
            {
                is_error
                ? <ErrorPage />
                : <>
                    {global_context.is_mobile_view && <TitleBar /> }
                    {/* {global_context.user == null ? <DetailsLayout page_title="Log in to Access Tool" children={<AccountInfo />} /> : <Outlet />} */}
                    <Outlet />
                </>
            }
        </div>

    );
}