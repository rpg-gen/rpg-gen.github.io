import { useState, useEffect, useContext } from "react"
import { useParams, useNavigate, useLocation, Outlet } from "react-router-dom"
import useFirebaseTtrpgCampaigns from "../../hooks/ttrpg/use_firebase_ttrpg_campaigns"
import useTtrpgCampaignData from "../../hooks/ttrpg/use_ttrpg_campaign_data"
import useDemoCampaignData from "../../hooks/ttrpg/use_demo_campaign_data"
import { readDemoCampaign } from "../../hooks/ttrpg/demo_storage"
import TtrpgCampaign from "../../types/ttrpg/TtrpgCampaign"
import FullPageOverlay from "../../components/full_page_overlay"
import CampaignTabBar, { CampaignTab } from "../../components/ttrpg/campaign_tab_bar"
import { nav_paths, page_layout } from "../../configs/constants"
import UserContext from "../../contexts/user_context"
import { ttrpg } from "../../configs/ttrpg_theme"

type Tab = CampaignTab

export interface CampaignLayoutContext {
    campaign: TtrpgCampaign | null
    campaignId: string
    data: ReturnType<typeof useTtrpgCampaignData>["data"]
    isLoading: boolean
    sessionsHook: ReturnType<typeof useTtrpgCampaignData>["sessionsHook"]
    membersHook: ReturnType<typeof useTtrpgCampaignData>["membersHook"]
    notesHook: ReturnType<typeof useTtrpgCampaignData>["notesHook"]
    loreHook: ReturnType<typeof useTtrpgCampaignData>["loreHook"]
    questsHook: ReturnType<typeof useTtrpgCampaignData>["questsHook"]
    projectsHook: ReturnType<typeof useTtrpgCampaignData>["projectsHook"]
    partyResourcesHook: ReturnType<typeof useTtrpgCampaignData>["partyResourcesHook"]
    updateMembers: ReturnType<typeof useTtrpgCampaignData>["updateMembers"]
    updateSessions: ReturnType<typeof useTtrpgCampaignData>["updateSessions"]
    updateQuests: ReturnType<typeof useTtrpgCampaignData>["updateQuests"]
    updateProjects: ReturnType<typeof useTtrpgCampaignData>["updateProjects"]
    updatePartyResources: ReturnType<typeof useTtrpgCampaignData>["updatePartyResources"]
}

export default function CampaignLayout() {
    const { campaignId } = useParams<{ campaignId: string }>()
    const navigate = useNavigate()
    const location = useLocation()
    const user_context = useContext(UserContext)
    const isDemoMode = !user_context.is_logged_in

    const firebaseCampaignsHook = useFirebaseTtrpgCampaigns()
    const firebaseCampaignData = useTtrpgCampaignData()
    const demoCampaignData = useDemoCampaignData()

    const active = isDemoMode ? demoCampaignData : firebaseCampaignData

    const [campaign, setCampaign] = useState<TtrpgCampaign | null>(null)

    useEffect(() => {
        if (!campaignId) return
        if (isDemoMode) {
            const raw = readDemoCampaign()
            setCampaign({ id: raw.id, name: raw.name, created_at: raw.created_at, created_by: raw.created_by })
            demoCampaignData.subscribe(campaignId)
        } else {
            loadFirebaseCampaign()
            const unsub = firebaseCampaignData.subscribe(campaignId)
            return unsub
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [campaignId, isDemoMode])

    async function loadFirebaseCampaign() {
        try {
            const loaded = await firebaseCampaignsHook.getCampaign(campaignId!)
            setCampaign(loaded)
        } catch (error) {
            console.error("Error loading campaign:", error)
        }
    }

    function getHighlightedTab(): Tab {
        const segments = location.pathname.split("/")
        const campIdx = segments.indexOf("rpg-notes")
        const tabSegment = campIdx >= 0 ? segments[campIdx + 2] : null
        if (tabSegment === "sessions" || tabSegment === "session") return "sessions"
        if (tabSegment === "party") return "party"
        if (tabSegment === "lore") return "lore"
        if (tabSegment === "quests" || tabSegment === "quest" || tabSegment === "project") return "quests"
        return "sessions"
    }

    function handleTabClick(tab: Tab) {
        navigate(`${nav_paths.rpg_notes}/${campaignId}/${tab}`)
    }

    if (active.isLoading && !campaign) {
        return <FullPageOverlay><div style={page_layout.container}>Loading...</div></FullPageOverlay>
    }

    if (!campaign) {
        return (
            <FullPageOverlay>
                <div style={page_layout.container}>
                    <p>Campaign not found.</p>
                    <button onClick={() => navigate(nav_paths.rpg_notes)}>Back to Campaigns</button>
                </div>
            </FullPageOverlay>
        )
    }

    const outletContext: CampaignLayoutContext = {
        campaign, campaignId: campaignId!, data: active.data, isLoading: active.isLoading,
        sessionsHook: active.sessionsHook, membersHook: active.membersHook,
        notesHook: active.notesHook, loreHook: active.loreHook,
        questsHook: active.questsHook, projectsHook: active.projectsHook,
        partyResourcesHook: active.partyResourcesHook,
        updateMembers: active.updateMembers, updateSessions: active.updateSessions,
        updateQuests: active.updateQuests, updateProjects: active.updateProjects,
        updatePartyResources: active.updatePartyResources,
    }

    return (
        <FullPageOverlay>
            <div style={page_layout.container}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h1 style={{ margin: 0, fontFamily: ttrpg.fonts.heading, color: ttrpg.colors.gold }}>{campaign.name}</h1>
                    <button
                        onClick={() => navigate(nav_paths.rpg_notes)}
                        style={{
                            background: "none", border: "none", color: "#fff",
                            fontSize: "1.5rem", cursor: "pointer", padding: "0.25rem 0.5rem"
                        }}
                        title="Back to Campaigns"
                    >
                        ✕
                    </button>
                </div>

                <CampaignTabBar activeTab={getHighlightedTab()} onTabClick={handleTabClick} />

                <Outlet context={outletContext} />
            </div>
        </FullPageOverlay>
    )
}
