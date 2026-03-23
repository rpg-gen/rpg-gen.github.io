import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import TtrpgSession from "../../types/ttrpg/TtrpgSession"
import TtrpgSessionNote from "../../types/ttrpg/TtrpgSessionNote"
import TtrpgLoreEntry, { LoreEntryType } from "../../types/ttrpg/TtrpgLoreEntry"
import TtrpgMember from "../../types/ttrpg/TtrpgMember"
import TtrpgQuest from "../../types/ttrpg/TtrpgQuest"
import TtrpgProject from "../../types/ttrpg/TtrpgProject"
import LoreForm from "./lore_form"
import { cardStyle } from "../../pages/ttrpg/campaign_detail_styles"
import { LORE_COLORS, LORE_LABELS, LORE_LABELS_PLURAL, ALL_LORE_TYPES } from "../../configs/ttrpg_constants"
import { filterLoreBySearch } from "../../utility/lore_filter_utils"
import { nav_paths } from "../../configs/constants"

interface CampaignData {
    sessions: TtrpgSession[]
    members: TtrpgMember[]
    notes: TtrpgSessionNote[]
    lore: TtrpgLoreEntry[]
    quests: TtrpgQuest[]
    projects: TtrpgProject[]
}

interface LoreHook {
    createLoreEntry: (entry: Omit<TtrpgLoreEntry, "id" | "campaign_id">) => Promise<string>
    updateLoreEntry: (id: string, entry: Partial<TtrpgLoreEntry>) => Promise<void>
    deleteLoreEntry: (id: string) => Promise<void>
}

interface LoreTabProps {
    campaignId: string
    data: CampaignData
    loreHook: LoreHook
}

