import { useState, useEffect, useRef } from "react"
import TtrpgLoreEntry, { LoreEntryType } from "../../types/ttrpg/TtrpgLoreEntry"
import TtrpgMember from "../../types/ttrpg/TtrpgMember"
import { LORE_COLORS, LORE_LABELS, ALL_LORE_TYPES } from "../../configs/ttrpg_constants"
import { MEMBER_COLOR } from "./slash_command_types"
import SlashCommandResultRow from "./slash_command_result_row"

interface SlashCommandModalProps {
    loreEntries: TtrpgLoreEntry[]
    members: TtrpgMember[]
    onSelect: (name: string) => void
    onCreateLore: (name: string, type: LoreEntryType) => void
    onDismiss: () => void
}

interface ResultItem {
    key: string
    name: string
    label: string
    labelColor: string
}

export default function SlashCommandModal({
    loreEntries,
    members,
    onSelect,
    onCreateLore,
    onDismiss
}: SlashCommandModalProps) {
    const [searchText, setSearchText] = useState("")
    const [selectedIndex, setSelectedIndex] = useState(0)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        inputRef.current?.focus()
    }, [])

    const search = searchText.toLowerCase()

    const memberResults: ResultItem[] = members
        .filter(m => m.name.toLowerCase().includes(search))
        .slice(0, 4)
        .map(m => ({ key: "m-" + m.id, name: m.name, label: "Player", labelColor: MEMBER_COLOR }))

    const loreResults: ResultItem[] = loreEntries
        .filter(e => e.name.toLowerCase().includes(search))
        .slice(0, 6)
        .map(e => ({ key: "l-" + e.id, name: e.name, label: LORE_LABELS[e.type], labelColor: LORE_COLORS[e.type] }))

    const allResults = [...memberResults, ...loreResults]

    useEffect(() => {
        setSelectedIndex(0)
    }, [searchText])

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === "ArrowDown") {
            e.preventDefault()
            setSelectedIndex(i => Math.min(i + 1, allResults.length - 1))
        } else if (e.key === "ArrowUp") {
            e.preventDefault()
            setSelectedIndex(i => Math.max(i - 1, 0))
        } else if (e.key === "Enter") {
            e.preventDefault()
            if (allResults.length > 0 && selectedIndex < allResults.length) {
                onSelect(allResults[selectedIndex].name)
            }
        } else if (e.key === "Escape") {
            e.preventDefault()
            onDismiss()
        }
    }

    function handleBackdropClick(e: React.MouseEvent) {
        if (e.target === e.currentTarget) {
            onDismiss()
        }
    }

    const trimmed = searchText.trim()

    return (
        <div
            onClick={handleBackdropClick}
            style={{
                position: "fixed",
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: "rgba(0,0,0,0.75)",
                zIndex: 100,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            }}
        >
            <div style={{
                backgroundColor: "#fff",
                borderRadius: "8px",
                width: "450px",
                maxWidth: "90vw",
                maxHeight: "80vh",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 4px 24px rgba(0,0,0,0.3)"
            }}>
                {/* Search input */}
                <div style={{ padding: "0.75rem", borderBottom: "1px solid #eee", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <input
                        ref={inputRef}
                        type="text"
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search lore and players..."
                        style={{
                            flex: 1,
                            padding: "0.5rem",
                            fontSize: "1rem",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                            boxSizing: "border-box",
                            color: "#222"
                        }}
                    />
                    <button
                        onClick={onDismiss}
                        style={{
                            background: "none", border: "none", cursor: "pointer",
                            fontSize: "1.2rem", color: "#999", padding: "0.25rem",
                            flexShrink: 0
                        }}
                    >✕</button>
                </div>

                {/* Results */}
                <div style={{ overflowY: "auto", flex: 1 }}>
                    {allResults.map((item, i) => (
                        <SlashCommandResultRow
                            key={item.key}
                            name={item.name}
                            label={item.label}
                            labelColor={item.labelColor}
                            isHighlighted={i === selectedIndex}
                            showEnterHint={i === selectedIndex}
                            onClick={() => onSelect(item.name)}
                            onMouseEnter={() => setSelectedIndex(i)}
                        />
                    ))}

                    {allResults.length === 0 && !trimmed && (
                        <div style={{ padding: "0.75rem", color: "#888", fontSize: "0.85rem" }}>
                            Type to search lore and players...
                        </div>
                    )}

                    {allResults.length === 0 && trimmed && (
                        <div style={{ padding: "0.75rem", color: "#888", fontSize: "0.85rem" }}>
                            No matches found
                        </div>
                    )}
                </div>

                {/* Create new */}
                {trimmed && (
                    <div style={{ padding: "0.5rem 0.75rem", borderTop: "1px solid #eee" }}>
                        <div style={{ fontSize: "0.8rem", color: "#666", marginBottom: "0.3rem" }}>
                            Create &ldquo;{trimmed}&rdquo; as:
                        </div>
                        <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                            {ALL_LORE_TYPES.map(type => (
                                <button
                                    key={type}
                                    onClick={() => {
                                        onSelect(trimmed)
                                        onCreateLore(trimmed, type)
                                    }}
                                    style={{
                                        backgroundColor: LORE_COLORS[type],
                                        color: "#222",
                                        border: "1px solid #ccc",
                                        borderRadius: "3px",
                                        padding: "0.2rem 0.5rem",
                                        cursor: "pointer",
                                        fontSize: "0.8rem"
                                    }}
                                >
                                    + {LORE_LABELS[type]}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
