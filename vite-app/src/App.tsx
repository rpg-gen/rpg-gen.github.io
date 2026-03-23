import './App.css'
import { Outlet, useNavigate, useLocation } from "react-router-dom"
import { useContext, useState, useEffect, useRef } from "react"

import DataContext from "./contexts/DataContext"
import UserContext from "./contexts/user_context"
import scale_context from './contexts/scale_context'
import { DelveCardFilterProvider } from './contexts/delve_card_filter_context'
import { nav_paths } from './configs/constants'

import useFirebaseAuth from "./hooks/use_firebase_auth"
import FeedbackButton from "./components/feedback_button"
import DemoBanner from "./components/demo_banner"
import DemoResetButton from "./components/demo_reset_button"
import LoadingModal from "./components/loading_modal"

function App() {

    // State
    const [user_context, set_user_context] = useState(useContext(UserContext))
    const [app_scale_context, set_scale_context] = useState(useContext(scale_context))
    const [showTransitionModal, setShowTransitionModal] = useState(false)
    const [transitionComplete, setTransitionComplete] = useState(false)
    const prevLoggedInRef = useRef<boolean | null>(null)
    const navigate = useNavigate()
    const location = useLocation()

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
        firebase_auth_hook.set_user_listener((user: unknown) => {
            set_user_context({
                is_logged_in: (user != null ? true : false),
                is_auth_checked: true,
                username: (user as { email?: string } | null)?.email ?? "",
                set_user_context: set_user_context,
            })
        })

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Detect login transition (demo -> logged in), skip initial page load
    useEffect(() => {
        if (!user_context.is_auth_checked) return
        if (prevLoggedInRef.current !== null && user_context.is_logged_in && !prevLoggedInRef.current) {
            setShowTransitionModal(true)
            setTransitionComplete(false)
            setTimeout(() => setTransitionComplete(true), 500)
        }
        prevLoggedInRef.current = user_context.is_logged_in
    }, [user_context.is_auth_checked, user_context.is_logged_in])

    function handleTransitionClose() {
        setShowTransitionModal(false)
        if (location.pathname.startsWith(nav_paths.rpg_notes)) {
            navigate(nav_paths.rpg_notes)
        }
    }

    return (
        <>

        <UserContext.Provider value={user_context}>
        <scale_context.Provider value={app_scale_context}>
        <DataContext.Provider value={data_context}>
        <DelveCardFilterProvider>

            { user_context.is_auth_checked ? <Outlet /> : "Loading auth"}
            <FeedbackButton />
            <DemoBanner />
            <DemoResetButton />
            {showTransitionModal && (
                <LoadingModal
                    message="Switching to your data..."
                    isComplete={transitionComplete}
                    onClose={handleTransitionClose}
                />
            )}

        </DelveCardFilterProvider>
        </DataContext.Provider>
        </scale_context.Provider>
        </UserContext.Provider>

        </>
    )
}

export default App
