import spacing from "../configs/spacing"
import { useState } from "react"
import colors from "../configs/colors"
import type_fabric_hook from '../types/type_fabric_hook'
import { CSSProperties } from "react"

export default function CivPicker(props: {
    set_is_show_civ_picker: Function,
    fabric_hook: type_fabric_hook
}) {

    const [previous_size, previous_race, previous_affinity] = props.fabric_hook.get_civ_info()

    const [selected_size, set_selected_size] = useState(previous_size)
    const [selected_race, set_selected_race] = useState(previous_race)
    const [selected_affinity, set_selected_affinity] = useState(previous_affinity)

    // console.log(selected_size)
    // console.log(selected_race)
    // console.log(selected_affinity)

    function CivPickerSection(props: {title?: string, children: JSX.Element[] | JSX.Element}) {
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
                    <p style={{paddingRight: "5px", color: colors.white, margin: 0}}>{props.title}{props.title ? ":" : "" }</p>
                    {props.children}
                </div>
            </div>
        )
    }

    function CivPickerButton(props: {value: string, set_state_value: Function, state_value: string}) {
        let button_style: CSSProperties = {}

        if (props.state_value == props.value) {
            button_style = {
                ...button_style,
                backgroundColor: colors.red,
                fontWeight: "bold",
                color: colors.white
            }
        }

        return (
            <button style={button_style} onClick={() => {props.set_state_value(props.value)}}>{props.value}</button>
        )
    }

    function handle_submit() {
        props.fabric_hook.add_civ_info(selected_size, selected_race, selected_affinity)
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
                    <CivPickerButton value={"1"} set_state_value={set_selected_size} state_value={selected_size} />
                    <CivPickerButton value={"2"} set_state_value={set_selected_size} state_value={selected_size} />
                    <CivPickerButton value={"3"} set_state_value={set_selected_size} state_value={selected_size} />
            </CivPickerSection>
            <CivPickerSection title="Race">
                    <CivPickerButton value={"1"} set_state_value={set_selected_race} state_value={selected_race} />
                    <CivPickerButton value={"2"} set_state_value={set_selected_race} state_value={selected_race} />
                    <CivPickerButton value={"3"} set_state_value={set_selected_race} state_value={selected_race} />
                    <CivPickerButton value={"4"} set_state_value={set_selected_race} state_value={selected_race} />
                    <CivPickerButton value={"5"} set_state_value={set_selected_race} state_value={selected_race} />
                    <CivPickerButton value={"6"} set_state_value={set_selected_race} state_value={selected_race} />
            </CivPickerSection>
            <CivPickerSection title="Affinity">
                    <CivPickerButton value={"1"} set_state_value={set_selected_affinity} state_value={selected_affinity} />
                    <CivPickerButton value={"2"} set_state_value={set_selected_affinity} state_value={selected_affinity} />
                    <CivPickerButton value={"3"} set_state_value={set_selected_affinity} state_value={selected_affinity} />
                    <CivPickerButton value={"4"} set_state_value={set_selected_affinity} state_value={selected_affinity} />
                    <CivPickerButton value={"5"} set_state_value={set_selected_affinity} state_value={selected_affinity} />
                    <CivPickerButton value={"6"} set_state_value={set_selected_affinity} state_value={selected_affinity} />
            </CivPickerSection>
            <CivPickerSection>
                <button onClick={handle_submit}>Save</button>
                <button onClick={handle_submit}>Cancel</button>
            </CivPickerSection>

        </div>

        </>
    )
}

