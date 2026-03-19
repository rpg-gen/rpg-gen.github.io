import DelveCardTag from "../../types/delve_cards/DelveCardTag"
import DelveCardDeck from "../../types/delve_cards/DelveCardDeck"
import { getRarityName } from "../../utility/rarity_utils"
import { filterChipColors } from "../../configs/delve_card_colors"

export type DropdownTab = "tags" | "decks" | "rarities"

interface FilterDropdownPanelProps {
    tags: DelveCardTag[]
    decks: DelveCardDeck[]
    selectedTagIds: string[]
    selectedDeckIds: string[]
    selectedRarities: number[]
    dropdownTab: DropdownTab
    onDropdownTabChange: (tab: DropdownTab) => void
    onToggleTag: (tagId: string) => void
    onToggleDeck: (deckId: string) => void
    onToggleRarity: (rarity: number) => void
    onClose: () => void
}

export default function FilterDropdownPanel({
    tags,
    decks,
    selectedTagIds,
    selectedDeckIds,
    selectedRarities,
    dropdownTab,
    onDropdownTabChange,
    onToggleTag,
    onToggleDeck,
    onToggleRarity,
    onClose
}: FilterDropdownPanelProps) {
    return (
        <div
            data-filter-panel
            style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                border: "1px solid #ccc",
                backgroundColor: "white",
                zIndex: 1000,
                marginTop: "0.25rem",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
            }}
        >
            {/* Tabs */}
            <div style={{
                display: "flex",
                borderBottom: "1px solid #ccc",
                backgroundColor: "#f9f9f9"
            }}>
                <button
                    onClick={() => onDropdownTabChange("decks")}
                    style={{
                        flex: 1,
                        padding: "0.5rem",
                        border: "none",
                        backgroundColor: dropdownTab === "decks" ? "white" : "transparent",
                        borderBottom: dropdownTab === "decks" ? `2px solid ${filterChipColors.deck.border}` : "none",
                        cursor: "pointer",
                        fontWeight: dropdownTab === "decks" ? "bold" : "normal"
                    }}
                >
                    Decks
                </button>
                <button
                    onClick={() => onDropdownTabChange("tags")}
                    style={{
                        flex: 1,
                        padding: "0.5rem",
                        border: "none",
                        backgroundColor: dropdownTab === "tags" ? "white" : "transparent",
                        borderBottom: dropdownTab === "tags" ? `2px solid ${filterChipColors.tag.border}` : "none",
                        cursor: "pointer",
                        fontWeight: dropdownTab === "tags" ? "bold" : "normal"
                    }}
                >
                    Tags
                </button>
                <button
                    onClick={() => onDropdownTabChange("rarities")}
                    style={{
                        flex: 1,
                        padding: "0.5rem",
                        border: "none",
                        backgroundColor: dropdownTab === "rarities" ? "white" : "transparent",
                        borderBottom: dropdownTab === "rarities" ? `2px solid ${filterChipColors.rarity.border}` : "none",
                        cursor: "pointer",
                        fontWeight: dropdownTab === "rarities" ? "bold" : "normal"
                    }}
                >
                    Rarities
                </button>
            </div>

            {/* Tab content */}
            <div style={{
                maxHeight: "250px",
                overflowY: "auto"
            }}>
                {dropdownTab === "decks" && (
                    decks.length === 0 ? (
                        <div style={{ padding: "1rem", color: "#666", textAlign: "center" }}>
                            No decks available
                        </div>
                    ) : (
                        decks.map(deck => (
                            <label key={deck.id} style={{
                                display: "block",
                                padding: "0.5rem",
                                cursor: "pointer",
                                borderBottom: "1px solid #f0f0f0",
                                backgroundColor: selectedDeckIds.includes(deck.id) ? filterChipColors.deck.background : "transparent"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = selectedDeckIds.includes(deck.id) ? filterChipColors.deck.background : "#f5f5f5"}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = selectedDeckIds.includes(deck.id) ? filterChipColors.deck.background : "transparent"}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedDeckIds.includes(deck.id)}
                                    onChange={() => onToggleDeck(deck.id)}
                                    style={{ marginRight: "0.5rem" }}
                                />
                                {deck.name}
                            </label>
                        ))
                    )
                )}

                {dropdownTab === "tags" && (
                    tags.length === 0 ? (
                        <div style={{ padding: "1rem", color: "#666", textAlign: "center" }}>
                            No tags available
                        </div>
                    ) : (
                        tags.map(tag => (
                            <label key={tag.id} style={{
                                display: "block",
                                padding: "0.5rem",
                                cursor: "pointer",
                                borderBottom: "1px solid #f0f0f0",
                                backgroundColor: selectedTagIds.includes(tag.id) ? filterChipColors.tag.background : "transparent"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = selectedTagIds.includes(tag.id) ? filterChipColors.tag.background : "#f5f5f5"}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = selectedTagIds.includes(tag.id) ? filterChipColors.tag.background : "transparent"}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedTagIds.includes(tag.id)}
                                    onChange={() => onToggleTag(tag.id)}
                                    style={{ marginRight: "0.5rem" }}
                                />
                                {tag.name}
                            </label>
                        ))
                    )
                )}

                {dropdownTab === "rarities" && (
                    [5, 4, 3, 2, 1].map(rarity => (
                        <label key={rarity} style={{
                            display: "block",
                            padding: "0.5rem",
                            cursor: "pointer",
                            borderBottom: "1px solid #f0f0f0",
                            backgroundColor: selectedRarities.includes(rarity) ? filterChipColors.rarity.background : "transparent"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = selectedRarities.includes(rarity) ? filterChipColors.rarity.background : "#f5f5f5"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = selectedRarities.includes(rarity) ? filterChipColors.rarity.background : "transparent"}
                        >
                            <input
                                type="checkbox"
                                checked={selectedRarities.includes(rarity)}
                                onChange={() => onToggleRarity(rarity)}
                                style={{ marginRight: "0.5rem" }}
                            />
                            <span style={{ fontWeight: "600" }}>{getRarityName(rarity)}</span> <span style={{ color: "#666" }}>({rarity})</span>
                        </label>
                    ))
                )}
            </div>

            {/* Dropdown footer with close button */}
            <div style={{
                padding: "0.5rem",
                borderTop: "1px solid #ccc",
                backgroundColor: "#f9f9f9",
                display: "flex",
                justifyContent: "flex-end"
            }}>
                <button
                    onClick={onClose}
                    style={{
                        padding: "0.4rem 1rem",
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        backgroundColor: "#4a90e2",
                        color: "white",
                        border: "none",
                        borderRadius: "4px"
                    }}
                >
                    Close
                </button>
            </div>
        </div>
    )
}
