import { useContext } from "react"
import UserContext from "../contexts/user_context"

export default function DemoBanner() {
    const user_context = useContext(UserContext)

    if (!user_context.is_auth_checked || user_context.is_logged_in) return null

    return (
        <div
            title="Changes are stored locally on this device and won't be saved permanently"
            style={{
                height: 28,
                backgroundColor: "rgba(37, 99, 235, 0.9)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: "0.5px",
                cursor: "default",
            }}
        >
            Demo Mode
        </div>
    )
}
