import { Link, useParams } from "react-router-dom"
import { ttrpg } from "../../configs/ttrpg_theme"
import { RulesSection, RulesProject } from "../../types/draw_steel_rules"
import { PageGroup } from "../../configs/draw_steel_config"
import RulesSectionList from "./rules_section_list"
import RulesProjectIndex from "./rules_project_index"
import RulesProjectDetail from "./rules_project_detail"

interface Props {
    base_path: string
    default_page: string
    page_labels: Record<string, string>
    page_groups: PageGroup[]
    page_children: Record<string, string[]>
    sections_for_page: (page_key: string) => RulesSection[]
    has_sub_pages: (page_key: string) => boolean
    projects_for_page: (page_key: string) => RulesProject[]
    intro_for_page: (page_key: string) => RulesSection[]
    sections_for_project: (page_key: string, project_id: string) => RulesSection[]
    loading: boolean
    error: string | null
}

function find_parent(page_key: string, page_children: Record<string, string[]>): string | null {
    for (const [parent, children] of Object.entries(page_children)) {
        if (children.includes(page_key)) return parent
    }
    return null
}

export default function RulesPage(props: Props) {
    const { page_key, project_id } = useParams<{
        page_key: string
        project_id: string
    }>()
    const { loading, error, has_sub_pages, sections_for_page, base_path, page_labels, page_groups, page_children } = props

    if (loading) {
        return (
            <div style={center_style}>
                <span style={{ color: ttrpg.colors.textOnDark }}>Loading rules...</span>
            </div>
        )
    }

    if (error) {
        return (
            <div style={center_style}>
                <span style={{ color: ttrpg.colors.danger }}>Error: {error}</span>
            </div>
        )
    }

    // Landing page — no page selected
    if (!page_key) {
        return (
            <div style={content_style}>
                {page_groups.map(group => (
                    <div key={group.label} style={{ marginBottom: "1.5rem" }}>
                        <div style={group_header_style}>{group.label}</div>
                        <div style={links_grid_style}>
                            {group.keys.map(key => (
                                <Link key={key} to={`${base_path}/${key}`} style={link_card_style}>
                                    {page_labels[key] ?? key}
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    const active_page = page_key
    const all_sections = sections_for_page(active_page)
    if (all_sections.length === 0) {
        return (
            <div style={center_style}>
                <span style={{ color: ttrpg.colors.textMuted }}>
                    No content found for this page.
                </span>
            </div>
        )
    }

    // Project detail view
    if (project_id && has_sub_pages(active_page)) {
        return (
            <RulesProjectDetail
                base_path={base_path}
                page_key={active_page}
                page_label={page_labels[active_page] ?? active_page}
                sections={props.sections_for_project(active_page, project_id)}
                loading={loading}
            />
        )
    }

    // Project index view
    if (has_sub_pages(active_page)) {
        return (
            <RulesProjectIndex
                base_path={base_path}
                page_key={active_page}
                intro={props.intro_for_page(active_page)}
                projects={props.projects_for_page(active_page)}
                loading={loading}
            />
        )
    }

    // Child page — show back link to parent
    const parent_key = find_parent(active_page, page_children)
    if (parent_key) {
        return (
            <div style={content_style}>
                <Link to={`${base_path}/${parent_key}`} style={back_style}>
                    &larr; Back to {page_labels[parent_key] ?? parent_key}
                </Link>
                <RulesSectionList sections={all_sections} loading={loading} />
            </div>
        )
    }

    // Single-page view (with optional sub-page links)
    const children = page_children[active_page]
    return (
        <div style={content_style}>
            <RulesSectionList sections={all_sections} loading={loading} />
            {children && children.length > 0 && (
                <div style={links_grid_style}>
                    {children.map(ck => (
                        <Link
                            key={ck}
                            to={`${base_path}/${ck}`}
                            style={link_card_style}
                        >
                            {page_labels[ck] ?? ck}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}

const center_style: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "3rem",
}

const content_style: React.CSSProperties = {
    padding: "1rem 1.5rem",
    paddingBottom: "4rem",
    maxWidth: "800px",
}

const group_header_style: React.CSSProperties = {
    fontSize: "0.75rem",
    fontFamily: ttrpg.fonts.body,
    color: ttrpg.colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: "0.5rem",
}

const links_grid_style: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    marginTop: "1.5rem",
}

const link_card_style: React.CSSProperties = {
    display: "block",
    padding: "0.75rem 1rem",
    backgroundColor: "rgba(255,255,255,0.05)",
    border: `1px solid ${ttrpg.colors.dividerOnDark}`,
    borderRadius: ttrpg.radius.sm,
    color: ttrpg.colors.gold,
    fontFamily: ttrpg.fonts.heading,
    fontSize: "1.05rem",
    textDecoration: "none",
    transition: `background-color ${ttrpg.transitions.fast}`,
}

const back_style: React.CSSProperties = {
    display: "inline-block",
    marginBottom: "0.5rem",
    color: ttrpg.colors.textLight,
    fontFamily: ttrpg.fonts.body,
    fontSize: "0.9rem",
    textDecoration: "none",
}
