/**
 * Type for navigation state shared between delve card pages
 * Allows filters to persist when navigating between pages
 */
export default interface DelveCardNavigationState {
    selectedTagIds?: string[]
    selectedDeckIds?: string[]
    selectedRarities?: number[]
    searchTextFilters?: string[]
    currentIndex?: number
    searchDeep?: boolean
    searchText?: string  // Legacy field for backward compatibility
}

