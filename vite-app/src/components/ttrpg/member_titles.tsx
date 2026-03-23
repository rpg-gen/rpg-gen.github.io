import { useState } from "react"
import TtrpgMember, { TtrpgMemberTitle } from "../../types/ttrpg/TtrpgMember"
import { themeStyles } from "../../configs/ttrpg_theme"
import { primaryButtonSmallStyle } from "../../pages/ttrpg/campaign_detail_styles"

interface MemberTitlesProps {
    member: TtrpgMember
    membersHook: { updateMember: (id: string, member: Partial<TtrpgMember>) => Promise<void> }
    updateMembers: (updater: (members: TtrpgMember[]) => TtrpgMember[]) => void
    adding?: boolean
    setAdding?: (v: boolean) => void
}

export default function MemberTitles({ member, membersHook, updateMembers, adding: externalAdding, setAdding: externalSetAdding }: MemberTitlesProps) {

    const [internalAdding, setInternalAdding] = useState(false)
    const adding = externalAdding ?? internalAdding
    const setAdding = externalSetAdding ?? setInternalAdding
    const [newName, setNewName] = useState("")
    const [newDesc, setNewDesc] = useState("")
    const [editIdx, setEditIdx] = useState<number | null>(null)
    const [editName, setEditName] = useState("")
    const [editDesc, setEditDesc] = useState("")

    function optimistic(newTitles: TtrpgMemberTitle[]) {
        updateMembers(ms => ms.map(m => m.id === member.id ? { ...m, titles: newTitles } : m))
    }

    async function handleAdd() {
        if (!newName.trim()) { alert("Title name is required"); return }
        const title: TtrpgMemberTitle = { name: newName.trim(), description: newDesc.trim() }
        const updated = [...member.titles, title]
        const prev = member.titles
        optimistic(updated)
        setAdding(false); setNewName(""); setNewDesc("")
        try { await membersHook.updateMember(member.id, { campaign_id: member.campaign_id, titles: updated }) }
        catch { alert("Error saving title — reverting"); optimistic(prev) }
    }

    async function handleUpdate(idx: number) {
        if (!editName.trim()) { alert("Title name is required"); return }
        const updated = member.titles.map((t, i) =>
            i === idx ? { name: editName.trim(), description: editDesc.trim() } : t
        )
        const prev = member.titles
        optimistic(updated)
        setEditIdx(null)
        try { await membersHook.updateMember(member.id, { campaign_id: member.campaign_id, titles: updated }) }
        catch { alert("Error saving title — reverting"); optimistic(prev) }
    }

    async function handleRemove(idx: number) {
        const updated = member.titles.filter((_, i) => i !== idx)
        const prev = member.titles
        optimistic(updated)
        setEditIdx(null)
        try { await membersHook.updateMember(member.id, { campaign_id: member.campaign_id, titles: updated }) }
        catch { alert("Error removing title — reverting"); optimistic(prev) }
    }

    return (
        <div style={{ paddingLeft: "1rem" }}>
            {member.titles.map((t, idx) => (
                <div key={idx} style={{ marginBottom: "0.25rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <strong onClick={() => { setEditIdx(idx); setEditName(t.name); setEditDesc(t.description) }}
                            style={{ fontSize: "0.9rem", cursor: "pointer", textDecoration: "underline", textDecorationColor: "#ccc" }}>
                            {t.name}
                        </strong>
                    </div>
                    {t.description && <div style={{ fontSize: "0.85rem", color: "#555", fontStyle: "italic", paddingLeft: "0.5rem" }}>{t.description}</div>}
                </div>
            ))}

            {adding && (
                <div style={themeStyles.modalBackdrop} onClick={() => { setAdding(false); setNewName(""); setNewDesc("") }}>
                    <div className="ttrpg-modal-content" style={themeStyles.tinyModalContent} onClick={e => e.stopPropagation()}>
                        <strong style={{ display: "block", marginBottom: "0.75rem" }}>Add Title</strong>
                        <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.85rem" }}>Name</label>
                        <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Title name"
                            style={{ width: "100%", padding: "0.4rem", boxSizing: "border-box", marginBottom: "0.5rem" }} autoFocus />
                        <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.85rem" }}>Description</label>
                        <input type="text" value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Description (optional)"
                            style={{ width: "100%", padding: "0.4rem", boxSizing: "border-box", marginBottom: "1rem" }} />
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button onClick={handleAdd} style={primaryButtonSmallStyle}>Add</button>
                            <button onClick={() => { setAdding(false); setNewName(""); setNewDesc("") }} style={{ fontSize: "0.8rem" }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {editIdx !== null && member.titles[editIdx] && (
                <div style={themeStyles.modalBackdrop} onClick={() => setEditIdx(null)}>
                    <div className="ttrpg-modal-content" style={themeStyles.tinyModalContent} onClick={e => e.stopPropagation()}>
                        <strong style={{ display: "block", marginBottom: "0.75rem" }}>Edit Title</strong>
                        <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.85rem" }}>Name</label>
                        <input type="text" value={editName} onChange={e => setEditName(e.target.value)} placeholder="Title name"
                            style={{ width: "100%", padding: "0.4rem", boxSizing: "border-box", marginBottom: "0.5rem" }} autoFocus />
                        <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.85rem" }}>Description</label>
                        <input type="text" value={editDesc} onChange={e => setEditDesc(e.target.value)} placeholder="Description (optional)"
                            style={{ width: "100%", padding: "0.4rem", boxSizing: "border-box", marginBottom: "1rem" }} />
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button onClick={() => handleUpdate(editIdx)} style={primaryButtonSmallStyle}>Save</button>
                            <button onClick={() => setEditIdx(null)} style={{ fontSize: "0.8rem" }}>Cancel</button>
                            <button onClick={() => handleRemove(editIdx)} style={{ fontSize: "0.8rem", color: "#c0392b" }}>Remove</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
