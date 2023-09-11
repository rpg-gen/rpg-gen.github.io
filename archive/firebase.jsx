/*
    Set up the firebase app and auth
*/

import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc, collection, query, where, getDocs, setDoc, deleteDoc, onSnapshot } from "firebase/firestore";

const firebase_config = {
    apiKey: "AIzaSyB7KcGLNztLk0KmjJ7CCyIQmwvchLaRbCw",
    authDomain: "rpg-gen.firebaseapp.com",
    projectId: "rpg-gen",
    storageBucket: "rpg-gen.appspot.com",
    messagingSenderId: "167071727845",
    appId: "1:167071727845:web:59a5ff82df16db1c0b940c"
};

const firebase_app = initializeApp(firebase_config);
const firebase_auth = getAuth(firebase_app);
const firebase_db = getFirestore(firebase_app);

async function get_attribute(attribute_key) {
    const doc_ref = doc(firebase_db, "attribute", attribute_key);
    const doc_snap = await getDoc(doc_ref);
    if (doc_snap.exists()) {
        const data = doc_snap.data();

    }
    else {
    }
}

async function get_attributes_by_tag(tag_name) {
    // const the_query = query(collection(firebase_db, "attribute"), where("name", "==", "greed"));
    const the_query = query(collection(firebase_db, "attribute"), where("tags", "array-contains-any", [tag_name]));
    const query_snapshot = await getDocs(the_query);
    query_snapshot.forEach((doc) => {
    });
}

async function clear_collection (collection_name, append_indent_banner) {
    const query_snapshot = await getDocs(collection(firebase_db, collection_name));

    if (query_snapshot.docs.length == 0) {
        append_indent_banner("No existing items to delete.");
        return;
    }

    query_snapshot.forEach((doc_snapshot) => {
        append_indent_banner("Deleting item with key\"" + doc_snapshot.id + "\"...");
        deleteDoc(doc(firebase_db, collection_name, doc_snapshot.id));
    });
}

async function get_is_collection_exists(collection_name) {
    const the_collection = collection(firebase_db, collection_name);
    const query_snapshot = await getDocs(the_collection);
    return query_snapshot.docs.length > 0 ? true : false;

}

const HelperFirebase = {
    get_document: async (collection_name, doc_key) => {
        const doc_ref = doc(firebase_db, collection_name, doc_key);
        const doc_snapshot = await getDoc(doc_ref);
        return {...doc_snapshot.data(), id: doc_snapshot.id};
    },
    get_all_documents: async (collection_name) => {
        const the_query = query(collection(firebase_db, collection_name));
        const query_snapshot = await getDocs(the_query);

        const return_object_list = [];

        query_snapshot.forEach((doc) => (return_object_list.push({...doc.data(), id: doc.id})));

        return return_object_list;
    },
    create_document: async (collection_name, document_name, new_document_data, is_merge=true) => {
        const doc_ref = doc(firebase_db, collection_name, document_name);
        await setDoc(doc_ref, new_document_data, {merge: is_merge});
        return true;
    },
    do_docs_exist: async (collection_name,attribute_name,attribute_value) => {
        const the_query = query(collection(firebase_db, collection_name), where(attribute_name, "==", attribute_value));
        const query_snapshot = await getDocs(the_query);

        if (query_snapshot.docs.length > 0) {
            return true;
        }
        else {
            return false;
        }
    }
}

export default HelperFirebase;

export {
    firebase_app,
    firebase_auth,
    firebase_db,
    create_new_firebase_user,
    delete_firebase_user,
    login_firebase_user,
    logout_firebase_user,
    get_attribute,
    get_attributes_by_tag,
    clear_collection,
    get_is_collection_exists,
};