export default function LoreTab({ campaignId, data, loreHook }: LoreTabProps) {
    const navigate = useNavigate()
    const location = useLocation()

    const [loreFormMode, setLoreFormMode] = useState<"add" | null>(null)
    const [loreFormType, setLoreFormType] = useState<LoreEntryType>("person")
    const [loreFormName, setLoreFormName] = useState("")
    const [loreFormSubtitle, setLoreFormSubtitle] = useState("")
    const [loreFormSessionId, setLoreFormSessionId] = useState<string | undefined>(undefined)
    const [loreFormFactionId, setLoreFormFactionId] = useState<string | undefined>(undefined)
    const [returnToLoreId, setReturnToLoreId] = useState<string | null>(null)

    const [loreFilter, setLoreFilter] = useState<LoreEntryType | null>(null)
    const [loreSearchText, setLoreSearchText] = useState("")

    // Handle addPersonToFaction flow from lore detail page
    useEffect(() => {
        const state = location.state as { addPersonToFaction?: string } | null
        if (state?.addPersonToFaction) {
            const latestSession = data.sessions.length > 0
                ? data.sessions.reduce((a, b) => a.session_number > b.session_number ? a : b)
                : null
            setLoreFormMode("add")
            setLoreFormType("person")
            setLoreFormName("")
            setLoreFormSubtitle("")
            setLoreFormSessionId(latestSession?.id)
            setLoreFormFactionId(state.addPersonToFaction)
            setReturnToLoreId(state.addPersonToFaction)
            window.history.replaceState({}, "")
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.state])

    function resetLoreForm() {
        setLoreFormMode(null)
        setLoreFormName("")
        setLoreFormSubtitle("")
        setLoreFormType("person")
        setLoreFormSessionId(undefined)
        setLoreFormFactionId(undefined)
        setReturnToLoreId(null)
    }

    function toggleLoreFilter(type: LoreEntryType) {
        setLoreFilter(prev => prev === type ? null : type)
    }

    function getSessionLabel(sessionId: string): string {
        const session = data.sessions.find(s => s.id === sessionId)
        if (!session) return ""
        return `Session ${session.session_number}`
    }

    async function handleCreateLoreEntry() {
        if (!loreFormName.trim()) {
            alert("Name is required")
            return
        }
        try {
            const returnTo = returnToLoreId
            const newId = await loreHook.createLoreEntry({
                type: loreFormType,
                name: loreFormName.trim(),
                subtitle: loreFormSubtitle.trim(),
                created_at: "",
                ...(loreFormSessionId ? { session_id: loreFormSessionId } : {}),
                ...(loreFormFactionId ? { faction_id: loreFormFactionId } : {})
            })
            resetLoreForm()
            const targetId = returnTo || newId
            navigate(`${nav_paths.rpg_notes}/${campaignId}/lore/${targetId}`)
        } catch (error) {
            console.error("Error creating lore entry:", error)
            alert("Error creating lore entry")
        }
    }

    function handleTypeChange(type: LoreEntryType) {
        setLoreFormType(type)
        if (type !== "person") setLoreFormFactionId(undefined)
    }

    function getSessionNumber(sessionId?: string): number {
        if (!sessionId) return Infinity
        const session = data.sessions.find(s => s.id === sessionId)
        return session ? session.session_number : Infinity
    }

    const typeFiltered = loreFilter === null ? data.lore : data.lore.filter(entry => entry.type === loreFilter)
    const filteredLore = filterLoreBySearch(typeFiltered, loreSearchText)
        .slice()
        .sort((a, b) => {
            const sessionA = getSessionNumber(a.session_id)
            const sessionB = getSessionNumber(b.session_id)
            if (sessionA !== sessionB) return sessionB - sessionA
            return b.created_at.localeCompare(a.created_at)
        })

    // Add Form
    if (loreFormMode !== null) {
        const factions = data.lore.filter(e => e.type === "faction")
        return (
            <LoreForm
                loreFormType={loreFormType}
                setLoreFormType={handleTypeChange}
                loreFormName={loreFormName}
                setLoreFormName={setLoreFormName}
                loreFormSubtitle={loreFormSubtitle}
                setLoreFormSubtitle={setLoreFormSubtitle}
                loreFormSessionId={loreFormSessionId}
                setLoreFormSessionId={setLoreFormSessionId}
                loreFormFactionId={loreFormFactionId}
                setLoreFormFactionId={setLoreFormFactionId}
                sessions={data.sessions}
                factions={factions}
                onSave={handleCreateLoreEntry}
                onCancel={resetLoreForm}
            />
        )
    }

    // List View
    return (
        <div>
            {/* Filter chips + add buttons */}
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap", alignItems: "center" }}>
                {ALL_LORE_TYPES.map(type => {
                    const active = loreFilter === type
                    const latestSession = data.sessions.length > 0
                        ? data.sessions.reduce((a, b) => a.session_number > b.session_number ? a : b)
                        : null
                    return (
                        <span key={type} style={{ display: "inline-flex", alignItems: "center", gap: 0 }}>
                            <button
                                className="ttrpg-pill"
                                onClick={() => toggleLoreFilter(type)}
                                style={{
                                    padding: "0.25rem 0.75rem",
                                    borderRadius: active ? "12px 0 0 12px" : "12px",
                                    border: `1px solid ${active ? LORE_COLORS[type] : "rgba(255,255,255,0.2)"}`,
                                    backgroundColor: active ? LORE_COLORS[type] : "transparent",
                                    color: active ? "#222" : "rgba(255,255,255,0.5)",
                                    cursor: "pointer",
                                    fontSize: "0.85rem",
                                    borderRight: active ? "none" : undefined,
                                }}
                            >
                                {LORE_LABELS_PLURAL[type]}
                            </button>
                            {active && (
                                <button
                                    onClick={() => {
                                        setLoreFormType(type)
                                        setLoreFormName("")
                                        setLoreFormSubtitle("")
                                        setLoreFormSessionId(latestSession?.id)
                                        setLoreFormMode("add")
                                    }}
                                    style={{
                                        padding: "0.25rem 0.5rem",
                                        borderRadius: "0 12px 12px 0",
                                        border: `1px solid ${LORE_COLORS[type]}`,
                                        backgroundColor: LORE_COLORS[type],
                                        color: "#222",
                                        cursor: "pointer",
                                        fontSize: "0.85rem",
                                        fontWeight: "bold",
                                    }}
                                    title={`Add ${LORE_LABELS[type]}`}
                                >
                                    +
                                </button>
                            )}
                        </span>
                    )
                })}
            </div>

            {/* Search box */}
            <div style={{ position: "relative", marginBottom: "1rem" }}>
                <input
                    type="text"
                    value={loreSearchText}
                    onChange={(e) => setLoreSearchText(e.target.value)}
                    placeholder="Search lore by name or subtitle..."
                    style={{ width: "100%", padding: "0.5rem", boxSizing: "border-box", paddingRight: "2rem" }}
                />
                {loreSearchText && (
                    <button
                        onClick={() => setLoreSearchText("")}
                        style={{ position: "absolute", right: "0.5rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "1rem", color: "#999" }}
                    >
                        ✕
                    </button>
                )}
            </div>

            {filteredLore.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem", color: "#666" }}>
                    {data.lore.length === 0 ? "No lore entries yet." : loreSearchText ? "No entries match your search." : "No entries match the current filter."}
                </div>
            ) : (
                filteredLore.map(entry => (
                    <div key={entry.id} className="ttrpg-card" style={{ ...cardStyle, backgroundColor: LORE_COLORS[entry.type], borderLeft: `4px solid ${LORE_COLORS[entry.type]}`, cursor: "pointer" }} onClick={() => navigate(`${nav_paths.rpg_notes}/${campaignId}/lore/${entry.id}`)}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: entry.subtitle ? "0.25rem" : 0 }}>
                            <span style={{ flex: 1 }}>
                                <strong>{entry.name}</strong>
                                <span style={{ color: "#666", marginLeft: "0.5rem" }}>
                                    ({LORE_LABELS[entry.type]}{entry.faction_id ? ` — ${data.lore.find(l => l.id === entry.faction_id)?.name || ""}` : ""}{entry.session_id ? ` — ${getSessionLabel(entry.session_id)}` : ""})
                                </span>
                            </span>
                        </div>
                        {entry.subtitle && (
                            <div style={{ fontStyle: "italic", color: "#555", fontSize: "0.9rem" }}>{entry.subtitle}</div>
                        )}
                    </div>
                ))
            )}
        </div>
    )
}
