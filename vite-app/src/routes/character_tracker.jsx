import { useState, useContext } from "react";
import { create_document } from "../utility/firebase.jsx";
import GlobalContext from "../contexts/global_context.jsx";
import { LoginForm } from "./account_info.jsx";

export default function CharacterTracker() {

    const global_context = useContext(GlobalContext);

    return (
    <>
        {/* <div></div> */}
        {global_context.user != null ? <FormCharacterCreate /> : <><p>Log in to view this page</p><LoginForm /></>}
    </>
    )
}

function FormCharacterCreate() {

    const [short_name, set_short_name] = useState("");
    const [rest_of_name, set_rest_of_name] = useState("");
    const [role, set_role] = useState("");

    function handle_character_create(event) {
        event.preventDefault();

        const character_key = short_name.toLowerCase().replaceAll(" ", "_") + "_" + rest_of_name.toLowerCase().replaceAll(" ", "_");

        const new_data = {
            short_name: short_name,
            rest_of_name: rest_of_name,
            role: role,
        }

        create_document("character", character_key, new_data);
    }

    return (<>
        <form>
            <h3>Create New Character</h3>
            <label htmlFor="short_name_id">First Name: </label><input id="short_name_id" name="short_name" onChange={(event) => set_short_name(event.target.value)} /><br />
            <label htmlFor="rest_of_name_id">Last Name: </label><input id="rest_of_name_id" name="rest_of_name" onChange={(event) => set_rest_of_name(event.target.value)} /><br />
            <label htmlFor="role_id">Story Role: </label><input id="role_id" name="role" onChange={(event) => set_role(event.target.value)} /><br />
            <button type="submit" onClick={handle_character_create}>Create</button>
        </form>
    </>);
}