/**
 * Reusable component for displaying a delve card
 */

import DelveCard from "../types/delve_cards/DelveCard"
import DelveCardTag from "../types/delve_cards/DelveCardTag"
import DelveCardDeck from "../types/delve_cards/DelveCardDeck"
import { getRarityColors, getRarityName } from "../utility/rarity_utils"
import { formatTagNames, formatDeckNames } from "../utility/delve_card_helpers"

interface DelveCardDisplayProps {
    card: DelveCard
    tags: DelveCardTag[]
    decks: DelveCardDeck[]
    onClick?: () => void
    processedText?: {
        effect: string
        description: string
    }
    showFullDescription?: boolean
    style?: React.CSSProperties
}

export default function DelveCardDisplay({
    card,
    tags,
    decks,
    onClick,
    processedText,
    showFullDescription = false,
    style = {}
}: DelveCardDisplayProps) {
    const rarityColors = getRarityColors(card.rarity)
    const effectText = processedText?.effect || card.effect
    const descriptionText = processedText?.description || card.description

    return (
        <div
            onClick={onClick}
            style={{
                border: `3px solid ${rarityColors.border}`,
                borderRadius: "12px",
                padding: "1rem",
                backgroundColor: rarityColors.background,
                cursor: onClick ? "pointer" : "default",
                ...style
            }}
        >
            <h3 style={{ margin: "0 0 0.5rem 0" }}>{card.title}</h3>

            {effectText && (
                <div style={{ marginBottom: "0.5rem", fontSize: "0.9rem" }}>
                    <strong>Effect:</strong> {effectText}
                </div>
            )}

            {showFullDescription && descriptionText && (
                <div style={{ marginBottom: "0.5rem", fontSize: "0.9rem", whiteSpace: "pre-wrap" }}>
                    <strong>Description:</strong>
                    <div style={{ marginTop: "0.25rem" }}>{descriptionText}</div>
                </div>
            )}

            <div style={{ fontSize: "0.85rem", color: "#666", marginBottom: "0.25rem" }}>
                <strong>Tags:</strong> {formatTagNames(card.tags, tags)}
            </div>

            <div style={{ fontSize: "0.85rem", color: "#666", marginBottom: "0.25rem" }}>
                <strong>Decks:</strong> {formatDeckNames(card.decks || [], decks)}
            </div>

            <div style={{ fontSize: "0.85rem", color: "#666" }}>
                <strong>Rarity:</strong> {getRarityName(card.rarity)} ({card.rarity})
            </div>
        </div>
    )
}

