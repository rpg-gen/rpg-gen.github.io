import { useNavigate, useLocation } from "react-router-dom"
import { useContext } from "react"

import spacing from "../configs/spacing"
import FullPageOverlay from "../components/full_page_overlay"
import class_names from "../configs/class_names"
import { nav_paths } from "../configs/constants"
import UserContext from "../contexts/user_context"
import { is_admin, is_ttrpg_user } from "../configs/auth"

export default function MainMenu() {

    // Hooks
    const location = useLocation()
    const user_context = useContext(UserContext)

    // Variables
    let map_link_text = 'Map'
    const email = user_context.username
    const show_public = !user_context.is_logged_in || is_admin(email)
    const show_rpg_notes = !user_context.is_logged_in || is_ttrpg_user(email)
    const show_admin = is_admin(email)

    // If we're already on the map page, change the text to indicate we can go back
    if (location.pathname.includes(nav_paths.map)) {
        map_link_text = 'Back to Map'
    }

    return (
        <FullPageOverlay>
            {show_public && <MainMenuOption label={map_link_text} target={nav_paths.map} />}
            {show_public && <MainMenuOption label="Delve Cards" target={nav_paths.delve_card_list} />}
            {show_public && <MainMenuOption label="Random Card" target={nav_paths.delve_card_random} />}
            {show_rpg_notes && <MainMenuOption label="RPG Notes" target={nav_paths.rpg_notes} />}
            <MainMenuOption label="Account" target="/account" />
            {show_admin && <>
                <MainMenuOption label="Tagger" target="/tagger" />
                <MainMenuOption label="RPG Notes Feedback" target={nav_paths.feedback_management} />
                <MainMenuOption label="Utilities" target={nav_paths.utilities_menu} />
            </>}
        </FullPageOverlay>
    )
}

function MainMenuOption(props: {label: string, target: string}) {

    const navigate = useNavigate()

    function handle_menu_item_click() {
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