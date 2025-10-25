import { getFirestore, collection, doc, getDocs, getDoc, setDoc, deleteDoc, addDoc } from "firebase/firestore"
import useFirebaseProject from "../use_firebase_project"
import DelveCardTag from "../../types/delve_cards/DelveCardTag"

export default function useFirebaseDelveCardTags() {
    const FIRESTORE_DATABASE = getFirestore(useFirebaseProject())
    const COLLECTION_NAME = "delve_card_tags"

    async function getAllTags(): Promise<DelveCardTag[]> {
        const snapshot = await getDocs(collection(FIRESTORE_DATABASE, COLLECTION_NAME))
        const tags: DelveCardTag[] = []
        snapshot.forEach((doc) => {
            tags.push({
                id: doc.id,
                ...doc.data()
            } as DelveCardTag)
        })
        return tags.sort((a, b) => a.name.localeCompare(b.name))
    }

    async function getTag(id: string): Promise<DelveCardTag | null> {
        const docRef = doc(FIRESTORE_DATABASE, COLLECTION_NAME, id)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
            return {
                id: docSnap.id,
                ...docSnap.data()
            } as DelveCardTag
        }
        return null
    }

    async function createTag(tag: Omit<DelveCardTag, 'id'>): Promise<string> {
        const docRef = await addDoc(collection(FIRESTORE_DATABASE, COLLECTION_NAME), tag)
        return docRef.id
    }

    async function updateTag(id: string, tag: Partial<DelveCardTag>): Promise<void> {
        const docRef = doc(FIRESTORE_DATABASE, COLLECTION_NAME, id)
        const { id: _, ...tagData } = tag as DelveCardTag
        await setDoc(docRef, tagData, { merge: true })
    }

    async function deleteTag(id: string): Promise<void> {
        const docRef = doc(FIRESTORE_DATABASE, COLLECTION_NAME, id)
        await deleteDoc(docRef)
    }

    return {
        getAllTags,
        getTag,
        createTag,
        updateTag,
        deleteTag
    }
}

