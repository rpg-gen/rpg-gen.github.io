import { filterChipColors } from "../../configs/delve_card_colors"

type FilterChipColorKey = keyof typeof filterChipColors

interface FilterChipProps {
    label: string
    colorKey: FilterChipColorKey
    onRemove: () => void
}

export default function FilterChip({ label, colorKey, onRemove }: FilterChipProps) {
    const colors = filterChipColors[colorKey]

    return (
        <span
            onClick={onRemove}
            style={{
                border: `1px solid ${colors.border}`,
                borderRadius: "4px",
                padding: "0.2rem 0.5rem",
                fontSize: "0.85rem",
                backgroundColor: colors.background,
                display: "inline-flex",
                alignItems: "center",
                gap: "0.3rem",
                cursor: "pointer"
            }}
        >
            <span style={{
                fontWeight: "600",
                color: colors.border
            }}>
                {colors.prefix}
            </span>
            {" "}{label}
            <span style={{
                fontWeight: "bold",
                fontSize: "1rem"
            }}>
                &times;
            </span>
        </span>
    )
}
