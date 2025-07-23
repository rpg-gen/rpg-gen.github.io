// Library Imports
import useFirebaseProject from "../hooks/use_firebase_project"
import { getFirestore, doc, getDoc, setDoc, DocumentData, getCountFromServer, collection, getDocs } from "firebase/firestore"
import { useState, useEffect, MouseEventHandler, ReactNode, CSSProperties, useRef } from "react"

// rpg-gen imports
import { mobile } from "../configs/constants"
import { useNavigate } from "react-router-dom"
import words_url from "../assets/accepted_words_shuffled.txt?raw"
import loading_gif from "../assets/loading.gif"
import useWindowSize from "../hooks/useWindowSize"
import defaults from "../configs/defaults"
import flame_icon from "../assets/flame.svg"

// Not used for now since we added the definitions to the file
// const DICTIONARY_API_ENDPOINT = "https://api.dictionaryapi.dev/api/v2/entries/en/"
const COLLECTION_BOOKMARK = "bookmarks"
const COLLECTION_KEEP = "words"
const COLLECTION_DISCARDED = "words_discarded"
const COLLECTION_TRACKING = "tracking"
const BOOKMARK_DOC_NAME = "latest_word"
const BOOKMARK_DOC_FIELD_KEY = "value"

// Tag categories from the word_categories.txt file
const NOUN_CATEGORIES = [
    "plant",
    "item",
    "creature",
    "weapon",
    "place",
    "title",
    "job",
    "role",
    "event"
]

const DESCRIPTOR_TAGS = [
    "non-pg",
    "evil",
    "good",
    "prefix",
    "suffix",
    "verb",
    "mannerism"
]

const WORD_TAGS = [...NOUN_CATEGORIES, ...DESCRIPTOR_TAGS]

