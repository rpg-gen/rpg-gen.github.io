import './App.css'
import { Outlet } from "react-router-dom"
import { useContext, useState } from "react"
import UserContext from "./contexts/user_context"

import useFirebaseAuth from "./hooks/use_firebase_auth"

function App() {

    const firebase_auth_hook = useFirebaseAuth()
    const [username, set_username] = useState("")
    const [is_logged_in, set_is_logged_in] = useState(false)
    const user_context = useContext(UserContext)
    firebase_auth_hook.set_user_listener((user: any) => {
        console.log(user)
        // user_context.username = username
        // user_context.is_logged_in =
    })
    firebase_auth_hook.login_firebase_user("tarronlane2@gmail.com", "fisheyes19911")

    // const paint_context = usePaintTool()
    // const map_context = useMapContext(20, 20)

    // =========================================================================
    // Firebase user authentication
    // =========================================================================


    return (
        <>
        {/* <MapContext.Provider value={map_context}> */}
        {/* <PaintContext.Provider value={paint_context}> */}

        <Outlet />

        {/* </PaintContext.Provider> */}
        {/* </MapContext.Provider> */}

        </>
    )
}

export default App
