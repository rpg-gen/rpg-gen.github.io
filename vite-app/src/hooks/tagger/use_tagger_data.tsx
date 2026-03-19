import { useState, useEffect, useRef } from "react"
import { getFirestore, doc, getDoc, setDoc, deleteDoc, DocumentData, getCountFromServer, collection } from "firebase/firestore"
import useFirebaseProject from "../use_firebase_project"
import { get_words_array, get_first_word_from_list, get_tags_from_file } from "../../utility/tagger_word_utils"
import {
    COLLECTION_BOOKMARK,
    COLLECTION_KEEP,
    COLLECTION_DISCARDED,
    COLLECTION_TRACKING,
    BOOKMARK_DOC_NAME,
    BOOKMARK_DOC_FIELD_KEY
} from "../../configs/tagger_constants"


export default function useTaggerData() {

    // State
    const [is_waiting_on_firebase, set_is_waiting_on_firebase] = useState(true)
    const [loaded_word, set_loaded_word] = useState<string>()
    const [saved_word_count, set_saved_word_count] = useState<number>()
    const [, set_has_bookmark] = useState<boolean>(false)
    const [selected_tags, set_selected_tags] = useState<string[]>([])
    const [is_word_torched, set_is_word_torched] = useState<boolean>(false)
    const first_word_of_today = useRef<string>()

    // Constants
    const FIRESTORE_DATABASE = getFirestore(useFirebaseProject())

    // Firebase CRUD Operations

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
            // First check the keep collection
            const keep_doc_ref = doc(FIRESTORE_DATABASE, COLLECTION_KEEP, word)
            const keep_doc_snap = await getDoc(keep_doc_ref)
            const keep_data = keep_doc_snap.data()

            if (keep_data && keep_data.tags && Array.isArray(keep_data.tags)) {
                set_selected_tags(keep_data.tags)
                return
            }

            // If not found in keep collection, check the discarded collection
            const discarded_doc_ref = doc(FIRESTORE_DATABASE, COLLECTION_DISCARDED, word)
            const discarded_doc_snap = await getDoc(discarded_doc_ref)
            const discarded_data = discarded_doc_snap.data()

            if (discarded_data && discarded_data.tags && Array.isArray(discarded_data.tags)) {
                set_selected_tags(discarded_data.tags)
                return
            }

            // No tags found in Firebase, try to get them from the file
            const file_tags = get_tags_from_file(word)
            if (file_tags && file_tags.length > 0) {
                set_selected_tags(file_tags)
                // Auto-save the tags to Firebase (only if word is not torched)
                if (!discarded_data) {
                    const new_doc_data: DocumentData = {
                        word_key: word,
                        tags: file_tags
                    }
                    await setDoc(keep_doc_ref, new_doc_data)
                }
            } else {
                set_selected_tags([])
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

    async function restore_word() {
        if (loaded_word) {
            // Get the tags from the discarded collection before deleting it
            const discarded_doc_ref = doc(FIRESTORE_DATABASE, COLLECTION_DISCARDED, loaded_word)
            const discarded_doc_snap = await getDoc(discarded_doc_ref)
            const discarded_data = discarded_doc_snap.data()
            const tags_to_restore = discarded_data && discarded_data.tags && Array.isArray(discarded_data.tags)
                ? discarded_data.tags
                : selected_tags

            // Remove from discarded collection
            await deleteDoc(discarded_doc_ref)

            // Add back to words collection with tags
            const doc_ref = doc(FIRESTORE_DATABASE, COLLECTION_KEEP, loaded_word)
            const new_doc_data: DocumentData = {
                word_key: loaded_word,
                tags: tags_to_restore
            }
            await setDoc(doc_ref, new_doc_data)

            // Update state
            set_is_word_torched(false)
            set_selected_tags(tags_to_restore)
            load_saved_word_count()
        }
    }

    async function discard_word() {
        if (loaded_word) {
            // Remove from words collection
            const doc_ref = doc(FIRESTORE_DATABASE, COLLECTION_KEEP, loaded_word)
            await deleteDoc(doc_ref)

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

    // Word Navigation

    function get_index_of_word(word_to_search_for: string) {
        const words_array = get_words_array()
        return words_array.findIndex((word) => word === word_to_search_for)
    }

    // Anytime we update the loaded word, we also want to update our bookmark
    function update_loaded_word(new_word: string) {
        set_loaded_word(new_word)
        update_bookmark(new_word)
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

    // Progress Tracking

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
                return get_index_of_word(loaded_word) - get_index_of_word(first_word_of_today.current)
            }
        }
        else {
            return 0
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

    // Effects

    useEffect(function () {
        Promise.all([load_initial_word(), load_saved_word_count()]).then(() => {
            set_is_waiting_on_firebase(false)
        })
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])

    // Load tags and check torched status whenever the loaded word changes
    useEffect(() => {
        if (loaded_word) {
            Promise.all([
                load_tags_for_word(loaded_word),
                check_if_word_is_torched(loaded_word)
            ]).then(([, isTorched]) => {
                set_is_word_torched(isTorched)
            })
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loaded_word])

    // Computed values
    const words_done_today = get_words_done_today()
    const total_words_done = get_total_words_done()
    const total_words_in_file = get_total_words_in_file()
    const total_words_remaining = total_words_in_file - total_words_done

    return {
        is_waiting_on_firebase,
        loaded_word,
        saved_word_count,
        selected_tags,
        is_word_torched,
        words_done_today,
        total_words_done,
        total_words_in_file,
        total_words_remaining,
        keep_word,
        discard_word,
        restore_word,
        load_previous_word,
        load_next_word,
        get_previous_word,
        get_next_word,
        update_loaded_word,
        update_bookmark,
        toggle_tag
    }
}
