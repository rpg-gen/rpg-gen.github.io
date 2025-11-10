import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import useFirebaseDelveCardDecks from "../../hooks/delve_cards/use_firebase_delve_card_decks"
import useFirebaseDelveCards from "../../hooks/delve_cards/use_firebase_delve_cards"
import DelveCardDeck from "../../types/delve_cards/DelveCardDeck"
import DelveCard from "../../types/delve_cards/DelveCard"
import FullPageOverlay from "../../components/full_page_overlay"
import { nav_paths } from "../../configs/constants"

export default function DeckManagement() {
    const navigate = useNavigate()
    const location = useLocation()
    const decksHook = useFirebaseDelveCardDecks()
    const cardsHook = useFirebaseDelveCards()

    const [decks, setDecks] = useState<DelveCardDeck[]>([])
    const [cards, setCards] = useState<DelveCard[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [editingDeckId, setEditingDeckId] = useState<string | null>(null)
    const [editingDeckName, setEditingDeckName] = useState("")
    const [newDeckName, setNewDeckName] = useState("")

    const returnPath = (location.state as { returnPath?: string })?.returnPath || nav_paths.delve_card_list

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        setIsLoading(true)
        try {
            const [loadedDecks, loadedCards] = await Promise.all([
                decksHook.getAllDecks(),
                cardsHook.getAllCards()
            ])
            setDecks(loadedDecks)
            setCards(loadedCards)
        } catch (error) {
            console.error("Error loading decks:", error)
        }
        setIsLoading(false)
    }

    async function handleCreateDeck() {
        if (!newDeckName.trim()) {
            alert("Deck name is required")
            return
        }

        try {
            await decksHook.createDeck({ name: newDeckName.trim() })
            setNewDeckName("")
            await loadData()
        } catch (error) {
            console.error("Error creating deck:", error)
            alert("Error creating deck")
        }
    }

    async function handleUpdateDeck(deckId: string) {
        if (!editingDeckName.trim()) {
            alert("Deck name is required")
            return
        }

        try {
            await decksHook.updateDeck(deckId, { name: editingDeckName.trim() })
            setEditingDeckId(null)
            setEditingDeckName("")
            await loadData()
        } catch (error) {
            console.error("Error updating deck:", error)
            alert("Error updating deck")
        }
    }

    async function handleDeleteDeck(deckId: string, deckName: string) {
        const cardsInDeck = cards.filter(card => card.decks.includes(deckId))

        if (cardsInDeck.length > 0) {
            const confirmMessage = `This deck contains ${cardsInDeck.length} card(s). Deleting the deck will remove these cards from the deck but not delete the cards themselves. Continue?`
            if (!confirm(confirmMessage)) {
                return
            }
        } else {
            if (!confirm(`Are you sure you want to delete the deck "${deckName}"?`)) {
                return
            }
        }

        try {
            // Remove this deck from all cards
            if (cardsInDeck.length > 0) {
                await Promise.all(
                    cardsInDeck.map(card =>
                        cardsHook.updateCard(card.id, {
                            decks: card.decks.filter(d => d !== deckId)
                        })
                    )
                )
            }

            await decksHook.deleteDeck(deckId)
            await loadData()
        } catch (error) {
            console.error("Error deleting deck:", error)
            alert("Error deleting deck")
        }
    }

    function startEditing(deck: DelveCardDeck) {
        setEditingDeckId(deck.id)
        setEditingDeckName(deck.name)
    }

    function cancelEditing() {
        setEditingDeckId(null)
        setEditingDeckName("")
    }

    function getCardCountForDeck(deckId: string): number {
        return cards.filter(card => card.decks.includes(deckId)).length
    }

    if (isLoading) {
        return <FullPageOverlay><div>Loading...</div></FullPageOverlay>
    }

    return (
        <FullPageOverlay>
            <div style={{ padding: "1rem", maxWidth: "800px", margin: "0 auto" }}>
                <h1>Manage Decks</h1>

                <div style={{ marginBottom: "1rem" }}>
                    <button onClick={() => navigate(returnPath)}>
                        Back
                    </button>
                </div>

                <div style={{ marginBottom: "2rem", padding: "1rem", backgroundColor: "#f0f0f0", borderRadius: "4px" }}>
                    <h3 style={{ marginTop: 0 }}>Create New Deck</h3>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                        <input
                            type="text"
                            value={newDeckName}
                            onChange={(e) => setNewDeckName(e.target.value)}
                            placeholder="Enter deck name"
                            style={{ flex: 1, padding: "0.5rem" }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleCreateDeck()
                                }
                            }}
                        />
                        <button onClick={handleCreateDeck}>Create</button>
                    </div>
                </div>

                <h3>Existing Decks ({decks.length})</h3>

                {decks.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "2rem", color: "#666" }}>
                        No decks yet. Create your first deck above!
                    </div>
                ) : (
                    <div>
                        {decks.map(deck => (
                            <div
                                key={deck.id}
                                style={{
                                    border: "1px solid #ccc",
                                    padding: "1rem",
                                    marginBottom: "0.5rem",
                                    backgroundColor: "#f9f9f9",
                                    borderRadius: "4px"
                                }}
                            >
                                {editingDeckId === deck.id ? (
                                    <div>
                                        <div style={{ marginBottom: "0.5rem" }}>
                                            <input
                                                type="text"
                                                value={editingDeckName}
                                                onChange={(e) => setEditingDeckName(e.target.value)}
                                                style={{ width: "100%", padding: "0.5rem" }}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        handleUpdateDeck(deck.id)
                                                    } else if (e.key === "Escape") {
                                                        cancelEditing()
                                                    }
                                                }}
                                                autoFocus
                                            />
                                        </div>
                                        <button onClick={() => handleUpdateDeck(deck.id)}>
                                            Save
                                        </button>
                                        <button onClick={cancelEditing} style={{ marginLeft: "0.5rem" }}>
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <div>
                                            <h3 style={{ margin: "0 0 0.25rem 0" }}>{deck.name}</h3>
                                            <div style={{ fontSize: "0.85rem", color: "#666" }}>
                                                {getCardCountForDeck(deck.id)} card(s)
                                            </div>
                                        </div>
                                        <div>
                                            <button onClick={() => startEditing(deck)}>
                                                Rename
                                            </button>
                                            <button
                                                onClick={() => handleDeleteDeck(deck.id, deck.name)}
                                                style={{ marginLeft: "0.5rem" }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </FullPageOverlay>
    )
}

