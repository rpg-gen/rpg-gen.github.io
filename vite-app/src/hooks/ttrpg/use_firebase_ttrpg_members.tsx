import { getFirestore, doc, getDoc, setDoc, updateDoc, deleteField } from "firebase/firestore"
import useFirebaseProject from "../use_firebase_project"
import TtrpgMember from "../../types/ttrpg/TtrpgMember"
import { TtrpgMemberData } from "../../types/ttrpg/TtrpgCampaign"

export default function useFirebaseTtrpgMembers() {
    const FIRESTORE_DATABASE = getFirestore(useFirebaseProject())
    const COLLECTION_NAME = "ttrpg_campaigns"

    async function getMembersByCampaign(campaignId: string): Promise<TtrpgMember[]> {
        const docRef = doc(FIRESTORE_DATABASE, COLLECTION_NAME, campaignId)
        const docSnap = await getDoc(docRef)
        if (!docSnap.exists()) return []

        const data = docSnap.data()
        const membersMap = (data.members || {}) as Record<string, TtrpgMemberData>
        const members: TtrpgMember[] = Object.entries(membersMap).map(([id, m]) => ({
            id,
            campaign_id: campaignId,
            name: m.name,
            played_by: m.played_by,
            notes: m.notes,
            items: m.items || []
        }))
        return members.sort((a, b) => a.name.localeCompare(b.name))
    }

    async function createMember(member: Omit<TtrpgMember, 'id'>): Promise<string> {
        const id = crypto.randomUUID()
        const docRef = doc(FIRESTORE_DATABASE, COLLECTION_NAME, member.campaign_id)
        const memberData: TtrpgMemberData = {
            name: member.name,
            played_by: member.played_by,
            notes: member.notes,
            items: member.items || []
        }
        await setDoc(docRef, { members: { [id]: memberData } }, { merge: true })
        return id
    }

    async function updateMember(id: string, member: Partial<TtrpgMember>): Promise<void> {
        const campaignId = member.campaign_id
        if (!campaignId) throw new Error("campaign_id required for updateMember")
        const docRef = doc(FIRESTORE_DATABASE, COLLECTION_NAME, campaignId)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updates: Record<string, any> = {}
        if (member.name !== undefined) updates[`members.${id}.name`] = member.name
        if (member.played_by !== undefined) updates[`members.${id}.played_by`] = member.played_by
        if (member.notes !== undefined) updates[`members.${id}.notes`] = member.notes
        if (member.items !== undefined) updates[`members.${id}.items`] = member.items
        if (Object.keys(updates).length > 0) {
            await updateDoc(docRef, updates)
        }
    }

    async function deleteMember(id: string, campaignId: string): Promise<void> {
        const docRef = doc(FIRESTORE_DATABASE, COLLECTION_NAME, campaignId)
        await updateDoc(docRef, { [`members.${id}`]: deleteField() })
    }

    return {
        getMembersByCampaign,
        createMember,
        updateMember,
        deleteMember
    }
}
