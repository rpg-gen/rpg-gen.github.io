import { useState, useEffect, useRef } from "react"
import TtrpgSession from "../../types/ttrpg/TtrpgSession"
import TtrpgSessionNote from "../../types/ttrpg/TtrpgSessionNote"
import TtrpgLoreEntry, { LoreEntryType } from "../../types/ttrpg/TtrpgLoreEntry"
import TtrpgMember from "../../types/ttrpg/TtrpgMember"
import TtrpgQuest from "../../types/ttrpg/TtrpgQuest"
import TtrpgProject from "../../types/ttrpg/TtrpgProject"
import LoreNoteText from "./lore_note_text"
import AutoResizeTextarea from "./auto_resize_textarea"
import LoreFactionMembers from "./lore_faction_members"
import LoreItemHolder from "./lore_item_holder"
import { ttrpg, themeStyles } from "../../configs/ttrpg_theme"
import { LORE_COLORS, LORE_LABELS, ALL_LORE_TYPES } from "../../configs/ttrpg_constants"

interface CampaignData {
    sessions: TtrpgSession[]
    members: TtrpgMember[]
    notes: TtrpgSessionNote[]
    lore: TtrpgLoreEntry[]
    quests: TtrpgQuest[]
    projects: TtrpgProject[]
}

interface LoreHook {
    updateLoreEntry: (id: string, entry: Partial<TtrpgLoreEntry>) => Promise<void>
    deleteLoreEntry: (id: string) => Promise<void>
}

interface NotesHook {
    updateNote: (id: string, note: Partial<TtrpgSessionNote>) => Promise<void>
}

interface MembersHook {
    updateMember: (id: string, member: Partial<TtrpgMember>) => Promise<void>
}

interface LoreDetailViewProps {
    entry: TtrpgLoreEntry
    data: CampaignData
    loreHook: LoreHook
    notesHook: NotesHook
    membersHook: MembersHook
    updateMembers: (updater: (members: TtrpgMember[]) => TtrpgMember[]) => void
    goToSession: (sessionId: string, noteId?: string) => void
    openLoreDetail: (entryId: string) => void
    openMemberDetail: (memberId: string) => void
    openQuestDetail?: (questId: string) => void
    openProjectDetail?: (projectId: string) => void
    cameFromSessionId: string | null
    backToOriginSession: () => void
    cameFromMemberName?: string | null
    backToOriginMember?: () => void
    clearCameFromSessionId: () => void
    onBack: () => void
    onDelete: () => void
    onAddPersonToFaction?: (factionId: string) => void
}

