import { useState, useEffect } from "react"
import TtrpgSession from "../../types/ttrpg/TtrpgSession"
import TtrpgSessionNote from "../../types/ttrpg/TtrpgSessionNote"
import TtrpgLoreEntry, { LoreEntryType } from "../../types/ttrpg/TtrpgLoreEntry"
import TtrpgMember from "../../types/ttrpg/TtrpgMember"
import TtrpgQuest from "../../types/ttrpg/TtrpgQuest"
import TtrpgProject from "../../types/ttrpg/TtrpgProject"
import LoreDetailView from "./lore_detail_view"
import LoreForm from "./lore_form"
import { cardStyle } from "../../pages/ttrpg/campaign_detail_styles"
import { LORE_COLORS, LORE_LABELS, LORE_LABELS_PLURAL, ALL_LORE_TYPES } from "../../configs/ttrpg_constants"
import { filterLoreBySearch } from "../../utility/lore_filter_utils"

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

interface NotesHook {
    updateNote: (id: string, note: Partial<TtrpgSessionNote>) => Promise<void>
}

interface LoreTabProps {
    data: CampaignData
    loreHook: LoreHook
    notesHook: NotesHook
    goToSession: (sessionId: string, noteId?: string) => void
    openMemberDetail: (memberId: string) => void
    openQuestDetail?: (questId: string) => void
    openProjectDetail?: (projectId: string) => void
    cameFromSessionId: string | null
    backToOriginSession: () => void
    pendingDetailId: string | null
    clearPendingDetailId: () => void
    resetSignal: number
    clearCameFromSessionId: () => void
}

export default function LoreTab({
    data, loreHook, notesHook,
    goToSession, openMemberDetail, openQuestDetail, openProjectDetail,
    cameFromSessionId, backToOriginSession,
    pendingDetailId, clearPendingDetailId, resetSignal, clearCameFromSessionId
}: LoreTabProps) {

    const [loreDetailId, setLoreDetailId] = useState<string | null>(pendingDetailId)
    const [loreFormMode, setLoreFormMode] = useState<"add" | null>(null)
    const [loreFormType, setLoreFormType] = useState<LoreEntryType>("person")
    const [loreFormName, setLoreFormName] = useState("")
    const [loreFormSubtitle, setLoreFormSubtitle] = useState("")
    const [loreFormSessionId, setLoreFormSessionId] = useState<string | undefined>(undefined)
    const [loreFormFactionId, setLoreFormFactionId] = useState<string | undefined>(undefined)
    const [returnToLoreId, setReturnToLoreId] = useState<string | null>(null)

    const [loreFilter, setLoreFilter] = useState<LoreEntryType | null>(null)
    const [loreSearchText, setLoreSearchText] = useState("")

    useEffect(() => {
        if (pendingDetailId) {
            setLoreDetailId(pendingDetailId)
            setLoreFormMode(null)
            clearPendingDetailId()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pendingDetailId])

    useEffect(() => {
        if (resetSignal > 0 && !pendingDetailId) {
            setLoreDetailId(null)
        }
    }, [resetSignal, pendingDetailId])

    function resetLoreForm(navigateToId?: string) {
        setLoreFormMode(null)
        setLoreFormName("")
        setLoreFormSubtitle("")
        setLoreFormType("person")
        setLoreFormSessionId(undefined)
        setLoreFormFactionId(undefined)
        setReturnToLoreId(null)
        setLoreDetailId(navigateToId ?? null)
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
            resetLoreForm(returnTo || newId)
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

    // ==================== RENDER ====================

    // Detail View
    if (loreFormMode === null && loreDetailId !== null) {
        const entry = data.lore.find(e => e.id === loreDetailId)
        if (!entry) return <div><button onClick={() => setLoreDetailId(null)}>Back</button><p>Entry not found.</p></div>

        return (
            <LoreDetailView
                entry={entry}
                data={data}
                loreHook={loreHook}
                notesHook={notesHook}
                goToSession={goToSession}
                openLoreDetail={(id) => setLoreDetailId(id)}
                openMemberDetail={openMemberDetail}
                openQuestDetail={openQuestDetail}
                openProjectDetail={openProjectDetail}
                cameFromSessionId={cameFromSessionId}
                backToOriginSession={backToOriginSession}
                clearCameFromSessionId={clearCameFromSessionId}
                onBack={() => setLoreDetailId(null)}
                onDelete={() => setLoreDetailId(null)}
                onAddPersonToFaction={(factionId) => {
                    const latestSession = data.sessions.length > 0
                        ? data.sessions.reduce((a, b) => a.session_number > b.session_number ? a : b)
                        : null
                    setLoreDetailId(null)
                    setLoreFormMode("add")
                    setLoreFormType("person")
                    setLoreFormName("")
                    setLoreFormSubtitle("")
                    setLoreFormSessionId(latestSession?.id)
                    setLoreFormFactionId(factionId)
                    setReturnToLoreId(factionId)
                }}
            />
        )
    }

    // List View
    if (loreFormMode === null) {
        return (
            <div>
                {/* Add buttons */}
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
                    {ALL_LORE_TYPES.map(type => {
                        const latestSession = data.sessions.length > 0
                            ? data.sessions.reduce((a, b) => a.session_number > b.session_number ? a : b)
                            : null
                        return (
                            <button
                                key={type}
                                onClick={() => {
                                    setLoreFormType(type)
                                    setLoreFormName("")
                                    setLoreFormSubtitle("")
                                    setLoreFormSessionId(latestSession?.id)
                                    setLoreFormMode("add")
                                }}
                                style={{
                                    backgroundColor: LORE_COLORS[type],
                                    color: "#222",
                                    border: "1px solid #ccc",
                                    borderRadius: "4px",
                                    padding: "0.5rem 1rem",
                                    cursor: "pointer"
                                }}
                            >
                                + {LORE_LABELS[type]}
                            </button>
                        )
                    })}
                </div>

                {/* Filter chips */}
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                    {ALL_LORE_TYPES.map(type => {
                        const active = loreFilter === type
                        return (
                            <button
                                key={type}
                                onClick={() => toggleLoreFilter(type)}
                                style={{
                                    padding: "0.25rem 0.75rem",
                                    borderRadius: "12px",
                                    border: "1px solid #ccc",
                                    backgroundColor: active ? LORE_COLORS[type] : "transparent",
                                    color: active ? "#222" : "rgba(255,255,255,0.5)",
                                    cursor: "pointer",
                                    fontSize: "0.85rem"
                                }}
                            >
                                {LORE_LABELS_PLURAL[type]}
                            </button>
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
                        <div key={entry.id} style={{ ...cardStyle, backgroundColor: LORE_COLORS[entry.type], cursor: "pointer" }} onClick={() => setLoreDetailId(entry.id)}>
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

    // Add Form
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
