import { useState } from "react"
import { useNavigate } from "react-router-dom"
import useFirebaseDelveCards from "../../hooks/delve_cards/use_firebase_delve_cards"
import useFirebaseDelveCardDecks from "../../hooks/delve_cards/use_firebase_delve_card_decks"
import FullPageOverlay from "../../components/full_page_overlay"
import { nav_paths } from "../../configs/constants"

interface MigrationStep {
    status: string
    details?: string
    isError?: boolean
    isComplete?: boolean
}

export default function MigrateToDecks() {
    const navigate = useNavigate()
    const cardsHook = useFirebaseDelveCards()
    const decksHook = useFirebaseDelveCardDecks()

    const [isLoading, setIsLoading] = useState(false)
    const [migrationSteps, setMigrationSteps] = useState<MigrationStep[]>([])
    const [completed, setCompleted] = useState(false)
    const [error, setError] = useState<string>("")
    const [summary, setSummary] = useState<{
        cardsProcessed: number
        deckCreated: boolean
        deckName: string
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

        const DECK_NAME = "encounters"

        try {
            // Step 1: Initialize
            addStep({ status: "Initializing migration...", details: "Preparing to migrate delve cards to deck system" })

            // Step 2: Load all cards and decks
            addStep({ status: "Loading data from database...", details: "Fetching all cards and existing decks" })
            const [allCards, allDecks] = await Promise.all([
                cardsHook.getAllCards(),
                decksHook.getAllDecks()
            ])
            updateLastStep({
                status: "✓ Data loaded successfully",
                details: `Found ${allCards.length} cards and ${allDecks.length} existing decks`,
                isComplete: true
            })

            // Step 3: Find or create "encounters" deck
            addStep({ status: `Checking for '${DECK_NAME}' deck...`, details: "Looking for existing deck or creating new one" })
            let encountersDeck = allDecks.find(d => d.name.toLowerCase() === DECK_NAME.toLowerCase())
            let deckWasCreated = false

            if (!encountersDeck) {
                const newDeckId = await decksHook.createDeck({ name: DECK_NAME })
                encountersDeck = { id: newDeckId, name: DECK_NAME }
                deckWasCreated = true
                updateLastStep({
                    status: `✓ Created '${DECK_NAME}' deck`,
                    details: `New deck created with ID: ${newDeckId}`,
                    isComplete: true
                })
            } else {
                updateLastStep({
                    status: `✓ Found existing '${DECK_NAME}' deck`,
                    details: `Using deck ID: ${encountersDeck.id}`,
                    isComplete: true
                })
            }

            // Step 4: Analyze cards
            addStep({ status: "Analyzing cards...", details: "Identifying cards that need migration" })
            const cardsToMigrate = allCards.filter(card =>
                !card.decks || card.decks.length === 0 || !card.decks.includes(encountersDeck!.id)
            )

            if (cardsToMigrate.length === 0) {
                updateLastStep({
                    status: "✓ Analysis complete - No migration needed",
                    details: "All cards are already assigned to the encounters deck",
                    isComplete: true
                })
                setSummary({
                    cardsProcessed: 0,
                    deckCreated: deckWasCreated,
                    deckName: DECK_NAME
                })
                setCompleted(true)
                setIsLoading(false)
                return
            }

            updateLastStep({
                status: `✓ Analysis complete`,
                details: `${cardsToMigrate.length} cards need to be added to the '${DECK_NAME}' deck`,
                isComplete: true
            })

            // Step 5: Migrate cards
            addStep({
                status: `Migrating cards...`,
                details: `Processing ${cardsToMigrate.length} cards`
            })

            let migratedCount = 0
            const batchSize = 10

            for (let i = 0; i < cardsToMigrate.length; i++) {
                const card = cardsToMigrate[i]
                const updatedDecks = card.decks || []
                if (!updatedDecks.includes(encountersDeck.id)) {
                    updatedDecks.push(encountersDeck.id)
                }

                await cardsHook.updateCard(card.id, { decks: updatedDecks })
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
                details: `Successfully added ${migratedCount} cards to the '${DECK_NAME}' deck`,
                isComplete: true
            })

            // Step 6: Final verification
            addStep({ status: "Verifying migration...", details: "Checking that all cards were updated correctly" })
            const verifiedCards = await cardsHook.getAllCards()
            const remainingUnassigned = verifiedCards.filter(card =>
                !card.decks || card.decks.length === 0
            )

            if (remainingUnassigned.length === 0) {
                updateLastStep({
                    status: "✓ Verification successful",
                    details: "All cards now have deck assignments",
                    isComplete: true
                })
            } else {
                updateLastStep({
                    status: "⚠ Verification warning",
                    details: `${remainingUnassigned.length} cards still have no deck assignments (these may have been added during migration)`,
                    isComplete: true
                })
            }

            setSummary({
                cardsProcessed: migratedCount,
                deckCreated: deckWasCreated,
                deckName: DECK_NAME
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
                <h1>Delve Card Migration</h1>

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
                        This migration tool updates your delve cards to use the new deck system. It will:
                    </p>
                    <ul style={{ marginBottom: "1rem", paddingLeft: "1.5rem" }}>
                        <li>Create an "encounters" deck if it doesn't already exist</li>
                        <li>Add all existing cards without deck assignments to the "encounters" deck</li>
                        <li>Preserve any existing deck assignments on cards</li>
                        <li>Verify that all cards were updated correctly</li>
                    </ul>
                    <div style={{
                        padding: "0.75rem",
                        backgroundColor: "#fff3cd",
                        border: "1px solid #ffc107",
                        borderRadius: "4px"
                    }}>
                        <strong>Note:</strong> This migration is safe to run multiple times. It will only update cards that need it.
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
                            Run Migration
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
                                        <li>Deck: "{summary.deckName}" {summary.deckCreated ? "(created new)" : "(used existing)"}</li>
                                        <li>Cards processed: {summary.cardsProcessed}</li>
                                    </ul>
                                </div>
                                <div style={{ marginTop: "1rem" }}>
                                    <button onClick={() => navigate(nav_paths.delve_card_list)}>
                                        View Card List
                                    </button>
                                    <button onClick={() => navigate(nav_paths.delve_card_decks)} style={{ marginLeft: "0.5rem" }}>
                                        Manage Decks
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

