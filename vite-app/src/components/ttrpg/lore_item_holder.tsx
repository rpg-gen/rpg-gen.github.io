import { useState } from "react"
import TtrpgMember, { TtrpgMemberItem } from "../../types/ttrpg/TtrpgMember"
import { findLoreItemHolder } from "../../utility/lore_item_helpers"
import { themeStyles } from "../../configs/ttrpg_theme"
import { primaryButtonSmallStyle } from "../../pages/ttrpg/campaign_detail_styles"

interface LoreItemHolderProps {
    loreId: string
    loreName: string
    members: TtrpgMember[]
    membersHook: { updateMember: (id: string, member: Partial<TtrpgMember>) => Promise<void> }
    updateMembers: (updater: (members: TtrpgMember[]) => TtrpgMember[]) => void
    openMemberDetail: (memberId: string) => void
}

export default function LoreItemHolder({
    loreId, loreName, members, membersHook, updateMembers, openMemberDetail
}: LoreItemHolderProps) {
    const [showPicker, setShowPicker] = useState(false)

    const holder = findLoreItemHolder(loreId, members)

    async function assignToMember(memberId: string) {
        const target = members.find(m => m.id === memberId)
        if (!target) return

        const newItem: TtrpgMemberItem = { name: loreName, quantity: 1, lore_id: loreId }

        if (holder) {
            // Transfer: remove from current holder, add to new
            const prevHolder = holder.member
            const prevHolderItems = prevHolder.items
            const updatedHolderItems = prevHolderItems.filter((_, i) => i !== holder.itemIndex)

            const prevTargetItems = target.items
            const updatedTargetItems = [...target.items, newItem]

            updateMembers(ms => ms.map(m => {
                if (m.id === prevHolder.id) return { ...m, items: updatedHolderItems }
                if (m.id === target.id) return { ...m, items: updatedTargetItems }
                return m
            }))
            setShowPicker(false)

            try {
                await membersHook.updateMember(prevHolder.id, {
                    campaign_id: prevHolder.campaign_id, name: prevHolder.name, items: updatedHolderItems
                })
                await membersHook.updateMember(target.id, {
                    campaign_id: target.campaign_id, name: target.name, items: updatedTargetItems
                })
            } catch (error) {
                console.error("Error transferring lore item:", error)
                alert("Error transferring item — reverting")
                updateMembers(ms => ms.map(m => {
                    if (m.id === prevHolder.id) return { ...m, items: prevHolderItems }
                    if (m.id === target.id) return { ...m, items: prevTargetItems }
                    return m
                }))
            }
        } else {
            // Assign: add to target
            const prevItems = target.items
            const updatedItems = [...target.items, newItem]

            updateMembers(ms => ms.map(m =>
                m.id === target.id ? { ...m, items: updatedItems } : m
            ))
            setShowPicker(false)

            try {
                await membersHook.updateMember(target.id, {
                    campaign_id: target.campaign_id, name: target.name, items: updatedItems
                })
            } catch (error) {
                console.error("Error assigning lore item:", error)
                alert("Error assigning item — reverting")
                updateMembers(ms => ms.map(m =>
                    m.id === target.id ? { ...m, items: prevItems } : m
                ))
            }
        }
    }

    async function unassignFromHolder() {
        if (!holder) return
        const prevItems = holder.member.items
        const updatedItems = prevItems.filter((_, i) => i !== holder.itemIndex)

        updateMembers(ms => ms.map(m =>
            m.id === holder.member.id ? { ...m, items: updatedItems } : m
        ))

        try {
            await membersHook.updateMember(holder.member.id, {
                campaign_id: holder.member.campaign_id, name: holder.member.name, items: updatedItems
            })
        } catch (error) {
            console.error("Error unassigning lore item:", error)
            alert("Error unassigning item — reverting")
            updateMembers(ms => ms.map(m =>
                m.id === holder.member.id ? { ...m, items: prevItems } : m
            ))
        }
    }

    const availableMembers = members.filter(m => m.id !== holder?.member.id)

    return (
        <div style={{ ...themeStyles.sectionDivider, marginBottom: "0.5rem" }}>
            <strong>Held by</strong>
            {holder ? (
                <div style={{ marginTop: "0.25rem" }}>
                    <span
                        onClick={() => openMemberDetail(holder.member.id)}
                        style={{ cursor: "pointer", textDecoration: "underline", fontWeight: "bold" }}
                    >
                        {holder.member.name}
                    </span>
                    {" "}
                    <button
                        onClick={() => setShowPicker(!showPicker)}
                        style={{ fontSize: "0.85rem", marginLeft: "0.5rem" }}
                    >
                        {showPicker ? "Cancel" : "Transfer"}
                    </button>
                    <button
                        onClick={unassignFromHolder}
                        style={{ fontSize: "0.85rem", marginLeft: "0.25rem", color: "#c0392b" }}
                    >
                        Unassign
                    </button>
                </div>
            ) : (
                <div style={{ marginTop: "0.25rem", color: "#999" }}>
                    Not assigned{" "}
                    <button
                        onClick={() => setShowPicker(!showPicker)}
                        style={{ fontSize: "0.85rem", marginLeft: "0.25rem" }}
                    >
                        {showPicker ? "Cancel" : "Assign to..."}
                    </button>
                </div>
            )}

            {showPicker && availableMembers.length > 0 && (
                <div style={{ marginTop: "0.5rem", display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
                    {availableMembers.map(m => (
                        <button
                            key={m.id}
                            onClick={() => assignToMember(m.id)}
                            style={primaryButtonSmallStyle}
                        >
                            {m.name}
                        </button>
                    ))}
                </div>
            )}
            {showPicker && availableMembers.length === 0 && (
                <div style={{ marginTop: "0.5rem", color: "#999", fontSize: "0.85rem" }}>
                    No other members available
                </div>
            )}
        </div>
    )
}
