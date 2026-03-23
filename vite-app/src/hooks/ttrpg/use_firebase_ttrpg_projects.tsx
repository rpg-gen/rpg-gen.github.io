import { getFirestore, doc, setDoc, updateDoc, deleteField } from "firebase/firestore"
import useFirebaseProject from "../use_firebase_project"
import TtrpgProject from "../../types/ttrpg/TtrpgProject"
import { TtrpgProjectContribution } from "../../types/ttrpg/TtrpgProject"

export default function useFirebaseTtrpgProjects() {
    const FIRESTORE_DATABASE = getFirestore(useFirebaseProject())
    const COLLECTION_NAME = "ttrpg_campaigns"

    async function createProject(campaignId: string, project: Pick<TtrpgProject, 'title' | 'description' | 'point_total'>): Promise<string> {
        const id = crypto.randomUUID()
        const docRef = doc(FIRESTORE_DATABASE, COLLECTION_NAME, campaignId)
        await setDoc(docRef, {
            projects: {
                [id]: {
                    title: project.title,
                    description: project.description,
                    point_total: project.point_total,
                    current_points: 0,
                    completed: false,
                    created_at: new Date().toISOString(),
                    contributions: []
                }
            }
        }, { merge: true })
        return id
    }

    async function updateProject(campaignId: string, id: string, updates: Partial<Omit<TtrpgProject, 'id' | 'campaign_id'>>): Promise<void> {
        const docRef = doc(FIRESTORE_DATABASE, COLLECTION_NAME, campaignId)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dotUpdates: Record<string, any> = {}
        if (updates.title !== undefined) dotUpdates[`projects.${id}.title`] = updates.title
        if (updates.description !== undefined) dotUpdates[`projects.${id}.description`] = updates.description
        if (updates.point_total !== undefined) dotUpdates[`projects.${id}.point_total`] = updates.point_total
        if (updates.completed !== undefined) dotUpdates[`projects.${id}.completed`] = updates.completed
        if (Object.keys(dotUpdates).length > 0) {
            await updateDoc(docRef, dotUpdates)
        }
    }

    async function addContribution(
        campaignId: string,
        projectId: string,
        currentContributions: TtrpgProjectContribution[],
        currentPoints: number,
        contribution: TtrpgProjectContribution
    ): Promise<void> {
        const docRef = doc(FIRESTORE_DATABASE, COLLECTION_NAME, campaignId)
        const newContributions = [...currentContributions, contribution]
        const newPoints = currentPoints + contribution.points
        await updateDoc(docRef, {
            [`projects.${projectId}.contributions`]: newContributions,
            [`projects.${projectId}.current_points`]: newPoints,
            [`projects.${projectId}.last_contributed_at`]: new Date().toISOString()
        })
    }

    async function updateContributions(
        campaignId: string,
        projectId: string,
        contributions: TtrpgProjectContribution[]
    ): Promise<void> {
        const docRef = doc(FIRESTORE_DATABASE, COLLECTION_NAME, campaignId)
        const newPoints = contributions.reduce((sum, c) => sum + c.points, 0)
        await updateDoc(docRef, {
            [`projects.${projectId}.contributions`]: contributions,
            [`projects.${projectId}.current_points`]: newPoints
        })
    }

    async function deleteProject(campaignId: string, id: string): Promise<void> {
        const docRef = doc(FIRESTORE_DATABASE, COLLECTION_NAME, campaignId)
        await updateDoc(docRef, { [`projects.${id}`]: deleteField() })
    }

    return {
        createProject,
        updateProject,
        addContribution,
        updateContributions,
        deleteProject
    }
}
