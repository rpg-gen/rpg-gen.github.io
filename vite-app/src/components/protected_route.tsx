import { useContext } from "react"
import { Navigate } from "react-router-dom"
import UserContext from "../contexts/user_context"
import { is_admin, is_ttrpg_user } from "../configs/auth"

interface ProtectedRouteProps {
    children: React.ReactNode
    require?: "admin" | "ttrpg"
}

export default function ProtectedRoute({ children, require }: ProtectedRouteProps) {
    const user_context = useContext(UserContext)

    if (!user_context.is_auth_checked) {
        return <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            fontSize: "20px"
        }}>
            Loading...
        </div>
    }

    if (!user_context.is_logged_in) {
        return <Navigate to="/account" replace />
    }

    if (require === "admin" && !is_admin(user_context.username)) {
        return <Navigate to="/" replace />
    }

    if (require === "ttrpg" && !is_ttrpg_user(user_context.username)) {
        return <Navigate to="/" replace />
    }

    return <>{children}</>
}

