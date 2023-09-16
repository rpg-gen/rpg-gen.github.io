
import spacing from "../../configs/spacing"

export default function TopBar(props: {children: JSX.Element[]}) {

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
            {props.children}
        </div>
        {/* <div style={{height: (spacing.top_bar_height + spacing.top_bar_margin).toString() + "rem" }}></div> */}

        </>
    )
}