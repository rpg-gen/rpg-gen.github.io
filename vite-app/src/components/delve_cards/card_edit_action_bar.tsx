interface CardEditActionBarProps {
    isNewCard: boolean
    isSaving: boolean
    onSave: () => void
    onSaveAndClose: () => void
    onSaveAndAddAnother: () => void
    onDelete: () => void
    onDiscard: () => void
    onBackToList: () => void
    onBackToRandom: () => void
}

export default function CardEditActionBar({
    isNewCard,
    isSaving,
    onSave,
    onSaveAndClose,
    onSaveAndAddAnother,
    onDelete,
    onDiscard,
    onBackToList,
    onBackToRandom,
}: CardEditActionBarProps) {
    return (
        <div style={{ marginBottom: "1rem" }}>
            <button onClick={onSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save"}
            </button>
            <button onClick={onSaveAndClose} disabled={isSaving} style={{ marginLeft: "0.5rem" }}>
                {isSaving ? "Saving..." : "Save & Close"}
            </button>
            {isNewCard && (
                <button onClick={onSaveAndAddAnother} disabled={isSaving} style={{ marginLeft: "0.5rem" }}>
                    {isSaving ? "Saving..." : "Save & Add Another"}
                </button>
            )}
            {!isNewCard && (
                <button onClick={onDelete} style={{ marginLeft: "0.5rem" }}>
                    Delete
                </button>
            )}
            <button onClick={onDiscard} style={{ marginLeft: "0.5rem" }}>
                Discard Changes
            </button>
            <button onClick={onBackToList} style={{ marginLeft: "0.5rem" }}>
                Back to List
            </button>
            <button onClick={onBackToRandom} style={{ marginLeft: "0.5rem" }}>
                Back to Random Card
            </button>
        </div>
    )
}
