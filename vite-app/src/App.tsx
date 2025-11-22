import './App.css'
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { useContext, useState, useEffect } from "react"

import DataContext from "./contexts/DataContext"
import UserContext from "./contexts/user_context"
import scale_context from './contexts/scale_context'
import { DelveCardFilterProvider } from './contexts/delve_card_filter_context'

import useFirebaseAuth from "./hooks/use_firebase_auth"
import useFirebaseMap from "./hooks/use_firebase_map"
import Matrix from './classes/Matrix'
import MainMenu from './pages/main_menu'

function App() {

    // Hooks
    const location = useLocation()
    const navigate = useNavigate()

    // if (location.pathname == '/') {
    //     navigate('/map')
    // }

    // State
    const [user_context, set_user_context] = useState(useContext(UserContext))
    const [app_scale_context, set_scale_context] = useState(useContext(scale_context))

    // We have to load the firebase data here so it stays persistent even if other parts of the website need to reload
    // same applies to the regular matrix even if we're not using firebase
    // For example, zoom changes that reset the scale context would throw away the map data otherwise
    const firebase_map_hook = useFirebaseMap()
    const data_context = useContext(DataContext)

    data_context.matrix.resize(
        app_scale_context.hexagon_edge_pixels,
        app_scale_context.num_hexes_tall,
        app_scale_context.num_hexes_wide
    )

    app_scale_context.set_scale_context = set_scale_context

    // =========================================================================
    // Firebase user authentication
    // =========================================================================

    const firebase_auth_hook = useFirebaseAuth()

    useEffect(function() {
        firebase_auth_hook.set_user_listener((user: any) => {
            set_user_context({
                is_logged_in: (user != null ? true : false),
                is_auth_checked: true,
                username: user?.email,
                set_user_context: set_user_context,
            })
        })

    }, [])

    // firebase_auth_hook.login_firebase_user("tarronlane@gmail.com", "*****")
    //     .then(function(payload: any) {})
    //     .catch((payload: any) => {
    //     })

    // firebase_auth_hook.logout_firebase_user()

    // const paint_context = usePaintTool()
    // const map_context = useMapContext(20, 20)


    return (
        <>

        <UserContext.Provider value={user_context}>
        <scale_context.Provider value={app_scale_context}>
        <DataContext.Provider value={data_context}>
        <DelveCardFilterProvider>

            { user_context.is_auth_checked ? <Outlet /> : "Loading auth"}

        </DelveCardFilterProvider>
        </DataContext.Provider>
        </scale_context.Provider>
        </UserContext.Provider>

        </>
    )
}

export default App
