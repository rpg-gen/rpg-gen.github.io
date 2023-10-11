import { createContext } from "react"

const user_context_raw = {
    is_logged_in: false,
    is_auth_checked: false,
    username: "",
}

const UserContext = createContext(user_context_raw)

export default UserContext