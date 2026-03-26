import { useState, useRef, useEffect, useMemo, ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import { ttrpg } from "../../configs/ttrpg_theme"
import { nav_paths } from "../../configs/constants"
import { TtrpgCampaignData } from "../../utility/ttrpg_campaign_parsers"
import { searchCampaign, SearchResult, GroupedSearchResults } from "../../utility/campaign_search_utils"

interface Props {
    data: TtrpgCampaignData
    campaignId: string
    onClose: () => void
}

const groupOrder: { key: keyof GroupedSearchResults; label: string }[] = [
    { key: "lore", label: "Lore" },
    { key: "quests", label: "Quests" },
    { key: "projects", label: "Projects" },
    { key: "members", label: "Members" },
    { key: "sessions", label: "Sessions" },
    { key: "notes", label: "Notes" },
]

function getNavigationPath(result: SearchResult, campaignId: string) {
    const base = `${nav_paths.rpg_notes}/${campaignId}`
    // Sub-item member results have composite ids like "memberId:item:ItemName"
    const memberId = result.type === "member" ? result.id.split(":")[0] : result.id
    switch (result.type) {
        case "lore": return { path: `${base}/lore/${result.id}` }
        case "quest": return { path: `${base}/quest/${result.id}` }
        case "project": return { path: `${base}/project/${result.id}` }
        case "member": return { path: `${base}/party/${memberId}` }
        case "session": return { path: `${base}/session/${result.id}` }
        case "note": return {
            path: `${base}/session/${result.sessionId}`,
            state: { highlightNoteId: result.noteId },
        }
    }
}

function highlightText(text: string, searchWords: string[]): ReactNode {
    if (!searchWords.length || !text) return text
    const escaped = searchWords.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    const regex = new RegExp(`(${escaped.join("|")})`, "gi")
    const parts = text.split(regex)
    return parts.map((part, i) => {
        const isMatch = searchWords.some(w => part.toLowerCase() === w.toLowerCase())
        if (isMatch) {
            return <span key={i} style={{ color: ttrpg.colors.gold, fontWeight: 600 }}>{part}</span>
        }
        return <span key={i}>{part}</span>
    })
}

export default function CampaignSearchOverlay({ data, campaignId, onClose }: Props) {
    const [searchText, setSearchText] = useState("")
    const inputRef = useRef<HTMLInputElement>(null)
    const navigate = useNavigate()

    useEffect(() => { inputRef.current?.focus() }, [])

    const results = useMemo(() => searchCampaign(data, searchText), [data, searchText])

    const hasResults = groupOrder.some(g => results[g.key].length > 0)
    const trimmed = searchText.trim()
    const searchWords = trimmed.toLowerCase().split(/\s+/).filter(Boolean)

    function handleResultClick(result: SearchResult) {
        const nav = getNavigationPath(result, campaignId)
        onClose()
        navigate(nav.path, nav.state ? { state: nav.state } : undefined)
    }

    return (
        <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 1001, backgroundColor: ttrpg.colors.pageBg,
            display: "flex", flexDirection: "column", overflow: "hidden",
        }}>
            <div style={{
                display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
            }}>
                <button
                    onClick={onClose}
                    style={{
                        background: "none", border: "none", color: "#fff",
                        fontSize: "1.5rem", cursor: "pointer", padding: "0.25rem 0.5rem",
                    }}
                    title="Close search"
                >
                    &#x2715;
                </button>
                <input
                    ref={inputRef}
                    type="text"
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    placeholder="Search this campaign..."
                    style={{
                        flex: 1, padding: "10px 14px", fontSize: "1rem",
                        borderRadius: 8, border: "1px solid rgba(255,255,255,0.2)",
                        backgroundColor: "rgba(255,255,255,0.08)", color: "#fff",
                        outline: "none", fontFamily: ttrpg.fonts.body,
                    }}
                />
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "8px 16px" }}>
                {trimmed.length >= 2 && !hasResults && (
                    <p style={{ color: "rgba(255,255,255,0.5)", textAlign: "center", marginTop: 40 }}>
                        No results found for &lsquo;{trimmed}&rsquo;
                    </p>
                )}

                {groupOrder.map(group => {
                    const items = results[group.key]
                    if (items.length === 0) return null
                    return (
                        <div key={group.key} style={{ marginBottom: 16 }}>
                            <h3 style={{
                                color: ttrpg.colors.gold, fontFamily: ttrpg.fonts.heading,
                                fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: 1,
                                margin: "12px 0 6px",
                            }}>
                                {group.label}
                            </h3>
                            {items.map((item, idx) => (
                                <button
                                    key={item.id + "-" + idx}
                                    onClick={() => handleResultClick(item)}
                                    style={{
                                        display: "block", width: "100%", textAlign: "left",
                                        background: "rgba(255,255,255,0.05)", border: "none",
                                        borderRadius: 8, padding: "10px 14px", marginBottom: 6,
                                        cursor: "pointer", color: "#fff",
                                        transition: ttrpg.transitions.fast,
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
                                    onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                                >
                                    <div style={{
                                        fontSize: "0.95rem", fontWeight: 500,
                                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                    }}>
                                        {highlightText(item.title, searchWords)}
                                    </div>
                                    <div style={{
                                        fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", marginTop: 2,
                                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                    }}>
                                        {highlightText(item.subtitle, searchWords)}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
