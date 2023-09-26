import { useEffect, MutableRefObject, useLayoutEffect } from "react"

export default function Loading(props: {
    loading_function_ref: MutableRefObject<Function>,
    set_is_show_loading: Function
}) {

    console.log("loading screen rendered")

    // useEffect(() => {
    //     console.log("loading screen effect called")
    // //     console.log("calling loading function")
    // //     props.loading_function_ref.current()
    // //     console.log("finished loading function")

    //     let currentTime = new Date().getTime();
    //     while (currentTime + 2000 >= new Date().getTime()) {}

    //     // props.set_is_show_loading(false)

    //     console.log("loading screen effect done")
    // },[])


    return (
        <div style={{
            position: "fixed",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "rgba(255, 255, 255, .8)",
            zIndex: 101,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column"
        }}>
            DRAWING MAP...
        </div>
    )
}