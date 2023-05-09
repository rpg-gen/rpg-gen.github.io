import ButtonLink from "../components/button_link.jsx";
import { Link, Outlet } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import LoadingProtected from "../components/loading_protected.jsx";
import Colors from "../utility/colors.jsx";
import GlobalContext from "../contexts/global_context.jsx";
import DataContext from "../contexts/data_context.jsx";
// import FormCharacterEdit from "../forms/form_character_edit.jsx";
import CharacterDropdownDetails from "../components/character_dropdown_details.jsx"
import configs from "../utility/configs.jsx";

export default function CharacterList () {

    const data_context = useContext(DataContext);
    const global_context = useContext(GlobalContext);

    let character_iterable = []

    if (data_context[configs.character_collection_name] != undefined) {
        character_iterable = Object.entries(data_context.characters);
    }

    function handle_click_create_character(event) {
        global_context.update_global_context({
            rightbar_content: <>
                <h3>Create New Character</h3>
                <FormCharacterEdit />
            </>,
            is_show_rightbar: true
        });
    }

    return (
        <>
            <div>
                <div>
                    <button onClick={handle_click_create_character}>Create New Character</button>
                </div>
                <LoadingProtected is_loading={data_context.is_loading}>
                    <br />
                    <div>
                        <CharacterTable character_iterable={character_iterable} />
                    </div>
                </LoadingProtected>
            </div>
            {/* {children} */}
        </>
    )
}

function CharacterTable({character_iterable}) {

    const table_style = {
        width: "100%",
        // maxWidth: configs.details_width,
        borderCollapse: "collapse",
    }

    const header_style = {
        textAlign: "left"
    }

    const row_style = {
        borderStyle: "solid",
        borderWidth: "10px 0",
        borderColor: "white"
    }

    return (
        <table style={table_style}>
            <thead>
                <tr>
                    <th style={{textAlign: "left", width: "100%"}}>Name</th>
                    <th style={{textAlign: "center", width: "0%"}}>HP</th>
                    <th style={{textAlign: "center", width: "0%"}}>AP</th>
                </tr>
            </thead>
            <tbody>
                {
                    character_iterable.map((character_row, index) => {
                        const character_id = character_row[0];
                        const character_data = {...character_row[1], id: character_id};

                        return (<CharacterRow key={character_id} row_num={index + 1} character_data={character_data} />);
                    })
                }
            </tbody>
        </table>
    );
}

function CharacterRow({character_data, row_num}) {

    const data_context = useContext(DataContext);

    const [is_show_details, set_is_show_details] = useState(false);

    function toggle_details() {
        set_is_show_details((previous_state) => !previous_state);
    }

    const character_id = character_data.id;

    const row_color = character_data.flash_color != undefined && character_data.flash_color != "none"
        ? character_data.flash_color
        : ((row_num) % 2 == 1
            ? Colors.disabled_grey
            : Colors.white);

    const cell_style = {
        textAlign: "center"
    }

    const row_style = {
        // borderStyle: "solid",
        // borderWidth: "10px 0",
        // borderColor: "white",
        backgroundColor: row_color,
        transition: "background-color 0.5s ease",
    }

    // const padding_style = {
        // paddingLeft: ".5em",
        // paddingRight: ".5em",
    // }

    const row_padding_style = {
        paddingTop: ".25em",
        paddingBottom: ".25em",
    }

    return (
        <>
            <tr style={row_style} key={character_id}>
                <td className="hover-element" onClick={event=>toggle_details()} style={row_padding_style}><div style={{paddingLeft: ".5em"}}>{character_data.full_name}</div></td>
                <td style={row_padding_style}>
                    <div>
                        <div style={cell_style}><button onClick={(event) => data_context.increase_character_hp(character_id)}>+</button></div>
                        <div style={cell_style}>{character_data.current_hp}</div>
                        <div style={cell_style}><button onClick={(event) => data_context.decrease_character_hp(character_id)}>-</button></div>
                    </div>
                </td>
                <td style={row_padding_style}>
                    <div style={cell_style}><button onClick={(event) => data_context.increase_character_ap(character_id)}>+</button></div>
                    <div style={cell_style}>{character_data.current_ap}</div>
                    <div style={cell_style}><button onClick={(event) => data_context.decrease_character_ap(character_id)}>-</button></div>
                </td>
                <td style={row_padding_style}>
                    <div style={{paddingRight: ".5em"}}>
                        <button onClick={(event) => toggle_details()}>{is_show_details ? <span>&#9650;</span> : <span>&#9660;</span>}</button>
                    </div>
                </td>
            </tr>
            {
                is_show_details
                ?
                    <tr style={row_style} key={character_id + "_details"} >
                        <td colSpan="4" style={row_padding_style}>
                            <div style={{paddingLeft: ".5em", paddingRight: ".5em"}}>
                                {/* <FormCharacterEdit character_id={character_id} /> */}
                                <CharacterDropdownDetails character_id={character_id} />
                            </div>
                        </td>
                    </tr>
                : ""
            }
        </>
    );
}