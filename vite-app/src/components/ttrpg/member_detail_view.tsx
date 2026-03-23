import { useState, useEffect, useRef } from "react"
import TtrpgMember from "../../types/ttrpg/TtrpgMember"
import TtrpgSession from "../../types/ttrpg/TtrpgSession"
import TtrpgSessionNote from "../../types/ttrpg/TtrpgSessionNote"
import TtrpgLoreEntry from "../../types/ttrpg/TtrpgLoreEntry"
import TtrpgPartyResources from "../../types/ttrpg/TtrpgPartyResources"
import StatCounter from "./stat_counter"
import MemberInventory from "./member_inventory"
import MemberFollowers from "./member_followers"
import MemberTitles from "./member_titles"
import MemberStatuses from "./member_statuses"
import CollapsibleSection from "./collapsible_section"
import LoreNoteText from "./lore_note_text"
import AutoResizeTextarea from "./auto_resize_textarea"
import { ttrpg, themeStyles } from "../../configs/ttrpg_theme"

interface CampaignData {
    sessions: TtrpgSession[]
    members: TtrpgMember[]
    notes: TtrpgSessionNote[]
    lore: TtrpgLoreEntry[]
    partyResources: TtrpgPartyResources
}

interface MemberDetailViewProps {
    member: TtrpgMember
    campaignId: string
    data: CampaignData
    membersHook: {
        updateMember: (id: string, member: Partial<TtrpgMember>) => Promise<void>
        deleteMember: (id: string) => Promise<void>
    }
    notesHook: {
        updateNote: (id: string, note: Partial<TtrpgSessionNote>) => Promise<void>
    }
    partyResourcesHook: {
        unassignItemFromMember: (
            campaignId: string, memberId: string,
            item: { name: string; quantity: number },
            updatedItems: { name: string; quantity: number }[],
            currentUnassigned: { name: string; quantity: number }[]
        ) => Promise<void>
        unassignFollowerFromMember: (
            campaignId: string, memberId: string,
            follower: { name: string; roll_bonus: number; type: "sage" | "crafter" },
            updatedFollowers: { name: string; roll_bonus: number; type: "sage" | "crafter" }[],
            currentUnassigned: { name: string; roll_bonus: number; type: "sage" | "crafter" }[]
        ) => Promise<void>
    }
    updateMembers: (updater: (members: TtrpgMember[]) => TtrpgMember[]) => void
    updatePartyResources: (updater: (pr: TtrpgPartyResources) => TtrpgPartyResources) => void
    openLoreDetail: (entryId: string) => void
    openMemberDetail: (memberId: string) => void
    goToSession: (sessionId: string, noteId?: string) => void
    cameFromSessionId: string | null
    backToOriginSession: () => void
    clearCameFromSessionId: () => void
    onBack: () => void
    onDelete: () => void
}

