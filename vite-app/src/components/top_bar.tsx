import HamMenu from "../components/ham_menu"
import EditBrushButton from "../components/edit_brush_button"
import ZoomButton from "../components/zoom_button"
import spacing from "../configs/spacing"
import CSS from 'csstype'

export default function TopBar() {

    const top_bar_button_style: CSS.Properties = {
        height: spacing.top_bar_height.toString() + "rem",
        width: spacing.top_bar_height.toString() + "rem",
        border: "1px solid black",
        padding: ".1rem",
        boxSizing: "border-box",
        borderRadius: "20%",
        marginRight: spacing.top_bar_margin.toString() + "rem"
    }

    return (
        <>

        <div style={{
            display: "flex",
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: spacing.top_bar_height.toString() + "rem",
            marginLeft: spacing.top_bar_margin.toString() + "rem",
            marginTop: spacing.top_bar_margin.toString() + "rem",
            marginRight: spacing.top_bar_margin.toString() + "rem",
            paddingLeft: spacing.top_bar_padding.toString() + "rem",
            paddingTop: spacing.top_bar_padding.toString() + "rem",
            paddingRight: spacing.top_bar_padding.toString() + "rem",
            alignItems: "center",
            maxWidth: "100%",
            minWidth: "100%"
        }}>
            <HamMenu top_bar_button_style={top_bar_button_style} />
            <EditBrushButton top_bar_button_style={top_bar_button_style} />
            <ZoomButton top_bar_button_style={top_bar_button_style} />
        </div>

        {/* <div style={{height: (spacing.top_bar_height + spacing.top_bar_margin).toString() + "rem" }}></div> */}

        </>
    )
}