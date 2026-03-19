import { useState, useEffect } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import useFirebaseTtrpgCampaigns from "../../hooks/ttrpg/use_firebase_ttrpg_campaigns"
import useTtrpgCampaignData from "../../hooks/ttrpg/use_ttrpg_campaign_data"
import TtrpgCampaign from "../../types/ttrpg/TtrpgCampaign"
import FullPageOverlay from "../../components/full_page_overlay"
import SessionsTab from "../../components/ttrpg/sessions_tab"
import PartyTab from "../../components/ttrpg/party_tab"
import LoreTab from "../../components/ttrpg/lore_tab"
import { nav_paths, page_layout } from "../../configs/constants"
import { tabStyle } from "./campaign_detail_styles"

type Tab = "sessions" | "party" | "lore"

interface LocationState {
    tab?: Tab
    detailId?: string
    fromSessionId?: string
}

export default function CampaignDetail() {
    const { campaignId } = useParams<{ campaignId: string }>()
    const navigate = useNavigate()
    const location = useLocation()
    const campaignsHook = useFirebaseTtrpgCampaigns()
    const { data, isLoading, loadAll, updateMembers, updateSessions, sessionsHook, membersHook, notesHook, loreHook } = useTtrpgCampaignData()

    const [campaign, setCampaign] = useState<TtrpgCampaign | null>(null)
    const [activeTab, setActiveTab] = useState<Tab>(() => {
        const stored = localStorage.getItem(`ttrpg_tab_${campaignId}`)
        return stored === "sessions" || stored === "party" || stored === "lore" ? stored : "sessions"
    })

    // Tracks which session the user navigated from when clicking a link
    const [cameFromSessionId, setCameFromSessionId] = useState<string | null>(null)

    // Pending detail IDs for cross-tab navigation
    const [pendingMemberDetailId, setPendingMemberDetailId] = useState<string | null>(null)
    const [pendingLoreDetailId, setPendingLoreDetailId] = useState<string | null>(null)

    // Reset signals for when tab buttons are clicked while already on that tab
    const [partyResetSignal, setPartyResetSignal] = useState(0)
    const [loreResetSignal, setLoreResetSignal] = useState(0)

    useEffect(() => {
        if (campaignId) {
            loadCampaign()
            loadAll(campaignId)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [campaignId])

    // Read incoming route state from session detail page
    useEffect(() => {
        const state = location.state as LocationState | null
        if (state?.tab) {
            switchToTab(state.tab)
            if (state.fromSessionId) {
                setCameFromSessionId(state.fromSessionId)
            }
            if (state.detailId) {
                if (state.tab === "lore") setPendingLoreDetailId(state.detailId)
                if (state.tab === "party") setPendingMemberDetailId(state.detailId)
            }
            // Clear the state so it doesn't re-trigger on re-renders
            window.history.replaceState({}, "")
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.state])

    async function loadCampaign() {
        try {
            const loaded = await campaignsHook.getCampaign(campaignId!)
            setCampaign(loaded)
        } catch (error) {
            console.error("Error loading campaign:", error)
        }
    }

    async function reload() {
        if (campaignId) await loadAll(campaignId)
    }

    // ==================== CROSS-TAB NAVIGATION ====================

    function switchToTab(tab: Tab) {
        setActiveTab(tab)
        localStorage.setItem(`ttrpg_tab_${campaignId}`, tab)
    }

    function openLoreDetail(entryId: string) {
        setPendingLoreDetailId(entryId)
        switchToTab("lore")
    }

    function openMemberDetail(memberId: string) {
        setPendingMemberDetailId(memberId)
        switchToTab("party")
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

    // ==================== RENDER ====================

    if (isLoading && !campaign) {
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

    return (
        <FullPageOverlay>
            <div style={page_layout.container}>
                <h1>{campaign.name}</h1>

                <div style={{ marginBottom: "1rem" }}>
                    <button onClick={() => navigate(nav_paths.rpg_notes)}>Back to Campaigns</button>
                </div>

                {/* Tabs */}
                <div style={{ marginBottom: "1rem" }}>
                    <button style={tabStyle(activeTab, "sessions")} onClick={() => switchToTab("sessions")}>Sessions</button>
                    <button style={tabStyle(activeTab, "party")} onClick={() => { switchToTab("party"); setPartyResetSignal(s => s + 1) }}>Party</button>
                    <button style={tabStyle(activeTab, "lore")} onClick={() => { switchToTab("lore"); setLoreResetSignal(s => s + 1) }}>Lore</button>
                </div>

                {activeTab === "sessions" && (
                    <SessionsTab
                        campaignId={campaignId!}
                        sessions={data.sessions}
                        notes={data.notes}
                        sessionsHook={sessionsHook}
                        notesHook={notesHook}
                        reload={reload}
                        updateSessions={updateSessions}
                    />
                )}

                {activeTab === "party" && (
                    <PartyTab
                        campaignId={campaignId!}
                        data={data}
                        membersHook={membersHook}
                        notesHook={notesHook}
                        updateMembers={updateMembers}
                        reload={reload}
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

                {activeTab === "lore" && (
                    <LoreTab
                        campaignId={campaignId!}
                        data={data}
                        loreHook={loreHook}
                        notesHook={notesHook}
                        reload={reload}
                        goToSession={goToSession}
                        openLoreDetail={openLoreDetail}
                        openMemberDetail={openMemberDetail}
                        cameFromSessionId={cameFromSessionId}
                        backToOriginSession={backToOriginSession}
                        pendingDetailId={pendingLoreDetailId}
                        clearPendingDetailId={() => setPendingLoreDetailId(null)}
                        resetSignal={loreResetSignal}
                        clearCameFromSessionId={() => setCameFromSessionId(null)}
                    />
                )}

            </div>
        </FullPageOverlay>
    )
}
