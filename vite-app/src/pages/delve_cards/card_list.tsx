import { useState, useEffect, useContext } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import useFirebaseDelveCards from "../../hooks/delve_cards/use_firebase_delve_cards"
import useFirebaseDelveCardTags from "../../hooks/delve_cards/use_firebase_delve_card_tags"
import useFirebaseDelveCardDecks from "../../hooks/delve_cards/use_firebase_delve_card_decks"
import DelveCard from "../../types/delve_cards/DelveCard"
import DelveCardTag from "../../types/delve_cards/DelveCardTag"
import DelveCardDeck from "../../types/delve_cards/DelveCardDeck"
import DelveCardNavigationState from "../../types/delve_cards/DelveCardNavigationState"
import FullPageOverlay from "../../components/full_page_overlay"
import DelveCardFilter from "../../components/delve_card_filter"
import { nav_paths, page_layout } from "../../configs/constants"
import UserContext from "../../contexts/user_context"
import DelveCardFilterContext from "../../contexts/delve_card_filter_context"
import { getRarityColors, getRarityName } from "../../utility/rarity_utils"
import { filterCards } from "../../utility/card_filter_utils"

export default function CardList() {
    const navigate = useNavigate()
    const location = useLocation()
    const cardsHook = useFirebaseDelveCards()
    const tagsHook = useFirebaseDelveCardTags()
    const decksHook = useFirebaseDelveCardDecks()
    const user_context = useContext(UserContext)
    const filterContext = useContext(DelveCardFilterContext)!

    const [cards, setCards] = useState<DelveCard[]>([])
    const [allCards, setAllCards] = useState<DelveCard[]>([])
    const [tags, setTags] = useState<DelveCardTag[]>([])
    const [decks, setDecks] = useState<DelveCardDeck[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [lastReload, setLastReload] = useState<Date | null>(null)
    const [searchText, setSearchText] = useState("")
    const [currentIndex, setCurrentIndex] = useState<number>(-1)

    // Get filter state from context
    const {
        selectedTagIds,
        selectedDeckIds,
        selectedRarities,
        searchTextFilters,
        searchDeep,
        setSelectedTagIds,
        setSelectedDeckIds,
        setSelectedRarities,
        setSearchTextFilters,
        setSearchDeep,
        clearAllFilters,
        setDefaultDeckIfNeeded
    } = filterContext

    useEffect(() => {
        async function init() {
            // Navigation state only used for index tracking (not filters)
            const state = location.state as DelveCardNavigationState | null
            if (state) {
                if (state.currentIndex !== undefined) setCurrentIndex(state.currentIndex)
            }

            // Load data
            const { loadedDecks } = await loadData()

            // Check if we should apply default deck (only if no filters are set)
            if (selectedTagIds.length === 0 &&
                selectedDeckIds.length === 0 &&
                selectedRarities.length === 0 &&
                searchTextFilters.length === 0) {

                // Try to find encounters deck in the loaded decks
                const encountersDeck = loadedDecks.find(deck => {
                    const deckNameLower = deck.name.toLowerCase()
                    return deckNameLower === "encounters" ||
                           deckNameLower === "encounter" ||
                           deckNameLower.includes("encounter")
                })

                if (encountersDeck) {
                    setDefaultDeckIfNeeded(encountersDeck.id)
                }
            }
        }

        init()
    }, [])

    useEffect(() => {
        applyFilters()
    }, [searchText, selectedTagIds, selectedDeckIds, selectedRarities, searchTextFilters, allCards, tags, decks, searchDeep])

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
            return { loadedCards, loadedTags, loadedDecks }
        } catch (error) {
            console.error("Error loading cards:", error)
            return { loadedCards: [], loadedTags: [], loadedDecks: [] }
        } finally {
            setIsLoading(false)
        }
    }

    function applyFilters() {
        let filtered = [...allCards]

        // Handle legacy searchText for backward compatibility
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

        // Apply the new filter system
        filtered = filterCards(filtered, {
            searchTextFilters,
            selectedTagIds,
            selectedDeckIds,
            selectedRarities,
            searchDeep,
            tags
        })

        setCards(filtered)
    }

    function handleCreateNew() {
        // Filters are stored globally in localStorage, only pass currentIndex if needed
        navigate(nav_paths.delve_card_edit + "/new", {
            state: { currentIndex }
        })
    }

    function handleCardClick(cardId: string) {
        // Filters are stored globally in localStorage, only pass currentIndex if needed
        navigate(nav_paths.delve_card_edit + "/" + cardId, {
            state: { currentIndex }
        })
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
                        state: { currentIndex }
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
                    searchDeep={searchDeep}
                    onTagsChange={setSelectedTagIds}
                    onDecksChange={setSelectedDeckIds}
                    onRaritiesChange={setSelectedRarities}
                    onSearchTextFiltersChange={setSearchTextFilters}
                    onSearchDeepChange={setSearchDeep}
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

