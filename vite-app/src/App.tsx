import './App.css'
import { Outlet } from "react-router-dom"
import { useContext, useState, useEffect } from "react"
import UserContext from "./contexts/user_context"

import useFirebaseAuth from "./hooks/use_firebase_auth"

function App() {

    const [is_logged_in, set_is_logged_in] = useState(false)
    const [user_context, set_user_context] = useState(useContext(UserContext))

    // =========================================================================
    // Firebase user authentication
    // =========================================================================


    const firebase_auth_hook = useFirebaseAuth()

    useEffect(function() {

        firebase_auth_hook.set_user_listener((user: any) => {
            console.log("user has changed", user)
            set_user_context({
                is_logged_in: (user != null ? true : false),
                is_auth_checked: true,
                username: user.email
            })
        })

    }, [])

    useEffect(function(){
        if (user_context.username) {
            console.log("Loading map")
        }
    }, [user_context])

    // firebase_auth_hook.login_firebase_user("tarronlane@gmail.com", "IsItBadToPasswordShare?")
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

        <Outlet />

        </UserContext.Provider>
        {/* </PaintContext.Provider> */}
        {/* </MapContext.Provider> */}

        </>
    )
}

export default App
