import TtrpgLoreEntry from "../../types/ttrpg/TtrpgLoreEntry"
import TtrpgMember from "../../types/ttrpg/TtrpgMember"
import { LORE_COLORS } from "../../configs/ttrpg_constants"

const MEMBER_COLOR = "#f3e8ff"

interface LoreNoteTextProps {
    text: string
    loreEntries: TtrpgLoreEntry[]
    members: TtrpgMember[]
    onLoreClick: (entryId: string) => void
    onMemberClick: (memberId: string) => void
}

export default function LoreNoteText({ text, loreEntries, members, onLoreClick, onMemberClick }: LoreNoteTextProps) {
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
