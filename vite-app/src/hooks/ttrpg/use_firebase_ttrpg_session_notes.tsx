import { getFirestore, doc, getDoc, setDoc, updateDoc, deleteField } from "firebase/firestore"
import useFirebaseProject from "../use_firebase_project"
import TtrpgSessionNote from "../../types/ttrpg/TtrpgSessionNote"
import { TtrpgNoteData } from "../../types/ttrpg/TtrpgCampaign"

export default function useFirebaseTtrpgSessionNotes() {
    const FIRESTORE_DATABASE = getFirestore(useFirebaseProject())
    const COLLECTION_NAME = "ttrpg_campaigns"

    async function getNotesByCampaign(campaignId: string): Promise<TtrpgSessionNote[]> {
        const docRef = doc(FIRESTORE_DATABASE, COLLECTION_NAME, campaignId)
        const docSnap = await getDoc(docRef)
        if (!docSnap.exists()) return []

        const data = docSnap.data()
        const notesMap = (data.notes || {}) as Record<string, TtrpgNoteData>
        const notes: TtrpgSessionNote[] = Object.entries(notesMap).map(([id, n]) => ({
            id,
            campaign_id: campaignId,
            session_id: n.session_id,
            text: n.text,
            author: n.author,
            created_at: n.created_at || "",
            updated_at: n.updated_at || ""
        }))
        return notes.sort((a, b) => a.created_at.localeCompare(b.created_at))
    }

    async function createNote(campaignId: string, note: { session_id: string; text: string; author: string }): Promise<string> {
        const id = crypto.randomUUID()
        const docRef = doc(FIRESTORE_DATABASE, COLLECTION_NAME, campaignId)
        const now = new Date().toISOString()
        const noteData: TtrpgNoteData = {
            session_id: note.session_id,
            text: note.text,
            author: note.author,
            created_at: now,
            updated_at: now
        }
        await setDoc(docRef, { notes: { [id]: noteData } }, { merge: true })
        return id
    }

    async function updateNote(campaignId: string, id: string, note: Partial<TtrpgSessionNote>): Promise<void> {
        const docRef = doc(FIRESTORE_DATABASE, COLLECTION_NAME, campaignId)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updates: Record<string, any> = {}
        if (note.session_id !== undefined) updates[`notes.${id}.session_id`] = note.session_id
        if (note.text !== undefined) updates[`notes.${id}.text`] = note.text
        updates[`notes.${id}.updated_at`] = new Date().toISOString()
        await updateDoc(docRef, updates)
    }

    async function deleteNote(campaignId: string, id: string): Promise<void> {
        const docRef = doc(FIRESTORE_DATABASE, COLLECTION_NAME, campaignId)
        await updateDoc(docRef, { [`notes.${id}`]: deleteField() })
    }

    return {
        getNotesByCampaign,
        createNote,
        updateNote,
        deleteNote
    }
}
