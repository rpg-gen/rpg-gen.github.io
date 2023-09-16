import spacing from "../configs/spacing"

export default function ZoomPicker(props: {children: JSX.Element[]}) {

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
            flexDirection: "column"
        }}>

            <div style={{
                display: "flex",
                justifyContent: "center",
            }}>
                <div style={{
                    display: "flex",
                    maxWidth: ((spacing.top_bar_height * 2.5 + spacing.top_bar_margin * 2) * 3) + "rem",
                    flexWrap: "wrap",
                }}>
                    {props.children}
                </div>
            </div>

        </div>

        </>
    )
}

