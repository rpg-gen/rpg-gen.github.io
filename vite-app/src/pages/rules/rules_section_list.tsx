import { useEffect } from "react"
import { useLocation } from "react-router-dom"
import { ttrpg } from "../../configs/ttrpg_theme"
import { RulesSection } from "../../types/draw_steel_rules"
import RulesMarkdown from "../../components/rules/rules_markdown"

interface Props {
    sections: RulesSection[]
    loading: boolean
}

export default function RulesSectionList({ sections, loading }: Props) {
    const location = useLocation()

    useEffect(() => {
        if (!location.hash || loading) return
        const id = location.hash.slice(1)
        setTimeout(() => {
            document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
        }, 100)
    }, [location.hash, loading])

    return (
        <>
            {sections.map(section => (
                <div key={section.id} id={section.id}>
                    <SectionHeading level={section.level} text={section.heading} />
                    <RulesMarkdown content={section.content} />
                </div>
            ))}
        </>
    )
}

function SectionHeading({ level, text }: { level: number; text: string }) {
    const style = heading_styles[level] ?? heading_styles[6]
    const Tag = `h${Math.min(level, 6)}` as keyof JSX.IntrinsicElements
    return <Tag style={style}>{text}</Tag>
}

const base_heading: React.CSSProperties = {
    fontFamily: ttrpg.fonts.heading,
    color: ttrpg.colors.gold,
}

const heading_styles: Record<number, React.CSSProperties> = {
    2: {
        ...base_heading,
        fontSize: "1.7rem",
        marginTop: "2.5rem",
        marginBottom: "0.6rem",
        borderBottom: `1px solid ${ttrpg.colors.dividerOnDark}`,
        paddingBottom: "0.4rem",
    },
    3: {
        ...base_heading,
        fontSize: "1.5rem",
        marginTop: "2rem",
        marginBottom: "0.5rem",
        borderBottom: `1px solid ${ttrpg.colors.dividerOnDark}`,
        paddingBottom: "0.4rem",
    },
    4: {
        ...base_heading,
        fontSize: "1.25rem",
        marginTop: "1.75rem",
        marginBottom: "0.4rem",
    },
    5: {
        ...base_heading,
        fontSize: "1.05rem",
        marginTop: "1.25rem",
        marginBottom: "0.25rem",
    },
    6: {
        ...base_heading,
        fontSize: "0.95rem",
        marginTop: "1rem",
        marginBottom: "0.25rem",
        color: ttrpg.colors.textLight,
    },
}
