import { useState } from "react"
import { useNavigate } from "react-router-dom"
import TtrpgQuest from "../../types/ttrpg/TtrpgQuest"
import TtrpgProject from "../../types/ttrpg/TtrpgProject"
import { TtrpgProjectContribution } from "../../types/ttrpg/TtrpgProject"
import TtrpgMember from "../../types/ttrpg/TtrpgMember"
import TtrpgSession from "../../types/ttrpg/TtrpgSession"
import TtrpgPartyResources from "../../types/ttrpg/TtrpgPartyResources"
import ProjectsSection from "./projects_section"
import { cardStyle, primaryButtonStyle } from "../../pages/ttrpg/campaign_detail_styles"
import { ttrpg, themeStyles } from "../../configs/ttrpg_theme"
import { nav_paths } from "../../configs/constants"
import { QUEST_COLOR } from "../../configs/ttrpg_constants"

interface QuestsHook {
    createQuest: (quest: Omit<TtrpgQuest, 'id' | 'campaign_id'>) => Promise<string>
    updateQuest: (id: string, quest: Partial<Omit<TtrpgQuest, 'id' | 'campaign_id'>>) => Promise<void>
}

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

interface QuestsTabProps {
    campaignId: string
    quests: TtrpgQuest[]
    sessions: TtrpgSession[]
    questsHook: QuestsHook
    updateQuests: (updater: (quests: TtrpgQuest[]) => TtrpgQuest[]) => void
    projects: TtrpgProject[]
    members: TtrpgMember[]
    partyResources: TtrpgPartyResources
    projectsHook: ProjectsHook
    updateProjects: (updater: (projects: TtrpgProject[]) => TtrpgProject[]) => void
}

function getSessionNumber(sessions: TtrpgSession[], sessionId?: string): number {
    if (!sessionId) return -1
    const session = sessions.find(s => s.id === sessionId)
    return session ? session.session_number : -1
}

function sortQuests(quests: TtrpgQuest[], sessions: TtrpgSession[]): TtrpgQuest[] {
    return [...quests].sort((a, b) => {
        // Active quests first
        if (a.completed !== b.completed) return a.completed ? 1 : -1
        // Within each group: session number desc, then created_at desc
        const sessionA = getSessionNumber(sessions, a.session_id)
        const sessionB = getSessionNumber(sessions, b.session_id)
        if (sessionA !== sessionB) return sessionB - sessionA
        return b.created_at.localeCompare(a.created_at)
    })
}

