import { useNavigate } from "react-router-dom"
import FullPageOverlay from "../../components/full_page_overlay"
import { nav_paths } from "../../configs/constants"

interface UtilityItem {
    title: string
    description: string
    path: string
    category: "migration" | "maintenance" | "data" | "other"
}

const utilities: UtilityItem[] = [
    {
        title: "TTRPG Data Migration",
        description: "Migrate members, notes, and lore from separate Firestore collections into campaign document maps. Requires a backup download first.",
        path: nav_paths.utility_ttrpg_data_migration,
        category: "migration"
    }
]

export default function UtilitiesMenu() {
    const navigate = useNavigate()

    const categorizedUtilities = utilities.reduce((acc, utility) => {
        if (!acc[utility.category]) {
            acc[utility.category] = []
        }
        acc[utility.category].push(utility)
        return acc
    }, {} as Record<string, UtilityItem[]>)

    const categoryNames: Record<string, string> = {
        migration: "Data Migration",
        maintenance: "Maintenance",
        data: "Data Management",
        other: "Other Utilities"
    }

    return (
        <FullPageOverlay>
            <div style={{ padding: "1rem", maxWidth: "900px", margin: "0 auto" }}>
                <h1>Utilities</h1>

                <div style={{ marginBottom: "1.5rem" }}>
                    <button onClick={() => navigate("/")}>
                        Back to Menu
                    </button>
                </div>

                <div style={{
                    marginBottom: "1.5rem",
                    padding: "1rem",
                    border: "1px solid rgba(255, 193, 7, 0.5)",
                    borderRadius: "4px",
                    backgroundColor: "rgba(255, 193, 7, 0.1)"
                }}>
                    <strong>Warning:</strong> These utilities perform data operations. Make sure you understand what each utility does before running it.
                </div>

                {Object.entries(categorizedUtilities).map(([category, items]) => (
                    <div key={category} style={{ marginBottom: "2rem" }}>
                        <h2 style={{
                            borderBottom: "2px solid currentColor",
                            paddingBottom: "0.5rem",
                            marginBottom: "1rem",
                            opacity: 0.8
                        }}>
                            {categoryNames[category] || category}
                        </h2>

                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            {items.map((utility) => (
                                <div
                                    key={utility.path}
                                    style={{
                                        border: "1px solid rgba(128, 128, 128, 0.4)",
                                        padding: "1.5rem",
                                        borderRadius: "4px",
                                        backgroundColor: "rgba(128, 128, 128, 0.1)",
                                        cursor: "pointer",
                                        transition: "all 0.2s"
                                    }}
                                    onClick={() => navigate(utility.path)}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = "rgba(128, 128, 128, 0.2)"
                                        e.currentTarget.style.borderColor = "rgba(128, 128, 128, 0.6)"
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = "rgba(128, 128, 128, 0.1)"
                                        e.currentTarget.style.borderColor = "rgba(128, 128, 128, 0.4)"
                                    }}
                                >
                                    <h3 style={{ margin: "0 0 0.5rem 0" }}>{utility.title}</h3>
                                    <p style={{ margin: 0, opacity: 0.7 }}>{utility.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {utilities.length === 0 && (
                    <div style={{
                        textAlign: "center",
                        padding: "3rem",
                        opacity: 0.6,
                        fontSize: "1.1rem"
                    }}>
                        No utilities available at this time.
                    </div>
                )}
            </div>
        </FullPageOverlay>
    )
}
