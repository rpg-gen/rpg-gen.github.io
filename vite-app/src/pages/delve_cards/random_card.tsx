import { useState, useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom"
import useFirebaseDelveCards from "../../hooks/delve_cards/use_firebase_delve_cards"
import useFirebaseDelveCardTags from "../../hooks/delve_cards/use_firebase_delve_card_tags"
import useFirebaseDelveCardDecks from "../../hooks/delve_cards/use_firebase_delve_card_decks"
import DelveCard from "../../types/delve_cards/DelveCard"
import DelveCardTag from "../../types/delve_cards/DelveCardTag"
import DelveCardDeck from "../../types/delve_cards/DelveCardDeck"
import FullPageOverlay from "../../components/full_page_overlay"
import DelveCardFilter from "../../components/delve_card_filter"
import { nav_paths } from "../../configs/constants"
import UserContext from "../../contexts/user_context"
import { processCardText } from "../../utility/dice_expression_parser"

function getRarityColors(rarity: number): { border: string; background: string } {
    const colorMap: { [key: number]: { border: string; background: string } } = {
        1: { border: "#757575", background: "#E8E8E8" },      // Common - Gray
        2: { border: "#4CAF50", background: "#E8F5E9" },      // Uncommon - Green
        3: { border: "#2196F3", background: "#E3F2FD" },      // Rare - Blue
        4: { border: "#9C27B0", background: "#F3E5F5" },      // Epic - Purple
        5: { border: "#FF9800", background: "#FFF3E0" }       // Legendary - Orange/Gold
    }
    return colorMap[rarity] || colorMap[1]
}

export default function RandomCard() {
    const navigate = useNavigate()
    const cardsHook = useFirebaseDelveCards()
    const tagsHook = useFirebaseDelveCardTags()
    const decksHook = useFirebaseDelveCardDecks()
    const user_context = useContext(UserContext)

    const [allCards, setAllCards] = useState<DelveCard[]>([])
    const [tags, setTags] = useState<DelveCardTag[]>([])
    const [decks, setDecks] = useState<DelveCardDeck[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
    const [selectedDeckIds, setSelectedDeckIds] = useState<string[]>([])
    const [selectedRarities, setSelectedRarities] = useState<number[]>([])
    const [searchTextFilters, setSearchTextFilters] = useState<string[]>([])
    const [randomCard, setRandomCard] = useState<DelveCard | null>(null)
    const [processedCardText, setProcessedCardText] = useState<{ effect: string; description: string } | null>(null)
    const [isShuffling, setIsShuffling] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        setIsLoading(true)
        try {
            const [loadedCards, loadedTags, loadedDecks] = await Promise.all([
                cardsHook.getAllCards(),
                tagsHook.getAllTags(),
                decksHook.getAllDecks()
            ])
            setAllCards(loadedCards)
            setTags(loadedTags)
            setDecks(loadedDecks)
        } catch (error) {
            console.error("Error loading data:", error)
        }
        setIsLoading(false)
    }

    function getFilteredCards(): DelveCard[] {
        let filtered = allCards

        // Free-form text search filters - each must match
        if (searchTextFilters.length > 0) {
            filtered = filtered.filter(card => {
                return searchTextFilters.every(searchTerm => {
                    const searchLower = searchTerm.toLowerCase()
                    const textMatch =
                        card.title.toLowerCase().includes(searchLower) ||
                        card.effect.toLowerCase().includes(searchLower) ||
                        card.description.toLowerCase().includes(searchLower)

                    const tagMatch = card.tags.some(tagId => {
                        const tag = tags.find(t => t.id === tagId)
                        return tag ? tag.name.toLowerCase().includes(searchLower) : false
                    })

                    return textMatch || tagMatch
                })
            })
        }

        // Filter by tags - card must have at least one of the selected tags
        if (selectedTagIds.length > 0) {
            filtered = filtered.filter(card =>
                selectedTagIds.some(tagId => card.tags.includes(tagId))
            )
        }

        // Filter by decks
        if (selectedDeckIds.length > 0) {
            filtered = filtered.filter(card =>
                selectedDeckIds.some(deckId => (card.decks || []).includes(deckId))
            )
        }

        // Filter by rarities
        if (selectedRarities.length > 0) {
            filtered = filtered.filter(card =>
                selectedRarities.includes(card.rarity)
            )
        }

        return filtered
    }

    function clearAllFilters() {
        setSelectedTagIds([])
        setSelectedDeckIds([])
        setSelectedRarities([])
        setSearchTextFilters([])
    }

    function selectRandomCard() {
        const filteredCards = getFilteredCards()

        if (filteredCards.length === 0) {
            alert("No cards match the selected filters")
            setRandomCard(null)
            return
        }

        // Show shuffling state
        setIsShuffling(true)
        setRandomCard(null)
        setProcessedCardText(null)

        // Wait 1 second before showing the card
        setTimeout(() => {
            // Create weighted pool based on rarity
            // Rarity 1 = weight 5, Rarity 2 = weight 4, ..., Rarity 5 = weight 1
            const weightedPool: DelveCard[] = []
            filteredCards.forEach(card => {
                const weight = 6 - card.rarity // converts rarity 1-5 to weight 5-1
                for (let i = 0; i < weight; i++) {
                    weightedPool.push(card)
                }
            })

            // Select random card from weighted pool
            const randomIndex = Math.floor(Math.random() * weightedPool.length)
            const selectedCard = weightedPool[randomIndex]

            // Process the card text (roll dice, handle variables)
            const processed = processCardText(selectedCard)

            setRandomCard(selectedCard)
            setProcessedCardText(processed)
            setIsShuffling(false)
        }, 1000)
    }

    function getTagName(tagId: string): string {
        const tag = tags.find(t => t.id === tagId)
        return tag ? tag.name : tagId
    }

    function getDeckName(deckId: string): string {
        const deck = decks.find(d => d.id === deckId)
        return deck ? deck.name : deckId
    }

    if (isLoading) {
        return <FullPageOverlay><div>Loading...</div></FullPageOverlay>
    }

    const filteredCount = getFilteredCards().length

    return (
        <FullPageOverlay>
            <div style={{ padding: "1rem", width: "100%", maxWidth: "800px", margin: "0 auto", boxSizing: "border-box", overflowX: "hidden", minHeight: "100vh" }}>
                <h1 style={{ wordWrap: "break-word" }}>Random Card Generator</h1>

                <div style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    <button onClick={() => navigate(nav_paths.delve_card_list)}>
                        Back to Card List
                    </button>
                    <button onClick={() => navigate("/")}>
                        Back to Menu
                    </button>
                </div>

                <DelveCardFilter
                    tags={tags}
                    decks={decks}
                    selectedTagIds={selectedTagIds}
                    selectedDeckIds={selectedDeckIds}
                    selectedRarities={selectedRarities}
                    searchTextFilters={searchTextFilters}
                    onTagsChange={setSelectedTagIds}
                    onDecksChange={setSelectedDeckIds}
                    onRaritiesChange={setSelectedRarities}
                    onSearchTextFiltersChange={setSearchTextFilters}
                    onClearAll={clearAllFilters}
                />

                <div style={{ marginBottom: "1rem", fontSize: "0.9rem", color: "#666", textAlign: "center" }}>
                    {selectedTagIds.length === 0 && selectedDeckIds.length === 0 && selectedRarities.length === 0 && searchTextFilters.length === 0
                        ? `All ${allCards.length} cards available`
                        : `${filteredCount} cards match selected filters`
                    }
                </div>

                <div style={{ marginBottom: "2rem", textAlign: "center" }}>
                    <button
                        onClick={selectRandomCard}
                        style={{ padding: "1rem 2rem", fontSize: "1.2rem" }}
                        disabled={isShuffling}
                    >
                        Get Random Card
                    </button>
                </div>

                {isShuffling && (
                    <div style={{
                        border: "3px solid #757575",
                        borderRadius: "12px",
                        padding: "3rem",
                        backgroundColor: "#E8E8E8",
                        textAlign: "center",
                        fontSize: "1.5rem",
                        fontWeight: "bold",
                        width: "100%",
                        boxSizing: "border-box"
                    }}>
                        Shuffling...
                    </div>
                )}

                {!isShuffling && randomCard && processedCardText && (() => {
                    const rarityColors = getRarityColors(randomCard.rarity)
                    return (
                        <div style={{
                            border: `3px solid ${rarityColors.border}`,
                            borderRadius: "12px",
                            padding: "1.5rem",
                            backgroundColor: rarityColors.background,
                            width: "100%",
                            boxSizing: "border-box",
                            overflowWrap: "break-word"
                        }}>
                            <h2 style={{ marginTop: 0, wordWrap: "break-word" }}>{randomCard.title}</h2>

                        {processedCardText.effect && (
                            <div style={{ marginBottom: "1rem" }}>
                                <strong>Effect:</strong>
                                <div style={{ marginTop: "0.25rem", wordWrap: "break-word" }}>{processedCardText.effect}</div>
                            </div>
                        )}

                        <div style={{ marginBottom: "1rem" }}>
                            <strong>Description:</strong>
                            <div style={{ marginTop: "0.25rem", whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
                                {processedCardText.description || "None"}
                            </div>
                        </div>

                        <div style={{ marginBottom: "1rem", wordWrap: "break-word" }}>
                            <strong>Tags:</strong>{" "}
                            {randomCard.tags.length > 0
                                ? randomCard.tags.map(getTagName).join(", ")
                                : "None"
                            }
                        </div>

                        <div style={{ marginBottom: "1rem", wordWrap: "break-word" }}>
                            <strong>Decks:</strong>{" "}
                            {(randomCard.decks || []).length > 0
                                ? (randomCard.decks || []).map(getDeckName).join(", ")
                                : "None"
                            }
                        </div>

                        <div style={{ marginBottom: "1rem" }}>
                            <strong>Rarity:</strong> {randomCard.rarity}/5
                        </div>

                        {user_context.is_logged_in && (
                            <div>
                                <button onClick={() => navigate(nav_paths.delve_card_edit + "/" + randomCard.id)}>
                                    Edit This Card
                                </button>
                            </div>
                        )}
                        </div>
                    )
                })()}
            </div>
        </FullPageOverlay>
    )
}

