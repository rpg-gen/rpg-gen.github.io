import { useContext } from "react"
import { getFirestore, doc, getDoc, collection, query, where, getDocs, setDoc, deleteDoc, onSnapshot, DocumentData } from "firebase/firestore";

import UserContext from "../contexts/user_context.tsx";
import useFirebaseProject from "./use_firebase_project.jsx";
import feature_flags from "../configs/feature_flags.tsx"
import Matrix from "../classes/Matrix.tsx";

export default function useFirebaseMap() {
    const FIRESTORE_DATABASE = getFirestore(useFirebaseProject())
    const MAP_COLLECTION_NAME = "maps"
    const MAP_DOCUMENT_KEY = "tarron_test"

    // const current_user_context = useContext(UserContext)

    async function get_map_doc() {
        let data: DocumentData | undefined
        // if (feature_flags.is_persist_to_firebase && current_user_context.is_logged_in) {
        //     const doc_ref = doc(FIRESTORE_DATABASE, MAP_COLLECTION_NAME, MAP_DOCUMENT_KEY);
        //     const doc_snap = await getDoc(doc_ref);
        //     data = doc_snap.data()

        // }

        return data
    }

    function save_hexagon_definitions(matrix: Matrix) {
        const doc_ref = doc(FIRESTORE_DATABASE, MAP_COLLECTION_NAME, MAP_DOCUMENT_KEY)
        const new_firebase_map_doc: DocumentData = {}

        matrix.hexagons.forEach((hexagon) => {
            const firebase_hex_key = hexagon.get_firebase_hex_key()
            const firebase_hex_data = hexagon.get_firebase_hex_data()
            new_firebase_map_doc[firebase_hex_key] = firebase_hex_data
        })

        setDoc(doc_ref, {...new_firebase_map_doc}, {merge: true})
    }

    function create_listener(listen_action: Function) {
        const unsub = onSnapshot(doc(FIRESTORE_DATABASE, MAP_COLLECTION_NAME, MAP_DOCUMENT_KEY), (doc) => {
            listen_action(doc.data())
        });
        return unsub
    }

    return {
        get_map_doc,
        save_hexagon_definitions,
        create_listener,
    }
}