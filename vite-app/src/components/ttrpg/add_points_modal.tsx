import { useState, useEffect } from "react"
import TtrpgMember from "../../types/ttrpg/TtrpgMember"
import TtrpgSession from "../../types/ttrpg/TtrpgSession"
import TtrpgPartyResources from "../../types/ttrpg/TtrpgPartyResources"
import { TtrpgProjectContribution } from "../../types/ttrpg/TtrpgProject"
import { primaryButtonStyle } from "../../pages/ttrpg/campaign_detail_styles"
import { themeStyles } from "../../configs/ttrpg_theme"

interface ContributorOption {
    label: string
    contributor_id: string
    contributor_name: string
    contributor_type: "member" | "follower"
    member_id?: string
    group: string
}

interface AddPointsModalProps {
    members: TtrpgMember[]
    sessions: TtrpgSession[]
    partyResources: TtrpgPartyResources
    onSubmit: (contribution: TtrpgProjectContribution) => void
    onDismiss: () => void
    allowNegative?: boolean
}

function buildContributorOptions(members: TtrpgMember[], partyResources: TtrpgPartyResources): ContributorOption[] {
    const options: ContributorOption[] = []

    for (const m of members) {
        options.push({
            label: m.name,
            contributor_id: m.id,
            contributor_name: m.name,
            contributor_type: "member",
            group: "Members"
        })
        for (const f of m.followers) {
            options.push({
                label: `  ${f.name} (${m.name}'s ${f.type})`,
                contributor_id: `${m.id}:follower:${f.name}`,
                contributor_name: f.name,
                contributor_type: "follower",
                member_id: m.id,
                group: "Members"
            })
        }
    }

    for (const f of (partyResources.unassigned_followers || [])) {
        options.push({
            label: `${f.name} (unassigned ${f.type})`,
            contributor_id: `unassigned:follower:${f.name}`,
            contributor_name: f.name,
            contributor_type: "follower",
            group: "Unassigned Followers"
        })
    }

    return options
}

function getLatestSession(sessions: TtrpgSession[]): TtrpgSession | null {
    const today = new Date().toISOString().slice(0, 10)
    const eligible = sessions.filter(s => s.date <= today)
    if (eligible.length === 0) return sessions.length > 0 ? sessions[sessions.length - 1] : null
    return eligible.reduce((a, b) => a.date > b.date ? a : b)
}

export default function AddPointsModal({ members, sessions, partyResources, onSubmit, onDismiss, allowNegative }: AddPointsModalProps) {
    const options = buildContributorOptions(members, partyResources)
    const latestSession = getLatestSession(sessions)

    const [selectedIdx, setSelectedIdx] = useState(0)
    const [points, setPoints] = useState("")
    const [sessionId, setSessionId] = useState(latestSession?.id || "")

    useEffect(() => {
        if (latestSession) setSessionId(latestSession.id)
    }, [latestSession])

    function handleSubmit() {
        const pts = parseInt(points)
        if (!pts || (!allowNegative && pts <= 0)) return
        if (!sessionId) return
        const opt = options[selectedIdx]
        if (!opt) return

        const contribution: TtrpgProjectContribution = {
            contributor_name: opt.contributor_name,
            contributor_id: opt.contributor_id,
            contributor_type: opt.contributor_type,
            points: pts,
            session_id: sessionId,
            ...(opt.member_id ? { member_id: opt.member_id } : {})
        }
        onSubmit(contribution)
    }

    function handleBackdropClick(e: React.MouseEvent) {
        if (e.target === e.currentTarget) onDismiss()
    }

    return (
        <div
            onClick={handleBackdropClick}
            style={themeStyles.modalBackdrop}
        >
            <div className="ttrpg-modal-content" style={{ ...themeStyles.smallModalContent, padding: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                    <strong>{allowNegative ? "Reduce Points" : "Add Points"}</strong>
                    <button onClick={onDismiss} className="ttrpg-btn-ghost" style={{ ...themeStyles.ghostButton, fontSize: "1.2rem", color: "#999" }}>✕</button>
                </div>

                <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.85rem" }}>Contributor</label>
                <select
                    value={selectedIdx}
                    onChange={e => setSelectedIdx(Number(e.target.value))}
                    style={{ width: "100%", padding: "0.4rem", boxSizing: "border-box", marginBottom: "0.5rem" }}
                >
                    {options.map((opt, i) => (
                        <option key={opt.contributor_id} value={i}>{opt.label}</option>
                    ))}
                </select>

                <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.85rem" }}>Points</label>
                <input
                    type="number"
                    value={points}
                    onChange={e => setPoints(e.target.value)}
                    min={allowNegative ? undefined : "1"}
                    placeholder={allowNegative ? "Points to subtract" : "Points to add"}
                    autoFocus
                    style={{ width: "100%", padding: "0.4rem", boxSizing: "border-box", marginBottom: "0.5rem" }}
                    onKeyDown={e => { if (e.key === "Enter") handleSubmit() }}
                />

                <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.85rem" }}>Session</label>
                <select
                    value={sessionId}
                    onChange={e => setSessionId(e.target.value)}
                    style={{ width: "100%", padding: "0.4rem", boxSizing: "border-box", marginBottom: "0.75rem" }}
                >
                    <option value="">Select session...</option>
                    {sessions.map(s => (
                        <option key={s.id} value={s.id}>
                            Session {s.session_number} — {s.date}
                        </option>
                    ))}
                </select>

                <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button onClick={handleSubmit} className="ttrpg-btn-primary" style={primaryButtonStyle}>
                        {allowNegative ? "Subtract" : "Add"}
                    </button>
                    <button onClick={onDismiss}>Cancel</button>
                </div>
            </div>
        </div>
    )
}
