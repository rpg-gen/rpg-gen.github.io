import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate, useOutletContext } from "react-router-dom"
import TtrpgSessionNote from "../../types/ttrpg/TtrpgSessionNote"
import TtrpgSession from "../../types/ttrpg/TtrpgSession"
import { TtrpgProjectContribution } from "../../types/ttrpg/TtrpgProject"
import AutoResizeTextarea from "../../components/ttrpg/auto_resize_textarea"
import LoreNoteText from "../../components/ttrpg/lore_note_text"
import ProjectProgressBar from "../../components/ttrpg/project_progress_bar"
import AddPointsModal from "../../components/ttrpg/add_points_modal"
import ContributionList from "../../components/ttrpg/contribution_list"
import { nav_paths } from "../../configs/constants"
import { primaryButtonStyle } from "./campaign_detail_styles"
import { PROJECT_COLOR } from "../../configs/ttrpg_constants"
import { CampaignLayoutContext } from "./campaign_layout"

export default function ProjectDetail() {
    const { campaignId, projectId } = useParams<{ campaignId: string; projectId: string }>()
    const navigate = useNavigate()
    const { data, isLoading, projectsHook, notesHook } = useOutletContext<CampaignLayoutContext>()

    const [draftTitle, setDraftTitle] = useState("")
    const [draftDescription, setDraftDescription] = useState("")
    const [draftPointTotal, setDraftPointTotal] = useState("")
    const [editingField, setEditingField] = useState<"title" | "description" | "point_total" | null>(null)
    const editingFieldRef = useRef(editingField)
    editingFieldRef.current = editingField

    const [showAddPoints, setShowAddPoints] = useState(false)
    const [showReducePoints, setShowReducePoints] = useState(false)

    const project = data.projects.find(p => p.id === projectId)

    useEffect(() => {
        if (!project) return
        if (editingFieldRef.current !== "title") setDraftTitle(project.title)
        if (editingFieldRef.current !== "description") setDraftDescription(project.description)
        if (editingFieldRef.current !== "point_total") setDraftPointTotal(String(project.point_total))
    }, [project])

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
        if (!trimmed || !project || trimmed === project.title) return

        const oldName = project.title
        try {
            await projectsHook.updateProject(projectId!, { title: trimmed })

            const pattern = new RegExp(`\\[\\[${oldName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\]\\]`, "gi")
            for (const note of data.notes) {
                if (pattern.test(note.text)) {
                    const updatedText = note.text.replace(pattern, `[[${trimmed}]]`)
                    await notesHook.updateNote(note.id, { text: updatedText })
                }
            }
        } catch (error) {
            console.error("Error updating project title:", error)
        }
    }

    async function saveDescription() {
        setEditingField(null)
        if (!project || draftDescription === project.description) return
        try {
            await projectsHook.updateProject(projectId!, { description: draftDescription })
        } catch (error) {
            console.error("Error updating project description:", error)
        }
    }

    async function savePointTotal() {
        setEditingField(null)
        const val = parseInt(draftPointTotal)
        if (!val || val < 1 || val > 9999 || !project || val === project.point_total) return
        try {
            await projectsHook.updateProject(projectId!, { point_total: val })
        } catch (error) {
            console.error("Error updating point total:", error)
        }
    }

    async function handleToggleComplete() {
        if (!project) return
        try {
            await projectsHook.updateProject(projectId!, { completed: !project.completed })
        } catch (error) {
            console.error("Error toggling project completion:", error)
        }
    }

    function handleAddPointsSubmit(contribution: TtrpgProjectContribution) {
        if (!project) return
        setShowAddPoints(false)
        projectsHook.addContribution(projectId!, project.contributions, project.current_points, contribution)
            .catch(error => console.error("Error adding contribution:", error))
    }

    function handleReducePointsSubmit(contribution: TtrpgProjectContribution) {
        if (!project) return
        const negative = { ...contribution, points: -Math.abs(contribution.points) }
        setShowReducePoints(false)
        projectsHook.addContribution(projectId!, project.contributions, project.current_points, negative)
            .catch(error => console.error("Error reducing points:", error))
    }

    async function handleDelete() {
        if (!confirm("Delete this project?")) return
        try {
            await projectsHook.deleteProject(projectId!)
            goBack()
        } catch (error) {
            console.error("Error deleting project:", error)
        }
    }

    if (isLoading && !project) return <div>Loading...</div>

    if (!project) {
        return (
            <div>
                <p>Project not found.</p>
                <button onClick={goBack}>Back to Goals</button>
            </div>
        )
    }

    function handleUpdateContributions(updated: TtrpgProjectContribution[]) {
        projectsHook.updateContributions(projectId!, updated)
            .catch(error => console.error("Error updating contributions:", error))
    }

    const mentions: { note: TtrpgSessionNote; session: TtrpgSession }[] = []
    for (const note of data.notes) {
        if (note.text.toLowerCase().includes(`[[${project.title.toLowerCase()}]]`)) {
            const session = data.sessions.find(s => s.id === note.session_id)
            if (session) mentions.push({ note, session })
        }
    }
    mentions.sort((a, b) =>
        a.session.session_number - b.session.session_number
        || a.note.created_at.localeCompare(b.note.created_at)
    )

    return (
        <>
            <div style={{ marginBottom: "1rem" }}>
                <button onClick={goBack}>Back to Goals</button>
            </div>

            {editingField === "title" ? (
                <input
                    type="text" value={draftTitle} onChange={e => setDraftTitle(e.target.value)}
                    onBlur={saveTitle} onKeyDown={e => { if (e.key === "Enter") saveTitle() }}
                    autoFocus
                    style={{ width: "100%", padding: "0.5rem", boxSizing: "border-box", fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}
                />
            ) : (
                <h2
                    onClick={() => { setDraftTitle(project.title); setEditingField("title") }}
                    style={{ cursor: "pointer", marginBottom: "1rem", textDecoration: project.completed ? "line-through" : "none" }}
                    title="Click to edit"
                >
                    {project.title}
                </h2>
            )}

            <div style={{ marginBottom: "1rem" }}>
                <ProjectProgressBar current={project.current_points} total={project.point_total} completed={project.completed} />
            </div>

            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap", alignItems: "center" }}>
                <button
                    onClick={handleToggleComplete}
                    style={{
                        backgroundColor: project.completed ? "#27ae60" : "transparent",
                        color: project.completed ? "#fff" : "#27ae60",
                        border: "2px solid #27ae60", padding: "0.4rem 0.75rem",
                        borderRadius: "4px", cursor: "pointer", fontWeight: "bold"
                    }}
                >
                    {project.completed ? "✓ Completed" : "Mark Complete"}
                </button>
                <button onClick={() => setShowAddPoints(true)} style={primaryButtonStyle}>+ Add Points</button>
                <button onClick={() => setShowReducePoints(true)}>- Reduce Points</button>
            </div>

            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "1rem" }}>
                <strong>Point Total:</strong>
                {editingField === "point_total" ? (
                    <input
                        type="number" value={draftPointTotal} onChange={e => setDraftPointTotal(e.target.value)}
                        onBlur={savePointTotal} onKeyDown={e => { if (e.key === "Enter") savePointTotal() }}
                        min="1" max="9999" autoFocus
                        style={{ width: "5rem", padding: "0.4rem" }}
                    />
                ) : (
                    <span
                        onClick={() => { setDraftPointTotal(String(project.point_total)); setEditingField("point_total") }}
                        style={{ cursor: "pointer", textDecoration: "underline", textDecorationColor: "#ccc" }}
                        title="Click to edit"
                    >
                        {project.point_total}
                    </span>
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
                    onClick={() => { setDraftDescription(project.description); setEditingField("description") }}
                    style={{
                        whiteSpace: "pre-wrap", padding: "0.5rem", borderRadius: "4px",
                        border: "1px solid #555", minHeight: "60px", cursor: "pointer",
                        marginBottom: "1rem", color: project.description ? "#fff" : "#666"
                    }}
                    title="Click to edit"
                >
                    {project.description || "Click to add description..."}
                </div>
            )}
            {editingField === "description" && (
                <button onClick={saveDescription} style={{ ...primaryButtonStyle, marginBottom: "1rem" }}>Save Description</button>
            )}

            <ContributionList
                contributions={project.contributions}
                sessions={data.sessions}
                onUpdate={handleUpdateContributions}
            />

            {mentions.length > 0 && (
                <div style={{ borderTop: "1px solid #555", paddingTop: "0.75rem", marginBottom: "1rem" }}>
                    <strong>Session mentions ({mentions.length})</strong>
                    {mentions.map(({ note, session }) => (
                        <div
                            key={note.id}
                            style={{
                                border: "1px solid #ddd", borderRadius: "4px", padding: "0.5rem",
                                marginTop: "0.5rem", backgroundColor: PROJECT_COLOR, color: "#222", cursor: "pointer"
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
                    Delete Project
                </button>
            </div>

            {showAddPoints && (
                <AddPointsModal
                    members={data.members} sessions={data.sessions} partyResources={data.partyResources}
                    onSubmit={handleAddPointsSubmit} onDismiss={() => setShowAddPoints(false)}
                />
            )}
            {showReducePoints && (
                <AddPointsModal
                    members={data.members} sessions={data.sessions} partyResources={data.partyResources}
                    onSubmit={handleReducePointsSubmit} onDismiss={() => setShowReducePoints(false)}
                    allowNegative
                />
            )}
        </>
    )
}
