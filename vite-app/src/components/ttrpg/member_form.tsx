import TtrpgMember from "../../types/ttrpg/TtrpgMember"
import AutoResizeTextarea from "./auto_resize_textarea"
import { primaryButtonStyle } from "../../pages/ttrpg/campaign_detail_styles"

interface MemberFormProps {
    campaignId: string
    formName: string
    formPlayedBy: string
    formNotes: string
    setFormName: (v: string) => void
    setFormPlayedBy: (v: string) => void
    setFormNotes: (v: string) => void
    membersHook: {
        createMember: (member: Omit<TtrpgMember, "id">) => Promise<string>
    }
    onClose: () => void
}

export default function MemberForm({
    campaignId, formName, formPlayedBy, formNotes,
    setFormName, setFormPlayedBy, setFormNotes,
    membersHook, onClose
}: MemberFormProps) {

    async function handleCreate() {
        if (!formName.trim()) { alert("Member name is required"); return }
        try {
            await membersHook.createMember({
                campaign_id: campaignId, name: formName.trim(),
                played_by: formPlayedBy.trim(), notes: formNotes.trim(),
                items: [], wealth: 0, renown: 0, followers: [], titles: [], statuses: []
            })
            onClose()
        } catch (error) {
            console.error("Error creating member:", error)
            alert("Error creating member")
        }
    }

    return (
        <div>
            <h3>Add Party Member</h3>
            <label style={{ display: "block", marginBottom: "0.25rem" }}>Name</label>
            <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Member name"
                style={{ width: "100%", padding: "0.5rem", boxSizing: "border-box" }}
                onKeyDown={(e) => { if (e.key === "Enter") handleCreate() }}
            />
            <label style={{ display: "block", marginTop: "0.75rem", marginBottom: "0.25rem" }}>Played By</label>
            <input type="text" value={formPlayedBy} onChange={(e) => setFormPlayedBy(e.target.value)} placeholder="Player name"
                style={{ width: "100%", padding: "0.5rem", boxSizing: "border-box" }}
            />
            <label style={{ display: "block", marginTop: "0.75rem", marginBottom: "0.25rem" }}>Notes</label>
            <AutoResizeTextarea value={formNotes} onChange={(e) => setFormNotes(e.target.value)} placeholder="Notes about this member..." />
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                <button onClick={handleCreate} style={primaryButtonStyle}>Add</button>
                <button onClick={onClose}>Cancel</button>
            </div>
        </div>
    )
}
