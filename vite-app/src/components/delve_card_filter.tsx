import { useState, useEffect } from "react"
import DelveCardTag from "../types/delve_cards/DelveCardTag"
import DelveCardDeck from "../types/delve_cards/DelveCardDeck"

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
    const [dropdownTab, setDropdownTab] = useState<"tags" | "decks" | "rarities">("decks")

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

    function getRarityName(rarity: number): string {
        const rarityNames: { [key: number]: string } = {
            5: "Frequent",
            4: "Boosted",
            3: "Normal",
            2: "Rare",
            1: "Lost"
        }
        return rarityNames[rarity] || ""
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
                        <span
                            key={`search-${text}`}
                            onClick={() => removeSearchTextFilter(text)}
                            style={{
                                border: "1px solid #757575",
                                borderRadius: "4px",
                                padding: "0.2rem 0.5rem",
                                fontSize: "0.85rem",
                                backgroundColor: "#f5f5f5",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.3rem",
                                cursor: "pointer"
                            }}
                        >
                            <span style={{ fontWeight: "600", color: "#757575" }}>search:</span> {text}
                            <span style={{ fontWeight: "bold", fontSize: "1rem" }}>×</span>
                        </span>
                    ))}

                    {/* Deck chips */}
                    {selectedDeckIds.map(deckId => {
                        const deck = decks.find(d => d.id === deckId)
                        if (!deck) return null
                        return (
                            <span
                                key={`deck-${deckId}`}
                                onClick={() => toggleDeck(deckId)}
                                style={{
                                    border: "1px solid #9c27b0",
                                    borderRadius: "4px",
                                    padding: "0.2rem 0.5rem",
                                    fontSize: "0.85rem",
                                    backgroundColor: "#f3e5f5",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "0.3rem",
                                    cursor: "pointer"
                                }}
                            >
                                <span style={{ fontWeight: "600", color: "#9c27b0" }}>deck:</span> {deck.name}
                                <span style={{ fontWeight: "bold", fontSize: "1rem" }}>×</span>
                            </span>
                        )
                    })}

                    {/* Tag chips */}
                    {selectedTagIds.map(tagId => {
                        const tag = tags.find(t => t.id === tagId)
                        if (!tag) return null
                        return (
                            <span
                                key={`tag-${tagId}`}
                                onClick={() => toggleTag(tagId)}
                                style={{
                                    border: "1px solid #4a90e2",
                                    borderRadius: "4px",
                                    padding: "0.2rem 0.5rem",
                                    fontSize: "0.85rem",
                                    backgroundColor: "#f0f7ff",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "0.3rem",
                                    cursor: "pointer"
                                }}
                            >
                                <span style={{ fontWeight: "600", color: "#4a90e2" }}>tag:</span> {tag.name}
                                <span style={{ fontWeight: "bold", fontSize: "1rem" }}>×</span>
                            </span>
                        )
                    })}

                    {/* Rarity chips */}
                    {selectedRarities.map(rarity => (
                        <span
                            key={`rarity-${rarity}`}
                            onClick={() => toggleRarity(rarity)}
                            style={{
                                border: "1px solid #ff9800",
                                borderRadius: "4px",
                                padding: "0.2rem 0.5rem",
                                fontSize: "0.85rem",
                                backgroundColor: "#fff3e0",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.3rem",
                                cursor: "pointer"
                            }}
                        >
                            <span style={{ fontWeight: "600", color: "#ff9800" }}>rarity:</span> {getRarityName(rarity)}
                            <span style={{ fontWeight: "bold", fontSize: "1rem" }}>×</span>
                        </span>
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
                    <div
                        data-filter-panel
                        style={{
                            position: "absolute",
                            top: "100%",
                            left: 0,
                            right: 0,
                            border: "1px solid #ccc",
                            backgroundColor: "white",
                            zIndex: 1000,
                            marginTop: "0.25rem",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                        }}
                    >
                        {/* Tabs */}
                        <div style={{
                            display: "flex",
                            borderBottom: "1px solid #ccc",
                            backgroundColor: "#f9f9f9"
                        }}>
                            <button
                                onClick={() => setDropdownTab("decks")}
                                style={{
                                    flex: 1,
                                    padding: "0.5rem",
                                    border: "none",
                                    backgroundColor: dropdownTab === "decks" ? "white" : "transparent",
                                    borderBottom: dropdownTab === "decks" ? "2px solid #9c27b0" : "none",
                                    cursor: "pointer",
                                    fontWeight: dropdownTab === "decks" ? "bold" : "normal"
                                }}
                            >
                                Decks
                            </button>
                            <button
                                onClick={() => setDropdownTab("tags")}
                                style={{
                                    flex: 1,
                                    padding: "0.5rem",
                                    border: "none",
                                    backgroundColor: dropdownTab === "tags" ? "white" : "transparent",
                                    borderBottom: dropdownTab === "tags" ? "2px solid #4a90e2" : "none",
                                    cursor: "pointer",
                                    fontWeight: dropdownTab === "tags" ? "bold" : "normal"
                                }}
                            >
                                Tags
                            </button>
                            <button
                                onClick={() => setDropdownTab("rarities")}
                                style={{
                                    flex: 1,
                                    padding: "0.5rem",
                                    border: "none",
                                    backgroundColor: dropdownTab === "rarities" ? "white" : "transparent",
                                    borderBottom: dropdownTab === "rarities" ? "2px solid #ff9800" : "none",
                                    cursor: "pointer",
                                    fontWeight: dropdownTab === "rarities" ? "bold" : "normal"
                                }}
                            >
                                Rarities
                            </button>
                        </div>

                        {/* Tab content */}
                        <div style={{
                            maxHeight: "250px",
                            overflowY: "auto"
                        }}>
                            {dropdownTab === "decks" && (
                                decks.length === 0 ? (
                                    <div style={{ padding: "1rem", color: "#666", textAlign: "center" }}>
                                        No decks available
                                    </div>
                                ) : (
                                    decks.map(deck => (
                                        <label key={deck.id} style={{
                                            display: "block",
                                            padding: "0.5rem",
                                            cursor: "pointer",
                                            borderBottom: "1px solid #f0f0f0",
                                            backgroundColor: selectedDeckIds.includes(deck.id) ? "#f3e5f5" : "transparent"
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = selectedDeckIds.includes(deck.id) ? "#f3e5f5" : "#f5f5f5"}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = selectedDeckIds.includes(deck.id) ? "#f3e5f5" : "transparent"}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedDeckIds.includes(deck.id)}
                                                onChange={() => toggleDeck(deck.id)}
                                                style={{ marginRight: "0.5rem" }}
                                            />
                                            {deck.name}
                                        </label>
                                    ))
                                )
                            )}

                            {dropdownTab === "tags" && (
                                tags.length === 0 ? (
                                    <div style={{ padding: "1rem", color: "#666", textAlign: "center" }}>
                                        No tags available
                                    </div>
                                ) : (
                                    tags.map(tag => (
                                        <label key={tag.id} style={{
                                            display: "block",
                                            padding: "0.5rem",
                                            cursor: "pointer",
                                            borderBottom: "1px solid #f0f0f0",
                                            backgroundColor: selectedTagIds.includes(tag.id) ? "#f0f7ff" : "transparent"
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = selectedTagIds.includes(tag.id) ? "#f0f7ff" : "#f5f5f5"}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = selectedTagIds.includes(tag.id) ? "#f0f7ff" : "transparent"}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedTagIds.includes(tag.id)}
                                                onChange={() => toggleTag(tag.id)}
                                                style={{ marginRight: "0.5rem" }}
                                            />
                                            {tag.name}
                                        </label>
                                    ))
                                )
                            )}

                            {dropdownTab === "rarities" && (
                                [5, 4, 3, 2, 1].map(rarity => (
                                    <label key={rarity} style={{
                                        display: "block",
                                        padding: "0.5rem",
                                        cursor: "pointer",
                                        borderBottom: "1px solid #f0f0f0",
                                        backgroundColor: selectedRarities.includes(rarity) ? "#fff3e0" : "transparent"
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = selectedRarities.includes(rarity) ? "#fff3e0" : "#f5f5f5"}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = selectedRarities.includes(rarity) ? "#fff3e0" : "transparent"}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedRarities.includes(rarity)}
                                            onChange={() => toggleRarity(rarity)}
                                            style={{ marginRight: "0.5rem" }}
                                        />
                                        <span style={{ fontWeight: "600" }}>{getRarityName(rarity)}</span> <span style={{ color: "#666" }}>({rarity})</span>
                                    </label>
                                ))
                            )}
                        </div>

                        {/* Dropdown footer with close button */}
                        <div style={{
                            padding: "0.5rem",
                            borderTop: "1px solid #ccc",
                            backgroundColor: "#f9f9f9",
                            display: "flex",
                            justifyContent: "flex-end"
                        }}>
                            <button
                                onClick={() => setIsFilterDropdownOpen(false)}
                                style={{
                                    padding: "0.4rem 1rem",
                                    fontSize: "0.85rem",
                                    cursor: "pointer",
                                    backgroundColor: "#4a90e2",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px"
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
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

