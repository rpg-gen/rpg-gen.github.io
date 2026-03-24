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
        <div style={content_style}>
            <Link to={`${base_path}/${page_key}`} style={back_style}>
                &larr; Back to {page_label}
            </Link>
            <RulesSectionList sections={sections} loading={loading} />
        </div>
    )
}

const content_style: React.CSSProperties = {
    padding: "1rem 1.5rem",
    paddingBottom: "4rem",
    maxWidth: "800px",
}

const back_style: React.CSSProperties = {
    display: "inline-block",
    marginBottom: "0.5rem",
    color: ttrpg.colors.textLight,
    fontFamily: ttrpg.fonts.body,
    fontSize: "0.9rem",
    textDecoration: "none",
}
