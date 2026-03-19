import { useState } from "react"
import TtrpgMember, { TtrpgMemberItem } from "../../types/ttrpg/TtrpgMember"
import { primaryButtonSmallStyle } from "../../pages/ttrpg/campaign_detail_styles"

interface MemberInventoryProps {
    member: TtrpgMember
    membersHook: {
        updateMember: (id: string, member: Partial<TtrpgMember>) => Promise<void>
    }
    updateMembers: (updater: (members: TtrpgMember[]) => TtrpgMember[]) => void
}

export default function MemberInventory({ member, membersHook, updateMembers }: MemberInventoryProps) {

    const [newItemName, setNewItemName] = useState("")
    const [newItemQuantity, setNewItemQuantity] = useState("1")
    const [addingItem, setAddingItem] = useState(false)
    const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null)
    const [editingItemName, setEditingItemName] = useState("")
    const [editingItemQuantity, setEditingItemQuantity] = useState("1")

    function optimisticMemberItems(newItems: TtrpgMemberItem[]) {
        updateMembers(members => members.map(m =>
            m.id === member.id ? { ...m, items: newItems } : m
        ))
    }

    async function handleAddItem() {
        if (!newItemName.trim()) {
            alert("Item name is required")
            return
        }
        const quantity = parseInt(newItemQuantity) || 1
        const newItem: TtrpgMemberItem = { name: newItemName.trim(), quantity }
        const updatedItems = [...member.items, newItem]
        const previousItems = member.items

        optimisticMemberItems(updatedItems)
        setNewItemName("")
        setNewItemQuantity("1")
        setAddingItem(false)

        try {
            await membersHook.updateMember(member.id, {
                campaign_id: member.campaign_id,
                name: member.name,
                items: updatedItems
            })
        } catch (error) {
            console.error("Error adding item:", error)
            alert("Error saving item — reverting")
            optimisticMemberItems(previousItems)
        }
    }

    async function handleRemoveItem(itemIndex: number) {
        if (!confirm("Remove this item?")) return
        const updatedItems = member.items.filter((_, i) => i !== itemIndex)
        const previousItems = member.items

        optimisticMemberItems(updatedItems)

        try {
            await membersHook.updateMember(member.id, {
                campaign_id: member.campaign_id,
                name: member.name,
                items: updatedItems
            })
        } catch (error) {
            console.error("Error removing item:", error)
            alert("Error removing item — reverting")
            optimisticMemberItems(previousItems)
        }
    }

    async function handleUpdateItem(itemIndex: number) {
        if (!editingItemName.trim()) {
            alert("Item name is required")
            return
        }
        const quantity = parseInt(editingItemQuantity) || 1
        const updatedItems = member.items.map((item, i) =>
            i === itemIndex ? { name: editingItemName.trim(), quantity } : item
        )
        const previousItems = member.items

        optimisticMemberItems(updatedItems)
        setEditingItemIndex(null)
        setEditingItemName("")
        setEditingItemQuantity("1")

        try {
            await membersHook.updateMember(member.id, {
                campaign_id: member.campaign_id,
                name: member.name,
                items: updatedItems
            })
        } catch (error) {
            console.error("Error updating item:", error)
            alert("Error saving item — reverting")
            optimisticMemberItems(previousItems)
        }
    }

    return (
        <div style={{ paddingLeft: "1rem" }}>
            {member.items.map((item, idx) => (
                editingItemIndex === idx ? (
                    <div key={idx} style={{ marginBottom: "0.5rem" }}>
                        <input
                            type="text"
                            value={editingItemName}
                            onChange={(e) => setEditingItemName(e.target.value)}
                            style={{ width: "100%", padding: "0.25rem", boxSizing: "border-box", marginBottom: "0.25rem" }}
                        />
                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                            <span style={{ minWidth: "1.5rem", textAlign: "center", fontWeight: "bold" }}>{editingItemQuantity}</span>
                            <button onClick={() => setEditingItemQuantity(String((parseInt(editingItemQuantity) || 0) + 1))} style={{ fontSize: "0.8rem" }}>{"\u25B2"}</button>
                            <button onClick={() => setEditingItemQuantity(String(Math.max(1, (parseInt(editingItemQuantity) || 0) - 1)))} style={{ fontSize: "0.8rem" }}>{"\u25BC"}</button>
                            <button onClick={() => handleUpdateItem(idx)} style={primaryButtonSmallStyle}>Save</button>
                            <button onClick={() => { setEditingItemIndex(null); setEditingItemName(""); setEditingItemQuantity("1") }} style={{ fontSize: "0.8rem" }}>Cancel</button>
                        </div>
                    </div>
                ) : (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                        <span>{item.name} x{item.quantity}</span>
                        <button onClick={() => { setEditingItemIndex(idx); setEditingItemName(item.name); setEditingItemQuantity(String(item.quantity)) }} style={{ fontSize: "0.8rem" }}>Edit</button>
                        <button onClick={() => handleRemoveItem(idx)} style={{ fontSize: "0.8rem" }}>x</button>
                    </div>
                )
            ))}

            {addingItem ? (
                <div style={{ marginTop: "0.25rem", marginBottom: "0.5rem" }}>
                    <input
                        type="text"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        placeholder="Item name"
                        style={{ width: "100%", padding: "0.25rem", boxSizing: "border-box", marginBottom: "0.25rem" }}
                        autoFocus
                    />
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <span style={{ minWidth: "1.5rem", textAlign: "center", fontWeight: "bold" }}>{newItemQuantity}</span>
                        <button onClick={() => setNewItemQuantity(String((parseInt(newItemQuantity) || 0) + 1))} style={{ fontSize: "0.8rem" }}>{"\u25B2"}</button>
                        <button onClick={() => setNewItemQuantity(String(Math.max(1, (parseInt(newItemQuantity) || 0) - 1)))} style={{ fontSize: "0.8rem" }}>{"\u25BC"}</button>
                        <button onClick={handleAddItem} style={primaryButtonSmallStyle}>Add</button>
                        <button onClick={() => { setAddingItem(false); setNewItemName(""); setNewItemQuantity("1") }} style={{ fontSize: "0.8rem" }}>Cancel</button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => { setAddingItem(true); setNewItemName(""); setNewItemQuantity("1") }}
                    style={{ marginTop: "0.25rem", fontSize: "0.8rem" }}
                >
                    + Add Item
                </button>
            )}
        </div>
    )
}
