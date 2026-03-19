import { getFirestore, collection, doc, getDocs, setDoc, deleteDoc, addDoc, query, where } from "firebase/firestore"
import useFirebaseProject from "../use_firebase_project"
import TtrpgMember from "../../types/ttrpg/TtrpgMember"

export default function useFirebaseTtrpgMembers() {
    const FIRESTORE_DATABASE = getFirestore(useFirebaseProject())
    const COLLECTION_NAME = "ttrpg_members"

    async function getMembersByCampaign(campaignId: string): Promise<TtrpgMember[]> {
        const q = query(
            collection(FIRESTORE_DATABASE, COLLECTION_NAME),
            where("campaign_id", "==", campaignId)
        )
        const snapshot = await getDocs(q)
        const members: TtrpgMember[] = []
        snapshot.forEach((doc) => {
            members.push({
                id: doc.id,
                ...doc.data()
            } as TtrpgMember)
        })
        return members.sort((a, b) => a.name.localeCompare(b.name))
    }

    async function createMember(member: Omit<TtrpgMember, 'id'>): Promise<string> {
        const docRef = await addDoc(collection(FIRESTORE_DATABASE, COLLECTION_NAME), member)
        return docRef.id
    }

    async function updateMember(id: string, member: Partial<TtrpgMember>): Promise<void> {
        const docRef = doc(FIRESTORE_DATABASE, COLLECTION_NAME, id)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: _id, ...memberData } = member as TtrpgMember
        await setDoc(docRef, memberData, { merge: true })
    }

    async function deleteMember(id: string): Promise<void> {
        const docRef = doc(FIRESTORE_DATABASE, COLLECTION_NAME, id)
        await deleteDoc(docRef)
    }

    return {
        getMembersByCampaign,
        createMember,
        updateMember,
        deleteMember
    }
}
