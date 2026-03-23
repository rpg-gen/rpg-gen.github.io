import { useState, useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom"
import useFirebaseTtrpgCampaigns from "../../hooks/ttrpg/use_firebase_ttrpg_campaigns"
import { readDemoCampaign } from "../../hooks/ttrpg/demo_storage"
import { DEMO_CAMPAIGN_ID } from "../../data/demo_campaign"
import TtrpgCampaign from "../../types/ttrpg/TtrpgCampaign"
import FullPageOverlay from "../../components/full_page_overlay"
import { nav_paths, page_layout } from "../../configs/constants"
import { primaryButtonStyle } from "./campaign_detail_styles"
import { ttrpg, themeStyles } from "../../configs/ttrpg_theme"
import UserContext from "../../contexts/user_context"

export default function CampaignList() {
    const navigate = useNavigate()
    const campaignsHook = useFirebaseTtrpgCampaigns()
    const user_context = useContext(UserContext)
    const isDemoMode = !user_context.is_logged_in

    const [campaigns, setCampaigns] = useState<TtrpgCampaign[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [newCampaignName, setNewCampaignName] = useState("")

    useEffect(() => {
        loadCampaigns()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isDemoMode])

    async function loadCampaigns() {
        setIsLoading(true)
        if (isDemoMode) {
            const raw = readDemoCampaign()
            setCampaigns([{ id: raw.id, name: raw.name, created_at: raw.created_at, created_by: raw.created_by }])
        } else {
            try {
                const loaded = await campaignsHook.getAllCampaigns()
                setCampaigns(loaded)
            } catch (error) {
                console.error("Error loading campaigns:", error)
            }
        }
        setIsLoading(false)
    }

    async function handleCreate() {
        if (!newCampaignName.trim()) {
            alert("Campaign name is required")
            return
        }
        try {
            await campaignsHook.createCampaign({
                name: newCampaignName.trim(),
                created_by: user_context.username || ""
            })
            setNewCampaignName("")
            await loadCampaigns()
        } catch (error) {
            console.error("Error creating campaign:", error)
            alert("Error creating campaign")
        }
    }

    async function handleDelete(id: string) {
        if (confirm("Are you sure you want to delete this campaign? All sessions, members, and notes will remain in the database.")) {
            try {
                await campaignsHook.deleteCampaign(id)
                await loadCampaigns()
            } catch (error) {
                console.error("Error deleting campaign:", error)
                alert("Error deleting campaign")
            }
        }
    }

    function getCampaignPath(id: string) {
        return nav_paths.rpg_notes + "/" + (isDemoMode ? DEMO_CAMPAIGN_ID : id)
    }

    if (isLoading) {
        return <FullPageOverlay><div style={page_layout.container}>Loading campaigns...</div></FullPageOverlay>
    }

    return (
        <FullPageOverlay>
            <div style={page_layout.container}>
                <h1 style={{ fontFamily: ttrpg.fonts.heading, color: ttrpg.colors.gold }}>RPG Notes</h1>

                <div style={{ marginBottom: "1rem" }}>
                    <button onClick={() => navigate("/")}>Back to Menu</button>
                </div>

                {!isDemoMode && (
                    <div className="ttrpg-card" style={{ ...themeStyles.card, marginBottom: "2rem", padding: "1rem" }}>
                        <h3 style={{ marginTop: 0, fontFamily: ttrpg.fonts.heading }}>Create New Campaign</h3>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                            <input
                                type="text"
                                value={newCampaignName}
                                onChange={(e) => setNewCampaignName(e.target.value)}
                                placeholder="Campaign name"
                                style={{ flex: 1, padding: "0.5rem" }}
                                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                            />
                            <button onClick={handleCreate} className="ttrpg-btn-primary" style={primaryButtonStyle}>Create</button>
                        </div>
                    </div>
                )}

                <div>
                    <h3 style={{ fontFamily: ttrpg.fonts.heading }}>Campaigns ({campaigns.length})</h3>
                    {campaigns.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "2rem", color: "#666" }}>
                            No campaigns yet. Create your first campaign above!
                        </div>
                    ) : (
                        campaigns.map(campaign => (
                            <div
                                key={campaign.id}
                                className="ttrpg-card"
                                style={{
                                    ...themeStyles.card,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                }}
                            >
                                <div
                                    style={{ flex: 1, cursor: "pointer" }}
                                    onClick={() => navigate(getCampaignPath(campaign.id))}
                                >
                                    {campaign.name}
                                </div>
                                <button onClick={() => navigate(getCampaignPath(campaign.id))}>Open</button>
                                {!isDemoMode && (
                                    <button
                                        onClick={() => handleDelete(campaign.id)}
                                        className="ttrpg-btn-danger"
                                        style={{ ...themeStyles.dangerButton, padding: "0.25rem 0.5rem", fontSize: "0.85rem" }}
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </FullPageOverlay>
    )
}
