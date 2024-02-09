// import spacing from "../configs/spacing"
// import { useState, MutableRefObject } from "react"
// import colors from "../configs/colors"
// import { CSSProperties } from "react"
// import type_canvas_hook from "../types/type_canvas_hook"
// import type_hexagon_definition from "../types/type_hexagon_definition"
// import hexagon_math from "../utility/hexagon_math"
// import useFirebaseMap from "../hooks/use_firebase_map"

// export default function CivPicker(props: {
//     set_is_show_civ_picker: Function,
//     canvas: type_canvas_hook,
//     ref_hexagon_definitions: MutableRefObject<type_hexagon_definition[]>,
//     edge_length: number,
// }) {

//     const firebase_map_hook = useFirebaseMap()
//     const editing_hex_definition = props.canvas.ref_clicked_hex_def.current as type_hexagon_definition

//     const [selected_size, set_selected_size] = useState(editing_hex_definition.town_size.toString())
//     const [selected_race, set_selected_race] = useState(editing_hex_definition.race.toString())
//     const [selected_affinity, set_selected_affinity] = useState(editing_hex_definition.affinity.toString())

//     function CivPickerSection(props: {title?: string, children: JSX.Element[] | JSX.Element}) {
//         return (
//             <div style={{
//                 display: "flex",
//                 justifyContent: "center",
//                 margin: (spacing.top_bar_margin * 2) + "rem"
//             }}>
//                 <div style={{
//                     display: "flex",
//                     maxWidth: ((spacing.top_bar_height * 2.5 + spacing.top_bar_margin * 2) * 3) + "rem",
//                     flexWrap: "wrap",
//                 }}>
//                     <p style={{paddingRight: "5px", color: colors.white, margin: 0}}>{props.title}{props.title ? ":" : "" }</p>
//                     {props.children}
//                 </div>
//             </div>
//         )
//     }

//     function CivPickerButton(props: {value: string, set_state_value: Function, state_value: string}) {
//         let button_style: CSSProperties = {}

//         if (props.state_value == props.value) {
//             button_style = {
//                 ...button_style,
//                 backgroundColor: colors.red,
//                 fontWeight: "bold",
//                 color: colors.white
//             }
//         }

//         return (
//             <button style={button_style} onClick={() => {props.set_state_value(props.value)}}>{props.value}</button>
//         )
//     }

//     function handle_submit() {
//         editing_hex_definition.town_size = parseInt(selected_size)
//         editing_hex_definition.race = parseInt(selected_race)
//         editing_hex_definition.affinity = parseInt(selected_affinity)
//         hexagon_math.paint_hexagon(editing_hex_definition, props.canvas.get_canvas_context(), props.edge_length)
//         props.set_is_show_civ_picker(false)
//         firebase_map_hook.save_hexagon_definitions([editing_hex_definition])
//     }

//     return (
//         <>

//         <div style={{
//             position: "fixed",
//             top: 0,
//             bottom: 0,
//             left: 0,
//             right: 0,
//             backgroundColor: "rgba(0, 0, 0, .75)",
//             zIndex: 100,
//             display: "flex",
//             justifyContent: "center",
//             flexDirection: "column"
//         }}>

//             <CivPickerSection title="Town Size">
//                     <CivPickerButton value={"1"} set_state_value={set_selected_size} state_value={selected_size} />
//                     <CivPickerButton value={"2"} set_state_value={set_selected_size} state_value={selected_size} />
//                     <CivPickerButton value={"3"} set_state_value={set_selected_size} state_value={selected_size} />
//             </CivPickerSection>
//             <CivPickerSection title="Race">
//                     <CivPickerButton value={"1"} set_state_value={set_selected_race} state_value={selected_race} />
//                     <CivPickerButton value={"2"} set_state_value={set_selected_race} state_value={selected_race} />
//                     <CivPickerButton value={"3"} set_state_value={set_selected_race} state_value={selected_race} />
//                     <CivPickerButton value={"4"} set_state_value={set_selected_race} state_value={selected_race} />
//                     <CivPickerButton value={"5"} set_state_value={set_selected_race} state_value={selected_race} />
//                     <CivPickerButton value={"6"} set_state_value={set_selected_race} state_value={selected_race} />
//             </CivPickerSection>
//             <CivPickerSection title="Affinity">
//                     <CivPickerButton value={"1"} set_state_value={set_selected_affinity} state_value={selected_affinity} />
//                     <CivPickerButton value={"2"} set_state_value={set_selected_affinity} state_value={selected_affinity} />
//                     <CivPickerButton value={"3"} set_state_value={set_selected_affinity} state_value={selected_affinity} />
//                     <CivPickerButton value={"4"} set_state_value={set_selected_affinity} state_value={selected_affinity} />
//                     <CivPickerButton value={"5"} set_state_value={set_selected_affinity} state_value={selected_affinity} />
//                     <CivPickerButton value={"6"} set_state_value={set_selected_affinity} state_value={selected_affinity} />
//             </CivPickerSection>
//             <CivPickerSection>
//                 <button onClick={handle_submit}>Save</button>
//                 <button onClick={handle_submit}>Cancel</button>
//             </CivPickerSection>

//         </div>

//         </>
//     )
// }

