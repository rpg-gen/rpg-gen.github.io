import { useEffect } from "react"

interface LoadingModalProps {
    message: string
    isComplete: boolean
    onClose: () => void
}

export default function LoadingModal({ message, isComplete, onClose }: LoadingModalProps) {
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") onClose()
        }
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [onClose])

    return (
        <div
            onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
            style={{
                position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1100,
                display: "flex", alignItems: "center", justifyContent: "center",
            }}
        >
            <div style={{
                backgroundColor: "#1e1e1e", borderRadius: 8, padding: 24,
                width: "90%", maxWidth: 360, color: "#fff", textAlign: "center",
                boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
            }}>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                        onClick={onClose}
                        style={{ background: "none", border: "none", color: "#999", fontSize: "1.2rem", cursor: "pointer" }}
                    >
                        ✕
                    </button>
                </div>

                {isComplete ? (
                    <div style={{ padding: "1rem 0" }}>
                        <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>&#10003;</div>
                        <p style={{ margin: 0 }}>Complete</p>
                    </div>
                ) : (
                    <div style={{ padding: "1rem 0" }}>
                        <p style={{ margin: 0 }}>{message}</p>
                    </div>
                )}

                <button
                    onClick={onClose}
                    style={{
                        marginTop: "1rem", padding: "8px 24px", borderRadius: 4,
                        border: "1px solid #555", backgroundColor: "transparent",
                        color: "#fff", cursor: "pointer",
                    }}
                >
                    Close
                </button>
            </div>
        </div>
    )
}
