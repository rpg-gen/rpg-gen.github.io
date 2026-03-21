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

    return (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ minWidth: "6rem" }}>{label}</span>
            <button
                onClick={() => canDecrement && onChange(value - 1)}
                disabled={!canDecrement}
                style={{ width: "2rem", fontSize: "1rem", cursor: canDecrement ? "pointer" : "default" }}
            >−</button>
            <span style={{ minWidth: "2rem", textAlign: "center", fontWeight: "bold" }}>{value}</span>
            <button
                onClick={() => canIncrement && onChange(value + 1)}
                disabled={!canIncrement}
                style={{ width: "2rem", fontSize: "1rem", cursor: canIncrement ? "pointer" : "default" }}
            >+</button>
        </div>
    )
}
