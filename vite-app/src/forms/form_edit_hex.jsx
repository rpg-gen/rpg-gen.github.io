import DataContext from "../contexts/data_context"
import GlobalContext from "../contexts/global_context"
import { useState, useContext } from "react"
import configs from "../utility/configs"

export default function FormEditHex({hex_key, hex_column, hex_row, hex_data}) {

    const data_context = useContext(DataContext)
    const [hex_color, set_hex_color] = useState(hex_data)
    const global_context = useContext(GlobalContext)

    function handle_color_change(event) {
        set_hex_color(event.target.value)
    }

    let is_show_form = false

    if (data_context?.loaded_map_name != undefined) {
        is_show_form = true
    }

    function on_submit(event) {
        event.preventDefault()
        const current_map_name = data_context.loaded_map_name
        const current_map_data = data_context.maps[current_map_name]
        data_context.save_document_data(configs.maps_collection_name, data_context.loaded_map_name, {
            ...current_map_data,
            [hex_key]: hex_color
        })
        global_context.update_global_context({
            is_show_rightbar: false
        })
    }

    return (
        <>
            <h2>Hex Column {hex_column}, Row {hex_row}</h2>
            {
                is_show_form
                ?
                    <>
                    <form onSubmit={on_submit}>

                    <div><input checked={hex_color == "lime"} onChange={handle_color_change} type="radio" name="hex_color" id="hex_color_light_green" value="lime" /><label htmlFor="hex_color_light_green">Plains / prairie / meadow / fields</label></div>
                    <div><input checked={hex_color == "grey"} onChange={handle_color_change} type="radio" name="hex_color" id="hex_color_grey" value="grey" /><label htmlFor="hex_color_grey">Mountain / peaks/ crags/ cliffs</label></div>
                    <div><input checked={hex_color == "brown"} onChange={handle_color_change} type="radio" name="hex_color" id="hex_color_brown" value="brown" /><label htmlFor="hex_color_brown">Hills / foothills / slopes</label></div>
                    <div><input checked={hex_color == "olive"} onChange={handle_color_change} type="radio" name="hex_color" id="hex_color_beige" value="olive" /><label htmlFor="hex_color_beige">Desert / barren / wasteland / dunes / tundra</label></div>
                    <div><input checked={hex_color == "green"} onChange={handle_color_change} type="radio" name="hex_color" id="hex_color_green" value="green" /><label htmlFor="hex_color_green">Jungle / rainforest / forest / grove</label></div>
                    <div><input checked={hex_color == "purple"} onChange={handle_color_change} type="radio" name="hex_color" id="hex_color_purple" value="purple" /><label htmlFor="hex_color_purple">Bogs / marsh / wetlands / swamp</label></div>
                    <div><input checked={hex_color == "aliceblue"} onChange={handle_color_change} type="radio" name="hex_color" id="hex_color_unset" value="aliceblue" /><label htmlFor="hex_color_unset">Unset</label></div>
                    <div><input checked={hex_color == "blue"} onChange={handle_color_change} type="radio" name="hex_color" id="hex_color_blue" value="blue" /><label htmlFor="hex_color_unset">Ocean</label></div>
                    <div><input type="submit"></input></div>

                    </form>

                    </>
                :
                    <p>Log in and load a map to edit maps</p>
            }
        </>
    )
}