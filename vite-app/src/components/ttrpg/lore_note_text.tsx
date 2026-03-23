import TtrpgLoreEntry from "../../types/ttrpg/TtrpgLoreEntry"
import TtrpgMember from "../../types/ttrpg/TtrpgMember"
import TtrpgQuest from "../../types/ttrpg/TtrpgQuest"
import TtrpgProject from "../../types/ttrpg/TtrpgProject"
import { LORE_COLORS, QUEST_COLOR, PROJECT_COLOR } from "../../configs/ttrpg_constants"

const MEMBER_COLOR = "#f3e8ff"

interface LoreNoteTextProps {
    text: string
    loreEntries: TtrpgLoreEntry[]
    members: TtrpgMember[]
    quests?: TtrpgQuest[]
    projects?: TtrpgProject[]
    onLoreClick: (entryId: string) => void
    onMemberClick: (memberId: string) => void
    onQuestClick?: (questId: string) => void
    onProjectClick?: (projectId: string) => void
}

export default function LoreNoteText({ text, loreEntries, members, quests, projects, onLoreClick, onMemberClick, onQuestClick, onProjectClick }: LoreNoteTextProps) {
    // Split on [[Name]] markers
    const parts = text.split(/(\[\[.+?\]\])/)

    return (
        <span>
            {parts.map((part, i) => {
                const match = part.match(/^\[\[(.+?)\]\]$/)
                if (!match) return <span key={i}>{part}</span>

                const name = match[1]

                // Check members first
                const member = members.find(m => m.name.toLowerCase() === name.toLowerCase())
                if (member) {
                    return (
                        <span
                            key={i}
                            onClick={(e) => { e.stopPropagation(); onMemberClick(member.id) }}
                            style={{
                                backgroundColor: MEMBER_COLOR,
                                color: "#222",
                                fontWeight: "bold",
                                padding: "0.1rem 0.3rem",
                                borderRadius: "3px",
                                cursor: "pointer"
                            }}
                        >
                            {member.name}
                        </span>
                    )
                }

                // Then check quests
                const quest = quests?.find(q => q.short_title.toLowerCase() === name.toLowerCase())
                if (quest) {
                    return (
                        <span
                            key={i}
                            onClick={(e) => { e.stopPropagation(); onQuestClick?.(quest.id) }}
                            style={{
                                backgroundColor: QUEST_COLOR,
                                color: "#222",
                                fontWeight: "bold",
                                padding: "0.1rem 0.3rem",
                                borderRadius: "3px",
                                cursor: "pointer"
                            }}
                        >
                            {quest.short_title}
                        </span>
                    )
                }

                // Then check projects
                const project = projects?.find(p => p.title.toLowerCase() === name.toLowerCase())
                if (project) {
                    return (
                        <span
                            key={i}
                            onClick={(e) => { e.stopPropagation(); onProjectClick?.(project.id) }}
                            style={{
                                backgroundColor: PROJECT_COLOR,
                                color: "#222",
                                fontWeight: "bold",
                                padding: "0.1rem 0.3rem",
                                borderRadius: "3px",
                                cursor: "pointer"
                            }}
                        >
                            {project.title}
                        </span>
                    )
                }

                // Then check lore
                const entry = loreEntries.find(e => e.name.toLowerCase() === name.toLowerCase())
                if (entry) {
                    return (
                        <span
                            key={i}
                            onClick={(e) => { e.stopPropagation(); onLoreClick(entry.id) }}
                            style={{
                                backgroundColor: LORE_COLORS[entry.type],
                                color: "#222",
                                fontWeight: "bold",
                                padding: "0.1rem 0.3rem",
                                borderRadius: "3px",
                                cursor: "pointer"
                            }}
                        >
                            {entry.name}
                        </span>
                    )
                }

                // No match — render in red to indicate broken link
                return (
                    <span
                        key={i}
                        style={{
                            backgroundColor: "#fde8e8",
                            color: "#c0392b",
                            fontWeight: "bold",
                            padding: "0.1rem 0.3rem",
                            borderRadius: "3px"
                        }}
                        title="No matching lore entry or player"
                    >
                        {name}
                    </span>
                )
            })}
        </span>
    )
}
