import { useState } from "react"
import TtrpgMember from "../../types/ttrpg/TtrpgMember"
import { TtrpgMemberItem, TtrpgMemberFollower } from "../../types/ttrpg/TtrpgMember"
import TtrpgPartyResources from "../../types/ttrpg/TtrpgPartyResources"
import StatCounter from "./stat_counter"
import { cardStyle, primaryButtonSmallStyle } from "../../pages/ttrpg/campaign_detail_styles"
import { FOLLOWER_TYPES, FOLLOWER_LABELS } from "../../configs/ttrpg_constants"

interface PartyResourcesPanelProps {
    campaignId: string
    partyResources: TtrpgPartyResources
    members: TtrpgMember[]
    partyResourcesHook: {
        updatePartyResources: (updates: Partial<TtrpgPartyResources>) => Promise<void>
        assignItemToMember: (campaignId: string, memberId: string, item: TtrpgMemberItem, remaining: TtrpgMemberItem[], memberItems: TtrpgMemberItem[]) => Promise<void>
        assignFollowerToMember: (campaignId: string, memberId: string, follower: TtrpgMemberFollower, remaining: TtrpgMemberFollower[], memberFollowers: TtrpgMemberFollower[]) => Promise<void>
    }
    updatePartyResources: (updater: (pr: TtrpgPartyResources) => TtrpgPartyResources) => void
    updateMembers: (updater: (members: TtrpgMember[]) => TtrpgMember[]) => void
}

