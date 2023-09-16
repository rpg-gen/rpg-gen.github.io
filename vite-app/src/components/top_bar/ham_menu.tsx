import ham_menu_black from "../../assets/ham_menu_black.svg"
import top_bar_button_style from "./top_bar_button_style"
import { memo } from "react"

export default memo(function HamMenu() {

    return (
        <>

        <div

            style={{
                ...top_bar_button_style,
                backgroundColor: "white",
            }}

            className="hover-element"
        >

                <img
                    src={ham_menu_black}
                    style={{
                        padding: ".1rem",
                        boxSizing: "border-box",
                        height: "100%",
                        width: "100%",

                    }}
                />

        </div>
        </>
    )
})