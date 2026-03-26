import TtrpgLoreEntry from "../../types/ttrpg/TtrpgLoreEntry"
import { LORE_COLORS } from "../../configs/ttrpg_constants"
import { themeStyles } from "../../configs/ttrpg_theme"

interface LoreFactionMembersProps {
    factionMembers: TtrpgLoreEntry[]
    openLoreDetail: (entryId: string) => void
    onAddPersonToFaction?: (factionId: string) => void
    factionId: string
}

export default function LoreFactionMembers({
    factionMembers, openLoreDetail, onAddPersonToFaction, factionId
}: LoreFactionMembersProps) {
    return (
        <div style={{ ...themeStyles.sectionDivider, marginBottom: "0.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <strong>Members{factionMembers.length > 0 ? ` (${factionMembers.length})` : ""}</strong>
                {onAddPersonToFaction && (
                    <button
                        onClick={() => onAddPersonToFaction(factionId)}
                        style={{ backgroundColor: LORE_COLORS.person, color: "#222", border: "1px solid #ccc", borderRadius: "4px", padding: "0.25rem 0.5rem", cursor: "pointer", fontSize: "0.85rem" }}
                    >
                        + Person
                    </button>
                )}
            </div>
            {factionMembers.map(member => (
                <div
                    key={member.id}
                    onClick={() => openLoreDetail(member.id)}
                    style={{
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        padding: "0.5rem",
                        marginTop: "0.5rem",
                        backgroundColor: LORE_COLORS.person,
                        cursor: "pointer",
                        color: "#333"
                    }}
                >
                    <div style={{ display: "flex", alignItems: "baseline", overflow: "hidden" }}>
                        <strong style={{ flexShrink: 0 }}>{member.name}</strong>
                        {member.subtitle && (
                            <span style={{ color: "#666", marginLeft: "0.5rem", fontStyle: "italic", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{member.subtitle}</span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}
