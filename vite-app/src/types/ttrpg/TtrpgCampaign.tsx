import { TtrpgMemberItem } from "./TtrpgMember"
import { LoreEntryType } from "./TtrpgLoreEntry"

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
}

export interface TtrpgLoreData {
    type: LoreEntryType
    name: string
    notes: string
    created_at?: string
    session_id?: string
}

export interface TtrpgNoteData {
    session_id: string
    text: string
    author: string
    created_at: string
    updated_at: string
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
}
