import { useState, useMemo, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ttrpg } from "../../configs/ttrpg_theme"
import { RulesSection, RulesProject } from "../../types/draw_steel_rules"

interface Props {
    base_path: string
    page_labels: Record<string, string>
    search: (query: string) => RulesSection[]
    projects_for_page: (page_key: string) => RulesProject[]
    placeholder?: string
}

function get_snippet(content: string, query: string): string | null {
    const lower = content.toLowerCase()
    const idx = lower.indexOf(query.toLowerCase())
    if (idx === -1) return null
    const start = Math.max(0, idx - 40)
    const end = Math.min(content.length, idx + query.length + 80)
    let snippet = content.slice(start, end).replace(/\n/g, " ").trim()
    if (start > 0) snippet = "..." + snippet
    if (end < content.length) snippet = snippet + "..."
    return snippet
}

function get_project_name(
    section: RulesSection,
    projects_for_page: (page_key: string) => RulesProject[]
): string | null {
    if (!section.project_id) return null
    const projects = projects_for_page(section.page_key)
    return projects.find(p => p.id === section.project_id)?.heading ?? null
}

export default function RulesSearch(props: Props) {
    const { base_path, page_labels, search, projects_for_page, placeholder } = props
    const [query, set_query] = useState("")
    const [open, set_open] = useState(false)
    const [dropdown_top, set_dropdown_top] = useState(0)
    const navigate = useNavigate()
    const container_ref = useRef<HTMLDivElement>(null)
    const results = useMemo(() => search(query), [search, query])

    useEffect(() => {
        function update_top() {
            if (container_ref.current) {
                const rect = container_ref.current.getBoundingClientRect()
                set_dropdown_top(rect.bottom + 4)
            }
        }
        update_top()
        window.addEventListener("resize", update_top)
        return () => window.removeEventListener("resize", update_top)
    }, [])

    useEffect(() => {
        function handle_click(e: MouseEvent) {
            if (container_ref.current && !container_ref.current.contains(e.target as Node)) {
                set_open(false)
            }
        }
        document.addEventListener("mousedown", handle_click)
        return () => document.removeEventListener("mousedown", handle_click)
    }, [])

    function handle_result_click(section: RulesSection) {
        set_query("")
        set_open(false)
        const base = `${base_path}/${section.page_key}`
        const path = section.project_id
            ? `${base}/${section.project_id}#${section.id}`
            : `${base}#${section.id}`
        navigate(path)
        setTimeout(() => {
            document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth" })
        }, 100)
    }

    const show_dropdown = open && query.trim().length > 0
    const trimmed = query.trim()

    return (
        <div ref={container_ref} style={container_style}>
            <input
                type="text"
                placeholder={placeholder ?? "Search..."}
                value={query}
                onChange={e => { set_query(e.target.value); set_open(true) }}
                onFocus={() => set_open(true)}
                style={input_style}
            />
            {show_dropdown && (
                <div style={{ ...dropdown_style, top: dropdown_top }}>
                    {results.length === 0 ? (
                        <div style={no_results_style}>No results</div>
                    ) : (
                        results.slice(0, 10).map(section => {
                            const snippet = get_snippet(section.content, trimmed)
                            const project_name = get_project_name(
                                section, projects_for_page
                            )
                            return (
                                <button
                                    key={section.id}
                                    onClick={() => handle_result_click(section)}
                                    style={result_style}
                                >
                                    <div style={result_header_style}>
                                        <span style={page_label_style}>
                                            {page_labels[section.page_key] ?? section.page_key}
                                            {project_name && ` > ${project_name}`}
                                        </span>
                                        <span style={heading_style}>{section.heading}</span>
                                    </div>
                                    {snippet && (
                                        <HighlightedSnippet snippet={snippet} query={trimmed} />
                                    )}
                                </button>
                            )
                        })
                    )}
                </div>
            )}
        </div>
    )
}

function HighlightedSnippet({ snippet, query }: { snippet: string; query: string }) {
    const lower = snippet.toLowerCase()
    const qLower = query.toLowerCase()
    const idx = lower.indexOf(qLower)
    if (idx === -1) return <span style={snippet_style}>{snippet}</span>

    return (
        <span style={snippet_style}>
            {snippet.slice(0, idx)}
            <mark style={highlight_style}>{snippet.slice(idx, idx + query.length)}</mark>
            {snippet.slice(idx + query.length)}
        </span>
    )
}

const container_style: React.CSSProperties = {
    position: "relative",
    flex: 1,
    maxWidth: "400px",
}

const input_style: React.CSSProperties = {
    width: "100%",
    padding: "0.4rem 0.6rem",
    boxSizing: "border-box",
    backgroundColor: "rgba(255,255,255,0.08)",
    border: `1px solid ${ttrpg.colors.dividerOnDark}`,
    borderRadius: ttrpg.radius.sm,
    color: ttrpg.colors.textOnDark,
    fontFamily: ttrpg.fonts.body,
    fontSize: "0.85rem",
    outline: "none",
}

const dropdown_style: React.CSSProperties = {
    position: "fixed",
    left: 0,
    right: 0,
    backgroundColor: ttrpg.colors.pageBg,
    border: `1px solid ${ttrpg.colors.dividerOnDark}`,
    borderRadius: ttrpg.radius.sm,
    boxShadow: ttrpg.shadows.modal,
    maxHeight: "60vh",
    overflowY: "auto",
    zIndex: 30,
}

const no_results_style: React.CSSProperties = {
    color: ttrpg.colors.textMuted,
    fontSize: "0.85rem",
    padding: "0.5rem 0.75rem",
}

const result_style: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "3px",
    width: "100%",
    padding: "0.5rem 0.75rem",
    background: "none",
    border: "none",
    borderBottom: `1px solid ${ttrpg.colors.dividerOnDark}`,
    color: ttrpg.colors.textOnDark,
    fontFamily: ttrpg.fonts.body,
    fontSize: "0.85rem",
    cursor: "pointer",
    textAlign: "left",
}

const result_header_style: React.CSSProperties = {
    display: "flex",
    alignItems: "baseline",
    gap: "6px",
}

const page_label_style: React.CSSProperties = {
    fontSize: "0.7rem",
    color: ttrpg.colors.textMuted,
    flexShrink: 0,
}

const heading_style: React.CSSProperties = {
    fontWeight: 600,
    color: ttrpg.colors.gold,
}

const snippet_style: React.CSSProperties = {
    fontSize: "0.78rem",
    color: ttrpg.colors.textLight,
    lineHeight: 1.4,
    wordBreak: "break-word",
}

const highlight_style: React.CSSProperties = {
    backgroundColor: "rgba(201, 168, 76, 0.3)",
    color: ttrpg.colors.gold,
    borderRadius: "2px",
    padding: "0 1px",
}
