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
import { nav_paths, page_layout } from "../../configs/constants"
import UserContext from "../../contexts/user_context"

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

function getRarityName(rarity: number): string {
    const rarityNames: { [key: number]: string } = {
        1: "Common",
        2: "Uncommon",
        3: "Rare",
        4: "Epic",
        5: "Legendary"
    }
    return rarityNames[rarity] || "Common"
}

export default function CardList() {
    const navigate = useNavigate()
    const location = useLocation()
    const cardsHook = useFirebaseDelveCards()
    const tagsHook = useFirebaseDelveCardTags()
    const decksHook = useFirebaseDelveCardDecks()
    const user_context = useContext(UserContext)

    const [cards, setCards] = useState<DelveCard[]>([])
    const [allCards, setAllCards] = useState<DelveCard[]>([])
    const [tags, setTags] = useState<DelveCardTag[]>([])
    const [decks, setDecks] = useState<DelveCardDeck[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [lastReload, setLastReload] = useState<Date | null>(null)
    const [searchText, setSearchText] = useState("")
    const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
    const [selectedDeckIds, setSelectedDeckIds] = useState<string[]>([])
    const [selectedRarities, setSelectedRarities] = useState<number[]>([])
    const [searchTextFilters, setSearchTextFilters] = useState<string[]>([])

    useEffect(() => {
        // Restore filter state if coming from edit page or random card page
        const state = location.state as { searchText?: string; selectedTagIds?: string[]; selectedDeckIds?: string[]; selectedRarities?: number[]; searchTextFilters?: string[] } | null
        if (state) {
            if (state.searchText !== undefined) setSearchText(state.searchText)
            if (state.selectedTagIds !== undefined) setSelectedTagIds(state.selectedTagIds)
            if (state.selectedDeckIds !== undefined) setSelectedDeckIds(state.selectedDeckIds)
            if (state.selectedRarities !== undefined) setSelectedRarities(state.selectedRarities)
            if (state.searchTextFilters !== undefined) setSearchTextFilters(state.searchTextFilters)
        }
        loadData()
    }, [])

    useEffect(() => {
        filterCards()
    }, [searchText, selectedTagIds, selectedDeckIds, selectedRarities, searchTextFilters, allCards, tags, decks])

    async function loadData() {
        setIsLoading(true)
        try {
            const [loadedCards, loadedTags, loadedDecks] = await Promise.all([
                cardsHook.getAllCards(),
                tagsHook.getAllTags(),
                decksHook.getAllDecks()
            ])
            setAllCards(loadedCards)
            setCards(loadedCards)
            setTags(loadedTags)
            setDecks(loadedDecks)
            setLastReload(new Date())
        } catch (error) {
            console.error("Error loading cards:", error)
        }
        setIsLoading(false)
    }

    function filterCards() {
        let filtered = [...allCards]

        // Text search across effect, description, and tag names (legacy searchText for backward compatibility)
        if (searchText.trim()) {
            const searchLower = searchText.toLowerCase()
            filtered = filtered.filter(card => {
                // Search in title, effect and description
                const textMatch =
                    card.title.toLowerCase().includes(searchLower) ||
                    card.effect.toLowerCase().includes(searchLower) ||
                    card.description.toLowerCase().includes(searchLower)

                // Search in tag names
                const tagMatch = card.tags.some(tagId => {
                    const tag = tags.find(t => t.id === tagId)
                    return tag ? tag.name.toLowerCase().includes(searchLower) : false
                })

                return textMatch || tagMatch
            })
        }

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

        // Tag filter - card must have at least one of the selected tags
        if (selectedTagIds.length > 0) {
            filtered = filtered.filter(card =>
                selectedTagIds.some(tagId => card.tags.includes(tagId))
            )
        }

        // Deck filter - card must have at least one of the selected decks
        if (selectedDeckIds.length > 0) {
            filtered = filtered.filter(card =>
                selectedDeckIds.some(deckId => (card.decks || []).includes(deckId))
            )
        }

        // Rarity filter - card must have one of the selected rarities
        if (selectedRarities.length > 0) {
            filtered = filtered.filter(card =>
                selectedRarities.includes(card.rarity)
            )
        }

        setCards(filtered)
    }

    function handleCreateNew() {
        navigate(nav_paths.delve_card_edit + "/new", {
            state: { searchText, selectedTagIds, selectedDeckIds, selectedRarities, searchTextFilters }
        })
    }

    function handleCardClick(cardId: string) {
        navigate(nav_paths.delve_card_edit + "/" + cardId, {
            state: { searchText, selectedTagIds, selectedDeckIds, selectedRarities, searchTextFilters }
        })
    }

    function clearAllFilters() {
        setSelectedTagIds([])
        setSelectedDeckIds([])
        setSelectedRarities([])
        setSearchTextFilters([])
    }

    if (isLoading) {
        return <FullPageOverlay><div style={page_layout.container}>Loading cards...</div></FullPageOverlay>
    }

    return (
        <FullPageOverlay>
            <div style={page_layout.container}>
                <h1>Delve Cards</h1>

                <div style={{ marginBottom: "1rem" }}>
                    {user_context.is_logged_in && (
                        <>
                            <button onClick={handleCreateNew}>Create New Card</button>
                            <button onClick={() => navigate(nav_paths.delve_card_tags)} style={{ marginLeft: "0.5rem" }}>Manage Tags</button>
                            <button onClick={() => navigate(nav_paths.delve_card_decks)} style={{ marginLeft: "0.5rem" }}>Manage Decks</button>
                        </>
                    )}
                    <button onClick={() => navigate(nav_paths.delve_card_random, {
                        state: { selectedTagIds, selectedDeckIds, selectedRarities, searchTextFilters }
                    })} style={{ marginLeft: user_context.is_logged_in ? "0.5rem" : "0" }}>Random Card</button>
                    <button onClick={loadData} style={{ marginLeft: "0.5rem" }}>Refresh</button>
                    <button onClick={() => navigate("/")} style={{ marginLeft: "0.5rem" }}>Back to Menu</button>
                </div>

                {lastReload && (
                    <div style={{ marginBottom: "1rem", fontSize: "0.9rem", color: "#666" }}>
                        Last reloaded: {lastReload.toLocaleTimeString()}
                    </div>
                )}

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

                <div style={{ marginBottom: "1rem" }}>
                    Showing {cards.length} of {allCards.length} cards
                </div>

                <div style={{ minHeight: "200px" }}>
                    {cards.map(card => {
                        const rarityColors = getRarityColors(card.rarity)
                        return (
                            <div
                                key={card.id}
                                onClick={user_context.is_logged_in ? () => handleCardClick(card.id) : undefined}
                                style={{
                                    border: `3px solid ${rarityColors.border}`,
                                    borderRadius: "12px",
                                    padding: "1rem",
                                    marginBottom: "0.5rem",
                                    cursor: user_context.is_logged_in ? "pointer" : "default",
                                    backgroundColor: rarityColors.background
                                }}
                            >
                                <h3 style={{ margin: "0 0 0.5rem 0" }}>{card.title}</h3>
                                <div style={{ marginBottom: "0.5rem", fontSize: "0.9rem" }}>
                                    <strong>Effect:</strong> {card.effect}
                                </div>
                                <div style={{ fontSize: "0.85rem", color: "#666", marginBottom: "0.25rem" }}>
                                    <strong>Tags:</strong> {card.tags.map(tagId => {
                                        const tag = tags.find(t => t.id === tagId)
                                        return tag ? tag.name : tagId
                                    }).join(", ") || "None"}
                                </div>
                                <div style={{ fontSize: "0.85rem", color: "#666", marginBottom: "0.25rem" }}>
                                    <strong>Decks:</strong> {(card.decks || []).map(deckId => {
                                        const deck = decks.find(d => d.id === deckId)
                                        return deck ? deck.name : deckId
                                    }).join(", ") || "None"}
                                </div>
                                <div style={{ fontSize: "0.85rem", color: "#666" }}>
                                    <strong>Rarity:</strong> {getRarityName(card.rarity)} ({card.rarity})
                                </div>
                            </div>
                        )
                    })}

                    {cards.length === 0 && (
                        <div style={{ textAlign: "center", padding: "2rem", color: "#666" }}>
                            No cards found. {searchText || selectedTagIds.length > 0 || selectedDeckIds.length > 0 || selectedRarities.length > 0 ? "Try adjusting your filters." : "Create your first card!"}
                        </div>
                    )}
                </div>
            </div>
        </FullPageOverlay>
    )
}

