import { ReactNode, MouseEvent } from "react"
import { useNavigate } from "react-router-dom"

import spacing from "../configs/spacing"
import class_names from "../configs/class_names"

export default function FullPageOverlay(props: {
    children: ReactNode|ReactNode[]
}) {

    const navigate = useNavigate()

    function handle_off_click(event: MouseEvent) {
        if ((event.target as HTMLDivElement).classList.contains(class_names.count_as_off_click)) {
            navigate("/")
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
                backgroundColor: "rgba(0, 0, 0, .75)",
                zIndex: 100,
                display: "flex",
                paddingTop: spacing.hex_grid_top_border + "px",
                paddingLeft: spacing.top_bar_margin + "rem",
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
