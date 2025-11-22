/**
 * Shared logic for initializing filters with default values
 */

import DelveCardDeck from "../types/delve_cards/DelveCardDeck"
import { findEncountersDeck } from "./delve_card_helpers"

interface FilterState {
    selectedTagIds: string[]
    selectedDeckIds: string[]
    selectedRarities: number[]
    searchTextFilters: string[]
}

/**
 * Checks if any filters are currently set
 */
export function hasActiveFilters(filterState: FilterState): boolean {
    return filterState.selectedTagIds.length > 0 ||
           filterState.selectedDeckIds.length > 0 ||
           filterState.selectedRarities.length > 0 ||
           filterState.searchTextFilters.length > 0
}

/**
 * Initialize default filters if none are set
 * Returns the deck ID if a default was applied, undefined otherwise
 */
export function initializeDefaultFilters(
    filterState: FilterState,
    decks: DelveCardDeck[],
    setDefaultDeckIfNeeded: (deckId: string) => void
): string | undefined {
    // Only apply default if no filters are currently set
    if (hasActiveFilters(filterState)) {
        return undefined
    }

    // Try to find encounters deck
    const encountersDeck = findEncountersDeck(decks)
    if (encountersDeck) {
        setDefaultDeckIfNeeded(encountersDeck.id)
        return encountersDeck.id
    }

    return undefined
}

