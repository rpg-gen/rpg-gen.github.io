import GlobalContext from "../contexts/global_context.jsx";
import { useContext, useState, useEffect } from "react";
import configs from "../utility/configs.jsx";
import useFirebaseAuth from "../hooks/use_firebase_auth.jsx";
// import useAtlasAuth from "../hooks/use_atlas_auth.jsx";


export default function useGlobalContext() {
    const [global_context, set_global_context] = useState(useContext(GlobalContext));
    const firebase_auth = useFirebaseAuth();

    function update_global_context(merge_dict) {
        return set_global_context((old_context) => ({
            ...old_context,
            ...merge_dict
        }))
    };

    function update_window_dimensions() {
        const new_is_mobile_view = (window.innerWidth < configs.mobile_collapse_point ? true : false)
        update_global_context({
            window_width: window.innerWidth,
            window_height: window.innerHeight,
            is_mobile_view: new_is_mobile_view,
        })
    };

    useEffect(() => {
        update_window_dimensions();
        window.addEventListener("resize", update_window_dimensions);

        firebase_auth.set_user_listener((user) => {
            update_global_context({
                user: user,
                is_auth_checked: true,
            })
        });

        // atlas_auth.set_user_listener(() => (atlas_user) => {
        //     update_global_context({
        //         atlas_user: atlas_user,
        //         is_atlas_auth_checked: true
        //     });
        // });

        // atlas_auth.set_user_listener(() => (atlas_user_listener));

        return (() => window.removeEventListener("resize", update_window_dimensions))
    },[]);

    global_context.update_global_context = update_global_context;
    global_context.firebase_auth = firebase_auth;

    // global_context.atlas_auth = atlas_auth;


    return global_context;
}
