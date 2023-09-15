import spacing from "../configs/spacing"
import { useContext } from "react"
import MapContext from "../contexts/map_context"

export default function ZoomPicker() {

    const zoom_options = Array.from({length: 10}, (_, index) => {
        return <ZoomOption key={index + 1} zoom_level={index + 1} />
    })

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
                // alignItems: "center",
                // justifyContent: "center",
                justifyContent: "center",
            }}>
                <div style={{
                    display: "flex",
                    maxWidth: ((spacing.top_bar_height * 2.5 + spacing.top_bar_margin * 2) * 3) + "rem",
                    flexWrap: "wrap",
                }}>
                    {zoom_options}
                </div>
            </div>

        </div>

        </>
    )
}

function ZoomOption(props: {zoom_level: number}) {

    const map_context = useContext(MapContext)

    function handle_click() {
        map_context.set_zoom_level(props.zoom_level)
        map_context.set_is_show_zoom_picker(false)
    }

    return (
        <>

        <div
            style={{
                width: (spacing.top_bar_height * 2.5).toString() + "rem",
                height: spacing.top_bar_height.toString() + "rem",
                backgroundColor: "white",
                margin: spacing.top_bar_margin.toString() + "rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid black",
                borderRadius: "10%",
                color: "black",
                boxSizing: "border-box",
                flexShrink: 0
            }}

            className="hover-element"

            onClick={handle_click}
        >
            {props.zoom_level}
        </div>

        </>
    )
}