import { useState, useEffect } from "react"
import TtrpgSession from "../../types/ttrpg/TtrpgSession"
import TtrpgSessionNote from "../../types/ttrpg/TtrpgSessionNote"
import TtrpgLoreEntry from "../../types/ttrpg/TtrpgLoreEntry"
import TtrpgMember from "../../types/ttrpg/TtrpgMember"
import LoreNoteText from "./lore_note_text"
import MemberInventory from "./member_inventory"
import { cardStyle, primaryButtonStyle } from "../../pages/ttrpg/campaign_detail_styles"

interface CampaignData {
    sessions: TtrpgSession[]
    members: TtrpgMember[]
    notes: TtrpgSessionNote[]
    lore: TtrpgLoreEntry[]
}

interface MembersHook {
    createMember: (member: Omit<TtrpgMember, "id">) => Promise<string>
    updateMember: (id: string, member: Partial<TtrpgMember>) => Promise<void>
    deleteMember: (id: string) => Promise<void>
}

interface NotesHook {
    updateNote: (id: string, note: Partial<TtrpgSessionNote>) => Promise<void>
}

interface PartyTabProps {
    campaignId: string
    data: CampaignData
    membersHook: MembersHook
    notesHook: NotesHook
    updateMembers: (updater: (members: TtrpgMember[]) => TtrpgMember[]) => void
    reload: () => Promise<void>
    openLoreDetail: (entryId: string) => void
    openMemberDetail: (memberId: string) => void
    goToSession: (sessionId: string, noteId?: string) => void
    cameFromSessionId: string | null
    backToOriginSession: () => void
    pendingDetailId: string | null
    clearPendingDetailId: () => void
    resetSignal: number
    clearCameFromSessionId: () => void
}

