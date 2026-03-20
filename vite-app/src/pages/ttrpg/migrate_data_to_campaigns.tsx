import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { doc, setDoc, getFirestore, collection, getDocs, deleteDoc, query, where } from "firebase/firestore"
import useFirebaseProject from "../../hooks/use_firebase_project"
import useFirebaseTtrpgCampaigns from "../../hooks/ttrpg/use_firebase_ttrpg_campaigns"
import FullPageOverlay from "../../components/full_page_overlay"
import { nav_paths } from "../../configs/constants"
import { TtrpgMemberData, TtrpgNoteData, TtrpgLoreData } from "../../types/ttrpg/TtrpgCampaign"
import { createBackupZip, downloadBlob, hasBackupFromToday, markBackupComplete } from "../../utility/ttrpg_backup"
import MigrateDataSteps from "./migrate_data_steps"

interface MigrationStep {
    status: string
    details?: string
    isError?: boolean
    isComplete?: boolean
}

export default function MigrateDataToCampaigns() {
    const navigate = useNavigate()
    const firebaseApp = useFirebaseProject()
    const db = getFirestore(firebaseApp)
    const campaignsHook = useFirebaseTtrpgCampaigns()

    const [backupDone, setBackupDone] = useState(hasBackupFromToday)
    const [isBackingUp, setIsBackingUp] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [steps, setSteps] = useState<MigrationStep[]>([])
    const [completed, setCompleted] = useState(false)
    const [error, setError] = useState("")
    const [cleanupDone, setCleanupDone] = useState(false)

    function addStep(step: MigrationStep) {
        setSteps(prev => [...prev, step])
    }

    function updateLastStep(updates: Partial<MigrationStep>) {
        setSteps(prev => {
            const next = [...prev]
            if (next.length > 0) next[next.length - 1] = { ...next[next.length - 1], ...updates }
            return next
        })
    }

    async function handleBackup() {
        setIsBackingUp(true)
        try {
            const campaigns = await campaignsHook.getAllCampaigns()
            const [allMembers, allNotes, allLore] = await Promise.all([
                readLegacyCollection("ttrpg_members"),
                readLegacyCollection("ttrpg_session_notes"),
                readLegacyCollection("ttrpg_lore")
            ])
            const blob = await createBackupZip({
                campaigns,
                sessions: [],
                members: allMembers,
                session_notes: allNotes,
                lore: allLore
            })
            downloadBlob(blob, `ttrpg-backup-${new Date().toISOString().slice(0, 10)}.zip`)
            markBackupComplete()
            setBackupDone(true)
        } catch (err) {
            console.error("Backup error:", err)
            alert("Error creating backup: " + (err instanceof Error ? err.message : String(err)))
        } finally {
            setIsBackingUp(false)
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async function readLegacyCollection(name: string): Promise<any[]> {
        const snapshot = await getDocs(collection(db, name))
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const docs: any[] = []
        snapshot.forEach(d => docs.push({ id: d.id, ...d.data() }))
        return docs
    }

    async function runMigration() {
        setIsLoading(true)
        setError("")
        setSteps([])

        try {
            addStep({ status: "Loading campaigns..." })
            const campaigns = await campaignsHook.getAllCampaigns()
            updateLastStep({ status: `Loaded ${campaigns.length} campaigns`, isComplete: true })

            for (const campaign of campaigns) {
                await migrateCampaignData(campaign.id, campaign.name)
            }

            setCompleted(true)
        } catch (err) {
            console.error("Migration error:", err)
            const msg = err instanceof Error ? err.message : String(err)
            setError(msg)
            addStep({ status: "Migration failed", details: msg, isError: true })
        } finally {
            setIsLoading(false)
        }
    }

    async function migrateCampaignData(campaignId: string, campaignName: string) {
        addStep({ status: `Migrating ${campaignName}...` })

        const [members, notes, lore] = await Promise.all([
            readLegacyByCampaign("ttrpg_members", campaignId),
            readLegacyByCampaign("ttrpg_session_notes", campaignId),
            readLegacyByCampaign("ttrpg_lore", campaignId)
        ])

        const membersMap: Record<string, TtrpgMemberData> = {}
        for (const m of members) {
            membersMap[m.id] = { name: m.name, played_by: m.played_by, notes: m.notes, items: m.items || [] }
        }

        const notesMap: Record<string, TtrpgNoteData> = {}
        for (const n of notes) {
            notesMap[n.id] = {
                session_id: n.session_id,
                text: n.text,
                author: n.author,
                created_at: n.created_at?.toDate?.().toISOString() || n.created_at || "",
                updated_at: n.updated_at?.toDate?.().toISOString() || n.updated_at || ""
            }
        }

        const loreMap: Record<string, TtrpgLoreData> = {}
        for (const l of lore) {
            loreMap[l.id] = {
                type: l.type,
                name: l.name,
                notes: l.notes || "",
                ...(l.session_id ? { session_id: l.session_id } : {})
            }
        }

        const docRef = doc(db, "ttrpg_campaigns", campaignId)
        await setDoc(docRef, { members: membersMap, notes: notesMap, lore: loreMap }, { merge: true })

        updateLastStep({
            status: `${campaignName}: ${members.length} members, ${notes.length} notes, ${lore.length} lore`,
            isComplete: true
        })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async function readLegacyByCampaign(collectionName: string, campaignId: string): Promise<any[]> {
        const q = query(collection(db, collectionName), where("campaign_id", "==", campaignId))
        const snapshot = await getDocs(q)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const docs: any[] = []
        snapshot.forEach(d => docs.push({ id: d.id, ...d.data() }))
        return docs
    }

    async function handleCleanup() {
        if (!confirm("Delete all documents from ttrpg_members, ttrpg_session_notes, and ttrpg_lore collections? This cannot be undone.")) return
        setIsLoading(true)
        try {
            let totalDeleted = 0
            for (const name of ["ttrpg_members", "ttrpg_session_notes", "ttrpg_lore"]) {
                const snapshot = await getDocs(collection(db, name))
                for (const d of snapshot.docs) {
                    await deleteDoc(doc(db, name, d.id))
                    totalDeleted++
                }
            }
            alert(`Deleted ${totalDeleted} legacy documents.`)
            setCleanupDone(true)
        } catch (err) {
            console.error("Cleanup error:", err)
            alert("Error during cleanup: " + (err instanceof Error ? err.message : String(err)))
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <FullPageOverlay>
            <div style={{ padding: "1rem", maxWidth: "900px", margin: "0 auto" }}>
                <h1>TTRPG Data Migration</h1>
                <div style={{ marginBottom: "1.5rem" }}>
                    <button onClick={() => navigate(nav_paths.utilities_menu)}>Back to Utilities</button>
                </div>
                <MigrateDataSteps
                    backupDone={backupDone}
                    isBackingUp={isBackingUp}
                    isLoading={isLoading}
                    steps={steps}
                    completed={completed}
                    error={error}
                    cleanupDone={cleanupDone}
                    onBackup={handleBackup}
                    onMigrate={runMigration}
                    onCleanup={handleCleanup}
                />
            </div>
        </FullPageOverlay>
    )
}
