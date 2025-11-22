import { createContext, useState, ReactNode } from "react"

interface DelveCardFilterContextType {
    selectedTagIds: string[]
    selectedDeckIds: string[]
    selectedRarities: number[]
    searchTextFilters: string[]
    searchDeep: boolean
    setSelectedTagIds: (tagIds: string[]) => void
    setSelectedDeckIds: (deckIds: string[]) => void
    setSelectedRarities: (rarities: number[]) => void
    setSearchTextFilters: (filters: string[]) => void
    setSearchDeep: (deep: boolean) => void
    clearAllFilters: () => void
    setDefaultDeckIfNeeded: (deckId: string) => void
}

const DelveCardFilterContext = createContext<DelveCardFilterContextType | undefined>(undefined)

export function DelveCardFilterProvider({ children }: { children: ReactNode }) {
    const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
    const [selectedDeckIds, setSelectedDeckIds] = useState<string[]>([])
    const [selectedRarities, setSelectedRarities] = useState<number[]>([])
    const [searchTextFilters, setSearchTextFilters] = useState<string[]>([])
    const [searchDeep, setSearchDeep] = useState(false)

    function clearAllFilters() {
        setSelectedTagIds([])
        setSelectedDeckIds([])
        setSelectedRarities([])
        setSearchTextFilters([])
    }

    // Helper to set default deck only if no filters are currently set
    function setDefaultDeckIfNeeded(deckId: string) {
        if (selectedTagIds.length === 0 &&
            selectedDeckIds.length === 0 &&
            selectedRarities.length === 0 &&
            searchTextFilters.length === 0) {
            setSelectedDeckIds([deckId])
        }
    }

    const value: DelveCardFilterContextType = {
        selectedTagIds,
        selectedDeckIds,
        selectedRarities,
        searchTextFilters,
        searchDeep,
        setSelectedTagIds,
        setSelectedDeckIds,
        setSelectedRarities,
        setSearchTextFilters,
        setSearchDeep,
        clearAllFilters,
        setDefaultDeckIfNeeded
    }

    return (
        <DelveCardFilterContext.Provider value={value}>
            {children}
        </DelveCardFilterContext.Provider>
    )
}

export default DelveCardFilterContext

