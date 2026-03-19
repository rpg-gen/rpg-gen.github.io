import { getFirestore, collection, doc, getDocs, setDoc, deleteDoc, addDoc, serverTimestamp } from "firebase/firestore"
import useFirebaseProject from "./use_firebase_project"
import Feedback, { FeedbackType } from "../types/Feedback"

export default function useFirebaseFeedback() {
    const FIRESTORE_DATABASE = getFirestore(useFirebaseProject())
    const COLLECTION_NAME = "feedback"

    async function getAllFeedback(): Promise<Feedback[]> {
        const snapshot = await getDocs(collection(FIRESTORE_DATABASE, COLLECTION_NAME))
        const items: Feedback[] = []
        snapshot.forEach((doc) => {
            const data = doc.data()
            items.push({
                id: doc.id,
                type: data.type,
                note: data.note,
                submitted_by: data.submitted_by || "",
                created_at: data.created_at?.toDate?.().toISOString() || "",
                updated_at: data.updated_at?.toDate?.().toISOString() || ""
            })
        })
        return items.sort((a, b) => b.created_at.localeCompare(a.created_at))
    }

    async function createFeedback(feedback: { type: FeedbackType; note: string; submitted_by: string }): Promise<string> {
        const docRef = await addDoc(collection(FIRESTORE_DATABASE, COLLECTION_NAME), {
            type: feedback.type,
            note: feedback.note,
            submitted_by: feedback.submitted_by,
            created_at: serverTimestamp(),
            updated_at: serverTimestamp()
        })
        return docRef.id
    }

    async function updateFeedback(id: string, fields: Partial<Omit<Feedback, "id">>): Promise<void> {
        const docRef = doc(FIRESTORE_DATABASE, COLLECTION_NAME, id)
        await setDoc(docRef, { ...fields, updated_at: serverTimestamp() }, { merge: true })
    }

    async function deleteFeedback(id: string): Promise<void> {
        const docRef = doc(FIRESTORE_DATABASE, COLLECTION_NAME, id)
        await deleteDoc(docRef)
    }

    return {
        getAllFeedback,
        createFeedback,
        updateFeedback,
        deleteFeedback
    }
}
