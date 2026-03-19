import { getRarityColors, getRarityName, getRarityIcon } from "../../utility/rarity_utils"

interface RaritySelectorProps {
    rarity: number
    onRarityChange: (rarity: number) => void
}

export default function RaritySelector({ rarity, onRarityChange }: RaritySelectorProps) {
    return (
        <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>
                <strong>Rarity</strong>
            </label>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {[5, 4, 3, 2, 1].map(rarityValue => {
                    const colors = getRarityColors(rarityValue)
                    const isSelected = rarity === rarityValue
                    return (
                        <button
                            key={rarityValue}
                            type="button"
                            onClick={() => onRarityChange(rarityValue)}
                            style={{
                                padding: "0.75rem 1rem",
                                border: `2px solid ${colors.border}`,
                                backgroundColor: isSelected ? colors.background : "white",
                                borderRadius: "8px",
                                cursor: "pointer",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: "0.25rem",
                                minWidth: "90px",
                                fontWeight: isSelected ? "bold" : "normal",
                                boxShadow: isSelected ? `0 0 0 3px ${colors.border}` : "none",
                                opacity: isSelected ? 1 : 0.4,
                                transform: isSelected ? "scale(1.05)" : "scale(1)",
                                transition: "all 0.2s ease"
                            }}
                        >
                            <div style={{ fontSize: "1.5rem" }}>{getRarityIcon(rarityValue)}</div>
                            <div style={{ fontSize: "0.9rem" }}>{getRarityName(rarityValue)}</div>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
