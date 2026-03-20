interface MigrationStep {
    status: string
    details?: string
    isError?: boolean
    isComplete?: boolean
}

interface MigrateDataStepsProps {
    backupDone: boolean
    isBackingUp: boolean
    isLoading: boolean
    steps: MigrationStep[]
    completed: boolean
    error: string
    cleanupDone: boolean
    onBackup: () => void
    onMigrate: () => void
    onCleanup: () => void
}

export default function MigrateDataSteps({
    backupDone, isBackingUp, isLoading, steps, completed, error, cleanupDone,
    onBackup, onMigrate, onCleanup
}: MigrateDataStepsProps) {
    return (
        <>
            <div style={infoBoxStyle}>
                <h3 style={{ marginTop: 0 }}>Migration Purpose</h3>
                <p>Moves members, session notes, and lore from separate collections into maps on each campaign document for single-read access and real-time sync.</p>
                <ul>
                    <li>Original document IDs are preserved as map keys</li>
                    <li>Session note timestamps are converted from Firestore Timestamps to ISO strings</li>
                </ul>
            </div>

            {/* Phase 1: Backup */}
            <div style={{ ...sectionStyle, borderColor: backupDone ? "rgba(76, 175, 80, 0.6)" : "rgba(255, 193, 7, 0.6)" }}>
                <h3 style={{ marginTop: 0 }}>
                    Step 1: Download Backup {backupDone && <span style={{ color: "#66bb6a" }}>&#10003;</span>}
                </h3>
                {backupDone
                    ? <p style={{ color: "#66bb6a" }}>Backup completed today. You may proceed.</p>
                    : <p>You must download a backup before running the migration.</p>
                }
                <button onClick={onBackup} disabled={isBackingUp} style={primaryBtnStyle}>
                    {isBackingUp ? "Creating backup..." : "Download Backup"}
                </button>
            </div>

            {/* Phase 2: Migration */}
            <div style={{
                ...sectionStyle,
                borderColor: completed ? "rgba(76, 175, 80, 0.6)" : "rgba(128, 128, 128, 0.4)",
                opacity: backupDone ? 1 : 0.5
            }}>
                <h3 style={{ marginTop: 0 }}>Step 2: Run Migration</h3>
                {!backupDone && <p style={{ color: "#ef5350" }}>You must download a backup before running the migration.</p>}
                {!completed && !isLoading && steps.length === 0 && (
                    <button onClick={onMigrate} disabled={!backupDone || isLoading} style={primaryBtnStyle}>
                        Run Migration
                    </button>
                )}
                {renderSteps(steps, isLoading, error)}
                {completed && <p style={{ color: "#66bb6a", fontWeight: "bold" }}>Migration complete.</p>}
            </div>

            {/* Phase 3: Cleanup */}
            {completed && !cleanupDone && (
                <div style={{ ...sectionStyle, borderColor: "rgba(255, 152, 0, 0.6)" }}>
                    <h3 style={{ marginTop: 0 }}>Step 3: Cleanup (Optional)</h3>
                    <p>Delete legacy <code>ttrpg_members</code>, <code>ttrpg_session_notes</code>, and <code>ttrpg_lore</code> documents.</p>
                    <button onClick={onCleanup} disabled={isLoading} style={{ ...primaryBtnStyle, backgroundColor: "#ff9800" }}>
                        Delete Legacy Collections
                    </button>
                </div>
            )}
            {cleanupDone && <p style={{ color: "#66bb6a" }}>Legacy collections cleaned up.</p>}
        </>
    )
}

function renderSteps(steps: MigrationStep[], isLoading: boolean, error: string) {
    if (steps.length === 0) return null
    return (
        <div style={{ marginTop: "1rem" }}>
            {steps.map((step, i) => (
                <div key={i} style={{
                    padding: "0.75rem",
                    marginBottom: "0.5rem",
                    border: `1px solid ${step.isError ? "rgba(239, 83, 80, 0.6)" : step.isComplete ? "rgba(76, 175, 80, 0.6)" : "rgba(128, 128, 128, 0.4)"}`,
                    borderRadius: "4px",
                    backgroundColor: step.isError ? "rgba(239, 83, 80, 0.1)" : step.isComplete ? "rgba(76, 175, 80, 0.1)" : "rgba(128, 128, 128, 0.05)"
                }}>
                    <div style={{ fontWeight: "bold", color: step.isError ? "#ef5350" : step.isComplete ? "#66bb6a" : "inherit" }}>
                        {step.status}
                    </div>
                    {step.details && <div style={{ fontSize: "0.9rem", opacity: 0.7, fontStyle: "italic" }}>{step.details}</div>}
                </div>
            ))}
            {isLoading && <p style={{ fontStyle: "italic", opacity: 0.7 }}>Working... please wait.</p>}
            {error && (
                <div style={{ padding: "0.75rem", backgroundColor: "rgba(239, 83, 80, 0.15)", border: "2px solid rgba(239, 83, 80, 0.6)", borderRadius: "4px", color: "#ef5350" }}>
                    <strong>Error:</strong> {error}
                </div>
            )}
        </div>
    )
}

const infoBoxStyle: React.CSSProperties = {
    marginBottom: "1.5rem", padding: "1rem", backgroundColor: "rgba(100, 181, 246, 0.1)", border: "1px solid rgba(100, 181, 246, 0.4)", borderRadius: "4px"
}
const sectionStyle: React.CSSProperties = {
    marginBottom: "1.5rem", padding: "1.5rem", border: "2px solid rgba(128, 128, 128, 0.4)", borderRadius: "4px"
}
const primaryBtnStyle: React.CSSProperties = {
    padding: "0.75rem 1.5rem", fontSize: "1rem", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold"
}
