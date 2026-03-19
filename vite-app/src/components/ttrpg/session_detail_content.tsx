import { useState, useEffect, useRef } from "react"
import TtrpgSession from "../../types/ttrpg/TtrpgSession"
import TtrpgSessionNote from "../../types/ttrpg/TtrpgSessionNote"
import TtrpgLoreEntry, { LoreEntryType } from "../../types/ttrpg/TtrpgLoreEntry"
import TtrpgMember from "../../types/ttrpg/TtrpgMember"
import SlashCommandTextarea from "./slash_command_textarea"
import LoreNoteText from "./lore_note_text"
import { primaryButtonStyle } from "../../pages/ttrpg/campaign_detail_styles"

interface CampaignData {
    sessions: TtrpgSession[]
    members: TtrpgMember[]
    notes: TtrpgSessionNote[]
    lore: TtrpgLoreEntry[]
}

interface NotesHook {
    createNote: (note: { campaign_id: string; session_id: string; text: string; author: string }) => Promise<string>
    updateNote: (id: string, note: Partial<TtrpgSessionNote>) => Promise<void>
    deleteNote: (id: string) => Promise<void>
}

interface SessionDetailContentProps {
    campaignId: string
    sessionId: string
    data: CampaignData
    notesHook: NotesHook
    reload: () => Promise<void>
    openLoreDetail: (entryId: string) => void
    openMemberDetail: (memberId: string) => void
    handleSlashCreateLore: (name: string, type: LoreEntryType, sessionId?: string) => Promise<void>
    username: string
    highlightNoteId?: string | null
}

