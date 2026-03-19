import { getFirestore, collection, doc, getDocs, setDoc, deleteDoc, addDoc, query, where } from "firebase/firestore"
import useFirebaseProject from "../use_firebase_project"
import TtrpgSession from "../../types/ttrpg/TtrpgSession"

export default function useFirebaseTtrpgSessions() {
    const FIRESTORE_DATABASE = getFirestore(useFirebaseProject())
    const COLLECTION_NAME = "ttrpg_sessions"

    async function getSessionsByCampaign(campaignId: string): Promise<TtrpgSession[]> {
        const q = query(
            collection(FIRESTORE_DATABASE, COLLECTION_NAME),
            where("campaign_id", "==", campaignId)
        )
        const snapshot = await getDocs(q)
        const sessions: TtrpgSession[] = []
        snapshot.forEach((doc) => {
            sessions.push({
                id: doc.id,
                ...doc.data()
            } as TtrpgSession)
        })
        return sessions.sort((a, b) => a.session_number - b.session_number)
    }

    async function createSession(session: Omit<TtrpgSession, 'id'>): Promise<string> {
        const docRef = await addDoc(collection(FIRESTORE_DATABASE, COLLECTION_NAME), session)
        return docRef.id
    }

    async function updateSession(id: string, session: Partial<TtrpgSession>): Promise<void> {
        const docRef = doc(FIRESTORE_DATABASE, COLLECTION_NAME, id)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: _id, ...sessionData } = session as TtrpgSession
        await setDoc(docRef, sessionData, { merge: true })
    }

    async function deleteSession(id: string): Promise<void> {
        const docRef = doc(FIRESTORE_DATABASE, COLLECTION_NAME, id)
        await deleteDoc(docRef)
    }

    return {
        getSessionsByCampaign,
        createSession,
        updateSession,
        deleteSession
    }
}
