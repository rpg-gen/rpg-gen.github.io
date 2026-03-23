import { useState, useEffect, useContext } from "react"
import { useParams, useNavigate, useLocation, useOutletContext } from "react-router-dom"
import TtrpgSession from "../../types/ttrpg/TtrpgSession"
import { LoreEntryType } from "../../types/ttrpg/TtrpgLoreEntry"
import SessionDetailNavBar from "../../components/ttrpg/session_detail_nav_bar"
import SessionDetailContent from "../../components/ttrpg/session_detail_content"
import { nav_paths } from "../../configs/constants"
import UserContext from "../../contexts/user_context"
import { CampaignLayoutContext } from "./campaign_layout"

export default function SessionDetail() {
    const { campaignId, sessionId } = useParams<{ campaignId: string; sessionId: string }>()
    const navigate = useNavigate()
    const location = useLocation()
    const user_context = useContext(UserContext)
    const { data, isLoading, sessionsHook, notesHook, loreHook } = useOutletContext<CampaignLayoutContext>()

    const [highlightNoteId, setHighlightNoteId] = useState<string | null>(null)

    useEffect(() => {
        const state = location.state as { highlightNoteId?: string } | null
        if (state?.highlightNoteId) {
            setHighlightNoteId(state.highlightNoteId)
            window.history.replaceState({}, "")
        }
    }, [location.state])

    async function handleSlashCreateLore(name: string, type: LoreEntryType, sid?: string) {
        try {
            await loreHook.createLoreEntry({
                type,
                name: name.trim(),
                subtitle: "",
                created_at: "",
                ...(sid ? { session_id: sid } : {})
            })
        } catch (error) {
            console.error("Error creating lore entry:", error)
            alert("Error creating lore entry")
        }
    }

    async function handleDateChange(newDate: string) {
        if (!currentSession) return
        try {
            await sessionsHook.updateSession(currentSession.id, { date: newDate })
        } catch (error) {
            console.error("Error updating session date:", error)
            alert("Error updating session date")
        }
    }

    async function handleRespiteChange(newCount: number) {
        if (!currentSession) return
        try {
            await sessionsHook.updateSession(currentSession.id, { respite_count: newCount })
        } catch (error) {
            console.error("Error updating respites:", error)
            alert("Error updating respites")
        }
    }

    async function handleTitleChange(newTitle: string) {
        if (!currentSession) return
        try {
            const update: Partial<TtrpgSession> = newTitle ? { title: newTitle } : { title: "" }
            await sessionsHook.updateSession(currentSession.id, update)
        } catch (error) {
            console.error("Error updating title:", error)
            alert("Error updating title")
        }
    }

    function openLoreDetail(entryId: string) {
        navigate(`${nav_paths.rpg_notes}/${campaignId}`, {
            state: { tab: "lore", detailId: entryId, fromSessionId: sessionId }
        })
    }

    function openMemberDetail(memberId: string) {
        navigate(`${nav_paths.rpg_notes}/${campaignId}`, {
            state: { tab: "party", detailId: memberId, fromSessionId: sessionId }
        })
    }

    function openQuestDetail(questId: string) {
        navigate(`${nav_paths.rpg_notes}/${campaignId}/quest/${questId}`)
    }

    function openProjectDetail(projectId: string) {
        navigate(`${nav_paths.rpg_notes}/${campaignId}/project/${projectId}`)
    }

    const sortedSessions = [...data.sessions].sort((a, b) => a.date.localeCompare(b.date))
    const currentIndex = sortedSessions.findIndex(s => s.id === sessionId)
    const currentSession = currentIndex >= 0 ? sortedSessions[currentIndex] : null

    function navigateToSession(id: string) {
        navigate(`${nav_paths.rpg_notes}/${campaignId}/session/${id}`, { replace: true })
    }

    if (!isLoading && !currentSession) {
        return (
            <div>
                <p>Session not found.</p>
                <button onClick={() => navigate(`${nav_paths.rpg_notes}/${campaignId}`)}>Back to Campaign</button>
            </div>
        )
    }

    if (!currentSession) {
        return <div>Loading session...</div>
    }

    return (
        <>
            <SessionDetailNavBar
                session={currentSession}
                totalSessions={sortedSessions.length}
                hasPrev={currentIndex > 0}
                hasNext={currentIndex < sortedSessions.length - 1}
                onPrev={() => navigateToSession(sortedSessions[currentIndex - 1].id)}
                onNext={() => navigateToSession(sortedSessions[currentIndex + 1].id)}
                onBack={() => navigate(`${nav_paths.rpg_notes}/${campaignId}`)}
                onDateChange={handleDateChange}
                onRespiteChange={handleRespiteChange}
                onTitleChange={handleTitleChange}
            />

            <SessionDetailContent
                key={currentSession.id}
                sessionId={currentSession.id}
                data={data}
                notesHook={notesHook}
                openLoreDetail={openLoreDetail}
                openMemberDetail={openMemberDetail}
                openQuestDetail={openQuestDetail}
                openProjectDetail={openProjectDetail}
                handleSlashCreateLore={handleSlashCreateLore}
                username={user_context.username || ""}
                highlightNoteId={highlightNoteId}
            />
        </>
    )
}
