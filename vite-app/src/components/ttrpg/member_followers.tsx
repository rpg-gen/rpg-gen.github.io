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
    const [editIdx, setEditIdx] = useState<number | null>(null)
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
        setEditIdx(null)
        try { await membersHook.updateMember(member.id, { campaign_id: campaignId, followers: updated }) }
        catch { alert("Error saving follower — reverting"); optimistic(prev) }
    }

    async function handleRemove(idx: number) {
        if (!confirm("Remove this follower?")) return
        const updated = member.followers.filter((_, i) => i !== idx)
        const prev = member.followers
        optimistic(updated)
        try { await membersHook.updateMember(member.id, { campaign_id: campaignId, followers: updated }) }
        catch { alert("Error removing follower — reverting"); optimistic(prev) }
    }

    async function handleUnassign(idx: number) {
        const follower = member.followers[idx]
        const updatedFollowers = member.followers.filter((_, i) => i !== idx)
        const prevFollowers = member.followers
        const prevUnassigned = partyResources.unassigned_followers

        optimistic(updatedFollowers)
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
                editIdx === idx ? (
                    <div key={idx} style={{ marginBottom: "0.5rem" }}>
                        <input type="text" value={editName} onChange={e => setEditName(e.target.value)}
                            style={{ width: "100%", padding: "0.25rem", boxSizing: "border-box", marginBottom: "0.25rem" }} />
                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                            <select value={editType} onChange={e => setEditType(e.target.value as "sage" | "crafter")}>
                                {FOLLOWER_TYPES.map(t => <option key={t} value={t}>{FOLLOWER_LABELS[t]}</option>)}
                            </select>
                            <span>+</span>
                            <input type="number" value={editBonus} onChange={e => setEditBonus(e.target.value)}
                                style={{ width: "3rem", padding: "0.25rem" }} />
                            <button onClick={() => handleUpdate(idx)} style={primaryButtonSmallStyle}>Save</button>
                            <button onClick={() => setEditIdx(null)} style={{ fontSize: "0.8rem" }}>Cancel</button>
                        </div>
                    </div>
                ) : (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                        <span>{f.name} ({FOLLOWER_LABELS[f.type]}, +{f.roll_bonus})</span>
                        <button onClick={() => { setEditIdx(idx); setEditName(f.name); setEditType(f.type); setEditBonus(String(f.roll_bonus)) }} style={{ fontSize: "0.8rem" }}>Edit</button>
                        <button onClick={() => handleUnassign(idx)} style={{ fontSize: "0.8rem" }}>Unassign</button>
                        <button onClick={() => handleRemove(idx)} style={{ fontSize: "0.8rem" }}>x</button>
                    </div>
                )
            ))}

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
