import { useState, useEffect, useContext } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import useFirebaseTtrpgCampaigns from "../../hooks/ttrpg/use_firebase_ttrpg_campaigns"
import useTtrpgCampaignData from "../../hooks/ttrpg/use_ttrpg_campaign_data"
import TtrpgCampaign from "../../types/ttrpg/TtrpgCampaign"
import TtrpgSession from "../../types/ttrpg/TtrpgSession"
import { LoreEntryType } from "../../types/ttrpg/TtrpgLoreEntry"
import FullPageOverlay from "../../components/full_page_overlay"
import SessionDetailNavBar from "../../components/ttrpg/session_detail_nav_bar"
import SessionDetailContent from "../../components/ttrpg/session_detail_content"
import PartyTab from "../../components/ttrpg/party_tab"
import LoreTab from "../../components/ttrpg/lore_tab"
import { nav_paths, page_layout } from "../../configs/constants"
import { tabStyle } from "./campaign_detail_styles"
import UserContext from "../../contexts/user_context"

type Tab = "sessions" | "party" | "lore"

export default function SessionDetail() {
    const { campaignId, sessionId } = useParams<{ campaignId: string; sessionId: string }>()
    const navigate = useNavigate()
    const location = useLocation()
    const user_context = useContext(UserContext)
    const campaignsHook = useFirebaseTtrpgCampaigns()
    const { data, isLoading, subscribe, sessionsHook, membersHook, notesHook, loreHook, partyResourcesHook, updateMembers, updatePartyResources } = useTtrpgCampaignData()

    const [campaign, setCampaign] = useState<TtrpgCampaign | null>(null)
    const [activeTab, setActiveTab] = useState<Tab>("sessions")
    const [highlightNoteId, setHighlightNoteId] = useState<string | null>(null)

    // Cross-tab navigation state
    const [pendingMemberDetailId, setPendingMemberDetailId] = useState<string | null>(null)
    const [pendingLoreDetailId, setPendingLoreDetailId] = useState<string | null>(null)
    const [partyResetSignal, setPartyResetSignal] = useState(0)
    const [loreResetSignal, setLoreResetSignal] = useState(0)

    useEffect(() => {
        if (campaignId) {
            loadCampaign()
            const unsub = subscribe(campaignId)
            return unsub
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [campaignId])

    useEffect(() => {
        const state = location.state as { highlightNoteId?: string } | null
        if (state?.highlightNoteId) {
            setHighlightNoteId(state.highlightNoteId)
            setActiveTab("sessions")
            window.history.replaceState({}, "")
        }
    }, [location.state])

    async function loadCampaign() {
        try {
            const loaded = await campaignsHook.getCampaign(campaignId!)
            setCampaign(loaded)
        } catch (error) {
            console.error("Error loading campaign:", error)
        }
    }

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

    // ==================== CROSS-TAB NAVIGATION ====================

    function openLoreDetail(entryId: string) {
        setPendingLoreDetailId(entryId)
        setActiveTab("lore")
    }

    function openMemberDetail(memberId: string) {
        setPendingMemberDetailId(memberId)
        setActiveTab("party")
    }

    function goToSession(id: string, noteId?: string) {
        navigate(`${nav_paths.rpg_notes}/${campaignId}/session/${id}`, {
            replace: true,
            ...(noteId ? { state: { highlightNoteId: noteId } } : {})
        })
        setActiveTab("sessions")
    }

    // ==================== RENDER ====================

    const sortedSessions = [...data.sessions].sort((a, b) => a.date.localeCompare(b.date))
    const currentIndex = sortedSessions.findIndex(s => s.id === sessionId)
    const currentSession = currentIndex >= 0 ? sortedSessions[currentIndex] : null

    function navigateToSession(id: string) {
        navigate(`${nav_paths.rpg_notes}/${campaignId}/session/${id}`, { replace: true })
    }

    if (isLoading && !campaign) {
        return <FullPageOverlay><div style={page_layout.container}>Loading...</div></FullPageOverlay>
    }

    if (!campaign || (!isLoading && !currentSession)) {
        return (
            <FullPageOverlay>
                <div style={page_layout.container}>
                    <p>{!campaign ? "Campaign not found." : "Session not found."}</p>
                    <button onClick={() => navigate(`${nav_paths.rpg_notes}/${campaignId}`)}>Back to Campaign</button>
                </div>
            </FullPageOverlay>
        )
    }

    if (!currentSession) {
        return <FullPageOverlay><div style={page_layout.container}>Loading session...</div></FullPageOverlay>
    }

    return (
        <FullPageOverlay>
            <div style={page_layout.container}>
                <h1>{campaign.name}</h1>

                <div style={{ marginBottom: "1rem" }}>
                    <button style={tabStyle(activeTab, "sessions")} onClick={() => {
                        if (activeTab === "sessions") navigate(`${nav_paths.rpg_notes}/${campaignId}`)
                        else setActiveTab("sessions")
                    }}>Sessions</button>
                    <button style={tabStyle(activeTab, "party")} onClick={() => { setActiveTab("party"); setPartyResetSignal(s => s + 1) }}>Party</button>
                    <button style={tabStyle(activeTab, "lore")} onClick={() => { setActiveTab("lore"); setLoreResetSignal(s => s + 1) }}>Lore</button>
                </div>

                {activeTab === "sessions" && (
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
                            handleSlashCreateLore={handleSlashCreateLore}
                            username={user_context.username || ""}
                            highlightNoteId={highlightNoteId}
                        />
                    </>
                )}

                {activeTab === "party" && (
                    <PartyTab
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
                        cameFromSessionId={sessionId || null}
                        backToOriginSession={() => setActiveTab("sessions")}
                        pendingDetailId={pendingMemberDetailId}
                        clearPendingDetailId={() => setPendingMemberDetailId(null)}
                        resetSignal={partyResetSignal}
                        clearCameFromSessionId={() => {}}
                    />
                )}

                {activeTab === "lore" && (
                    <LoreTab
                        data={data}
                        loreHook={loreHook}
                        notesHook={notesHook}
                        goToSession={goToSession}
                        openLoreDetail={openLoreDetail}
                        openMemberDetail={openMemberDetail}
                        cameFromSessionId={sessionId || null}
                        backToOriginSession={() => setActiveTab("sessions")}
                        pendingDetailId={pendingLoreDetailId}
                        clearPendingDetailId={() => setPendingLoreDetailId(null)}
                        resetSignal={loreResetSignal}
                        clearCameFromSessionId={() => {}}
                    />
                )}
            </div>
        </FullPageOverlay>
    )
}
