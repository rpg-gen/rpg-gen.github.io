import { useParams, useOutletContext, Navigate } from "react-router-dom"
import SessionsTab from "../../components/ttrpg/sessions_tab"
import PartyTab from "../../components/ttrpg/party_tab"
import LoreTab from "../../components/ttrpg/lore_tab"
import QuestsTab from "../../components/ttrpg/quests_tab"
import { CampaignLayoutContext } from "./campaign_layout"
import { CampaignTab } from "../../components/ttrpg/campaign_tab_bar"

export default function CampaignDetail() {
    const ctx = useOutletContext<CampaignLayoutContext>()
    const { tab } = useParams<{ tab: string }>()
    const {
        campaignId, data,
        sessionsHook, membersHook, partyResourcesHook,
        updateMembers, updateSessions, updateProjects, updatePartyResources,
        questsHook, projectsHook, loreHook,
    } = ctx

    const validTabs: CampaignTab[] = ["sessions", "party", "lore", "quests"]
    if (!tab || !validTabs.includes(tab as CampaignTab)) {
        return <Navigate to="../sessions" replace />
    }

    return (
        <>
            {tab === "sessions" && (
                <SessionsTab
                    campaignId={campaignId}
                    sessions={data.sessions}
                    sessionsHook={sessionsHook}
                    updateSessions={updateSessions}
                />
            )}

            {tab === "party" && (
                <PartyTab
                    campaignId={campaignId}
                    data={data}
                    membersHook={membersHook}
                    partyResourcesHook={partyResourcesHook}
                    updateMembers={updateMembers}
                    updatePartyResources={updatePartyResources}
                />
            )}

            {tab === "quests" && (
                <QuestsTab
                    campaignId={campaignId}
                    quests={data.quests}
                    sessions={data.sessions}
                    questsHook={questsHook}
                    updateQuests={ctx.updateQuests}
                    projects={data.projects}
                    members={data.members}
                    partyResources={data.partyResources}
                    projectsHook={projectsHook}
                    updateProjects={updateProjects}
                />
            )}

            {tab === "lore" && (
                <LoreTab
                    campaignId={campaignId}
                    data={data}
                    loreHook={loreHook}
                />
            )}
        </>
    )
}
