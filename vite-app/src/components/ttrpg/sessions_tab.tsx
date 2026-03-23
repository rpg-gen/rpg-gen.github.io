import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import TtrpgSession from "../../types/ttrpg/TtrpgSession"
import { cardStyle, primaryButtonStyle } from "../../pages/ttrpg/campaign_detail_styles"
import { ttrpg, themeStyles } from "../../configs/ttrpg_theme"
import { nav_paths } from "../../configs/constants"
import { assignSessionNumbers } from "../../utility/ttrpg_session_helpers"

interface SessionsHook {
    createSession: (session: Omit<TtrpgSession, "id">) => Promise<string>
}

interface SessionsTabProps {
    campaignId: string
    sessions: TtrpgSession[]
    sessionsHook: SessionsHook
    updateSessions: (updater: (sessions: TtrpgSession[]) => TtrpgSession[]) => void
}

function AddSessionDateInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const ref = useRef<HTMLInputElement>(null)
    useEffect(() => {
        if (ref.current) {
            ref.current.focus()
            try { ref.current.showPicker() } catch { /* not supported in all browsers */ }
        }
    }, [])
    return (
        <input
            ref={ref}
            type="date"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{ width: "100%", padding: "0.5rem", boxSizing: "border-box" }}
        />
    )
}

export default function SessionsTab({
    campaignId,
    sessions,
    sessionsHook,
    updateSessions
}: SessionsTabProps) {
    const navigate = useNavigate()

    const [sessionFormMode, setSessionFormMode] = useState<string | null>(null)
    const [sessionFormDate, setSessionFormDate] = useState("")
    const [sessionFormRespites, setSessionFormRespites] = useState(0)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const sortedSessions = [...sessions].sort((a, b) => a.date.localeCompare(b.date))
    const totalRespites = sessions.reduce((sum, s) => sum + s.respite_count, 0)
    const todayStr = new Date().toISOString().slice(0, 10)

    function handleCreateSession() {
        if (!sessionFormDate) {
            alert("Date is required")
            return
        }

        const tempId = "temp-" + Date.now()
        const date = sessionFormDate
        const respites = sessionFormRespites

        const optimisticSession: TtrpgSession = {
            id: tempId,
            campaign_id: campaignId,
            session_number: 0,
            date,
            respite_count: respites
        }
        updateSessions(prev => assignSessionNumbers([...prev, optimisticSession]))

        setSessionFormMode(null)
        setSessionFormDate("")
        setSessionFormRespites(0)
        setErrorMessage(null)

        ;(async () => {
            try {
                await sessionsHook.createSession({
                    campaign_id: campaignId,
                    session_number: 0,
                    date,
                    respite_count: respites
                })
            } catch (error) {
                console.error("Error creating session:", error)
                setErrorMessage("Failed to save session — please try again")
                updateSessions(prev => prev.filter(s => s.id !== tempId))
            }
        })()
    }

    // List View
    if (sessionFormMode === null) {
        return (
            <div>
                {errorMessage && (
                    <div style={themeStyles.errorBanner}>
                        <span>{errorMessage}</span>
                        <button
                            onClick={() => setErrorMessage(null)}
                            className="ttrpg-btn-ghost"
                            style={{ ...themeStyles.ghostButton, color: ttrpg.colors.brokenLinkText, fontWeight: "bold", fontSize: "1rem" }}
                        >
                            x
                        </button>
                    </div>
                )}

                <div className="ttrpg-card" style={{ ...cardStyle, display: "flex", gap: "1.5rem", padding: "0.75rem 1rem", marginBottom: "1rem" }}>
                    <span><strong>Total Sessions:</strong> {sessions.length}</span>
                    <span><strong>Total Respites:</strong> {totalRespites}</span>
                </div>

                <div style={{ marginBottom: "1rem" }}>
                    <button onClick={() => { setSessionFormDate(new Date().toISOString().slice(0, 10)); setSessionFormRespites(0); setSessionFormMode("add") }} className="ttrpg-btn-primary" style={primaryButtonStyle}>Add Session</button>
                </div>

                {sortedSessions.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "2rem", color: "#666" }}>
                        No sessions yet.
                    </div>
                ) : (
                    sortedSessions.map(session => {
                        const isToday = session.date === todayStr
                        const isFuture = session.date > todayStr
                        const bgColor = isToday ? "#fdf6e3" : isFuture ? "#e8f5f1" : undefined
                        const borderColor = isToday ? ttrpg.colors.gold : isFuture ? ttrpg.colors.teal : undefined
                        return (
                        <div
                            key={session.id}
                            className="ttrpg-card"
                            style={{
                                ...cardStyle,
                                cursor: "pointer",
                                ...(bgColor ? { backgroundColor: bgColor } : {}),
                                ...(borderColor ? { border: `1px solid ${borderColor}`, borderLeft: `3px solid ${borderColor}` } : {}),
                            }}
                            onClick={() => navigate(`${nav_paths.rpg_notes}/${campaignId}/session/${session.id}`)}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <span style={{ flex: 1 }}>
                                    <strong>Session {session.session_number}</strong> — {session.date}
                                    {session.respite_count > 0 && (
                                        <span style={{ color: ttrpg.colors.textMuted, marginLeft: "0.5rem" }}>
                                            ({session.respite_count} respite{session.respite_count !== 1 ? "s" : ""})
                                        </span>
                                    )}
                                    {session.title && (
                                        <div style={{ fontSize: "0.9rem", color: ttrpg.colors.textMuted, marginTop: "0.25rem" }}>{session.title}</div>
                                    )}
                                </span>
                                <span style={{ color: ttrpg.colors.textMuted }}>&#x25B6;</span>
                            </div>
                        </div>
                        )
                    })
                )}
            </div>
        )
    }

    // Add Form
    return (
        <div>
            <h3>Add Session</h3>
            <label style={{ display: "block", marginBottom: "0.25rem" }}>Date</label>
            <AddSessionDateInput value={sessionFormDate} onChange={setSessionFormDate} />
            <label style={{ display: "block", marginTop: "0.75rem", marginBottom: "0.25rem" }}>Respites</label>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <button onClick={() => setSessionFormRespites(Math.max(0, sessionFormRespites - 1))}>-</button>
                <span>{sessionFormRespites}</span>
                <button onClick={() => setSessionFormRespites(sessionFormRespites + 1)}>+</button>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                <button onClick={handleCreateSession} className="ttrpg-btn-primary" style={primaryButtonStyle}>Add</button>
                <button onClick={() => { setSessionFormMode(null); setSessionFormDate(""); setSessionFormRespites(0) }}>Cancel</button>
            </div>
        </div>
    )
}
