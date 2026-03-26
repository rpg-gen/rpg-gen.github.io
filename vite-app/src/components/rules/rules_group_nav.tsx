import { Link } from "react-router-dom"
import { ttrpg } from "../../configs/ttrpg_theme"
import { PageGroup } from "../../configs/draw_steel_config"

interface Props {
    base_path: string
    active_page: string
    page_labels: Record<string, string>
    page_groups: PageGroup[]
    page_children: Record<string, string[]>
    is_project_detail?: boolean
}

function find_group(
    page_key: string,
    page_groups: PageGroup[],
    page_children: Record<string, string[]>,
): PageGroup | null {
    for (const group of page_groups) {
        if (group.keys.includes(page_key)) return group
    }
    for (const [parent, children] of Object.entries(page_children)) {
        if (children.includes(page_key)) {
            return page_groups.find(g => g.keys.includes(parent)) ?? null
        }
    }
    return null
}

function find_parent(page_key: string, page_children: Record<string, string[]>): string | null {
    for (const [parent, children] of Object.entries(page_children)) {
        if (children.includes(page_key)) return parent
    }
    return null
}

export default function RulesGroupNav(props: Props) {
    const { base_path, active_page, page_labels, page_groups, page_children, is_project_detail } = props
    const group = find_group(active_page, page_groups, page_children)
    if (!group) return null

    const parent_key = find_parent(active_page, page_children)
    const has_group_index = !!group.slug

    let back_to: string
    let back_label: string
    if (is_project_detail) {
        back_to = `${base_path}/${active_page}`
        back_label = page_labels[active_page] ?? group.label
    } else if (has_group_index) {
        back_to = `${base_path}/${group.slug}`
        back_label = group.label
    } else if (group.parent_slug) {
        back_to = `${base_path}/${group.parent_slug}`
        const parent = page_groups.find(g => g.slug === group.parent_slug)
        back_label = parent?.label ?? "Rules"
    } else {
        back_to = base_path
        back_label = "Rules"
    }

    const show_pills = group.keys.length > 1

    return (
        <div style={nav_container}>
            <Link to={back_to} style={back_style}>&larr; {back_label}</Link>
            {show_pills && (
                <div style={pills_row}>
                    {group.keys.map(key => {
                        const is_active = key === active_page || key === parent_key
                        return (
                            <Link
                                key={key}
                                to={`${base_path}/${key}`}
                                style={{
                                    ...pill_style,
                                    backgroundColor: is_active ? ttrpg.colors.goldMuted : "transparent",
                                    color: is_active ? ttrpg.colors.gold : ttrpg.colors.textLight,
                                    fontWeight: is_active ? 600 : 400,
                                }}
                            >
                                {page_labels[key] ?? key}
                            </Link>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

const back_style: React.CSSProperties = {
    display: "inline-block",
    marginBottom: "0.4rem",
    color: ttrpg.colors.textLight,
    fontFamily: ttrpg.fonts.body,
    fontSize: "0.85rem",
    textDecoration: "none",
}

const nav_container: React.CSSProperties = {
    marginBottom: "1rem",
    borderBottom: `1px solid ${ttrpg.colors.dividerOnDark}`,
    paddingBottom: "0.75rem",
}

const pills_row: React.CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.25rem",
}

const pill_style: React.CSSProperties = {
    display: "inline-block",
    padding: "0.3rem 0.6rem",
    borderRadius: ttrpg.radius.pill,
    textDecoration: "none",
    fontFamily: ttrpg.fonts.body,
    fontSize: "0.8rem",
    whiteSpace: "nowrap",
    transition: `background-color ${ttrpg.transitions.fast}, color ${ttrpg.transitions.fast}`,
}

