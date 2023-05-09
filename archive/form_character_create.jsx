import FormCharacterCreate from "../forms/form_character_create.jsx";
import { Link } from "react-router-dom"


export default function CharacterCreate() {
    return (
        <>
            <div><Link to="/characters">Back</Link></div>
            <FormCharacterCreate />
        </>
    )
}