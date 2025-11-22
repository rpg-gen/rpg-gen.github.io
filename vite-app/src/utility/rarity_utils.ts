/**
 * Shared utility functions for handling card rarity
 */

export interface RarityColors {
    border: string
    background: string
}

export function getRarityColors(rarity: number): RarityColors {
    const colorMap: { [key: number]: RarityColors } = {
        5: { border: "#4CAF50", background: "#E8F5E9" },      // Frequent - Light Green
        4: { border: "#2196F3", background: "#E3F2FD" },      // Boosted - Light Blue
        3: { border: "#757575", background: "#E8E8E8" },      // Normal - Grey (default)
        2: { border: "#9C27B0", background: "#F3E5F5" },      // Rare - Purple
        1: { border: "#E53935", background: "#FFEBEE" }       // Lost - Reddish
    }
    return colorMap[rarity] || colorMap[3]
}

export function getRarityName(rarity: number): string {
    const rarityNames: { [key: number]: string } = {
        5: "Frequent",
        4: "Boosted",
        3: "Normal",
        2: "Rare",
        1: "Lost"
    }
    return rarityNames[rarity] || "Normal"
}

export function getRarityIcon(rarity: number): string {
    const rarityIcons: { [key: number]: string } = {
        5: "⏫",  // 2 up carets - most frequent
        4: "⬆",   // 1 up caret
        3: "⏺",   // filled circle
        2: "⬇",   // 1 down caret
        1: "⏬"   // 2 down carets - most rare
    }
    return rarityIcons[rarity] || "⏺"
}

