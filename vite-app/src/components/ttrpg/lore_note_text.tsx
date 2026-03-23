import TtrpgLoreEntry from "../../types/ttrpg/TtrpgLoreEntry"
import TtrpgMember from "../../types/ttrpg/TtrpgMember"
import TtrpgQuest from "../../types/ttrpg/TtrpgQuest"
import TtrpgProject from "../../types/ttrpg/TtrpgProject"
import { LORE_COLORS, QUEST_COLOR, PROJECT_COLOR } from "../../configs/ttrpg_constants"
import { ttrpg, themeStyles } from "../../configs/ttrpg_theme"

const MEMBER_COLOR = ttrpg.colors.member

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
                            className="ttrpg-pill"
                            onClick={(e) => { e.stopPropagation(); onMemberClick(member.id) }}
                            style={{ ...themeStyles.pill, backgroundColor: MEMBER_COLOR, color: ttrpg.colors.textDark }}
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
                            className="ttrpg-pill"
                            onClick={(e) => { e.stopPropagation(); onQuestClick?.(quest.id) }}
                            style={{ ...themeStyles.pill, backgroundColor: QUEST_COLOR, color: ttrpg.colors.textDark }}
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
                            className="ttrpg-pill"
                            onClick={(e) => { e.stopPropagation(); onProjectClick?.(project.id) }}
                            style={{ ...themeStyles.pill, backgroundColor: PROJECT_COLOR, color: ttrpg.colors.textDark }}
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
                            className="ttrpg-pill"
                            onClick={(e) => { e.stopPropagation(); onLoreClick(entry.id) }}
                            style={{ ...themeStyles.pill, backgroundColor: LORE_COLORS[entry.type], color: ttrpg.colors.textDark }}
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
                            ...themeStyles.pill,
                            backgroundColor: ttrpg.colors.brokenLinkBg,
                            color: ttrpg.colors.brokenLinkText,
                            cursor: "default",
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
