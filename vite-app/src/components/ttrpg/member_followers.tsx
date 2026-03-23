import { useState } from "react"
import TtrpgMember, { TtrpgMemberFollower } from "../../types/ttrpg/TtrpgMember"
import TtrpgPartyResources from "../../types/ttrpg/TtrpgPartyResources"
import { primaryButtonSmallStyle } from "../../pages/ttrpg/campaign_detail_styles"
import { FOLLOWER_TYPES, FOLLOWER_LABELS } from "../../configs/ttrpg_constants"

interface MemberFollowersProps {
    member: TtrpgMember
    membersHook: { updateMember: (id: string, member: Partial<TtrpgMember>) => Promise<void> }
    updateMembers: (updater: (members: TtrpgMember[]) => TtrpgMember[]) => void
    campaignId: string
    partyResourcesHook: {
        unassignFollowerFromMember: (
            campaignId: string, memberId: string,
            follower: TtrpgMemberFollower,
            updatedFollowers: TtrpgMemberFollower[],
            currentUnassigned: TtrpgMemberFollower[]
        ) => Promise<void>
    }
    partyResources: TtrpgPartyResources
    updatePartyResources: (updater: (pr: TtrpgPartyResources) => TtrpgPartyResources) => void
}

export default function MemberFollowers({
    member, membersHook, updateMembers, campaignId,
    partyResourcesHook, partyResources, updatePartyResources
}: MemberFollowersProps) {

    const [adding, setAdding] = useState(false)
    const [newName, setNewName] = useState("")
    const [newType, setNewType] = useState<"sage" | "crafter">("sage")
    const [newBonus, setNewBonus] = useState("0")
    const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
    const [editName, setEditName] = useState("")
    const [editType, setEditType] = useState<"sage" | "crafter">("sage")
    const [editBonus, setEditBonus] = useState("0")

    function optimistic(newFollowers: TtrpgMemberFollower[]) {
        updateMembers(ms => ms.map(m => m.id === member.id ? { ...m, followers: newFollowers } : m))
    }

    async function handleAdd() {
        if (!newName.trim()) { alert("Follower name is required"); return }
        const follower: TtrpgMemberFollower = { name: newName.trim(), type: newType, roll_bonus: parseInt(newBonus) || 0 }
        const updated = [...member.followers, follower]
        const prev = member.followers
        optimistic(updated)
        setAdding(false); setNewName(""); setNewBonus("0")
        try { await membersHook.updateMember(member.id, { campaign_id: campaignId, followers: updated }) }
        catch { alert("Error saving follower — reverting"); optimistic(prev) }
    }

    async function handleUpdate(idx: number) {
        if (!editName.trim()) { alert("Follower name is required"); return }
        const updated = member.followers.map((f, i) =>
            i === idx ? { name: editName.trim(), type: editType, roll_bonus: parseInt(editBonus) || 0 } : f
        )
        const prev = member.followers
        optimistic(updated)
        setSelectedIdx(null)
        try { await membersHook.updateMember(member.id, { campaign_id: campaignId, followers: updated }) }
        catch { alert("Error saving follower — reverting"); optimistic(prev) }
    }

    async function handleRemove(idx: number) {
        if (!confirm("Remove this follower?")) return
        const updated = member.followers.filter((_, i) => i !== idx)
        const prev = member.followers
        optimistic(updated)
        setSelectedIdx(null)
        try { await membersHook.updateMember(member.id, { campaign_id: campaignId, followers: updated }) }
        catch { alert("Error removing follower — reverting"); optimistic(prev) }
    }

    async function handleUnassign(idx: number) {
        const follower = member.followers[idx]
        const updatedFollowers = member.followers.filter((_, i) => i !== idx)
        const prevFollowers = member.followers
        const prevUnassigned = partyResources.unassigned_followers

        optimistic(updatedFollowers)
        setSelectedIdx(null)
        updatePartyResources(pr => ({ ...pr, unassigned_followers: [...pr.unassigned_followers, follower] }))

        try {
            await partyResourcesHook.unassignFollowerFromMember(
                campaignId, member.id, follower, updatedFollowers, partyResources.unassigned_followers
            )
        } catch {
            alert("Error unassigning follower — reverting")
            optimistic(prevFollowers)
            updatePartyResources(pr => ({ ...pr, unassigned_followers: prevUnassigned }))
        }
    }

    return (
        <div style={{ paddingLeft: "1rem" }}>
            {member.followers.map((f, idx) => (
                <div key={idx}
                    onClick={() => { setSelectedIdx(idx); setEditName(f.name); setEditType(f.type); setEditBonus(String(f.roll_bonus)) }}
                    style={{ padding: "0.25rem 0", cursor: "pointer", color: "#336", textDecoration: "underline", textDecorationColor: "#ccc" }}
                >
                    {f.name} ({FOLLOWER_LABELS[f.type]}, +{f.roll_bonus})
                </div>
            ))}

            {selectedIdx !== null && member.followers[selectedIdx] && (
                <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
                    onClick={() => setSelectedIdx(null)}>
                    <div style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "1.25rem", width: "90%", maxWidth: "360px", color: "#222" }}
                        onClick={e => e.stopPropagation()}>
                        <strong style={{ display: "block", marginBottom: "0.75rem" }}>Edit Follower</strong>
                        <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.85rem" }}>Name</label>
                        <input type="text" value={editName} onChange={e => setEditName(e.target.value)}
                            style={{ width: "100%", padding: "0.4rem", boxSizing: "border-box", marginBottom: "0.5rem" }} />
                        <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.85rem" }}>Type</label>
                        <select value={editType} onChange={e => setEditType(e.target.value as "sage" | "crafter")}
                            style={{ width: "100%", padding: "0.4rem", boxSizing: "border-box", marginBottom: "0.5rem" }}>
                            {FOLLOWER_TYPES.map(t => <option key={t} value={t}>{FOLLOWER_LABELS[t]}</option>)}
                        </select>
                        <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.85rem" }}>Roll Bonus</label>
                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "1rem" }}>
                            <button onClick={() => setEditBonus(String(Math.max(0, (parseInt(editBonus) || 0) - 1)))} style={{ width: "2rem", fontSize: "1rem" }}>{"\u2212"}</button>
                            <span style={{ minWidth: "2rem", textAlign: "center", fontWeight: "bold" }}>+{editBonus}</span>
                            <button onClick={() => setEditBonus(String((parseInt(editBonus) || 0) + 1))} style={{ width: "2rem", fontSize: "1rem" }}>+</button>
                        </div>
                        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                            <button onClick={() => handleUpdate(selectedIdx)} style={primaryButtonSmallStyle}>Save</button>
                            <button onClick={() => handleUnassign(selectedIdx)} style={{ fontSize: "0.8rem" }}>Unassign</button>
                            <button onClick={() => handleRemove(selectedIdx)} style={{ fontSize: "0.8rem", color: "#c0392b" }}>Remove</button>
                            <button onClick={() => setSelectedIdx(null)} style={{ fontSize: "0.8rem" }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {adding ? (
                <div style={{ marginTop: "0.25rem", marginBottom: "0.5rem" }}>
                    <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Follower name"
                        style={{ width: "100%", padding: "0.25rem", boxSizing: "border-box", marginBottom: "0.25rem" }} autoFocus />
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <select value={newType} onChange={e => setNewType(e.target.value as "sage" | "crafter")}>
                            {FOLLOWER_TYPES.map(t => <option key={t} value={t}>{FOLLOWER_LABELS[t]}</option>)}
                        </select>
                        <span>+</span>
                        <input type="number" value={newBonus} onChange={e => setNewBonus(e.target.value)}
                            style={{ width: "3rem", padding: "0.25rem" }} />
                        <button onClick={handleAdd} style={primaryButtonSmallStyle}>Add</button>
                        <button onClick={() => { setAdding(false); setNewName(""); setNewBonus("0") }} style={{ fontSize: "0.8rem" }}>Cancel</button>
                    </div>
                </div>
            ) : (
                <button onClick={() => { setAdding(true); setNewName(""); setNewBonus("0") }} style={{ marginTop: "0.25rem", fontSize: "0.8rem" }}>
                    + Add Follower
                </button>
            )}
        </div>
    )
}
