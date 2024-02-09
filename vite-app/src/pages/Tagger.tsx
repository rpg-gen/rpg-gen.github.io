// Library Imports
import useFirebaseProject from "../hooks/use_firebase_project"
import { getFirestore, doc, getDoc, setDoc, DocumentData } from "firebase/firestore"
import { useState, useEffect } from "react"

// rpg-gen imports
import { useNavigate } from "react-router-dom"
import words_url from "../assets/words_alpha.txt?raw"
import loading_gif from "../assets/loading.gif"

export default function Tagger() {

    // State
    const [is_waiting_on_firebase, set_is_waiting_on_firebase] = useState(true)
    const [loaded_word, set_loaded_word] = useState<string>()
    const [has_bookmark, set_has_bookmark] = useState<Boolean>(false)

    // Constants
    const FIRESTORE_DATABASE = getFirestore(useFirebaseProject())
    const COLLECTION_BOOKMARK = "bookmarks"
    const COLLECTION_KEEP = "words"
    const BOOKMARK_DOC_NAME = "latest_word"
    const BOOKMARK_DOC_FIELD_KEY = "value"

    async function get_bookmark() {
        let return_value = undefined
        const doc_ref = doc(FIRESTORE_DATABASE, COLLECTION_BOOKMARK, BOOKMARK_DOC_NAME)
        const doc_snap = await getDoc(doc_ref)
        const data = doc_snap.data()

        if (data && data[BOOKMARK_DOC_FIELD_KEY]) {
            return_value = data[BOOKMARK_DOC_FIELD_KEY]
            if (return_value == "") {return_value = undefined}
        }

        if (return_value) {
            set_has_bookmark(true)
        }
        else {
            set_has_bookmark(false)
        }

        return return_value
    }

    async function update_bookmark(new_bookmark: string | undefined) {
        const doc_ref = doc(FIRESTORE_DATABASE, COLLECTION_BOOKMARK, BOOKMARK_DOC_NAME)
        const new_doc_data: DocumentData = {}
        new_doc_data[BOOKMARK_DOC_FIELD_KEY] = new_bookmark
        setDoc(doc_ref, new_doc_data)
    }

    // Anytime we update the loaded word, we also want to update our bookmark
    function update_loaded_word(new_word: string) {
        set_loaded_word(new_word)
        update_bookmark(new_word)
    }

    async function load_initial_word() {
        const bookmark = await get_bookmark()

        if (bookmark) {
            update_loaded_word(bookmark)
        }
        else {
            update_loaded_word(get_first_word_from_list())
        }
    }

    function load_next_word() {
        const words_array = get_words_array()
        let next_word = undefined

        if (!loaded_word) {
            next_word = get_first_word_from_list()
        }
        else {
            words_array.forEach((word, index) => {
                if (word == loaded_word) {
                    next_word = words_array[index + 1]
                }
            })
        }

        if (!next_word) {
            next_word = get_first_word_from_list()
        }

        update_loaded_word(next_word)
        update_bookmark(next_word)
    }

    function discard_word() {
        load_next_word()
    }

    function keep_word() {
        if (loaded_word) {
            const doc_ref = doc(FIRESTORE_DATABASE, COLLECTION_KEEP, loaded_word)
            const new_doc_data: DocumentData = {word_key: loaded_word}
            setDoc(doc_ref, new_doc_data)
            load_next_word()
        }
    }

    // Effects
    useEffect(function () {
        load_initial_word().then(() => {
            set_is_waiting_on_firebase(false)
        })
    },[])


    // Handlers

    return (
        <div style={{padding: "1rem"}}>
            <Menu />
            {
                is_waiting_on_firebase
                ? <LoadingDiv />
                : <LoadedWord
                    loaded_word={loaded_word}
                    keep_word={keep_word}
                    discard_word={discard_word} /> }
            {/* {
                has_bookmark
                ? <ResetBookmark
                    is_waiting_on_firebase={is_waiting_on_firebase}
                    update_bookmark={update_bookmark}
                    set_loaded_word={set_loaded_word} />
                : ""
            } */}
        </div>
    )
}

function Menu() {
    const navigate = useNavigate()

    return (
        <div>
            <button onClick={() => {navigate("/")}}>Main Menu</button>
        </div>
    )
}

function LoadedWord(props: {
    loaded_word: string | undefined,
    keep_word: Function,
    discard_word: Function
}) {

    function handle_click_keep() {
        props.keep_word()
    }

    function handle_click_discard() {
        props.discard_word()
    }

    return (
        <div>
            <p>{props.loaded_word}</p>
            <div>
                <button onClick={handle_click_keep}>Keep</button>
                <button onClick={handle_click_discard} style={{marginLeft: ".25rem"}}>Discard</button>
            </div>
        </div>
    )
}

function LoadingDiv() {
    return <div style={{marginTop: "1rem"}}>
    <img height="20px" width="auto" src={loading_gif} />
    </div>
}

function ResetBookmark(props: {
    is_waiting_on_firebase: boolean,
    update_bookmark: Function,
    set_loaded_word: Function
}) {

    function handle_click_reset_bookmark() {
        props.update_bookmark(get_first_word_from_list())
        props.set_loaded_word(get_first_word_from_list())
    }

    return (
        <div style={{marginTop: "2rem"}}>
            <button disabled={props.is_waiting_on_firebase} onClick={handle_click_reset_bookmark}>Reset Bookmark to First Word</button>
        </div>
    )
}

// Independent Functions

function get_first_word_from_list() {
    return get_words_array()[0]
}

function get_words_array() {
    return words_url.split("\r\n")
}