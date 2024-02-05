import { useEffect, MutableRefObject, useLayoutEffect } from "react"

export default function Loading(props: {
    loading_function_ref: MutableRefObject<Function>,
    set_is_show_loading: Function
}) {
    return (
        <div style={{
            position: "fixed",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "rgba(255, 255, 255, .8)",
            zIndex: 9,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column"
        }}>
            DRAWING MAP...
        </div>
    )
}