export default function SessionDetailContent({
    campaignId,
    sessionId,
    data,
    notesHook,
    reload,
    openLoreDetail,
    openMemberDetail,
    handleSlashCreateLore,
    username,
    highlightNoteId
}: SessionDetailContentProps) {
    const [newNoteText, setNewNoteText] = useState("")
    const highlightRef = useRef<HTMLDivElement>(null)
    const [flashNoteId, setFlashNoteId] = useState<string | null>(null)

    useEffect(() => {
        if (highlightNoteId) {
            setFlashNoteId(highlightNoteId)
            requestAnimationFrame(() => {
                highlightRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
            })
            const timer = setTimeout(() => setFlashNoteId(null), 2000)
            return () => clearTimeout(timer)
        }
    }, [highlightNoteId])
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
    const [editingNoteText, setEditingNoteText] = useState("")
    const [movingNoteId, setMovingNoteId] = useState<string | null>(null)

    const sessionNotes = data.notes.filter(n => n.session_id === sessionId)
    const otherSessions = [...data.sessions]
        .filter(s => s.id !== sessionId)
        .sort((a, b) => a.date.localeCompare(b.date))

    async function handleCreateNote() {
        if (!newNoteText.trim()) {
            alert("Note text is required")
            return
        }
        try {
            await notesHook.createNote({
                campaign_id: campaignId,
                session_id: sessionId,
                text: newNoteText.trim(),
                author: username
            })
            setNewNoteText("")
            await reload()
        } catch (error) {
            console.error("Error creating note:", error)
            alert("Error creating note")
        }
    }

    async function handleUpdateNote(noteId: string) {
        if (!editingNoteText.trim()) {
            alert("Note text is required")
            return
        }
        try {
            await notesHook.updateNote(noteId, { text: editingNoteText.trim() })
            setEditingNoteId(null)
            setEditingNoteText("")
            await reload()
        } catch (error) {
            console.error("Error updating note:", error)
            alert("Error updating note")
        }
    }

    async function handleDeleteNote(noteId: string) {
        if (confirm("Delete this note?")) {
            try {
                await notesHook.deleteNote(noteId)
                await reload()
            } catch (error) {
                console.error("Error deleting note:", error)
                alert("Error deleting note")
            }
        }
    }

    async function handleMoveNote(noteId: string, targetSessionId: string) {
        try {
            await notesHook.updateNote(noteId, { session_id: targetSessionId })
            setEditingNoteId(null)
            setEditingNoteText("")
            setMovingNoteId(null)
            await reload()
        } catch (error) {
            console.error("Error moving note:", error)
            alert("Error moving note")
        }
    }

    return (
        <div style={{ backgroundColor: "#fff", color: "#222", border: "1px solid #ccc", borderRadius: "4px", padding: "0.75rem" }}>
            <h4 style={{ marginTop: 0 }}>Notes ({sessionNotes.length})</h4>
            {sessionNotes.map(note => {
                const isHighlighted = flashNoteId === note.id
                return (
                <div
                    key={note.id}
                    ref={highlightNoteId === note.id ? highlightRef : undefined}
                    style={{
                        border: isHighlighted ? "2px solid #f39c12" : "1px solid #ddd",
                        backgroundColor: isHighlighted ? "#fef9e7" : editingNoteId === note.id ? "#fff" : "#f5f5f5",
                        color: "#222",
                        borderRadius: "4px",
                        padding: "0.5rem",
                        marginBottom: "0.5rem",
                        cursor: editingNoteId === note.id ? "default" : "pointer",
                        transition: "border-color 0.5s, background-color 0.5s"
                    }}
                    onClick={() => {
                        if (editingNoteId !== note.id) {
                            setEditingNoteId(note.id)
                            setEditingNoteText(note.text)
                        }
                    }}
                >
                    {editingNoteId === note.id ? (
                        <div>
                            <SlashCommandTextarea
                                value={editingNoteText}
                                onChange={setEditingNoteText}
                                loreEntries={data.lore}
                                members={data.members}
                                onCreateLore={(name, type) => handleSlashCreateLore(name, type, sessionId)}
                                style={{ width: "100%", minHeight: "60px", padding: "0.5rem", boxSizing: "border-box" }}
                            />
                            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
                                <button onClick={() => handleUpdateNote(note.id)} style={primaryButtonStyle}>Save</button>
                                <button onClick={() => { setEditingNoteId(null); setEditingNoteText(""); setMovingNoteId(null) }}>Cancel</button>
                                {movingNoteId === note.id ? (
                                    <select
                                        autoFocus
                                        defaultValue=""
                                        onChange={(e) => { if (e.target.value) handleMoveNote(note.id, e.target.value) }}
                                        onBlur={() => setMovingNoteId(null)}
                                        style={{ padding: "0.25rem" }}
                                    >
                                        <option value="" disabled>Select session...</option>
                                        {otherSessions.map(s => (
                                            <option key={s.id} value={s.id}>
                                                Session {s.session_number} — {s.date}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <button onClick={() => setMovingNoteId(note.id)}>Move to Session</button>
                                )}
                                <button
                                    onClick={() => handleDeleteNote(note.id)}
                                    style={{ marginLeft: "auto", backgroundColor: "#c0392b", color: "#fff", border: "none", padding: "0.5rem 0.75rem", borderRadius: "3px", cursor: "pointer" }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div style={{ whiteSpace: "pre-wrap" }}>
                                <LoreNoteText text={note.text} loreEntries={data.lore} members={data.members} onLoreClick={openLoreDetail} onMemberClick={openMemberDetail} />
                            </div>
                            {note.updated_at && note.updated_at !== note.created_at && (
                                <div style={{ fontSize: "0.8rem", color: "#888", marginTop: "0.25rem" }}>(edited)</div>
                            )}
                        </div>
                    )}
                </div>
                )
            })}

            <div style={{ marginTop: "0.5rem" }}>
                <SlashCommandTextarea
                    value={newNoteText}
                    onChange={setNewNoteText}
                    placeholder="Add a note... (type [[ to link lore or players)"
                    loreEntries={data.lore}
                    members={data.members}
                    onCreateLore={(name, type) => handleSlashCreateLore(name, type, sessionId)}
                    style={{ width: "100%", minHeight: "60px", padding: "0.5rem", boxSizing: "border-box" }}
                />
                <button onClick={handleCreateNote} style={{ ...primaryButtonStyle, marginTop: "0.25rem" }}>
                    Add Note
                </button>
            </div>
        </div>
    )
}
