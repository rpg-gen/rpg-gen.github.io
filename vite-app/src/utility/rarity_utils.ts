/**
 * Shared utility functions for handling card rarity
 */

import { rarityColors } from "../configs/delve_card_colors"

export interface RarityColors {
    border: string
    background: string
}

export function getRarityColors(rarity: number): RarityColors {
    return rarityColors[rarity] || rarityColors[3]
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

