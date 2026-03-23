import { getFirestore, doc, getDoc, setDoc, updateDoc, deleteField } from "firebase/firestore"
import useFirebaseProject from "../use_firebase_project"
import TtrpgLoreEntry from "../../types/ttrpg/TtrpgLoreEntry"
import { TtrpgLoreData } from "../../types/ttrpg/TtrpgCampaign"

export default function useFirebaseTtrpgLore() {
    const FIRESTORE_DATABASE = getFirestore(useFirebaseProject())
    const COLLECTION_NAME = "ttrpg_campaigns"

    async function getLoreByCampaign(campaignId: string): Promise<TtrpgLoreEntry[]> {
        const docRef = doc(FIRESTORE_DATABASE, COLLECTION_NAME, campaignId)
        const docSnap = await getDoc(docRef)
        if (!docSnap.exists()) return []

        const data = docSnap.data()
        const loreMap = (data.lore || {}) as Record<string, TtrpgLoreData>
        const entries: TtrpgLoreEntry[] = Object.entries(loreMap).map(([id, l]) => ({
            id,
            campaign_id: campaignId,
            type: l.type,
            name: l.name,
            subtitle: l.notes,
            created_at: l.created_at || "",
            ...(l.session_id ? { session_id: l.session_id } : {}),
            ...(l.faction_id ? { faction_id: l.faction_id } : {})
        }))
        return entries.reverse()
    }

    async function createLoreEntry(campaignId: string, entry: Omit<TtrpgLoreEntry, 'id' | 'campaign_id'>): Promise<string> {
        const id = crypto.randomUUID()
        const docRef = doc(FIRESTORE_DATABASE, COLLECTION_NAME, campaignId)
        const loreData: TtrpgLoreData = {
            type: entry.type,
            name: entry.name,
            notes: entry.subtitle,
            created_at: new Date().toISOString(),
            ...(entry.session_id ? { session_id: entry.session_id } : {}),
            ...(entry.faction_id ? { faction_id: entry.faction_id } : {})
        }
        await setDoc(docRef, { lore: { [id]: loreData } }, { merge: true })
        return id
    }

    async function updateLoreEntry(campaignId: string, id: string, entry: Partial<TtrpgLoreEntry>): Promise<void> {
        const docRef = doc(FIRESTORE_DATABASE, COLLECTION_NAME, campaignId)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updates: Record<string, any> = {}
        if (entry.type !== undefined) updates[`lore.${id}.type`] = entry.type
        if (entry.name !== undefined) updates[`lore.${id}.name`] = entry.name
        if (entry.subtitle !== undefined) updates[`lore.${id}.notes`] = entry.subtitle
        if (entry.session_id !== undefined) updates[`lore.${id}.session_id`] = entry.session_id
        if (entry.faction_id !== undefined) {
            updates[`lore.${id}.faction_id`] = entry.faction_id === "" ? deleteField() : entry.faction_id
        }
        if (Object.keys(updates).length > 0) {
            await updateDoc(docRef, updates)
        }
    }

    async function deleteLoreEntry(campaignId: string, id: string): Promise<void> {
        const docRef = doc(FIRESTORE_DATABASE, COLLECTION_NAME, campaignId)
        await updateDoc(docRef, { [`lore.${id}`]: deleteField() })
    }

    return {
        getLoreByCampaign,
        createLoreEntry,
        updateLoreEntry,
        deleteLoreEntry
    }
}
