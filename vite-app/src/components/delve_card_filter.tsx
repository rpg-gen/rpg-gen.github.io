import { useState, useEffect } from "react"
import DelveCardTag from "../types/delve_cards/DelveCardTag"
import DelveCardDeck from "../types/delve_cards/DelveCardDeck"
import { getRarityName } from "../utility/rarity_utils"
import FilterChip from "./delve_cards/filter_chip"
import FilterDropdownPanel from "./delve_cards/filter_dropdown_panel"
import { DropdownTab } from "./delve_cards/filter_dropdown_panel"

interface DelveCardFilterProps {
    tags: DelveCardTag[]
    decks: DelveCardDeck[]
    selectedTagIds: string[]
    selectedDeckIds: string[]
    selectedRarities: number[]
    searchTextFilters: string[]
    searchDeep: boolean
    onTagsChange: (tagIds: string[]) => void
    onDecksChange: (deckIds: string[]) => void
    onRaritiesChange: (rarities: number[]) => void
    onSearchTextFiltersChange: (filters: string[]) => void
    onSearchDeepChange: (searchDeep: boolean) => void
    onClearAll: () => void
}

export default function DelveCardFilter({
    tags,
    decks,
    selectedTagIds,
    selectedDeckIds,
    selectedRarities,
    searchTextFilters,
    searchDeep,
    onTagsChange,
    onDecksChange,
    onRaritiesChange,
    onSearchTextFiltersChange,
    onSearchDeepChange,
    onClearAll
}: DelveCardFilterProps) {
    const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false)
    const [filterInputText, setFilterInputText] = useState("")
    const [dropdownTab, setDropdownTab] = useState<DropdownTab>("decks")

    // Close dropdown when clicking outside or pressing Escape
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as HTMLElement
            // Only keep dropdown open if clicking on the input field or the dropdown panel itself
            if (!target.closest('[data-filter-input]') && !target.closest('[data-filter-panel]')) {
                setIsFilterDropdownOpen(false)
            }
        }

        function handleEscapeKey(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setIsFilterDropdownOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        document.addEventListener('keydown', handleEscapeKey)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('keydown', handleEscapeKey)
        }
    }, [])

    function toggleTag(tagId: string) {
        if (selectedTagIds.includes(tagId)) {
            onTagsChange(selectedTagIds.filter(id => id !== tagId))
        } else {
            onTagsChange([...selectedTagIds, tagId])
        }
        setIsFilterDropdownOpen(false)
    }

    function toggleDeck(deckId: string) {
        if (selectedDeckIds.includes(deckId)) {
            onDecksChange(selectedDeckIds.filter(id => id !== deckId))
        } else {
            onDecksChange([...selectedDeckIds, deckId])
        }
        setIsFilterDropdownOpen(false)
    }

    function toggleRarity(rarity: number) {
        if (selectedRarities.includes(rarity)) {
            onRaritiesChange(selectedRarities.filter(r => r !== rarity))
        } else {
            onRaritiesChange([...selectedRarities, rarity])
        }
        setIsFilterDropdownOpen(false)
    }

    function handleFilterInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter" && filterInputText.trim()) {
            e.preventDefault()
            addSearchTextFilter(filterInputText.trim())
            setFilterInputText("")
            setIsFilterDropdownOpen(false)
        }
    }

    function addSearchTextFilter(text: string) {
        if (!searchTextFilters.includes(text)) {
            onSearchTextFiltersChange([...searchTextFilters, text])
        }
    }

    function removeSearchTextFilter(text: string) {
        onSearchTextFiltersChange(searchTextFilters.filter(t => t !== text))
    }

    function getTotalFilterCount() {
        return selectedTagIds.length + selectedDeckIds.length + selectedRarities.length + searchTextFilters.length
    }

    return (
        <div style={{ marginBottom: "1rem" }}>
            {/* Unified Filter Field */}
            <div style={{ position: "relative" }}>
                <strong style={{ display: "block", marginBottom: "0.5rem" }}>
                    Filters {getTotalFilterCount() > 0 && `(${getTotalFilterCount()} active)`}
                </strong>

                {/* Main filter input field with chips */}
                <div
                    data-filter-input
                    style={{
                        border: "1px solid #ccc",
                        padding: "0.5rem",
                        backgroundColor: "white",
                        minHeight: "38px",
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "0.25rem",
                        alignItems: "center"
                    }}
                >
                    {/* Search text chips */}
                    {searchTextFilters.map(text => (
                        <FilterChip
                            key={`search-${text}`}
                            label={text}
                            colorKey="search"
                            onRemove={() => removeSearchTextFilter(text)}
                        />
                    ))}

                    {/* Deck chips */}
                    {selectedDeckIds.map(deckId => {
                        const deck = decks.find(d => d.id === deckId)
                        if (!deck) return null
                        return (
                            <FilterChip
                                key={`deck-${deckId}`}
                                label={deck.name}
                                colorKey="deck"
                                onRemove={() => toggleDeck(deckId)}
                            />
                        )
                    })}

                    {/* Tag chips */}
                    {selectedTagIds.map(tagId => {
                        const tag = tags.find(t => t.id === tagId)
                        if (!tag) return null
                        return (
                            <FilterChip
                                key={`tag-${tagId}`}
                                label={tag.name}
                                colorKey="tag"
                                onRemove={() => toggleTag(tagId)}
                            />
                        )
                    })}

                    {/* Rarity chips */}
                    {selectedRarities.map(rarity => (
                        <FilterChip
                            key={`rarity-${rarity}`}
                            label={getRarityName(rarity)}
                            colorKey="rarity"
                            onRemove={() => toggleRarity(rarity)}
                        />
                    ))}

                    {/* Input field */}
                    <input
                        type="text"
                        placeholder={getTotalFilterCount() === 0 ? "Type to search or click to add filters..." : "Type to add search..."}
                        value={filterInputText}
                        onChange={(e) => setFilterInputText(e.target.value)}
                        onFocus={() => setIsFilterDropdownOpen(true)}
                        onKeyDown={handleFilterInputKeyDown}
                        style={{
                            border: "none",
                            outline: "none",
                            flex: 1,
                            minWidth: "200px",
                            padding: "0.2rem",
                            fontSize: "0.9rem"
                        }}
                    />
                </div>

                {/* Dropdown with tabs */}
                {isFilterDropdownOpen && (
                    <FilterDropdownPanel
                        tags={tags}
                        decks={decks}
                        selectedTagIds={selectedTagIds}
                        selectedDeckIds={selectedDeckIds}
                        selectedRarities={selectedRarities}
                        dropdownTab={dropdownTab}
                        onDropdownTabChange={setDropdownTab}
                        onToggleTag={toggleTag}
                        onToggleDeck={toggleDeck}
                        onToggleRarity={toggleRarity}
                        onClose={() => setIsFilterDropdownOpen(false)}
                    />
                )}

                {/* Clear all button and deep search checkbox */}
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "0.5rem" }}>
                    {getTotalFilterCount() > 0 && (
                        <button
                            onClick={onClearAll}
                            style={{ fontSize: "0.85rem" }}
                        >
                            Clear All Filters
                        </button>
                    )}
                    <label style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.85rem", cursor: "pointer" }}>
                        <input
                            type="checkbox"
                            checked={searchDeep}
                            onChange={(e) => onSearchDeepChange(e.target.checked)}
                            style={{ cursor: "pointer" }}
                        />
                        Search in title, effect & description
                    </label>
                </div>
            </div>
        </div>
    )
}
