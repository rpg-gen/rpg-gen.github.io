import { ttrpg } from "../../configs/ttrpg_theme"

interface Props {
    onClick: () => void
}

export default function CampaignSearchFab({ onClick }: Props) {
    return (
        <button
            onClick={onClick}
            className="ttrpg-floating-action"
            style={{
                position: "fixed",
                bottom: 20,
                right: 148,
                zIndex: 1000,
                width: 56,
                height: 56,
                borderRadius: "50%",
                backgroundColor: ttrpg.colors.gold,
                color: "#fff",
                border: "none",
                cursor: "pointer",
                fontSize: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            }}
            title="Search Campaign"
        >
            &#x1F50D;
        </button>
    )
}
