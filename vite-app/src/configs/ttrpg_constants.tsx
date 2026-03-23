import { LoreEntryType } from "../types/ttrpg/TtrpgLoreEntry"
import TtrpgPartyResources from "../types/ttrpg/TtrpgPartyResources"
import { ttrpg } from "./ttrpg_theme"

export const LORE_COLORS: Record<LoreEntryType, string> = {
    person: ttrpg.colors.person,
    item: ttrpg.colors.item,
    place: ttrpg.colors.place,
    faction: ttrpg.colors.faction,
}

export const LORE_LABELS: Record<LoreEntryType, string> = {
    person: "Person",
    item: "Item",
    place: "Place",
    faction: "Faction"
}

export const LORE_LABELS_PLURAL: Record<LoreEntryType, string> = {
    person: "People",
    item: "Items",
    place: "Places",
    faction: "Factions"
}

export const ALL_LORE_TYPES: LoreEntryType[] = ["person", "item", "place", "faction"]

export const DEFAULT_PARTY_RESOURCES: TtrpgPartyResources = {
    hero_tokens: 0,
    victories: 0,
    exp: 0,
    unassigned_items: [],
    unassigned_followers: []
}

export const QUEST_COLOR = ttrpg.colors.quest
export const QUEST_LABEL = "Quest"

export const PROJECT_COLOR = ttrpg.colors.project
export const PROJECT_LABEL = "Project"

export const FOLLOWER_TYPES = ["sage", "crafter"] as const

export const FOLLOWER_LABELS: Record<string, string> = {
    sage: "Sage",
    crafter: "Crafter"
}
