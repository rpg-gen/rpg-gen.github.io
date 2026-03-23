import { useState } from "react"
import TtrpgMember, { TtrpgMemberStatus } from "../../types/ttrpg/TtrpgMember"
import { ttrpg, themeStyles } from "../../configs/ttrpg_theme"
import { primaryButtonSmallStyle } from "../../pages/ttrpg/campaign_detail_styles"

const STATUS_COLORS = [
    "#4a9e8e", "#c9a84c", "#a63d2f", "#5b7fb5", "#8b6bae",
    "#d48c4e", "#3a8a5c", "#7a6b5d", "#c05882", "#4a7a8a",
]

interface MemberStatusesProps {
    member: TtrpgMember
    membersHook: { updateMember: (id: string, member: Partial<TtrpgMember>) => Promise<void> }
    updateMembers: (updater: (members: TtrpgMember[]) => TtrpgMember[]) => void
    adding?: boolean
    setAdding?: (v: boolean) => void
}

export default function MemberStatuses({ member, membersHook, updateMembers, adding: externalAdding, setAdding: externalSetAdding }: MemberStatusesProps) {

    const [internalAdding, setInternalAdding] = useState(false)
    const adding = externalAdding ?? internalAdding
    const setAdding = externalSetAdding ?? setInternalAdding
    const [newStatus, setNewStatus] = useState("")
    const [newColor, setNewColor] = useState(STATUS_COLORS[0])
    const [editIdx, setEditIdx] = useState<number | null>(null)
    const [editValue, setEditValue] = useState("")
    const [editColor, setEditColor] = useState(STATUS_COLORS[0])

    function optimistic(newStatuses: TtrpgMemberStatus[]) {
        updateMembers(ms => ms.map(m => m.id === member.id ? { ...m, statuses: newStatuses } : m))
    }

    async function handleAdd() {
        const trimmed = newStatus.trim()
        if (!trimmed) return
        if (member.statuses.some(s => s.name === trimmed)) { alert("Status already exists"); return }
        const updated = [...member.statuses, { name: trimmed, color: newColor }]
        const prev = member.statuses
        optimistic(updated)
        setAdding(false); setNewStatus(""); setNewColor(STATUS_COLORS[0])
        try { await membersHook.updateMember(member.id, { campaign_id: member.campaign_id, statuses: updated }) }
        catch { alert("Error saving status — reverting"); optimistic(prev) }
    }

    async function handleUpdate(idx: number) {
        const trimmed = editValue.trim()
        if (!trimmed) { alert("Status name is required"); return }
        const current = member.statuses[idx]
        if (trimmed === current.name && editColor === current.color) { setEditIdx(null); return }
        if (trimmed !== current.name && member.statuses.some(s => s.name === trimmed)) { alert("Status already exists"); return }
        const updated = member.statuses.map((s, i) => i === idx ? { name: trimmed, color: editColor } : s)
        const prev = member.statuses
        optimistic(updated)
        setEditIdx(null)
        try { await membersHook.updateMember(member.id, { campaign_id: member.campaign_id, statuses: updated }) }
        catch { alert("Error saving status — reverting"); optimistic(prev) }
    }

    async function handleRemove(idx: number) {
        const updated = member.statuses.filter((_, i) => i !== idx)
        const prev = member.statuses
        optimistic(updated)
        setEditIdx(null)
        try { await membersHook.updateMember(member.id, { campaign_id: member.campaign_id, statuses: updated }) }
        catch { alert("Error removing status — reverting"); optimistic(prev) }
    }

    return (
        <div style={{ paddingLeft: "1rem" }}>
            {member.statuses.map((status, idx) => (
                <div key={idx} style={{ display: "inline-flex", alignItems: "center", marginRight: "0.35rem", marginBottom: "0.35rem" }}>
                    <span onClick={() => { setEditIdx(idx); setEditValue(status.name); setEditColor(status.color) }} style={{
                        display: "inline-block",
                        fontSize: "0.8rem", fontWeight: 600,
                        padding: "0.2rem 0.5rem", borderRadius: ttrpg.radius.sm,
                        backgroundColor: status.color, color: "#fff",
                        cursor: "pointer",
                    }}>
                        {status.name}
                    </span>
                </div>
            ))}

            {member.statuses.length === 0 && !adding && (
                <div style={{ color: ttrpg.colors.textMuted, fontSize: "0.9rem" }}>No statuses.</div>
            )}

            {adding && (
                <div style={themeStyles.modalBackdrop} onClick={() => { setAdding(false); setNewStatus(""); setNewColor(STATUS_COLORS[0]) }}>
                    <div className="ttrpg-modal-content" style={themeStyles.tinyModalContent} onClick={e => e.stopPropagation()}>
                        <strong style={{ display: "block", marginBottom: "0.75rem" }}>Add Status</strong>
                        <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.85rem" }}>Name</label>
                        <input type="text" value={newStatus} onChange={e => setNewStatus(e.target.value)} placeholder="Status name"
                            style={{ width: "100%", padding: "0.4rem", boxSizing: "border-box", marginBottom: "0.5rem" }} autoFocus
                            onKeyDown={e => { if (e.key === "Enter") handleAdd() }} />
                        <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.85rem" }}>Color</label>
                        <ColorPalette selected={newColor} onSelect={setNewColor} />
                        <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                            <button onClick={handleAdd} style={primaryButtonSmallStyle}>Add</button>
                            <button onClick={() => { setAdding(false); setNewStatus(""); setNewColor(STATUS_COLORS[0]) }} style={{ fontSize: "0.8rem" }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {editIdx !== null && member.statuses[editIdx] !== undefined && (
                <div style={themeStyles.modalBackdrop} onClick={() => setEditIdx(null)}>
                    <div className="ttrpg-modal-content" style={themeStyles.tinyModalContent} onClick={e => e.stopPropagation()}>
                        <strong style={{ display: "block", marginBottom: "0.75rem" }}>Edit Status</strong>
                        <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.85rem" }}>Name</label>
                        <input type="text" value={editValue} onChange={e => setEditValue(e.target.value)} placeholder="Status name"
                            style={{ width: "100%", padding: "0.4rem", boxSizing: "border-box", marginBottom: "0.5rem" }} autoFocus
                            onKeyDown={e => { if (e.key === "Enter") handleUpdate(editIdx) }} />
                        <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.85rem" }}>Color</label>
                        <ColorPalette selected={editColor} onSelect={setEditColor} />
                        <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                            <button onClick={() => handleUpdate(editIdx)} style={primaryButtonSmallStyle}>Save</button>
                            <button onClick={() => setEditIdx(null)} style={{ fontSize: "0.8rem" }}>Cancel</button>
                            <button onClick={() => handleRemove(editIdx)} style={{ fontSize: "0.8rem", color: ttrpg.colors.danger }}>Remove</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function ColorPalette({ selected, onSelect }: { selected: string, onSelect: (c: string) => void }) {
    return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
            {STATUS_COLORS.map(color => (
                <div key={color} onClick={() => onSelect(color)} style={{
                    width: "28px", height: "28px", borderRadius: ttrpg.radius.sm,
                    backgroundColor: color, cursor: "pointer",
                    border: selected === color ? "2px solid #fff" : "2px solid transparent",
                    boxShadow: selected === color ? `0 0 0 2px ${color}` : "none",
                }} />
            ))}
        </div>
    )
}
