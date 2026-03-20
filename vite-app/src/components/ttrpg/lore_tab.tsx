import { useState, useEffect } from "react"
import TtrpgSession from "../../types/ttrpg/TtrpgSession"
import TtrpgSessionNote from "../../types/ttrpg/TtrpgSessionNote"
import TtrpgLoreEntry, { LoreEntryType } from "../../types/ttrpg/TtrpgLoreEntry"
import TtrpgMember from "../../types/ttrpg/TtrpgMember"
import LoreDetailView from "./lore_detail_view"
import { cardStyle, primaryButtonStyle } from "../../pages/ttrpg/campaign_detail_styles"
import { LORE_COLORS, LORE_LABELS, ALL_LORE_TYPES } from "../../configs/ttrpg_constants"

interface CampaignData {
    sessions: TtrpgSession[]
    members: TtrpgMember[]
    notes: TtrpgSessionNote[]
    lore: TtrpgLoreEntry[]
}

interface LoreHook {
    createLoreEntry: (entry: Omit<TtrpgLoreEntry, "id" | "campaign_id">) => Promise<string>
    updateLoreEntry: (id: string, entry: Partial<TtrpgLoreEntry>) => Promise<void>
    deleteLoreEntry: (id: string) => Promise<void>
}

interface NotesHook {
    updateNote: (id: string, note: Partial<TtrpgSessionNote>) => Promise<void>
}

interface LoreTabProps {
    data: CampaignData
    loreHook: LoreHook
    notesHook: NotesHook
    goToSession: (sessionId: string, noteId?: string) => void
    openLoreDetail: (entryId: string) => void
    openMemberDetail: (memberId: string) => void
    cameFromSessionId: string | null
    backToOriginSession: () => void
    pendingDetailId: string | null
    clearPendingDetailId: () => void
    resetSignal: number
    clearCameFromSessionId: () => void
}

