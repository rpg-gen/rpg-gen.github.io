import { TtrpgMemberItem, TtrpgMemberFollower, TtrpgMemberTitle, TtrpgMemberStatus } from "./TtrpgMember"
import { LoreEntryType } from "./TtrpgLoreEntry"
import { TtrpgProjectData } from "./TtrpgProject"

export interface TtrpgSessionData {
    session_number: number
    date: string
    title?: string
    respite_count: number
}

export interface TtrpgMemberData {
    name: string
    played_by: string
    notes: string
    items: TtrpgMemberItem[]
    wealth?: number
    renown?: number
    followers?: TtrpgMemberFollower[]
    titles?: TtrpgMemberTitle[]
    statuses?: (string | TtrpgMemberStatus)[]
}

export interface TtrpgLoreData {
    type: LoreEntryType
    name: string
    notes: string
    created_at?: string
    session_id?: string
    faction_id?: string
}

export interface TtrpgNoteData {
    session_id: string
    text: string
    author: string
    created_at: string
    updated_at: string
}

export interface TtrpgQuestData {
    short_title: string
    description: string
    session_id?: string
    completed?: boolean
    created_at?: string
}

export interface TtrpgPartyResourcesData {
    hero_tokens?: number
    victories?: number
    exp?: number
    unassigned_items?: TtrpgMemberItem[]
    unassigned_followers?: TtrpgMemberFollower[]
}

export default interface TtrpgCampaign {
    id: string
    name: string
    created_at: string
    created_by: string
    sessions?: Record<string, TtrpgSessionData>
    members?: Record<string, TtrpgMemberData>
    lore?: Record<string, TtrpgLoreData>
    notes?: Record<string, TtrpgNoteData>
    quests?: Record<string, TtrpgQuestData>
    projects?: Record<string, TtrpgProjectData>
    party_resources?: TtrpgPartyResourcesData
}
