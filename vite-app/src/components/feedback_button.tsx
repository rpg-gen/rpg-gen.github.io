import { useState, useContext } from "react"
import UserContext from "../contexts/user_context"
import useFirebaseFeedback from "../hooks/use_firebase_feedback"
import { FeedbackType } from "../types/Feedback"

export default function FeedbackButton() {
    const user_context = useContext(UserContext)
    const { createFeedback } = useFirebaseFeedback()

    const [is_open, set_is_open] = useState(false)
    const [feedback_type, set_feedback_type] = useState<FeedbackType>("new_feature")
    const [note, set_note] = useState("")
    const [is_submitting, set_is_submitting] = useState(false)

    if (!user_context.is_logged_in) return null

    function reset_form() {
        set_feedback_type("new_feature")
        set_note("")
        set_is_open(false)
    }

    async function handle_submit() {
        if (!note.trim() || is_submitting) return
        set_is_submitting(true)
        try {
            await createFeedback({
                type: feedback_type,
                note: note.trim(),
                submitted_by: user_context.username
            })
            reset_form()
        } finally {
            set_is_submitting(false)
        }
    }

    return (
        <>
            <button
                onClick={() => set_is_open(true)}
                style={{
                    position: "fixed",
                    bottom: 20,
                    right: 20,
                    zIndex: 1000,
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    backgroundColor: "#2563eb",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 24,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.3)"
                }}
                title="Submit Feedback"
            >
                💬
            </button>

            {is_open && (
                <div
                    onClick={(e) => { if (e.target === e.currentTarget) reset_form() }}
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0,0,0,0.6)",
                        zIndex: 1001,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}
                >
                    <div style={{
                        backgroundColor: "#1e1e1e",
                        borderRadius: 8,
                        padding: 24,
                        width: "90%",
                        maxWidth: 420,
                        color: "#fff"
                    }}>
                        <h3 style={{ margin: "0 0 16px" }}>Submit Feedback</h3>

                        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                            <TypeButton
                                label="New Feature"
                                is_selected={feedback_type === "new_feature"}
                                color="#2563eb"
                                on_click={() => set_feedback_type("new_feature")}
                            />
                            <TypeButton
                                label="Bug"
                                is_selected={feedback_type === "bug"}
                                color="#dc2626"
                                on_click={() => set_feedback_type("bug")}
                            />
                        </div>

                        <textarea
                            value={note}
                            onChange={(e) => set_note(e.target.value)}
                            placeholder="Describe your feedback..."
                            rows={5}
                            style={{
                                width: "100%",
                                boxSizing: "border-box",
                                padding: 8,
                                borderRadius: 4,
                                border: "1px solid #555",
                                backgroundColor: "#2a2a2a",
                                color: "#fff",
                                resize: "vertical",
                                fontSize: 14
                            }}
                        />

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
                            <button onClick={reset_form} style={cancel_button_style}>Cancel</button>
                            <button
                                onClick={handle_submit}
                                disabled={!note.trim() || is_submitting}
                                style={{
                                    ...submit_button_style,
                                    opacity: (!note.trim() || is_submitting) ? 0.5 : 1
                                }}
                            >
                                {is_submitting ? "Submitting..." : "Submit"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

function TypeButton(props: { label: string; is_selected: boolean; color: string; on_click: () => void }) {
    return (
        <button
            onClick={props.on_click}
            style={{
                padding: "6px 16px",
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

const cancel_button_style: React.CSSProperties = {
    padding: "8px 16px",
    borderRadius: 4,
    border: "1px solid #555",
    backgroundColor: "transparent",
    color: "#fff",
    cursor: "pointer"
}

const submit_button_style: React.CSSProperties = {
    padding: "8px 16px",
    borderRadius: 4,
    border: "none",
    backgroundColor: "#2563eb",
    color: "#fff",
    cursor: "pointer"
}
