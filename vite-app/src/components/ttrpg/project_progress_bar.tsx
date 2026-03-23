import { PROJECT_COLOR } from "../../configs/ttrpg_constants"

interface ProjectProgressBarProps {
    current: number
    total: number
    completed?: boolean
}

export default function ProjectProgressBar({ current, total, completed }: ProjectProgressBarProps) {
    const pct = total > 0 ? Math.min(100, Math.max(0, (current / total) * 100)) : 0

    return (
        <div style={{
            position: "relative",
            height: "22px",
            backgroundColor: "#eee",
            borderRadius: "4px",
            overflow: "hidden",
            border: "1px solid #ccc"
        }}>
            <div style={{
                width: `${pct}%`,
                height: "100%",
                backgroundColor: completed ? "#27ae60" : PROJECT_COLOR,
                transition: "width 0.3s ease"
            }} />
            <span style={{
                position: "absolute",
                top: 0, left: 0, right: 0, bottom: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.75rem",
                fontWeight: "bold",
                color: "#333"
            }}>
                {current}/{total}
            </span>
        </div>
    )
}
