import { getFirestore, doc, getDoc, collection, query, where, getDocs, setDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import useFirebaseProject from "./use_firebase_project.jsx";
import type_hexagon_definition from "../types/type_hexagon_definition.js"
import feature_flags from "../configs/feature_flags.tsx"
import hexagon_math from "../utility/hexagon_math.tsx"
import { useContext } from "react"

export default function useFirebaseMap() {
    const FIRESTORE_DATABASE = getFirestore(useFirebaseProject())
    const MAP_COLLECTION_NAME = "maps"
    const MAP_DOCUMENT_KEY = "tarron_test"

    async function get_map_document() {
        const doc_ref = doc(FIRESTORE_DATABASE, MAP_COLLECTION_NAME, MAP_DOCUMENT_KEY);
        const doc_snap = await getDoc(doc_ref);
        const data = doc_snap.data()
        return data
    }

    function save_hexagon_definition(hexagon_definition: type_hexagon_definition) {
            const doc_ref = doc(FIRESTORE_DATABASE, MAP_COLLECTION_NAME, MAP_DOCUMENT_KEY)
            const field_key = hexagon_math.get_hexagon_definition_key(hexagon_definition.row_number, hexagon_definition.column_number)
            const encoded_hexagon_definition = hexagon_math.get_encoded_hexagon_definition(hexagon_definition)
            setDoc(doc_ref, {[field_key]: encoded_hexagon_definition}, {merge: true})
    }

    function create_listener(listen_action: Function) {
        const unsub = onSnapshot(doc(FIRESTORE_DATABASE, MAP_COLLECTION_NAME, MAP_DOCUMENT_KEY), (doc) => {
            listen_action(doc.data())
        });
        return unsub
    }

    return {
        get_map_document,
        save_hexagon_definition,
        create_listener,
    }
}