export default function LoreDetailView({
    entry, data, loreHook, notesHook, membersHook, updateMembers,
    goToSession, openLoreDetail, openMemberDetail, openQuestDetail, openProjectDetail,
    cameFromSessionId, backToOriginSession, cameFromMemberName, backToOriginMember,
    clearCameFromSessionId, onBack, onDelete, onAddPersonToFaction
}: LoreDetailViewProps) {

    const [editingField, setEditingField] = useState<"name" | "subtitle" | null>(null)
    const editingFieldRef = useRef(editingField)
    editingFieldRef.current = editingField

    const [draftName, setDraftName] = useState(entry.name)
    const [draftSubtitle, setDraftSubtitle] = useState(entry.subtitle || "")

    useEffect(() => {
        if (editingFieldRef.current !== "name") setDraftName(entry.name)
        if (editingFieldRef.current !== "subtitle") setDraftSubtitle(entry.subtitle || "")
    }, [entry])

    const entrySession = entry.session_id ? data.sessions.find(s => s.id === entry.session_id) : null
    const faction = entry.faction_id ? data.lore.find(l => l.id === entry.faction_id) : null
    const factionMembers = entry.type === "faction"
        ? data.lore.filter(l => l.type === "person" && l.faction_id === entry.id)
        : []
    const factions = data.lore.filter(l => l.type === "faction" && l.id !== entry.id)

    const mentions: { note: TtrpgSessionNote; session: TtrpgSession }[] = []
    for (const note of data.notes) {
        if (note.text.includes(`[[${entry.name}]]`)) {
            const session = data.sessions.find(s => s.id === note.session_id)
            if (session) mentions.push({ note, session })
        }
    }
    mentions.sort((a, b) =>
        b.session.session_number - a.session.session_number
        || b.note.created_at.localeCompare(a.note.created_at)
    )

    async function saveName() {
        setEditingField(null)
        const trimmed = draftName.trim()
        if (!trimmed || trimmed === entry.name) return
        try {
            await loreHook.updateLoreEntry(entry.id, { name: trimmed })
            const pattern = new RegExp(`\\[\\[${entry.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\]\\]`, "gi")
            for (const note of data.notes) {
                if (pattern.test(note.text)) {
                    await notesHook.updateNote(note.id, { text: note.text.replace(pattern, `[[${trimmed}]]`) })
                }
            }
            // Propagate name change to linked inventory items
            for (const member of data.members) {
                const hasLinked = member.items.some(i => i.lore_id === entry.id)
                if (hasLinked) {
                    const updatedItems = member.items.map(i =>
                        i.lore_id === entry.id ? { ...i, name: trimmed } : i
                    )
                    membersHook.updateMember(member.id, {
                        campaign_id: member.campaign_id, name: member.name, items: updatedItems
                    }).catch(err => console.error("Error propagating lore name to inventory:", err))
                }
            }
        } catch (error) {
            console.error("Error updating lore name:", error)
        }
    }

    async function saveSubtitle() {
        setEditingField(null)
        if (draftSubtitle === (entry.subtitle || "")) return
        try {
            await loreHook.updateLoreEntry(entry.id, { subtitle: draftSubtitle })
        } catch (error) {
            console.error("Error updating lore subtitle:", error)
        }
    }

    async function handleTypeChange(type: LoreEntryType) {
        try {
            const updates: Partial<TtrpgLoreEntry> = { type }
            if (type !== "person") updates.faction_id = ""
            await loreHook.updateLoreEntry(entry.id, updates)
        } catch (error) {
            console.error("Error updating lore type:", error)
        }
    }

    async function handleFactionChange(factionId: string) {
        try {
            await loreHook.updateLoreEntry(entry.id, { faction_id: factionId || "" })
        } catch (error) {
            console.error("Error updating faction:", error)
        }
    }

    async function handleSessionChange(sessionId: string) {
        try {
            await loreHook.updateLoreEntry(entry.id, { session_id: sessionId || undefined })
        } catch (error) {
            console.error("Error updating session:", error)
        }
    }

    async function handleDelete() {
        if (!confirm("Are you sure you want to remove this entry?")) return
        try {
            await loreHook.deleteLoreEntry(entry.id)
            onDelete()
        } catch (error) {
            console.error("Error deleting lore entry:", error)
            alert("Error deleting lore entry")
        }
    }

    return (
        <div>
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                {cameFromSessionId && (
                    <button onClick={backToOriginSession}>Back to session</button>
                )}
                {backToOriginMember && (
                    <button onClick={backToOriginMember}>Back to {cameFromMemberName || "player"}</button>
                )}
                <button onClick={() => { onBack(); clearCameFromSessionId() }}>Back to lore list</button>
            </div>

            <div className="ttrpg-card" style={{ ...themeStyles.entityCard(LORE_COLORS[entry.type]), backgroundColor: LORE_COLORS[entry.type] }}>
                {/* Name — click to edit */}
                <div style={{ marginBottom: "0.5rem" }}>
                    {editingField === "name" ? (
                        <input
                            type="text"
                            value={draftName}
                            onChange={e => setDraftName(e.target.value)}
                            onBlur={saveName}
                            onKeyDown={e => { if (e.key === "Enter") saveName() }}
                            autoFocus
                            style={{ width: "100%", padding: "0.5rem", boxSizing: "border-box", fontSize: "1.2rem", fontWeight: "bold" }}
                        />
                    ) : (
                        <div style={{ display: "flex", alignItems: "baseline" }}>
                            <strong
                                className="ttrpg-click-to-edit"
                                style={{ ...themeStyles.clickToEdit, fontSize: "1.2rem" }}
                                onClick={() => { setDraftName(entry.name); setEditingField("name") }}
                                title="Click to edit"
                            >
                                {entry.name}
                            </strong>
                            <span style={{ color: "#666", marginLeft: "0.5rem" }}>({LORE_LABELS[entry.type]})</span>
                        </div>
                    )}
                </div>

                {/* Subtitle — click to edit */}
                {editingField === "subtitle" ? (
                    <div style={{ marginBottom: "0.75rem" }}>
                        <AutoResizeTextarea
                            value={draftSubtitle}
                            onChange={e => setDraftSubtitle(e.target.value)}
                            placeholder="e.g. Dwarven blacksmith of Ironhold"
                        />
                        <button onClick={saveSubtitle} style={{ marginTop: "0.25rem" }}>Save</button>
                    </div>
                ) : (
                    <div
                        className="ttrpg-click-to-edit"
                        onClick={() => { setDraftSubtitle(entry.subtitle || ""); setEditingField("subtitle") }}
                        style={{
                            ...themeStyles.clickToEdit,
                            fontStyle: "italic",
                            color: entry.subtitle ? ttrpg.colors.textMuted : "#999",
                            marginBottom: "0.75rem",
                            minHeight: "1.2em"
                        }}
                        title="Click to edit"
                    >
                        {entry.subtitle || "Click to add subtitle..."}
                    </div>
                )}

                {/* Type — always-visible select */}
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.75rem" }}>
                    <strong>Type:</strong>
                    <select
                        value={entry.type}
                        onChange={e => handleTypeChange(e.target.value as LoreEntryType)}
                        style={{ padding: "0.3rem 0.5rem" }}
                    >
                        {ALL_LORE_TYPES.map(type => (
                            <option key={type} value={type}>{LORE_LABELS[type]}</option>
                        ))}
                    </select>
                </div>

                {/* Faction — person only, always-visible select */}
                {entry.type === "person" && (
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.75rem" }}>
                        <strong>Faction:</strong>
                        <select
                            value={entry.faction_id || ""}
                            onChange={e => handleFactionChange(e.target.value)}
                            style={{ padding: "0.3rem 0.5rem" }}
                        >
                            <option value="">No Faction</option>
                            {factions.map(f => (
                                <option key={f.id} value={f.id}>{f.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Session — always-visible select */}
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.75rem" }}>
                    <strong>Session:</strong>
                    <select
                        value={entry.session_id || ""}
                        onChange={e => handleSessionChange(e.target.value)}
                        style={{ padding: "0.3rem 0.5rem" }}
                    >
                        <option value="">No Session</option>
                        {data.sessions.map(s => (
                            <option key={s.id} value={s.id}>Session {s.session_number} — {s.date}</option>
                        ))}
                    </select>
                    {entrySession && (
                        <button
                            onClick={() => goToSession(entrySession.id)}
                            style={{ fontSize: "0.85rem" }}
                        >
                            Go to session notes
                        </button>
                    )}
                </div>

                {/* Faction pill for person (read-only navigation) */}
                {entry.type === "person" && faction && (
                    <div style={{ marginBottom: "0.75rem" }}>
                        <span
                            onClick={() => openLoreDetail(faction.id)}
                            style={{
                                backgroundColor: LORE_COLORS.faction,
                                color: "#222",
                                padding: "0.15rem 0.5rem",
                                borderRadius: "12px",
                                cursor: "pointer",
                                fontSize: "0.9rem"
                            }}
                        >
                            {faction.name}
                        </span>
                    </div>
                )}

                {/* Faction members list */}
                {entry.type === "faction" && (
                    <LoreFactionMembers
                        factionId={entry.id}
                        factionMembers={factionMembers}
                        openLoreDetail={openLoreDetail}
                        onAddPersonToFaction={onAddPersonToFaction}
                    />
                )}

                {/* Lore item holder */}
                {entry.type === "item" && (
                    <LoreItemHolder
                        loreId={entry.id}
                        loreName={entry.name}
                        members={data.members}
                        membersHook={membersHook}
                        updateMembers={updateMembers}
                        openMemberDetail={openMemberDetail}
                    />
                )}

                {/* Session mentions */}
                {mentions.length > 0 && (
                    <div style={themeStyles.sectionDivider}>
                        <strong>Session mentions ({mentions.length})</strong>
                        {mentions.map(({ note, session }) => (
                            <div
                                key={note.id}
                                className="ttrpg-card"
                                style={{ ...themeStyles.card, cursor: "pointer", marginTop: "0.5rem" }}
                                onClick={() => goToSession(session.id, note.id)}
                            >
                                <div style={{ fontSize: "0.8rem", color: ttrpg.colors.textMuted, marginBottom: "0.25rem" }}>
                                    Session {session.session_number} — {session.date}
                                </div>
                                <div style={{ fontSize: "0.9rem", color: ttrpg.colors.textDark }}>
                                    <LoreNoteText text={note.text} loreEntries={data.lore} members={data.members} quests={data.quests} projects={data.projects} onLoreClick={openLoreDetail} onMemberClick={openMemberDetail} onQuestClick={openQuestDetail} onProjectClick={openProjectDetail} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Delete button */}
                <div style={{ ...themeStyles.sectionDivider, marginTop: "2rem" }}>
                    <button
                        onClick={handleDelete}
                        className="ttrpg-btn-danger"
                        style={themeStyles.dangerButton}
                    >
                        Remove Entry
                    </button>
                </div>
            </div>
        </div>
    )
}
