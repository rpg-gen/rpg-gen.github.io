import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import TtrpgSession from "../../types/ttrpg/TtrpgSession"
import TtrpgSessionNote from "../../types/ttrpg/TtrpgSessionNote"
import { cardStyle, primaryButtonStyle } from "../../pages/ttrpg/campaign_detail_styles"
import { nav_paths } from "../../configs/constants"
import { assignSessionNumbers } from "../../utility/ttrpg_session_helpers"

interface SessionsHook {
    createSession: (session: Omit<TtrpgSession, "id">) => Promise<string>
    deleteSession: (id: string) => Promise<void>
}

interface NotesHook {
    deleteNote: (id: string) => Promise<void>
}

interface SessionsTabProps {
    campaignId: string
    sessions: TtrpgSession[]
    notes: TtrpgSessionNote[]
    sessionsHook: SessionsHook
    notesHook: NotesHook
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
    notes,
    sessionsHook,
    notesHook,
    updateSessions
}: SessionsTabProps) {
    const navigate = useNavigate()

    const [sessionFormMode, setSessionFormMode] = useState<string | null>(null)
    const [sessionFormDate, setSessionFormDate] = useState("")
    const [sessionFormRespites, setSessionFormRespites] = useState(0)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const sortedSessions = [...sessions].sort((a, b) => a.date.localeCompare(b.date))
    const totalRespites = sessions.reduce((sum, s) => sum + s.respite_count, 0)

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

    async function handleDeleteSession(e: React.MouseEvent, session: TtrpgSession) {
        e.stopPropagation()
        if (confirm("Delete this session and all its notes?")) {
            try {
                const sessionNotes = notes.filter(n => n.session_id === session.id)
                for (const note of sessionNotes) {
                    await notesHook.deleteNote(note.id)
                }
                await sessionsHook.deleteSession(session.id)
            } catch (error) {
                console.error("Error deleting session:", error)
                alert("Error deleting session")
            }
        }
    }

    // List View
    if (sessionFormMode === null) {
        return (
            <div>
                {errorMessage && (
                    <div style={{
                        backgroundColor: "#fde8e8",
                        color: "#c0392b",
                        border: "1px solid #e74c3c",
                        borderRadius: "4px",
                        padding: "0.75rem",
                        marginBottom: "1rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between"
                    }}>
                        <span>{errorMessage}</span>
                        <button
                            onClick={() => setErrorMessage(null)}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "#c0392b", fontWeight: "bold", fontSize: "1rem" }}
                        >
                            x
                        </button>
                    </div>
                )}

                <div style={{ ...cardStyle, display: "flex", gap: "1.5rem", padding: "0.75rem 1rem", marginBottom: "1rem" }}>
                    <span><strong>Total Sessions:</strong> {sessions.length}</span>
                    <span><strong>Total Respites:</strong> {totalRespites}</span>
                </div>

                <div style={{ marginBottom: "1rem" }}>
                    <button onClick={() => { setSessionFormDate(new Date().toISOString().slice(0, 10)); setSessionFormRespites(0); setSessionFormMode("add") }} style={primaryButtonStyle}>Add Session</button>
                </div>

                {sortedSessions.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "2rem", color: "#666" }}>
                        No sessions yet.
                    </div>
                ) : (
                    sortedSessions.map(session => (
                        <div
                            key={session.id}
                            style={{ ...cardStyle, cursor: "pointer" }}
                            onClick={() => navigate(`${nav_paths.rpg_notes}/${campaignId}/session/${session.id}`)}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <span style={{ flex: 1 }}>
                                    <strong>Session {session.session_number}</strong> — {session.date}
                                    {session.respite_count > 0 && (
                                        <span style={{ color: "#666", marginLeft: "0.5rem" }}>
                                            ({session.respite_count} respite{session.respite_count !== 1 ? "s" : ""})
                                        </span>
                                    )}
                                    {session.title && (
                                        <div style={{ fontSize: "0.9rem", color: "#555", marginTop: "0.25rem" }}>{session.title}</div>
                                    )}
                                </span>
                                <button
                                    onClick={(e) => handleDeleteSession(e, session)}
                                    style={{ backgroundColor: "#c0392b", color: "#fff", border: "none", padding: "0.25rem 0.5rem", borderRadius: "3px", cursor: "pointer", fontSize: "0.8rem" }}
                                >
                                    Delete
                                </button>
                                <span>&#x25B6;</span>
                            </div>
                        </div>
                    ))
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
                <button onClick={handleCreateSession} style={primaryButtonStyle}>Add</button>
                <button onClick={() => { setSessionFormMode(null); setSessionFormDate(""); setSessionFormRespites(0) }}>Cancel</button>
            </div>
        </div>
    )
}
