import { useState } from "react"
import { useNavigate } from "react-router-dom"
import TtrpgProject from "../../types/ttrpg/TtrpgProject"
import { TtrpgProjectContribution } from "../../types/ttrpg/TtrpgProject"
import TtrpgMember from "../../types/ttrpg/TtrpgMember"
import TtrpgSession from "../../types/ttrpg/TtrpgSession"
import TtrpgPartyResources from "../../types/ttrpg/TtrpgPartyResources"
import ProjectProgressBar from "./project_progress_bar"
import AddPointsModal from "./add_points_modal"
import { cardStyle, primaryButtonStyle } from "../../pages/ttrpg/campaign_detail_styles"
import { ttrpg, themeStyles } from "../../configs/ttrpg_theme"
import { nav_paths } from "../../configs/constants"

interface ProjectsHook {
    createProject: (project: Pick<TtrpgProject, 'title' | 'description' | 'point_total'>) => Promise<string>
    updateProject: (id: string, updates: Partial<Omit<TtrpgProject, 'id' | 'campaign_id'>>) => Promise<void>
    addContribution: (
        projectId: string,
        currentContributions: TtrpgProjectContribution[],
        currentPoints: number,
        contribution: TtrpgProjectContribution
    ) => Promise<void>
}

interface ProjectsSectionProps {
    campaignId: string
    projects: TtrpgProject[]
    members: TtrpgMember[]
    sessions: TtrpgSession[]
    partyResources: TtrpgPartyResources
    projectsHook: ProjectsHook
    updateProjects: (updater: (projects: TtrpgProject[]) => TtrpgProject[]) => void
}

function sortProjects(projects: TtrpgProject[]): TtrpgProject[] {
    return [...projects].sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1
        return (b.last_contributed_at || b.created_at).localeCompare(a.last_contributed_at || a.created_at)
    })
}

