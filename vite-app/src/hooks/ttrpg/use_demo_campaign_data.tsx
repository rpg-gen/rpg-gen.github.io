import { useState, useRef, useCallback } from "react"
import TtrpgSession from "../../types/ttrpg/TtrpgSession"
import TtrpgMember from "../../types/ttrpg/TtrpgMember"
import TtrpgQuest from "../../types/ttrpg/TtrpgQuest"
import TtrpgProject from "../../types/ttrpg/TtrpgProject"
import TtrpgPartyResources from "../../types/ttrpg/TtrpgPartyResources"
import { DEFAULT_PARTY_RESOURCES } from "../../configs/ttrpg_constants"
import { assignSessionNumbers } from "../../utility/ttrpg_session_helpers"
import { readDemoCampaign, writeDemoCampaign } from "./demo_storage"
import {
    TtrpgCampaignData,
    parseSessionsMap, parseMembersMap, parseNotesMap,
    parseLoreMap, parseQuestsMap, parseProjectsMap, parsePartyResources,
} from "../../utility/ttrpg_campaign_parsers"
import {
    createDemoSessionsHook, createDemoMembersHook, createDemoNotesHook,
    createDemoLoreHook, createDemoQuestsHook, createDemoProjectsHook,
    createDemoPartyResourcesHook,
} from "./demo_crud_hooks"

export default function useDemoCampaignData() {
    const campaignIdRef = useRef("")

    const [data, setData] = useState<TtrpgCampaignData>({
        sessions: [], members: [], notes: [], lore: [],
        quests: [], projects: [],
        partyResources: { ...DEFAULT_PARTY_RESOURCES },
    })
    const [isLoading, setIsLoading] = useState(false)

    const refreshData = useCallback(() => {
        const raw = readDemoCampaign()
        const cid = campaignIdRef.current
        const rawSessions = parseSessionsMap(cid, raw.sessions || {})
        setData({
            sessions: assignSessionNumbers(rawSessions),
            members: parseMembersMap(cid, raw.members || {}),
            notes: parseNotesMap(cid, raw.notes || {}),
            lore: parseLoreMap(cid, raw.lore || {}),
            quests: parseQuestsMap(cid, raw.quests || {}),
            projects: parseProjectsMap(cid, raw.projects || {}),
            partyResources: parsePartyResources(raw.party_resources),
        })
    }, [])

    function subscribe(campaignId: string) {
        campaignIdRef.current = campaignId
        setIsLoading(true)
        refreshData()
        setIsLoading(false)
        return () => {} // noop unsubscribe
    }

    const sessionsHook = createDemoSessionsHook(readDemoCampaign, writeDemoCampaign, refreshData)
    const membersHook = createDemoMembersHook(readDemoCampaign, writeDemoCampaign, refreshData)

    const rawNotesHook = createDemoNotesHook(readDemoCampaign, writeDemoCampaign, refreshData)
    const notesHook = {
        getNotesByCampaign: rawNotesHook.getNotesByCampaign,
        createNote: (note: { session_id: string; text: string; author: string }) =>
            rawNotesHook.createNote(campaignIdRef.current, note),
        updateNote: (id: string, note: Parameters<typeof rawNotesHook.updateNote>[2]) =>
            rawNotesHook.updateNote(campaignIdRef.current, id, note),
        deleteNote: (id: string) =>
            rawNotesHook.deleteNote(campaignIdRef.current, id),
    }

    const rawLoreHook = createDemoLoreHook(readDemoCampaign, writeDemoCampaign, refreshData)
    const loreHook = {
        getLoreByCampaign: rawLoreHook.getLoreByCampaign,
        createLoreEntry: (entry: Parameters<typeof rawLoreHook.createLoreEntry>[1]) =>
            rawLoreHook.createLoreEntry(campaignIdRef.current, entry),
        updateLoreEntry: (id: string, entry: Parameters<typeof rawLoreHook.updateLoreEntry>[2]) =>
            rawLoreHook.updateLoreEntry(campaignIdRef.current, id, entry),
        deleteLoreEntry: (id: string) =>
            rawLoreHook.deleteLoreEntry(campaignIdRef.current, id),
    }

    const rawQuestsHook = createDemoQuestsHook(readDemoCampaign, writeDemoCampaign, refreshData)
    const questsHook = {
        createQuest: (quest: Parameters<typeof rawQuestsHook.createQuest>[1]) =>
            rawQuestsHook.createQuest(campaignIdRef.current, quest),
        updateQuest: (id: string, quest: Parameters<typeof rawQuestsHook.updateQuest>[2]) =>
            rawQuestsHook.updateQuest(campaignIdRef.current, id, quest),
        deleteQuest: (id: string) =>
            rawQuestsHook.deleteQuest(campaignIdRef.current, id),
    }

    const rawProjectsHook = createDemoProjectsHook(readDemoCampaign, writeDemoCampaign, refreshData)
    const projectsHook = {
        createProject: (project: Parameters<typeof rawProjectsHook.createProject>[1]) =>
            rawProjectsHook.createProject(campaignIdRef.current, project),
        updateProject: (id: string, updates: Parameters<typeof rawProjectsHook.updateProject>[2]) =>
            rawProjectsHook.updateProject(campaignIdRef.current, id, updates),
        addContribution: (...args: Parameters<typeof rawProjectsHook.addContribution> extends [string, ...infer R] ? R : never) =>
            rawProjectsHook.addContribution(campaignIdRef.current, ...args),
        updateContributions: (projectId: string, contributions: Parameters<typeof rawProjectsHook.updateContributions>[2]) =>
            rawProjectsHook.updateContributions(campaignIdRef.current, projectId, contributions),
        deleteProject: (id: string) =>
            rawProjectsHook.deleteProject(campaignIdRef.current, id),
    }

    const rawPartyResourcesHook = createDemoPartyResourcesHook(readDemoCampaign, writeDemoCampaign, refreshData)
    const partyResourcesHook = {
        updatePartyResources: rawPartyResourcesHook.updatePartyResources,
        assignItemToMember: rawPartyResourcesHook.assignItemToMember,
        unassignItemFromMember: rawPartyResourcesHook.unassignItemFromMember,
        assignFollowerToMember: rawPartyResourcesHook.assignFollowerToMember,
        unassignFollowerFromMember: rawPartyResourcesHook.unassignFollowerFromMember,
    }

    function updateMembers(updater: (m: TtrpgMember[]) => TtrpgMember[]) {
        setData(prev => ({ ...prev, members: updater(prev.members) }))
    }
    function updateSessions(updater: (s: TtrpgSession[]) => TtrpgSession[]) {
        setData(prev => ({ ...prev, sessions: updater(prev.sessions) }))
    }
    function updateQuests(updater: (q: TtrpgQuest[]) => TtrpgQuest[]) {
        setData(prev => ({ ...prev, quests: updater(prev.quests) }))
    }
    function updateProjects(updater: (p: TtrpgProject[]) => TtrpgProject[]) {
        setData(prev => ({ ...prev, projects: updater(prev.projects) }))
    }
    function updatePartyResources(updater: (pr: TtrpgPartyResources) => TtrpgPartyResources) {
        setData(prev => ({ ...prev, partyResources: updater(prev.partyResources) }))
    }

    return {
        data, isLoading, subscribe,
        updateMembers, updateSessions, updateQuests, updateProjects, updatePartyResources,
        sessionsHook, membersHook, notesHook, loreHook, questsHook, projectsHook, partyResourcesHook,
    }
}
