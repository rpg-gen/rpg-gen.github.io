import { useState } from "react"
import TtrpgSession from "../../types/ttrpg/TtrpgSession"
import { primaryButtonSmallStyle } from "../../pages/ttrpg/campaign_detail_styles"
import { ttrpg, themeStyles } from "../../configs/ttrpg_theme"

interface SessionDetailNavBarProps {
    session: TtrpgSession
    totalSessions: number
    hasPrev: boolean
    hasNext: boolean
    onPrev: () => void
    onNext: () => void
    onBack: () => void
    onDateChange: (newDate: string) => Promise<void>
    onRespiteChange: (newCount: number) => Promise<void>
    onTitleChange: (newTitle: string) => Promise<void>
    onDelete?: () => void
}

export default function SessionDetailNavBar({
    session,
    totalSessions,
    hasPrev,
    hasNext,
    onPrev,
    onNext,
    onBack,
    onDateChange,
    onRespiteChange,
    onTitleChange,
    onDelete
}: SessionDetailNavBarProps) {
    const [editing, setEditing] = useState(false)
    const [dateValue, setDateValue] = useState(session.date)
    const [editingRespites, setEditingRespites] = useState(false)
    const [respiteValue, setRespiteValue] = useState(session.respite_count)
    const [editingTitle, setEditingTitle] = useState(false)
    const [titleValue, setTitleValue] = useState(session.title || "")

    async function handleDateConfirm() {
        if (dateValue && dateValue !== session.date) {
            await onDateChange(dateValue)
        }
        setEditing(false)
    }

    async function handleRespiteConfirm() {
        if (respiteValue !== session.respite_count) {
            await onRespiteChange(respiteValue)
        }
        setEditingRespites(false)
    }

    async function handleTitleConfirm() {
        const trimmed = titleValue.trim()
        if (trimmed !== (session.title || "")) {
            await onTitleChange(trimmed)
        }
        setEditingTitle(false)
    }

    return (
        <div className="ttrpg-session-header" style={{ marginBottom: "1rem" }}>
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "0.5rem"
            }}>
                <button onClick={onBack} style={{ marginRight: "auto" }}>Back to Sessions</button>
                {onDelete && (
                    <button
                        onClick={onDelete}
                        className="ttrpg-btn-danger"
                        style={{ ...themeStyles.dangerButton, padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}
                    >
                        Delete
                    </button>
                )}
                <button onClick={onPrev} disabled={!hasPrev}>&lt;</button>
                <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)" }}>
                    {session.session_number} / {totalSessions}
                </span>
                <button onClick={onNext} disabled={!hasNext}>&gt;</button>
            </div>

            <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", flexWrap: "wrap" }}>
                <h2 style={{ margin: 0, fontFamily: ttrpg.fonts.heading, color: ttrpg.colors.gold }}>Session {session.session_number}</h2>
                {editing ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                        <input
                            type="date"
                            value={dateValue}
                            onChange={(e) => setDateValue(e.target.value)}
                            style={{ padding: "0.25rem" }}
                        />
                        <button onClick={handleDateConfirm} style={primaryButtonSmallStyle}>OK</button>
                        <button onClick={() => { setDateValue(session.date); setEditing(false) }}>Cancel</button>
                    </span>
                ) : (
                    <span
                        className="ttrpg-click-to-edit"
                        onClick={() => setEditing(true)}
                        style={themeStyles.clickToEditOnDark}
                        title="Click to edit date"
                    >
                        {session.date}
                    </span>
                )}

                <span style={{ color: "rgba(255,255,255,0.4)" }}>—</span>

                {editingRespites ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                        <span>Respites:</span>
                        <button onClick={() => setRespiteValue(Math.max(0, respiteValue - 1))}>-</button>
                        <span>{respiteValue}</span>
                        <button onClick={() => setRespiteValue(respiteValue + 1)}>+</button>
                        <button onClick={handleRespiteConfirm} style={primaryButtonSmallStyle}>OK</button>
                        <button onClick={() => { setRespiteValue(session.respite_count); setEditingRespites(false) }}>Cancel</button>
                    </span>
                ) : (
                    <span
                        className="ttrpg-click-to-edit"
                        onClick={() => { setRespiteValue(session.respite_count); setEditingRespites(true) }}
                        style={themeStyles.clickToEditOnDark}
                        title="Click to edit respites"
                    >
                        {session.respite_count} respite{session.respite_count !== 1 ? "s" : ""}
                    </span>
                )}
            </div>

            {/* Title */}
            <div style={{ marginTop: "0.5rem" }}>
                {editingTitle ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        <input
                            type="text"
                            value={titleValue}
                            onChange={(e) => setTitleValue(e.target.value)}
                            placeholder="Session title..."
                            autoFocus
                            style={{ flex: 1, padding: "0.25rem" }}
                            onKeyDown={(e) => { if (e.key === "Enter") handleTitleConfirm() }}
                        />
                        <button onClick={handleTitleConfirm} style={primaryButtonSmallStyle}>OK</button>
                        <button onClick={() => { setTitleValue(session.title || ""); setEditingTitle(false) }}>Cancel</button>
                    </div>
                ) : (
                    <span
                        className="ttrpg-click-to-edit"
                        onClick={() => { setTitleValue(session.title || ""); setEditingTitle(true) }}
                        style={{
                            ...themeStyles.clickToEditOnDark,
                            fontStyle: session.title ? "normal" : "italic",
                            color: session.title ? "inherit" : "rgba(255,255,255,0.4)"
                        }}
                        title="Click to edit title"
                    >
                        {session.title || "Add title..."}
                    </span>
                )}
            </div>
        </div>
    )
}
