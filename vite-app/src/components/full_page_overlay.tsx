import { ReactNode, MouseEvent, useContext } from "react"

import spacing from "../configs/spacing"
import class_names from "../configs/class_names"
import { ttrpg } from "../configs/ttrpg_theme"
import UserContext from "../contexts/user_context"
import { DEMO_BANNER_HEIGHT } from "./demo_banner"

export default function FullPageOverlay(props: {
    children: ReactNode|ReactNode[]
}) {
    const user_context = useContext(UserContext)
    const is_demo = user_context.is_auth_checked && !user_context.is_logged_in
    const top_offset = is_demo ? DEMO_BANNER_HEIGHT : 0

    function handle_off_click(event: MouseEvent) {
        if ((event.target as HTMLDivElement).classList.contains(class_names.count_as_off_click)) {
            // navigate(nav_paths.map)
        }
    }

    return (
        <div
            style={{
                position: "absolute",
                top: top_offset,
                // bottom: 0,
                minHeight: `calc(100% - ${top_offset}px)`,
                left: 0,
                right: 0,
                backgroundColor: ttrpg.colors.pageBg,
                color: "#fff",
                zIndex: 100,
                display: "flex",
                paddingTop: spacing.hex_grid_top_border + "px",
                paddingLeft: spacing.top_bar_margin + "rem",
                paddingBottom: 80,
                flexDirection: "column",
                boxSizing: "border-box",
                overflow: "auto"
            }}

            className={class_names.count_as_off_click}

            onClick={handle_off_click}
        >
            {props.children}
        </div>
    )
}
