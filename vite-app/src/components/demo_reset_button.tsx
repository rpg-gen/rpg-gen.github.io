import { useState, useContext } from "react"
import UserContext from "../contexts/user_context"
import { resetDemoCampaign } from "../hooks/ttrpg/demo_storage"
import LoadingModal from "./loading_modal"

export default function DemoResetButton() {
    const user_context = useContext(UserContext)
    const [showModal, setShowModal] = useState(false)
    const [isComplete, setIsComplete] = useState(false)

    if (!user_context.is_auth_checked || user_context.is_logged_in) return null

    function handleClick() {
        if (!window.confirm("Reset all demo data? This will replace your local changes with the original sample data.")) return
        setShowModal(true)
        setIsComplete(false)
        resetDemoCampaign()
        setTimeout(() => setIsComplete(true), 400)
    }

    function handleClose() {
        setShowModal(false)
        setIsComplete(false)
        window.location.reload()
    }

    return (
        <>
            <button
                onClick={handleClick}
                style={{
                    position: "fixed",
                    bottom: 20,
                    right: 84,
                    zIndex: 1000,
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    backgroundColor: "#6b7280",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 22,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                }}
                title="Reset demo data"
            >
                &#8634;
            </button>
            {showModal && (
                <LoadingModal
                    message="Resetting demo data..."
                    isComplete={isComplete}
                    onClose={handleClose}
                />
            )}
        </>
    )
}
