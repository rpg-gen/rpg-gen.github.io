import { getFirestore, doc, updateDoc } from "firebase/firestore"
import useFirebaseProject from "../use_firebase_project"
import { TtrpgMemberItem, TtrpgMemberFollower } from "../../types/ttrpg/TtrpgMember"
import TtrpgPartyResources from "../../types/ttrpg/TtrpgPartyResources"

export default function useFirebaseTtrpgPartyResources() {
    const FIRESTORE_DATABASE = getFirestore(useFirebaseProject())
    const COLLECTION_NAME = "ttrpg_campaigns"

    async function updatePartyResources(
        campaignId: string,
        updates: Partial<TtrpgPartyResources>
    ): Promise<void> {
        const docRef = doc(FIRESTORE_DATABASE, COLLECTION_NAME, campaignId)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dotUpdates: Record<string, any> = {}
        for (const [key, value] of Object.entries(updates)) {
            dotUpdates[`party_resources.${key}`] = value
        }
        await updateDoc(docRef, dotUpdates)
    }

    async function assignItemToMember(
        campaignId: string,
        memberId: string,
        item: TtrpgMemberItem,
        remainingUnassigned: TtrpgMemberItem[],
        memberItems: TtrpgMemberItem[]
    ): Promise<void> {
        const docRef = doc(FIRESTORE_DATABASE, COLLECTION_NAME, campaignId)
        const existingIdx = memberItems.findIndex(i => i.name === item.name)
        let updatedMemberItems: TtrpgMemberItem[]
        if (existingIdx >= 0) {
            updatedMemberItems = memberItems.map((i, idx) =>
                idx === existingIdx ? { ...i, quantity: i.quantity + item.quantity } : i
            )
        } else {
            updatedMemberItems = [...memberItems, item]
        }
        await updateDoc(docRef, {
            "party_resources.unassigned_items": remainingUnassigned,
            [`members.${memberId}.items`]: updatedMemberItems
        })
    }

    async function unassignItemFromMember(
        campaignId: string,
        memberId: string,
        item: TtrpgMemberItem,
        updatedMemberItems: TtrpgMemberItem[],
        currentUnassigned: TtrpgMemberItem[]
    ): Promise<void> {
        const docRef = doc(FIRESTORE_DATABASE, COLLECTION_NAME, campaignId)
        const existingIdx = currentUnassigned.findIndex(i => i.name === item.name)
        let updatedUnassigned: TtrpgMemberItem[]
        if (existingIdx >= 0) {
            updatedUnassigned = currentUnassigned.map((i, idx) =>
                idx === existingIdx ? { ...i, quantity: i.quantity + item.quantity } : i
            )
        } else {
            updatedUnassigned = [...currentUnassigned, item]
        }
        await updateDoc(docRef, {
            [`members.${memberId}.items`]: updatedMemberItems,
            "party_resources.unassigned_items": updatedUnassigned
        })
    }

    async function assignFollowerToMember(
        campaignId: string,
        memberId: string,
        follower: TtrpgMemberFollower,
        remainingUnassigned: TtrpgMemberFollower[],
        memberFollowers: TtrpgMemberFollower[]
    ): Promise<void> {
        const docRef = doc(FIRESTORE_DATABASE, COLLECTION_NAME, campaignId)
        await updateDoc(docRef, {
            "party_resources.unassigned_followers": remainingUnassigned,
            [`members.${memberId}.followers`]: [...memberFollowers, follower]
        })
    }

    async function unassignFollowerFromMember(
        campaignId: string,
        memberId: string,
        follower: TtrpgMemberFollower,
        updatedMemberFollowers: TtrpgMemberFollower[],
        currentUnassigned: TtrpgMemberFollower[]
    ): Promise<void> {
        const docRef = doc(FIRESTORE_DATABASE, COLLECTION_NAME, campaignId)
        await updateDoc(docRef, {
            [`members.${memberId}.followers`]: updatedMemberFollowers,
            "party_resources.unassigned_followers": [...currentUnassigned, follower]
        })
    }

    return {
        updatePartyResources,
        assignItemToMember,
        unassignItemFromMember,
        assignFollowerToMember,
        unassignFollowerFromMember
    }
}
