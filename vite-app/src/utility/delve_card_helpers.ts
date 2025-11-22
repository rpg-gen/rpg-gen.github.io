/**
 * Shared helper functions for working with delve cards
 */

import DelveCardTag from "../types/delve_cards/DelveCardTag"
import DelveCardDeck from "../types/delve_cards/DelveCardDeck"

/**
 * Get tag name by ID, returns ID if tag not found
 */
export function getTagName(tagId: string, tags: DelveCardTag[]): string {
    const tag = tags.find(t => t.id === tagId)
    return tag ? tag.name : tagId
}

/**
 * Get deck name by ID, returns ID if deck not found
 */
export function getDeckName(deckId: string, decks: DelveCardDeck[]): string {
    const deck = decks.find(d => d.id === deckId)
    return deck ? deck.name : deckId
}

/**
 * Get multiple tag names by IDs, returns array of names
 */
export function getTagNames(tagIds: string[], tags: DelveCardTag[]): string[] {
    return tagIds.map(id => getTagName(id, tags))
}

/**
 * Get multiple deck names by IDs, returns array of names
 */
export function getDeckNames(deckIds: string[], decks: DelveCardDeck[]): string[] {
    return deckIds.map(id => getDeckName(id, decks))
}

/**
 * Find a deck by name (case-insensitive)
 */
export function findDeckByName(deckName: string, decks: DelveCardDeck[]): DelveCardDeck | undefined {
    const searchName = deckName.toLowerCase()
    return decks.find(deck => deck.name.toLowerCase() === searchName)
}

/**
 * Find a deck by partial name match (case-insensitive)
 */
export function findDeckByPartialName(partialName: string, decks: DelveCardDeck[]): DelveCardDeck | undefined {
    const searchName = partialName.toLowerCase()
    return decks.find(deck => deck.name.toLowerCase().includes(searchName))
}

/**
 * Find the "Encounters" deck (or similar naming variations)
 * Returns undefined if not found
 */
export function findEncountersDeck(decks: DelveCardDeck[]): DelveCardDeck | undefined {
    // Try multiple variations
    return decks.find(deck => {
        const deckNameLower = deck.name.toLowerCase()
        return deckNameLower === "encounters" ||
               deckNameLower === "encounter" ||
               deckNameLower.includes("encounter")
    })
}

/**
 * Get tag object by ID
 */
export function getTag(tagId: string, tags: DelveCardTag[]): DelveCardTag | undefined {
    return tags.find(t => t.id === tagId)
}

/**
 * Get deck object by ID
 */
export function getDeck(deckId: string, decks: DelveCardDeck[]): DelveCardDeck | undefined {
    return decks.find(d => d.id === deckId)
}

/**
 * Format tag names as comma-separated string
 */
export function formatTagNames(tagIds: string[], tags: DelveCardTag[]): string {
    if (tagIds.length === 0) return "None"
    return getTagNames(tagIds, tags).join(", ")
}

/**
 * Format deck names as comma-separated string
 */
export function formatDeckNames(deckIds: string[], decks: DelveCardDeck[]): string {
    if (deckIds.length === 0) return "None"
    return getDeckNames(deckIds, decks).join(", ")
}

