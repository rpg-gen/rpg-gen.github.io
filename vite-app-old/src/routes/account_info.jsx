import React from "react";
import { useState, useContext } from "react";
import GlobalContext from "../contexts/global_context.jsx";
import useFirebaseAuth from "../hooks/use_firebase_auth.jsx";

export default function AccountInfo() {

    const global_context = useContext(GlobalContext);

    return (
        <React.Fragment>
            {/* {global_context.user == null ? <p>Log in to see the full menu and options</p> : <p>Here is the account info</p>} */}
            <p>Current User: {global_context.user != null ? global_context.user.email : "Not logged in"}</p>
            <div>
                <LoginForm />
            </div>
        </React.Fragment>
    )
}

// Form to handle logging in and logging out
function LoginForm() {

    const global_context = useContext(GlobalContext);
    const user = global_context.user;
    const is_auth_checked = global_context.is_auth_checked;
    const is_logged_in = (user != null && user.email != null) ? true : false;

    const [field_username, set_field_username] = useState("");
    const [field_password, set_field_password] = useState("");

    function handle_login(event) {
        event.preventDefault();
        return global_context.firebase_auth.login_firebase_user(field_username, field_password);
    }

    function handle_logout(e) {
        e.preventDefault();
        return global_context.firebase_auth.logout_firebase_user();
    }

    return (
        // Show the login fields if not logged in, otherwise just who the logout button
        is_logged_in
        ? <button onClick={handle_logout}>Log out</button>
        : <form onSubmit={handle_login}>
            <label htmlFor="username_field">Username: </label>
            <input label="Username" type="text" id="username_field" name="username" defaultValue={field_username} onChange={(event) => set_field_username(event.target.value)} />
            <br />
            <label htmlFor="password_field">Password: </label>
            <input label="Password" type="password" id="password_field" name="password" defaultValue={field_password} onChange={(event) => set_field_password(event.target.value)} />
            <br />
            <button type="submit">Log in</button>
        </form>
    );
}

export { LoginForm };