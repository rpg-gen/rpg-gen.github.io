import { useEffect, useState } from "react"
import TtrpgSession from "../../types/ttrpg/TtrpgSession"
import TtrpgLoreEntry, { LoreEntryType } from "../../types/ttrpg/TtrpgLoreEntry"
import TtrpgMember from "../../types/ttrpg/TtrpgMember"
import TtrpgQuest from "../../types/ttrpg/TtrpgQuest"
import TtrpgProject from "../../types/ttrpg/TtrpgProject"
import SlashCommandTextarea from "./slash_command_textarea"
import { primaryButtonStyle } from "../../pages/ttrpg/campaign_detail_styles"
import { themeStyles } from "../../configs/ttrpg_theme"

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
    quests?: TtrpgQuest[]
    projects?: TtrpgProject[]
    onCreateLore: (name: string, type: LoreEntryType) => void
}

export default function NoteEditModal({
    noteText, onChangeText, onSave, onCancel, onDelete,
    onMove, otherSessions, loreEntries, members, quests, projects, onCreateLore
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
            style={themeStyles.modalBackdrop}
        >
            <div className="ttrpg-modal-content" style={{ ...themeStyles.modalContent, padding: "1rem" }}>
                <button
                    onClick={onCancel}
                    className="ttrpg-btn-ghost"
                    style={{ ...themeStyles.ghostButton, position: "absolute", top: "0.5rem", right: "0.5rem", fontSize: "1.2rem", color: "#999" }}
                >✕</button>
                <SlashCommandTextarea
                    value={noteText}
                    onChange={onChangeText}
                    loreEntries={loreEntries}
                    members={members}
                    quests={quests}
                    projects={projects}
                    onCreateLore={onCreateLore}
                    placeholder="Type a note... Use [[ or / to link"
                    style={{ minHeight: "120px" }}
                />
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
                    <button onClick={onSave} className="ttrpg-btn-primary" style={primaryButtonStyle}>Save</button>
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
                            className="ttrpg-btn-danger"
                            style={{ ...themeStyles.dangerButton, marginLeft: "auto", padding: "0.5rem 0.75rem" }}
                        >
                            Delete
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
