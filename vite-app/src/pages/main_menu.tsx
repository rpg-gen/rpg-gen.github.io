import { useNavigate } from "react-router-dom"
import { MouseEvent } from "react"

import spacing from "../configs/spacing"
import FullPageOverlay from "../components/full_page_overlay"
import class_names from "../configs/class_names"

const main_menu_overlay_id = "main_menu_overlay"

export default function MainMenu(props: {}) {

    return (
        <FullPageOverlay>
            <MainMenuOption label="Back to Map" target="/" />
            <MainMenuOption label="Account" target="/account" />
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