export default function PartyResourcesPanel({
    campaignId, partyResources, members, partyResourcesHook,
    updatePartyResources, updateMembers
}: PartyResourcesPanelProps) {

    const [addingItem, setAddingItem] = useState(false)
    const [newItemName, setNewItemName] = useState("")
    const [newItemQty, setNewItemQty] = useState("1")
    const [addingFollower, setAddingFollower] = useState(false)
    const [newFollowerName, setNewFollowerName] = useState("")
    const [newFollowerType, setNewFollowerType] = useState<"sage" | "crafter">("sage")
    const [newFollowerBonus, setNewFollowerBonus] = useState("0")
    const [assigningItemIdx, setAssigningItemIdx] = useState<number | null>(null)
    const [assigningFollowerIdx, setAssigningFollowerIdx] = useState<number | null>(null)

    function handleCounterChange(field: "hero_tokens" | "victories" | "exp", newVal: number) {
        const prev = partyResources[field]
        updatePartyResources(pr => ({ ...pr, [field]: newVal }))
        partyResourcesHook.updatePartyResources({ [field]: newVal })
            .catch(() => {
                alert(`Error saving ${field} — reverting`)
                updatePartyResources(pr => ({ ...pr, [field]: prev }))
            })
    }

    async function handleAddItem() {
        if (!newItemName.trim()) { alert("Item name is required"); return }
        const item: TtrpgMemberItem = { name: newItemName.trim(), quantity: parseInt(newItemQty) || 1 }
        const prev = partyResources.unassigned_items
        updatePartyResources(pr => ({ ...pr, unassigned_items: [...pr.unassigned_items, item] }))
        setAddingItem(false); setNewItemName(""); setNewItemQty("1")
        try { await partyResourcesHook.updatePartyResources({ unassigned_items: [...prev, item] }) }
        catch { alert("Error adding item — reverting"); updatePartyResources(pr => ({ ...pr, unassigned_items: prev })) }
    }

    async function handleAddFollower() {
        if (!newFollowerName.trim()) { alert("Follower name is required"); return }
        const follower: TtrpgMemberFollower = { name: newFollowerName.trim(), type: newFollowerType, roll_bonus: parseInt(newFollowerBonus) || 0 }
        const prev = partyResources.unassigned_followers
        updatePartyResources(pr => ({ ...pr, unassigned_followers: [...pr.unassigned_followers, follower] }))
        setAddingFollower(false); setNewFollowerName(""); setNewFollowerBonus("0")
        try { await partyResourcesHook.updatePartyResources({ unassigned_followers: [...prev, follower] }) }
        catch { alert("Error adding follower — reverting"); updatePartyResources(pr => ({ ...pr, unassigned_followers: prev })) }
    }

    async function handleRemoveItem(idx: number) {
        if (!confirm("Remove this item?")) return
        const prev = partyResources.unassigned_items
        const updated = prev.filter((_, i) => i !== idx)
        updatePartyResources(pr => ({ ...pr, unassigned_items: updated }))
        try { await partyResourcesHook.updatePartyResources({ unassigned_items: updated }) }
        catch { alert("Error removing item — reverting"); updatePartyResources(pr => ({ ...pr, unassigned_items: prev })) }
    }

    async function handleRemoveFollower(idx: number) {
        if (!confirm("Remove this follower?")) return
        const prev = partyResources.unassigned_followers
        const updated = prev.filter((_, i) => i !== idx)
        updatePartyResources(pr => ({ ...pr, unassigned_followers: updated }))
        try { await partyResourcesHook.updatePartyResources({ unassigned_followers: updated }) }
        catch { alert("Error removing follower — reverting"); updatePartyResources(pr => ({ ...pr, unassigned_followers: prev })) }
    }

    async function handleAssignItem(itemIdx: number, memberId: string) {
        const item = partyResources.unassigned_items[itemIdx]
        const remaining = partyResources.unassigned_items.filter((_, i) => i !== itemIdx)
        const member = members.find(m => m.id === memberId)
        if (!member) return
        const prevUnassigned = partyResources.unassigned_items
        const prevMemberItems = member.items

        updatePartyResources(pr => ({ ...pr, unassigned_items: remaining }))
        updateMembers(ms => ms.map(m => {
            if (m.id !== memberId) return m
            const existingIdx = m.items.findIndex(i => i.name === item.name)
            if (existingIdx >= 0) {
                return { ...m, items: m.items.map((i, idx) => idx === existingIdx ? { ...i, quantity: i.quantity + item.quantity } : i) }
            }
            return { ...m, items: [...m.items, item] }
        }))
        setAssigningItemIdx(null)

        try {
            await partyResourcesHook.assignItemToMember(campaignId, memberId, item, remaining, member.items)
        } catch {
            alert("Error assigning item — reverting")
            updatePartyResources(pr => ({ ...pr, unassigned_items: prevUnassigned }))
            updateMembers(ms => ms.map(m => m.id === memberId ? { ...m, items: prevMemberItems } : m))
        }
    }

    async function handleAssignFollower(followerIdx: number, memberId: string) {
        const follower = partyResources.unassigned_followers[followerIdx]
        const remaining = partyResources.unassigned_followers.filter((_, i) => i !== followerIdx)
        const member = members.find(m => m.id === memberId)
        if (!member) return
        const prevUnassigned = partyResources.unassigned_followers
        const prevMemberFollowers = member.followers

        updatePartyResources(pr => ({ ...pr, unassigned_followers: remaining }))
        updateMembers(ms => ms.map(m => m.id === memberId ? { ...m, followers: [...m.followers, follower] } : m))
        setAssigningFollowerIdx(null)

        try {
            await partyResourcesHook.assignFollowerToMember(campaignId, memberId, follower, remaining, member.followers)
        } catch {
            alert("Error assigning follower — reverting")
            updatePartyResources(pr => ({ ...pr, unassigned_followers: prevUnassigned }))
            updateMembers(ms => ms.map(m => m.id === memberId ? { ...m, followers: prevMemberFollowers } : m))
        }
    }

    return (
        <div style={{ ...cardStyle, backgroundColor: "#e8f4f8", marginBottom: "1rem" }}>
            <strong style={{ fontSize: "1rem", display: "block", marginBottom: "0.75rem" }}>Party Resources</strong>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" }}>
                <StatCounter label="Hero Tokens" value={partyResources.hero_tokens} min={0} onChange={(v) => handleCounterChange("hero_tokens", v)} />
                <StatCounter label="Victories" value={partyResources.victories} min={0} onChange={(v) => handleCounterChange("victories", v)} />
                <StatCounter label="EXP" value={partyResources.exp} min={0} onChange={(v) => handleCounterChange("exp", v)} />
            </div>

            <div style={{ borderTop: "1px solid #ccc", paddingTop: "0.5rem", marginBottom: "0.75rem" }}>
                <strong style={{ fontSize: "0.9rem" }}>Unassigned Items</strong>
                {partyResources.unassigned_items.map((item, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.25rem" }}>
                        <span style={{ flex: 1 }}>{item.name} x{item.quantity}</span>
                        {assigningItemIdx === idx ? (
                            <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap" }}>
                                {members.map(m => (
                                    <button key={m.id} onClick={() => handleAssignItem(idx, m.id)} style={{ fontSize: "0.75rem" }}>{m.name}</button>
                                ))}
                                <button onClick={() => setAssigningItemIdx(null)} style={{ fontSize: "0.75rem" }}>Cancel</button>
                            </div>
                        ) : (
                            <>
                                <button onClick={() => setAssigningItemIdx(idx)} style={{ fontSize: "0.8rem" }}>Assign</button>
                                <button onClick={() => handleRemoveItem(idx)} style={{ fontSize: "0.8rem" }}>x</button>
                            </>
                        )}
                    </div>
                ))}
                {addingItem ? (
                    <div style={{ marginTop: "0.5rem" }}>
                        <input type="text" value={newItemName} onChange={e => setNewItemName(e.target.value)} placeholder="Item name"
                            style={{ width: "100%", padding: "0.25rem", boxSizing: "border-box", marginBottom: "0.25rem" }} autoFocus />
                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                            <span style={{ minWidth: "1.5rem", textAlign: "center", fontWeight: "bold" }}>{newItemQty}</span>
                            <button onClick={() => setNewItemQty(String((parseInt(newItemQty) || 0) + 1))} style={{ fontSize: "0.8rem" }}>{"\u25B2"}</button>
                            <button onClick={() => setNewItemQty(String(Math.max(1, (parseInt(newItemQty) || 0) - 1)))} style={{ fontSize: "0.8rem" }}>{"\u25BC"}</button>
                            <button onClick={handleAddItem} style={primaryButtonSmallStyle}>Add</button>
                            <button onClick={() => { setAddingItem(false); setNewItemName(""); setNewItemQty("1") }} style={{ fontSize: "0.8rem" }}>Cancel</button>
                        </div>
                    </div>
                ) : (
                    <button onClick={() => setAddingItem(true)} style={{ marginTop: "0.25rem", fontSize: "0.8rem" }}>+ Add Item</button>
                )}
            </div>

            <div style={{ borderTop: "1px solid #ccc", paddingTop: "0.5rem" }}>
                <strong style={{ fontSize: "0.9rem" }}>Unassigned Followers</strong>
                {partyResources.unassigned_followers.map((f, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.25rem" }}>
                        <span style={{ flex: 1 }}>{f.name} ({FOLLOWER_LABELS[f.type]}, +{f.roll_bonus})</span>
                        {assigningFollowerIdx === idx ? (
                            <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap" }}>
                                {members.map(m => (
                                    <button key={m.id} onClick={() => handleAssignFollower(idx, m.id)} style={{ fontSize: "0.75rem" }}>{m.name}</button>
                                ))}
                                <button onClick={() => setAssigningFollowerIdx(null)} style={{ fontSize: "0.75rem" }}>Cancel</button>
                            </div>
                        ) : (
                            <>
                                <button onClick={() => setAssigningFollowerIdx(idx)} style={{ fontSize: "0.8rem" }}>Assign</button>
                                <button onClick={() => handleRemoveFollower(idx)} style={{ fontSize: "0.8rem" }}>x</button>
                            </>
                        )}
                    </div>
                ))}
                {addingFollower ? (
                    <div style={{ marginTop: "0.5rem" }}>
                        <input type="text" value={newFollowerName} onChange={e => setNewFollowerName(e.target.value)} placeholder="Follower name"
                            style={{ width: "100%", padding: "0.25rem", boxSizing: "border-box", marginBottom: "0.25rem" }} autoFocus />
                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                            <select value={newFollowerType} onChange={e => setNewFollowerType(e.target.value as "sage" | "crafter")}>
                                {FOLLOWER_TYPES.map(t => <option key={t} value={t}>{FOLLOWER_LABELS[t]}</option>)}
                            </select>
                            <span>+</span>
                            <input type="number" value={newFollowerBonus} onChange={e => setNewFollowerBonus(e.target.value)}
                                style={{ width: "3rem", padding: "0.25rem" }} />
                            <button onClick={handleAddFollower} style={primaryButtonSmallStyle}>Add</button>
                            <button onClick={() => { setAddingFollower(false); setNewFollowerName(""); setNewFollowerBonus("0") }} style={{ fontSize: "0.8rem" }}>Cancel</button>
                        </div>
                    </div>
                ) : (
                    <button onClick={() => setAddingFollower(true)} style={{ marginTop: "0.25rem", fontSize: "0.8rem" }}>+ Add Follower</button>
                )}
            </div>
        </div>
    )
}
