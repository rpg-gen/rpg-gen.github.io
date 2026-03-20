import TtrpgLoreEntry from "../types/ttrpg/TtrpgLoreEntry"

export function filterLoreBySearch(entries: TtrpgLoreEntry[], searchText: string): TtrpgLoreEntry[] {
    const trimmed = searchText.trim().toLowerCase()
    if (!trimmed) return entries

    const words = trimmed.split(/\s+/)
    return entries.filter(entry => {
        const name = entry.name.toLowerCase()
        const subtitle = entry.subtitle.toLowerCase()
        return words.every(word => name.includes(word) || subtitle.includes(word))
    })
}
