// Library Imports
import useFirebaseProject from "../hooks/use_firebase_project"
import { getFirestore, doc, getDoc, setDoc, DocumentData } from "firebase/firestore"
import { useState, useEffect, MouseEventHandler, ReactNode, CSSProperties, useRef } from "react"

// rpg-gen imports
import { mobile } from "../configs/constants"
import { useNavigate } from "react-router-dom"
import words_url from "../assets/words_alpha_shuffled.txt?raw"
import loading_gif from "../assets/loading.gif"
import useWindowSize from "../hooks/useWindowSize"
import defaults from "../configs/defaults"

const DICTIONARY_API_ENDPOINT = "https://api.dictionaryapi.dev/api/v2/entries/en/"
const COLLECTION_BOOKMARK = "bookmarks"
const COLLECTION_KEEP = "words"
const COLLECTION_TRACKING = "tracking"
const BOOKMARK_DOC_NAME = "latest_word"
const BOOKMARK_DOC_FIELD_KEY = "value"

export default function Tagger() {

    // Hooks
    const window_size = useWindowSize()

    // State
    const [is_waiting_on_firebase, set_is_waiting_on_firebase] = useState(true)
    const [loaded_word, set_loaded_word] = useState<string>()
    const [has_bookmark, set_has_bookmark] = useState<Boolean>(false)
    //const [first_word_of_today, set_first_word_of_today] = useState()
    const first_word_of_today = useRef<string>()

    // Constants
    const FIRESTORE_DATABASE = getFirestore(useFirebaseProject())
    const is_mobile = window_size[0] < mobile.break_point;
    const words_done_today = get_words_done_today()

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

        // Update the first word seen this day if it isn't already there
        if (!first_word_of_today.current && return_value) {
            const fetched_word = await get_days_first_word()
            if (!fetched_word) {
                set_days_first_word(return_value)
                first_word_of_today.current = return_value
            }
            else {
                first_word_of_today.current = fetched_word
            }
        }

        return return_value
    }

    async function update_bookmark(new_bookmark: string | undefined) {
        const doc_ref = doc(FIRESTORE_DATABASE, COLLECTION_BOOKMARK, BOOKMARK_DOC_NAME)
        const new_doc_data: DocumentData = {}
        new_doc_data[BOOKMARK_DOC_FIELD_KEY] = new_bookmark
        setDoc(doc_ref, new_doc_data)
    }

    function get_date_key() {
        return (new Date()).toISOString().substring(0, 10)
    }

    async function set_days_first_word(new_word: string) {
        const doc_ref = doc(FIRESTORE_DATABASE, COLLECTION_TRACKING, get_date_key())
        const new_doc_data: DocumentData = {first_word_of_this_day: new_word}
        setDoc(doc_ref, new_doc_data)
    }

    async function get_days_first_word() {
        const doc_ref = doc(FIRESTORE_DATABASE, COLLECTION_TRACKING, get_date_key())
        const doc_snap = await getDoc(doc_ref)
        const data = doc_snap.data()
        
        if (data) {
            first_word_of_today.current = (data.first_word_of_this_day)
            return data.first_word_of_this_day
        }
        else {
            return undefined
        }
    }

    function get_words_done_today() {
        if (loaded_word) {
            if (!first_word_of_today.current) {
                return 0
            }
            else {
                let starting_index = undefined
                return get_index_of_word(loaded_word) - get_index_of_word(first_word_of_today.current)
            }
        }
        else {
            return 0
        }
    }

    function get_index_of_word(word_to_search_for: string) {
        let return_index = -1
        const words_array = get_words_array()
        words_array.forEach((word, index) => {
            if (word == word_to_search_for) {
                return_index = index
            }
        })
        return return_index
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
            next_word = words_array[get_index_of_word(loaded_word) + 1]
        }

        if (!next_word) {
            next_word = get_first_word_from_list()
        }

        update_loaded_word(next_word)
        update_bookmark(next_word)
    }

    function load_previous_word() {
        const words_array = get_words_array()
        let previous_word = undefined

        if (!loaded_word) {
            previous_word = get_first_word_from_list()
        }
        else {
            previous_word = words_array[get_index_of_word(loaded_word) - 1]
        }

        if (!previous_word) {
            previous_word = get_first_word_from_list()
        }

        update_loaded_word(previous_word)
        update_bookmark(previous_word)
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

    return (
        <div style={{padding: "1rem"}}>
            {
                is_waiting_on_firebase
                ? <LoadingDiv />
                : (<>
                    <LoadedWord
                        loaded_word={loaded_word}
                        keep_word={keep_word}
                        discard_word={discard_word} 
                        load_previous_word={load_previous_word}
                        is_mobile={is_mobile}
                    /> 
                    <p style={{padding: "1rem", color: "white", backgroundColor: (words_done_today >= defaults.daily_word_goal ? "green" : "red")}}>{"Goal: " + words_done_today + " / " + defaults.daily_word_goal}</p>
                    <Menu />
                    </>
                )
            }
        </div>
    )
}

