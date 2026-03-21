import { useState } from "react"
import TtrpgMember, { TtrpgMemberTitle } from "../../types/ttrpg/TtrpgMember"
import { primaryButtonSmallStyle } from "../../pages/ttrpg/campaign_detail_styles"

interface MemberTitlesProps {
    member: TtrpgMember
    membersHook: { updateMember: (id: string, member: Partial<TtrpgMember>) => Promise<void> }
    updateMembers: (updater: (members: TtrpgMember[]) => TtrpgMember[]) => void
}

export default function MemberTitles({ member, membersHook, updateMembers }: MemberTitlesProps) {

    const [adding, setAdding] = useState(false)
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
        if (!confirm("Remove this title?")) return
        const updated = member.titles.filter((_, i) => i !== idx)
        const prev = member.titles
        optimistic(updated)
        try { await membersHook.updateMember(member.id, { campaign_id: member.campaign_id, titles: updated }) }
        catch { alert("Error removing title — reverting"); optimistic(prev) }
    }

    return (
        <div style={{ paddingLeft: "1rem" }}>
            {member.titles.map((t, idx) => (
                editIdx === idx ? (
                    <div key={idx} style={{ marginBottom: "0.5rem" }}>
                        <input type="text" value={editName} onChange={e => setEditName(e.target.value)} placeholder="Title name"
                            style={{ width: "100%", padding: "0.25rem", boxSizing: "border-box", marginBottom: "0.25rem" }} />
                        <input type="text" value={editDesc} onChange={e => setEditDesc(e.target.value)} placeholder="Description"
                            style={{ width: "100%", padding: "0.25rem", boxSizing: "border-box", marginBottom: "0.25rem" }} />
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button onClick={() => handleUpdate(idx)} style={primaryButtonSmallStyle}>Save</button>
                            <button onClick={() => setEditIdx(null)} style={{ fontSize: "0.8rem" }}>Cancel</button>
                        </div>
                    </div>
                ) : (
                    <div key={idx} style={{ marginBottom: "0.25rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <strong style={{ fontSize: "0.9rem" }}>{t.name}</strong>
                            <button onClick={() => { setEditIdx(idx); setEditName(t.name); setEditDesc(t.description) }} style={{ fontSize: "0.8rem" }}>Edit</button>
                            <button onClick={() => handleRemove(idx)} style={{ fontSize: "0.8rem" }}>x</button>
                        </div>
                        {t.description && <div style={{ fontSize: "0.85rem", color: "#555", fontStyle: "italic", paddingLeft: "0.5rem" }}>{t.description}</div>}
                    </div>
                )
            ))}

            {adding ? (
                <div style={{ marginTop: "0.25rem", marginBottom: "0.5rem" }}>
                    <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Title name"
                        style={{ width: "100%", padding: "0.25rem", boxSizing: "border-box", marginBottom: "0.25rem" }} autoFocus />
                    <input type="text" value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Description (optional)"
                        style={{ width: "100%", padding: "0.25rem", boxSizing: "border-box", marginBottom: "0.25rem" }} />
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button onClick={handleAdd} style={primaryButtonSmallStyle}>Add</button>
                        <button onClick={() => { setAdding(false); setNewName(""); setNewDesc("") }} style={{ fontSize: "0.8rem" }}>Cancel</button>
                    </div>
                </div>
            ) : (
                <button onClick={() => { setAdding(true); setNewName(""); setNewDesc("") }} style={{ marginTop: "0.25rem", fontSize: "0.8rem" }}>
                    + Add Title
                </button>
            )}
        </div>
    )
}
