import { useState, useEffect } from "react"
import { useNavigate, useParams, useLocation } from "react-router-dom"
import useFirebaseDelveCards from "../../hooks/delve_cards/use_firebase_delve_cards"
import useFirebaseDelveCardTags from "../../hooks/delve_cards/use_firebase_delve_card_tags"
import DelveCard from "../../types/delve_cards/DelveCard"
import DelveCardTag from "../../types/delve_cards/DelveCardTag"
import FullPageOverlay from "../../components/full_page_overlay"
import { nav_paths } from "../../configs/constants"

export default function CardEdit() {
    const navigate = useNavigate()
    const location = useLocation()
    const { cardId } = useParams<{ cardId: string }>()
    const cardsHook = useFirebaseDelveCards()
    const tagsHook = useFirebaseDelveCardTags()

    const isNewCard = cardId === "new"
    
    // Store filter state to preserve when returning to card list
    const returnState = location.state as { searchText?: string; selectedTagIds?: string[] } | null

    const [isLoading, setIsLoading] = useState(!isNewCard)
    const [isSaving, setIsSaving] = useState(false)
    const [availableTags, setAvailableTags] = useState<DelveCardTag[]>([])
    const [draftSaved, setDraftSaved] = useState(false)
    const [initialLoadComplete, setInitialLoadComplete] = useState(false)
    
    const [title, setTitle] = useState("")
    const [effect, setEffect] = useState("")
    const [description, setDescription] = useState("")
    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const [rarity, setRarity] = useState(1)

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
                rarity
            }
            localStorage.setItem(draftKey, JSON.stringify(draftData))
            setDraftSaved(true)
            const timer = setTimeout(() => setDraftSaved(false), 1000)
            return () => clearTimeout(timer)
        }
    // }, [title, effect, description, selectedTags, rarity, isLoading, initialLoadComplete])
    }, [title, effect, description, selectedTags, rarity])

    async function loadData() {
        try {
            const tags = await tagsHook.getAllTags()
            setAvailableTags(tags)

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
                        draftData.rarity !== card.rarity
                    )) {
                        if (confirm("You have unsaved changes. Do you want to restore them?")) {
                            setTitle(draftData.title)
                            setEffect(draftData.effect)
                            setDescription(draftData.description)
                            setSelectedTags(draftData.selectedTags)
                            setRarity(draftData.rarity)
                        } else {
                            // Load from server
                            setTitle(card.title)
                            setEffect(card.effect)
                            setDescription(card.description)
                            setSelectedTags(card.tags)
                            setRarity(card.rarity)
                            localStorage.removeItem(draftKey)
                        }
                    } else {
                        // Load from server
                        setTitle(card.title)
                        setEffect(card.effect)
                        setDescription(card.description)
                        setSelectedTags(card.tags)
                        setRarity(card.rarity)
                    }
                }
            } else if (isNewCard && draftData) {
                // For new cards, always restore draft if available
                setTitle(draftData.title)
                setEffect(draftData.effect)
                setDescription(draftData.description)
                setSelectedTags(draftData.selectedTags)
                setRarity(draftData.rarity)
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

    function toggleTag(tagId: string) {
        if (selectedTags.includes(tagId)) {
            setSelectedTags(selectedTags.filter(t => t !== tagId))
        } else {
            setSelectedTags([...selectedTags, tagId])
        }
    }

    if (isLoading) {
        return <FullPageOverlay><div>Loading...</div></FullPageOverlay>
    }

    return (
        <FullPageOverlay>
            <div style={{ padding: "1rem", maxWidth: "800px", margin: "0 auto" }}>
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
                </div>

                <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", marginBottom: "0.25rem" }}>
                        <strong>Rarity (1=common, 5=rare)</strong>
                    </label>
                    <select
                        value={rarity}
                        onChange={(e) => setRarity(Number(e.target.value))}
                        style={{ padding: "0.5rem" }}
                    >
                        <option value={1}>1 - Most Common</option>
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                        <option value={5}>5 - Most Rare</option>
                    </select>
                </div>

                <div style={{ marginBottom: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem" }}>
                        <strong>Tags</strong>
                        <button 
                            onClick={() => navigate(nav_paths.delve_card_tags, { 
                                state: { returnPath: nav_paths.delve_card_edit + "/" + cardId } 
                            })} 
                            style={{ marginLeft: "0.5rem", fontSize: "0.85rem" }}
                        >
                            Manage Tags
                        </button>
                    </div>
                    <div style={{ border: "1px solid #ccc", padding: "0.5rem", maxHeight: "200px", overflowY: "auto" }}>
                        {availableTags.length === 0 ? (
                            <div style={{ color: "#666" }}>No tags available. Create some tags first.</div>
                        ) : (
                            availableTags.map(tag => (
                                <label key={tag.id} style={{ display: "block", marginBottom: "0.25rem" }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedTags.includes(tag.id)}
                                        onChange={() => toggleTag(tag.id)}
                                        style={{ marginRight: "0.5rem" }}
                                    />
                                    {tag.name}
                                </label>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </FullPageOverlay>
    )
}

