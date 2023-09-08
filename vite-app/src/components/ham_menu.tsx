import ham_menu_black from "../assets/ham_menu_black.svg";
import { Link } from "react-router-dom"
import spacing from "../configs/spacing"

export default function HamMenu() {

    const ham_menu_height = spacing.top_bar_height
    const ham_menu_margin = spacing.top_bar_margin

    return (
        <>

        <Link to="/">

        <img

        style={{
            height: ham_menu_height.toString() + "rem",
            width: ham_menu_height.toString() + "rem",
            border: "1px solid black",
            padding: ".1rem",
            boxSizing: "border-box",
            borderRadius: "20%",
            backgroundColor: "white",
            marginRight: ham_menu_margin.toString() + "rem"
        }}

        src={ham_menu_black}

        />

        </Link>

        </>
    )
}