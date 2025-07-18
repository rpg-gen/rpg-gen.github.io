import { useNavigate, useLocation } from "react-router-dom"
import { MouseEvent, useContext } from "react"

import spacing from "../configs/spacing"
import FullPageOverlay from "../components/full_page_overlay"
import class_names from "../configs/class_names"
import { nav_paths } from "../configs/constants"
import UserContext from "../contexts/user_context"

const main_menu_overlay_id = "main_menu_overlay"

export default function MainMenu(props: {}) {

    // Hooks
    const location = useLocation()
    const user_context = useContext(UserContext)

    // Variables
    let map_link_text = 'Map'

    // If we're already on the map page, change the text to indicate we can go back
    if (location.pathname.includes(nav_paths.map)) {
        map_link_text = 'Back to Map'
    }

    return (
        <FullPageOverlay>
            <MainMenuOption label={map_link_text} target={nav_paths.map} />
            <MainMenuOption label="Account" target="/account" />
            {
                user_context.is_logged_in
                ? <MainMenuOption label="Tagger" target="/tagger" />
                : ""
            }
        </FullPageOverlay>
    )
}

function MainMenuOption(props: {label: string, target: string}) {

    const navigate = useNavigate()

    function handle_menu_item_click(event: MouseEvent) {
        navigate(props.target)
    }

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                marginTop: spacing.top_bar_margin + "rem"
            }}

            className={class_names.count_as_off_click}
        >
            <button onClick={handle_menu_item_click}>{props.label}</button>
        </div>
    )
}