import { useNavigate, useLocation } from "react-router-dom"

export default function RulesBookButton() {
    const navigate = useNavigate()
    const location = useLocation()

    if (location.pathname.startsWith("/rules")) return null

    function handle_click() {
        sessionStorage.setItem("rules_entry_origin", location.pathname)
        navigate("/rules")
    }

    return (
        <button
            onClick={handle_click}
            className="ttrpg-floating-action"
            style={{
                position: "fixed",
                bottom: 20,
                right: 84,
                zIndex: 1000,
                width: 56,
                height: 56,
                borderRadius: "50%",
                backgroundColor: "#7c3aed",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                fontSize: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            }}
            title="Draw Steel Rules Reference"
        >
            &#x1F4D6;
        </button>
    )
}
