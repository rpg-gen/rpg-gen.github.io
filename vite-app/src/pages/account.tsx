import colors from "../configs/colors"
import { useContext, useState, FormEvent} from "react"
import userContext from "../contexts/user_context"

export default function Account() {
    const user_context = useContext(userContext)

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
                <LoginForm />
            </div>
        </div>

        </>
    )
}

function LoginForm() {
    const [username, set_username] = useState("")
    const [password, set_password] = useState("")

    function handle_username_input(event: FormEvent<HTMLInputElement>) {
        set_username((event.target as HTMLInputElement).value)
    }

    function handle_password_input(event: FormEvent<HTMLInputElement>) {
        set_password((event.target as HTMLInputElement).value)
    }

    function handle_submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
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
                <div style={{display: "flex", justifyContent: "center"}}><button style={{marginTop: "10px", width: "100px"}}>Login</button></div>
            </div>
        </form>
    )
}