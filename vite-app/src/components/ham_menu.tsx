import ham_menu_black from "../assets/ham_menu_black.svg";
import CSS from "csstype"

export default function HamMenu(props: {top_bar_button_style: CSS.Properties}) {

    return (
        <>

        <div

            style={{
                ...props.top_bar_button_style,
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
}