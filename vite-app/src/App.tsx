import './App.css'
import { Outlet } from "react-router-dom"
import { useContext, useState, useEffect } from "react"
import UserContext from "./contexts/user_context"
import hexagon_math from "./utility/hexagon_math"

import useFirebaseAuth from "./hooks/use_firebase_auth"
import useFirebaseMap from "./hooks/use_firebase_map"

function App() {

    const [user_context, set_user_context] = useState(useContext(UserContext))

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
    //     .then(function(payload: any) {console.log("Successfully logged in")})
    //     .catch((payload: any) => {
    //         console.log("Here is the payload", payload)
    //     })

    // firebase_auth_hook.logout_firebase_user()

    // const paint_context = usePaintTool()
    // const map_context = useMapContext(20, 20)


    return (
        <>
        {/* <MapContext.Provider value={map_context}> */}
        {/* <PaintContext.Provider value={paint_context}> */}

        <UserContext.Provider value={user_context}>

            { user_context.is_auth_checked ? <Outlet /> : ""}

        </UserContext.Provider>

        {/* </PaintContext.Provider> */}
        {/* </MapContext.Provider> */}

        </>
    )
}

export default App
