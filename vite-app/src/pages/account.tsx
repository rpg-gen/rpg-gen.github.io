import { useContext, useState, FormEvent} from "react"
import { useNavigate } from "react-router-dom"

import colors from "../configs/colors"
import userContext from "../contexts/user_context"
import useFirebaseAuth from "../hooks/use_firebase_auth"

export default function Account(props: {set_is_show_loading: Function}) {
    const user_context = useContext(userContext)
    const navigate = useNavigate()
    const [is_logging_out, set_is_logging_out] = useState(false)

    function successful_login_action() {
        props.set_is_show_loading(true)
        navigate("/")
    }

    function cancel_action() {
        navigate("/")
    }

    function logout_action() {
        props.set_is_show_loading(true)
        set_is_logging_out(true)
        const firebase_auth_hook = useFirebaseAuth()
        firebase_auth_hook.logout_firebase_user().then(function() {
            navigate("/")
            set_is_logging_out(false)
        })
    }

    return (
        <>

        <div style={{
            position: "fixed",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "rgba(0, 0, 0, .75)",
            zIndex: 100,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            color: colors.white,
        }}>
            <div>
                {
                    user_context.is_logged_in
                    ? (
                        is_logging_out
                        ? <p>Logging Out...</p>
                        : <>
                            <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                                <p>You are logged in as {user_context.username}</p>
                                <button style={{width: "100px"}} onClick={logout_action}>Logout</button>
                            </div>
                        </>

                    )
                    :<LoginForm successful_login_action={successful_login_action} />
                }
                <div style={{display: "flex", justifyContent: "center", marginTop: "10px"}}>
                    <button onClick={cancel_action}>Cancel</button>
                </div>
            </div>
        </div>

        </>
    )
}

function LoginForm(props: {successful_login_action: Function}) {
    const firebase_auth_hook = useFirebaseAuth()
    const [username, set_username] = useState("")
    const [password, set_password] = useState("")
    const [is_loading, set_is_loading] = useState(false)
    const [error_message, set_error_message] = useState("")

    function handle_username_input(event: FormEvent<HTMLInputElement>) {
        set_username((event.target as HTMLInputElement).value)
    }

    function handle_password_input(event: FormEvent<HTMLInputElement>) {
        set_password((event.target as HTMLInputElement).value)
    }

    function handle_submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        set_is_loading(true)
        set_error_message("")
        firebase_auth_hook.login_firebase_user(username, password).then(
            function() {
                props.successful_login_action()
            }
        ).catch(
            function() {
                set_error_message("Incorrect login credentials")
            }
        ).finally(
            function() {
                set_is_loading(false)
            }
        )
    }

    return (
        <form onSubmit={handle_submit}>
            <div style={{display: "flex", flexDirection: "column"}}>
                <div>
                    <label htmlFor="username">username: </label>
                    <input id="username" type="text" value={username} onChange={handle_username_input}/>
                </div>
                <div>
                    <label htmlFor="password">password: </label>
                    <input id="password" type="password" value={password} onChange={handle_password_input}/>
                </div>
                {
                    is_loading
                    ?
                    <div style={{display: "flex", justifyContent: "center"}}>
                        Logging in...
                    </div>
                    :
                    <div style={{display: "flex", justifyContent: "center"}}>
                        <button style={{marginTop: "10px", width: "100px"}}>Login</button>
                    </div>
                }
                {
                    error_message != ""
                    ?
                    <div style={{display: "flex", justifyContent: "center"}}>
                        {error_message}
                    </div>
                    :
                    ""
                }
            </div>
        </form>
    )
}