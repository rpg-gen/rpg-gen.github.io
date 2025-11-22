import { useState, useEffect, useContext } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import useDelveCardData from "../../hooks/delve_cards/use_delve_card_data"
import DelveCard from "../../types/delve_cards/DelveCard"
import DelveCardNavigationState from "../../types/delve_cards/DelveCardNavigationState"
import FullPageOverlay from "../../components/full_page_overlay"
import DelveCardFilter from "../../components/delve_card_filter"
import DelveCardDisplay from "../../components/delve_card_display"
import { nav_paths, page_layout } from "../../configs/constants"
import UserContext from "../../contexts/user_context"
import DelveCardFilterContext from "../../contexts/delve_card_filter_context"
import { filterCards } from "../../utility/card_filter_utils"
import { initializeDefaultFilters } from "../../utility/filter_initialization"

export default function CardList() {
    const navigate = useNavigate()
    const location = useLocation()
    const dataHook = useDelveCardData()
    const user_context = useContext(UserContext)
    const filterContext = useContext(DelveCardFilterContext)!

    const [cards, setCards] = useState<DelveCard[]>([])
    const [lastReload, setLastReload] = useState<Date | null>(null)
    const [searchText, setSearchText] = useState("")
    const [currentIndex, setCurrentIndex] = useState<number>(-1)

    const { cards: allCards, tags, decks } = dataHook.data
    const isLoading = dataHook.isLoading

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
            const loadedData = await dataHook.loadAll()
            setLastReload(new Date())

            // Initialize default filters if needed
            initializeDefaultFilters(
                { selectedTagIds, selectedDeckIds, selectedRarities, searchTextFilters },
                loadedData.decks,
                setDefaultDeckIfNeeded
            )
        }

        init()
    }, [])

    useEffect(() => {
        applyFilters()
    }, [searchText, selectedTagIds, selectedDeckIds, selectedRarities, searchTextFilters, allCards, tags, decks, searchDeep])

    async function loadData() {
        await dataHook.loadAll()
        setLastReload(new Date())
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
                    {cards.map(card => (
                        <DelveCardDisplay
                            key={card.id}
                            card={card}
                            tags={tags}
                            decks={decks}
                            onClick={user_context.is_logged_in ? () => handleCardClick(card.id) : undefined}
                            style={{ marginBottom: "0.5rem" }}
                        />
                    ))}

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

