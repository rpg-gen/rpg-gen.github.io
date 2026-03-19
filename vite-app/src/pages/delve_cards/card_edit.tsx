import useCardEditForm from "../../hooks/delve_cards/use_card_edit_form"
import FullPageOverlay from "../../components/full_page_overlay"
import ChipSelector from "../../components/delve_card_chip_selector"
import CardEditActionBar from "../../components/delve_cards/card_edit_action_bar"
import RaritySelector from "../../components/delve_cards/rarity_selector"
import DicePreviewPanel from "../../components/delve_cards/dice_preview_panel"
import SyntaxHelpPanel from "../../components/delve_cards/syntax_help_panel"
import { page_layout } from "../../configs/constants"

export default function CardEdit() {
    const form = useCardEditForm()

    if (form.isLoading) {
        return <FullPageOverlay><div>Loading...</div></FullPageOverlay>
    }

    return (
        <FullPageOverlay>
            <div style={page_layout.container}>
                <h1>{form.isNewCard ? "Create New Card" : "Edit Card"}</h1>

                <div style={{
                    marginBottom: "0.5rem",
                    fontSize: "0.85rem",
                    color: "#666",
                    fontStyle: "italic",
                    minHeight: "1.2em",
                    visibility: form.draftSaved ? "visible" : "hidden"
                }}>
                    Draft saved!
                </div>

                <CardEditActionBar
                    isNewCard={form.isNewCard}
                    isSaving={form.isSaving}
                    onSave={() => form.handleSave(false)}
                    onSaveAndClose={() => form.handleSave(true)}
                    onSaveAndAddAnother={form.handleSaveAndAddAnother}
                    onDelete={form.handleDelete}
                    onDiscard={form.handleDiscard}
                    onBackToList={form.navigateToList}
                    onBackToRandom={form.navigateToRandom}
                />

                <ChipSelector
                    label="Decks"
                    items={form.availableDecks}
                    selectedIds={form.selectedDecks}
                    onSelectionChange={form.setSelectedDecks}
                    chipColorType="deck"
                    multiSelect={true}
                    manageButton={{
                        text: "Manage Decks",
                        onClick: form.navigateToManageDecks
                    }}
                />

                <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", marginBottom: "0.25rem" }}>
                        <strong>Title *</strong>
                    </label>
                    <input
                        type="text"
                        value={form.title}
                        onChange={(e) => form.setTitle(e.target.value)}
                        style={{ width: "100%", padding: "0.5rem" }}
                    />
                </div>

                <SyntaxHelpPanel />

                <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", marginBottom: "0.25rem" }}>
                        <strong>Effect</strong>
                    </label>
                    <textarea
                        value={form.effect}
                        onChange={(e) => form.setEffect(e.target.value)}
                        rows={3}
                        style={{ width: "100%", padding: "0.5rem" }}
                    />
                </div>

                <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", marginBottom: "0.25rem" }}>
                        <strong>Description</strong>
                    </label>
                    <textarea
                        value={form.description}
                        onChange={(e) => form.setDescription(e.target.value)}
                        rows={5}
                        style={{ width: "100%", padding: "0.5rem" }}
                    />
                    <div style={{ marginTop: "0.5rem" }}>
                        <button type="button" onClick={form.handlePreview}>
                            Preview Dice Rolls & Variables
                        </button>
                        {form.showPreview && (
                            <button
                                type="button"
                                onClick={() => form.setShowPreview(false)}
                                style={{ marginLeft: "0.5rem" }}
                            >
                                Hide Preview
                            </button>
                        )}
                    </div>
                </div>

                {form.showPreview && form.previewText && (
                    <DicePreviewPanel
                        rarity={form.rarity}
                        previewText={form.previewText}
                        onRollAgain={form.handlePreview}
                    />
                )}

                <RaritySelector
                    rarity={form.rarity}
                    onRarityChange={form.setRarity}
                />

                <ChipSelector
                    label="Tags"
                    items={form.availableTags}
                    selectedIds={form.selectedTags}
                    onSelectionChange={form.setSelectedTags}
                    chipColorType="tag"
                    multiSelect={true}
                    manageButton={{
                        text: "Manage Tags",
                        onClick: form.navigateToManageTags
                    }}
                />
            </div>
        </FullPageOverlay>
    )
}
