import { useState, useEffect } from "react"
import { useNavigate, useParams, useLocation } from "react-router-dom"
import useFirebaseDelveCards from "../../hooks/delve_cards/use_firebase_delve_cards"
import useFirebaseDelveCardTags from "../../hooks/delve_cards/use_firebase_delve_card_tags"
import useFirebaseDelveCardDecks from "../../hooks/delve_cards/use_firebase_delve_card_decks"
import DelveCard from "../../types/delve_cards/DelveCard"
import DelveCardTag from "../../types/delve_cards/DelveCardTag"
import DelveCardDeck from "../../types/delve_cards/DelveCardDeck"
import FullPageOverlay from "../../components/full_page_overlay"
import ChipSelector from "../../components/delve_card_chip_selector"
import { nav_paths, page_layout } from "../../configs/constants"
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

const RARITY_OPTIONS = [
    { id: "1", name: "Common (1)" },
    { id: "2", name: "Uncommon (2)" },
    { id: "3", name: "Rare (3)" },
    { id: "4", name: "Epic (4)" },
    { id: "5", name: "Legendary (5)" }
]

export default function CardEdit() {
    const navigate = useNavigate()
    const location = useLocation()
    const { cardId } = useParams<{ cardId: string }>()
    const cardsHook = useFirebaseDelveCards()
    const tagsHook = useFirebaseDelveCardTags()
    const decksHook = useFirebaseDelveCardDecks()

    const isNewCard = cardId === "new"

    // Store filter state to preserve when returning to card list, and use selectedDeckIds for pre-populating new cards
    const returnState = location.state as { searchText?: string; selectedTagIds?: string[]; selectedDeckIds?: string[]; selectedRarities?: number[]; searchTextFilters?: string[] } | null

    const [isLoading, setIsLoading] = useState(!isNewCard)
    const [isSaving, setIsSaving] = useState(false)
    const [availableTags, setAvailableTags] = useState<DelveCardTag[]>([])
    const [availableDecks, setAvailableDecks] = useState<DelveCardDeck[]>([])
    const [draftSaved, setDraftSaved] = useState(false)
    const [initialLoadComplete, setInitialLoadComplete] = useState(false)

    const [title, setTitle] = useState("")
    const [effect, setEffect] = useState("")
    const [description, setDescription] = useState("")
    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const [selectedDecks, setSelectedDecks] = useState<string[]>([])
    const [rarity, setRarity] = useState(1)
    const [showPreview, setShowPreview] = useState(false)
    const [previewText, setPreviewText] = useState<{ effect: string; description: string } | null>(null)
    const [showSyntaxHelp, setShowSyntaxHelp] = useState(false)

    const draftKey = `delve-card-draft-${cardId}`

    useEffect(() => {
        loadData()
    }, [])

    // Auto-save draft to localStorage (but not during initial load)
    useEffect(() => {
        if (!isLoading && initialLoadComplete) {
            const draftData = {
                title,
                effect,
                description,
                selectedTags,
                selectedDecks,
                rarity
            }
            localStorage.setItem(draftKey, JSON.stringify(draftData))
            setDraftSaved(true)
            const timer = setTimeout(() => setDraftSaved(false), 1000)
            return () => clearTimeout(timer)
        }
    // }, [title, effect, description, selectedTags, selectedDecks, rarity, isLoading, initialLoadComplete])
    }, [title, effect, description, selectedTags, selectedDecks, rarity])

    async function loadData() {
        try {
            const [tags, decks] = await Promise.all([
                tagsHook.getAllTags(),
                decksHook.getAllDecks()
            ])
            setAvailableTags(tags)
            setAvailableDecks(decks)

            // Try to load draft first
            const savedDraft = localStorage.getItem(draftKey)
            let draftData = null
            if (savedDraft) {
                try {
                    draftData = JSON.parse(savedDraft)
                } catch (e) {
                    console.error("Error parsing draft:", e)
                }
            }

            if (!isNewCard && cardId) {
                const card = await cardsHook.getCard(cardId)
                if (card) {
                    // If there's a draft, ask user if they want to restore it
                    if (draftData && (
                        draftData.title !== card.title ||
                        draftData.effect !== card.effect ||
                        draftData.description !== card.description ||
                        JSON.stringify(draftData.selectedTags) !== JSON.stringify(card.tags) ||
                        JSON.stringify(draftData.selectedDecks) !== JSON.stringify(card.decks) ||
                        draftData.rarity !== card.rarity
                    )) {
                        if (confirm("You have unsaved changes. Do you want to restore them?")) {
                            setTitle(draftData.title)
                            setEffect(draftData.effect)
                            setDescription(draftData.description)
                            setSelectedTags(draftData.selectedTags)
                            setSelectedDecks(draftData.selectedDecks || [])
                            setRarity(draftData.rarity)
                        } else {
                            // Load from server
                            setTitle(card.title)
                            setEffect(card.effect)
                            setDescription(card.description)
                            setSelectedTags(card.tags)
                            setSelectedDecks(card.decks || [])
                            setRarity(card.rarity)
                            localStorage.removeItem(draftKey)
                        }
                    } else {
                        // Load from server
                        setTitle(card.title)
                        setEffect(card.effect)
                        setDescription(card.description)
                        setSelectedTags(card.tags)
                        setSelectedDecks(card.decks || [])
                        setRarity(card.rarity)
                    }
                }
            } else if (isNewCard) {
                if (draftData) {
                    // For new cards, restore draft if available
                    setTitle(draftData.title)
                    setEffect(draftData.effect)
                    setDescription(draftData.description)
                    setSelectedTags(draftData.selectedTags)
                    setSelectedDecks(draftData.selectedDecks || [])
                    setRarity(draftData.rarity)
                } else if (returnState?.selectedDeckIds && returnState.selectedDeckIds.length > 0) {
                    // If no draft, but coming from card list with decks selected, auto-populate those decks
                    setSelectedDecks(returnState.selectedDeckIds)
                }
            }
        } catch (error) {
            console.error("Error loading data:", error)
        }
        setIsLoading(false)
        setInitialLoadComplete(true)
    }

    async function handleSave(closeAfterSave: boolean = false) {
        if (!title.trim()) {
            alert("Title is required")
            return
        }

        setIsSaving(true)
        try {
            const cardData: Omit<DelveCard, 'id'> = {
                title: title.trim(),
                effect: effect.trim(),
                description: description.trim(),
                tags: selectedTags,
                decks: selectedDecks,
                rarity
            }

            if (isNewCard) {
                const newId = await cardsHook.createCard(cardData)
                localStorage.removeItem(draftKey)
                if (closeAfterSave) {
                    navigate(nav_paths.delve_card_list, { state: returnState })
                } else {
                    navigate(nav_paths.delve_card_edit + "/" + newId, { state: returnState })
                }
            } else if (cardId) {
                await cardsHook.updateCard(cardId, cardData)
                localStorage.removeItem(draftKey)
                if (closeAfterSave) {
                    navigate(nav_paths.delve_card_list, { state: returnState })
                }
            }
        } catch (error) {
            console.error("Error saving card:", error)
            alert("Error saving card")
        }
        setIsSaving(false)
    }

    async function handleSaveAndAddAnother() {
        if (!title.trim()) {
            alert("Title is required")
            return
        }

        setIsSaving(true)
        try {
            const cardData: Omit<DelveCard, 'id'> = {
                title: title.trim(),
                effect: effect.trim(),
                description: description.trim(),
                tags: selectedTags,
                decks: selectedDecks,
                rarity
            }

            await cardsHook.createCard(cardData)

            // Store the decks we want to keep selected
            const decksToKeep = selectedDecks

            // Clear the form for a new card
            localStorage.removeItem(draftKey)
            setTitle("")
            setEffect("")
            setDescription("")
            setSelectedTags([])
            setRarity(1)

            // Keep the same decks selected
            setSelectedDecks(decksToKeep)
        } catch (error) {
            console.error("Error saving card:", error)
            alert("Error saving card")
        }
        setIsSaving(false)
    }

    async function handleDelete() {
        if (!cardId || isNewCard) return

        if (confirm("Are you sure you want to delete this card?")) {
            try {
                await cardsHook.deleteCard(cardId)
                localStorage.removeItem(draftKey)
                navigate(nav_paths.delve_card_list, { state: returnState })
            } catch (error) {
                console.error("Error deleting card:", error)
                alert("Error deleting card")
            }
        }
    }

    function handleDiscard() {
        if (confirm("Are you sure you want to discard all unsaved changes?")) {
            localStorage.removeItem(draftKey)
            if (isNewCard) {
                navigate(nav_paths.delve_card_list, { state: returnState })
            } else {
                setInitialLoadComplete(false)
                loadData()
            }
        }
    }


    function handlePreview() {
        const processed = processCardText(effect, description)
        setPreviewText(processed)
        setShowPreview(true)
    }

    if (isLoading) {
        return <FullPageOverlay><div>Loading...</div></FullPageOverlay>
    }

    return (
        <FullPageOverlay>
            <div style={page_layout.container}>
                <h1>{isNewCard ? "Create New Card" : "Edit Card"}</h1>

                <div style={{
                    marginBottom: "0.5rem",
                    fontSize: "0.85rem",
                    color: "#666",
                    fontStyle: "italic",
                    minHeight: "1.2em",
                    visibility: draftSaved ? "visible" : "hidden"
                }}>
                    Draft saved!
                </div>

                <div style={{ marginBottom: "1rem" }}>
                    <button onClick={() => handleSave(false)} disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save"}
                    </button>
                    <button onClick={() => handleSave(true)} disabled={isSaving} style={{ marginLeft: "0.5rem" }}>
                        {isSaving ? "Saving..." : "Save & Close"}
                    </button>
                    {isNewCard && (
                        <button onClick={handleSaveAndAddAnother} disabled={isSaving} style={{ marginLeft: "0.5rem" }}>
                            {isSaving ? "Saving..." : "Save & Add Another"}
                        </button>
                    )}
                    {!isNewCard && (
                        <button onClick={handleDelete} style={{ marginLeft: "0.5rem" }}>
                            Delete
                        </button>
                    )}
                    <button onClick={handleDiscard} style={{ marginLeft: "0.5rem" }}>
                        Discard Changes
                    </button>
                    <button onClick={() => navigate(nav_paths.delve_card_list, { state: returnState })} style={{ marginLeft: "0.5rem" }}>
                        Back to List
                    </button>
                </div>

                <ChipSelector
                    label="Decks"
                    items={availableDecks}
                    selectedIds={selectedDecks}
                    onSelectionChange={setSelectedDecks}
                    chipColor={{
                        border: "#9c27b0",
                        background: "#f3e5f5",
                        prefix: "deck:"
                    }}
                    multiSelect={true}
                    manageButton={{
                        text: "Manage Decks",
                        onClick: () => navigate(nav_paths.delve_card_decks, {
                            state: { returnPath: nav_paths.delve_card_edit + "/" + cardId }
                        })
                    }}
                />

                <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", marginBottom: "0.25rem" }}>
                        <strong>Title *</strong>
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        style={{ width: "100%", padding: "0.5rem" }}
                    />
                </div>

                <div style={{ marginBottom: "1rem" }}>
                    <button
                        type="button"
                        onClick={() => setShowSyntaxHelp(!showSyntaxHelp)}
                        style={{
                            marginBottom: "0.5rem",
                            padding: "0.4rem 0.8rem",
                            fontSize: "0.9rem",
                            backgroundColor: "#e3f2fd",
                            border: "1px solid #90caf9",
                            borderRadius: "4px",
                            cursor: "pointer"
                        }}
                    >
                        {showSyntaxHelp ? "Hide" : "Show"} Dice & Variable Syntax Help
                    </button>

                    {showSyntaxHelp && (
                        <div style={{
                            padding: "0.75rem",
                            backgroundColor: "#e3f2fd",
                            border: "1px solid #90caf9",
                            borderRadius: "4px",
                            fontSize: "0.9rem",
                            boxSizing: "border-box",
                            width: "100%",
                            overflowWrap: "break-word",
                            wordWrap: "break-word"
                        }}>
                            <strong>Dice & Variable Syntax:</strong>
                            <ul style={{ marginTop: "0.5rem", marginBottom: 0, paddingLeft: "1.5rem", margin: 0 }}>
                                <li style={{ marginBottom: "0.25rem" }}>Dice rolls: <code>&lt;1d6&gt;</code>, <code>&lt;2d10&gt;</code>, etc.</li>
                                <li style={{ marginBottom: "0.25rem" }}>Variables in Effect: <code>&lt;supply = 10 - 1d3&gt;</code> (will be hidden when drawn)</li>
                                <li style={{ marginBottom: "0.25rem" }}>Variables can reference other variables: <code>&lt;cost = supply * 2&gt;</code></li>
                                <li style={{ marginBottom: "0.25rem" }}>Use variables in Effect or Description: <code>&lt;supply&gt;</code> (will show the calculated value)</li>
                                <li>Math operators: +, -, *, /, ()</li>
                            </ul>
                        </div>
                    )}
                </div>

                <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", marginBottom: "0.25rem" }}>
                        <strong>Effect</strong>
                    </label>
                    <textarea
                        value={effect}
                        onChange={(e) => setEffect(e.target.value)}
                        rows={3}
                        style={{ width: "100%", padding: "0.5rem" }}
                    />
                </div>

                <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", marginBottom: "0.25rem" }}>
                        <strong>Description</strong>
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={5}
                        style={{ width: "100%", padding: "0.5rem" }}
                    />
                    <div style={{ marginTop: "0.5rem" }}>
                        <button type="button" onClick={handlePreview}>
                            Preview Dice Rolls & Variables
                        </button>
                        {showPreview && (
                            <button
                                type="button"
                                onClick={() => setShowPreview(false)}
                                style={{ marginLeft: "0.5rem" }}
                            >
                                Hide Preview
                            </button>
                        )}
                    </div>
                </div>

                {showPreview && previewText && (() => {
                    const rarityColors = getRarityColors(rarity)
                    return (
                        <div style={{
                            marginBottom: "1rem",
                            padding: "1rem",
                            border: `3px solid ${rarityColors.border}`,
                            backgroundColor: rarityColors.background,
                            borderRadius: "12px"
                        }}>
                            <h3 style={{ marginTop: 0, color: rarityColors.border }}>Preview (Random Roll)</h3>
                            <div style={{ fontSize: "0.9rem", marginBottom: "0.5rem", fontStyle: "italic", color: "#666" }}>
                                This shows one possible result. Each draw will roll dice randomly.
                            </div>

                            {previewText.effect && (
                                <div style={{ marginBottom: "1rem" }}>
                                    <strong>Effect:</strong>
                                    <div style={{
                                        marginTop: "0.25rem",
                                        padding: "0.5rem",
                                        backgroundColor: "white",
                                        border: "1px solid #ccc",
                                        borderRadius: "6px"
                                    }}>
                                        {previewText.effect}
                                    </div>
                                </div>
                            )}

                            <div style={{ marginBottom: "0" }}>
                                <strong>Description:</strong>
                                <div style={{
                                    marginTop: "0.25rem",
                                    padding: "0.5rem",
                                    backgroundColor: "white",
                                    border: "1px solid #ccc",
                                    borderRadius: "6px",
                                    whiteSpace: "pre-wrap"
                                }}>
                                    {previewText.description || "None"}
                                </div>
                            </div>

                            <div style={{ marginTop: "0.75rem" }}>
                                <button type="button" onClick={handlePreview} style={{ fontSize: "0.9rem" }}>
                                    Roll Again
                                </button>
                            </div>
                        </div>
                    )
                })()}

                <ChipSelector
                    label="Rarity"
                    items={RARITY_OPTIONS}
                    selectedIds={[rarity.toString()]}
                    onSelectionChange={(ids) => setRarity(ids.length > 0 ? Number(ids[0]) : 1)}
                    chipColor={{
                        border: "#ff9800",
                        background: "#fff3e0",
                        prefix: "rarity:"
                    }}
                    multiSelect={false}
                />

                <ChipSelector
                    label="Tags"
                    items={availableTags}
                    selectedIds={selectedTags}
                    onSelectionChange={setSelectedTags}
                    chipColor={{
                        border: "#4a90e2",
                        background: "#f0f7ff",
                        prefix: "tag:"
                    }}
                    multiSelect={true}
                    manageButton={{
                        text: "Manage Tags",
                        onClick: () => navigate(nav_paths.delve_card_tags, {
                            state: { returnPath: nav_paths.delve_card_edit + "/" + cardId }
                        })
                    }}
                />
            </div>
        </FullPageOverlay>
    )
}

