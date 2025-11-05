import { useState, useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom"
import useFirebaseDelveCards from "../../hooks/delve_cards/use_firebase_delve_cards"
import useFirebaseDelveCardTags from "../../hooks/delve_cards/use_firebase_delve_card_tags"
import DelveCard from "../../types/delve_cards/DelveCard"
import DelveCardTag from "../../types/delve_cards/DelveCardTag"
import FullPageOverlay from "../../components/full_page_overlay"
import { nav_paths } from "../../configs/constants"
import UserContext from "../../contexts/user_context"
import { processCardText } from "../../utility/dice_expression_parser"

export default function RandomCard() {
    const navigate = useNavigate()
    const cardsHook = useFirebaseDelveCards()
    const tagsHook = useFirebaseDelveCardTags()
    const user_context = useContext(UserContext)

    const [allCards, setAllCards] = useState<DelveCard[]>([])
    const [tags, setTags] = useState<DelveCardTag[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
    const [isExclusive, setIsExclusive] = useState(false)
    const [randomCard, setRandomCard] = useState<DelveCard | null>(null)
    const [processedCardText, setProcessedCardText] = useState<{ effect: string; description: string } | null>(null)
    const [isShuffling, setIsShuffling] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        setIsLoading(true)
        try {
            const [loadedCards, loadedTags] = await Promise.all([
                cardsHook.getAllCards(),
                tagsHook.getAllTags()
            ])
            setAllCards(loadedCards)
            setTags(loadedTags)
        } catch (error) {
            console.error("Error loading data:", error)
        }
        setIsLoading(false)
    }

    function toggleTag(tagId: string) {
        if (selectedTagIds.includes(tagId)) {
            setSelectedTagIds(selectedTagIds.filter(t => t !== tagId))
        } else {
            setSelectedTagIds([...selectedTagIds, tagId])
        }
    }

    function getFilteredCards(): DelveCard[] {
        if (selectedTagIds.length === 0) {
            return allCards
        }

        if (isExclusive) {
            // Card must have ALL selected tags
            return allCards.filter(card =>
                selectedTagIds.every(tagId => card.tags.includes(tagId))
            )
        } else {
            // Card must have ANY of the selected tags
            return allCards.filter(card =>
                selectedTagIds.some(tagId => card.tags.includes(tagId))
            )
        }
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

    if (isLoading) {
        return <FullPageOverlay><div>Loading...</div></FullPageOverlay>
    }

    const filteredCount = getFilteredCards().length

    return (
        <FullPageOverlay>
            <div style={{ padding: "1rem", width: "100%", maxWidth: "800px", margin: "0 auto", boxSizing: "border-box", overflowX: "hidden" }}>
                <h1 style={{ wordWrap: "break-word" }}>Random Card Generator</h1>

                <div style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    <button onClick={() => navigate(nav_paths.delve_card_list)}>
                        Back to Card List
                    </button>
                    <button onClick={() => navigate("/")}>
                        Back to Menu
                    </button>
                </div>

                <div style={{ marginBottom: "2rem", padding: "1rem", border: "1px solid #ccc", backgroundColor: "#f9f9f9" }}>
                    <h3 style={{ marginTop: 0 }}>Filter by Tags</h3>

                    <div style={{ marginBottom: "1rem" }}>
                        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                            <span>Mode:</span>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                value={isExclusive ? 1 : 0}
                                onChange={(e) => setIsExclusive(e.target.value === "1")}
                                style={{ width: "100px" }}
                            />
                            <strong style={{ wordBreak: "break-word" }}>{isExclusive ? "Exclusive (ALL tags)" : "Inclusive (ANY tag)"}</strong>
                        </label>
                    </div>

                    <div style={{ border: "1px solid #ccc", padding: "0.5rem", maxHeight: "200px", overflowY: "auto", backgroundColor: "white" }}>
                        {tags.length === 0 ? (
                            <div style={{ color: "#666" }}>No tags available</div>
                        ) : (
                            tags.map(tag => (
                                <label key={tag.id} style={{ display: "block", marginBottom: "0.25rem" }}>
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

                    <div style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: "#666" }}>
                        {selectedTagIds.length === 0
                            ? `All ${allCards.length} cards available`
                            : `${filteredCount} cards match selected filters`
                        }
                    </div>
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
                        border: "2px solid #333",
                        padding: "3rem",
                        backgroundColor: "#fff",
                        textAlign: "center",
                        fontSize: "1.5rem",
                        fontWeight: "bold",
                        width: "100%",
                        boxSizing: "border-box"
                    }}>
                        Shuffling...
                    </div>
                )}

                {!isShuffling && randomCard && processedCardText && (
                    <div style={{
                        border: "2px solid #333",
                        padding: "1.5rem",
                        backgroundColor: "#fff",
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
                )}
            </div>
        </FullPageOverlay>
    )
}

