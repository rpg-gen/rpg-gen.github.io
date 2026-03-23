import { getFirestore, doc, setDoc, updateDoc, deleteField } from "firebase/firestore"
import useFirebaseProject from "../use_firebase_project"
import TtrpgQuest from "../../types/ttrpg/TtrpgQuest"

export default function useFirebaseTtrpgQuests() {
    const FIRESTORE_DATABASE = getFirestore(useFirebaseProject())
    const COLLECTION_NAME = "ttrpg_campaigns"

    async function createQuest(campaignId: string, quest: Omit<TtrpgQuest, 'id' | 'campaign_id'>): Promise<string> {
        const id = crypto.randomUUID()
        const docRef = doc(FIRESTORE_DATABASE, COLLECTION_NAME, campaignId)
        await setDoc(docRef, {
            quests: {
                [id]: {
                    short_title: quest.short_title,
                    description: quest.description,
                    completed: false,
                    created_at: new Date().toISOString(),
                    ...(quest.session_id ? { session_id: quest.session_id } : {})
                }
            }
        }, { merge: true })
        return id
    }

    async function updateQuest(campaignId: string, id: string, quest: Partial<Omit<TtrpgQuest, 'id' | 'campaign_id'>>): Promise<void> {
        const docRef = doc(FIRESTORE_DATABASE, COLLECTION_NAME, campaignId)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updates: Record<string, any> = {}
        if (quest.short_title !== undefined) updates[`quests.${id}.short_title`] = quest.short_title
        if (quest.description !== undefined) updates[`quests.${id}.description`] = quest.description
        if (quest.session_id !== undefined) updates[`quests.${id}.session_id`] = quest.session_id
        if (quest.completed !== undefined) updates[`quests.${id}.completed`] = quest.completed
        if (quest.created_at !== undefined) updates[`quests.${id}.created_at`] = quest.created_at
        if (Object.keys(updates).length > 0) {
            await updateDoc(docRef, updates)
        }
    }

    async function deleteQuest(campaignId: string, id: string): Promise<void> {
        const docRef = doc(FIRESTORE_DATABASE, COLLECTION_NAME, campaignId)
        await updateDoc(docRef, { [`quests.${id}`]: deleteField() })
    }

    return {
        createQuest,
        updateQuest,
        deleteQuest
    }
}
