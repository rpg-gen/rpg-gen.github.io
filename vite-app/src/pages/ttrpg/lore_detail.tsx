import { useEffect } from "react"
import { useParams, useNavigate, useLocation, useOutletContext } from "react-router-dom"
import LoreDetailView from "../../components/ttrpg/lore_detail_view"
import { nav_paths } from "../../configs/constants"
import { CampaignLayoutContext } from "./campaign_layout"

export default function LoreDetail() {
    const { campaignId, loreId } = useParams<{ campaignId: string; loreId: string }>()
    const navigate = useNavigate()
    const location = useLocation()
    const { data, isLoading, loreHook, notesHook, membersHook, updateMembers } = useOutletContext<CampaignLayoutContext>()

    const cameFromSessionId = (location.state as { fromSessionId?: string } | null)?.fromSessionId ?? null

    useEffect(() => {
        if (cameFromSessionId) window.history.replaceState({}, "")
    }, [cameFromSessionId])

    const entry = data.lore.find(e => e.id === loreId)

    function openLoreDetail(entryId: string) {
        navigate(`${nav_paths.rpg_notes}/${campaignId}/lore/${entryId}`)
    }

    function openMemberDetail(memberId: string) {
        navigate(`${nav_paths.rpg_notes}/${campaignId}/party/${memberId}`)
    }

    function openQuestDetail(questId: string) {
        navigate(`${nav_paths.rpg_notes}/${campaignId}/quest/${questId}`)
    }

    function openProjectDetail(projectId: string) {
        navigate(`${nav_paths.rpg_notes}/${campaignId}/project/${projectId}`)
    }

    function goToSession(sessionId: string, noteId?: string) {
        navigate(`${nav_paths.rpg_notes}/${campaignId}/session/${sessionId}`, {
            ...(noteId ? { state: { highlightNoteId: noteId } } : {})
        })
    }

    function backToOriginSession() {
        if (cameFromSessionId) {
            navigate(`${nav_paths.rpg_notes}/${campaignId}/session/${cameFromSessionId}`)
        }
    }

    if (!isLoading && !entry) {
        return (
            <div>
                <button onClick={() => navigate(`${nav_paths.rpg_notes}/${campaignId}/lore`)}>Back to Lore</button>
                <p>Entry not found.</p>
            </div>
        )
    }

    if (!entry) {
        return <div>Loading...</div>
    }

    return (
        <LoreDetailView
            entry={entry}
            data={data}
            loreHook={loreHook}
            notesHook={notesHook}
            membersHook={membersHook}
            updateMembers={updateMembers}
            goToSession={goToSession}
            openLoreDetail={openLoreDetail}
            openMemberDetail={openMemberDetail}
            openQuestDetail={openQuestDetail}
            openProjectDetail={openProjectDetail}
            cameFromSessionId={cameFromSessionId}
            backToOriginSession={backToOriginSession}
            clearCameFromSessionId={() => {}}
            onBack={() => navigate(`${nav_paths.rpg_notes}/${campaignId}/lore`)}
            onDelete={() => navigate(`${nav_paths.rpg_notes}/${campaignId}/lore`)}
            onAddPersonToFaction={(factionId) => {
                navigate(`${nav_paths.rpg_notes}/${campaignId}/lore`, {
                    state: { addPersonToFaction: factionId }
                })
            }}
        />
    )
}
