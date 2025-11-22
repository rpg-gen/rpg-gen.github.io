/**
 * Consolidated hook for loading all delve card related data
 * Combines cards, tags, and decks loading in a single hook
 */

import { useState } from "react"
import useFirebaseDelveCards from "./use_firebase_delve_cards"
import useFirebaseDelveCardTags from "./use_firebase_delve_card_tags"
import useFirebaseDelveCardDecks from "./use_firebase_delve_card_decks"
import DelveCard from "../../types/delve_cards/DelveCard"
import DelveCardTag from "../../types/delve_cards/DelveCardTag"
import DelveCardDeck from "../../types/delve_cards/DelveCardDeck"

interface DelveCardData {
    cards: DelveCard[]
    tags: DelveCardTag[]
    decks: DelveCardDeck[]
}

export default function useDelveCardData() {
    const cardsHook = useFirebaseDelveCards()
    const tagsHook = useFirebaseDelveCardTags()
    const decksHook = useFirebaseDelveCardDecks()

    const [data, setData] = useState<DelveCardData>({
        cards: [],
        tags: [],
        decks: []
    })
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    async function loadAll(): Promise<DelveCardData> {
        setIsLoading(true)
        setError(null)
        try {
            const [cards, tags, decks] = await Promise.all([
                cardsHook.getAllCards(),
                tagsHook.getAllTags(),
                decksHook.getAllDecks()
            ])

            const loadedData = { cards, tags, decks }
            setData(loadedData)
            return loadedData
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to load data')
            setError(error)
            console.error("Error loading delve card data:", error)
            return { cards: [], tags: [], decks: [] }
        } finally {
            setIsLoading(false)
        }
    }

    return {
        data,
        isLoading,
        error,
        loadAll,
        // Expose individual hooks for specific operations
        cardsHook,
        tagsHook,
        decksHook
    }
}

