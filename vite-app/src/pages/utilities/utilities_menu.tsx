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
        title: "Delve Card Migration",
        description: "Migrate existing delve cards to the deck system. Adds all cards without deck assignments to the 'encounters' deck.",
        path: nav_paths.utility_delve_card_migration,
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
                    backgroundColor: "#fff3cd",
                    border: "1px solid #ffc107",
                    borderRadius: "4px"
                }}>
                    <strong>⚠️ Warning:</strong> These utilities perform data operations. Make sure you understand what each utility does before running it.
                </div>

                {Object.entries(categorizedUtilities).map(([category, items]) => (
                    <div key={category} style={{ marginBottom: "2rem" }}>
                        <h2 style={{
                            borderBottom: "2px solid #333",
                            paddingBottom: "0.5rem",
                            marginBottom: "1rem"
                        }}>
                            {categoryNames[category] || category}
                        </h2>

                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            {items.map((utility) => (
                                <div
                                    key={utility.path}
                                    style={{
                                        border: "1px solid #ccc",
                                        padding: "1.5rem",
                                        borderRadius: "4px",
                                        backgroundColor: "#f9f9f9",
                                        cursor: "pointer",
                                        transition: "all 0.2s"
                                    }}
                                    onClick={() => navigate(utility.path)}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = "#e8e8e8"
                                        e.currentTarget.style.borderColor = "#999"
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = "#f9f9f9"
                                        e.currentTarget.style.borderColor = "#ccc"
                                    }}
                                >
                                    <h3 style={{ margin: "0 0 0.5rem 0" }}>{utility.title}</h3>
                                    <p style={{ margin: 0, color: "#666" }}>{utility.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {utilities.length === 0 && (
                    <div style={{
                        textAlign: "center",
                        padding: "3rem",
                        color: "#666",
                        fontSize: "1.1rem"
                    }}>
                        No utilities available at this time.
                    </div>
                )}
            </div>
        </FullPageOverlay>
    )
}

