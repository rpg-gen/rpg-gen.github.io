import TtrpgMember from "../../types/ttrpg/TtrpgMember"
import TtrpgSessionNote from "../../types/ttrpg/TtrpgSessionNote"
import AutoResizeTextarea from "./auto_resize_textarea"
import { primaryButtonStyle } from "../../pages/ttrpg/campaign_detail_styles"

interface MemberFormProps {
    campaignId: string
    formMode: string // "add" or member id
    formName: string
    formPlayedBy: string
    formNotes: string
    setFormName: (v: string) => void
    setFormPlayedBy: (v: string) => void
    setFormNotes: (v: string) => void
    members: TtrpgMember[]
    notes: TtrpgSessionNote[]
    membersHook: {
        createMember: (member: Omit<TtrpgMember, "id">) => Promise<string>
        updateMember: (id: string, member: Partial<TtrpgMember>) => Promise<void>
        deleteMember: (id: string) => Promise<void>
    }
    notesHook: {
        updateNote: (id: string, note: Partial<TtrpgSessionNote>) => Promise<void>
    }
    onClose: () => void
}

export default function MemberForm({
    campaignId, formMode, formName, formPlayedBy, formNotes,
    setFormName, setFormPlayedBy, setFormNotes,
    members, notes, membersHook, notesHook, onClose
}: MemberFormProps) {

    const isEditing = formMode !== "add"
    const editingMember = isEditing ? members.find(m => m.id === formMode) : null

    async function handleCreate() {
        if (!formName.trim()) { alert("Member name is required"); return }
        try {
            await membersHook.createMember({
                campaign_id: campaignId, name: formName.trim(),
                played_by: formPlayedBy.trim(), notes: formNotes.trim(),
                items: [], wealth: 0, renown: 0, followers: [], titles: []
            })
            onClose()
        } catch (error) {
            console.error("Error creating member:", error)
            alert("Error creating member")
        }
    }

    async function handleUpdate(member: TtrpgMember) {
        if (!formName.trim()) { alert("Member name is required"); return }
        try {
            const newName = formName.trim()
            await membersHook.updateMember(member.id, {
                campaign_id: member.campaign_id, name: newName,
                played_by: formPlayedBy.trim(), notes: formNotes.trim(), items: member.items
            })
            if (newName !== member.name) {
                const pattern = new RegExp(`\\[\\[${member.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\]\\]`, "gi")
                for (const note of notes) {
                    if (pattern.test(note.text)) {
                        await notesHook.updateNote(note.id, { text: note.text.replace(pattern, `[[${newName}]]`) })
                    }
                }
            }
            onClose()
        } catch (error) {
            console.error("Error updating member:", error)
            alert("Error updating member")
        }
    }

    async function handleDelete(id: string) {
        if (confirm("Are you sure you want to remove this party member?")) {
            try { await membersHook.deleteMember(id); onClose() }
            catch (error) { console.error("Error deleting member:", error); alert("Error deleting member") }
        }
    }

    return (
        <div>
            <h3>{isEditing ? "Edit Party Member" : "Add Party Member"}</h3>
            <label style={{ display: "block", marginBottom: "0.25rem" }}>Name</label>
            <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Member name"
                style={{ width: "100%", padding: "0.5rem", boxSizing: "border-box" }}
                onKeyDown={(e) => { if (e.key === "Enter") { isEditing && editingMember ? handleUpdate(editingMember) : handleCreate() } }}
            />
            <label style={{ display: "block", marginTop: "0.75rem", marginBottom: "0.25rem" }}>Played By</label>
            <input type="text" value={formPlayedBy} onChange={(e) => setFormPlayedBy(e.target.value)} placeholder="Player name"
                style={{ width: "100%", padding: "0.5rem", boxSizing: "border-box" }}
            />
            <label style={{ display: "block", marginTop: "0.75rem", marginBottom: "0.25rem" }}>Notes</label>
            <AutoResizeTextarea value={formNotes} onChange={(e) => setFormNotes(e.target.value)} placeholder="Notes about this member..." />
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                {isEditing && editingMember
                    ? <button onClick={() => handleUpdate(editingMember)} style={primaryButtonStyle}>Save</button>
                    : <button onClick={handleCreate} style={primaryButtonStyle}>Add</button>
                }
                <button onClick={onClose}>Cancel</button>
            </div>
            {isEditing && (
                <div style={{ marginTop: "2rem", borderTop: "1px solid #555", paddingTop: "1rem" }}>
                    <button onClick={() => handleDelete(formMode)}
                        style={{ backgroundColor: "#c0392b", color: "#fff", border: "none", padding: "0.5rem 1rem", cursor: "pointer" }}>
                        Remove Member
                    </button>
                </div>
            )}
        </div>
    )
}
