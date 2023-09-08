import HamMenu from "../components/ham_menu"
import EditBrushButton from "../components/edit_brush_button"
import spacing from "../configs/spacing"

export default function TopBar() {

    return (
        <>

        <div style={{
            display: "flex",
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: spacing.top_bar_height.toString() + "rem",
            marginLeft: spacing.top_bar_margin.toString() + "rem",
            marginTop: spacing.top_bar_margin.toString() + "rem",
            marginRight: spacing.top_bar_margin.toString() + "rem",
            alignItems: "center"
        }}>
            <HamMenu />
            <EditBrushButton />
        </div>

        <div style={{height: (spacing.top_bar_height + spacing.top_bar_margin).toString() + "rem" }}></div>

        </>
    )
}