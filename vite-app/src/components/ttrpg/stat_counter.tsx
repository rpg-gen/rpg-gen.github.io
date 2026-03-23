import { ttrpg } from "../../configs/ttrpg_theme"

interface StatCounterProps {
    label: string
    value: number
    min?: number
    max?: number
    onChange: (newValue: number) => void
}

export default function StatCounter({ label, value, min = 0, max, onChange }: StatCounterProps) {
    const canDecrement = min === undefined || value > min
    const canIncrement = max === undefined || value < max

    const buttonStyle = {
        width: "2rem",
        height: "2rem",
        fontSize: "1rem",
        border: `1px solid ${ttrpg.colors.cardBorder}`,
        backgroundColor: ttrpg.colors.cardBg,
        color: ttrpg.colors.textDark,
        display: "flex" as const,
        alignItems: "center" as const,
        justifyContent: "center" as const,
    }

    return (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ minWidth: "6rem", color: ttrpg.colors.textDark, fontWeight: 500 }}>{label}</span>
            <button
                onClick={() => canDecrement && onChange(value - 1)}
                disabled={!canDecrement}
                style={{
                    ...buttonStyle,
                    borderRadius: `${ttrpg.radius.sm} 0 0 ${ttrpg.radius.sm}`,
                    cursor: canDecrement ? "pointer" : "default",
                    opacity: canDecrement ? 1 : 0.4,
                    borderRight: "none",
                }}
            >−</button>
            <span style={{
                minWidth: "2.5rem",
                textAlign: "center",
                fontWeight: "bold",
                color: ttrpg.colors.gold,
                backgroundColor: ttrpg.colors.cardBg,
                border: `1px solid ${ttrpg.colors.cardBorder}`,
                padding: "0.25rem 0",
                fontFamily: "monospace",
                fontSize: "1rem",
            }}>{value}</span>
            <button
                onClick={() => canIncrement && onChange(value + 1)}
                disabled={!canIncrement}
                style={{
                    ...buttonStyle,
                    borderRadius: `0 ${ttrpg.radius.sm} ${ttrpg.radius.sm} 0`,
                    cursor: canIncrement ? "pointer" : "default",
                    opacity: canIncrement ? 1 : 0.4,
                    borderLeft: "none",
                }}
            >+</button>
        </div>
    )
}
