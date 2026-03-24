import { NavLink, useNavigate, useParams } from "react-router-dom"
import { ttrpg } from "../../configs/ttrpg_theme"
import { RulesProject } from "../../types/draw_steel_rules"
import { PageGroup } from "../../configs/draw_steel_config"

interface Props {
    base_path: string
    page_labels: Record<string, string>
    page_groups: PageGroup[]
    page_children: Record<string, string[]>
    exit_label: string
    on_navigate?: () => void
    projects_for_page: (page_key: string) => RulesProject[]
    has_sub_pages: (page_key: string) => boolean
}

export default function RulesSidebar(props: Props) {
    const {
        base_path, page_labels, page_groups, page_children, exit_label,
        on_navigate, projects_for_page, has_sub_pages,
    } = props
    const { page_key: active_page } = useParams<{ page_key: string }>()
    const navigate = useNavigate()

    function handle_exit() {
        on_navigate?.()
        const origin = sessionStorage.getItem("rules_entry_origin") || "/"
        sessionStorage.removeItem("rules_entry_origin")
        navigate(origin)
    }

    function render_sub_links(links: { key: string; to: string; label: string }[]) {
        return (
            <div style={sub_link_container}>
                {links.map(l => (
                    <NavLink
                        key={l.key}
                        to={l.to}
                        onClick={() => on_navigate?.()}
                        style={({ isActive }) => ({
                            ...sub_link_base,
                            color: isActive ? ttrpg.colors.gold : ttrpg.colors.textLight,
                            fontWeight: isActive ? 600 : 400,
                        })}
                    >
                        {l.label}
                    </NavLink>
                ))}
            </div>
        )
    }

    return (
        <nav style={sidebar_style}>
            <button onClick={handle_exit} style={exit_button_style}>
                &larr; {exit_label}
            </button>

            {page_groups.map(group => (
                <div key={group.label}>
                    <div style={group_header_style}>{group.label}</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        {group.keys.map(key => {
                            const children = page_children[key]
                            const is_parent_active = active_page === key ||
                                (children?.includes(active_page ?? "") ?? false)

                            // Project sub-pages (data-driven)
                            const show_projects = key === active_page && has_sub_pages(key)
                            const projects = show_projects ? projects_for_page(key) : []

                            return (
                                <div key={key}>
                                    <NavLink
                                        to={`${base_path}/${key}`}
                                        end={!!children || has_sub_pages(key)}
                                        onClick={() => on_navigate?.()}
                                        style={({ isActive }) => ({
                                            ...nav_link_base,
                                            backgroundColor: (isActive || is_parent_active)
                                                ? ttrpg.colors.goldMuted : "transparent",
                                            color: (isActive || is_parent_active)
                                                ? ttrpg.colors.gold : ttrpg.colors.textOnDark,
                                            fontWeight: (isActive || is_parent_active) ? 600 : 400,
                                        })}
                                    >
                                        {page_labels[key]}
                                    </NavLink>

                                    {/* Static child pages */}
                                    {children && is_parent_active && render_sub_links(
                                        children.map(ck => ({
                                            key: ck,
                                            to: `${base_path}/${ck}`,
                                            label: page_labels[ck] ?? ck,
                                        }))
                                    )}

                                    {/* Dynamic project sub-pages */}
                                    {projects.length > 0 && render_sub_links(
                                        projects.map(p => ({
                                            key: p.id,
                                            to: `${base_path}/${key}/${p.id}`,
                                            label: p.heading,
                                        }))
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            ))}
        </nav>
    )
}

const sidebar_style: React.CSSProperties = {
    width: "100%",
    padding: "0.75rem",
    boxSizing: "border-box",
}

const exit_button_style: React.CSSProperties = {
    display: "block",
    width: "100%",
    padding: "0.5rem 0.75rem",
    marginBottom: "0.5rem",
    background: "none",
    border: "none",
    borderRadius: ttrpg.radius.sm,
    color: ttrpg.colors.textLight,
    fontFamily: ttrpg.fonts.body,
    fontSize: "0.9rem",
    cursor: "pointer",
    textAlign: "left",
    transition: `color ${ttrpg.transitions.fast}`,
}

const group_header_style: React.CSSProperties = {
    padding: "0.5rem 0.75rem 0.25rem",
    fontSize: "0.7rem",
    fontFamily: ttrpg.fonts.body,
    color: ttrpg.colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    borderTop: `1px solid ${ttrpg.colors.dividerOnDark}`,
    marginTop: "0.25rem",
}

const nav_link_base: React.CSSProperties = {
    display: "block",
    padding: "0.5rem 0.75rem",
    borderRadius: ttrpg.radius.sm,
    textDecoration: "none",
    fontFamily: ttrpg.fonts.body,
    fontSize: "0.95rem",
    transition: `background-color ${ttrpg.transitions.fast}`,
}

const sub_link_container: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "1px",
    paddingLeft: "1rem",
}

const sub_link_base: React.CSSProperties = {
    display: "block",
    padding: "0.3rem 0.75rem",
    borderRadius: ttrpg.radius.sm,
    textDecoration: "none",
    fontFamily: ttrpg.fonts.body,
    fontSize: "0.82rem",
    transition: `color ${ttrpg.transitions.fast}`,
}
