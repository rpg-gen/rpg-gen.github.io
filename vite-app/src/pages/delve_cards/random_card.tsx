import { useState, useEffect, useContext } from "react"
import { useNavigate, useLocation } from "react-router-dom"
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
        5: { border: "#4CAF50", background: "#E8F5E9" },      // Frequent - Light Green
        4: { border: "#2196F3", background: "#E3F2FD" },      // Boosted - Light Blue
        3: { border: "#757575", background: "#E8E8E8" },      // Normal - Grey (default)
        2: { border: "#9C27B0", background: "#F3E5F5" },      // Rare - Purple
        1: { border: "#E53935", background: "#FFEBEE" }       // Lost - Reddish
    }
    return colorMap[rarity] || colorMap[3]
}

export default function RandomCard() {
    const navigate = useNavigate()
    const location = useLocation()
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
    const [currentIndex, setCurrentIndex] = useState<number>(-1)
    const [isUpdatingRarity, setIsUpdatingRarity] = useState(false)
    const [searchDeep, setSearchDeep] = useState(false)

    useEffect(() => {
        // Restore filter state if coming from card list
        const state = location.state as {
            selectedTagIds?: string[];
            selectedDeckIds?: string[];
            selectedRarities?: number[];
            searchTextFilters?: string[];
            currentIndex?: number;
            searchDeep?: boolean;
        } | null
        if (state) {
            if (state.selectedTagIds !== undefined) setSelectedTagIds(state.selectedTagIds)
            if (state.selectedDeckIds !== undefined) setSelectedDeckIds(state.selectedDeckIds)
            if (state.selectedRarities !== undefined) setSelectedRarities(state.selectedRarities)
            if (state.searchTextFilters !== undefined) setSearchTextFilters(state.searchTextFilters)
            if (state.currentIndex !== undefined) setCurrentIndex(state.currentIndex)
            if (state.searchDeep !== undefined) setSearchDeep(state.searchDeep)
        }
        loadData()
    }, [])

    useEffect(() => {
        // Show the card at the current index when data is loaded or filters change
        if (!isLoading && currentIndex >= 0) {
            showCardAtIndex(currentIndex)
        }
    }, [allCards, selectedTagIds, selectedDeckIds, selectedRarities, searchTextFilters, isLoading, searchDeep])

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
                    let textMatch: boolean

                    if (searchDeep) {
                        // Search in title, effect, and description
                        textMatch =
                            card.title.toLowerCase().includes(searchLower) ||
                            card.effect.toLowerCase().includes(searchLower) ||
                            card.description.toLowerCase().includes(searchLower)
                    } else {
                        // Search only in title
                        textMatch = card.title.toLowerCase().includes(searchLower)
                    }

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
        setCurrentIndex(-1)
        setRandomCard(null)
        setProcessedCardText(null)
    }

    function showCardAtIndex(index: number) {
        const filteredCards = getFilteredCards()

        if (filteredCards.length === 0) {
            setRandomCard(null)
            setProcessedCardText(null)
            setCurrentIndex(-1)
            return
        }

        // Ensure index is within bounds
        const validIndex = Math.max(0, Math.min(index, filteredCards.length - 1))
        const card = filteredCards[validIndex]

        // Process the card text (roll dice, handle variables)
        const processed = processCardText(card)

        setRandomCard(card)
        setProcessedCardText(processed)
        setCurrentIndex(validIndex)
    }

    function selectRandomCard() {
        const filteredCards = getFilteredCards()

        if (filteredCards.length === 0) {
            alert("No cards match the selected filters")
            setRandomCard(null)
            setCurrentIndex(-1)
            return
        }

        // Show shuffling state
        setIsShuffling(true)
        setRandomCard(null)
        setProcessedCardText(null)

        // Wait 1 second before showing the card
        setTimeout(() => {
            // Create weighted pool based on rarity
            // Rarity 5 = weight 5, Rarity 4 = weight 4, ..., Rarity 1 = weight 1
            const weightedPool: DelveCard[] = []
            filteredCards.forEach(card => {
                const weight = card.rarity // rarity 1-5 maps directly to weight 1-5
                for (let i = 0; i < weight; i++) {
                    weightedPool.push(card)
                }
            })

            // Select random card from weighted pool
            const randomIndex = Math.floor(Math.random() * weightedPool.length)
            const selectedCard = weightedPool[randomIndex]

            // Find the index of this card in the filtered list
            const cardIndex = filteredCards.findIndex(c => c.id === selectedCard.id)

            // Process the card text (roll dice, handle variables)
            const processed = processCardText(selectedCard)

            setRandomCard(selectedCard)
            setProcessedCardText(processed)
            setCurrentIndex(cardIndex)
            setIsShuffling(false)
        }, 1000)
    }

    function handlePreviousCard() {
        const filteredCards = getFilteredCards()
        if (filteredCards.length === 0) return

        const newIndex = currentIndex <= 0 ? filteredCards.length - 1 : currentIndex - 1
        showCardAtIndex(newIndex)
    }

    function handleNextCard() {
        const filteredCards = getFilteredCards()
        if (filteredCards.length === 0) return

        const newIndex = currentIndex >= filteredCards.length - 1 ? 0 : currentIndex + 1
        showCardAtIndex(newIndex)
    }

    function handleFirstCard() {
        const filteredCards = getFilteredCards()
        if (filteredCards.length === 0) return
        showCardAtIndex(0)
    }

    function handleLastCard() {
        const filteredCards = getFilteredCards()
        if (filteredCards.length === 0) return
        showCardAtIndex(filteredCards.length - 1)
    }

    function getTagName(tagId: string): string {
        const tag = tags.find(t => t.id === tagId)
        return tag ? tag.name : tagId
    }

    function getDeckName(deckId: string): string {
        const deck = decks.find(d => d.id === deckId)
        return deck ? deck.name : deckId
    }

    async function handleRarityChange(newRarity: number) {
        if (!randomCard || isUpdatingRarity) return

        setIsUpdatingRarity(true)
        try {
            await cardsHook.updateCard(randomCard.id, { rarity: newRarity })

            // Update the displayed card with new rarity
            setRandomCard({ ...randomCard, rarity: newRarity })

            // Also update in allCards array
            setAllCards(prev => prev.map(card =>
                card.id === randomCard.id ? { ...card, rarity: newRarity } : card
            ))
        } catch (error) {
            console.error("Error updating rarity:", error)
            alert("Failed to update card rarity")
        }
        setIsUpdatingRarity(false)
    }

    function handleIncreaseRarity() {
        if (!randomCard) return
        const newRarity = randomCard.rarity >= 5 ? 5 : randomCard.rarity + 1
        handleRarityChange(newRarity)
    }

    function handleDecreaseRarity() {
        if (!randomCard) return
        const newRarity = randomCard.rarity <= 1 ? 1 : randomCard.rarity - 1
        handleRarityChange(newRarity)
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
                    <button onClick={() => navigate(nav_paths.delve_card_list, {
                        state: { selectedTagIds, selectedDeckIds, selectedRarities, searchTextFilters, currentIndex, searchDeep }
                    })}>
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
                    searchDeep={searchDeep}
                    onTagsChange={setSelectedTagIds}
                    onDecksChange={setSelectedDeckIds}
                    onRaritiesChange={setSelectedRarities}
                    onSearchTextFiltersChange={setSearchTextFilters}
                    onSearchDeepChange={setSearchDeep}
                    onClearAll={clearAllFilters}
                />

                <div style={{ marginBottom: "1rem", fontSize: "0.9rem", color: "#666", textAlign: "center" }}>
                    {selectedTagIds.length === 0 && selectedDeckIds.length === 0 && selectedRarities.length === 0 && searchTextFilters.length === 0
                        ? `All ${allCards.length} cards available`
                        : `${filteredCount} cards match selected filters`
                    }
                </div>

                <div style={{ marginBottom: "2rem", textAlign: "center" }}>
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                        <button
                            onClick={handleFirstCard}
                            style={{ padding: "0.75rem 1rem", fontSize: "1rem" }}
                            disabled={isShuffling || filteredCount === 0}
                            title="First card"
                        >
                            ⏮ First
                        </button>
                        <button
                            onClick={handlePreviousCard}
                            style={{ padding: "0.75rem 1.5rem", fontSize: "1.2rem" }}
                            disabled={isShuffling || filteredCount === 0}
                            title="Previous card"
                        >
                            ◄
                        </button>
                        <button
                            onClick={selectRandomCard}
                            style={{ padding: "1rem 2rem", fontSize: "1.2rem" }}
                            disabled={isShuffling}
                        >
                            Get Random Card
                        </button>
                        <button
                            onClick={handleNextCard}
                            style={{ padding: "0.75rem 1.5rem", fontSize: "1.2rem" }}
                            disabled={isShuffling || filteredCount === 0}
                            title="Next card"
                        >
                            ►
                        </button>
                        <button
                            onClick={handleLastCard}
                            style={{ padding: "0.75rem 1rem", fontSize: "1rem" }}
                            disabled={isShuffling || filteredCount === 0}
                            title="Last card"
                        >
                            Last ⏭
                        </button>
                    </div>
                    {currentIndex >= 0 && filteredCount > 0 && (
                        <div style={{ marginTop: "0.75rem", fontSize: "1rem", color: "#666", fontWeight: "500" }}>
                            Card {currentIndex + 1} of {filteredCount}
                        </div>
                    )}
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
                            <strong>Rarity:</strong> {(() => {
                                const rarityNames: { [key: number]: string } = {
                                    5: "Frequent",
                                    4: "Boosted",
                                    3: "Normal",
                                    2: "Rare",
                                    1: "Lost"
                                }
                                return rarityNames[randomCard.rarity] || "Normal"
                            })()} ({randomCard.rarity})
                        </div>

                        {user_context.is_logged_in && (
                            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                                <button onClick={() => navigate(nav_paths.delve_card_edit + "/" + randomCard.id, {
                                    state: { selectedTagIds, selectedDeckIds, selectedRarities, searchTextFilters, currentIndex, searchDeep }
                                })}>
                                    Edit This Card
                                </button>
                                <div style={{ display: "flex", gap: "0.25rem", alignItems: "center" }}>
                                    <button
                                        onClick={handleIncreaseRarity}
                                        disabled={isUpdatingRarity || randomCard.rarity >= 5}
                                        title="Increase rarity (make more common)"
                                        style={{
                                            padding: "0.5rem 0.75rem",
                                            fontSize: "1.2rem",
                                            cursor: (isUpdatingRarity || randomCard.rarity >= 5) ? "not-allowed" : "pointer",
                                            opacity: (isUpdatingRarity || randomCard.rarity >= 5) ? 0.5 : 1,
                                            backgroundColor: "#4CAF50",
                                            color: "white",
                                            border: "1px solid #45a049"
                                        }}
                                    >
                                        ▲
                                    </button>
                                    <button
                                        onClick={handleDecreaseRarity}
                                        disabled={isUpdatingRarity || randomCard.rarity <= 1}
                                        title="Decrease rarity (make more rare)"
                                        style={{
                                            padding: "0.5rem 0.75rem",
                                            fontSize: "1.2rem",
                                            cursor: (isUpdatingRarity || randomCard.rarity <= 1) ? "not-allowed" : "pointer",
                                            opacity: (isUpdatingRarity || randomCard.rarity <= 1) ? 0.5 : 1,
                                            backgroundColor: "#E53935",
                                            color: "white",
                                            border: "1px solid #c62828"
                                        }}
                                    >
                                        ▼
                                    </button>
                                </div>
                            </div>
                        )}
                        </div>
                    )
                })()}
            </div>
        </FullPageOverlay>
    )
}

