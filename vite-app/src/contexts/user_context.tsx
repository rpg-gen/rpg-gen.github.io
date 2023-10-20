import { createContext } from "react"
import type_user_context from "../types/type_user_context"

const noop: React.Dispatch<React.SetStateAction<type_user_context>> = function (){}

const user_context_raw = {
    is_logged_in: false,
    is_auth_checked: false,
    username: "",
    set_user_context: noop,
}

const UserContext = createContext(user_context_raw)

export default UserContext