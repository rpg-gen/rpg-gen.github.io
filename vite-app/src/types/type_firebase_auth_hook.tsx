type type_firebase_auth_hook = {
    set_user_listener: (callback: (user: unknown) => void) => void,
    delete_firebase_user: () => Promise<boolean>,
    login_firebase_user: (username: string, password: string) => Promise<unknown>,
    logout_firebase_user: () => Promise<void>,
    get_current_firebase_user: () => unknown,
}

export default type_firebase_auth_hook