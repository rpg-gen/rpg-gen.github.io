type type_firebase_auth_hook = {
    set_user_listener: Function,
    delete_firebase_user: Function,
    login_firebase_user: Function,
    logout_firebase_user: Function,
    get_current_firebase_user: Function,
}

export default type_firebase_auth_hook