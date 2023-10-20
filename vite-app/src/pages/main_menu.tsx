import { Link } from "react-router-dom"
import colors from "../configs/colors"

export default function MainMenu(props: {
    set_is_show_main_menu: Function,
    set_is_show_account: Function,
}) {

    function handle_account_click() {
        props.set_is_show_main_menu(false)
        props.set_is_show_account(true)
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
            <button onClick={() => {props.set_is_show_main_menu(false)}}>Back to Map</button>
            <button onClick={handle_account_click}>Account</button>
        </div>

        </>
    )
}