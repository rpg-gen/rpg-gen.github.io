/**
 * Shared utility functions for filtering delve cards
 */

import DelveCard from "../types/delve_cards/DelveCard"
import DelveCardTag from "../types/delve_cards/DelveCardTag"

export interface CardFilterOptions {
    searchTextFilters?: string[]
    selectedTagIds?: string[]
    selectedDeckIds?: string[]
    selectedRarities?: number[]
    searchDeep?: boolean
    tags?: DelveCardTag[]
}

/**
 * Filter cards based on search criteria
 * @param cards - Array of cards to filter
 * @param options - Filter options
 * @returns Filtered array of cards
 */
export function filterCards(cards: DelveCard[], options: CardFilterOptions): DelveCard[] {
    let filtered = [...cards]

    const {
        searchTextFilters = [],
        selectedTagIds = [],
        selectedDeckIds = [],
        selectedRarities = [],
        searchDeep = false,
        tags = []
    } = options

    // Free-form text search filters - each must match
    if (searchTextFilters.length > 0) {
        filtered = filtered.filter(card => {
            return searchTextFilters.every(searchTerm => {
                const searchLower = searchTerm.toLowerCase()
                let textMatch: boolean

                if (searchDeep) {
                    // Search in title, effect, and description
                    textMatch =
                        card.title.toLowerCase().includes(searchLower) ||
                        card.effect.toLowerCase().includes(searchLower) ||
                        card.description.toLowerCase().includes(searchLower)
                } else {
                    // Search only in title
                    textMatch = card.title.toLowerCase().includes(searchLower)
                }

                const tagMatch = card.tags.some(tagId => {
                    const tag = tags.find(t => t.id === tagId)
                    return tag ? tag.name.toLowerCase().includes(searchLower) : false
                })

                return textMatch || tagMatch
            })
        })
    }

    // Filter by tags - card must have at least one of the selected tags
    if (selectedTagIds.length > 0) {
        filtered = filtered.filter(card =>
            selectedTagIds.some(tagId => card.tags.includes(tagId))
        )
    }

    // Filter by decks - card must have at least one of the selected decks
    if (selectedDeckIds.length > 0) {
        filtered = filtered.filter(card =>
            selectedDeckIds.some(deckId => (card.decks || []).includes(deckId))
        )
    }

    // Filter by rarities
    if (selectedRarities.length > 0) {
        filtered = filtered.filter(card =>
            selectedRarities.includes(card.rarity)
        )
    }

    return filtered
}

