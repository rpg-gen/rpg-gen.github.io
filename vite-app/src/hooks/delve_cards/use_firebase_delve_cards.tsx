import { getFirestore, collection, doc, getDocs, getDoc, setDoc, deleteDoc, addDoc } from "firebase/firestore"
import useFirebaseProject from "../use_firebase_project"
import DelveCard from "../../types/delve_cards/DelveCard"

export default function useFirebaseDelveCards() {
    const FIRESTORE_DATABASE = getFirestore(useFirebaseProject())
    const COLLECTION_NAME = "delve_cards"

    async function getAllCards(): Promise<DelveCard[]> {
        const snapshot = await getDocs(collection(FIRESTORE_DATABASE, COLLECTION_NAME))
        const cards: DelveCard[] = []
        snapshot.forEach((doc) => {
            cards.push({
                id: doc.id,
                ...doc.data()
            } as DelveCard)
        })
        return cards
    }

    async function getCard(id: string): Promise<DelveCard | null> {
        const docRef = doc(FIRESTORE_DATABASE, COLLECTION_NAME, id)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
            return {
                id: docSnap.id,
                ...docSnap.data()
            } as DelveCard
        }
        return null
    }

    async function createCard(card: Omit<DelveCard, 'id'>): Promise<string> {
        const docRef = await addDoc(collection(FIRESTORE_DATABASE, COLLECTION_NAME), card)
        return docRef.id
    }

    async function updateCard(id: string, card: Partial<DelveCard>): Promise<void> {
        const docRef = doc(FIRESTORE_DATABASE, COLLECTION_NAME, id)
        const { id: _, ...cardData } = card as DelveCard
        await setDoc(docRef, cardData, { merge: true })
    }

    async function deleteCard(id: string): Promise<void> {
        const docRef = doc(FIRESTORE_DATABASE, COLLECTION_NAME, id)
        await deleteDoc(docRef)
    }

    return {
        getAllCards,
        getCard,
        createCard,
        updateCard,
        deleteCard
    }
}

