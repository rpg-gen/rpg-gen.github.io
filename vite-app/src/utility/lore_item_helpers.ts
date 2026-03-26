import TtrpgMember from "../types/ttrpg/TtrpgMember"
import TtrpgLoreEntry from "../types/ttrpg/TtrpgLoreEntry"

export function findLoreItemHolder(
    loreId: string,
    members: TtrpgMember[]
): { member: TtrpgMember; itemIndex: number } | undefined {
    for (const member of members) {
        const itemIndex = member.items.findIndex(i => i.lore_id === loreId)
        if (itemIndex >= 0) return { member, itemIndex }
    }
    return undefined
}

export function getUnassignedLoreItems(
    lore: TtrpgLoreEntry[],
    members: TtrpgMember[]
): TtrpgLoreEntry[] {
    const heldLoreIds = new Set<string>()
    for (const member of members) {
        for (const item of member.items) {
            if (item.lore_id) heldLoreIds.add(item.lore_id)
        }
    }
    return lore.filter(l => l.type === "item" && !heldLoreIds.has(l.id))
}
