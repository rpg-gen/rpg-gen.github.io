import { getFirestore, collection, doc, getDocs, getDoc, setDoc, deleteDoc, addDoc } from "firebase/firestore"
import useFirebaseProject from "../use_firebase_project"
import DelveCardDeck from "../../types/delve_cards/DelveCardDeck"

export default function useFirebaseDelveCardDecks() {
    const FIRESTORE_DATABASE = getFirestore(useFirebaseProject())
    const COLLECTION_NAME = "delve_card_decks"

    async function getAllDecks(): Promise<DelveCardDeck[]> {
        const snapshot = await getDocs(collection(FIRESTORE_DATABASE, COLLECTION_NAME))
        const decks: DelveCardDeck[] = []
        snapshot.forEach((doc) => {
            decks.push({
                id: doc.id,
                ...doc.data()
            } as DelveCardDeck)
        })
        return decks.sort((a, b) => a.name.localeCompare(b.name))
    }

    async function getDeck(id: string): Promise<DelveCardDeck | null> {
        const docRef = doc(FIRESTORE_DATABASE, COLLECTION_NAME, id)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
            return {
                id: docSnap.id,
                ...docSnap.data()
            } as DelveCardDeck
        }
        return null
    }

    async function createDeck(deck: Omit<DelveCardDeck, 'id'>): Promise<string> {
        const docRef = await addDoc(collection(FIRESTORE_DATABASE, COLLECTION_NAME), deck)
        return docRef.id
    }

    async function updateDeck(id: string, deck: Partial<DelveCardDeck>): Promise<void> {
        const docRef = doc(FIRESTORE_DATABASE, COLLECTION_NAME, id)
        const { id: _, ...deckData } = deck as DelveCardDeck
        await setDoc(docRef, deckData, { merge: true })
    }

    async function deleteDeck(id: string): Promise<void> {
        const docRef = doc(FIRESTORE_DATABASE, COLLECTION_NAME, id)
        await deleteDoc(docRef)
    }

    return {
        getAllDecks,
        getDeck,
        createDeck,
        updateDeck,
        deleteDeck
    }
}

