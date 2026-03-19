import { LoreEntryType } from "../types/ttrpg/TtrpgLoreEntry"

export const LORE_COLORS: Record<LoreEntryType, string> = {
    person: "#e8f0fe",
    item: "#fef7e0",
    place: "#e6f4ea",
    faction: "#fce4ec"
}

export const LORE_LABELS: Record<LoreEntryType, string> = {
    person: "Person",
    item: "Item",
    place: "Place",
    faction: "Faction"
}

export const ALL_LORE_TYPES: LoreEntryType[] = ["person", "item", "place", "faction"]
