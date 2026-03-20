import JSZip from "jszip"
import TtrpgCampaign from "../types/ttrpg/TtrpgCampaign"
import TtrpgSession from "../types/ttrpg/TtrpgSession"
import TtrpgMember from "../types/ttrpg/TtrpgMember"
import TtrpgSessionNote from "../types/ttrpg/TtrpgSessionNote"
import TtrpgLoreEntry from "../types/ttrpg/TtrpgLoreEntry"

interface BackupData {
    campaigns: TtrpgCampaign[]
    sessions: TtrpgSession[]
    members: TtrpgMember[]
    session_notes: TtrpgSessionNote[]
    lore: TtrpgLoreEntry[]
}

export async function createBackupZip(data: BackupData): Promise<Blob> {
    const zip = new JSZip()
    zip.file("campaigns.json", JSON.stringify(data.campaigns, null, 2))
    zip.file("sessions.json", JSON.stringify(data.sessions, null, 2))
    zip.file("members.json", JSON.stringify(data.members, null, 2))
    zip.file("session_notes.json", JSON.stringify(data.session_notes, null, 2))
    zip.file("lore.json", JSON.stringify(data.lore, null, 2))
    return await zip.generateAsync({ type: "blob" })
}

export function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}

export function getTodayString(): string {
    return new Date().toISOString().slice(0, 10)
}

const BACKUP_DATE_KEY = "ttrpg_backup_date"

export function hasBackupFromToday(): boolean {
    return localStorage.getItem(BACKUP_DATE_KEY) === getTodayString()
}

export function markBackupComplete() {
    localStorage.setItem(BACKUP_DATE_KEY, getTodayString())
}
