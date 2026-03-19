import { useState, useEffect, useContext } from "react"
import { useNavigate, useParams, useLocation } from "react-router-dom"
import useDelveCardData from "./use_delve_card_data"
import DelveCard from "../../types/delve_cards/DelveCard"
import DelveCardNavigationState from "../../types/delve_cards/DelveCardNavigationState"
import { nav_paths } from "../../configs/constants"
import DelveCardFilterContext from "../../contexts/delve_card_filter_context"
import { processCardText } from "../../utility/dice_expression_parser"

export default function useCardEditForm() {
    const navigate = useNavigate()
    const location = useLocation()
    const { cardId } = useParams<{ cardId: string }>()
    const dataHook = useDelveCardData()
    const filterContext = useContext(DelveCardFilterContext)!

    const isNewCard = cardId === "new"

    // Store navigation state for index tracking only
    const returnState = location.state as DelveCardNavigationState | null

    const [isSaving, setIsSaving] = useState(false)
    const [draftSaved, setDraftSaved] = useState(false)
    const [initialLoadComplete, setInitialLoadComplete] = useState(false)

    const { tags: availableTags, decks: availableDecks } = dataHook.data
    const isLoading = dataHook.isLoading && !isNewCard

    const [title, setTitle] = useState("")
    const [effect, setEffect] = useState("")
    const [description, setDescription] = useState("")
    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const [selectedDecks, setSelectedDecks] = useState<string[]>([])
    const [rarity, setRarity] = useState(3)
    const [showPreview, setShowPreview] = useState(false)
    const [previewText, setPreviewText] = useState<{ effect: string; description: string } | null>(null)

    const draftKey = `delve-card-draft-${cardId}`

    useEffect(() => {
        loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [title, effect, description, selectedTags, selectedDecks, rarity, draftKey, initialLoadComplete])

    async function loadData() {
        try {
            await dataHook.loadAll()

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
                const card = await dataHook.cardsHook.getCard(cardId)
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
                // Get global filter state from context for pre-populating new cards
                const globalDeckIds = filterContext.selectedDeckIds

                if (draftData) {
                    // For new cards, restore draft if available
                    setTitle(draftData.title)
                    setEffect(draftData.effect)
                    setDescription(draftData.description)
                    setSelectedTags(draftData.selectedTags)
                    setRarity(draftData.rarity)
                    // If global deck filters exist, prioritize those over draft decks
                    if (globalDeckIds.length > 0) {
                        setSelectedDecks(globalDeckIds)
                    } else {
                        setSelectedDecks(draftData.selectedDecks || [])
                    }
                } else if (globalDeckIds.length > 0) {
                    // If no draft, but global deck filters exist, auto-populate those decks
                    setSelectedDecks(globalDeckIds)
                }
            }
        } catch (error) {
            console.error("Error loading data:", error)
        }
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
                const newId = await dataHook.cardsHook.createCard(cardData)
                localStorage.removeItem(draftKey)
                if (closeAfterSave) {
                    // Filters are stored globally in localStorage
                    navigate(nav_paths.delve_card_list, {
                        state: returnState?.currentIndex !== undefined ? { currentIndex: returnState.currentIndex } : undefined
                    })
                } else {
                    navigate(nav_paths.delve_card_edit + "/" + newId, {
                        state: returnState?.currentIndex !== undefined ? { currentIndex: returnState.currentIndex } : undefined
                    })
                }
            } else if (cardId) {
                await dataHook.cardsHook.updateCard(cardId, cardData)
                localStorage.removeItem(draftKey)
                if (closeAfterSave) {
                    // Filters are stored globally in localStorage
                    navigate(nav_paths.delve_card_list, {
                        state: returnState?.currentIndex !== undefined ? { currentIndex: returnState.currentIndex } : undefined
                    })
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

            await dataHook.cardsHook.createCard(cardData)

            // Store the decks we want to keep selected
            const decksToKeep = selectedDecks

            // Clear the form for a new card
            localStorage.removeItem(draftKey)
            setTitle("")
            setEffect("")
            setDescription("")
            setSelectedTags([])
            setRarity(3)

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
                await dataHook.cardsHook.deleteCard(cardId)
                localStorage.removeItem(draftKey)
                // Filters are stored globally in localStorage
                navigate(nav_paths.delve_card_list, {
                    state: returnState?.currentIndex !== undefined ? { currentIndex: returnState.currentIndex } : undefined
                })
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
                // Filters are stored globally in localStorage
                navigate(nav_paths.delve_card_list, {
                    state: returnState?.currentIndex !== undefined ? { currentIndex: returnState.currentIndex } : undefined
                })
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

    function navigateToList() {
        navigate(nav_paths.delve_card_list, {
            state: returnState?.currentIndex !== undefined ? { currentIndex: returnState.currentIndex } : undefined
        })
    }

    function navigateToRandom() {
        navigate(nav_paths.delve_card_random, {
            state: returnState?.currentIndex !== undefined ? { currentIndex: returnState.currentIndex } : undefined
        })
    }

    function navigateToManageDecks() {
        navigate(nav_paths.delve_card_decks, {
            state: { returnPath: nav_paths.delve_card_edit + "/" + cardId }
        })
    }

    function navigateToManageTags() {
        navigate(nav_paths.delve_card_tags, {
            state: { returnPath: nav_paths.delve_card_edit + "/" + cardId }
        })
    }

    return {
        // State
        isNewCard,
        isLoading,
        isSaving,
        draftSaved,
        title,
        effect,
        description,
        selectedTags,
        selectedDecks,
        rarity,
        showPreview,
        previewText,
        availableTags,
        availableDecks,

        // Setters
        setTitle,
        setEffect,
        setDescription,
        setSelectedTags,
        setSelectedDecks,
        setRarity,
        setShowPreview,

        // Handlers
        handleSave,
        handleSaveAndAddAnother,
        handleDelete,
        handleDiscard,
        handlePreview,

        // Navigation
        navigateToList,
        navigateToRandom,
        navigateToManageDecks,
        navigateToManageTags,
    }
}
