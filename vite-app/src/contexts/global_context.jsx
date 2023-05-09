import { createContext } from 'react';

const context_obj = {
    user: null,
    is_auth_checked: false,
    window_width: null,
    window_height: null,
    is_mobile_view: null,
    banner: [],
    set_global_context: null,
    site_title: "RPG Assistant",
    is_show_sidebar: false,
    is_show_rightbar: false,
    rightbar_content: "test"
}

const GlobalContext = createContext(context_obj);

export default GlobalContext;