import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { ttrpg } from "../../configs/ttrpg_theme"

const markdown_css = `
.rules-md h2, .rules-md h3, .rules-md h4, .rules-md h5, .rules-md h6 {
    font-family: ${ttrpg.fonts.heading};
    color: ${ttrpg.colors.gold};
    margin-top: 1.5rem;
    margin-bottom: 0.5rem;
}
.rules-md h2 { font-size: 1.4rem; }
.rules-md h3 { font-size: 1.15rem; }
.rules-md h4 { font-size: 1rem; }
.rules-md h5 { font-size: 0.95rem; }
.rules-md h6 { font-size: 0.9rem; }
.rules-md p, .rules-md li {
    font-family: ${ttrpg.fonts.body};
    color: #f0ebe3;
    line-height: 1.7;
    font-size: 0.95rem;
}
.rules-md ul, .rules-md ol { padding-left: 1.25rem; }
.rules-md a {
    color: #7db8f0;
    text-decoration: underline;
}
.rules-md a:hover {
    color: #a8d0f8;
}
.rules-md table {
    width: 100%;
    border-collapse: collapse;
    margin: 0.75rem 0;
    font-size: 0.9rem;
}
.rules-md th, .rules-md td {
    border: 1px solid rgba(201, 168, 76, 0.3);
    padding: 0.5rem 0.75rem;
    text-align: left;
    color: #f0ebe3;
}
.rules-md th {
    background-color: rgba(201, 168, 76, 0.15);
    font-family: ${ttrpg.fonts.heading};
    font-weight: 600;
    color: ${ttrpg.colors.gold};
}
.rules-md tr:nth-child(even) td {
    background-color: rgba(255, 255, 255, 0.04);
}
.rules-md strong { color: ${ttrpg.colors.gold}; font-weight: 700; }
.rules-md em { color: #d4c9b8; }
.rules-md hr {
    border: none;
    border-top: 1px solid rgba(201, 168, 76, 0.3);
    margin: 1.25rem 0;
}
.rules-md blockquote {
    border-left: 3px solid ${ttrpg.colors.gold};
    margin: 0.75rem 0;
    padding: 0.5rem 1rem;
    background-color: rgba(201, 168, 76, 0.08);
    border-radius: 0 ${ttrpg.radius.sm} ${ttrpg.radius.sm} 0;
}
.rules-md blockquote p { color: #d4c9b8; }
.rules-md code {
    background-color: rgba(255, 255, 255, 0.08);
    padding: 0.15rem 0.35rem;
    border-radius: 3px;
    font-size: 0.85em;
    color: #f0ebe3;
}
`

interface Props {
    content: string
}

export default function RulesMarkdown({ content }: Props) {
    const cleaned = content.replace(/<!--[\s\S]*?-->/g, "")
    return (
        <>
            <style>{markdown_css}</style>
            <div className="rules-md">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {cleaned}
                </ReactMarkdown>
            </div>
        </>
    )
}
