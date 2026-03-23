import TtrpgSession from "../types/ttrpg/TtrpgSession"
import TtrpgMember, { TtrpgMemberStatus } from "../types/ttrpg/TtrpgMember"
import TtrpgSessionNote from "../types/ttrpg/TtrpgSessionNote"
import TtrpgLoreEntry from "../types/ttrpg/TtrpgLoreEntry"
import TtrpgQuest from "../types/ttrpg/TtrpgQuest"
import TtrpgProject from "../types/ttrpg/TtrpgProject"
import { TtrpgProjectData } from "../types/ttrpg/TtrpgProject"
import TtrpgPartyResources from "../types/ttrpg/TtrpgPartyResources"
import { TtrpgSessionData, TtrpgMemberData, TtrpgNoteData, TtrpgLoreData, TtrpgQuestData, TtrpgPartyResourcesData } from "../types/ttrpg/TtrpgCampaign"

export interface TtrpgCampaignData {
    sessions: TtrpgSession[]
    members: TtrpgMember[]
    notes: TtrpgSessionNote[]
    lore: TtrpgLoreEntry[]
    quests: TtrpgQuest[]
    projects: TtrpgProject[]
    partyResources: TtrpgPartyResources
}

export function parseSessionsMap(campaignId: string, map: Record<string, TtrpgSessionData>): TtrpgSession[] {
    return Object.entries(map).map(([id, s]) => ({
        id,
        campaign_id: campaignId,
        session_number: s.session_number,
        date: s.date,
        title: s.title,
        respite_count: s.respite_count
    })).sort((a, b) => a.date.localeCompare(b.date))
}

export function parseMembersMap(campaignId: string, map: Record<string, TtrpgMemberData>): TtrpgMember[] {
    return Object.entries(map).map(([id, m]) => ({
        id,
        campaign_id: campaignId,
        name: m.name,
        played_by: m.played_by,
        notes: m.notes,
        items: m.items || [],
        wealth: m.wealth ?? 0,
        renown: m.renown ?? 0,
        followers: m.followers || [],
        titles: m.titles || [],
        statuses: (m.statuses || []).map((s: string | TtrpgMemberStatus) => typeof s === "string" ? { name: s, color: "#4a9e8e" } : s)
    })).sort((a, b) => a.name.localeCompare(b.name))
}

export function parsePartyResources(data: TtrpgPartyResourcesData | undefined): TtrpgPartyResources {
    return {
        hero_tokens: data?.hero_tokens ?? 0,
        victories: data?.victories ?? 0,
        exp: data?.exp ?? 0,
        unassigned_items: data?.unassigned_items || [],
        unassigned_followers: data?.unassigned_followers || []
    }
}

export function parseNotesMap(campaignId: string, map: Record<string, TtrpgNoteData>): TtrpgSessionNote[] {
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

export function parseLoreMap(campaignId: string, map: Record<string, TtrpgLoreData>): TtrpgLoreEntry[] {
    return Object.entries(map).map(([id, l]) => ({
        id,
        campaign_id: campaignId,
        type: l.type,
        name: l.name,
        subtitle: l.notes,
        created_at: l.created_at || "",
        ...(l.session_id ? { session_id: l.session_id } : {}),
        ...(l.faction_id ? { faction_id: l.faction_id } : {})
    })).reverse()
}

export function parseQuestsMap(campaignId: string, map: Record<string, TtrpgQuestData>): TtrpgQuest[] {
    return Object.entries(map).map(([id, q]) => ({
        id,
        campaign_id: campaignId,
        short_title: q.short_title,
        description: q.description || "",
        completed: q.completed ?? false,
        created_at: q.created_at || "",
        ...(q.session_id ? { session_id: q.session_id } : {})
    }))
}

export function parseProjectsMap(campaignId: string, map: Record<string, TtrpgProjectData>): TtrpgProject[] {
    return Object.entries(map).map(([id, p]) => ({
        id,
        campaign_id: campaignId,
        title: p.title,
        description: p.description || "",
        point_total: p.point_total,
        current_points: p.current_points ?? 0,
        completed: p.completed ?? false,
        created_at: p.created_at || "",
        contributions: p.contributions || [],
        last_contributed_at: p.last_contributed_at || ""
    }))
}
