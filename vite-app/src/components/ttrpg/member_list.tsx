import TtrpgMember from "../../types/ttrpg/TtrpgMember"
import { cardStyle, primaryButtonStyle } from "../../pages/ttrpg/campaign_detail_styles"

interface MemberListProps {
    members: TtrpgMember[]
    onSelect: (memberId: string) => void
    onAdd: () => void
    clearCameFromSessionId: () => void
}

export default function MemberList({ members, onSelect, onAdd, clearCameFromSessionId }: MemberListProps) {
    if (members.length === 0) {
        return (
            <div>
                <div style={{ textAlign: "center", padding: "2rem", color: "#666" }}>No party members yet.</div>
                <div style={{ marginTop: "1rem" }}>
                    <button onClick={onAdd} style={primaryButtonStyle}>Add Party Member</button>
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
                    <div key={member.id} style={{ ...cardStyle, cursor: "pointer" }}
                        onClick={() => { clearCameFromSessionId(); onSelect(member.id) }}>
                        <div style={{ marginBottom: "0.25rem" }}>
                            <strong>{member.name}</strong>
                            {member.played_by && <span style={{ fontStyle: "italic", color: "#666", marginLeft: "0.35rem" }}>({member.played_by})</span>}
                        </div>
                        <div style={{ display: "flex", gap: "1rem", fontSize: "0.85rem", color: "#555", marginBottom: counts ? "0.25rem" : 0 }}>
                            <span>Wealth: {member.wealth}</span>
                            <span>Renown: {member.renown}</span>
                        </div>
                        {counts && <div style={{ fontSize: "0.8rem", color: "#888" }}>{counts}</div>}
                    </div>
                )
            })}
            <div style={{ marginTop: "1rem" }}>
                <button onClick={onAdd} style={primaryButtonStyle}>Add Party Member</button>
            </div>
        </div>
    )
}
