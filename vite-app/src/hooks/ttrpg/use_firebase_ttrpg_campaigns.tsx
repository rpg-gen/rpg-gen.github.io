import { getFirestore, collection, doc, getDocs, getDoc, setDoc, deleteDoc, addDoc, serverTimestamp } from "firebase/firestore"
import useFirebaseProject from "../use_firebase_project"
import TtrpgCampaign from "../../types/ttrpg/TtrpgCampaign"

export default function useFirebaseTtrpgCampaigns() {
    const FIRESTORE_DATABASE = getFirestore(useFirebaseProject())
    const COLLECTION_NAME = "ttrpg_campaigns"

    async function getAllCampaigns(): Promise<TtrpgCampaign[]> {
        const snapshot = await getDocs(collection(FIRESTORE_DATABASE, COLLECTION_NAME))
        const campaigns: TtrpgCampaign[] = []
        snapshot.forEach((doc) => {
            const data = doc.data()
            campaigns.push({
                id: doc.id,
                name: data.name,
                created_at: data.created_at?.toDate?.().toISOString() || "",
                created_by: data.created_by || "",
                sessions: data.sessions || {},
                members: data.members || {},
                lore: data.lore || {},
                notes: data.notes || {}
            })
        })
        return campaigns.sort((a, b) => a.name.localeCompare(b.name))
    }

    async function getCampaign(id: string): Promise<TtrpgCampaign | null> {
        const docRef = doc(FIRESTORE_DATABASE, COLLECTION_NAME, id)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
            const data = docSnap.data()
            return {
                id: docSnap.id,
                name: data.name,
                created_at: data.created_at?.toDate?.().toISOString() || "",
                created_by: data.created_by || "",
                sessions: data.sessions || {},
                members: data.members || {},
                lore: data.lore || {},
                notes: data.notes || {}
            }
        }
        return null
    }

    async function createCampaign(campaign: { name: string; created_by: string }): Promise<string> {
        const docRef = await addDoc(collection(FIRESTORE_DATABASE, COLLECTION_NAME), {
            name: campaign.name,
            created_by: campaign.created_by,
            created_at: serverTimestamp()
        })
        return docRef.id
    }

    async function updateCampaign(id: string, campaign: Partial<TtrpgCampaign>): Promise<void> {
        const docRef = doc(FIRESTORE_DATABASE, COLLECTION_NAME, id)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: _id, ...campaignData } = campaign as TtrpgCampaign
        await setDoc(docRef, campaignData, { merge: true })
    }

    async function deleteCampaign(id: string): Promise<void> {
        const docRef = doc(FIRESTORE_DATABASE, COLLECTION_NAME, id)
        await deleteDoc(docRef)
    }

    return {
        getAllCampaigns,
        getCampaign,
        createCampaign,
        updateCampaign,
        deleteCampaign
    }
}
