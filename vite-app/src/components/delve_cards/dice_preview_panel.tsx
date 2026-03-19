import { getRarityColors } from "../../utility/rarity_utils"

interface DicePreviewPanelProps {
    rarity: number
    previewText: { effect: string; description: string }
    onRollAgain: () => void
}

export default function DicePreviewPanel({ rarity, previewText, onRollAgain }: DicePreviewPanelProps) {
    const rarityColors = getRarityColors(rarity)

    return (
        <div style={{
            marginBottom: "1rem",
            padding: "1rem",
            border: `3px solid ${rarityColors.border}`,
            backgroundColor: rarityColors.background,
            borderRadius: "12px"
        }}>
            <h3 style={{ marginTop: 0, color: rarityColors.border }}>Preview (Random Roll)</h3>
            <div style={{ fontSize: "0.9rem", marginBottom: "0.5rem", fontStyle: "italic", color: "#666" }}>
                This shows one possible result. Each draw will roll dice randomly.
            </div>

            {previewText.effect && (
                <div style={{ marginBottom: "1rem" }}>
                    <strong>Effect:</strong>
                    <div style={{
                        marginTop: "0.25rem",
                        padding: "0.5rem",
                        backgroundColor: "white",
                        border: "1px solid #ccc",
                        borderRadius: "6px"
                    }}>
                        {previewText.effect}
                    </div>
                </div>
            )}

            <div style={{ marginBottom: "0" }}>
                <strong>Description:</strong>
                <div style={{
                    marginTop: "0.25rem",
                    padding: "0.5rem",
                    backgroundColor: "white",
                    border: "1px solid #ccc",
                    borderRadius: "6px",
                    whiteSpace: "pre-wrap"
                }}>
                    {previewText.description || "None"}
                </div>
            </div>

            <div style={{ marginTop: "0.75rem" }}>
                <button type="button" onClick={onRollAgain} style={{ fontSize: "0.9rem" }}>
                    Roll Again
                </button>
            </div>
        </div>
    )
}
