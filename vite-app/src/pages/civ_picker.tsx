import spacing from "../configs/spacing"
import { useState } from "react"
import colors from "../configs/colors"
import type_fabric_hook from '../types/type_fabric_hook'

export default function CivPicker(props: {set_is_show_civ_picker: Function, fabric_hook: type_fabric_hook}) {

    // console.log(props.fabric_hook.ref_clicked_hexagon_row)

    function CivPickerSection(props: {title: string, children: JSX.Element[]}) {
        return (
            <div style={{
                display: "flex",
                justifyContent: "center",
                margin: (spacing.top_bar_margin * 2) + "rem"
            }}>
                <div style={{
                    display: "flex",
                    maxWidth: ((spacing.top_bar_height * 2.5 + spacing.top_bar_margin * 2) * 3) + "rem",
                    flexWrap: "wrap",
                }}>
                    <p style={{paddingRight: "5px", color: colors.white, margin: 0}}>{props.title}: </p>
                    {props.children}
                </div>
            </div>
        )
    }

    function CivPickerButton(props: {value: string}) {
        return (
            <button onClick={handle_click}>{props.value}</button>
        )
    }

    function handle_click() {
        props.fabric_hook.add_civ_info(1,1,1)
        props.set_is_show_civ_picker(false)
    }

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

            <CivPickerSection title="Town Size">
                    <CivPickerButton value={"1"} />
                    <CivPickerButton value={"2"} />
                    <CivPickerButton value={"3"} />
            </CivPickerSection>
            {/* <CivPickerSection title="Race">
                    <button>1</button>
                    <button>2</button>
                    <button>3</button>
                    <button>4</button>
                    <button>5</button>
                    <button>6</button>
            </CivPickerSection>
            <CivPickerSection title="Affinity">
                    <button>1</button>
                    <button>2</button>
                    <button>3</button>
                    <button>4</button>
                    <button>5</button>
                    <button>6</button>
            </CivPickerSection> */}

        </div>

        </>
    )
}