export default function QuestsTab({
    campaignId, quests, sessions, questsHook, updateQuests,
    projects, members, partyResources, projectsHook, updateProjects
}: QuestsTabProps) {
    const navigate = useNavigate()
    const [isAdding, setIsAdding] = useState(false)
    const [newTitle, setNewTitle] = useState("")
    const [errorBanner, setErrorBanner] = useState<string | null>(null)

    const latestSession = sessions.length > 0
        ? sessions.reduce((a, b) => a.session_number > b.session_number ? a : b)
        : null

    function getSessionLabel(sessionId?: string): string {
        if (!sessionId) return ""
        const session = sessions.find(s => s.id === sessionId)
        if (!session) return ""
        return `Session ${session.session_number}`
    }

    async function handleCreate() {
        const title = newTitle.trim()
        if (!title) return

        const tempId = "temp-" + crypto.randomUUID()
        const newQuest: TtrpgQuest = {
            id: tempId,
            campaign_id: campaignId,
            short_title: title,
            description: "",
            completed: false,
            created_at: new Date().toISOString(),
            ...(latestSession ? { session_id: latestSession.id } : {})
        }

        updateQuests(prev => [...prev, newQuest])
        setNewTitle("")
        setIsAdding(false)

        try {
            await questsHook.createQuest({
                short_title: title,
                description: "",
                completed: false,
                created_at: new Date().toISOString(),
                ...(latestSession ? { session_id: latestSession.id } : {})
            })
        } catch {
            setErrorBanner("Failed to create quest")
            updateQuests(prev => prev.filter(q => q.id !== tempId))
        }
    }

    async function handleToggleComplete(e: React.MouseEvent, quest: TtrpgQuest) {
        e.stopPropagation()
        const newCompleted = !quest.completed
        updateQuests(prev => prev.map(q => q.id === quest.id ? { ...q, completed: newCompleted } : q))
        try {
            await questsHook.updateQuest(quest.id, { completed: newCompleted })
        } catch {
            setErrorBanner("Failed to update quest")
            updateQuests(prev => prev.map(q => q.id === quest.id ? { ...q, completed: quest.completed } : q))
        }
    }

    const sorted = sortQuests(quests, sessions)

    return (
        <div>
            <h3 style={{ marginTop: 0, marginBottom: "0.5rem", fontFamily: ttrpg.fonts.heading }}>Quests</h3>
            {errorBanner && (
                <div style={themeStyles.errorBanner}>
                    <span>{errorBanner}</span>
                    <button
                        onClick={() => setErrorBanner(null)}
                        className="ttrpg-btn-ghost"
                        style={{ ...themeStyles.ghostButton, color: ttrpg.colors.brokenLinkText, fontWeight: "bold", fontSize: "1rem" }}
                    >
                        ✕
                    </button>
                </div>
            )}

            {!isAdding ? (
                <button onClick={() => setIsAdding(true)} className="ttrpg-btn-primary" style={{ ...primaryButtonStyle, marginBottom: "1rem" }}>
                    + Add Quest
                </button>
            ) : (
                <div style={{ ...cardStyle, marginBottom: "1rem" }}>
                    <input
                        type="text"
                        value={newTitle}
                        onChange={e => setNewTitle(e.target.value)}
                        placeholder="Quest title..."
                        autoFocus
                        style={{ width: "100%", padding: "0.5rem", boxSizing: "border-box", marginBottom: "0.5rem" }}
                        onKeyDown={e => { if (e.key === "Enter") handleCreate() }}
                    />
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button onClick={handleCreate} className="ttrpg-btn-primary" style={primaryButtonStyle}>Add</button>
                        <button onClick={() => { setIsAdding(false); setNewTitle("") }}>Cancel</button>
                    </div>
                </div>
            )}

            {quests.length === 0 && !isAdding && (
                <div style={{ textAlign: "center", padding: "2rem", color: "#666" }}>No quests yet.</div>
            )}

            {sorted.map(quest => {
                const sessionLabel = getSessionLabel(quest.session_id)
                return (
                    <div
                        key={quest.id}
                        className="ttrpg-card"
                        style={{
                            ...themeStyles.entityCard(QUEST_COLOR),
                            cursor: "pointer",
                            opacity: quest.completed ? 0.5 : 1,
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "0.5rem"
                        }}
                        onClick={() => navigate(`${nav_paths.rpg_notes}/${campaignId}/quest/${quest.id}`)}
                    >
                        <button
                            onClick={(e) => handleToggleComplete(e, quest)}
                            title={quest.completed ? "Mark active" : "Mark complete"}
                            className="ttrpg-toggle"
                            style={{ ...themeStyles.toggleCircle(quest.completed), marginTop: "0.1rem" }}
                        >
                            ✓
                        </button>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <strong style={{ textDecoration: quest.completed ? "line-through" : "none" }}>
                                    {quest.short_title}
                                </strong>
                                {sessionLabel && (
                                    <span style={{
                                        fontSize: "0.75rem",
                                        backgroundColor: QUEST_COLOR,
                                        color: "#222",
                                        padding: "0.1rem 0.4rem",
                                        borderRadius: "3px"
                                    }}>
                                        {sessionLabel}
                                    </span>
                                )}
                            </div>
                            {quest.description && (
                                <div style={{
                                    color: "#555",
                                    fontSize: "0.9rem",
                                    marginTop: "0.25rem",
                                    display: "-webkit-box",
                                    WebkitLineClamp: 3,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                    whiteSpace: "pre-wrap",
                                    textDecoration: quest.completed ? "line-through" : "none"
                                }}>
                                    {quest.description}
                                </div>
                            )}
                        </div>
                    </div>
                )
            })}

            <div style={{ ...themeStyles.sectionDividerOnDark, marginTop: "1.5rem" }}>
                <h3 style={{ marginTop: 0, marginBottom: "0.5rem", fontFamily: ttrpg.fonts.heading }}>Projects</h3>
                <ProjectsSection
                    campaignId={campaignId}
                    projects={projects}
                    members={members}
                    sessions={sessions}
                    partyResources={partyResources}
                    projectsHook={projectsHook}
                    updateProjects={updateProjects}
                />
            </div>
        </div>
    )
}
