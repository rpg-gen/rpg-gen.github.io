export type UserRole = "admin" | "ttrpg" | "none"

const ADMIN_EMAIL = "tarronlane@gmail.com"
const TTRPG_EMAIL = "tarronlane2@gmail.com"

export function get_user_role(email: string): UserRole {
    if (email === ADMIN_EMAIL) return "admin"
    if (email === TTRPG_EMAIL) return "ttrpg"
    return "none"
}

export function is_admin(email: string): boolean {
    return get_user_role(email) === "admin"
}

export function is_ttrpg_user(email: string): boolean {
    const role = get_user_role(email)
    return role === "admin" || role === "ttrpg"
}
