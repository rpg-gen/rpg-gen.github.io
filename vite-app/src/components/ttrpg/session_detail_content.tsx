import { useState, useEffect, useRef } from "react"
import TtrpgSession from "../../types/ttrpg/TtrpgSession"
import TtrpgSessionNote from "../../types/ttrpg/TtrpgSessionNote"
import TtrpgLoreEntry, { LoreEntryType } from "../../types/ttrpg/TtrpgLoreEntry"
import TtrpgMember from "../../types/ttrpg/TtrpgMember"
import TtrpgQuest from "../../types/ttrpg/TtrpgQuest"
import TtrpgProject from "../../types/ttrpg/TtrpgProject"
import LoreNoteText from "./lore_note_text"
import NoteEditModal from "./note_edit_modal"
import { primaryButtonStyle } from "../../pages/ttrpg/campaign_detail_styles"
import { ttrpg, themeStyles } from "../../configs/ttrpg_theme"

interface CampaignData {
    sessions: TtrpgSession[]
    members: TtrpgMember[]
    notes: TtrpgSessionNote[]
    lore: TtrpgLoreEntry[]
    quests: TtrpgQuest[]
    projects: TtrpgProject[]
}

interface NotesHook {
    createNote: (note: { session_id: string; text: string; author: string }) => Promise<string>
    updateNote: (id: string, note: Partial<TtrpgSessionNote>) => Promise<void>
    deleteNote: (id: string) => Promise<void>
}

interface SessionDetailContentProps {
    sessionId: string
    data: CampaignData
    notesHook: NotesHook
    openLoreDetail: (entryId: string) => void
    openMemberDetail: (memberId: string) => void
    openQuestDetail?: (questId: string) => void
    openProjectDetail?: (projectId: string) => void
    handleSlashCreateLore: (name: string, type: LoreEntryType, sessionId?: string) => Promise<void>
    username: string
    highlightNoteId?: string | null
}

export default function SessionDetailContent({
    sessionId,
    data,
    notesHook,
    openLoreDetail,
    openMemberDetail,
    openQuestDetail,
    openProjectDetail,
    handleSlashCreateLore,
    username,
    highlightNoteId
}: SessionDetailContentProps) {
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
    const [errorBanner, setErrorBanner] = useState<string | null>(null)

    const sessionNotes = data.notes.filter(n => n.session_id === sessionId)
    const otherSessions = [...data.sessions]
        .filter(s => s.id !== sessionId)
        .sort((a, b) => a.date.localeCompare(b.date))

    function closeModal() {
        setEditingNoteId(null)
        setEditingNoteText("")
    }

    function handleCreateNote() {
        if (!editingNoteText.trim()) return
        closeModal()
        notesHook.createNote({ session_id: sessionId, text: editingNoteText.trim(), author: username })
            .catch(() => setErrorBanner("Failed to create note"))
    }

    function handleUpdateNote(noteId: string) {
        if (!editingNoteText.trim()) return
        closeModal()
        notesHook.updateNote(noteId, { text: editingNoteText.trim() })
            .catch(() => setErrorBanner("Failed to update note"))
    }

    function handleDeleteNote(noteId: string) {
        if (!confirm("Delete this note?")) return
        closeModal()
        notesHook.deleteNote(noteId)
            .catch(() => setErrorBanner("Failed to delete note"))
    }

    function handleMoveNote(noteId: string, targetSessionId: string) {
        closeModal()
        notesHook.updateNote(noteId, { session_id: targetSessionId })
            .catch(() => setErrorBanner("Failed to move note"))
    }

    return (
        <div className="ttrpg-card" style={{ ...themeStyles.card, padding: "0.75rem" }}>
            <h4 style={{ marginTop: 0, color: ttrpg.colors.textDark }}>Notes ({sessionNotes.length})</h4>
            {errorBanner && (
                <div style={themeStyles.errorBanner}>
                    <span>{errorBanner}</span>
                    <button
                        onClick={() => setErrorBanner(null)}
                        className="ttrpg-btn-ghost"
                        style={{ ...themeStyles.ghostButton, color: ttrpg.colors.brokenLinkText, fontSize: "1rem" }}
                    >
                        ✕
                    </button>
                </div>
            )}
            <div className="ttrpg-timeline">
            {sessionNotes.map(note => {
                const isHighlighted = flashNoteId === note.id
                return (
                <div
                    key={note.id}
                    ref={highlightNoteId === note.id ? highlightRef : undefined}
                    className="ttrpg-timeline-item"
                    style={{
                        border: isHighlighted ? `2px solid ${ttrpg.colors.gold}` : `1px solid ${ttrpg.colors.cardBorder}`,
                        backgroundColor: isHighlighted ? ttrpg.colors.quest : ttrpg.colors.cardBg,
                        color: ttrpg.colors.textDark,
                        borderRadius: "4px",
                        padding: "0.5rem",
                        marginBottom: "0.5rem",
                        cursor: "pointer",
                        transition: "border-color 0.5s, background-color 0.5s"
                    }}
                    onClick={() => {
                        setEditingNoteId(note.id)
                        setEditingNoteText(note.text)
                    }}
                >
                    <div style={{ whiteSpace: "pre-wrap" }}>
                        <LoreNoteText text={note.text} loreEntries={data.lore} members={data.members} quests={data.quests} projects={data.projects} onLoreClick={openLoreDetail} onMemberClick={openMemberDetail} onQuestClick={openQuestDetail} onProjectClick={openProjectDetail} />
                    </div>
                </div>
                )
            })}
            </div>

            <button
                onClick={() => { setEditingNoteId("new"); setEditingNoteText("") }}
                className="ttrpg-btn-primary"
                style={{ ...primaryButtonStyle, marginTop: "0.5rem" }}
            >
                Add Note
            </button>

            {editingNoteId && (
                <NoteEditModal
                    noteText={editingNoteText}
                    onChangeText={setEditingNoteText}
                    onSave={editingNoteId === "new" ? handleCreateNote : () => handleUpdateNote(editingNoteId)}
                    onCancel={() => { setEditingNoteId(null); setEditingNoteText("") }}
                    onDelete={editingNoteId === "new" ? undefined : () => handleDeleteNote(editingNoteId)}
                    onMove={editingNoteId === "new" ? undefined : (targetId) => handleMoveNote(editingNoteId, targetId)}
                    otherSessions={otherSessions}
                    loreEntries={data.lore}
                    members={data.members}
                    quests={data.quests}
                    projects={data.projects}
                    onCreateLore={(name, type) => handleSlashCreateLore(name, type, sessionId)}
                />
            )}
        </div>
    )
}