export default function ProjectsSection({
    campaignId, projects, members, sessions, partyResources, projectsHook, updateProjects
}: ProjectsSectionProps) {
    const navigate = useNavigate()
    const [isAdding, setIsAdding] = useState(false)
    const [newTitle, setNewTitle] = useState("")
    const [newPointTotal, setNewPointTotal] = useState("100")
    const [newDescription, setNewDescription] = useState("")
    const [addPointsProjectId, setAddPointsProjectId] = useState<string | null>(null)
    const [errorBanner, setErrorBanner] = useState<string | null>(null)

    async function handleCreate() {
        const title = newTitle.trim()
        if (!title) return
        const pointTotal = parseInt(newPointTotal) || 100
        if (pointTotal < 1 || pointTotal > 9999) return

        const tempId = "temp-" + crypto.randomUUID()
        const newProject: TtrpgProject = {
            id: tempId, campaign_id: campaignId, title, description: newDescription.trim(),
            point_total: pointTotal, current_points: 0, completed: false,
            created_at: new Date().toISOString(), contributions: [], last_contributed_at: ""
        }

        updateProjects(prev => [...prev, newProject])
        setNewTitle(""); setNewPointTotal("100"); setNewDescription(""); setIsAdding(false)

        try {
            await projectsHook.createProject({ title, description: newDescription.trim(), point_total: pointTotal })
        } catch {
            setErrorBanner("Failed to create project")
            updateProjects(prev => prev.filter(p => p.id !== tempId))
        }
    }

    function handleAddPoints(contribution: TtrpgProjectContribution) {
        if (!addPointsProjectId) return
        const project = projects.find(p => p.id === addPointsProjectId)
        if (!project) return

        updateProjects(prev => prev.map(p =>
            p.id === addPointsProjectId
                ? { ...p, current_points: p.current_points + contribution.points, contributions: [...p.contributions, contribution], last_contributed_at: new Date().toISOString() }
                : p
        ))
        setAddPointsProjectId(null)

        projectsHook.addContribution(addPointsProjectId, project.contributions, project.current_points, contribution)
            .catch(() => {
                setErrorBanner("Failed to add points")
                updateProjects(prev => prev.map(p =>
                    p.id === addPointsProjectId
                        ? { ...p, current_points: p.current_points - contribution.points, contributions: p.contributions.slice(0, -1) }
                        : p
                ))
            })
    }

    async function handleToggleComplete(e: React.MouseEvent, project: TtrpgProject) {
        e.stopPropagation()
        const newCompleted = !project.completed
        updateProjects(prev => prev.map(p => p.id === project.id ? { ...p, completed: newCompleted } : p))
        try {
            await projectsHook.updateProject(project.id, { completed: newCompleted })
        } catch {
            setErrorBanner("Failed to update project")
            updateProjects(prev => prev.map(p => p.id === project.id ? { ...p, completed: project.completed } : p))
        }
    }

    const sorted = sortProjects(projects)

    return (
        <div>
            {errorBanner && (
                <div style={themeStyles.errorBanner}>
                    <span>{errorBanner}</span>
                    <button onClick={() => setErrorBanner(null)} className="ttrpg-btn-ghost" style={{ ...themeStyles.ghostButton, color: ttrpg.colors.brokenLinkText, fontWeight: "bold", fontSize: "1rem" }}>✕</button>
                </div>
            )}

            {!isAdding ? (
                <button onClick={() => setIsAdding(true)} className="ttrpg-btn-primary" style={{ ...primaryButtonStyle, marginBottom: "1rem" }}>
                    + Add Project
                </button>
            ) : (
                <div style={{ ...cardStyle, marginBottom: "1rem" }}>
                    <input
                        type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)}
                        placeholder="Project title..." autoFocus
                        style={{ width: "100%", padding: "0.5rem", boxSizing: "border-box", marginBottom: "0.5rem" }}
                        onKeyDown={e => { if (e.key === "Enter") handleCreate() }}
                    />
                    <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem", alignItems: "center" }}>
                        <label style={{ fontSize: "0.85rem" }}>Point Total:</label>
                        <input
                            type="number" value={newPointTotal} onChange={e => setNewPointTotal(e.target.value)}
                            min="1" max="9999"
                            style={{ width: "5rem", padding: "0.4rem" }}
                        />
                    </div>
                    <textarea
                        value={newDescription} onChange={e => setNewDescription(e.target.value)}
                        placeholder="Description (optional)..."
                        style={{ width: "100%", padding: "0.5rem", boxSizing: "border-box", minHeight: "40px", marginBottom: "0.5rem", resize: "vertical" }}
                    />
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button onClick={handleCreate} className="ttrpg-btn-primary" style={primaryButtonStyle}>Add</button>
                        <button onClick={() => { setIsAdding(false); setNewTitle(""); setNewPointTotal("100"); setNewDescription("") }}>Cancel</button>
                    </div>
                </div>
            )}

            {projects.length === 0 && !isAdding && (
                <div style={{ textAlign: "center", padding: "1rem", color: "#666" }}>No projects yet.</div>
            )}

            {sorted.map(project => (
                <div
                    key={project.id}
                    className="ttrpg-card"
                    style={{
                        ...themeStyles.entityCard(ttrpg.colors.project),
                        cursor: "pointer",
                        opacity: project.completed ? 0.5 : 1
                    }}
                    onClick={() => navigate(`${nav_paths.rpg_notes}/${campaignId}/project/${project.id}`)}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                        <button
                            onClick={(e) => handleToggleComplete(e, project)}
                            title={project.completed ? "Reopen" : "Mark complete"}
                            className="ttrpg-toggle"
                            style={themeStyles.toggleCircle(project.completed)}
                        >
                            ✓
                        </button>
                        <strong style={{ textDecoration: project.completed ? "line-through" : "none", flex: 1 }}>
                            {project.title}
                        </strong>
                        <button
                            onClick={(e) => { e.stopPropagation(); setAddPointsProjectId(project.id) }}
                            style={{ fontSize: "0.8rem", padding: "0.2rem 0.5rem", borderRadius: "3px", border: "1px solid #ccc", backgroundColor: "#f0f0f0", cursor: "pointer" }}
                        >
                            + Points
                        </button>
                    </div>
                    <ProjectProgressBar current={project.current_points} total={project.point_total} completed={project.completed} />
                    {project.description && (
                        <div style={{
                            color: "#555", fontSize: "0.85rem", marginTop: "0.25rem",
                            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                            overflow: "hidden", textDecoration: project.completed ? "line-through" : "none"
                        }}>
                            {project.description}
                        </div>
                    )}
                </div>
            ))}

            {addPointsProjectId && (
                <AddPointsModal
                    members={members}
                    sessions={sessions}
                    partyResources={partyResources}
                    onSubmit={handleAddPoints}
                    onDismiss={() => setAddPointsProjectId(null)}
                />
            )}
        </div>
    )
}
