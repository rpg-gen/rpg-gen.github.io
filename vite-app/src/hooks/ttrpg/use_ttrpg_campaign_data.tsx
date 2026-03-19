import { useState } from "react"
import useFirebaseTtrpgSessions from "./use_firebase_ttrpg_sessions"
import useFirebaseTtrpgMembers from "./use_firebase_ttrpg_members"
import useFirebaseTtrpgSessionNotes from "./use_firebase_ttrpg_session_notes"
import useFirebaseTtrpgLore from "./use_firebase_ttrpg_lore"
import TtrpgSession from "../../types/ttrpg/TtrpgSession"
import TtrpgMember from "../../types/ttrpg/TtrpgMember"
import TtrpgSessionNote from "../../types/ttrpg/TtrpgSessionNote"
import TtrpgLoreEntry from "../../types/ttrpg/TtrpgLoreEntry"

interface TtrpgCampaignData {
    sessions: TtrpgSession[]
    members: TtrpgMember[]
    notes: TtrpgSessionNote[]
    lore: TtrpgLoreEntry[]
}

export default function useTtrpgCampaignData() {
    const sessionsHook = useFirebaseTtrpgSessions()
    const membersHook = useFirebaseTtrpgMembers()
    const notesHook = useFirebaseTtrpgSessionNotes()
    const loreHook = useFirebaseTtrpgLore()

    const [data, setData] = useState<TtrpgCampaignData>({
        sessions: [],
        members: [],
        notes: [],
        lore: []
    })
    const [isLoading, setIsLoading] = useState(false)

    async function loadAll(campaignId: string): Promise<TtrpgCampaignData> {
        setIsLoading(true)
        try {
            const [sessions, members, notes, lore] = await Promise.all([
                sessionsHook.getSessionsByCampaign(campaignId),
                membersHook.getMembersByCampaign(campaignId),
                notesHook.getNotesByCampaign(campaignId),
                loreHook.getLoreByCampaign(campaignId)
            ])

            const loadedData = { sessions, members, notes, lore }
            setData(loadedData)
            return loadedData
        } catch (err) {
            console.error("Error loading campaign data:", err)
            return { sessions: [], members: [], notes: [], lore: [] }
        } finally {
            setIsLoading(false)
        }
    }

    function updateMembers(updater: (members: TtrpgMember[]) => TtrpgMember[]) {
        setData(prev => ({ ...prev, members: updater(prev.members) }))
    }

    function updateSessions(updater: (sessions: TtrpgSession[]) => TtrpgSession[]) {
        setData(prev => ({ ...prev, sessions: updater(prev.sessions) }))
    }

    return {
        data,
        isLoading,
        loadAll,
        updateMembers,
        updateSessions,
        sessionsHook,
        membersHook,
        notesHook,
        loreHook
    }
}
