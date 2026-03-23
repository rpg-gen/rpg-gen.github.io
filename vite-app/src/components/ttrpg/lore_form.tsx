import TtrpgSession from "../../types/ttrpg/TtrpgSession"
import TtrpgLoreEntry, { LoreEntryType } from "../../types/ttrpg/TtrpgLoreEntry"
import AutoResizeTextarea from "./auto_resize_textarea"
import { LORE_LABELS, ALL_LORE_TYPES } from "../../configs/ttrpg_constants"
import { primaryButtonStyle } from "../../pages/ttrpg/campaign_detail_styles"

interface LoreFormProps {
    loreFormType: LoreEntryType
    setLoreFormType: (type: LoreEntryType) => void
    loreFormName: string
    setLoreFormName: (name: string) => void
    loreFormSubtitle: string
    setLoreFormSubtitle: (subtitle: string) => void
    loreFormSessionId: string | undefined
    setLoreFormSessionId: (id: string | undefined) => void
    loreFormFactionId: string | undefined
    setLoreFormFactionId: (id: string | undefined) => void
    sessions: TtrpgSession[]
    factions: TtrpgLoreEntry[]
    onSave: () => void
    onCancel: () => void
}

export default function LoreForm({
    loreFormType, setLoreFormType,
    loreFormName, setLoreFormName,
    loreFormSubtitle, setLoreFormSubtitle,
    loreFormSessionId, setLoreFormSessionId,
    loreFormFactionId, setLoreFormFactionId,
    sessions, factions,
    onSave, onCancel
}: LoreFormProps) {
    return (
        <div>
            <h3>Add {LORE_LABELS[loreFormType]}</h3>
            <label style={{ display: "block", marginBottom: "0.25rem" }}>Name</label>
            <input
                type="text"
                value={loreFormName}
                onChange={(e) => setLoreFormName(e.target.value)}
                placeholder="Name"
                autoFocus
                style={{ width: "100%", padding: "0.5rem", boxSizing: "border-box" }}
                onKeyDown={(e) => { if (e.key === "Enter") onSave() }}
            />
            <label style={{ display: "block", marginTop: "0.75rem", marginBottom: "0.25rem" }}>Subtitle</label>
            <AutoResizeTextarea
                value={loreFormSubtitle}
                onChange={(e) => setLoreFormSubtitle(e.target.value)}
                placeholder="e.g. Dwarven blacksmith of Ironhold"
            />
            <label style={{ display: "block", marginTop: "0.75rem", marginBottom: "0.25rem" }}>Type</label>
            <select
                value={loreFormType}
                onChange={(e) => setLoreFormType(e.target.value as LoreEntryType)}
                style={{ width: "100%", padding: "0.5rem", boxSizing: "border-box", marginBottom: "0.75rem" }}
            >
                {ALL_LORE_TYPES.map(type => (
                    <option key={type} value={type}>{LORE_LABELS[type]}</option>
                ))}
            </select>

            {loreFormType === "person" && (
                <>
                    <label style={{ display: "block", marginBottom: "0.25rem" }}>Faction</label>
                    <select
                        value={loreFormFactionId || ""}
                        onChange={(e) => setLoreFormFactionId(e.target.value || undefined)}
                        style={{ width: "100%", padding: "0.5rem", boxSizing: "border-box", marginBottom: "0.75rem" }}
                    >
                        <option value="">No Faction</option>
                        {factions.map(f => (
                            <option key={f.id} value={f.id}>{f.name}</option>
                        ))}
                    </select>
                </>
            )}

            <label style={{ display: "block", marginBottom: "0.25rem" }}>Session</label>
            <select
                value={loreFormSessionId || ""}
                onChange={(e) => setLoreFormSessionId(e.target.value || undefined)}
                style={{ width: "100%", padding: "0.5rem", boxSizing: "border-box" }}
            >
                <option value="">No Session</option>
                {sessions.map(s => (
                    <option key={s.id} value={s.id}>Session {s.session_number} — {s.date}</option>
                ))}
            </select>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                <button onClick={onSave} style={primaryButtonStyle}>Add</button>
                <button onClick={onCancel}>Cancel</button>
            </div>
        </div>
    )
}
