import { Link, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import TextInput from "../components/text_input.jsx";
import SubmitButton from "../components/submit_button.jsx";
import HelperFirebase from "../utility/firebase.jsx";
import LoadingProtected from "../components/loading_protected.jsx";

export default function CharacterEdit () {

    const [is_loading,set_is_loading] = useState(true);
    // const [character_data,set_character_data] = useState({});
    const [short_name, set_short_name] = useState("");
    const [full_name, set_full_name] = useState("");
    const [story_role, set_story_role] = useState("");
    const { id } = useParams();

    async function load_character() {
        const character_data = await HelperFirebase.get_document("character",id);
        set_short_name(character_data.short_name);
        set_full_name(character_data.full_name);
        set_story_role(character_data.story_role);
        // set_character_data(character_data);
        set_is_loading(false);
    }

    const navigate = useNavigate();
    useEffect(() => {load_character()},[])

    async function save_character (event) {
        event.preventDefault();
        set_is_loading(true);

        const char_data = {
            story_role: story_role,
        }

        await HelperFirebase.create_document("character",id,char_data);

        navigate("/characters");
    }

    return (
        <>
            <div><Link to="/characters">Back</Link></div>
            <br />
            <form onSubmit={save_character}>
                <TextInput id="database_id" label="Database Id" read_only={true} value={id} />
                <LoadingProtected is_loading={is_loading}>
                    <TextInput id="short_name" label="Short Name" read_only={true} value={short_name} />
                    <TextInput id="full_name" label="Full Name" read_only={true} value={full_name} />
                    <TextInput id="story_role" label="Story Role" on_change= {set_story_role} value={story_role} />
                    <SubmitButton>Save</SubmitButton>
                </LoadingProtected>
            </form>
        </>
    )
}