export default function PartyTab({
    campaignId,
    data,
    membersHook,
    notesHook,
    updateMembers,
    reload,
    openLoreDetail,
    openMemberDetail,
    goToSession,
    cameFromSessionId,
    backToOriginSession,
    pendingDetailId,
    clearPendingDetailId,
    resetSignal,
    clearCameFromSessionId
}: PartyTabProps) {

    // Member detail view
    const [memberDetailId, setMemberDetailId] = useState<string | null>(null)

    // Member form state: null = list view, "add" = adding, member id = editing
    const [memberFormMode, setMemberFormMode] = useState<string | null>(null)
    const [memberFormName, setMemberFormName] = useState("")
    const [memberFormPlayedBy, setMemberFormPlayedBy] = useState("")
    const [memberFormNotes, setMemberFormNotes] = useState("")

    useEffect(() => {
        if (pendingDetailId) {
            setMemberDetailId(pendingDetailId)
            setMemberFormMode(null)
            clearPendingDetailId()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pendingDetailId])

    useEffect(() => {
        if (resetSignal > 0) {
            setMemberDetailId(null)
        }
    }, [resetSignal])

    // ==================== MEMBER CRUD ====================

    async function handleCreateMember() {
        if (!memberFormName.trim()) {
            alert("Member name is required")
            return
        }
        try {
            await membersHook.createMember({
                campaign_id: campaignId,
                name: memberFormName.trim(),
                played_by: memberFormPlayedBy.trim(),
                notes: memberFormNotes.trim(),
                items: []
            })
            setMemberFormName("")
            setMemberFormPlayedBy("")
            setMemberFormNotes("")
            setMemberFormMode(null)
            await reload()
        } catch (error) {
            console.error("Error creating member:", error)
            alert("Error creating member")
        }
    }

    async function handleDeleteMember(id: string) {
        if (confirm("Are you sure you want to remove this party member?")) {
            try {
                await membersHook.deleteMember(id)
                setMemberFormMode(null)
                setMemberFormName("")
                setMemberFormPlayedBy("")
                setMemberFormNotes("")
                await reload()
            } catch (error) {
                console.error("Error deleting member:", error)
                alert("Error deleting member")
            }
        }
    }

    async function handleUpdateMemberName(member: TtrpgMember) {
        if (!memberFormName.trim()) {
            alert("Member name is required")
            return
        }
        try {
            const newName = memberFormName.trim()
            await membersHook.updateMember(member.id, {
                campaign_id: member.campaign_id,
                name: newName,
                played_by: memberFormPlayedBy.trim(),
                notes: memberFormNotes.trim(),
                items: member.items
            })

            // Update all [[OldName]] references in session notes
            if (newName !== member.name) {
                const pattern = new RegExp(`\\[\\[${member.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\]\\]`, "gi")
                for (const note of data.notes) {
                    if (pattern.test(note.text)) {
                        const updatedText = note.text.replace(pattern, `[[${newName}]]`)
                        await notesHook.updateNote(note.id, { text: updatedText })
                    }
                }
            }

            setMemberFormMode(null)
            setMemberFormName("")
            setMemberFormPlayedBy("")
            setMemberFormNotes("")
            await reload()
        } catch (error) {
            console.error("Error updating member:", error)
            alert("Error updating member")
        }
    }

    // ==================== RENDER ====================

    // Member Detail View
    if (memberFormMode === null && memberDetailId !== null) {
        const member = data.members.find(m => m.id === memberDetailId)
        if (!member) return <div><button onClick={() => setMemberDetailId(null)}>Back</button><p>Member not found.</p></div>

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
                    {cameFromSessionId && (
                        <button onClick={backToOriginSession}>Back to session</button>
                    )}
                    <button onClick={() => { setMemberDetailId(null); clearCameFromSessionId() }}>Back to party list</button>
                </div>

                <div style={{ ...cardStyle, backgroundColor: "#f3e8ff" }}>
                    <div style={{ marginBottom: "0.5rem" }}>
                        <strong style={{ fontSize: "1.2rem" }}>{member.name}</strong>
                        {member.played_by && <span style={{ fontStyle: "italic", color: "#666", marginLeft: "0.5rem" }}>({member.played_by})</span>}
                    </div>
                    {member.notes && (
                        <div style={{ fontStyle: "italic", color: "#555", marginBottom: "0.75rem" }}>{member.notes}</div>
                    )}

                    {mentions.length > 0 ? (
                        <div style={{ borderTop: "1px solid #ccc", paddingTop: "0.75rem", marginTop: "0.5rem" }}>
                            <strong>Session mentions ({mentions.length})</strong>
                            {mentions.map(({ note, session }) => (
                                <div
                                    key={note.id}
                                    style={{
                                        border: "1px solid #ddd",
                                        borderRadius: "4px",
                                        padding: "0.5rem",
                                        marginTop: "0.5rem",
                                        backgroundColor: "#fff",
                                        cursor: "pointer"
                                    }}
                                    onClick={() => goToSession(session.id, note.id)}
                                >
                                    <div style={{ fontSize: "0.8rem", color: "#666", marginBottom: "0.25rem" }}>
                                        Session {session.session_number} — {session.date}
                                    </div>
                                    <div style={{ fontSize: "0.9rem", color: "#333" }}>
                                        <LoreNoteText text={note.text} loreEntries={data.lore} members={data.members} onLoreClick={openLoreDetail} onMemberClick={openMemberDetail} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ color: "#666", fontSize: "0.9rem", marginTop: "0.5rem" }}>
                            No session mentions yet.
                        </div>
                    )}
                </div>
            </div>
        )
    }

    // List View
    if (memberFormMode === null) {
        return (
            <div>
                {data.members.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "2rem", color: "#666" }}>
                        No party members yet.
                    </div>
                ) : (
                    data.members.map(member => (
                        <div key={member.id} style={cardStyle}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: member.notes ? "0.25rem" : "0.5rem" }}>
                                <span style={{ flex: 1 }}><strong>{member.name}</strong>{member.played_by && <span style={{ fontStyle: "italic", color: "#666", marginLeft: "0.35rem" }}>({member.played_by})</span>}</span>
                                <button onClick={() => { clearCameFromSessionId(); setMemberDetailId(member.id) }}>Mentions</button>
                                <button onClick={() => { setMemberFormMode(member.id); setMemberFormName(member.name); setMemberFormPlayedBy(member.played_by || ""); setMemberFormNotes(member.notes || "") }}>Edit</button>
                            </div>
                            {member.notes && (
                                <div style={{ fontStyle: "italic", color: "#555", fontSize: "0.9rem", marginBottom: "0.5rem" }}>{member.notes}</div>
                            )}

                            <MemberInventory member={member} membersHook={membersHook} updateMembers={updateMembers} />
                        </div>
                    ))
                )}

                <div style={{ marginTop: "1rem" }}>
                    <button onClick={() => { setMemberFormName(""); setMemberFormPlayedBy(""); setMemberFormNotes(""); setMemberFormMode("add") }} style={primaryButtonStyle}>Add Party Member</button>
                </div>
            </div>
        )
    }

    // Add/Edit Member Form
    const isEditing = memberFormMode !== "add"
    const editingMember = isEditing ? data.members.find(m => m.id === memberFormMode) : null

    return (
        <div>
            <h3>{isEditing ? "Edit Party Member" : "Add Party Member"}</h3>
            <label style={{ display: "block", marginBottom: "0.25rem" }}>Name</label>
            <input
                type="text"
                value={memberFormName}
                onChange={(e) => setMemberFormName(e.target.value)}
                placeholder="Member name"
                style={{ width: "100%", padding: "0.5rem", boxSizing: "border-box" }}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        if (isEditing && editingMember) handleUpdateMemberName(editingMember)
                        else handleCreateMember()
                    }
                }}
            />
            <label style={{ display: "block", marginTop: "0.75rem", marginBottom: "0.25rem" }}>Played By</label>
            <input
                type="text"
                value={memberFormPlayedBy}
                onChange={(e) => setMemberFormPlayedBy(e.target.value)}
                placeholder="Player name"
                style={{ width: "100%", padding: "0.5rem", boxSizing: "border-box" }}
            />
            <label style={{ display: "block", marginTop: "0.75rem", marginBottom: "0.25rem" }}>Notes</label>
            <textarea
                value={memberFormNotes}
                onChange={(e) => setMemberFormNotes(e.target.value)}
                placeholder="Notes about this member..."
                style={{ width: "100%", minHeight: "60px", padding: "0.5rem", boxSizing: "border-box" }}
            />
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                {isEditing && editingMember ? (
                    <button onClick={() => handleUpdateMemberName(editingMember)} style={primaryButtonStyle}>Save</button>
                ) : (
                    <button onClick={handleCreateMember} style={primaryButtonStyle}>Add</button>
                )}
                <button onClick={() => { setMemberFormMode(null); setMemberFormName(""); setMemberFormPlayedBy(""); setMemberFormNotes("") }}>Cancel</button>
            </div>

            {isEditing && (
                <div style={{ marginTop: "2rem", borderTop: "1px solid #555", paddingTop: "1rem" }}>
                    <button
                        onClick={() => handleDeleteMember(memberFormMode)}
                        style={{ backgroundColor: "#c0392b", color: "#fff", border: "none", padding: "0.5rem 1rem", cursor: "pointer" }}
                    >
                        Remove Member
                    </button>
                </div>
            )}
        </div>
    )
}
