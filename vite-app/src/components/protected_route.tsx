import { useContext } from "react"
import { Navigate } from "react-router-dom"
import UserContext from "../contexts/user_context"

interface ProtectedRouteProps {
    children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
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

    return <>{children}</>
}

