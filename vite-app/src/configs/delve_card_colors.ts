/**
 * Color schemes for delve card system
 * Centralized color configuration for consistency
 */

export interface ColorScheme {
    border: string
    background: string
}

/**
 * Rarity color schemes
 */
export const rarityColors: { [key: number]: ColorScheme } = {
    5: { border: "#4CAF50", background: "#E8F5E9" },      // Frequent - Light Green
    4: { border: "#2196F3", background: "#E3F2FD" },      // Boosted - Light Blue
    3: { border: "#757575", background: "#E8E8E8" },      // Normal - Grey (default)
    2: { border: "#9C27B0", background: "#F3E5F5" },      // Rare - Purple
    1: { border: "#E53935", background: "#FFEBEE" }       // Lost - Reddish
}

/**
 * Filter chip color schemes
 */
export const filterChipColors = {
    deck: {
        border: "#9c27b0",
        background: "#f3e5f5",
        prefix: "deck:"
    },
    tag: {
        border: "#4a90e2",
        background: "#f0f7ff",
        prefix: "tag:"
    },
    rarity: {
        border: "#ff9800",
        background: "#fff3e0",
        prefix: "rarity:"
    },
    search: {
        border: "#757575",
        background: "#f5f5f5",
        prefix: "search:"
    }
}

/**
 * Rarity button colors
 */
export const rarityButtonColors = {
    increase: {
        background: "#4CAF50",
        border: "#45a049"
    },
    decrease: {
        background: "#E53935",
        border: "#c62828"
    }
}