export default function LoreTab({
    data,
    loreHook,
    notesHook,
    goToSession,
    openLoreDetail,
    openMemberDetail,
    cameFromSessionId,
    backToOriginSession,
    pendingDetailId,
    clearPendingDetailId,
    resetSignal,
    clearCameFromSessionId
}: LoreTabProps) {

    // Lore detail view
    const [loreDetailId, setLoreDetailId] = useState<string | null>(null)

    // Lore form state: null = list view, "add" = adding, entry id = editing
    const [loreFormMode, setLoreFormMode] = useState<string | null>(null)
    const [loreFormType, setLoreFormType] = useState<LoreEntryType>("person")
    const [loreFormName, setLoreFormName] = useState("")
    const [loreFormNotes, setLoreFormNotes] = useState("")
    const [loreFormSessionId, setLoreFormSessionId] = useState<string | undefined>(undefined)

    // Lore filter
    const [loreFilter, setLoreFilter] = useState<LoreEntryType | null>(null)

    useEffect(() => {
        if (pendingDetailId) {
            setLoreDetailId(pendingDetailId)
            setLoreFormMode(null)
            clearPendingDetailId()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pendingDetailId])

    useEffect(() => {
        if (resetSignal > 0) {
            setLoreDetailId(null)
        }
    }, [resetSignal])

    function resetLoreForm() {
        setLoreFormMode(null)
        setLoreFormName("")
        setLoreFormNotes("")
        setLoreFormType("person")
        setLoreFormSessionId(undefined)
        setLoreDetailId(null)
    }

    function toggleLoreFilter(type: LoreEntryType) {
        setLoreFilter(prev => prev === type ? null : type)
    }

    function getSessionLabel(sessionId: string): string {
        const session = data.sessions.find(s => s.id === sessionId)
        if (!session) return ""
        return `Session ${session.session_number}`
    }

    // ==================== LORE CRUD ====================

    async function handleCreateLoreEntry() {
        if (!loreFormName.trim()) {
            alert("Name is required")
            return
        }
        try {
            await loreHook.createLoreEntry({
                type: loreFormType,
                name: loreFormName.trim(),
                notes: loreFormNotes.trim(),
                ...(loreFormSessionId ? { session_id: loreFormSessionId } : {})
            })
            resetLoreForm()
        } catch (error) {
            console.error("Error creating lore entry:", error)
            alert("Error creating lore entry")
        }
    }

    async function handleDeleteLoreEntry(id: string) {
        if (confirm("Are you sure you want to remove this entry?")) {
            try {
                await loreHook.deleteLoreEntry(id)
                resetLoreForm()
            } catch (error) {
                console.error("Error deleting lore entry:", error)
                alert("Error deleting lore entry")
            }
        }
    }

    async function handleUpdateLoreEntry(entry: TtrpgLoreEntry) {
        if (!loreFormName.trim()) {
            alert("Name is required")
            return
        }
        try {
            const newName = loreFormName.trim()
            await loreHook.updateLoreEntry(entry.id, {
                type: loreFormType,
                name: newName,
                notes: loreFormNotes.trim(),
                ...(loreFormSessionId ? { session_id: loreFormSessionId } : {})
            })

            // Update all [[OldName]] references in session notes
            if (newName !== entry.name) {
                const pattern = new RegExp(`\\[\\[${entry.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\]\\]`, "gi")
                for (const note of data.notes) {
                    if (pattern.test(note.text)) {
                        const updatedText = note.text.replace(pattern, `[[${newName}]]`)
                        await notesHook.updateNote(note.id, { text: updatedText })
                    }
                }
            }

            resetLoreForm()
        } catch (error) {
            console.error("Error updating lore entry:", error)
            alert("Error updating lore entry")
        }
    }

    function getSessionNumber(sessionId?: string): number {
        if (!sessionId) return Infinity
        const session = data.sessions.find(s => s.id === sessionId)
        return session ? session.session_number : Infinity
    }

    const filteredLore = (loreFilter === null ? data.lore : data.lore.filter(entry => entry.type === loreFilter))
        .slice()
        .sort((a, b) => getSessionNumber(a.session_id) - getSessionNumber(b.session_id) || a.name.localeCompare(b.name))

    // ==================== RENDER ====================

    // Detail View
    if (loreFormMode === null && loreDetailId !== null) {
        const entry = data.lore.find(e => e.id === loreDetailId)
        if (!entry) return <div><button onClick={() => setLoreDetailId(null)}>Back</button><p>Entry not found.</p></div>

        return (
            <LoreDetailView
                entry={entry}
                data={data}
                goToSession={goToSession}
                openLoreDetail={openLoreDetail}
                openMemberDetail={openMemberDetail}
                cameFromSessionId={cameFromSessionId}
                backToOriginSession={backToOriginSession}
                clearCameFromSessionId={clearCameFromSessionId}
                onBack={() => setLoreDetailId(null)}
                onEdit={(e) => {
                    setLoreDetailId(null)
                    setLoreFormMode(e.id)
                    setLoreFormType(e.type)
                    setLoreFormName(e.name)
                    setLoreFormNotes(e.notes || "")
                    setLoreFormSessionId(e.session_id)
                }}
            />
        )
    }

    // List View
    if (loreFormMode === null) {
        return (
            <div>
                {/* Add buttons */}
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
                    {ALL_LORE_TYPES.map(type => {
                        const latestSession = data.sessions.length > 0
                            ? data.sessions.reduce((a, b) => a.session_number > b.session_number ? a : b)
                            : null
                        return (
                            <button
                                key={type}
                                onClick={() => {
                                    setLoreFormType(type)
                                    setLoreFormName("")
                                    setLoreFormNotes("")
                                    setLoreFormSessionId(latestSession?.id)
                                    setLoreFormMode("add")
                                }}
                                style={{
                                    backgroundColor: LORE_COLORS[type],
                                    color: "#222",
                                    border: "1px solid #ccc",
                                    borderRadius: "4px",
                                    padding: "0.5rem 1rem",
                                    cursor: "pointer"
                                }}
                            >
                                Add {LORE_LABELS[type]}
                            </button>
                        )
                    })}
                </div>

                {/* Filter chips */}
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                    {ALL_LORE_TYPES.map(type => {
                        const active = loreFilter === type
                        return (
                            <button
                                key={type}
                                onClick={() => toggleLoreFilter(type)}
                                style={{
                                    padding: "0.25rem 0.75rem",
                                    borderRadius: "12px",
                                    border: "1px solid #ccc",
                                    backgroundColor: active ? LORE_COLORS[type] : "transparent",
                                    color: active ? "#222" : "rgba(255,255,255,0.5)",
                                    cursor: "pointer",
                                    fontSize: "0.85rem"
                                }}
                            >
                                {LORE_LABELS[type]}
                            </button>
                        )
                    })}
                </div>

                {filteredLore.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "2rem", color: "#666" }}>
                        {data.lore.length === 0 ? "No lore entries yet." : "No entries match the current filter."}
                    </div>
                ) : (
                    filteredLore.map(entry => (
                        <div key={entry.id} style={{ ...cardStyle, backgroundColor: LORE_COLORS[entry.type], cursor: "pointer" }} onClick={() => setLoreDetailId(entry.id)}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: entry.notes ? "0.25rem" : 0 }}>
                                <span style={{ flex: 1 }}>
                                    <strong>{entry.name}</strong>
                                    <span style={{ color: "#666", marginLeft: "0.5rem" }}>
                                        ({LORE_LABELS[entry.type]}{entry.session_id ? ` — ${getSessionLabel(entry.session_id)}` : ""})
                                    </span>
                                </span>
                                <button onClick={(e) => { e.stopPropagation(); setLoreFormMode(entry.id); setLoreFormType(entry.type); setLoreFormName(entry.name); setLoreFormNotes(entry.notes || ""); setLoreFormSessionId(entry.session_id) }}>Edit</button>
                            </div>
                            {entry.notes && (
                                <div style={{ fontStyle: "italic", color: "#555", fontSize: "0.9rem" }}>{entry.notes}</div>
                            )}
                        </div>
                    ))
                )}
            </div>
        )
    }

    // Add/Edit Form
    const isEditing = loreFormMode !== "add"
    const editingEntry = isEditing ? data.lore.find(e => e.id === loreFormMode) : null

    return (
        <div>
            <h3>{isEditing ? "Edit Lore Entry" : `Add ${LORE_LABELS[loreFormType]}`}</h3>
            <label style={{ display: "block", marginBottom: "0.25rem" }}>Name</label>
            <input
                type="text"
                value={loreFormName}
                onChange={(e) => setLoreFormName(e.target.value)}
                placeholder="Name"
                autoFocus
                style={{ width: "100%", padding: "0.5rem", boxSizing: "border-box" }}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        if (isEditing && editingEntry) handleUpdateLoreEntry(editingEntry)
                        else handleCreateLoreEntry()
                    }
                }}
            />
            <label style={{ display: "block", marginTop: "0.75rem", marginBottom: "0.25rem" }}>Notes</label>
            <textarea
                value={loreFormNotes}
                onChange={(e) => setLoreFormNotes(e.target.value)}
                placeholder="Notes..."
                style={{ width: "100%", minHeight: "60px", padding: "0.5rem", boxSizing: "border-box" }}
            />
            <label style={{ display: "block", marginTop: "0.75rem", marginBottom: "0.25rem" }}>Type</label>
            <select
                value={loreFormType}
                onChange={(e) => setLoreFormType(e.target.value as LoreEntryType)}
                style={{ width: "100%", padding: "0.5rem", boxSizing: "border-box", marginBottom: "0.75rem" }}
            >
                {ALL_LORE_TYPES.map(type => (
                    <option key={type} value={type}>{LORE_LABELS[type]}</option>
                ))}
            </select>
            <label style={{ display: "block", marginBottom: "0.25rem" }}>Session</label>
            <select
                value={loreFormSessionId || ""}
                onChange={(e) => setLoreFormSessionId(e.target.value || undefined)}
                style={{ width: "100%", padding: "0.5rem", boxSizing: "border-box" }}
            >
                <option value="">No Session</option>
                {data.sessions.map(s => (
                    <option key={s.id} value={s.id}>Session {s.session_number} — {s.date}</option>
                ))}
            </select>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                {isEditing && editingEntry ? (
                    <button onClick={() => handleUpdateLoreEntry(editingEntry)} style={primaryButtonStyle}>Save</button>
                ) : (
                    <button onClick={handleCreateLoreEntry} style={primaryButtonStyle}>Add</button>
                )}
                <button onClick={resetLoreForm}>Cancel</button>
            </div>

            {isEditing && (
                <div style={{ marginTop: "2rem", borderTop: "1px solid #555", paddingTop: "1rem" }}>
                    <button
                        onClick={() => handleDeleteLoreEntry(loreFormMode)}
                        style={{ backgroundColor: "#c0392b", color: "#fff", border: "none", padding: "0.5rem 1rem", cursor: "pointer" }}
                    >
                        Remove Entry
                    </button>
                </div>
            )}
        </div>
    )
}
