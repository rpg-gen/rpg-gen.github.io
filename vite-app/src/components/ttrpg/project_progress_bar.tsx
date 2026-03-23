import { ttrpg } from "../../configs/ttrpg_theme"

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
            backgroundColor: "rgba(255,255,255,0.1)",
            borderRadius: ttrpg.radius.sm,
            overflow: "hidden",
            border: `1px solid ${ttrpg.colors.dividerOnDark}`
        }}>
            <div
                className="ttrpg-progress-fill"
                style={{
                    width: `${pct}%`,
                    height: "100%",
                    backgroundColor: completed ? ttrpg.colors.success : undefined,
                    background: completed ? ttrpg.colors.success : undefined,
                }}
            />
            <span style={{
                position: "absolute",
                top: 0, left: 0, right: 0, bottom: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.75rem",
                fontWeight: "bold",
                color: ttrpg.colors.textOnDark
            }}>
                {current}/{total}
            </span>
        </div>
    )
}
