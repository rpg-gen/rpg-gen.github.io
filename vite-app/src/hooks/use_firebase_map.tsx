import { getFirestore, doc, getDoc, collection, query, where, getDocs, setDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import useFirebaseProject from "./use_firebase_project.jsx";
import type_hexagon_definition from "../types/type_hexagon_definition.js"

export default function useFirebaseMap() {
    const FIRESTORE_DATABASE = getFirestore(useFirebaseProject())
    const MAP_COLLECTION_NAME = "maps"
    const MAP_DOCUMENT_KEY = "tarron_test"
    const PAD_LENGTH = 3
    const PAD_STRING = "0"

    async function get_map_document() {
        const doc_ref = doc(FIRESTORE_DATABASE, MAP_COLLECTION_NAME, MAP_DOCUMENT_KEY);
        const doc_snap = await getDoc(doc_ref);
        const data = doc_snap.data()
        return data
    }

    // function get_hexagon_definition(row_number: number, column_number: number) {

    // }

    function save_hexagon_definition(hexagon_definition: type_hexagon_definition) {
        const doc_ref = doc(FIRESTORE_DATABASE, MAP_COLLECTION_NAME, MAP_DOCUMENT_KEY)
        const row_string = hexagon_definition.row_number.toString().padStart(PAD_LENGTH, PAD_STRING)
        const column_string = hexagon_definition.column_number.toString().padStart(PAD_LENGTH, PAD_STRING)
        const field_key = row_string + "_" + column_string
        const encoded_hexagon_definition = get_encoded_hexagon_definition(hexagon_definition)
        setDoc(doc_ref, {[field_key]: encoded_hexagon_definition}, {merge: true})
    }

    function get_encoded_hexagon_definition(decoded_hexagon_definition: type_hexagon_definition) {
        return decoded_hexagon_definition.background_color_hexidecimal + "_"
            + (decoded_hexagon_definition.is_top_left_river ? 1 : 0) + "_"
            + (decoded_hexagon_definition.is_top_right_river ? 1 : 0) + "_"
            + (decoded_hexagon_definition.is_right_river ? 1 : 0) + "_"
            + (decoded_hexagon_definition.is_bottom_right_river ? 1 : 0) + "_"
            + (decoded_hexagon_definition.is_bottom_left_river ? 1 : 0) + "_"
            + (decoded_hexagon_definition.is_left_river ? 1 : 0) + "_"
            + (decoded_hexagon_definition.is_top_left_road ? 1 : 0) + "_"
            + (decoded_hexagon_definition.is_top_right_road ? 1 : 0) + "_"
            + (decoded_hexagon_definition.is_right_road ? 1 : 0) + "_"
            + (decoded_hexagon_definition.is_bottom_right_road ? 1 : 0) + "_"
            + (decoded_hexagon_definition.is_bottom_left_road ? 1 : 0) + "_"
            + (decoded_hexagon_definition.is_left_road ? 1 : 0) + "_"
            + decoded_hexagon_definition.town_size + "_"
            + decoded_hexagon_definition.affinity + "_"
            + decoded_hexagon_definition.race + "_"
            + decoded_hexagon_definition.icon_name
    }

    // function get_decoded_hexagon_definition(encoded_hexagon_definition: string) {

    // }

    return {
        get_map_document,
        save_hexagon_definition,
        // get_encoded_hexagon_definition,
        // get_decoded_hexagon_definition
    }
}