import { useState } from "react"
import TtrpgMember, { TtrpgMemberItem } from "../../types/ttrpg/TtrpgMember"
import TtrpgPartyResources from "../../types/ttrpg/TtrpgPartyResources"
import { primaryButtonSmallStyle } from "../../pages/ttrpg/campaign_detail_styles"
import { themeStyles } from "../../configs/ttrpg_theme"

interface MemberInventoryProps {
    member: TtrpgMember
    membersHook: { updateMember: (id: string, member: Partial<TtrpgMember>) => Promise<void> }
    updateMembers: (updater: (members: TtrpgMember[]) => TtrpgMember[]) => void
    showUnassign?: boolean
    campaignId?: string
    partyResourcesHook?: {
        unassignItemFromMember: (
            campaignId: string, memberId: string,
            item: TtrpgMemberItem, updatedItems: TtrpgMemberItem[],
            currentUnassigned: TtrpgMemberItem[]
        ) => Promise<void>
    }
    partyResources?: TtrpgPartyResources
    updatePartyResources?: (updater: (pr: TtrpgPartyResources) => TtrpgPartyResources) => void
    adding?: boolean
    setAdding?: (v: boolean) => void
}

export default function MemberInventory({
    member, membersHook, updateMembers,
    showUnassign, campaignId, partyResourcesHook, partyResources, updatePartyResources,
    adding: externalAdding, setAdding: externalSetAdding
}: MemberInventoryProps) {

    const [internalAdding, setInternalAdding] = useState(false)
    const addingItem = externalAdding ?? internalAdding
    const setAddingItem = externalSetAdding ?? setInternalAdding

    const [newItemName, setNewItemName] = useState("")
    const [newItemQuantity, setNewItemQuantity] = useState("1")
    const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
    const [editingItemName, setEditingItemName] = useState("")
    const [editingItemQuantity, setEditingItemQuantity] = useState("1")

    function optimisticMemberItems(newItems: TtrpgMemberItem[]) {
        updateMembers(members => members.map(m => m.id === member.id ? { ...m, items: newItems } : m))
    }

    async function handleAddItem() {
        if (!newItemName.trim()) { alert("Item name is required"); return }
        const quantity = parseInt(newItemQuantity) || 1
        const newItem: TtrpgMemberItem = { name: newItemName.trim(), quantity }
        const updatedItems = [...member.items, newItem]
        const previousItems = member.items
        optimisticMemberItems(updatedItems)
        setNewItemName(""); setNewItemQuantity("1"); setAddingItem(false)
        try {
            await membersHook.updateMember(member.id, { campaign_id: member.campaign_id, name: member.name, items: updatedItems })
        } catch (error) {
            console.error("Error adding item:", error)
            alert("Error saving item — reverting"); optimisticMemberItems(previousItems)
        }
    }

    async function handleRemoveItem(itemIndex: number) {
        if (!confirm("Remove this item?")) return
        const updatedItems = member.items.filter((_, i) => i !== itemIndex)
        const previousItems = member.items
        optimisticMemberItems(updatedItems)
        setSelectedIdx(null)
        try {
            await membersHook.updateMember(member.id, { campaign_id: member.campaign_id, name: member.name, items: updatedItems })
        } catch (error) {
            console.error("Error removing item:", error)
            alert("Error removing item — reverting"); optimisticMemberItems(previousItems)
        }
    }

    async function handleUpdateItem(itemIndex: number) {
        if (!editingItemName.trim()) { alert("Item name is required"); return }
        const quantity = parseInt(editingItemQuantity) || 1
        const updatedItems = member.items.map((item, i) =>
            i === itemIndex ? { name: editingItemName.trim(), quantity } : item
        )
        const previousItems = member.items
        optimisticMemberItems(updatedItems)
        setSelectedIdx(null)
        try {
            await membersHook.updateMember(member.id, { campaign_id: member.campaign_id, name: member.name, items: updatedItems })
        } catch (error) {
            console.error("Error updating item:", error)
            alert("Error saving item — reverting"); optimisticMemberItems(previousItems)
        }
    }

    async function handleUnassign(itemIndex: number) {
        if (!showUnassign || !campaignId || !partyResourcesHook || !partyResources || !updatePartyResources) return
        const item = member.items[itemIndex]
        const updatedItems = member.items.filter((_, i) => i !== itemIndex)
        const prevItems = member.items
        const prevUnassigned = partyResources.unassigned_items

        optimisticMemberItems(updatedItems)
        setSelectedIdx(null)
        updatePartyResources(pr => {
            const existingIdx = pr.unassigned_items.findIndex(i => i.name === item.name)
            if (existingIdx >= 0) {
                return { ...pr, unassigned_items: pr.unassigned_items.map((i, idx) =>
                    idx === existingIdx ? { ...i, quantity: i.quantity + item.quantity } : i
                )}
            }
            return { ...pr, unassigned_items: [...pr.unassigned_items, item] }
        })

        try {
            await partyResourcesHook.unassignItemFromMember(
                campaignId, member.id, item, updatedItems, partyResources.unassigned_items
            )
        } catch {
            alert("Error unassigning item — reverting")
            optimisticMemberItems(prevItems)
            updatePartyResources(() => ({ ...partyResources, unassigned_items: prevUnassigned }))
        }
    }

    return (
        <div style={{ paddingLeft: "1rem" }}>
            {member.items.map((item, idx) => (
                <div key={idx} onClick={() => { setSelectedIdx(idx); setEditingItemName(item.name); setEditingItemQuantity(String(item.quantity)) }}
                    style={{ padding: "0.25rem 0", cursor: "pointer", color: "#336", textDecoration: "underline", textDecorationColor: "#ccc" }}>
                    {item.name} x{item.quantity}
                </div>
            ))}

            {selectedIdx !== null && member.items[selectedIdx] && (
                <div style={themeStyles.modalBackdrop}
                    onClick={() => setSelectedIdx(null)}>
                    <div className="ttrpg-modal-content" style={themeStyles.tinyModalContent}
                        onClick={e => e.stopPropagation()}>
                        <strong style={{ display: "block", marginBottom: "0.75rem" }}>Edit Item</strong>
                        <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.85rem" }}>Name</label>
                        <input type="text" value={editingItemName} onChange={e => setEditingItemName(e.target.value)}
                            style={{ width: "100%", padding: "0.4rem", boxSizing: "border-box", marginBottom: "0.5rem" }} />
                        <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.85rem" }}>Quantity</label>
                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "1rem" }}>
                            <button onClick={() => setEditingItemQuantity(String(Math.max(1, (parseInt(editingItemQuantity) || 0) - 1)))} style={{ width: "2rem", fontSize: "1rem" }}>{"\u2212"}</button>
                            <span style={{ minWidth: "2rem", textAlign: "center", fontWeight: "bold" }}>{editingItemQuantity}</span>
                            <button onClick={() => setEditingItemQuantity(String((parseInt(editingItemQuantity) || 0) + 1))} style={{ width: "2rem", fontSize: "1rem" }}>+</button>
                        </div>
                        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                            <button onClick={() => handleUpdateItem(selectedIdx)} style={primaryButtonSmallStyle}>Save</button>
                            {showUnassign && <button onClick={() => handleUnassign(selectedIdx)} style={{ fontSize: "0.8rem" }}>Unassign</button>}
                            <button onClick={() => handleRemoveItem(selectedIdx)} style={{ fontSize: "0.8rem", color: "#c0392b" }}>Remove</button>
                            <button onClick={() => setSelectedIdx(null)} style={{ fontSize: "0.8rem" }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {addingItem && (
                <div style={themeStyles.modalBackdrop}
                    onClick={() => { setAddingItem(false); setNewItemName(""); setNewItemQuantity("1") }}>
                    <div className="ttrpg-modal-content" style={themeStyles.tinyModalContent}
                        onClick={e => e.stopPropagation()}>
                        <strong style={{ display: "block", marginBottom: "0.75rem" }}>Add Item</strong>
                        <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.85rem" }}>Name</label>
                        <input type="text" value={newItemName} onChange={e => setNewItemName(e.target.value)}
                            placeholder="Item name"
                            style={{ width: "100%", padding: "0.4rem", boxSizing: "border-box", marginBottom: "0.5rem" }} autoFocus />
                        <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.85rem" }}>Quantity</label>
                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "1rem" }}>
                            <button onClick={() => setNewItemQuantity(String(Math.max(1, (parseInt(newItemQuantity) || 0) - 1)))} style={{ width: "2rem", fontSize: "1rem" }}>{"\u2212"}</button>
                            <span style={{ minWidth: "2rem", textAlign: "center", fontWeight: "bold" }}>{newItemQuantity}</span>
                            <button onClick={() => setNewItemQuantity(String((parseInt(newItemQuantity) || 0) + 1))} style={{ width: "2rem", fontSize: "1rem" }}>+</button>
                        </div>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button onClick={handleAddItem} style={primaryButtonSmallStyle}>Add</button>
                            <button onClick={() => { setAddingItem(false); setNewItemName(""); setNewItemQuantity("1") }} style={{ fontSize: "0.8rem" }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
