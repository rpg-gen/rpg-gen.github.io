import { memo } from "react"
import { useNavigate } from "react-router-dom"

import spacing from "../../configs/spacing"
import ham_menu_black from "../../assets/ham_menu_black.svg"
import top_bar_button_style from "./top_bar_button_style"

export default memo(function HamMenu(props: {
    navigate_away_from_map: Function
}) {


    function click_action() {
        props.navigate_away_from_map("/main_menu")
    }

    return (
        <>

        <div

            style={{
                ...top_bar_button_style,
                backgroundColor: "white",
                marginLeft: spacing.top_bar_margin.toString() + "rem",
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