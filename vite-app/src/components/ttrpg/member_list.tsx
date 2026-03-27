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
                const loreItems = member.items.filter(i => i.lore_id)

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
                            {member.titles.length > 0 && (
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem", marginBottom: "0.35rem" }}>
                                    {member.titles.map(t => (
                                        <span key={t.name} style={{
                                            fontSize: "0.7rem", fontStyle: "italic",
                                            padding: "0.1rem 0.4rem", borderRadius: ttrpg.radius.sm,
                                            backgroundColor: "rgba(255,255,255,0.08)", color: ttrpg.colors.textMuted,
                                        }}>{t.name}</span>
                                    ))}
                                </div>
                            )}
                            <div style={{
                                display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
                                textAlign: "center", gap: "0.25rem", marginBottom: loreItems.length > 0 ? "0.35rem" : 0,
                            }}>
                                {[
                                    { label: "Wealth", value: member.wealth },
                                    { label: "Renown", value: member.renown },
                                    { label: "Items", value: itemCount },
                                    { label: "Followers", value: followerCount },
                                ].map(stat => (
                                    <div key={stat.label}>
                                        <div style={{ fontSize: "0.7rem", color: ttrpg.colors.textMuted }}>{stat.label}</div>
                                        <div style={{ fontSize: "0.95rem", fontWeight: 600, color: ttrpg.colors.textDark }}>{stat.value}</div>
                                    </div>
                                ))}
                            </div>
                            {loreItems.length > 0 && (
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
                                    {loreItems.map(i => (
                                        <span key={i.lore_id} style={{
                                            fontSize: "0.7rem", padding: "0.1rem 0.4rem",
                                            borderRadius: ttrpg.radius.sm,
                                            backgroundColor: "rgba(184,134,11,0.15)", color: "#b8860b",
                                        }}>{"\u2605"} {i.name}</span>
                                    ))}
                                </div>
                            )}
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
