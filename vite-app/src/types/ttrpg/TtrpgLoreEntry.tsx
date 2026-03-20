export type LoreEntryType = "person" | "item" | "place" | "faction"

export default interface TtrpgLoreEntry {
    id: string
    campaign_id: string
    type: LoreEntryType
    name: string
    subtitle: string
    created_at: string
    session_id?: string
}
