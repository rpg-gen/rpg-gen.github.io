import TtrpgSession from "../types/ttrpg/TtrpgSession"

export function assignSessionNumbers(sessions: TtrpgSession[]): TtrpgSession[] {
    const sorted = [...sessions].sort((a, b) => a.date.localeCompare(b.date))
    return sorted.map((s, i) => ({ ...s, session_number: i + 1 }))
}
