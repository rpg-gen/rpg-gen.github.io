import { useEffect, useState } from "react"
import TtrpgSession from "../../types/ttrpg/TtrpgSession"
import TtrpgLoreEntry, { LoreEntryType } from "../../types/ttrpg/TtrpgLoreEntry"
import TtrpgMember from "../../types/ttrpg/TtrpgMember"
import SlashCommandTextarea from "./slash_command_textarea"
import { primaryButtonStyle } from "../../pages/ttrpg/campaign_detail_styles"

interface NoteEditModalProps {
    noteText: string
    onChangeText: (text: string) => void
    onSave: () => void
    onCancel: () => void
    onDelete?: () => void
    onMove?: (targetSessionId: string) => void
    otherSessions: TtrpgSession[]
    loreEntries: TtrpgLoreEntry[]
    members: TtrpgMember[]
    onCreateLore: (name: string, type: LoreEntryType) => void
}

export default function NoteEditModal({
    noteText, onChangeText, onSave, onCancel, onDelete,
    onMove, otherSessions, loreEntries, members, onCreateLore
}: NoteEditModalProps) {
    const [showMoveSelect, setShowMoveSelect] = useState(false)

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape" && !e.defaultPrevented) onCancel()
        }
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [onCancel])

    function handleBackdropClick(e: React.MouseEvent) {
        if (e.target === e.currentTarget) onCancel()
    }

    return (
        <div
            onClick={handleBackdropClick}
            style={{
                position: "fixed",
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: "rgba(0,0,0,0.5)",
                zIndex: 100,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            }}
        >
            <div style={{
                backgroundColor: "#fff",
                borderRadius: "8px",
                width: "600px",
                maxWidth: "90vw",
                maxHeight: "80vh",
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
                position: "relative"
            }}>
                <button
                    onClick={onCancel}
                    style={{
                        position: "absolute", top: "0.5rem", right: "0.5rem",
                        background: "none", border: "none", cursor: "pointer",
                        fontSize: "1.2rem", color: "#999", padding: "0.25rem"
                    }}
                >✕</button>
                <SlashCommandTextarea
                    value={noteText}
                    onChange={onChangeText}
                    loreEntries={loreEntries}
                    members={members}
                    onCreateLore={onCreateLore}
                    style={{ minHeight: "120px" }}
                />
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
                    <button onClick={onSave} style={primaryButtonStyle}>Save</button>
                    <button onClick={onCancel}>Cancel</button>
                    {onMove && (showMoveSelect ? (
                        <select
                            autoFocus
                            defaultValue=""
                            onChange={(e) => { if (e.target.value) onMove(e.target.value) }}
                            onBlur={() => setShowMoveSelect(false)}
                            style={{ padding: "0.25rem" }}
                        >
                            <option value="" disabled>Select session...</option>
                            {otherSessions.map(s => (
                                <option key={s.id} value={s.id}>
                                    {s.title || `Session ${s.session_number}`} — {s.date}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <button onClick={() => setShowMoveSelect(true)}>Move to Session</button>
                    ))}
                    {onDelete && (
                        <button
                            onClick={onDelete}
                            style={{ marginLeft: "auto", backgroundColor: "#c0392b", color: "#fff", border: "none", padding: "0.5rem 0.75rem", borderRadius: "3px", cursor: "pointer" }}
                        >
                            Delete
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
