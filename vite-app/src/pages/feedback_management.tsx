import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import FullPageOverlay from "../components/full_page_overlay"
import useFirebaseFeedback from "../hooks/use_firebase_feedback"
import Feedback, { FeedbackType } from "../types/Feedback"
import { page_layout } from "../configs/constants"

export default function FeedbackManagement() {
    const navigate = useNavigate()
    const { getAllFeedback, updateFeedback, deleteFeedback } = useFirebaseFeedback()

    const [items, set_items] = useState<Feedback[]>([])
    const [editing_id, set_editing_id] = useState<string | null>(null)
    const [edit_type, set_edit_type] = useState<FeedbackType>("new_feature")
    const [edit_note, set_edit_note] = useState("")

    useEffect(() => {
        getAllFeedback().then(set_items)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    function start_edit(item: Feedback) {
        set_editing_id(item.id)
        set_edit_type(item.type)
        set_edit_note(item.note)
    }

    function cancel_edit() {
        set_editing_id(null)
        set_edit_note("")
    }

    async function save_edit(id: string) {
        await updateFeedback(id, { type: edit_type, note: edit_note.trim() })
        set_editing_id(null)
        const refreshed = await getAllFeedback()
        set_items(refreshed)
    }

    async function handle_delete(id: string) {
        if (!window.confirm("Delete this feedback item?")) return
        await deleteFeedback(id)
        set_items(items.filter((i) => i.id !== id))
    }

    function format_date(iso: string): string {
        if (!iso) return ""
        return new Date(iso).toLocaleDateString("en-US", {
            year: "numeric", month: "short", day: "numeric",
            hour: "2-digit", minute: "2-digit"
        })
    }

    return (
        <FullPageOverlay>
            <div style={page_layout.container}>
                <button onClick={() => navigate("/")} style={{ marginBottom: 16 }}>Back</button>
                <h2 style={{ margin: "0 0 16px" }}>Feedback</h2>

                {items.length === 0 && <p>No feedback submitted yet.</p>}

                {items.map((item) => (
                    <div key={item.id} style={card_style}>
                        {editing_id === item.id ? (
                            <EditForm
                                edit_type={edit_type}
                                edit_note={edit_note}
                                set_edit_type={set_edit_type}
                                set_edit_note={set_edit_note}
                                on_save={() => save_edit(item.id)}
                                on_cancel={cancel_edit}
                            />
                        ) : (
                            <DisplayItem
                                item={item}
                                format_date={format_date}
                                on_edit={() => start_edit(item)}
                                on_delete={() => handle_delete(item.id)}
                            />
                        )}
                    </div>
                ))}
            </div>
        </FullPageOverlay>
    )
}

function TypeBadge(props: { type: FeedbackType }) {
    const is_bug = props.type === "bug"
    return (
        <span style={{
            display: "inline-block",
            padding: "2px 10px",
            borderRadius: 12,
            fontSize: 12,
            fontWeight: "bold",
            backgroundColor: is_bug ? "#dc2626" : "#2563eb",
            color: "#fff"
        }}>
            {is_bug ? "Bug" : "Feature"}
        </span>
    )
}

function DisplayItem(props: {
    item: Feedback
    format_date: (iso: string) => string
    on_edit: () => void
    on_delete: () => void
}) {
    const { item, format_date, on_edit, on_delete } = props
    return (
        <>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <TypeBadge type={item.type} />
                <span style={{ fontSize: 12, color: "#aaa" }}>{format_date(item.created_at)}</span>
            </div>
            <p style={{ margin: "0 0 8px", whiteSpace: "pre-wrap" }}>{item.note}</p>
            <div style={{ fontSize: 12, color: "#aaa", marginBottom: 8 }}>
                Submitted by: {item.submitted_by}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
                <button onClick={on_edit}>Edit</button>
                <button onClick={on_delete} style={{ color: "#f87171" }}>Delete</button>
            </div>
        </>
    )
}

function EditForm(props: {
    edit_type: FeedbackType
    edit_note: string
    set_edit_type: (t: FeedbackType) => void
    set_edit_note: (n: string) => void
    on_save: () => void
    on_cancel: () => void
}) {
    return (
        <>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <EditTypeButton
                    label="Feature"
                    is_selected={props.edit_type === "new_feature"}
                    color="#2563eb"
                    on_click={() => props.set_edit_type("new_feature")}
                />
                <EditTypeButton
                    label="Bug"
                    is_selected={props.edit_type === "bug"}
                    color="#dc2626"
                    on_click={() => props.set_edit_type("bug")}
                />
            </div>
            <textarea
                value={props.edit_note}
                onChange={(e) => props.set_edit_note(e.target.value)}
                rows={4}
                style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: 8,
                    borderRadius: 4,
                    border: "1px solid #555",
                    backgroundColor: "#2a2a2a",
                    color: "#fff",
                    resize: "vertical",
                    marginBottom: 8
                }}
            />
            <div style={{ display: "flex", gap: 8 }}>
                <button onClick={props.on_save}>Save</button>
                <button onClick={props.on_cancel}>Cancel</button>
            </div>
        </>
    )
}

function EditTypeButton(props: { label: string; is_selected: boolean; color: string; on_click: () => void }) {
    return (
        <button
            onClick={props.on_click}
            style={{
                padding: "4px 12px",
                borderRadius: 4,
                border: `2px solid ${props.color}`,
                backgroundColor: props.is_selected ? props.color : "transparent",
                color: "#fff",
                cursor: "pointer",
                fontWeight: props.is_selected ? "bold" : "normal"
            }}
        >
            {props.label}
        </button>
    )
}

const card_style: React.CSSProperties = {
    backgroundColor: "#2a2a2a",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12
}
