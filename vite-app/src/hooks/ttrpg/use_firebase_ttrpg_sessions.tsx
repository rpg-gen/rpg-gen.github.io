import { getFirestore, doc, getDoc, setDoc, updateDoc, deleteField } from "firebase/firestore"
import useFirebaseProject from "../use_firebase_project"
import TtrpgSession from "../../types/ttrpg/TtrpgSession"
import { TtrpgSessionData } from "../../types/ttrpg/TtrpgCampaign"

export default function useFirebaseTtrpgSessions() {
    const FIRESTORE_DATABASE = getFirestore(useFirebaseProject())
    const COLLECTION_NAME = "ttrpg_campaigns"

    async function getSessionsByCampaign(campaignId: string): Promise<TtrpgSession[]> {
        const docRef = doc(FIRESTORE_DATABASE, COLLECTION_NAME, campaignId)
        const docSnap = await getDoc(docRef)
        if (!docSnap.exists()) return []

        const data = docSnap.data()
        const sessionsMap = (data.sessions || {}) as Record<string, TtrpgSessionData>
        const sessions: TtrpgSession[] = Object.entries(sessionsMap).map(([id, s]) => ({
            id,
            campaign_id: campaignId,
            session_number: s.session_number,
            date: s.date,
            title: s.title,
            respite_count: s.respite_count
        }))
        return sessions.sort((a, b) => a.session_number - b.session_number)
    }

    async function createSession(session: Omit<TtrpgSession, 'id'>): Promise<string> {
        const id = crypto.randomUUID()
        const docRef = doc(FIRESTORE_DATABASE, COLLECTION_NAME, session.campaign_id)
        const sessionData: TtrpgSessionData = {
            session_number: session.session_number,
            date: session.date,
            respite_count: session.respite_count,
            ...(session.title ? { title: session.title } : {})
        }
        await setDoc(docRef, { sessions: { [id]: sessionData } }, { merge: true })
        return id
    }

    async function updateSession(campaignId: string, id: string, session: Partial<TtrpgSession>): Promise<void> {
        const docRef = doc(FIRESTORE_DATABASE, COLLECTION_NAME, campaignId)
        const updates: Record<string, string | number> = {}
        if (session.session_number !== undefined) updates[`sessions.${id}.session_number`] = session.session_number
        if (session.date !== undefined) updates[`sessions.${id}.date`] = session.date
        if (session.title !== undefined) updates[`sessions.${id}.title`] = session.title
        if (session.respite_count !== undefined) updates[`sessions.${id}.respite_count`] = session.respite_count
        if (Object.keys(updates).length > 0) {
            await updateDoc(docRef, updates)
        }
    }

    async function deleteSession(campaignId: string, id: string): Promise<void> {
        const docRef = doc(FIRESTORE_DATABASE, COLLECTION_NAME, campaignId)
        await updateDoc(docRef, { [`sessions.${id}`]: deleteField() })
    }

    return {
        getSessionsByCampaign,
        createSession,
        updateSession,
        deleteSession
    }
}
