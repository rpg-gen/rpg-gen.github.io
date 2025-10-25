import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import useFirebaseDelveCardTags from "../../hooks/delve_cards/use_firebase_delve_card_tags"
import DelveCardTag from "../../types/delve_cards/DelveCardTag"
import FullPageOverlay from "../../components/full_page_overlay"
import { nav_paths } from "../../configs/constants"

export default function TagManagement() {
    const navigate = useNavigate()
    const location = useLocation()
    const tagsHook = useFirebaseDelveCardTags()
    
    // Get the return path from navigation state, default to card list
    const returnPath = (location.state as { returnPath?: string })?.returnPath || nav_paths.delve_card_list

    const [tags, setTags] = useState<DelveCardTag[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [newTagName, setNewTagName] = useState("")
    const [editingTagId, setEditingTagId] = useState<string | null>(null)
    const [editingTagName, setEditingTagName] = useState("")

    useEffect(() => {
        loadTags()
    }, [])

    async function loadTags() {
        setIsLoading(true)
        try {
            const loadedTags = await tagsHook.getAllTags()
            setTags(loadedTags)
        } catch (error) {
            console.error("Error loading tags:", error)
        }
        setIsLoading(false)
    }

    async function handleCreateTag() {
        if (!newTagName.trim()) {
            alert("Tag name is required")
            return
        }

        try {
            await tagsHook.createTag({ name: newTagName.trim() })
            setNewTagName("")
            await loadTags()
        } catch (error) {
            console.error("Error creating tag:", error)
            alert("Error creating tag")
        }
    }

    async function handleUpdateTag(tagId: string) {
        if (!editingTagName.trim()) {
            alert("Tag name is required")
            return
        }

        try {
            await tagsHook.updateTag(tagId, { name: editingTagName.trim() })
            setEditingTagId(null)
            setEditingTagName("")
            await loadTags()
        } catch (error) {
            console.error("Error updating tag:", error)
            alert("Error updating tag")
        }
    }

    async function handleDeleteTag(tagId: string) {
        if (confirm("Are you sure you want to delete this tag? Cards with this tag will keep the tag ID but it won't display correctly.")) {
            try {
                await tagsHook.deleteTag(tagId)
                await loadTags()
            } catch (error) {
                console.error("Error deleting tag:", error)
                alert("Error deleting tag")
            }
        }
    }

    function startEditing(tag: DelveCardTag) {
        setEditingTagId(tag.id)
        setEditingTagName(tag.name)
    }

    function cancelEditing() {
        setEditingTagId(null)
        setEditingTagName("")
    }

    if (isLoading) {
        return <FullPageOverlay><div>Loading tags...</div></FullPageOverlay>
    }

    return (
        <FullPageOverlay>
            <div style={{ padding: "1rem", maxWidth: "600px", margin: "0 auto" }}>
                <h1>Manage Tags</h1>

                <div style={{ marginBottom: "1rem" }}>
                    <button onClick={() => navigate(returnPath)}>
                        {returnPath === nav_paths.delve_card_list ? "Back to Card List" : "Back to Card"}
                    </button>
                </div>

                <div style={{ marginBottom: "2rem", padding: "1rem", border: "1px solid #ccc", backgroundColor: "#f9f9f9" }}>
                    <h3 style={{ marginTop: 0 }}>Create New Tag</h3>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                        <input
                            type="text"
                            value={newTagName}
                            onChange={(e) => setNewTagName(e.target.value)}
                            placeholder="Tag name"
                            style={{ flex: 1, padding: "0.5rem" }}
                            onKeyPress={(e) => e.key === "Enter" && handleCreateTag()}
                        />
                        <button onClick={handleCreateTag}>Create</button>
                    </div>
                </div>

                <div>
                    <h3>Existing Tags ({tags.length})</h3>
                    {tags.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "2rem", color: "#666" }}>
                            No tags yet. Create your first tag above!
                        </div>
                    ) : (
                        tags.map(tag => (
                            <div
                                key={tag.id}
                                style={{
                                    border: "1px solid #ccc",
                                    padding: "0.75rem",
                                    marginBottom: "0.5rem",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem"
                                }}
                            >
                                {editingTagId === tag.id ? (
                                    <>
                                        <input
                                            type="text"
                                            value={editingTagName}
                                            onChange={(e) => setEditingTagName(e.target.value)}
                                            style={{ flex: 1, padding: "0.5rem" }}
                                            onKeyPress={(e) => e.key === "Enter" && handleUpdateTag(tag.id)}
                                        />
                                        <button onClick={() => handleUpdateTag(tag.id)}>Save</button>
                                        <button onClick={cancelEditing}>Cancel</button>
                                    </>
                                ) : (
                                    <>
                                        <div style={{ flex: 1 }}>{tag.name}</div>
                                        <button onClick={() => startEditing(tag)}>Edit</button>
                                        <button onClick={() => handleDeleteTag(tag.id)}>Delete</button>
                                    </>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </FullPageOverlay>
    )
}

