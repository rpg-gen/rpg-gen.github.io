import { useState, useEffect, useContext } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import useFirebaseDelveCards from "../../hooks/delve_cards/use_firebase_delve_cards"
import useFirebaseDelveCardTags from "../../hooks/delve_cards/use_firebase_delve_card_tags"
import DelveCard from "../../types/delve_cards/DelveCard"
import DelveCardTag from "../../types/delve_cards/DelveCardTag"
import FullPageOverlay from "../../components/full_page_overlay"
import { nav_paths } from "../../configs/constants"
import UserContext from "../../contexts/user_context"

export default function CardList() {
    const navigate = useNavigate()
    const location = useLocation()
    const cardsHook = useFirebaseDelveCards()
    const tagsHook = useFirebaseDelveCardTags()
    const user_context = useContext(UserContext)

    const [cards, setCards] = useState<DelveCard[]>([])
    const [allCards, setAllCards] = useState<DelveCard[]>([])
    const [tags, setTags] = useState<DelveCardTag[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [lastReload, setLastReload] = useState<Date | null>(null)
    const [searchText, setSearchText] = useState("")
    const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
    const [selectedRarities, setSelectedRarities] = useState<number[]>([])

    useEffect(() => {
        // Restore filter state if coming from edit page
        const state = location.state as { searchText?: string; selectedTagIds?: string[]; selectedRarities?: number[] } | null
        if (state) {
            if (state.searchText !== undefined) setSearchText(state.searchText)
            if (state.selectedTagIds !== undefined) setSelectedTagIds(state.selectedTagIds)
            if (state.selectedRarities !== undefined) setSelectedRarities(state.selectedRarities)
        }
        loadData()
    }, [])

    useEffect(() => {
        filterCards()
    }, [searchText, selectedTagIds, selectedRarities, allCards, tags])

    async function loadData() {
        setIsLoading(true)
        try {
            const [loadedCards, loadedTags] = await Promise.all([
                cardsHook.getAllCards(),
                tagsHook.getAllTags()
            ])
            setAllCards(loadedCards)
            setCards(loadedCards)
            setTags(loadedTags)
            setLastReload(new Date())
        } catch (error) {
            console.error("Error loading cards:", error)
        }
        setIsLoading(false)
    }

    function filterCards() {
        let filtered = [...allCards]

        // Text search across effect, description, and tag names
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

        // Tag filter - card must have at least one of the selected tags
        if (selectedTagIds.length > 0) {
            filtered = filtered.filter(card =>
                selectedTagIds.some(tagId => card.tags.includes(tagId))
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
            state: { searchText, selectedTagIds, selectedRarities }
        })
    }

    function handleCardClick(cardId: string) {
        navigate(nav_paths.delve_card_edit + "/" + cardId, {
            state: { searchText, selectedTagIds, selectedRarities }
        })
    }

    function toggleTag(tagId: string) {
        if (selectedTagIds.includes(tagId)) {
            setSelectedTagIds(selectedTagIds.filter(id => id !== tagId))
        } else {
            setSelectedTagIds([...selectedTagIds, tagId])
        }
    }

    function toggleRarity(rarity: number) {
        if (selectedRarities.includes(rarity)) {
            setSelectedRarities(selectedRarities.filter(r => r !== rarity))
        } else {
            setSelectedRarities([...selectedRarities, rarity])
        }
    }

    if (isLoading) {
        return <FullPageOverlay><div>Loading cards...</div></FullPageOverlay>
    }

    return (
        <FullPageOverlay>
            <div style={{ padding: "1rem", width: "100%", maxWidth: "800px", margin: "0 auto", boxSizing: "border-box" }}>
                <h1>Delve Cards</h1>

                <div style={{ marginBottom: "1rem" }}>
                    {user_context.is_logged_in && (
                        <>
                            <button onClick={handleCreateNew}>Create New Card</button>
                            <button onClick={() => navigate(nav_paths.delve_card_tags)} style={{ marginLeft: "0.5rem" }}>Manage Tags</button>
                        </>
                    )}
                    <button onClick={() => navigate(nav_paths.delve_card_random)} style={{ marginLeft: user_context.is_logged_in ? "0.5rem" : "0" }}>Random Card</button>
                    <button onClick={loadData} style={{ marginLeft: "0.5rem" }}>Refresh</button>
                    <button onClick={() => navigate("/")} style={{ marginLeft: "0.5rem" }}>Back to Menu</button>
                </div>

                {lastReload && (
                    <div style={{ marginBottom: "1rem", fontSize: "0.9rem", color: "#666" }}>
                        Last reloaded: {lastReload.toLocaleTimeString()}
                    </div>
                )}

                <div style={{ marginBottom: "1rem" }}>
                    <input
                        type="text"
                        placeholder="Search title, effect, description, tags..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem" }}
                    />

                    <div style={{ marginTop: "0.5rem" }}>
                        <strong style={{ display: "block", marginBottom: "0.5rem" }}>
                            Filter by Tags {selectedTagIds.length > 0 && `(${selectedTagIds.length} selected)`}
                        </strong>
                        <div style={{
                            border: "1px solid #ccc",
                            padding: "0.5rem",
                            maxHeight: "150px",
                            overflowY: "auto",
                            backgroundColor: "white"
                        }}>
                            {tags.length === 0 ? (
                                <div style={{ color: "#666" }}>No tags available</div>
                            ) : (
                                tags.map(tag => (
                                    <label key={tag.id} style={{ display: "block", marginBottom: "0.25rem", cursor: "pointer" }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedTagIds.includes(tag.id)}
                                            onChange={() => toggleTag(tag.id)}
                                            style={{ marginRight: "0.5rem" }}
                                        />
                                        {tag.name}
                                    </label>
                                ))
                            )}
                        </div>
                        {selectedTagIds.length > 0 && (
                            <button
                                onClick={() => setSelectedTagIds([])}
                                style={{ marginTop: "0.5rem", fontSize: "0.85rem" }}
                            >
                                Clear Tag Filters
                            </button>
                        )}
                    </div>

                    <div style={{ marginTop: "1rem" }}>
                        <strong style={{ display: "block", marginBottom: "0.5rem" }}>
                            Filter by Rarity {selectedRarities.length > 0 && `(${selectedRarities.length} selected)`}
                        </strong>
                        <div style={{
                            border: "1px solid #ccc",
                            padding: "0.5rem",
                            maxHeight: "150px",
                            overflowY: "auto",
                            backgroundColor: "white"
                        }}>
                            {[1, 2, 3, 4, 5].map(rarity => (
                                <label key={rarity} style={{ display: "block", marginBottom: "0.25rem", cursor: "pointer" }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedRarities.includes(rarity)}
                                        onChange={() => toggleRarity(rarity)}
                                        style={{ marginRight: "0.5rem" }}
                                    />
                                    {rarity} - {rarity === 1 ? "Most Common" : rarity === 5 ? "Most Rare" : ""}
                                </label>
                            ))}
                        </div>
                        {selectedRarities.length > 0 && (
                            <button
                                onClick={() => setSelectedRarities([])}
                                style={{ marginTop: "0.5rem", fontSize: "0.85rem" }}
                            >
                                Clear Rarity Filters
                            </button>
                        )}
                    </div>
                </div>

                <div style={{ marginBottom: "1rem" }}>
                    Showing {cards.length} of {allCards.length} cards
                </div>

                <div style={{ minHeight: "200px" }}>
                    {cards.map(card => (
                        <div
                            key={card.id}
                            onClick={user_context.is_logged_in ? () => handleCardClick(card.id) : undefined}
                            style={{
                                border: "1px solid #ccc",
                                padding: "1rem",
                                marginBottom: "0.5rem",
                                cursor: user_context.is_logged_in ? "pointer" : "default",
                                backgroundColor: "#f9f9f9"
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
                            <div style={{ fontSize: "0.85rem", color: "#666" }}>
                                <strong>Rarity:</strong> {card.rarity}/5
                            </div>
                        </div>
                    ))}

                    {cards.length === 0 && (
                        <div style={{ textAlign: "center", padding: "2rem", color: "#666" }}>
                            No cards found. {searchText || selectedTagIds.length > 0 || selectedRarities.length > 0 ? "Try adjusting your filters." : "Create your first card!"}
                        </div>
                    )}
                </div>
            </div>
        </FullPageOverlay>
    )
}