function Button(props: {
    on_click_action: Function, 
    children: ReactNode,
    background_color?: string,
    font_color?: string,
    height?: number
}) {
    
    function handle_click() {
        props.on_click_action()
    }
    
    const button_style = {
        marginRight: ".25rem",
        borderRadius: ".25rem",
        borderWidth: "1px",
        backgroundColor: props.background_color || 'buttonface',
        color: props.font_color || 'black',
        padding: "1rem",
        minWidth: "8rem"
    }

    return <button style={button_style} onClick={handle_click}>{props.children}</button>
}

function Menu() {
    const navigate = useNavigate()

    function handle_click() {
        navigate("/")
    }

    return (
        <div style={{marginTop: ".25rem"}}>
            <Button on_click_action={handle_click}>Main Menu</Button>
        </div>
    )
}

function LoadedWord(props: {
    loaded_word: string | undefined,
    keep_word: Function,
    discard_word: Function,
    load_previous_word: Function,
    is_mobile: boolean
}) {

    // State
    const [loaded_definition, set_loaded_definition] = useState<string[]>([])
    const [is_loading_definition, set_is_loading_definition] = useState(false)
    
    async function load_definition() {
        const new_definition_array: string[] = []

        try {
            const response = await fetch(DICTIONARY_API_ENDPOINT + props.loaded_word)

            if (response.ok) {
                const response_json = await response.json()
                
                if (response_json[0] && response_json[0].meanings) {
                    response_json[0].meanings.forEach((meaning: any) => {
                        meaning.definitions.forEach((definition: any) => {
                            new_definition_array.push(definition.definition)
                        })
                    })
                }
            }
            else if (response.status == 404) {
                new_definition_array.push("No definition found")
            }
            else {
                throw new Error("Network response was not OK or 404")
            }
        }
        catch (error: any) {
            new_definition_array.push("Error loading defintion from API: " + error.message)
        }
        
        set_loaded_definition(new_definition_array)
        set_is_loading_definition(false)
    }
    
    // Handlers

    function handle_load_previous_word_click() {
        set_loaded_definition([])
        props.load_previous_word()
    }

    function handle_click_keep() {
        set_loaded_definition([])
        props.keep_word()
    }

    function handle_click_discard() {
        set_loaded_definition([])
        props.discard_word()
    }

    function handle_click_define() {
        set_is_loading_definition(true)
        load_definition()
    }
    
    // Styles

    const button_row_style: CSSProperties = {}

    if (props.is_mobile) {
        button_row_style.display = "flex"
        button_row_style.justifyContent = "space-between"
    }

    return (
        <div>
            <p style={{fontSize: "2rem"}}>{props.loaded_word}</p>
            <div style={button_row_style}>
                <Button on_click_action={handle_click_keep} background_color="green" font_color="white">Keep</Button>
                <Button on_click_action={handle_click_discard} background_color="red" font_color="white">Discard</Button>
            </div>
            <div style={{marginTop: "1rem"}}>
                <Button on_click_action={handle_load_previous_word_click}>Previous</Button>
                <Button on_click_action={handle_click_define}>Define</Button>
            </div>
            <div style={{minHeight: "4rem", marginTop: "16px"}}>
                {
                    is_loading_definition
                    ? <LoadingDiv />
                    : loaded_definition.map((definition, index) => (<p key={index}>{definition}</p>))
                }
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