import ham_menu_black from "../../assets/ham_menu_black.svg"
import top_bar_button_style from "./top_bar_button_style"
import { memo } from "react"

export default memo(function HamMenu(props: {ham_menu_action: Function}) {

    function click_action() {
        props.ham_menu_action()
    }

    return (
        <>

        <div

            style={{
                ...top_bar_button_style,
                backgroundColor: "white",
            }}

            className="hover-element"

            onClick={click_action}
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