import words_url from "../assets/accepted_words_shuffled.txt?raw"


export function get_words_array() {
    const lines = words_url.split("\n")
        .map((line: string) => line.trim())
        .filter((line: string) => line.length > 0)
    const words = lines.map((line: string) => line.split("|")[0]) // Extract just the word part before the pipe
    return words
}


export function get_first_word_from_list() {
    return get_words_array()[0]
}


export function get_definition_for_word(word_to_search_for: string) {
    const lines = words_url.split("\n")
        .map((line: string) => line.trim())
        .filter((line: string) => line.length > 0)

    for (const line of lines) {
        const [word, definition] = line.split("|")
        if (word === word_to_search_for && definition) {
            return definition
        }
    }
    return null
}


export function get_tags_from_file(word_to_search_for: string): string[] {
    const lines = words_url.split("\n")
        .map((line: string) => line.trim())
        .filter((line: string) => line.length > 0)

    for (const line of lines) {
        const parts = line.split("|")
        if (parts.length >= 3) {
            const word = parts[0]
            const tagsString = parts[2]

            if (word === word_to_search_for && tagsString) {
                try {
                    // Parse the JSON array of tags
                    const tags = JSON.parse(tagsString)
                    if (Array.isArray(tags)) {
                        return tags
                    }
                } catch (error) {
                    console.error("Error parsing tags for word:", word_to_search_for, error)
                }
            }
        }
    }
    return []
}
