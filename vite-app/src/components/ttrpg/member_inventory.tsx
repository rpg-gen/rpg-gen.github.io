import { useState } from "react"
import TtrpgMember, { TtrpgMemberItem } from "../../types/ttrpg/TtrpgMember"
import TtrpgLoreEntry from "../../types/ttrpg/TtrpgLoreEntry"
import TtrpgPartyResources from "../../types/ttrpg/TtrpgPartyResources"
import { getUnassignedLoreItems } from "../../utility/lore_item_helpers"
import { primaryButtonSmallStyle } from "../../pages/ttrpg/campaign_detail_styles"
import { themeStyles } from "../../configs/ttrpg_theme"

interface MemberInventoryProps {
    member: TtrpgMember
    membersHook: { updateMember: (id: string, member: Partial<TtrpgMember>) => Promise<void> }
    updateMembers: (updater: (members: TtrpgMember[]) => TtrpgMember[]) => void
    lore?: TtrpgLoreEntry[]
    allMembers?: TtrpgMember[]
    openLoreDetail?: (id: string) => void
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
    lore, allMembers, openLoreDetail,
    showUnassign, campaignId, partyResourcesHook, partyResources, updatePartyResources,
    adding: externalAdding, setAdding: externalSetAdding
}: MemberInventoryProps) {

    const [internalAdding, setInternalAdding] = useState(false)
    const addingItem = externalAdding ?? internalAdding
    const setAddingItem = externalSetAdding ?? setInternalAdding

    const [addMode, setAddMode] = useState<"regular" | "lore">("regular")
    const [newItemName, setNewItemName] = useState("")
    const [newItemQuantity, setNewItemQuantity] = useState("1")
    const [selectedLoreId, setSelectedLoreId] = useState("")
    const [loreSearch, setLoreSearch] = useState("")
    const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
    const [editingItemName, setEditingItemName] = useState("")
    const [editingItemQuantity, setEditingItemQuantity] = useState("1")

    const unassignedLoreItems = (lore && allMembers) ? getUnassignedLoreItems(lore, allMembers) : []

    function optimisticMemberItems(newItems: TtrpgMemberItem[]) {
        updateMembers(members => members.map(m => m.id === member.id ? { ...m, items: newItems } : m))
    }

    function resetAddForm() {
        setNewItemName(""); setNewItemQuantity("1"); setSelectedLoreId(""); setLoreSearch(""); setAddMode("regular"); setAddingItem(false)
    }

    async function handleAddItem() {
        if (addMode === "lore") {
            if (!selectedLoreId) { alert("Select a lore item"); return }
            const loreEntry = lore?.find(l => l.id === selectedLoreId)
            if (!loreEntry) return
            const newItem: TtrpgMemberItem = { name: loreEntry.name, quantity: 1, lore_id: loreEntry.id }
            const updatedItems = [...member.items, newItem]
            const previousItems = member.items
            optimisticMemberItems(updatedItems)
            resetAddForm()
            try {
                await membersHook.updateMember(member.id, { campaign_id: member.campaign_id, name: member.name, items: updatedItems })
            } catch (error) {
                console.error("Error adding lore item:", error)
                alert("Error saving item — reverting"); optimisticMemberItems(previousItems)
            }
        } else {
            if (!newItemName.trim()) { alert("Item name is required"); return }
            const quantity = parseInt(newItemQuantity) || 1
            const newItem: TtrpgMemberItem = { name: newItemName.trim(), quantity }
            const updatedItems = [...member.items, newItem]
            const previousItems = member.items
            optimisticMemberItems(updatedItems)
            resetAddForm()
            try {
                await membersHook.updateMember(member.id, { campaign_id: member.campaign_id, name: member.name, items: updatedItems })
            } catch (error) {
                console.error("Error adding item:", error)
                alert("Error saving item — reverting"); optimisticMemberItems(previousItems)
            }
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
        const currentItem = member.items[itemIndex]
        if (!currentItem.lore_id && !editingItemName.trim()) { alert("Item name is required"); return }
        const quantity = currentItem.lore_id ? currentItem.quantity : (parseInt(editingItemQuantity) || 1)
        const updatedItems = member.items.map((item, i) =>
            i === itemIndex
                ? { ...item, name: item.lore_id ? item.name : editingItemName.trim(), quantity }
                : item
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
            const existingIdx = pr.unassigned_items.findIndex(i =>
                i.name === item.name && i.lore_id === item.lore_id
            )
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

    const selectedItem = selectedIdx !== null ? member.items[selectedIdx] : null
    const isLoreLinked = selectedItem?.lore_id != null

    return (
        <div style={{ paddingLeft: "1rem" }}>
            {member.items.map((item, idx) => (
                <div key={idx} onClick={() => { setSelectedIdx(idx); setEditingItemName(item.name); setEditingItemQuantity(String(item.quantity)) }}
                    style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        padding: "0.35rem 0.5rem", cursor: "pointer",
                        backgroundColor: idx % 2 === 0 ? "rgba(0,0,0,0.08)" : "rgba(0,0,0,0.03)",
                    }}>
                    <span>
                        {item.lore_id && <span title="Lore-linked item" style={{ color: "#b8860b", marginRight: "0.25rem" }}>{"\u2605"}</span>}
                        {item.name}
                    </span>
                    <span style={{ fontVariantNumeric: "tabular-nums", color: "#888" }}>{item.quantity}</span>
                </div>
            ))}

            {selectedIdx !== null && selectedItem && (
                <div style={themeStyles.modalBackdrop}
                    onClick={() => setSelectedIdx(null)}>
                    <div className="ttrpg-modal-content" style={themeStyles.tinyModalContent}
                        onClick={e => e.stopPropagation()}>
                        <strong style={{ display: "block", marginBottom: "0.75rem" }}>Edit Item</strong>
                        <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.85rem" }}>Name</label>
                        {isLoreLinked ? (
                            <>
                                <div style={{ padding: "0.4rem", marginBottom: "0.5rem", backgroundColor: "#f0f0f0", borderRadius: "4px", color: "#555" }}>
                                    {"\u2605"} {selectedItem.name} <span style={{ fontSize: "0.75rem", color: "#999" }}>(lore-linked)</span>
                                </div>
                                {openLoreDetail && (
                                    <div
                                        onClick={() => { setSelectedIdx(null); openLoreDetail(selectedItem.lore_id!) }}
                                        style={{
                                            display: "flex", justifyContent: "space-between", alignItems: "center",
                                            padding: "0.5rem 0.6rem", marginBottom: "0.75rem",
                                            backgroundColor: "#e8f0fe", borderRadius: "4px",
                                            cursor: "pointer", color: "#1a56db", fontWeight: "bold", fontSize: "0.9rem"
                                        }}
                                    >
                                        <span>View in Lore</span>
                                        <span>{"\u2192"}</span>
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                <input type="text" value={editingItemName} onChange={e => setEditingItemName(e.target.value)}
                                    style={{ width: "100%", padding: "0.4rem", boxSizing: "border-box", marginBottom: "0.5rem" }} />
                                <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.85rem" }}>Quantity</label>
                                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "1rem" }}>
                                    <button onClick={() => setEditingItemQuantity(String(Math.max(1, (parseInt(editingItemQuantity) || 0) - 1)))} style={{ width: "2rem", fontSize: "1rem" }}>{"\u2212"}</button>
                                    <span style={{ minWidth: "2rem", textAlign: "center", fontWeight: "bold" }}>{editingItemQuantity}</span>
                                    <button onClick={() => setEditingItemQuantity(String((parseInt(editingItemQuantity) || 0) + 1))} style={{ width: "2rem", fontSize: "1rem" }}>+</button>
                                </div>
                            </>
                        )}
                        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                            {!isLoreLinked && <button onClick={() => handleUpdateItem(selectedIdx)} style={primaryButtonSmallStyle}>Save</button>}
                            {showUnassign && <button onClick={() => handleUnassign(selectedIdx)} style={{ fontSize: "0.8rem" }}>Unassign</button>}
                            <button onClick={() => handleRemoveItem(selectedIdx)} style={{ fontSize: "0.8rem", color: "#c0392b" }}>Remove</button>
                            <button onClick={() => setSelectedIdx(null)} style={{ fontSize: "0.8rem" }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {addingItem && (
                <div style={themeStyles.modalBackdrop}
                    onClick={resetAddForm}>
                    <div className="ttrpg-modal-content" style={themeStyles.tinyModalContent}
                        onClick={e => e.stopPropagation()}>
                        <strong style={{ display: "block", marginBottom: "0.75rem" }}>Add Item</strong>

                        {lore && unassignedLoreItems.length > 0 && (
                            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
                                <button
                                    onClick={() => { setAddMode("regular"); setSelectedLoreId("") }}
                                    style={{ ...primaryButtonSmallStyle, opacity: addMode === "regular" ? 1 : 0.5 }}
                                >Regular Item</button>
                                <button
                                    onClick={() => { setAddMode("lore"); setNewItemName("") }}
                                    style={{ ...primaryButtonSmallStyle, opacity: addMode === "lore" ? 1 : 0.5 }}
                                >Link Lore Item</button>
                            </div>
                        )}

                        {addMode === "lore" ? (
                            <>
                                <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.85rem" }}>Lore Item</label>
                                {selectedLoreId ? (
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.4rem", marginBottom: "0.5rem", backgroundColor: "#f0f0f0", borderRadius: "4px" }}>
                                        <span>{"\u2605"} {unassignedLoreItems.find(l => l.id === selectedLoreId)?.name}</span>
                                        <button onClick={() => { setSelectedLoreId(""); setLoreSearch("") }} style={{ fontSize: "0.75rem", marginLeft: "auto" }}>{"\u2715"}</button>
                                    </div>
                                ) : (
                                    <>
                                        <input
                                            type="text"
                                            value={loreSearch}
                                            onChange={e => setLoreSearch(e.target.value)}
                                            placeholder="Search lore items..."
                                            style={{ width: "100%", padding: "0.4rem", boxSizing: "border-box", marginBottom: "0.25rem" }}
                                            autoFocus
                                        />
                                        <div style={{ maxHeight: "8rem", overflowY: "auto", marginBottom: "0.5rem" }}>
                                            {unassignedLoreItems
                                                .filter(l => l.name.toLowerCase().includes(loreSearch.toLowerCase()))
                                                .map(l => (
                                                    <div
                                                        key={l.id}
                                                        onClick={() => { setSelectedLoreId(l.id); setLoreSearch("") }}
                                                        style={{ padding: "0.3rem 0.4rem", cursor: "pointer", borderBottom: "1px solid #eee", fontSize: "0.9rem" }}
                                                    >
                                                        {l.name}{l.subtitle ? <span style={{ color: "#999", marginLeft: "0.5rem", fontSize: "0.8rem" }}>{l.subtitle}</span> : null}
                                                    </div>
                                                ))}
                                        </div>
                                    </>
                                )}
                            </>
                        ) : (
                            <>
                                <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.85rem" }}>Name</label>
                                <input type="text" value={newItemName} onChange={e => setNewItemName(e.target.value)}
                                    placeholder="Item name"
                                    style={{ width: "100%", padding: "0.4rem", boxSizing: "border-box", marginBottom: "0.5rem" }} autoFocus />
                            </>
                        )}

                        {addMode !== "lore" && (
                            <>
                                <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.85rem" }}>Quantity</label>
                                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "1rem" }}>
                                    <button onClick={() => setNewItemQuantity(String(Math.max(1, (parseInt(newItemQuantity) || 0) - 1)))} style={{ width: "2rem", fontSize: "1rem" }}>{"\u2212"}</button>
                                    <span style={{ minWidth: "2rem", textAlign: "center", fontWeight: "bold" }}>{newItemQuantity}</span>
                                    <button onClick={() => setNewItemQuantity(String((parseInt(newItemQuantity) || 0) + 1))} style={{ width: "2rem", fontSize: "1rem" }}>+</button>
                                </div>
                            </>
                        )}
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button onClick={handleAddItem} style={primaryButtonSmallStyle}>Add</button>
                            <button onClick={resetAddForm} style={{ fontSize: "0.8rem" }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
