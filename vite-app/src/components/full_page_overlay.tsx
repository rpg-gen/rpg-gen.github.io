import { ReactNode, MouseEvent } from "react"

import spacing from "../configs/spacing"
import class_names from "../configs/class_names"
import { ttrpg } from "../configs/ttrpg_theme"

export default function FullPageOverlay(props: {
    children: ReactNode|ReactNode[]
}) {

    function handle_off_click(event: MouseEvent) {
        if ((event.target as HTMLDivElement).classList.contains(class_names.count_as_off_click)) {
            // navigate(nav_paths.map)
        }
    }

    return (
        <div
            style={{
                position: "absolute",
                top: 0,
                // bottom: 0,
                minHeight: "100%",
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
