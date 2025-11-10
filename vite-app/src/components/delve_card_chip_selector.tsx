import { useState, useEffect } from "react"

interface ChipSelectorItem {
    id: string
    name: string
}

interface ChipSelectorProps {
    label: string
    items: ChipSelectorItem[]
    selectedIds: string[]
    onSelectionChange: (ids: string[]) => void
    chipColor: { border: string; background: string; prefix: string }
    multiSelect?: boolean
    manageButton?: {
        text: string
        onClick: () => void
    }
}

export default function ChipSelector({
    label,
    items,
    selectedIds,
    onSelectionChange,
    chipColor,
    multiSelect = true,
    manageButton
}: ChipSelectorProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)

    // Close dropdown when clicking outside or pressing Escape
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as HTMLElement
            if (!target.closest('[data-chip-selector-input]') && !target.closest('[data-chip-selector-panel]')) {
                setIsDropdownOpen(false)
            }
        }

        function handleEscapeKey(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setIsDropdownOpen(false)
            }
        }

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside)
            document.addEventListener('keydown', handleEscapeKey)
            return () => {
                document.removeEventListener('mousedown', handleClickOutside)
                document.removeEventListener('keydown', handleEscapeKey)
            }
        }
    }, [isDropdownOpen])

    function toggleItem(itemId: string) {
        if (multiSelect) {
            if (selectedIds.includes(itemId)) {
                onSelectionChange(selectedIds.filter(id => id !== itemId))
            } else {
                onSelectionChange([...selectedIds, itemId])
            }
        } else {
            // Single select - replace selection
            if (selectedIds.includes(itemId)) {
                onSelectionChange([])
            } else {
                onSelectionChange([itemId])
            }
        }
    }

    return (
        <div style={{ marginBottom: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem" }}>
                <strong>{label}</strong>
                {manageButton && (
                    <button
                        onClick={manageButton.onClick}
                        style={{ marginLeft: "0.5rem", fontSize: "0.85rem" }}
                    >
                        {manageButton.text}
                    </button>
                )}
            </div>

            <div style={{ position: "relative" }}>
                {/* Chip display and click area */}
                <div
                    data-chip-selector-input
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    style={{
                        border: "1px solid #ccc",
                        padding: "0.5rem",
                        backgroundColor: "white",
                        minHeight: "38px",
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "0.25rem",
                        alignItems: "center",
                        cursor: "pointer"
                    }}
                >
                    {selectedIds.length === 0 ? (
                        <span style={{ color: "#999", fontSize: "0.9rem" }}>
                            Click to select...
                        </span>
                    ) : (
                        selectedIds.map(itemId => {
                            const item = items.find(i => i.id === itemId)
                            if (!item) return null
                            return (
                                <span
                                    key={itemId}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        toggleItem(itemId)
                                    }}
                                    style={{
                                        border: `1px solid ${chipColor.border}`,
                                        borderRadius: "4px",
                                        padding: "0.2rem 0.5rem",
                                        fontSize: "0.85rem",
                                        backgroundColor: chipColor.background,
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "0.3rem",
                                        cursor: "pointer"
                                    }}
                                >
                                    <span style={{ fontWeight: "600", color: chipColor.border }}>
                                        {chipColor.prefix}
                                    </span>
                                    {item.name}
                                    <span style={{ fontWeight: "bold", fontSize: "1rem" }}>×</span>
                                </span>
                            )
                        })
                    )}
                </div>

                {/* Dropdown panel */}
                {isDropdownOpen && (
                    <div
                        data-chip-selector-panel
                        style={{
                            position: "absolute",
                            top: "100%",
                            left: 0,
                            right: 0,
                            border: "1px solid #ccc",
                            backgroundColor: "white",
                            zIndex: 1000,
                            marginTop: "0.25rem",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                            maxHeight: "250px",
                            overflowY: "auto"
                        }}
                    >
                        {items.length === 0 ? (
                            <div style={{ padding: "1rem", color: "#666", textAlign: "center" }}>
                                No {label.toLowerCase()} available
                            </div>
                        ) : (
                            items.map(item => (
                                <label
                                    key={item.id}
                                    style={{
                                        display: "block",
                                        padding: "0.5rem",
                                        cursor: "pointer",
                                        borderBottom: "1px solid #f0f0f0",
                                        backgroundColor: selectedIds.includes(item.id) ? chipColor.background : "transparent"
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = selectedIds.includes(item.id) ? chipColor.background : "#f5f5f5"}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = selectedIds.includes(item.id) ? chipColor.background : "transparent"}
                                >
                                    <input
                                        type={multiSelect ? "checkbox" : "radio"}
                                        checked={selectedIds.includes(item.id)}
                                        onChange={() => toggleItem(item.id)}
                                        style={{ marginRight: "0.5rem" }}
                                    />
                                    {item.name}
                                </label>
                            ))
                        )}

                        {/* Close button */}
                        <div style={{
                            padding: "0.5rem",
                            borderTop: "1px solid #ccc",
                            backgroundColor: "#f9f9f9",
                            display: "flex",
                            justifyContent: "flex-end"
                        }}>
                            <button
                                onClick={() => setIsDropdownOpen(false)}
                                style={{
                                    padding: "0.4rem 1rem",
                                    fontSize: "0.85rem",
                                    cursor: "pointer",
                                    backgroundColor: "#4a90e2",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px"
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

