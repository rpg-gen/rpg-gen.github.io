import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate, useOutletContext } from "react-router-dom"
import TtrpgSessionNote from "../../types/ttrpg/TtrpgSessionNote"
import TtrpgSession from "../../types/ttrpg/TtrpgSession"
import AutoResizeTextarea from "../../components/ttrpg/auto_resize_textarea"
import LoreNoteText from "../../components/ttrpg/lore_note_text"
import { nav_paths } from "../../configs/constants"
import { primaryButtonStyle } from "./campaign_detail_styles"
import { QUEST_COLOR } from "../../configs/ttrpg_constants"
import { CampaignLayoutContext } from "./campaign_layout"

export default function QuestDetail() {
    const { campaignId, questId } = useParams<{ campaignId: string; questId: string }>()
    const navigate = useNavigate()
    const { data, isLoading, questsHook, notesHook } = useOutletContext<CampaignLayoutContext>()

    const [draftTitle, setDraftTitle] = useState("")
    const [draftDescription, setDraftDescription] = useState("")
    const [editingField, setEditingField] = useState<"title" | "description" | null>(null)
    const editingFieldRef = useRef(editingField)
    editingFieldRef.current = editingField

    const quest = data.quests.find(q => q.id === questId)

    // Sync drafts from Firestore — but don't overwrite active edits
    useEffect(() => {
        if (!quest) return
        if (editingFieldRef.current !== "title") setDraftTitle(quest.short_title)
        if (editingFieldRef.current !== "description") setDraftDescription(quest.description)
    }, [quest])

    function goBack() {
        navigate(`${nav_paths.rpg_notes}/${campaignId}`, { state: { tab: "quests" } })
    }

    function goToSession(sessionId: string, noteId?: string) {
        navigate(`${nav_paths.rpg_notes}/${campaignId}/session/${sessionId}`, {
            ...(noteId ? { state: { highlightNoteId: noteId } } : {})
        })
    }

    function openLoreDetail(entryId: string) {
        navigate(`${nav_paths.rpg_notes}/${campaignId}`, { state: { tab: "lore", detailId: entryId } })
    }

    function openMemberDetail(memberId: string) {
        navigate(`${nav_paths.rpg_notes}/${campaignId}`, { state: { tab: "party", detailId: memberId } })
    }

    function openQuestDetail(qId: string) {
        navigate(`${nav_paths.rpg_notes}/${campaignId}/quest/${qId}`)
    }

    function openProjectDetail(pId: string) {
        navigate(`${nav_paths.rpg_notes}/${campaignId}/project/${pId}`)
    }

    async function saveTitle() {
        setEditingField(null)
        const trimmed = draftTitle.trim()
        if (!trimmed || !quest || trimmed === quest.short_title) return

        const oldName = quest.short_title
        try {
            await questsHook.updateQuest(questId!, { short_title: trimmed })

            const pattern = new RegExp(`\\[\\[${oldName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\]\\]`, "gi")
            for (const note of data.notes) {
                if (pattern.test(note.text)) {
                    const updatedText = note.text.replace(pattern, `[[${trimmed}]]`)
                    await notesHook.updateNote(note.id, { text: updatedText })
                }
            }
        } catch (error) {
            console.error("Error updating quest title:", error)
        }
    }

    async function saveDescription() {
        setEditingField(null)
        if (!quest || draftDescription === quest.description) return
        try {
            await questsHook.updateQuest(questId!, { description: draftDescription })
        } catch (error) {
            console.error("Error updating quest description:", error)
        }
    }

    async function handleToggleComplete() {
        if (!quest) return
        try {
            await questsHook.updateQuest(questId!, { completed: !quest.completed })
        } catch (error) {
            console.error("Error toggling quest completion:", error)
        }
    }

    async function handleSessionChange(sessionId: string) {
        try {
            await questsHook.updateQuest(questId!, { session_id: sessionId || undefined })
        } catch (error) {
            console.error("Error updating quest session:", error)
        }
    }

    async function handleDelete() {
        if (!confirm("Delete this quest?")) return
        try {
            await questsHook.deleteQuest(questId!)
            goBack()
        } catch (error) {
            console.error("Error deleting quest:", error)
        }
    }

    if (isLoading && !quest) {
        return <div>Loading...</div>
    }

    if (!quest) {
        return (
            <div>
                <p>Quest not found.</p>
                <button onClick={goBack}>Back to Campaign</button>
            </div>
        )
    }

    const mentions: { note: TtrpgSessionNote; session: TtrpgSession }[] = []
    for (const note of data.notes) {
        if (note.text.toLowerCase().includes(`[[${quest.short_title.toLowerCase()}]]`)) {
            const session = data.sessions.find(s => s.id === note.session_id)
            if (session) mentions.push({ note, session })
        }
    }
    mentions.sort((a, b) =>
        a.session.session_number - b.session.session_number
        || a.note.created_at.localeCompare(b.note.created_at)
    )

    const linkedSession = quest.session_id ? data.sessions.find(s => s.id === quest.session_id) : null

    return (
        <>
            <div style={{ marginBottom: "1rem" }}>
                <button onClick={goBack}>Back to Quests</button>
            </div>

            {editingField === "title" ? (
                <input
                    type="text"
                    value={draftTitle}
                    onChange={e => setDraftTitle(e.target.value)}
                    onBlur={saveTitle}
                    onKeyDown={e => { if (e.key === "Enter") saveTitle() }}
                    autoFocus
                    style={{ width: "100%", padding: "0.5rem", boxSizing: "border-box", fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}
                />
            ) : (
                <h2
                    onClick={() => { setDraftTitle(quest.short_title); setEditingField("title") }}
                    style={{
                        cursor: "pointer",
                        marginBottom: "1rem",
                        textDecoration: quest.completed ? "line-through" : "none"
                    }}
                    title="Click to edit"
                >
                    {quest.short_title}
                </h2>
            )}

            <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap", alignItems: "center" }}>
                <button
                    onClick={handleToggleComplete}
                    style={{
                        backgroundColor: quest.completed ? "#27ae60" : "transparent",
                        color: quest.completed ? "#fff" : "#27ae60",
                        border: "2px solid #27ae60",
                        padding: "0.4rem 0.75rem",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontWeight: "bold"
                    }}
                >
                    {quest.completed ? "✓ Completed" : "Mark Complete"}
                </button>

                <select
                    value={quest.session_id || ""}
                    onChange={(e) => handleSessionChange(e.target.value)}
                    style={{ padding: "0.4rem 0.5rem" }}
                >
                    <option value="">No Session</option>
                    {data.sessions.map(s => (
                        <option key={s.id} value={s.id}>Session {s.session_number} — {s.date}</option>
                    ))}
                </select>

                {linkedSession && (
                    <button
                        onClick={() => goToSession(linkedSession.id)}
                        style={{ fontSize: "0.85rem" }}
                    >
                        Go to session notes
                    </button>
                )}
            </div>

            <label style={{ display: "block", marginBottom: "0.25rem", color: "#aaa", fontSize: "0.85rem" }}>Description</label>
            {editingField === "description" ? (
                <AutoResizeTextarea
                    value={draftDescription}
                    onChange={e => setDraftDescription(e.target.value)}
                    placeholder="Add description..."
                    style={{ marginBottom: "1rem" }}
                />
            ) : (
                <div
                    onClick={() => { setDraftDescription(quest.description); setEditingField("description") }}
                    style={{
                        whiteSpace: "pre-wrap",
                        padding: "0.5rem",
                        borderRadius: "4px",
                        border: "1px solid #555",
                        minHeight: "60px",
                        cursor: "pointer",
                        marginBottom: "1rem",
                        color: quest.description ? "#fff" : "#666"
                    }}
                    title="Click to edit"
                >
                    {quest.description || "Click to add description..."}
                </div>
            )}

            {editingField === "description" && (
                <button onClick={saveDescription} style={{ ...primaryButtonStyle, marginBottom: "1rem" }}>Save Description</button>
            )}

            {mentions.length > 0 && (
                <div style={{
                    borderTop: "1px solid #555",
                    paddingTop: "0.75rem",
                    marginTop: "0.5rem",
                    marginBottom: "1rem"
                }}>
                    <strong>Session mentions ({mentions.length})</strong>
                    {mentions.map(({ note, session }) => (
                        <div
                            key={note.id}
                            style={{
                                border: "1px solid #ddd",
                                borderRadius: "4px",
                                padding: "0.5rem",
                                marginTop: "0.5rem",
                                backgroundColor: QUEST_COLOR,
                                color: "#222",
                                cursor: "pointer"
                            }}
                            onClick={() => goToSession(session.id, note.id)}
                        >
                            <div style={{ fontSize: "0.8rem", color: "#666", marginBottom: "0.25rem" }}>
                                Session {session.session_number} — {session.date}
                            </div>
                            <div style={{ fontSize: "0.9rem", color: "#333" }}>
                                <LoreNoteText
                                    text={note.text}
                                    loreEntries={data.lore}
                                    members={data.members}
                                    quests={data.quests}
                                    projects={data.projects}
                                    onLoreClick={openLoreDetail}
                                    onMemberClick={openMemberDetail}
                                    onQuestClick={openQuestDetail}
                                    onProjectClick={openProjectDetail}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div style={{ marginTop: "2rem", borderTop: "1px solid #555", paddingTop: "1rem" }}>
                <button
                    onClick={handleDelete}
                    style={{ backgroundColor: "#c0392b", color: "#fff", border: "none", padding: "0.5rem 1rem", cursor: "pointer", borderRadius: "4px" }}
                >
                    Delete Quest
                </button>
            </div>
        </>
    )
}
