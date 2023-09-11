import { useEffect } from "react";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import useFirebaseProject from "../hooks/use_firebase_project.jsx";

export default function useFirebaseAuth(auth_changed_callback) {
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

    function login_firebase_user(username, password) {
        return signInWithEmailAndPassword(firebase_auth, username, password);
    }

    function logout_firebase_user() {
        return signOut(firebase_auth);
    }

    function set_user_listener(auth_changed_callback) {
        onAuthStateChanged(firebase_auth, (user) => {
            auth_changed_callback(user);
        });
    }

    return {
        // create_new_firebase_user: create_new_firebase_user,
        set_user_listener: set_user_listener,
        delete_firebase_user: delete_firebase_user,
        login_firebase_user: login_firebase_user,
        logout_firebase_user: logout_firebase_user,
    }


}