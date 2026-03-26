import { TtrpgCampaignData } from "./ttrpg_campaign_parsers"

export interface SearchResult {
    type: "lore" | "quest" | "project" | "member" | "session" | "note"
    id: string
    title: string
    subtitle: string
    sessionId?: string
    noteId?: string
}

export interface GroupedSearchResults {
    lore: SearchResult[]
    quests: SearchResult[]
    projects: SearchResult[]
    members: SearchResult[]
    sessions: SearchResult[]
    notes: SearchResult[]
}

function matchesAllWords(words: string[], ...fields: string[]): boolean {
    return words.every(word => fields.some(f => f.toLowerCase().includes(word)))
}

function snippetAround(text: string, word: string, maxLen = 100): string {
    const lower = text.toLowerCase()
    const idx = lower.indexOf(word)
    if (idx === -1) return text.slice(0, maxLen)
    const start = Math.max(0, idx - 40)
    const end = Math.min(text.length, idx + word.length + 60)
    let snippet = text.slice(start, end).replace(/\n/g, " ")
    if (start > 0) snippet = "..." + snippet
    if (end < text.length) snippet = snippet + "..."
    return snippet
}

export function searchCampaign(data: TtrpgCampaignData, searchText: string): GroupedSearchResults {
    const trimmed = searchText.trim().toLowerCase()
    const empty: GroupedSearchResults = { lore: [], quests: [], projects: [], members: [], sessions: [], notes: [] }
    if (trimmed.length < 2) return empty

    const words = trimmed.split(/\s+/)
    const results: GroupedSearchResults = { lore: [], quests: [], projects: [], members: [], sessions: [], notes: [] }

    for (const entry of data.lore) {
        if (matchesAllWords(words, entry.name, entry.subtitle)) {
            results.lore.push({
                type: "lore", id: entry.id, title: entry.name,
                subtitle: entry.type + (entry.subtitle ? " - " + entry.subtitle : ""),
            })
        }
    }

    for (const quest of data.quests) {
        if (matchesAllWords(words, quest.short_title, quest.description)) {
            results.quests.push({
                type: "quest", id: quest.id, title: quest.short_title,
                subtitle: quest.completed ? "Completed" : "Active",
            })
        }
    }

    for (const project of data.projects) {
        if (matchesAllWords(words, project.title, project.description)) {
            results.projects.push({
                type: "project", id: project.id, title: project.title,
                subtitle: `${project.current_points}/${project.point_total} points` + (project.completed ? " - Completed" : ""),
            })
        }
    }

    for (const member of data.members) {
        // Only show member if name or played_by directly matches
        if (matchesAllWords(words, member.name, member.played_by)) {
            results.members.push({
                type: "member", id: member.id, title: member.name,
                subtitle: member.played_by,
            })
        }

        // Show matching sub-items individually with member context
        for (const item of member.items) {
            if (matchesAllWords(words, item.name)) {
                results.members.push({
                    type: "member", id: `${member.id}:item:${item.name}`,
                    title: item.name, subtitle: `${member.name}'s item`,
                })
            }
        }
        for (const follower of member.followers) {
            if (matchesAllWords(words, follower.name)) {
                results.members.push({
                    type: "member", id: `${member.id}:follower:${follower.name}`,
                    title: follower.name, subtitle: `${member.name}'s follower`,
                })
            }
        }
        for (const title of member.titles) {
            if (matchesAllWords(words, title.name)) {
                results.members.push({
                    type: "member", id: `${member.id}:title:${title.name}`,
                    title: title.name, subtitle: `${member.name}'s title`,
                })
            }
        }
    }

    const sessionMap = new Map(data.sessions.map(s => [s.id, s]))

    for (const session of data.sessions) {
        if (!session.title) continue
        if (matchesAllWords(words, session.title)) {
            results.sessions.push({
                type: "session", id: session.id,
                title: `Session #${session.session_number}` + (session.title ? ` - ${session.title}` : ""),
                subtitle: session.date,
            })
        }
    }

    // Collect entity names for deduplication
    const entityNames = new Set<string>()
    for (const e of data.lore) entityNames.add(e.name.toLowerCase())
    for (const q of data.quests) entityNames.add(q.short_title.toLowerCase())
    for (const p of data.projects) entityNames.add(p.title.toLowerCase())
    for (const m of data.members) entityNames.add(m.name.toLowerCase())

    const shouldDedup = entityNames.has(trimmed)

    for (const note of data.notes) {
        if (!matchesAllWords(words, note.text)) continue

        if (shouldDedup) {
            const bracketPattern = new RegExp(`\\[\\[${trimmed}\\]\\]`, "gi")
            const textWithoutBrackets = note.text.replace(bracketPattern, "")
            if (!matchesAllWords(words, textWithoutBrackets)) continue
        }

        const session = sessionMap.get(note.session_id)
        results.notes.push({
            type: "note", id: note.id,
            title: snippetAround(note.text, words[0]),
            subtitle: session ? `Session #${session.session_number}` : "Unknown session",
            sessionId: note.session_id,
            noteId: note.id,
        })
    }

    return results
}
