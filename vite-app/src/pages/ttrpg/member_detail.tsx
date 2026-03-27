import { useEffect } from "react"
import { useParams, useNavigate, useLocation, useOutletContext } from "react-router-dom"
import MemberDetailView from "../../components/ttrpg/member_detail_view"
import { nav_paths } from "../../configs/constants"
import { CampaignLayoutContext } from "./campaign_layout"

export default function MemberDetail() {
    const { campaignId, memberId } = useParams<{ campaignId: string; memberId: string }>()
    const navigate = useNavigate()
    const location = useLocation()
    const {
        data, isLoading, membersHook, notesHook, partyResourcesHook,
        updateMembers, updatePartyResources
    } = useOutletContext<CampaignLayoutContext>()

    const cameFromSessionId = (location.state as { fromSessionId?: string } | null)?.fromSessionId ?? null

    useEffect(() => {
        if (cameFromSessionId) window.history.replaceState({}, "")
    }, [cameFromSessionId])

    const member = data.members.find(m => m.id === memberId)

    function openLoreDetail(entryId: string) {
        navigate(`${nav_paths.rpg_notes}/${campaignId}/lore/${entryId}`, {
            state: { fromMemberId: memberId, fromMemberName: member?.name }
        })
    }

    function openMemberDetail(id: string) {
        navigate(`${nav_paths.rpg_notes}/${campaignId}/party/${id}`)
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

    if (!isLoading && !member) {
        return (
            <div>
                <button onClick={() => navigate(`${nav_paths.rpg_notes}/${campaignId}/party`)}>Back to Party</button>
                <p>Member not found.</p>
            </div>
        )
    }

    if (!member) {
        return <div>Loading...</div>
    }

    return (
        <MemberDetailView
            member={member}
            campaignId={campaignId!}
            data={data}
            membersHook={membersHook}
            notesHook={notesHook}
            partyResourcesHook={partyResourcesHook}
            updateMembers={updateMembers}
            updatePartyResources={updatePartyResources}
            openLoreDetail={openLoreDetail}
            openMemberDetail={openMemberDetail}
            goToSession={goToSession}
            cameFromSessionId={cameFromSessionId}
            backToOriginSession={backToOriginSession}
            clearCameFromSessionId={() => {}}
            onBack={() => navigate(`${nav_paths.rpg_notes}/${campaignId}/party`)}
            onDelete={() => navigate(`${nav_paths.rpg_notes}/${campaignId}/party`)}
        />
    )
}
