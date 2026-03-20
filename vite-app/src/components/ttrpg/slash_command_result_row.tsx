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
                borderBottom: "1px solid #f0f0f0",
                backgroundColor: isHighlighted ? "#e8f0fe" : "transparent",
                borderLeft: isHighlighted ? "3px solid #4285f4" : "3px solid transparent"
            }}
        >
            <span style={{
                backgroundColor: labelColor,
                color: "#222",
                padding: "0.1rem 0.4rem",
                borderRadius: "3px",
                fontSize: "0.75rem"
            }}>
                {label}
            </span>
            <span style={{ color: "#222" }}>{name}</span>
            {showEnterHint && (
                <span style={{ marginLeft: "auto", fontSize: "0.7rem", color: "#888" }}>
                    Enter
                </span>
            )}
        </div>
    )
}
