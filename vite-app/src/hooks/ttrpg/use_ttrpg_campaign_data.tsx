import { useState, useRef } from "react"
import { getFirestore, doc, onSnapshot } from "firebase/firestore"
import useFirebaseProject from "../use_firebase_project"
import useFirebaseTtrpgSessions from "./use_firebase_ttrpg_sessions"
import useFirebaseTtrpgMembers from "./use_firebase_ttrpg_members"
import useFirebaseTtrpgSessionNotes from "./use_firebase_ttrpg_session_notes"
import useFirebaseTtrpgLore from "./use_firebase_ttrpg_lore"
import TtrpgSession from "../../types/ttrpg/TtrpgSession"
import TtrpgMember from "../../types/ttrpg/TtrpgMember"
import TtrpgSessionNote from "../../types/ttrpg/TtrpgSessionNote"
import TtrpgLoreEntry from "../../types/ttrpg/TtrpgLoreEntry"
import { TtrpgSessionData, TtrpgMemberData, TtrpgNoteData, TtrpgLoreData } from "../../types/ttrpg/TtrpgCampaign"
import { assignSessionNumbers } from "../../utility/ttrpg_session_helpers"

interface TtrpgCampaignData {
    sessions: TtrpgSession[]
    members: TtrpgMember[]
    notes: TtrpgSessionNote[]
    lore: TtrpgLoreEntry[]
}

function parseSessionsMap(campaignId: string, map: Record<string, TtrpgSessionData>): TtrpgSession[] {
    return Object.entries(map).map(([id, s]) => ({
        id,
        campaign_id: campaignId,
        session_number: s.session_number,
        date: s.date,
        title: s.title,
        respite_count: s.respite_count
    })).sort((a, b) => a.date.localeCompare(b.date))
}

function parseMembersMap(campaignId: string, map: Record<string, TtrpgMemberData>): TtrpgMember[] {
    return Object.entries(map).map(([id, m]) => ({
        id,
        campaign_id: campaignId,
        name: m.name,
        played_by: m.played_by,
        notes: m.notes,
        items: m.items || []
    })).sort((a, b) => a.name.localeCompare(b.name))
}

function parseNotesMap(campaignId: string, map: Record<string, TtrpgNoteData>): TtrpgSessionNote[] {
    return Object.entries(map).map(([id, n]) => ({
        id,
        campaign_id: campaignId,
        session_id: n.session_id,
        text: n.text,
        author: n.author,
        created_at: n.created_at || "",
        updated_at: n.updated_at || ""
    })).sort((a, b) => a.created_at.localeCompare(b.created_at))
}

function parseLoreMap(campaignId: string, map: Record<string, TtrpgLoreData>): TtrpgLoreEntry[] {
    return Object.entries(map).map(([id, l]) => ({
        id,
        campaign_id: campaignId,
        type: l.type,
        name: l.name,
        subtitle: l.notes,
        created_at: l.created_at || "",
        ...(l.session_id ? { session_id: l.session_id } : {})
    })).reverse()
}

export default function useTtrpgCampaignData() {
    const db = getFirestore(useFirebaseProject())
    const rawSessionsHook = useFirebaseTtrpgSessions()
    const rawMembersHook = useFirebaseTtrpgMembers()
    const rawNotesHook = useFirebaseTtrpgSessionNotes()
    const rawLoreHook = useFirebaseTtrpgLore()

    const campaignIdRef = useRef<string>("")

    const [data, setData] = useState<TtrpgCampaignData>({
        sessions: [],
        members: [],
        notes: [],
        lore: []
    })
    const [isLoading, setIsLoading] = useState(false)

    // Adapter: wraps the sessions hook so consumers see the old interface
    const sessionsHook = {
        createSession: rawSessionsHook.createSession,
        updateSession: (id: string, session: Partial<TtrpgSession>) =>
            rawSessionsHook.updateSession(campaignIdRef.current, id, session),
        deleteSession: (id: string) =>
            rawSessionsHook.deleteSession(campaignIdRef.current, id),
    }

    // Adapter: wraps the members hook — injects campaignId
    const membersHook = {
        getMembersByCampaign: rawMembersHook.getMembersByCampaign,
        createMember: rawMembersHook.createMember,
        updateMember: (id: string, member: Partial<TtrpgMember>) =>
            rawMembersHook.updateMember(id, { ...member, campaign_id: campaignIdRef.current }),
        deleteMember: (id: string) =>
            rawMembersHook.deleteMember(id, campaignIdRef.current),
    }

    // Adapter: wraps the notes hook — injects campaignId
    const notesHook = {
        getNotesByCampaign: rawNotesHook.getNotesByCampaign,
        createNote: (note: { session_id: string; text: string; author: string }) =>
            rawNotesHook.createNote(campaignIdRef.current, note),
        updateNote: (id: string, note: Partial<TtrpgSessionNote>) =>
            rawNotesHook.updateNote(campaignIdRef.current, id, note),
        deleteNote: (id: string) =>
            rawNotesHook.deleteNote(campaignIdRef.current, id),
    }

    // Adapter: wraps the lore hook — injects campaignId
    const loreHook = {
        getLoreByCampaign: rawLoreHook.getLoreByCampaign,
        createLoreEntry: (entry: Omit<TtrpgLoreEntry, 'id' | 'campaign_id'>) =>
            rawLoreHook.createLoreEntry(campaignIdRef.current, entry),
        updateLoreEntry: (id: string, entry: Partial<TtrpgLoreEntry>) =>
            rawLoreHook.updateLoreEntry(campaignIdRef.current, id, entry),
        deleteLoreEntry: (id: string) =>
            rawLoreHook.deleteLoreEntry(campaignIdRef.current, id),
    }

    function subscribe(campaignId: string) {
        campaignIdRef.current = campaignId
        setIsLoading(true)

        const docRef = doc(db, "ttrpg_campaigns", campaignId)
        const unsub = onSnapshot(docRef, (snapshot) => {
            if (!snapshot.exists()) {
                setData({ sessions: [], members: [], notes: [], lore: [] })
                setIsLoading(false)
                return
            }
            const docData = snapshot.data()

            const rawSessions = parseSessionsMap(campaignId, docData.sessions || {})
            const sessions = assignSessionNumbers(rawSessions)
            const members = parseMembersMap(campaignId, docData.members || {})
            const notes = parseNotesMap(campaignId, docData.notes || {})
            const lore = parseLoreMap(campaignId, docData.lore || {})

            setData({ sessions, members, notes, lore })
            setIsLoading(false)

            // Session number healing (fire-and-forget)
            for (const session of sessions) {
                const original = rawSessions.find(s => s.id === session.id)
                if (original && original.session_number !== session.session_number) {
                    rawSessionsHook.updateSession(campaignId, session.id, { session_number: session.session_number })
                        .catch(err => console.error("Error healing session number:", err))
                }
            }
        })

        return unsub
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
        subscribe,
        updateMembers,
        updateSessions,
        sessionsHook,
        membersHook,
        notesHook,
        loreHook
    }
}
