import { Link, useParams } from "react-router-dom"
import { ttrpg } from "../../configs/ttrpg_theme"
import { RulesSection, RulesProject } from "../../types/draw_steel_rules"
import { PageGroup } from "../../configs/draw_steel_config"
import RulesSectionList from "./rules_section_list"
import RulesProjectIndex from "./rules_project_index"
import RulesProjectDetail from "./rules_project_detail"
import RulesGroupNav from "../../components/rules/rules_group_nav"

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

    // Landing page — no page selected, show one card per group (hide child groups)
    if (!page_key) {
        const root_groups = page_groups.filter(g => !g.parent_slug)
        return (
            <div style={content_style}>
                <div style={links_grid_style}>
                    {root_groups.map(group => (
                        <Link
                            key={group.label}
                            to={`${base_path}/${group.slug ?? group.keys[0]}`}
                            style={link_card_style}
                        >
                            <div style={group_card_label}>{group.label}</div>
                            {group.description && (
                                <div style={group_card_desc}>{group.description}</div>
                            )}
                        </Link>
                    ))}
                </div>
            </div>
        )
    }

    // Group index page — show all pages in this group as cards
    const matched_group = page_groups.find(g => g.slug === page_key)
    if (matched_group) {
        const back_to = matched_group.parent_slug
            ? `${base_path}/${matched_group.parent_slug}`
            : base_path
        const back_label = matched_group.parent_slug
            ? (page_groups.find(g => g.slug === matched_group.parent_slug)?.label ?? "Rules")
            : "Rules"

        // Parent group with sub-groups — show child group cards
        const child_groups = matched_group.sub_groups
            ? matched_group.sub_groups.map(s => page_groups.find(g => g.slug === s)).filter(Boolean) as PageGroup[]
            : null

        return (
            <div style={content_style}>
                <Link to={back_to} style={back_style}>&larr; {back_label}</Link>
                <h2 style={group_index_heading}>{matched_group.label}</h2>
                {matched_group.description && (
                    <p style={group_index_desc}>{matched_group.description}</p>
                )}
                <div style={links_grid_style}>
                    {child_groups ? (
                        child_groups.map(cg => (
                            <Link key={cg.slug} to={`${base_path}/${cg.slug}`} style={link_card_style}>
                                <div style={group_card_label}>{cg.label}</div>
                                {cg.description && (
                                    <div style={group_card_desc}>{cg.description}</div>
                                )}
                            </Link>
                        ))
                    ) : (
                        matched_group.keys.map(key => (
                            <Link key={key} to={`${base_path}/${key}`} style={link_card_style}>
                                {page_labels[key] ?? key}
                            </Link>
                        ))
                    )}
                </div>
            </div>
        )
    }

    const active_page = page_key
    const make_group_nav = (is_detail = false) => (
        <RulesGroupNav
            base_path={base_path}
            active_page={active_page}
            page_labels={page_labels}
            page_groups={page_groups}
            page_children={page_children}
            is_project_detail={is_detail}
        />
    )
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
            <div style={content_style}>
                {make_group_nav(true)}
                <RulesProjectDetail
                    base_path={base_path}
                    page_key={active_page}
                    page_label={page_labels[active_page] ?? active_page}
                    sections={props.sections_for_project(active_page, project_id)}
                    loading={loading}
                />
            </div>
        )
    }

    // Project index view
    if (has_sub_pages(active_page)) {
        return (
            <div style={content_style}>
                {make_group_nav()}
                <RulesProjectIndex
                    base_path={base_path}
                    page_key={active_page}
                    intro={props.intro_for_page(active_page)}
                    projects={props.projects_for_page(active_page)}
                    loading={loading}
                />
            </div>
        )
    }

    // Child page — show back link to parent
    const parent_key = find_parent(active_page, page_children)
    if (parent_key) {
        return (
            <div style={content_style}>
                {make_group_nav()}
                <RulesSectionList sections={all_sections} loading={loading} />
            </div>
        )
    }

    // Single-page view (with optional sub-page links)
    const children = page_children[active_page]
    return (
        <div style={content_style}>
            {make_group_nav()}
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

const links_grid_style: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
}

const group_card_label: React.CSSProperties = {
    fontFamily: ttrpg.fonts.heading,
    fontSize: "1.1rem",
    color: ttrpg.colors.gold,
}

const group_card_desc: React.CSSProperties = {
    fontFamily: ttrpg.fonts.body,
    fontSize: "0.85rem",
    color: ttrpg.colors.textMuted,
    marginTop: "0.25rem",
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

const group_index_heading: React.CSSProperties = {
    fontFamily: ttrpg.fonts.heading,
    fontSize: "1.5rem",
    color: ttrpg.colors.gold,
    margin: "1rem 0 0.25rem",
}

const group_index_desc: React.CSSProperties = {
    fontFamily: ttrpg.fonts.body,
    fontSize: "0.9rem",
    color: ttrpg.colors.textMuted,
    margin: "0 0 1rem",
}

const back_style: React.CSSProperties = {
    display: "inline-block",
    marginBottom: "0.5rem",
    color: ttrpg.colors.textLight,
    fontFamily: ttrpg.fonts.body,
    fontSize: "0.9rem",
    textDecoration: "none",
}
