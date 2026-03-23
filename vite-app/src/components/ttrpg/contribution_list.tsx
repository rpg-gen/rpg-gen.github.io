import { useState } from "react"
import { TtrpgProjectContribution } from "../../types/ttrpg/TtrpgProject"
import TtrpgSession from "../../types/ttrpg/TtrpgSession"
import { primaryButtonStyle } from "../../pages/ttrpg/campaign_detail_styles"

interface ContributionListProps {
    contributions: TtrpgProjectContribution[]
    sessions: TtrpgSession[]
    onUpdate: (contributions: TtrpgProjectContribution[]) => void
}

function getSessionLabel(sessions: TtrpgSession[], sessionId: string): string {
    const session = sessions.find(s => s.id === sessionId)
    if (!session) return ""
    return `S${session.session_number}`
}

export default function ContributionList({ contributions, sessions, onUpdate }: ContributionListProps) {
    const [editingIdx, setEditingIdx] = useState<number | null>(null)
    const [draftPoints, setDraftPoints] = useState("")

    const editingContribution = editingIdx !== null ? contributions[editingIdx] : null

    function openEdit(idx: number) {
        setEditingIdx(idx)
        setDraftPoints(String(contributions[idx].points))
    }

    function handleSave() {
        if (editingIdx === null) return
        const pts = parseInt(draftPoints)
        if (isNaN(pts) || pts === 0) return
        const updated = contributions.map((c, i) => i === editingIdx ? { ...c, points: pts } : c)
        onUpdate(updated)
        setEditingIdx(null)
    }

    function handleDelete() {
        if (editingIdx === null) return
        if (!confirm("Delete this contribution?")) return
        const updated = contributions.filter((_, i) => i !== editingIdx)
        onUpdate(updated)
        setEditingIdx(null)
    }

    if (contributions.length === 0) return null

    return (
        <div style={{ borderTop: "1px solid #555", paddingTop: "0.75rem", marginBottom: "1rem" }}>
            <strong>Contributions ({contributions.length})</strong>
            {contributions.map((c, idx) => (
                <div
                    key={idx}
                    onClick={() => openEdit(idx)}
                    style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        padding: "0.35rem 0.5rem", marginTop: "0.25rem",
                        backgroundColor: c.points < 0 ? "#fdecea" : "#f5f5f5",
                        borderRadius: "3px", cursor: "pointer", fontSize: "0.85rem", color: "#222"
                    }}
                >
                    <span>
                        {c.contributor_name}
                        {c.session_id && (
                            <span style={{ color: "#888", marginLeft: "0.4rem" }}>
                                ({getSessionLabel(sessions, c.session_id)})
                            </span>
                        )}
                    </span>
                    <span style={{ fontWeight: "bold", color: c.points < 0 ? "#c0392b" : "#222" }}>
                        {c.points > 0 ? "+" : ""}{c.points}
                    </span>
                </div>
            ))}

            {editingIdx !== null && editingContribution && (
                <div
                    onClick={(e) => { if (e.target === e.currentTarget) setEditingIdx(null) }}
                    style={{
                        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: "rgba(0,0,0,0.5)", zIndex: 100,
                        display: "flex", alignItems: "center", justifyContent: "center"
                    }}
                >
                    <div style={{
                        backgroundColor: "#fff", borderRadius: "8px", width: "350px", maxWidth: "90vw",
                        padding: "1rem", color: "#222", boxShadow: "0 4px 24px rgba(0,0,0,0.3)"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                            <strong>Edit Contribution</strong>
                            <button onClick={() => setEditingIdx(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem", color: "#999" }}>✕</button>
                        </div>

                        <div style={{ fontSize: "0.9rem", marginBottom: "0.5rem" }}>
                            <span style={{ color: "#666" }}>Contributor:</span> {editingContribution.contributor_name}
                        </div>
                        <div style={{ fontSize: "0.9rem", marginBottom: "0.75rem" }}>
                            <span style={{ color: "#666" }}>Session:</span> {getSessionLabel(sessions, editingContribution.session_id) || "—"}
                        </div>

                        <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.85rem" }}>Points</label>
                        <input
                            type="number"
                            value={draftPoints}
                            onChange={e => setDraftPoints(e.target.value)}
                            autoFocus
                            style={{ width: "100%", padding: "0.4rem", boxSizing: "border-box", marginBottom: "0.75rem" }}
                            onKeyDown={e => { if (e.key === "Enter") handleSave() }}
                        />

                        <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button onClick={handleSave} style={primaryButtonStyle}>Save</button>
                            <button onClick={() => setEditingIdx(null)}>Cancel</button>
                            <button
                                onClick={handleDelete}
                                style={{ marginLeft: "auto", backgroundColor: "#c0392b", color: "#fff", border: "none", padding: "0.4rem 0.75rem", borderRadius: "3px", cursor: "pointer", fontSize: "0.85rem" }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
