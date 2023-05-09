import colors from "../utility/colors.jsx";

export default function HelperBanner(banner_state=null,set_banner_state) {

    if (banner_state == null) {
        banner_state = {
            style: "neutral",
            messages: [],
        }
    }

    function set_messages (new_messages) {
        banner_state.messages = new_messages;
        // set_banner_state({...banner_state});
        set_banner_state((old_state) => {
            const new_state = {...old_state};
            new_state.messages = [...new_messages];
            return new_state;
        });
    }

    function set_style (new_style) {
        // set_banner_state({...banner_state, style: new_style});
        set_banner_state((old_state) => {
            const new_state = {...old_state};
            new_state.messages = [...old_state.messages];
            new_state.style = new_style;
            return new_state;
        });
    }

    // =========================================================================
    // Must be a unique message or it will violate React list key constraint
    // =========================================================================
    function replace_messages(message) {
        set_messages([message]);
    }

    function append_message(message) {
        // const new_messages = [...banner_state.messages, message];
        set_messages([...banner_state.messages, message]);
    }

    function append_indented_message (message, indent_level=1) {
        const indent_string = "----";
        append_message(indent_string.repeat(indent_level) + "> " + message);
    }

    function append_inline_message (message) {
        const new_messages = [...banner_state.messages];
        if (new_messages.length == 0) {
            new_messages.push(message);
        }
        else {
            const last_index = new_messages.length-1;
            new_messages[last_index] = new_messages[last_index] + message;
        }

        set_messages([...new_messages]);
    }

    function clear() {
        set_messages([]);
    }

    function get_html () {
        let banner_color = colors.banner_grey;

        if (banner_state.style == "success") {
            banner_color = colors.banner_green;
        }

        if (banner_state.style == "failure") {
            banner_color = colors.banner_red;
        }

        if (banner_state.style == "warning") {
            banner_color = colors.banner_yellow;
        }

        const calculated_banner_style = {
            backgroundColor: banner_color,
            paddingLeft: ".5em",
            paddingRight: ".5em",
            position: "relative",
            marginTop: ".5em",
        }

        const close_style = {
            position: "absolute",
            padding: ".5em",
            right: "0",
            top: "0",
        }

        return (<>
            {banner_state.messages.length > 0
                && <>
                    <div style={calculated_banner_style}>
                        {banner_state.messages.map((message) => <p key={message}>{message}</p>)}
                        <div onClick={clear} className="hover-element" style={close_style}>x</div>
                    </div>
                    <br />
                </>
            }
        </>)
    }

    return {
        banner_state: banner_state,
        replace_messages: replace_messages,
        append_message: append_message,
        append_indented_message: append_indented_message,
        append_inline_message: append_inline_message,
        set_style: set_style,
        clear: clear,
        get_html: get_html
    }
};