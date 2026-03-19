import { useState, useRef, useEffect } from "react"
import TtrpgLoreEntry, { LoreEntryType } from "../../types/ttrpg/TtrpgLoreEntry"
import TtrpgMember from "../../types/ttrpg/TtrpgMember"
import { LORE_COLORS, LORE_LABELS, ALL_LORE_TYPES } from "../../configs/ttrpg_constants"

interface SlashCommandTextareaProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    loreEntries: TtrpgLoreEntry[]
    members: TtrpgMember[]
    onCreateLore: (name: string, type: LoreEntryType) => void
    style?: React.CSSProperties
}

const MEMBER_COLOR = "#f3e8ff"

export default function SlashCommandTextarea({ value, onChange, placeholder, loreEntries, members, onCreateLore, style }: SlashCommandTextareaProps) {
    const [menuActive, setMenuActive] = useState(false)
    const [searchText, setSearchText] = useState("")
    // Points to the first `[` of the `[[` trigger
    const [triggerIndex, setTriggerIndex] = useState(-1)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
        const newValue = e.target.value
        const cursorPos = e.target.selectionStart

        onChange(newValue)

        // If menu is already open, keep tracking from the stored trigger position
        if (menuActive && triggerIndex >= 0) {
            // Close if the `[[` was deleted or cursor moved before it
            if (triggerIndex + 1 >= newValue.length || newValue[triggerIndex] !== "[" || newValue[triggerIndex + 1] !== "[" || cursorPos <= triggerIndex + 1) {
                dismiss()
                return
            }
            const text = newValue.slice(triggerIndex + 2, cursorPos)
            // Close if user typed `]]` (they closed it manually)
            if (text.includes("]]")) {
                dismiss()
                return
            }
            // Close on newline
            if (text.includes("\n")) {
                dismiss()
                return
            }
            setSearchText(text)
            return
        }

        // Not active yet — look for `[[` trigger
        // Check if the two characters before cursor are `[[`
        if (cursorPos >= 2 && newValue[cursorPos - 1] === "[" && newValue[cursorPos - 2] === "[") {
            setMenuActive(true)
            setSearchText("")
            setTriggerIndex(cursorPos - 2)
            return
        }

        // Also activate if we're already typing inside `[[...` (no closing `]]` yet)
        // Scan backwards from cursor for `[[`
        for (let i = cursorPos - 1; i >= 1; i--) {
            if (newValue[i] === "\n") break
            if (newValue[i - 1] === "[" && newValue[i] === "[") {
                const textAfter = newValue.slice(i + 1, cursorPos)
                if (!textAfter.includes("]]") && !textAfter.includes("\n")) {
                    setMenuActive(true)
                    setSearchText(textAfter)
                    setTriggerIndex(i - 1)
                }
                break
            }
        }
    }

    function dismiss() {
        setMenuActive(false)
        setSearchText("")
        setTriggerIndex(-1)
    }

    function insertLink(name: string) {
        // Replace `[[searchText` with `[[name]]`
        const before = value.slice(0, triggerIndex)
        const after = value.slice(triggerIndex + 2 + searchText.length)
        const insertion = "[[" + name + "]]"
        const newValue = before + insertion + after
        const cursorTarget = before.length + insertion.length
        onChange(newValue)
        dismiss()
        requestAnimationFrame(() => {
            if (textareaRef.current) {
                textareaRef.current.focus()
                textareaRef.current.setSelectionRange(cursorTarget, cursorTarget)
            }
        })
    }

    function handleCreateNew(type: LoreEntryType) {
        const name = searchText.trim()
        if (!name) return
        insertLink(name)
        onCreateLore(name, type)
    }

    // Close dropdown on outside click
    const containerRef = useRef<HTMLDivElement>(null)
    useEffect(() => {
        if (!menuActive) return
        function handleClick(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                dismiss()
            }
        }
        document.addEventListener("mousedown", handleClick)
        return () => document.removeEventListener("mousedown", handleClick)
    }, [menuActive])

    const search = searchText.toLowerCase()

    const filteredLore = menuActive
        ? loreEntries.filter(e => e.name.toLowerCase().includes(search)).slice(0, 6)
        : []

    const filteredMembers = menuActive
        ? members.filter(m => m.name.toLowerCase().includes(search)).slice(0, 4)
        : []

    const firstMatch = filteredMembers[0] || filteredLore[0]

    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === "Escape" && menuActive) {
            e.preventDefault()
            dismiss()
        }
        if (e.key === "Enter" && menuActive && firstMatch) {
            e.preventDefault()
            insertLink(firstMatch.name)
        }
    }

    return (
        <div ref={containerRef} style={{ position: "relative" }}>
            <textarea
                ref={textareaRef}
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                style={style}
            />
            {menuActive && (
                <div style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    zIndex: 10,
                    backgroundColor: "#fff",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    maxHeight: "280px",
                    overflowY: "auto"
                }}>
                    {/* Header */}
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0.5rem",
                        borderBottom: "1px solid #eee",
                        color: "#222"
                    }}>
                        <span style={{ fontSize: "0.85rem" }}>
                            Link: <strong>{searchText || "..."}</strong>
                        </span>
                        <button
                            onClick={dismiss}
                            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1rem", color: "#888" }}
                        >
                            x
                        </button>
                    </div>

                    {/* Filtered members */}
                    {filteredMembers.map((member, i) => {
                        const isFirst = i === 0
                        return (
                            <div
                                key={"m-" + member.id}
                                onClick={() => insertLink(member.name)}
                                style={{
                                    padding: "0.4rem 0.5rem",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    borderBottom: "1px solid #f0f0f0",
                                    backgroundColor: isFirst ? "#e8f0fe" : "transparent",
                                    borderLeft: isFirst ? "3px solid #4285f4" : "3px solid transparent"
                                }}
                                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = "#f5f5f5" }}
                                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = isFirst ? "#e8f0fe" : "transparent" }}
                            >
                                <span style={{
                                    backgroundColor: MEMBER_COLOR,
                                    color: "#222",
                                    padding: "0.1rem 0.4rem",
                                    borderRadius: "3px",
                                    fontSize: "0.75rem"
                                }}>
                                    Player
                                </span>
                                <span style={{ color: "#222" }}>{member.name}</span>
                                {isFirst && <span style={{ marginLeft: "auto", fontSize: "0.7rem", color: "#888" }}>Enter</span>}
                            </div>
                        )
                    })}

                    {/* Filtered lore entries */}
                    {filteredLore.map((entry, i) => {
                        const isFirst = i === 0 && filteredMembers.length === 0
                        return (
                            <div
                                key={"l-" + entry.id}
                                onClick={() => insertLink(entry.name)}
                                style={{
                                    padding: "0.4rem 0.5rem",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    borderBottom: "1px solid #f0f0f0",
                                    backgroundColor: isFirst ? "#e8f0fe" : "transparent",
                                    borderLeft: isFirst ? "3px solid #4285f4" : "3px solid transparent"
                                }}
                                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = "#f5f5f5" }}
                                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = isFirst ? "#e8f0fe" : "transparent" }}
                            >
                                <span style={{
                                    backgroundColor: LORE_COLORS[entry.type],
                                    color: "#222",
                                    padding: "0.1rem 0.4rem",
                                    borderRadius: "3px",
                                    fontSize: "0.75rem"
                                }}>
                                    {LORE_LABELS[entry.type]}
                                </span>
                                <span style={{ color: "#222" }}>{entry.name}</span>
                                {isFirst && <span style={{ marginLeft: "auto", fontSize: "0.7rem", color: "#888" }}>Enter</span>}
                            </div>
                        )
                    })}

                    {/* Create new lore options */}
                    {searchText.trim() && (
                        <div style={{ padding: "0.4rem 0.5rem", borderTop: "1px solid #eee" }}>
                            <div style={{ fontSize: "0.8rem", color: "#666", marginBottom: "0.3rem" }}>
                                Create &ldquo;{searchText.trim()}&rdquo; as:
                            </div>
                            <div style={{ display: "flex", gap: "0.35rem" }}>
                                {ALL_LORE_TYPES.map(type => (
                                    <button
                                        key={type}
                                        onClick={() => handleCreateNew(type)}
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

                    {filteredLore.length === 0 && filteredMembers.length === 0 && !searchText.trim() && (
                        <div style={{ padding: "0.5rem", color: "#888", fontSize: "0.85rem" }}>
                            Type to search lore and players...
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
