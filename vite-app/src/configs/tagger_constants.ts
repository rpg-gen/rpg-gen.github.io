// Tag categories from the word_categories.txt file
export const NOUN_CATEGORIES = [
    "plant",
    "item",
    "creature",
    "weapon",
    "place",
    "event",
    "gear",
    "org",
    "food",
    "npc"
]

export const DESCRIPTOR_TAGS = [
    "non-pg",
    "evil",
    "good",
    "descriptor",
    "verb",
    "mannerism"
]

// Firestore collection and document names
export const COLLECTION_BOOKMARK = "bookmarks"
export const COLLECTION_KEEP = "words"
export const COLLECTION_DISCARDED = "words_discarded"
export const COLLECTION_TRACKING = "tracking"
export const BOOKMARK_DOC_NAME = "latest_word"
export const BOOKMARK_DOC_FIELD_KEY = "value"
