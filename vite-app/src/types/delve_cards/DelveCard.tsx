export default interface DelveCard {
    id: string
    title: string
    effect: string
    description: string
    tags: string[]
    decks: string[] // array of deck IDs
    rarity: number // 1-5, where 1 is most common
}

