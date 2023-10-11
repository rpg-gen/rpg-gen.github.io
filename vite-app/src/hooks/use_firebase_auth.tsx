import { useEffect } from "react";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import useFirebaseProject from "./use_firebase_project.jsx";
import type_firebase_auth_hook from "../types/type_firebase_auth_hook.js"

export default function useFirebaseAuth() {
    const firebase_auth = getAuth(useFirebaseProject());

    // function create_new_firebase_user() {

    //     createUserWithEmailAndPassword(firebase_auth, '', '')
    //         .then((user_credential) => {
    //             const user = user_credential.user;
    //         })
    //         .catch((error) => {
    //             const error_code = error.code;
    //             const error_message = error.message;
    //         })
    // }

    async function delete_firebase_user() {
        return false;
    }

    function login_firebase_user(username: string, password: string) {
        return signInWithEmailAndPassword(firebase_auth, username, password).catch(function(error) {
            console.log(error)
            console.log(error.code)
            console.log(error.message)
        });
    }

    function logout_firebase_user() {
        return signOut(firebase_auth);
    }

    function set_user_listener(auth_changed_callback: Function) {
        onAuthStateChanged(firebase_auth, (user) => {
            auth_changed_callback(user);
        });
    }

    const firebase_auth_hook: type_firebase_auth_hook = {
        set_user_listener,
        delete_firebase_user,
        login_firebase_user,
        logout_firebase_user,
    }

    return firebase_auth_hook
}