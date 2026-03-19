import { useState, useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom"
import useFirebaseTtrpgCampaigns from "../../hooks/ttrpg/use_firebase_ttrpg_campaigns"
import TtrpgCampaign from "../../types/ttrpg/TtrpgCampaign"
import FullPageOverlay from "../../components/full_page_overlay"
import { nav_paths, page_layout } from "../../configs/constants"
import { primaryButtonStyle } from "./campaign_detail_styles"
import UserContext from "../../contexts/user_context"

export default function CampaignList() {
    const navigate = useNavigate()
    const campaignsHook = useFirebaseTtrpgCampaigns()
    const user_context = useContext(UserContext)

    const [campaigns, setCampaigns] = useState<TtrpgCampaign[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [newCampaignName, setNewCampaignName] = useState("")

    useEffect(() => {
        loadCampaigns()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    async function loadCampaigns() {
        setIsLoading(true)
        try {
            const loaded = await campaignsHook.getAllCampaigns()
            setCampaigns(loaded)
        } catch (error) {
            console.error("Error loading campaigns:", error)
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

    if (isLoading) {
        return <FullPageOverlay><div style={page_layout.container}>Loading campaigns...</div></FullPageOverlay>
    }

    return (
        <FullPageOverlay>
            <div style={page_layout.container}>
                <h1>RPG Notes</h1>

                <div style={{ marginBottom: "1rem" }}>
                    <button onClick={() => navigate("/")}>Back to Menu</button>
                </div>

                <div style={{ marginBottom: "2rem", padding: "1rem", border: "1px solid #ccc", backgroundColor: "#fff", color: "#222", borderRadius: "4px" }}>
                    <h3 style={{ marginTop: 0 }}>Create New Campaign</h3>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                        <input
                            type="text"
                            value={newCampaignName}
                            onChange={(e) => setNewCampaignName(e.target.value)}
                            placeholder="Campaign name"
                            style={{ flex: 1, padding: "0.5rem" }}
                            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                        />
                        <button onClick={handleCreate} style={primaryButtonStyle}>Create</button>
                    </div>
                </div>

                <div>
                    <h3>Campaigns ({campaigns.length})</h3>
                    {campaigns.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "2rem", color: "#666" }}>
                            No campaigns yet. Create your first campaign above!
                        </div>
                    ) : (
                        campaigns.map(campaign => (
                            <div
                                key={campaign.id}
                                style={{
                                    border: "1px solid #ccc",
                                    padding: "0.75rem",
                                    marginBottom: "0.5rem",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    backgroundColor: "#fff",
                                    color: "#222",
                                    borderRadius: "4px"
                                }}
                            >
                                <div
                                    style={{ flex: 1, cursor: "pointer" }}
                                    onClick={() => navigate(nav_paths.rpg_notes + "/" + campaign.id)}
                                >
                                    {campaign.name}
                                </div>
                                <button onClick={() => navigate(nav_paths.rpg_notes + "/" + campaign.id)}>Open</button>
                                <button
                                    onClick={() => handleDelete(campaign.id)}
                                    style={{ backgroundColor: "#c0392b", color: "#fff", border: "none", padding: "0.25rem 0.5rem", cursor: "pointer" }}
                                >
                                    Delete
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </FullPageOverlay>
    )
}
