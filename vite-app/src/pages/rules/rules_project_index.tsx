import { Link } from "react-router-dom"
import { ttrpg } from "../../configs/ttrpg_theme"
import { RulesSection, RulesProject } from "../../types/draw_steel_rules"
import RulesSectionList from "./rules_section_list"

interface Props {
    base_path: string
    page_key: string
    intro: RulesSection[]
    projects: RulesProject[]
    loading: boolean
}

export default function RulesProjectIndex({ base_path, page_key, intro, projects, loading }: Props) {
    return (
        <>
            <RulesSectionList sections={intro} loading={loading} />
            {projects.length > 0 && (
                <div style={grid_style}>
                    {projects.map(p => (
                        <Link
                            key={p.id}
                            to={`${base_path}/${page_key}/${p.id}`}
                            style={card_style}
                        >
                            {p.heading}
                        </Link>
                    ))}
                </div>
            )}
        </>
    )
}

const grid_style: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    marginTop: "1.5rem",
}

const card_style: React.CSSProperties = {
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
