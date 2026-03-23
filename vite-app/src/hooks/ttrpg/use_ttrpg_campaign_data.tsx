import { useState, useRef } from "react"
import { getFirestore, doc, onSnapshot } from "firebase/firestore"
import useFirebaseProject from "../use_firebase_project"
import useFirebaseTtrpgSessions from "./use_firebase_ttrpg_sessions"
import useFirebaseTtrpgMembers from "./use_firebase_ttrpg_members"
import useFirebaseTtrpgSessionNotes from "./use_firebase_ttrpg_session_notes"
import useFirebaseTtrpgLore from "./use_firebase_ttrpg_lore"
import useFirebaseTtrpgQuests from "./use_firebase_ttrpg_quests"
import useFirebaseTtrpgProjects from "./use_firebase_ttrpg_projects"
import useFirebaseTtrpgPartyResources from "./use_firebase_ttrpg_party_resources"
import TtrpgSession from "../../types/ttrpg/TtrpgSession"
import TtrpgMember from "../../types/ttrpg/TtrpgMember"
import TtrpgSessionNote from "../../types/ttrpg/TtrpgSessionNote"
import TtrpgLoreEntry from "../../types/ttrpg/TtrpgLoreEntry"
import TtrpgQuest from "../../types/ttrpg/TtrpgQuest"
import TtrpgProject from "../../types/ttrpg/TtrpgProject"
import { TtrpgProjectContribution } from "../../types/ttrpg/TtrpgProject"
import TtrpgPartyResources from "../../types/ttrpg/TtrpgPartyResources"
import { assignSessionNumbers } from "../../utility/ttrpg_session_helpers"
import { DEFAULT_PARTY_RESOURCES } from "../../configs/ttrpg_constants"
import {
    TtrpgCampaignData,
    parseSessionsMap, parseMembersMap, parseNotesMap,
    parseLoreMap, parseQuestsMap, parseProjectsMap, parsePartyResources
} from "../../utility/ttrpg_campaign_parsers"

export default function useTtrpgCampaignData() {
    const db = getFirestore(useFirebaseProject())
    const rawSessionsHook = useFirebaseTtrpgSessions()
    const rawMembersHook = useFirebaseTtrpgMembers()
    const rawNotesHook = useFirebaseTtrpgSessionNotes()
    const rawLoreHook = useFirebaseTtrpgLore()
    const rawQuestsHook = useFirebaseTtrpgQuests()
    const rawProjectsHook = useFirebaseTtrpgProjects()
    const rawPartyResourcesHook = useFirebaseTtrpgPartyResources()

    const campaignIdRef = useRef<string>("")

    const [data, setData] = useState<TtrpgCampaignData>({
        sessions: [],
        members: [],
        notes: [],
        lore: [],
        quests: [],
        projects: [],
        partyResources: { ...DEFAULT_PARTY_RESOURCES }
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

    // Adapter: wraps the quests hook — injects campaignId
    const questsHook = {
        createQuest: (quest: Omit<TtrpgQuest, 'id' | 'campaign_id'>) =>
            rawQuestsHook.createQuest(campaignIdRef.current, quest),
        updateQuest: (id: string, quest: Partial<Omit<TtrpgQuest, 'id' | 'campaign_id'>>) =>
            rawQuestsHook.updateQuest(campaignIdRef.current, id, quest),
        deleteQuest: (id: string) =>
            rawQuestsHook.deleteQuest(campaignIdRef.current, id),
    }

    // Adapter: wraps the projects hook — injects campaignId
    const projectsHook = {
        createProject: (project: Pick<TtrpgProject, 'title' | 'description' | 'point_total'>) =>
            rawProjectsHook.createProject(campaignIdRef.current, project),
        updateProject: (id: string, updates: Partial<Omit<TtrpgProject, 'id' | 'campaign_id'>>) =>
            rawProjectsHook.updateProject(campaignIdRef.current, id, updates),
        addContribution: (...args: Parameters<typeof rawProjectsHook.addContribution> extends [string, ...infer R] ? R : never) =>
            rawProjectsHook.addContribution(campaignIdRef.current, ...args),
        updateContributions: (projectId: string, contributions: TtrpgProjectContribution[]) =>
            rawProjectsHook.updateContributions(campaignIdRef.current, projectId, contributions),
        deleteProject: (id: string) =>
            rawProjectsHook.deleteProject(campaignIdRef.current, id),
    }

    function subscribe(campaignId: string) {
        campaignIdRef.current = campaignId
        setIsLoading(true)

        const docRef = doc(db, "ttrpg_campaigns", campaignId)
        const unsub = onSnapshot(docRef, (snapshot) => {
            if (!snapshot.exists()) {
                setData({ sessions: [], members: [], notes: [], lore: [], quests: [], projects: [], partyResources: { ...DEFAULT_PARTY_RESOURCES } })
                setIsLoading(false)
                return
            }
            const docData = snapshot.data()

            const rawSessions = parseSessionsMap(campaignId, docData.sessions || {})
            const sessions = assignSessionNumbers(rawSessions)
            const members = parseMembersMap(campaignId, docData.members || {})
            const notes = parseNotesMap(campaignId, docData.notes || {})
            const lore = parseLoreMap(campaignId, docData.lore || {})
            const quests = parseQuestsMap(campaignId, docData.quests || {})
            const projects = parseProjectsMap(campaignId, docData.projects || {})
            const partyResources = parsePartyResources(docData.party_resources)

            setData({ sessions, members, notes, lore, quests, projects, partyResources })
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

    // Adapter: wraps the party resources hook — injects campaignId
    const partyResourcesHook = {
        updatePartyResources: (updates: Partial<TtrpgPartyResources>) =>
            rawPartyResourcesHook.updatePartyResources(campaignIdRef.current, updates),
        assignItemToMember: rawPartyResourcesHook.assignItemToMember,
        unassignItemFromMember: rawPartyResourcesHook.unassignItemFromMember,
        assignFollowerToMember: rawPartyResourcesHook.assignFollowerToMember,
        unassignFollowerFromMember: rawPartyResourcesHook.unassignFollowerFromMember,
    }

    function updateMembers(updater: (members: TtrpgMember[]) => TtrpgMember[]) {
        setData(prev => ({ ...prev, members: updater(prev.members) }))
    }

    function updateSessions(updater: (sessions: TtrpgSession[]) => TtrpgSession[]) {
        setData(prev => ({ ...prev, sessions: updater(prev.sessions) }))
    }

    function updateQuests(updater: (quests: TtrpgQuest[]) => TtrpgQuest[]) {
        setData(prev => ({ ...prev, quests: updater(prev.quests) }))
    }

    function updateProjects(updater: (projects: TtrpgProject[]) => TtrpgProject[]) {
        setData(prev => ({ ...prev, projects: updater(prev.projects) }))
    }

    function updatePartyResources(updater: (pr: TtrpgPartyResources) => TtrpgPartyResources) {
        setData(prev => ({ ...prev, partyResources: updater(prev.partyResources) }))
    }

    return {
        data,
        isLoading,
        subscribe,
        updateMembers,
        updateSessions,
        updateQuests,
        updateProjects,
        updatePartyResources,
        sessionsHook,
        membersHook,
        notesHook,
        loreHook,
        questsHook,
        projectsHook,
        partyResourcesHook
    }
}
