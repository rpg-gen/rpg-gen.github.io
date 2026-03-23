import { useNavigate, useOutletContext } from "react-router-dom"
import SessionsTab from "../../components/ttrpg/sessions_tab"
import PartyTab from "../../components/ttrpg/party_tab"
import LoreTab from "../../components/ttrpg/lore_tab"
import QuestsTab from "../../components/ttrpg/quests_tab"
import { nav_paths } from "../../configs/constants"
import { CampaignLayoutContext } from "./campaign_layout"

export default function CampaignDetail() {
    const ctx = useOutletContext<CampaignLayoutContext>()
    const navigate = useNavigate()
    const {
        campaignId, data, activeTab, switchToTab,
        sessionsHook, membersHook, notesHook, loreHook, questsHook, projectsHook, partyResourcesHook,
        updateMembers, updateSessions, updateQuests, updateProjects, updatePartyResources,
        pendingMemberDetailId, setPendingMemberDetailId,
        pendingLoreDetailId, setPendingLoreDetailId,
        cameFromSessionId, setCameFromSessionId,
        partyResetSignal, loreResetSignal
    } = ctx

    function openLoreDetail(entryId: string) {
        setPendingLoreDetailId(entryId)
        switchToTab("lore")
    }

    function openMemberDetail(memberId: string) {
        setPendingMemberDetailId(memberId)
        switchToTab("party")
    }

    function openQuestDetail(questId: string) {
        navigate(`${nav_paths.rpg_notes}/${campaignId}/quest/${questId}`)
    }

    function openProjectDetail(projectId: string) {
        navigate(`${nav_paths.rpg_notes}/${campaignId}/project/${projectId}`)
    }

    function backToOriginSession() {
        if (cameFromSessionId) {
            navigate(`${nav_paths.rpg_notes}/${campaignId}/session/${cameFromSessionId}`)
            setCameFromSessionId(null)
        }
    }

    function goToSession(sessionId: string, noteId?: string) {
        navigate(`${nav_paths.rpg_notes}/${campaignId}/session/${sessionId}`, {
            ...(noteId ? { state: { highlightNoteId: noteId } } : {})
        })
    }

    return (
        <>
            {activeTab === "sessions" && (
                <SessionsTab
                    campaignId={campaignId}
                    sessions={data.sessions}
                    notes={data.notes}
                    sessionsHook={sessionsHook}
                    notesHook={notesHook}
                    updateSessions={updateSessions}
                />
            )}

            {activeTab === "party" && (
                <PartyTab
                    campaignId={campaignId}
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
                    pendingDetailId={pendingMemberDetailId}
                    clearPendingDetailId={() => setPendingMemberDetailId(null)}
                    resetSignal={partyResetSignal}
                    clearCameFromSessionId={() => setCameFromSessionId(null)}
                />
            )}

            {activeTab === "quests" && (
                <QuestsTab
                    campaignId={campaignId}
                    quests={data.quests}
                    sessions={data.sessions}
                    questsHook={questsHook}
                    updateQuests={updateQuests}
                    projects={data.projects}
                    members={data.members}
                    partyResources={data.partyResources}
                    projectsHook={projectsHook}
                    updateProjects={updateProjects}
                />
            )}

            {activeTab === "lore" && (
                <LoreTab
                    data={data}
                    loreHook={loreHook}
                    notesHook={notesHook}
                    goToSession={goToSession}
                    openMemberDetail={openMemberDetail}
                    openQuestDetail={openQuestDetail}
                    openProjectDetail={openProjectDetail}
                    cameFromSessionId={cameFromSessionId}
                    backToOriginSession={backToOriginSession}
                    pendingDetailId={pendingLoreDetailId}
                    clearPendingDetailId={() => setPendingLoreDetailId(null)}
                    resetSignal={loreResetSignal}
                    clearCameFromSessionId={() => setCameFromSessionId(null)}
                />
            )}
        </>
    )
}