export default function Tagger() {

    // Hooks
    const window_size = useWindowSize()

    // State
    const [is_waiting_on_firebase, set_is_waiting_on_firebase] = useState(true)
    const [loaded_word, set_loaded_word] = useState<string>()
    const [saved_word_count, set_saved_word_count] = useState<number>()
    const [has_bookmark, set_has_bookmark] = useState<Boolean>(false)
    const [word_animation_state, set_word_animation_state] = useState<'normal' | 'falling'>('normal')
    const [selected_tags, set_selected_tags] = useState<string[]>([])
    const [is_word_torched, set_is_word_torched] = useState<boolean>(false)
    //const [first_word_of_today, set_first_word_of_today] = useState()
    const first_word_of_today = useRef<string>()

    // Constants
    const FIRESTORE_DATABASE = getFirestore(useFirebaseProject())
    const is_mobile = window_size[0] < mobile.break_point;
    const words_done_today = get_words_done_today()
    const total_words_done = get_total_words_done()
    const total_words_in_file = get_total_words_in_file()
    const total_words_remaining = total_words_in_file - total_words_done

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

    function get_total_words_done() {
        if (!loaded_word) {
           return 0
        }
        else {
            const index = get_index_of_word(loaded_word)
            return index
        }
    }

    function get_total_words_in_file() {
        return get_words_array().length
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
        const words_array = get_words_array()
        return words_array.findIndex((word) => word === word_to_search_for)
    }

    // Anytime we update the loaded word, we also want to update our bookmark
    function update_loaded_word(new_word: string) {
        set_loaded_word(new_word)
        update_bookmark(new_word)
    }

    async function load_saved_word_count() {
        const collection_ref = collection(FIRESTORE_DATABASE, COLLECTION_KEEP);
        const snapshot = await getCountFromServer(collection_ref)
        const count = snapshot.data().count
        set_saved_word_count(count)
    }

    async function check_if_word_is_torched(word: string): Promise<boolean> {
        if (!word) return false
        
        try {
            const doc_ref = doc(FIRESTORE_DATABASE, COLLECTION_DISCARDED, word)
            const doc_snap = await getDoc(doc_ref)
            return doc_snap.exists()
        } catch (error) {
            console.error("Error checking if word is torched:", error)
            return false
        }
    }

    async function load_tags_for_word(word: string) {
        if (!word) {
            set_selected_tags([])
            return
        }
        
        try {
            const doc_ref = doc(FIRESTORE_DATABASE, COLLECTION_KEEP, word)
            const doc_snap = await getDoc(doc_ref)
            const data = doc_snap.data()
            
            if (data && data.tags && Array.isArray(data.tags)) {
                set_selected_tags(data.tags)
            } else {
                // No tags found in Firebase, try to get them from the file
                const file_tags = get_tags_from_file(word)
                if (file_tags && file_tags.length > 0) {
                    set_selected_tags(file_tags)
                    // Auto-save the tags to Firebase
                    const new_doc_data: DocumentData = {
                        word_key: word,
                        tags: file_tags
                    }
                    await setDoc(doc_ref, new_doc_data)
                } else {
                    set_selected_tags([])
                }
            }
        } catch (error) {
            console.error("Error loading tags:", error)
            set_selected_tags([])
        }
    }

    async function toggle_tag(tag: string) {
        if (!loaded_word) return
        
        const new_tags = selected_tags.includes(tag)
            ? selected_tags.filter(t => t !== tag)
            : [...selected_tags, tag]
        
        set_selected_tags(new_tags)
        
        // Save to Firestore immediately
        try {
            const doc_ref = doc(FIRESTORE_DATABASE, COLLECTION_KEEP, loaded_word)
            const new_doc_data: DocumentData = {
                word_key: loaded_word,
                tags: new_tags
            }
            await setDoc(doc_ref, new_doc_data)
        } catch (error) {
            console.error("Error saving tags:", error)
        }
    }

    async function download_saved_words() {
        try {
            // Get all documents from the words collection
            const collection_ref = collection(FIRESTORE_DATABASE, COLLECTION_KEEP);
            const querySnapshot = await getDocs(collection_ref);
            
            // Extract word keys from documents
            const words: string[] = [];
            querySnapshot.forEach((doc: any) => {
                const data = doc.data();
                if (data.word_key) {
                    words.push(data.word_key);
                }
            });
            
            // Sort words alphabetically
            words.sort();
            
            // Create text content
            const textContent = words.join('\n');
            
            // Create and download file
            const blob = new Blob([textContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `saved_words_${new Date().toISOString().split('T')[0]}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
        } catch (error) {
            console.error("Error downloading words:", error);
        }
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

    function get_next_word() {
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

        return next_word
    }

    function get_previous_word() {
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

        return previous_word
    }

    function load_next_word() {
        const next_word = get_next_word()
        update_loaded_word(next_word)
        update_bookmark(next_word)
    }

    function load_previous_word() {
        const previous_word = get_previous_word()
        update_loaded_word(previous_word)
        update_bookmark(previous_word)
    }

    async function restore_word() {
        if (loaded_word) {
            // Remove from discarded collection
            const discarded_doc_ref = doc(FIRESTORE_DATABASE, COLLECTION_DISCARDED, loaded_word)
            await setDoc(discarded_doc_ref, {})
            
            // Add back to words collection with tags
            const doc_ref = doc(FIRESTORE_DATABASE, COLLECTION_KEEP, loaded_word)
            const new_doc_data: DocumentData = {
                word_key: loaded_word,
                tags: selected_tags
            }
            await setDoc(doc_ref, new_doc_data)
            
            // Update state
            set_is_word_torched(false)
            load_saved_word_count()
        }
    }

    async function discard_word() {
        if (loaded_word) {
            // Remove from words collection
            const doc_ref = doc(FIRESTORE_DATABASE, COLLECTION_KEEP, loaded_word)
            await setDoc(doc_ref, {})
            
            // Add to words_discarded collection with tags
            const discarded_doc_ref = doc(FIRESTORE_DATABASE, COLLECTION_DISCARDED, loaded_word)
            const discarded_doc_data: DocumentData = {
                word_key: loaded_word,
                tags: selected_tags
            }
            await setDoc(discarded_doc_ref, discarded_doc_data)
            
            // Reload the saved word count
            load_saved_word_count()
        }
    }

    function keep_word() {
        if (loaded_word) {
            const doc_ref = doc(FIRESTORE_DATABASE, COLLECTION_KEEP, loaded_word)
            const new_doc_data: DocumentData = {
                word_key: loaded_word,
                tags: selected_tags
            }
            setDoc(doc_ref, new_doc_data).then(() => load_saved_word_count())
            load_next_word()
        }
    }

    // Effects
    useEffect(function () {
        Promise.all([load_initial_word(), load_saved_word_count()]).then(() => {
            set_is_waiting_on_firebase(false)
        })
    },[])

    // Load tags and check torched status whenever the loaded word changes
    useEffect(() => {
        if (loaded_word) {
            Promise.all([
                load_tags_for_word(loaded_word),
                check_if_word_is_torched(loaded_word)
            ]).then(([_, isTorched]) => {
                set_is_word_torched(isTorched)
            })
        }
    }, [loaded_word])

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
                        restore_word={restore_word}
                        load_previous_word={load_previous_word}
                        load_next_word={load_next_word}
                        get_previous_word={get_previous_word}
                        get_next_word={get_next_word}
                        update_loaded_word={update_loaded_word}
                        update_bookmark={update_bookmark}
                        is_mobile={is_mobile}
                        animation_state={word_animation_state}
                        selected_tags={selected_tags}
                        toggle_tag={toggle_tag}
                        word_tags={WORD_TAGS}
                        is_word_torched={is_word_torched}
                    />
                    <p style={{padding: "1rem", color: "white", backgroundColor: (words_done_today >= defaults.daily_word_goal ? "green" : "red")}}>
                        {"Goal: " + words_done_today + " / " + defaults.daily_word_goal}
                    </p>
                    <div style={{padding: "1rem", backgroundColor: "#f0f0f0", borderRadius: "0.25rem", marginTop: "1rem"}}>
                        <h3 style={{margin: "0 0 0.5rem 0"}}>Progress Summary</h3>
                        <p style={{margin: "0.25rem 0"}}>Total Words Saved: {saved_word_count || 0}</p>
                        <p style={{margin: "0.25rem 0"}}>Total Words Processed: {total_words_done} ({(total_words_done / total_words_in_file * 100).toFixed(1)}%)</p>
                        <p style={{margin: "0.25rem 0"}}>Total Words in File: {total_words_in_file}</p>
                        <p style={{margin: "0.25rem 0"}}>Total Words Remaining: {total_words_remaining}</p>
                    </div>
                    <div style={{marginTop: "1rem"}}>
                    {/* <button onClick={download_saved_words}>Download Saved Words</button> */}
                    </div>
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
    height?: number,
    disabled?: boolean
}) {

    function handle_click() {
        if (!props.disabled) {
            props.on_click_action()
        }
    }

    const button_style = {
        marginRight: ".25rem",
        borderRadius: ".25rem",
        borderWidth: "1px",
        backgroundColor: props.background_color || 'buttonface',
        color: props.font_color || 'black',
        padding: "1rem",
        minWidth: "8rem",
        opacity: props.disabled ? 0.5 : 1,
        cursor: props.disabled ? 'not-allowed' : 'pointer'
    }

    return <button style={button_style} onClick={handle_click} disabled={props.disabled}>{props.children}</button>
}

function TagButton(props: {
    tag: string,
    isSelected: boolean,
    onClick: () => void,
    disabled?: boolean
}) {
    const button_style: CSSProperties = {
        padding: "0.5rem",
        borderRadius: "0.25rem",
        border: "1px solid #ccc",
        backgroundColor: props.isSelected ? "#007bff" : "#f8f9fa",
        color: props.isSelected ? "white" : "#333",
        cursor: props.disabled ? "not-allowed" : "pointer",
        fontSize: "0.875rem",
        fontWeight: props.isSelected ? "bold" : "normal",
        transition: "all 0.2s ease",
        textAlign: "center" as const,
        minHeight: "2.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: props.disabled ? 0.5 : 1
    }

    return (
        <button style={button_style} onClick={props.onClick} disabled={props.disabled}>
            {props.tag}
        </button>
    )
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
    restore_word: Function,
    load_previous_word: Function,
    load_next_word: Function,
    get_previous_word: Function,
    get_next_word: Function,
    update_loaded_word: Function,
    update_bookmark: Function,
    is_mobile: boolean,
    animation_state: 'normal' | 'falling',
    selected_tags: string[],
    toggle_tag: Function,
    word_tags: string[],
    is_word_torched: boolean
}) {

    // State
    const [loaded_definition, set_loaded_definition] = useState<string>("")
    const [is_flame_visible, set_is_flame_visible] = useState(false)
    const [flame_opacity, set_flame_opacity] = useState(0)
    const [flame_scale, set_flame_scale] = useState(0.1)
    const [word_opacity, set_word_opacity] = useState(1)
    const [word_y_offset, set_word_y_offset] = useState(0)
    const [word_x_offset, set_word_x_offset] = useState(0)
    const [is_animating, set_is_animating] = useState(false)
    const [slide_direction, set_slide_direction] = useState<'left' | 'right' | 'none'>('none')
    const [old_word, set_old_word] = useState<string>("")
    const [new_word, set_new_word] = useState<string>("")
    const [old_word_x, set_old_word_x] = useState(0)
    const [old_word_opacity, set_old_word_opacity] = useState(1)
    const [new_word_x, set_new_word_x] = useState(0)
    const [new_word_opacity, set_new_word_opacity] = useState(0)
    const [showing_both_words, set_showing_both_words] = useState(false)
    const [is_torch_animation, set_is_torch_animation] = useState(false)


    function load_definition() {
        if (props.loaded_word) {
            const definition = get_definition_for_word(props.loaded_word)
            if (definition) {
                set_loaded_definition(definition)
            } else {
                set_loaded_definition("No definition found in file")
            }
        }
    }

    // Load definition whenever the word changes
    useEffect(() => {
        load_definition()
        // Reset animation state when word changes
        set_is_flame_visible(false)
        set_flame_opacity(0)
        set_flame_scale(0.1)
        set_word_opacity(1)
        set_word_y_offset(0)
        set_word_x_offset(0)
        set_is_animating(false)
        set_slide_direction('none')
        set_showing_both_words(false)
        set_old_word("")
        set_new_word("")
        set_old_word_x(0)
        set_old_word_opacity(1)
        set_new_word_x(0)
        set_new_word_opacity(0)
    }, [props.loaded_word])

    // Handlers

    async function handle_prev_click() {
        if (is_animating) return
        
        set_is_animating(true)
        set_slide_direction('right')
        
        // Store current word and get new word
        const currentWord = props.loaded_word || ""
        const previousWord = props.get_previous_word()
        
        set_old_word(currentWord)
        set_new_word(previousWord)
        set_showing_both_words(true)
        
        // Position old word at center, new word off-screen to the left
        set_old_word_x(0)
        set_old_word_opacity(1)
        set_new_word_x(-300)
        set_new_word_opacity(0)
        
        // Animate both words simultaneously
        for (let i = 0; i <= 15; i++) {
            // Old word slides out to the right
            set_old_word_x(i * 20)
            set_old_word_opacity(1 - (i * 0.07))
            
            // New word slides in from the left
            set_new_word_x(-300 + (i * 20))
            set_new_word_opacity(i * 0.07)
            
            await new Promise(resolve => setTimeout(resolve, 15))
        }
        
        // Update state with new word
        props.update_loaded_word(previousWord)
        props.update_bookmark(previousWord)
        
        // Reset animation state
        set_showing_both_words(false)
        set_is_animating(false)
        set_slide_direction('none')
    }

    async function handle_next_click() {
        if (is_animating) return
        
        set_is_animating(true)
        set_slide_direction('left')
        
        // Store current word and get new word
        const currentWord = props.loaded_word || ""
        const nextWord = props.get_next_word()
        
        set_old_word(currentWord)
        set_new_word(nextWord)
        set_showing_both_words(true)
        
        // Position old word at center, new word off-screen to the right
        set_old_word_x(0)
        set_old_word_opacity(1)
        set_new_word_x(300)
        set_new_word_opacity(0)
        
        // Animate both words simultaneously
        for (let i = 0; i <= 15; i++) {
            // Old word slides out to the left
            set_old_word_x(-i * 20)
            set_old_word_opacity(1 - (i * 0.07))
            
            // New word slides in from the right
            set_new_word_x(300 - (i * 20))
            set_new_word_opacity(i * 0.07)
            
            await new Promise(resolve => setTimeout(resolve, 15))
        }
        
        // Update state with new word
        props.update_loaded_word(nextWord)
        props.update_bookmark(nextWord)
        
        // Reset animation state
        set_showing_both_words(false)
        set_is_animating(false)
        set_slide_direction('none')
    }

    function handle_click_keep() {
        props.keep_word()
    }

    async function handle_click_discard() {
        if (is_animating) return // Prevent multiple clicks during animation
        
        set_is_animating(true)
        set_is_torch_animation(true)
        
        // Start flame animation
        set_is_flame_visible(true)
        
        // Animate flame growing and fading in
        const flameAnimation = async () => {
            // Calculate timing values from base timing
            const base_timing = defaults.torch_animation_base_timing
            const fast_timing = base_timing
            const medium_timing = base_timing * 2
            const slow_timing = base_timing * 4
            
            // Phase 1: Grow flame and fade in, word starts disappearing earlier
            for (let i = 0; i <= 20; i++) {
                set_flame_scale(0.1 + (i * 0.045)) // 0.1 to 1.0
                set_flame_opacity(i * 0.05) // 0 to 1
                // Start fading word earlier - at 1/4 through flame growth
                if (i >= 5) {
                    set_word_opacity(1 - ((i - 5) * 2.0)) // 1 to 0 over just 1 step (instant fade)
                }
                await new Promise(resolve => setTimeout(resolve, fast_timing))
            }
            
            // Phase 2: Continue growing flame while word continues fading, then start fading flame
            for (let i = 0; i <= 10; i++) {
                set_flame_scale(1.0 + (i * 0.1)) // 1.0 to 2.0 (keep growing)
                // Word should be fully faded by now, but ensure it stays at 0
                set_word_opacity(0)
                // Start fading flame halfway through this phase
                if (i >= 5) {
                    set_flame_opacity(1 - ((i - 5) * 0.2)) // 1 to 0 over last 5 steps
                }
                await new Promise(resolve => setTimeout(resolve, medium_timing))
            }
            
            // Phase 3: Complete flame fade out and start sliding animation
            for (let i = 0; i <= 10; i++) {
                set_flame_opacity(0 - (i * 0.1)) // 0 to -1 (ensure it's fully gone)
                
                // Start sliding animation halfway through flame fade
                if (i === 5) {
                    // Actually discard the word to Firebase
                    await props.discard_word()
                    
                    // Store current word and get new word
                    const currentWord = props.loaded_word || ""
                    const nextWord = props.get_next_word()
                    
                    set_old_word(currentWord)
                    set_new_word(nextWord)
                    set_showing_both_words(true)
                    
                    // Position old word at center (but keep it faded out), new word off-screen to the right
                    set_old_word_x(0)
                    set_old_word_opacity(0) // Keep old word faded out
                    set_new_word_x(300)
                    set_new_word_opacity(0)
                    
                    // Animate new word sliding in from the right (old word already faded out with flame)
                    for (let j = 0; j <= 15; j++) {
                        // Old word stays in place and already faded out (opacity stays at 0)
                        set_old_word_x(0)
                        set_old_word_opacity(0)
                        
                        // New word slides in from the right
                        set_new_word_x(300 - (j * 20))
                        set_new_word_opacity(j * 0.07)
                        
                        await new Promise(resolve => setTimeout(resolve, 15))
                    }
                    
                    // Update state with new word
                    props.update_loaded_word(nextWord)
                    props.update_bookmark(nextWord)
                    
                    // Reset animation state
                    set_showing_both_words(false)
                }
                
                await new Promise(resolve => setTimeout(resolve, fast_timing))
            }
            
            // Hide flame
            set_is_flame_visible(false)
            set_is_animating(false)
            set_is_torch_animation(false)
        }
        
        flameAnimation()
    }

    // Styles

    const button_row_style: CSSProperties = {}

    if (props.is_mobile) {
        button_row_style.display = "flex"
        button_row_style.justifyContent = "space-between"
    }

    const word_container_style: CSSProperties = {
        position: 'relative',
        height: '4rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        overflow: 'hidden'
    }

    const word_style: CSSProperties = {
        fontSize: "2rem",
        opacity: word_opacity,
        transform: `translateY(${word_y_offset}px) translateX(${word_x_offset}px)`,
        transition: is_animating ? 'none' : 'opacity 0.2s ease, transform 0.5s ease',
        animation: props.animation_state === 'falling' ? 'fallIn 0.5s ease-out' : 'none'
    }

    const flame_style: CSSProperties = {
        position: 'absolute',
        top: '50%',
        left: '0%',
        transform: `translateY(-50%) scale(${flame_scale})`,
        opacity: flame_opacity,
        zIndex: 10,
        pointerEvents: 'none'
    }

    const left_flame_style: CSSProperties = {
        position: 'absolute',
        top: '50%',
        left: '0%',
        transform: `translateY(-50%) scale(${flame_scale}) translateX(-40px)`,
        opacity: flame_opacity,
        zIndex: 10,
        pointerEvents: 'none'
    }

    const right_flame_style: CSSProperties = {
        position: 'absolute',
        top: '50%',
        left: '0%',
        transform: `translateY(-50%) scale(${flame_scale}) translateX(40px)`,
        opacity: flame_opacity,
        zIndex: 10,
        pointerEvents: 'none'
    }

    return (
        <div>
            <style>
                {`
                    @keyframes fallIn {
                        0% {
                            transform: translateY(-50px);
                            opacity: 0;
                        }
                        100% {
                            transform: translateY(0);
                            opacity: 1;
                        }
                    }
                `}
            </style>
            <div style={word_container_style}>
                {showing_both_words ? (
                    <>
                        <p style={{
                            fontSize: "2rem",
                            transform: `translateY(${word_y_offset}px) translateX(${old_word_x}px)`,
                            opacity: is_torch_animation ? 0 : old_word_opacity, // Always fade out in torch animation
                            transition: 'none',
                            position: 'absolute',
                            left: 0
                        }}>{old_word}</p>
                        <p style={{
                            fontSize: "2rem",
                            transform: `translateY(${word_y_offset}px) translateX(${new_word_x}px)`,
                            opacity: new_word_opacity,
                            transition: 'none',
                            position: 'absolute',
                            left: 0
                        }}>{new_word}</p>
                    </>
                ) : (
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                        <p style={{
                            ...word_style,
                            opacity: props.is_word_torched ? 0.5 : 1,
                            color: props.is_word_torched ? '#666' : 'inherit'
                        }}>{props.loaded_word}</p>
                        {props.is_word_torched && (
                            <img 
                                src={flame_icon} 
                                alt="Torched" 
                                style={{
                                    width: '20px',
                                    height: '20px',
                                    opacity: 0.7
                                }}
                            />
                        )}
                    </div>
                )}
                {is_flame_visible && (
                    <>
                        <img 
                            src={flame_icon} 
                            alt="Flame" 
                            style={left_flame_style}
                            width="100"
                            height="100"
                        />
                        <img 
                            src={flame_icon} 
                            alt="Flame" 
                            style={flame_style}
                            width="100"
                            height="100"
                        />
                        <img 
                            src={flame_icon} 
                            alt="Flame" 
                            style={right_flame_style}
                            width="100"
                            height="100"
                        />
                    </>
                )}
            </div>
            <div style={button_row_style}>
                <Button on_click_action={handle_prev_click} background_color="blue" font_color="white" disabled={is_animating}>Prev</Button>
                <Button on_click_action={handle_next_click} background_color="green" font_color="white" disabled={is_animating}>Next</Button>
                {props.is_word_torched ? (
                    <Button on_click_action={props.restore_word} background_color="orange" font_color="white" disabled={is_animating}>Restore</Button>
                ) : (
                    <Button on_click_action={handle_click_discard} background_color="red" font_color="white" disabled={is_animating}>Torch</Button>
                )}
            </div>
            
            {/* Tag Buttons Grid */}
            <div style={{marginTop: "1rem"}}>
                <h4 style={{margin: "0 0 0.5rem 0"}}>Noun Categories</h4>
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))",
                    gap: "0.5rem",
                    maxWidth: "100%",
                    marginBottom: "1rem"
                }}>
                    {NOUN_CATEGORIES.map((tag) => (
                        <TagButton
                            key={tag}
                            tag={tag}
                            isSelected={props.selected_tags.includes(tag)}
                            onClick={() => props.toggle_tag(tag)}
                            disabled={is_animating || props.is_word_torched}
                        />
                    ))}
                </div>
                
                <h4 style={{margin: "0 0 0.5rem 0"}}>Descriptors:</h4>
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))",
                    gap: "0.5rem",
                    maxWidth: "100%"
                }}>
                    {DESCRIPTOR_TAGS.map((tag) => (
                        <TagButton
                            key={tag}
                            tag={tag}
                            isSelected={props.selected_tags.includes(tag)}
                            onClick={() => props.toggle_tag(tag)}
                            disabled={is_animating || props.is_word_torched}
                        />
                    ))}
                </div>
            </div>
            
            <div style={{minHeight: "4rem", marginTop: "16px"}}>
                {loaded_definition && <p>{loaded_definition}</p>}
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
    const lines = words_url.split("\n")
        .map((line: string) => line.trim())
        .filter((line: string) => line.length > 0)
    const words = lines.map((line: string) => line.split("|")[0]) // Extract just the word part before the pipe
    return words
}

function get_definition_for_word(word_to_search_for: string) {
    const lines = words_url.split("\n")
        .map((line: string) => line.trim())
        .filter((line: string) => line.length > 0)
    
    for (const line of lines) {
        const [word, definition] = line.split("|")
        if (word === word_to_search_for && definition) {
            return definition
        }
    }
    return null
}

function get_tags_from_file(word_to_search_for: string): string[] {
    const lines = words_url.split("\n")
        .map((line: string) => line.trim())
        .filter((line: string) => line.length > 0)
    
    for (const line of lines) {
        const parts = line.split("|")
        if (parts.length >= 3) {
            const word = parts[0]
            const tagsString = parts[2]
            
            if (word === word_to_search_for && tagsString) {
                try {
                    // Parse the JSON array of tags
                    const tags = JSON.parse(tagsString)
                    if (Array.isArray(tags)) {
                        return tags
                    }
                } catch (error) {
                    console.error("Error parsing tags for word:", word_to_search_for, error)
                }
            }
        }
    }
    return []
}