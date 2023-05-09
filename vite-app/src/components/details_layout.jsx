
import GlobalContext from "../contexts/global_context.jsx";
import { useContext, useState, useEffect } from "react";
import colors from "../utility/colors.jsx";
import configs from "../utility/configs.jsx";

export default function DetailsLayout({page_title, children}) {

    const detail_title_style = {
        fontSize: "1.5em",
        marginBottom: "1em"
    }

    return (<>
        <div style={detail_title_style}>{page_title}</div>
        <Banner />
        <div style={{maxWidth: configs.details_width}}>
            {children}
        </div>
    </>)
}


// =============================================================================
// Banner
// =============================================================================
function Banner () {
    const global_context = useContext(GlobalContext);

    // Make the banner part of the state so it will trigger re-render of the layout banner elements
    const [banner, set_banner] = useState([]);
    const [banner_style, set_banner_style] = useState("neutral");

    // Clear out the banner array and start it over with a new message
    function replace_banner(message) {
        return set_banner([message]);
    }

    // Add a new message to show up below other current banner messages
    function append_banner(message) {
        return set_banner((old_banner) => ([...old_banner, message]))
    }

    // Append to the banner array, but indent it X number of times
    function append_indent_banner(message, indent_level = 1) {
        const indent_string = "----";
        return append_banner(indent_string.repeat(indent_level) + "> " + message);
    }

    function append_inline_banner(message) {
        return set_banner((old_banner) => {
            const new_banner = [...old_banner];
            const last_index = new_banner.length-1;
            new_banner[last_index] = new_banner[last_index] + message;
            return [...new_banner];

        })
    }

    // Empty out the banner array
    function clear_banner() {
        return set_banner([]);
    }

    // Add the banner functions to the global context so that all the elements can change the banner
    useEffect(() => {
        global_context.update_global_context({
            replace_banner: replace_banner,
            append_banner: append_banner,
            clear_banner: clear_banner,
            append_indent_banner: append_indent_banner,
            append_inline_banner: append_inline_banner,
            set_banner_style: set_banner_style,
        });
    },[]);

    let banner_color = colors.banner_grey;

    if (banner_style == "success") {
        banner_color = colors.banner_green;
    }

    if (banner_style == "failure") {
        banner_color = colors.banner_red;
    }

    if (banner_style == "warning") {
        banner_color = colors.banner_yellow;
    }

    const calculated_banner_style = {
        backgroundColor: banner_color,
        paddingLeft: ".5em",
        paddingRight: ".5em",
        position: "relative"
    }

    const close_style = {
        position: "absolute",
        padding: ".5em",
        right: "0",
        top: "0",
    }

    return (<>
        {banner.length > 0
            && <>
                <div style={calculated_banner_style}>
                    {banner.map((message) => <p key={message}>{message}</p>)}
                    <div onClick={clear_banner} className="hover-element" style={close_style}>x</div>
                </div>
                <br />
            </>
        }
    </>)
}