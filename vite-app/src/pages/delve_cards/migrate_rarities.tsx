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

export default function MigrateRarities() {
    const navigate = useNavigate()
    const cardsHook = useFirebaseDelveCards()

    const [isLoading, setIsLoading] = useState(false)
    const [migrationSteps, setMigrationSteps] = useState<MigrationStep[]>([])
    const [completed, setCompleted] = useState(false)
    const [error, setError] = useState<string>("")
    const [summary, setSummary] = useState<{
        cardsUpdated: number
        rarity1to3: number
        rarity2to3: number
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
            addStep({ status: "Initializing rarity migration...", details: "Preparing to update card rarity system" })

            // Step 2: Load all cards
            addStep({ status: "Loading data from database...", details: "Fetching all cards" })
            const allCards = await cardsHook.getAllCards()
            updateLastStep({
                status: "✓ Data loaded successfully",
                details: `Found ${allCards.length} cards`,
                isComplete: true
            })

            // Step 3: Analyze cards
            addStep({ status: "Analyzing cards...", details: "Identifying cards that need rarity updates" })
            const cardsWithRarity1 = allCards.filter(card => card.rarity === 1)
            const cardsWithRarity2 = allCards.filter(card => card.rarity === 2)
            const cardsToMigrate = [...cardsWithRarity1, ...cardsWithRarity2]

            if (cardsToMigrate.length === 0) {
                updateLastStep({
                    status: "✓ Analysis complete - No migration needed",
                    details: "All cards already have rarity 3 or higher",
                    isComplete: true
                })
                setSummary({
                    cardsUpdated: 0,
                    rarity1to3: 0,
                    rarity2to3: 0
                })
                setCompleted(true)
                setIsLoading(false)
                return
            }

            updateLastStep({
                status: `✓ Analysis complete`,
                details: `${cardsToMigrate.length} cards need rarity updates (${cardsWithRarity1.length} from rarity 1, ${cardsWithRarity2.length} from rarity 2)`,
                isComplete: true
            })

            // Step 4: Migrate cards
            addStep({
                status: `Migrating cards...`,
                details: `Processing ${cardsToMigrate.length} cards`
            })

            let migratedCount = 0
            const batchSize = 10

            for (let i = 0; i < cardsToMigrate.length; i++) {
                const card = cardsToMigrate[i]
                // Set rarity to 3 (the new default/normal)
                await cardsHook.updateCard(card.id, { rarity: 3 })
                migratedCount++

                // Update progress every batch or at the end
                if (migratedCount % batchSize === 0 || migratedCount === cardsToMigrate.length) {
                    updateLastStep({
                        details: `Processing: ${migratedCount} of ${cardsToMigrate.length} cards completed (${Math.round(migratedCount / cardsToMigrate.length * 100)}%)`
                    })
                }
            }

            updateLastStep({
                status: `✓ Migration complete`,
                details: `Successfully updated ${migratedCount} cards to rarity 3 (Normal)`,
                isComplete: true
            })

            // Step 5: Final verification
            addStep({ status: "Verifying migration...", details: "Checking that all cards were updated correctly" })
            const verifiedCards = await cardsHook.getAllCards()
            const remainingRarity1or2 = verifiedCards.filter(card => card.rarity === 1 || card.rarity === 2)

            if (remainingRarity1or2.length === 0) {
                updateLastStep({
                    status: "✓ Verification successful",
                    details: "All previously rarity 1 or 2 cards now have rarity 3",
                    isComplete: true
                })
            } else {
                updateLastStep({
                    status: "⚠ Verification warning",
                    details: `${remainingRarity1or2.length} cards still have rarity 1 or 2 (these may have been added during migration)`,
                    isComplete: true
                })
            }

            setSummary({
                cardsUpdated: migratedCount,
                rarity1to3: cardsWithRarity1.length,
                rarity2to3: cardsWithRarity2.length
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
                <h1>Delve Card Rarity Migration</h1>

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
                        This migration updates your delve cards to use the new rarity system. It will:
                    </p>
                    <ul style={{ marginBottom: "1rem", paddingLeft: "1.5rem" }}>
                        <li>Change all cards with rarity 1 (Common) to rarity 3 (Normal)</li>
                        <li>Change all cards with rarity 2 (Uncommon) to rarity 3 (Normal)</li>
                        <li>Make rarity 3 (Normal) the new default</li>
                    </ul>
                    <p style={{ marginBottom: "1rem" }}>
                        <strong>New Rarity System:</strong>
                    </p>
                    <ul style={{ marginBottom: "1rem", paddingLeft: "1.5rem" }}>
                        <li><strong>1 - Frequent:</strong> More common than normal (appears more often)</li>
                        <li><strong>2 - Boosted:</strong> Slightly more common than normal</li>
                        <li><strong>3 - Normal:</strong> Standard frequency (NEW DEFAULT)</li>
                        <li><strong>4 - Rare:</strong> Less common than normal</li>
                        <li><strong>5 - Lost:</strong> Very rare (appears very infrequently)</li>
                    </ul>
                    <div style={{
                        padding: "0.75rem",
                        backgroundColor: "#fff3cd",
                        border: "1px solid #ffc107",
                        borderRadius: "4px"
                    }}>
                        <strong>Note:</strong> This migration is safe to run multiple times. It will only update cards with rarity 1 or 2.
                    </div>
                </div>

                {!completed && !isLoading && migrationSteps.length === 0 && (
                    <div style={{ marginBottom: "2rem", textAlign: "center" }}>
                        <button
                            onClick={runMigration}
                            style={{
                                padding: "1rem 2rem",
                                fontSize: "1.1rem",
                                backgroundColor: "#4CAF50",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontWeight: "bold"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#45a049"}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#4CAF50"}
                        >
                            Run Rarity Migration
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
                                        <li>Cards changed from rarity 1 to 3: {summary.rarity1to3}</li>
                                        <li>Cards changed from rarity 2 to 3: {summary.rarity2to3}</li>
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

