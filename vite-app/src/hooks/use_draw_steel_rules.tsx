import { useState, useEffect, useCallback } from "react"
import { RulesSection, RulesProject } from "../types/draw_steel_rules"
import { RULES_SOURCES, ANCHOR_HEADINGS, PROJECT_LEVELS } from "../configs/draw_steel_config"

let cached_sections: RulesSection[] | null = null

function heading_to_id(heading: string): string {
    return heading.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

function parse_markdown(raw: string, default_page: string): RulesSection[] {
    const lines = raw.split("\n")
    const sections: RulesSection[] = []
    let current_heading = ""
    let current_level = 3
    let current_lines: string[] = []
    let current_page = default_page

    function flush() {
        if (!current_heading) return
        const content = current_lines.join("\n").trim()
        sections.push({
            id: heading_to_id(current_heading),
            heading: current_heading,
            level: current_level,
            content,
            page_key: current_page,
        })
    }

    for (const line of lines) {
        const match = line.match(/^(#{3,6})\s+(.+)/)
        if (match) {
            flush()
            current_level = match[1].length
            current_heading = match[2].trim()
            current_lines = []
            const anchor_page = ANCHOR_HEADINGS[current_heading.toUpperCase()]
            if (anchor_page) current_page = anchor_page
        } else {
            current_lines.push(line)
        }
    }
    flush()

    return sections
}

function assign_project_ids(sections: RulesSection[]): RulesSection[] {
    let current_project_id: string | undefined
    let current_page = ""

    return sections.map(s => {
        if (s.page_key !== current_page) {
            current_project_id = undefined
            current_page = s.page_key
        }

        const project_level = PROJECT_LEVELS[s.page_key]
        if (!project_level) return s

        if (s.level === project_level) {
            current_project_id = heading_to_id(s.heading)
            return { ...s, project_id: current_project_id }
        } else if (s.level > project_level && current_project_id) {
            return { ...s, project_id: current_project_id }
        }
        return s
    })
}

async function fetch_all_sources(): Promise<RulesSection[]> {
    const results = await Promise.all(
        RULES_SOURCES.map(async (source) => {
            const res = await fetch(source.url)
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            const text = await res.text()
            return parse_markdown(text, source.default_page)
        })
    )
    return assign_project_ids(results.flat())
}

export default function useDrawSteelRules() {
    const [sections, set_sections] = useState<RulesSection[]>(cached_sections ?? [])
    const [loading, set_loading] = useState(!cached_sections)
    const [error, set_error] = useState<string | null>(null)

    useEffect(() => {
        if (cached_sections) return

        let cancelled = false
        fetch_all_sources()
            .then(parsed => {
                cached_sections = parsed
                if (!cancelled) {
                    set_sections(parsed)
                    set_loading(false)
                }
            })
            .catch(err => {
                if (!cancelled) {
                    set_error(err instanceof Error ? err.message : "Failed to load rules")
                    set_loading(false)
                }
            })
        return () => { cancelled = true }
    }, [])

    const sections_for_page = useCallback(
        (page_key: string) => sections.filter(s => s.page_key === page_key),
        [sections]
    )

    const has_sub_pages = useCallback(
        (page_key: string) => !!PROJECT_LEVELS[page_key],
        []
    )

    const projects_for_page = useCallback(
        (page_key: string): RulesProject[] => {
            const level = PROJECT_LEVELS[page_key]
            if (!level) return []
            return sections
                .filter(s => s.page_key === page_key && s.level === level)
                .map(s => ({ id: heading_to_id(s.heading), heading: s.heading, page_key }))
        },
        [sections]
    )

    const intro_for_page = useCallback(
        (page_key: string): RulesSection[] => {
            return sections.filter(s => s.page_key === page_key && !s.project_id)
        },
        [sections]
    )

    const sections_for_project = useCallback(
        (page_key: string, project_id: string): RulesSection[] => {
            return sections.filter(
                s => s.page_key === page_key && s.project_id === project_id
            )
        },
        [sections]
    )

    const search = useCallback(
        (query: string): RulesSection[] => {
            if (!query.trim()) return []
            const lower = query.toLowerCase()
            return sections.filter(
                s => s.heading.toLowerCase().includes(lower) ||
                     s.content.toLowerCase().includes(lower)
            )
        },
        [sections]
    )

    return {
        sections, loading, error, sections_for_page, search,
        has_sub_pages, projects_for_page, intro_for_page, sections_for_project,
    }
}
