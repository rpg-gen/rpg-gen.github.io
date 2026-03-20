import TtrpgSession from "../../types/ttrpg/TtrpgSession"
import TtrpgSessionNote from "../../types/ttrpg/TtrpgSessionNote"
import TtrpgLoreEntry from "../../types/ttrpg/TtrpgLoreEntry"
import TtrpgMember from "../../types/ttrpg/TtrpgMember"
import LoreNoteText from "./lore_note_text"
import { cardStyle } from "../../pages/ttrpg/campaign_detail_styles"
import { LORE_COLORS, LORE_LABELS } from "../../configs/ttrpg_constants"

interface CampaignData {
    sessions: TtrpgSession[]
    members: TtrpgMember[]
    notes: TtrpgSessionNote[]
    lore: TtrpgLoreEntry[]
}

interface LoreDetailViewProps {
    entry: TtrpgLoreEntry
    data: CampaignData
    goToSession: (sessionId: string, noteId?: string) => void
    openLoreDetail: (entryId: string) => void
    openMemberDetail: (memberId: string) => void
    cameFromSessionId: string | null
    backToOriginSession: () => void
    clearCameFromSessionId: () => void
    onBack: () => void
    onEdit: (entry: TtrpgLoreEntry) => void
}

export default function LoreDetailView({
    entry, data, goToSession, openLoreDetail, openMemberDetail,
    cameFromSessionId, backToOriginSession, clearCameFromSessionId,
    onBack, onEdit
}: LoreDetailViewProps) {
    const entrySession = entry.session_id ? data.sessions.find(s => s.id === entry.session_id) : null

    const mentions: { note: TtrpgSessionNote; session: TtrpgSession }[] = []
    for (const note of data.notes) {
        if (note.text.includes(`[[${entry.name}]]`)) {
            const session = data.sessions.find(s => s.id === note.session_id)
            if (session) mentions.push({ note, session })
        }
    }
    mentions.sort((a, b) =>
        a.session.session_number - b.session.session_number
        || a.note.created_at.localeCompare(b.note.created_at)
    )

    return (
        <div>
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                {cameFromSessionId && (
                    <button onClick={backToOriginSession}>Back to session</button>
                )}
                <button onClick={() => { onBack(); clearCameFromSessionId() }}>Back to lore list</button>
            </div>

            <div style={{ ...cardStyle, backgroundColor: LORE_COLORS[entry.type] }}>
                <div style={{ marginBottom: "0.5rem" }}>
                    <strong style={{ fontSize: "1.2rem" }}>{entry.name}</strong>
                    <span style={{ color: "#666", marginLeft: "0.5rem" }}>({LORE_LABELS[entry.type]})</span>
                </div>
                {entry.notes && (
                    <div style={{ fontStyle: "italic", color: "#555", marginBottom: "0.75rem" }}>{entry.notes}</div>
                )}

                {entrySession && (
                    <div style={{ marginBottom: "0.75rem" }}>
                        <strong>Introduced:</strong> Session {entrySession.session_number} — {entrySession.date}
                        <button
                            onClick={() => goToSession(entrySession.id)}
                            style={{ marginLeft: "0.5rem", fontSize: "0.85rem" }}
                        >
                            Go to session notes
                        </button>
                    </div>
                )}

                {mentions.length > 0 && (
                    <div style={{ borderTop: "1px solid #ccc", paddingTop: "0.75rem", marginTop: "0.5rem" }}>
                        <strong>Session mentions ({mentions.length})</strong>
                        {mentions.map(({ note, session }) => (
                            <div
                                key={note.id}
                                style={{
                                    border: "1px solid #ddd",
                                    borderRadius: "4px",
                                    padding: "0.5rem",
                                    marginTop: "0.5rem",
                                    backgroundColor: "#fff",
                                    cursor: "pointer"
                                }}
                                onClick={() => goToSession(session.id, note.id)}
                            >
                                <div style={{ fontSize: "0.8rem", color: "#666", marginBottom: "0.25rem" }}>
                                    Session {session.session_number} — {session.date}
                                </div>
                                <div style={{ fontSize: "0.9rem", color: "#333" }}>
                                    <LoreNoteText text={note.text} loreEntries={data.lore} members={data.members} onLoreClick={openLoreDetail} onMemberClick={openMemberDetail} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div style={{ marginTop: "1rem" }}>
                    <button onClick={() => onEdit(entry)}>Edit</button>
                </div>
            </div>
        </div>
    )
}