export default function MemberDetailView({
    member, campaignId, data, membersHook, notesHook, partyResourcesHook,
    updateMembers, updatePartyResources,
    openLoreDetail, openMemberDetail, goToSession,
    cameFromSessionId, backToOriginSession, clearCameFromSessionId,
    onBack, onDelete
}: MemberDetailViewProps) {

    const [editingField, setEditingField] = useState<"name" | "played_by" | "notes" | null>(null)
    const editingFieldRef = useRef(editingField)
    editingFieldRef.current = editingField

    const [draftName, setDraftName] = useState(member.name)
    const [draftPlayedBy, setDraftPlayedBy] = useState(member.played_by || "")
    const [draftNotes, setDraftNotes] = useState(member.notes || "")

    const [addingItem, setAddingItem] = useState(false)
    const [addingFollower, setAddingFollower] = useState(false)
    const [addingTitle, setAddingTitle] = useState(false)
    const [addingStatus, setAddingStatus] = useState(false)

    useEffect(() => {
        if (editingFieldRef.current !== "name") setDraftName(member.name)
        if (editingFieldRef.current !== "played_by") setDraftPlayedBy(member.played_by || "")
        if (editingFieldRef.current !== "notes") setDraftNotes(member.notes || "")
    }, [member])

    function handleWealthChange(newVal: number) {
        const prev = member.wealth
        updateMembers(ms => ms.map(m => m.id === member.id ? { ...m, wealth: newVal } : m))
        membersHook.updateMember(member.id, { campaign_id: campaignId, wealth: newVal })
            .catch(() => {
                alert("Error saving wealth — reverting")
                updateMembers(ms => ms.map(m => m.id === member.id ? { ...m, wealth: prev } : m))
            })
    }

    function handleRenownChange(newVal: number) {
        const prev = member.renown
        updateMembers(ms => ms.map(m => m.id === member.id ? { ...m, renown: newVal } : m))
        membersHook.updateMember(member.id, { campaign_id: campaignId, renown: newVal })
            .catch(() => {
                alert("Error saving renown — reverting")
                updateMembers(ms => ms.map(m => m.id === member.id ? { ...m, renown: prev } : m))
            })
    }

    async function saveName() {
        setEditingField(null)
        const trimmed = draftName.trim()
        if (!trimmed || trimmed === member.name) return
        try {
            await membersHook.updateMember(member.id, { name: trimmed })
            const pattern = new RegExp(`\\[\\[${member.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\]\\]`, "gi")
            for (const note of data.notes) {
                if (pattern.test(note.text)) {
                    await notesHook.updateNote(note.id, { text: note.text.replace(pattern, `[[${trimmed}]]`) })
                }
            }
        } catch (error) {
            console.error("Error updating member name:", error)
        }
    }

    async function savePlayedBy() {
        setEditingField(null)
        if (draftPlayedBy === (member.played_by || "")) return
        try {
            await membersHook.updateMember(member.id, { played_by: draftPlayedBy.trim() })
        } catch (error) {
            console.error("Error updating played_by:", error)
        }
    }

    async function saveNotes() {
        setEditingField(null)
        if (draftNotes === (member.notes || "")) return
        try {
            await membersHook.updateMember(member.id, { notes: draftNotes })
        } catch (error) {
            console.error("Error updating member notes:", error)
        }
    }

    async function handleDelete() {
        if (!confirm("Are you sure you want to remove this party member?")) return
        try {
            await membersHook.deleteMember(member.id)
            onDelete()
        } catch (error) {
            console.error("Error deleting member:", error)
            alert("Error deleting member")
        }
    }

    const mentions: { note: TtrpgSessionNote; session: TtrpgSession }[] = []
    for (const note of data.notes) {
        if (note.text.includes(`[[${member.name}]]`)) {
            const session = data.sessions.find(s => s.id === note.session_id)
            if (session) mentions.push({ note, session })
        }
    }
    mentions.sort((a, b) =>
        a.session.session_number - b.session.session_number
        || a.note.created_at.localeCompare(b.note.created_at)
    )

    return (
        <div>
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                {cameFromSessionId && <button onClick={backToOriginSession}>Back to session</button>}
                <button onClick={() => { onBack(); clearCameFromSessionId() }}>Back to party list</button>
            </div>

            <div className="ttrpg-card" style={{ ...themeStyles.entityCard(ttrpg.colors.member), backgroundColor: ttrpg.colors.member }}>
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
                        <strong
                            className="ttrpg-click-to-edit"
                            style={{ ...themeStyles.clickToEdit, fontSize: "1.2rem" }}
                            onClick={() => { setDraftName(member.name); setEditingField("name") }}
                            title="Click to edit"
                        >
                            {member.name}
                        </strong>
                    )}
                </div>

                {/* Played By — click to edit */}
                {editingField === "played_by" ? (
                    <div style={{ marginBottom: "0.75rem" }}>
                        <input
                            type="text"
                            value={draftPlayedBy}
                            onChange={e => setDraftPlayedBy(e.target.value)}
                            onBlur={savePlayedBy}
                            onKeyDown={e => { if (e.key === "Enter") savePlayedBy() }}
                            autoFocus
                            placeholder="Player name"
                            style={{ width: "100%", padding: "0.5rem", boxSizing: "border-box" }}
                        />
                    </div>
                ) : (
                    <div
                        className="ttrpg-click-to-edit"
                        onClick={() => { setDraftPlayedBy(member.played_by || ""); setEditingField("played_by") }}
                        style={{
                            ...themeStyles.clickToEdit,
                            fontStyle: "italic",
                            color: member.played_by ? ttrpg.colors.textMuted : "#999",
                            marginBottom: "0.75rem",
                        }}
                        title="Click to edit"
                    >
                        {member.played_by ? `(${member.played_by})` : "Click to add player..."}
                    </div>
                )}

                {/* Notes — click to edit */}
                {editingField === "notes" ? (
                    <div style={{ marginBottom: "0.75rem" }}>
                        <AutoResizeTextarea
                            value={draftNotes}
                            onChange={e => setDraftNotes(e.target.value)}
                            placeholder="Notes about this member..."
                        />
                        <button onClick={saveNotes} style={{ marginTop: "0.25rem" }}>Save</button>
                    </div>
                ) : (
                    <div
                        className="ttrpg-click-to-edit"
                        onClick={() => { setDraftNotes(member.notes || ""); setEditingField("notes") }}
                        style={{
                            ...themeStyles.clickToEdit,
                            fontStyle: member.notes ? "italic" : "normal",
                            color: member.notes ? ttrpg.colors.textMuted : "#999",
                            marginBottom: "0.75rem",
                            minHeight: "1.2em"
                        }}
                        title="Click to edit"
                    >
                        {member.notes || "Click to add notes..."}
                    </div>
                )}

                <CollapsibleSection title="Statuses" count={member.statuses.length} onAdd={() => setAddingStatus(true)}>
                    <MemberStatuses member={member} membersHook={membersHook} updateMembers={updateMembers}
                        adding={addingStatus} setAdding={setAddingStatus} />
                </CollapsibleSection>

                <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                    <StatCounter label="Wealth" value={member.wealth} min={0} max={5} onChange={handleWealthChange} />
                    <StatCounter label="Renown" value={member.renown} min={0} max={5} onChange={handleRenownChange} />
                </div>

                <CollapsibleSection title="Inventory" count={member.items.reduce((sum, i) => sum + i.quantity, 0)} onAdd={() => setAddingItem(true)}>
                    <MemberInventory
                        member={member} membersHook={membersHook} updateMembers={updateMembers}
                        showUnassign campaignId={campaignId}
                        partyResourcesHook={partyResourcesHook}
                        partyResources={data.partyResources}
                        updatePartyResources={updatePartyResources}
                        adding={addingItem} setAdding={setAddingItem}
                    />
                </CollapsibleSection>

                <CollapsibleSection title="Followers" count={member.followers.length} onAdd={() => setAddingFollower(true)}>
                    <MemberFollowers
                        member={member} membersHook={membersHook} updateMembers={updateMembers}
                        campaignId={campaignId} partyResourcesHook={partyResourcesHook}
                        partyResources={data.partyResources} updatePartyResources={updatePartyResources}
                        adding={addingFollower} setAdding={setAddingFollower}
                    />
                </CollapsibleSection>

                <CollapsibleSection title="Titles" count={member.titles.length} onAdd={() => setAddingTitle(true)}>
                    <MemberTitles member={member} membersHook={membersHook} updateMembers={updateMembers}
                        adding={addingTitle} setAdding={setAddingTitle} />
                </CollapsibleSection>

                <CollapsibleSection title="Session Mentions" count={mentions.length}>
                    {mentions.length > 0 ? (
                        mentions.map(({ note, session }) => (
                            <div key={note.id}
                                className="ttrpg-card"
                                style={{ ...themeStyles.card, cursor: "pointer", marginTop: "0.5rem" }}
                                onClick={() => goToSession(session.id, note.id)}>
                                <div style={{ fontSize: "0.8rem", color: ttrpg.colors.textMuted, marginBottom: "0.25rem" }}>
                                    Session {session.session_number} — {session.date}
                                </div>
                                <div style={{ fontSize: "0.9rem", color: ttrpg.colors.textDark }}>
                                    <LoreNoteText text={note.text} loreEntries={data.lore} members={data.members} onLoreClick={openLoreDetail} onMemberClick={openMemberDetail} />
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ color: ttrpg.colors.textMuted, fontSize: "0.9rem" }}>No session mentions yet.</div>
                    )}
                </CollapsibleSection>

                {/* Delete button */}
                <div style={{ ...themeStyles.sectionDivider, marginTop: "2rem" }}>
                    <button
                        onClick={handleDelete}
                        className="ttrpg-btn-danger"
                        style={themeStyles.dangerButton}
                    >
                        Remove Member
                    </button>
                </div>
            </div>
        </div>
    )
}

