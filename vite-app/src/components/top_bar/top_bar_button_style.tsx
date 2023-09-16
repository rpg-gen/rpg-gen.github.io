import spacing from "../../configs/spacing"
import CSS from "csstype"

const top_bar_button_style: CSS.Properties = {
    height: spacing.top_bar_height.toString() + "rem",
    width: spacing.top_bar_height.toString() + "rem",
    border: "1px solid black",
    padding: ".1rem",
    boxSizing: "border-box",
    borderRadius: "20%",
    marginRight: spacing.top_bar_margin.toString() + "rem",
    zIndex: 20
}

export default top_bar_button_style