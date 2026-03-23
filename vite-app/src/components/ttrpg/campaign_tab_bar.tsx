import { themeStyles } from "../../configs/ttrpg_theme"

export type CampaignTab = "sessions" | "party" | "lore" | "quests"

interface CampaignTabBarProps {
    activeTab: string | null
    onTabClick: (tab: CampaignTab) => void
}

const TABS: { key: CampaignTab; label: string }[] = [
    { key: "sessions", label: "Sessions" },
    { key: "party", label: "Party" },
    { key: "lore", label: "Lore" },
    { key: "quests", label: "Goals" },
]

export default function CampaignTabBar({ activeTab, onTabClick }: CampaignTabBarProps) {
    return (
        <div className="ttrpg-tab-bar" style={{ marginBottom: "1rem" }}>
            {TABS.map(tab => (
                <button
                    key={tab.key}
                    className="ttrpg-tab"
                    style={themeStyles.tabStyle(activeTab ?? "", tab.key)}
                    onClick={() => onTabClick(tab.key)}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    )
}
