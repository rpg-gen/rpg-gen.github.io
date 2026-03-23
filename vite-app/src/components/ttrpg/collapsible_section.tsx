import { useState, ReactNode, useRef, useEffect } from "react"
import { ttrpg, themeStyles } from "../../configs/ttrpg_theme"

interface CollapsibleSectionProps {
    title: string
    count?: number
    defaultOpen?: boolean
    onAdd?: () => void
    children: ReactNode
}

export default function CollapsibleSection({ title, count, defaultOpen = true, onAdd, children }: CollapsibleSectionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen)
    const contentRef = useRef<HTMLDivElement>(null)
    const [maxHeight, setMaxHeight] = useState<string | undefined>(undefined)

    useEffect(() => {
        if (contentRef.current) {
            setMaxHeight(isOpen ? `${contentRef.current.scrollHeight + 500}px` : "0px")
        }
    }, [isOpen, children])

    return (
        <div style={themeStyles.sectionDivider}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div
                    className="ttrpg-collapsible-header"
                    onClick={() => setIsOpen(!isOpen)}
                    style={{ flex: 1 }}
                >
                    <span className={`chevron ${isOpen ? "open" : ""}`}>&#9654;</span>
                    <strong>
                        {title}{count !== undefined ? ` (${count})` : ""}
                    </strong>
                </div>
                {onAdd && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onAdd() }}
                        style={{
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            border: "none",
                            backgroundColor: ttrpg.colors.success,
                            color: "#fff",
                            fontSize: "1.1rem",
                            fontWeight: "bold",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            lineHeight: 1,
                        }}
                        title={`Add ${title.toLowerCase().replace(/s$/, "")}`}
                    >
                        +
                    </button>
                )}
            </div>
            <div
                ref={contentRef}
                className={`ttrpg-collapsible ${isOpen ? "expanded" : "collapsed"}`}
                style={{ maxHeight }}
            >
                <div style={{ paddingTop: "0.5rem" }}>
                    {children}
                </div>
            </div>
        </div>
    )
}
