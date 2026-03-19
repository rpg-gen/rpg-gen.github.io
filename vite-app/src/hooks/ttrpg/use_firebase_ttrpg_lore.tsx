import { getFirestore, collection, doc, getDocs, setDoc, deleteDoc, addDoc, query, where } from "firebase/firestore"
import useFirebaseProject from "../use_firebase_project"
import TtrpgLoreEntry from "../../types/ttrpg/TtrpgLoreEntry"

export default function useFirebaseTtrpgLore() {
    const FIRESTORE_DATABASE = getFirestore(useFirebaseProject())
    const COLLECTION_NAME = "ttrpg_lore"

    async function getLoreByCampaign(campaignId: string): Promise<TtrpgLoreEntry[]> {
        const q = query(
            collection(FIRESTORE_DATABASE, COLLECTION_NAME),
            where("campaign_id", "==", campaignId)
        )
        const snapshot = await getDocs(q)
        const entries: TtrpgLoreEntry[] = []
        snapshot.forEach((doc) => {
            entries.push({
                id: doc.id,
                ...doc.data()
            } as TtrpgLoreEntry)
        })
        return entries.reverse()
    }

    async function createLoreEntry(entry: Omit<TtrpgLoreEntry, 'id'>): Promise<string> {
        const docRef = await addDoc(collection(FIRESTORE_DATABASE, COLLECTION_NAME), entry)
        return docRef.id
    }

    async function updateLoreEntry(id: string, entry: Partial<TtrpgLoreEntry>): Promise<void> {
        const docRef = doc(FIRESTORE_DATABASE, COLLECTION_NAME, id)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: _id, ...entryData } = entry as TtrpgLoreEntry
        await setDoc(docRef, entryData, { merge: true })
    }

    async function deleteLoreEntry(id: string): Promise<void> {
        const docRef = doc(FIRESTORE_DATABASE, COLLECTION_NAME, id)
        await deleteDoc(docRef)
    }

    return {
        getLoreByCampaign,
        createLoreEntry,
        updateLoreEntry,
        deleteLoreEntry
    }
}
