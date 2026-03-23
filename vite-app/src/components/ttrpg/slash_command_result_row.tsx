import { ttrpg } from "../../configs/ttrpg_theme"

interface SlashCommandResultRowProps {
    name: string
    label: string
    labelColor: string
    isHighlighted: boolean
    showEnterHint: boolean
    onClick: () => void
    onMouseEnter: () => void
}

export default function SlashCommandResultRow({
    name,
    label,
    labelColor,
    isHighlighted,
    showEnterHint,
    onClick,
    onMouseEnter
}: SlashCommandResultRowProps) {
    return (
        <div
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            style={{
                padding: "0.4rem 0.5rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                borderBottom: `1px solid ${ttrpg.colors.divider}`,
                backgroundColor: isHighlighted ? ttrpg.colors.goldMuted : "transparent",
                borderLeft: isHighlighted ? `3px solid ${ttrpg.colors.gold}` : "3px solid transparent"
            }}
        >
            <span className="ttrpg-pill" style={{
                backgroundColor: labelColor,
                color: ttrpg.colors.textDark,
                padding: "0.1rem 0.4rem",
                borderRadius: ttrpg.radius.sm,
                fontSize: "0.75rem",
                fontWeight: "bold",
            }}>
                {label}
            </span>
            <span style={{ color: ttrpg.colors.textDark }}>{name}</span>
            {showEnterHint && (
                <span style={{ marginLeft: "auto", fontSize: "0.7rem", color: ttrpg.colors.textMuted }}>
                    Enter
                </span>
            )}
        </div>
    )
}
