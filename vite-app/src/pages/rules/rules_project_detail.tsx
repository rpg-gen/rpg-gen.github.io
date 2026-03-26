import { Link } from "react-router-dom"
import { ttrpg } from "../../configs/ttrpg_theme"
import { RulesSection } from "../../types/draw_steel_rules"
import RulesSectionList from "./rules_section_list"

interface Props {
    base_path: string
    page_key: string
    page_label: string
    sections: RulesSection[]
    loading: boolean
}

export default function RulesProjectDetail({ base_path, page_key, page_label, sections, loading }: Props) {
    return (
        <>
            <RulesSectionList sections={sections} loading={loading} />
            <Link to={`${base_path}/${page_key}`} style={browse_all_style}>
                Browse all {page_label} &rarr;
            </Link>
        </>
    )
}

const browse_all_style: React.CSSProperties = {
    display: "inline-block",
    marginTop: "1.5rem",
    padding: "0.5rem 1rem",
    backgroundColor: "rgba(255,255,255,0.05)",
    border: `1px solid ${ttrpg.colors.dividerOnDark}`,
    borderRadius: ttrpg.radius.sm,
    color: ttrpg.colors.gold,
    fontFamily: ttrpg.fonts.body,
    fontSize: "0.9rem",
    textDecoration: "none",
    transition: `background-color ${ttrpg.transitions.fast}`,
}
