import TtrpgMember from "../../types/ttrpg/TtrpgMember"
import { primaryButtonStyle } from "../../pages/ttrpg/campaign_detail_styles"
import { ttrpg, themeStyles } from "../../configs/ttrpg_theme"

interface MemberListProps {
    members: TtrpgMember[]
    onSelect: (memberId: string) => void
    onAdd: () => void
}

export default function MemberList({ members, onSelect, onAdd }: MemberListProps) {
    if (members.length === 0) {
        return (
            <div>
                <div style={{ textAlign: "center", padding: "2rem", color: "#666" }}>No party members yet.</div>
                <div style={{ marginTop: "1rem" }}>
                    <button onClick={onAdd} className="ttrpg-btn-primary" style={primaryButtonStyle}>Add Party Member</button>
                </div>
            </div>
        )
    }

    return (
        <div>
            {members.map(member => {
                const itemCount = member.items.reduce((sum, i) => sum + i.quantity, 0)
                const followerCount = member.followers.length
                const titleCount = member.titles.length
                const counts = [
                    itemCount > 0 ? `${itemCount} item${itemCount !== 1 ? "s" : ""}` : null,
                    followerCount > 0 ? `${followerCount} follower${followerCount !== 1 ? "s" : ""}` : null,
                    titleCount > 0 ? `${titleCount} title${titleCount !== 1 ? "s" : ""}` : null,
                ].filter(Boolean).join(" · ")

                return (
                    <div key={member.id} className="ttrpg-card"
                        style={{ ...themeStyles.entityCard(ttrpg.colors.member), cursor: "pointer", display: "flex", alignItems: "center", gap: "0.75rem" }}
                        onClick={() => onSelect(member.id)}>
                        <div className="ttrpg-initial-badge" style={themeStyles.initialBadge(ttrpg.colors.member)}>
                            {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ marginBottom: "0.25rem" }}>
                                <strong>{member.name}</strong>
                                {member.played_by && <span style={{ fontStyle: "italic", color: ttrpg.colors.textMuted, marginLeft: "0.35rem" }}>({member.played_by})</span>}
                            </div>
                            {member.statuses.length > 0 && (
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem", marginBottom: "0.25rem" }}>
                                    {member.statuses.map(status => (
                                        <span key={status.name} style={{
                                            fontSize: "0.7rem", fontWeight: 600,
                                            padding: "0.1rem 0.4rem", borderRadius: ttrpg.radius.sm,
                                            backgroundColor: status.color, color: "#fff",
                                        }}>{status.name}</span>
                                    ))}
                                </div>
                            )}
                            <div style={{ display: "flex", gap: "1rem", fontSize: "0.85rem", color: ttrpg.colors.textMuted, marginBottom: counts ? "0.25rem" : 0 }}>
                                <span>Wealth: {member.wealth}</span>
                                <span>Renown: {member.renown}</span>
                            </div>
                            {counts && <div style={{ fontSize: "0.8rem", color: ttrpg.colors.textMuted }}>{counts}</div>}
                        </div>
                    </div>
                )
            })}
            <div style={{ marginTop: "1rem" }}>
                <button onClick={onAdd} className="ttrpg-btn-primary" style={primaryButtonStyle}>Add Party Member</button>
            </div>
        </div>
    )
}
