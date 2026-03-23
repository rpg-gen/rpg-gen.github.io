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

type Tab = CampaignTab

interface LocationState {
    tab?: Tab
    detailId?: string
    fromSessionId?: string
}

export interface CampaignLayoutContext {
    campaign: TtrpgCampaign | null
    campaignId: string
    data: ReturnType<typeof useTtrpgCampaignData>["data"]
    isLoading: boolean
    activeTab: Tab
    switchToTab: (tab: Tab) => void
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
    pendingMemberDetailId: string | null
    setPendingMemberDetailId: (id: string | null) => void
    pendingLoreDetailId: string | null
    setPendingLoreDetailId: (id: string | null) => void
    cameFromSessionId: string | null
    setCameFromSessionId: (id: string | null) => void
    partyResetSignal: number
    setPartyResetSignal: React.Dispatch<React.SetStateAction<number>>
    loreResetSignal: number
    setLoreResetSignal: React.Dispatch<React.SetStateAction<number>>
}

export default function CampaignLayout() {
    const { campaignId } = useParams<{ campaignId: string }>()
    const navigate = useNavigate()
    const location = useLocation()
    const user_context = useContext(UserContext)
    const isDemoMode = !user_context.is_logged_in

    // Both hooks called unconditionally (React rules). Only the active one is subscribed.
    const firebaseCampaignsHook = useFirebaseTtrpgCampaigns()
    const firebaseCampaignData = useTtrpgCampaignData()
    const demoCampaignData = useDemoCampaignData()

    const active = isDemoMode ? demoCampaignData : firebaseCampaignData

    const [campaign, setCampaign] = useState<TtrpgCampaign | null>(null)
    const [activeTab, setActiveTab] = useState<Tab>(() => {
        const stored = localStorage.getItem(`ttrpg_tab_${campaignId}`)
        return stored === "sessions" || stored === "party" || stored === "lore" || stored === "quests" ? stored : "sessions"
    })

    const [cameFromSessionId, setCameFromSessionId] = useState<string | null>(null)
    const [pendingMemberDetailId, setPendingMemberDetailId] = useState<string | null>(null)
    const [pendingLoreDetailId, setPendingLoreDetailId] = useState<string | null>(null)
    const [partyResetSignal, setPartyResetSignal] = useState(0)
    const [loreResetSignal, setLoreResetSignal] = useState(0)

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

    useEffect(() => {
        const state = location.state as LocationState | null
        if (state?.tab) {
            switchToTab(state.tab)
            if (state.fromSessionId) setCameFromSessionId(state.fromSessionId)
            if (state.detailId) {
                if (state.tab === "lore") setPendingLoreDetailId(state.detailId)
                if (state.tab === "party") setPendingMemberDetailId(state.detailId)
            }
            window.history.replaceState({}, "")
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.state])

    async function loadFirebaseCampaign() {
        try {
            const loaded = await firebaseCampaignsHook.getCampaign(campaignId!)
            setCampaign(loaded)
        } catch (error) {
            console.error("Error loading campaign:", error)
        }
    }

    function switchToTab(tab: Tab) {
        setActiveTab(tab)
        localStorage.setItem(`ttrpg_tab_${campaignId}`, tab)
    }

    const isSubRoute = /\/(session|quest|project)\//.test(location.pathname)

    function handleTabClick(tab: Tab) {
        if (isSubRoute) {
            navigate(`${nav_paths.rpg_notes}/${campaignId}`, { state: { tab } })
        } else {
            switchToTab(tab)
            if (tab === "party") setPartyResetSignal(s => s + 1)
            if (tab === "lore") setLoreResetSignal(s => s + 1)
        }
    }

    function getHighlightedTab(): Tab {
        if (/\/session\//.test(location.pathname)) return "sessions"
        if (/\/quest\//.test(location.pathname)) return "quests"
        if (/\/project\//.test(location.pathname)) return "quests"
        return activeTab
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
        activeTab, switchToTab,
        sessionsHook: active.sessionsHook, membersHook: active.membersHook,
        notesHook: active.notesHook, loreHook: active.loreHook,
        questsHook: active.questsHook, projectsHook: active.projectsHook,
        partyResourcesHook: active.partyResourcesHook,
        updateMembers: active.updateMembers, updateSessions: active.updateSessions,
        updateQuests: active.updateQuests, updateProjects: active.updateProjects,
        updatePartyResources: active.updatePartyResources,
        pendingMemberDetailId, setPendingMemberDetailId,
        pendingLoreDetailId, setPendingLoreDetailId,
        cameFromSessionId, setCameFromSessionId,
        partyResetSignal, setPartyResetSignal,
        loreResetSignal, setLoreResetSignal,
    }

    return (
        <FullPageOverlay>
            <div style={page_layout.container}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h1 style={{ margin: 0 }}>{campaign.name}</h1>
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
