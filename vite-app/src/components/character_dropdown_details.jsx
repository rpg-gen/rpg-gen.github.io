import CharacterInventory from "./character_inventory.jsx";

export default function CharacterDropdownDetails({character_id}) {
    return <div>
        <p><strong>Inventory</strong></p>
        <CharacterInventory character_id={character_id} />
        <p><strong>Abilities</strong></p>
        <p><strong>Details</strong></p>
    </div>
}