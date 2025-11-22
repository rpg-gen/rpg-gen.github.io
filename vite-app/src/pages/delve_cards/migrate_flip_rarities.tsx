import { useState } from "react"
import { useNavigate } from "react-router-dom"
import useFirebaseDelveCards from "../../hooks/delve_cards/use_firebase_delve_cards"
import FullPageOverlay from "../../components/full_page_overlay"
import { nav_paths } from "../../configs/constants"

interface MigrationStep {
    status: string
    details?: string
    isError?: boolean
    isComplete?: boolean
}

export default function MigrateFlipRarities() {
    const navigate = useNavigate()
    const cardsHook = useFirebaseDelveCards()

    const [isLoading, setIsLoading] = useState(false)
    const [migrationSteps, setMigrationSteps] = useState<MigrationStep[]>([])
    const [completed, setCompleted] = useState(false)
    const [error, setError] = useState<string>("")
    const [summary, setSummary] = useState<{
        cardsUpdated: number
        conversions: { [key: string]: number }
    } | null>(null)

    function addStep(step: MigrationStep) {
        setMigrationSteps(prev => [...prev, step])
    }

    function updateLastStep(updates: Partial<MigrationStep>) {
        setMigrationSteps(prev => {
            const newSteps = [...prev]
            if (newSteps.length > 0) {
                newSteps[newSteps.length - 1] = { ...newSteps[newSteps.length - 1], ...updates }
            }
            return newSteps
        })
    }

    async function runMigration() {
        setIsLoading(true)
        setError("")
        setMigrationSteps([])
        setSummary(null)

        try {
            // Step 1: Initialize
            addStep({ status: "Initializing rarity flip migration...", details: "Preparing to flip card rarity numbering system" })

            // Step 2: Load all cards
            addStep({ status: "Loading data from database...", details: "Fetching all cards" })
            const allCards = await cardsHook.getAllCards()
            updateLastStep({
                status: "✓ Data loaded successfully",
                details: `Found ${allCards.length} cards`,
                isComplete: true
            })

            // Step 3: Analyze cards
            addStep({ status: "Analyzing cards...", details: "Counting cards at each rarity level" })
            const rarityCounts: { [key: number]: number } = {}
            allCards.forEach(card => {
                rarityCounts[card.rarity] = (rarityCounts[card.rarity] || 0) + 1
            })

            updateLastStep({
                status: `✓ Analysis complete`,
                details: `Rarity distribution: ${Object.entries(rarityCounts).map(([r, c]) => `${r}: ${c} cards`).join(", ")}`,
                isComplete: true
            })

            // Step 4: Migrate cards
            addStep({
                status: `Migrating cards...`,
                details: `Flipping rarity values for all ${allCards.length} cards`
            })

            let migratedCount = 0
            const batchSize = 10
            const conversions: { [key: string]: number } = {}

            for (let i = 0; i < allCards.length; i++) {
                const card = allCards[i]
                const oldRarity = card.rarity
                // Flip the rarity: 1→5, 2→4, 3→3, 4→2, 5→1
                const newRarity = 6 - oldRarity

                await cardsHook.updateCard(card.id, { rarity: newRarity })
                migratedCount++

                // Track conversions
                const conversionKey = `${oldRarity}→${newRarity}`
                conversions[conversionKey] = (conversions[conversionKey] || 0) + 1

                // Update progress every batch or at the end
                if (migratedCount % batchSize === 0 || migratedCount === allCards.length) {
                    updateLastStep({
                        details: `Processing: ${migratedCount} of ${allCards.length} cards completed (${Math.round(migratedCount / allCards.length * 100)}%)`
                    })
                }
            }

            updateLastStep({
                status: `✓ Migration complete`,
                details: `Successfully flipped rarity values for ${migratedCount} cards`,
                isComplete: true
            })

            // Step 5: Final verification
            addStep({ status: "Verifying migration...", details: "Checking that all cards were updated correctly" })
            const verifiedCards = await cardsHook.getAllCards()
            const newRarityCounts: { [key: number]: number } = {}
            verifiedCards.forEach(card => {
                newRarityCounts[card.rarity] = (newRarityCounts[card.rarity] || 0) + 1
            })

            updateLastStep({
                status: "✓ Verification successful",
                details: `New rarity distribution: ${Object.entries(newRarityCounts).map(([r, c]) => `${r}: ${c} cards`).join(", ")}`,
                isComplete: true
            })

            setSummary({
                cardsUpdated: migratedCount,
                conversions
            })
            setCompleted(true)

        } catch (err) {
            console.error("Migration error:", err)
            const errorMessage = err instanceof Error ? err.message : String(err)
            setError(`Error during migration: ${errorMessage}`)
            addStep({
                status: "❌ Migration failed",
                details: errorMessage,
                isError: true
            })
        }

        setIsLoading(false)
    }

    return (
        <FullPageOverlay>
            <div style={{ padding: "1rem", maxWidth: "900px", margin: "0 auto" }}>
                <h1>Delve Card Rarity Flip Migration</h1>

                <div style={{ marginBottom: "1.5rem" }}>
                    <button onClick={() => navigate(nav_paths.utilities_menu)}>
                        Back to Utilities
                    </button>
                    <button onClick={() => navigate(nav_paths.delve_card_list)} style={{ marginLeft: "0.5rem" }}>
                        Go to Card List
                    </button>
                </div>

                <div style={{
                    marginBottom: "2rem",
                    padding: "1.5rem",
                    backgroundColor: "#e3f2fd",
                    border: "1px solid #90caf9",
                    borderRadius: "4px"
                }}>
                    <h3 style={{ marginTop: 0, marginBottom: "1rem" }}>Migration Purpose</h3>
                    <p style={{ marginBottom: "1rem" }}>
                        This migration flips the rarity numbering system so higher numbers are more frequent. It will:
                    </p>
                    <ul style={{ marginBottom: "1rem", paddingLeft: "1.5rem" }}>
                        <li>Convert rarity 1 (Frequent) → rarity 5 (Frequent)</li>
                        <li>Convert rarity 2 (Boosted) → rarity 4 (Boosted)</li>
                        <li>Keep rarity 3 (Normal) → rarity 3 (Normal)</li>
                        <li>Convert rarity 4 (Rare) → rarity 2 (Rare)</li>
                        <li>Convert rarity 5 (Lost) → rarity 1 (Lost)</li>
                    </ul>
                    <p style={{ marginBottom: "1rem" }}>
                        <strong>New System:</strong>
                    </p>
                    <ul style={{ marginBottom: "1rem", paddingLeft: "1.5rem" }}>
                        <li><strong>5 - Frequent:</strong> Most common</li>
                        <li><strong>4 - Boosted:</strong> More common than normal</li>
                        <li><strong>3 - Normal:</strong> Standard frequency (DEFAULT)</li>
                        <li><strong>2 - Rare:</strong> Less common than normal</li>
                        <li><strong>1 - Lost:</strong> Most rare</li>
                    </ul>
                    <div style={{
                        padding: "0.75rem",
                        backgroundColor: "#ffcdd2",
                        border: "1px solid #ef5350",
                        borderRadius: "4px"
                    }}>
                        <strong>⚠️ Warning:</strong> This migration will update ALL cards in your database. Make sure this is what you want before proceeding. This should only be run ONCE.
                    </div>
                </div>

                {!completed && !isLoading && migrationSteps.length === 0 && (
                    <div style={{ marginBottom: "2rem", textAlign: "center" }}>
                        <button
                            onClick={runMigration}
                            style={{
                                padding: "1rem 2rem",
                                fontSize: "1.1rem",
                                backgroundColor: "#FF9800",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontWeight: "bold"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#F57C00"}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#FF9800"}
                        >
                            Run Rarity Flip Migration
                        </button>
                    </div>
                )}

                {migrationSteps.length > 0 && (
                    <div style={{
                        padding: "1.5rem",
                        border: "2px solid #ccc",
                        borderRadius: "4px",
                        backgroundColor: "#fff"
                    }}>
                        <h3 style={{ marginTop: 0, marginBottom: "1rem" }}>Migration Progress</h3>

                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            {migrationSteps.map((step, index) => (
                                <div
                                    key={index}
                                    style={{
                                        padding: "1rem",
                                        border: `1px solid ${step.isError ? "#ef5350" : step.isComplete ? "#4CAF50" : "#ccc"}`,
                                        borderRadius: "4px",
                                        backgroundColor: step.isError ? "#ffebee" : step.isComplete ? "#f1f8f4" : "#f9f9f9"
                                    }}
                                >
                                    <div style={{
                                        fontWeight: "bold",
                                        marginBottom: step.details ? "0.5rem" : 0,
                                        color: step.isError ? "#c62828" : step.isComplete ? "#2e7d32" : "#333"
                                    }}>
                                        {step.status}
                                    </div>
                                    {step.details && (
                                        <div style={{
                                            fontSize: "0.9rem",
                                            color: "#666",
                                            fontStyle: "italic"
                                        }}>
                                            {step.details}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {isLoading && (
                            <div style={{
                                marginTop: "1.5rem",
                                padding: "1rem",
                                textAlign: "center",
                                backgroundColor: "#fffbf0",
                                border: "1px solid #ffc107",
                                borderRadius: "4px"
                            }}>
                                <div style={{ fontSize: "1rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
                                    Migration in progress...
                                </div>
                                <div style={{ fontSize: "0.9rem", fontStyle: "italic", color: "#666" }}>
                                    Please wait, do not close this page
                                </div>
                            </div>
                        )}

                        {error && (
                            <div style={{
                                marginTop: "1.5rem",
                                padding: "1rem",
                                backgroundColor: "#ffcdd2",
                                border: "2px solid #ef5350",
                                borderRadius: "4px",
                                color: "#c62828"
                            }}>
                                <strong>Error:</strong> {error}
                            </div>
                        )}

                        {completed && summary && (
                            <div style={{
                                marginTop: "1.5rem",
                                padding: "1.5rem",
                                backgroundColor: "#e8f5e9",
                                border: "2px solid #4CAF50",
                                borderRadius: "4px"
                            }}>
                                <h4 style={{ marginTop: 0, marginBottom: "1rem", color: "#2e7d32" }}>
                                    ✓ Migration Complete
                                </h4>
                                <div style={{ marginBottom: "1rem" }}>
                                    <strong>Summary:</strong>
                                    <ul style={{ marginTop: "0.5rem", paddingLeft: "1.5rem" }}>
                                        <li>Total cards updated: {summary.cardsUpdated}</li>
                                        <li>Conversions made:
                                            <ul style={{ marginTop: "0.25rem" }}>
                                                {Object.entries(summary.conversions).map(([conversion, count]) => (
                                                    <li key={conversion}>{conversion}: {count} cards</li>
                                                ))}
                                            </ul>
                                        </li>
                                    </ul>
                                </div>
                                <div style={{ marginTop: "1rem" }}>
                                    <button onClick={() => navigate(nav_paths.delve_card_list)}>
                                        View Card List
                                    </button>
                                    <button onClick={() => navigate(nav_paths.utilities_menu)} style={{ marginLeft: "0.5rem" }}>
                                        Back to Utilities
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </FullPageOverlay>
    )
}

