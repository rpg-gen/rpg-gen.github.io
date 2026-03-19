import { getFirestore, collection, doc, getDocs, setDoc, deleteDoc, addDoc, query, where, serverTimestamp } from "firebase/firestore"
import useFirebaseProject from "../use_firebase_project"
import TtrpgSessionNote from "../../types/ttrpg/TtrpgSessionNote"

export default function useFirebaseTtrpgSessionNotes() {
    const FIRESTORE_DATABASE = getFirestore(useFirebaseProject())
    const COLLECTION_NAME = "ttrpg_session_notes"

    function parseNote(doc: { id: string; data: () => Record<string, unknown> }): TtrpgSessionNote {
        const data = doc.data()
        return {
            id: doc.id,
            campaign_id: data.campaign_id as string,
            session_id: data.session_id as string,
            text: data.text as string,
            author: data.author as string,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            created_at: (data.created_at as any)?.toDate?.().toISOString() || "",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            updated_at: (data.updated_at as any)?.toDate?.().toISOString() || ""
        }
    }

    async function getNotesBySession(sessionId: string): Promise<TtrpgSessionNote[]> {
        const q = query(
            collection(FIRESTORE_DATABASE, COLLECTION_NAME),
            where("session_id", "==", sessionId)
        )
        const snapshot = await getDocs(q)
        const notes: TtrpgSessionNote[] = []
        snapshot.forEach((doc) => {
            notes.push(parseNote(doc))
        })
        return notes.sort((a, b) => a.created_at.localeCompare(b.created_at))
    }

    async function getNotesByCampaign(campaignId: string): Promise<TtrpgSessionNote[]> {
        const q = query(
            collection(FIRESTORE_DATABASE, COLLECTION_NAME),
            where("campaign_id", "==", campaignId)
        )
        const snapshot = await getDocs(q)
        const notes: TtrpgSessionNote[] = []
        snapshot.forEach((doc) => {
            notes.push(parseNote(doc))
        })
        return notes.sort((a, b) => a.created_at.localeCompare(b.created_at))
    }

    async function createNote(note: { campaign_id: string; session_id: string; text: string; author: string }): Promise<string> {
        const docRef = await addDoc(collection(FIRESTORE_DATABASE, COLLECTION_NAME), {
            ...note,
            created_at: serverTimestamp(),
            updated_at: serverTimestamp()
        })
        return docRef.id
    }

    async function updateNote(id: string, note: Partial<TtrpgSessionNote>): Promise<void> {
        const docRef = doc(FIRESTORE_DATABASE, COLLECTION_NAME, id)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: _id, created_at: _ca, ...noteData } = note as TtrpgSessionNote
        await setDoc(docRef, { ...noteData, updated_at: serverTimestamp() }, { merge: true })
    }

    async function deleteNote(id: string): Promise<void> {
        const docRef = doc(FIRESTORE_DATABASE, COLLECTION_NAME, id)
        await deleteDoc(docRef)
    }

    return {
        getNotesBySession,
        getNotesByCampaign,
        createNote,
        updateNote,
        deleteNote
    }
}
