import { useState } from "react"

export default function SyntaxHelpPanel() {
    const [showSyntaxHelp, setShowSyntaxHelp] = useState(false)

    return (
        <div style={{ marginBottom: "1rem" }}>
            <button
                type="button"
                onClick={() => setShowSyntaxHelp(!showSyntaxHelp)}
                style={{
                    marginBottom: "0.5rem",
                    padding: "0.4rem 0.8rem",
                    fontSize: "0.9rem",
                    backgroundColor: "#e3f2fd",
                    border: "1px solid #90caf9",
                    borderRadius: "4px",
                    cursor: "pointer"
                }}
            >
                {showSyntaxHelp ? "Hide" : "Show"} Dice & Variable Syntax Help
            </button>

            {showSyntaxHelp && (
                <div style={{
                    padding: "0.75rem",
                    backgroundColor: "#e3f2fd",
                    border: "1px solid #90caf9",
                    borderRadius: "4px",
                    fontSize: "0.9rem",
                    boxSizing: "border-box",
                    width: "100%",
                    overflowWrap: "break-word",
                    wordWrap: "break-word"
                }}>
                    <strong>Dice & Variable Syntax:</strong>
                    <ul style={{ marginTop: "0.5rem", marginBottom: 0, paddingLeft: "1.5rem", margin: 0 }}>
                        <li style={{ marginBottom: "0.25rem" }}>Dice rolls: <code>&lt;1d6&gt;</code>, <code>&lt;2d10&gt;</code>, etc.</li>
                        <li style={{ marginBottom: "0.25rem" }}>Variables in Effect: <code>&lt;supply = 10 - 1d3&gt;</code> (will be hidden when drawn)</li>
                        <li style={{ marginBottom: "0.25rem" }}>Variables can reference other variables: <code>&lt;cost = supply * 2&gt;</code></li>
                        <li style={{ marginBottom: "0.25rem" }}>Use variables in Effect or Description: <code>&lt;supply&gt;</code> (will show the calculated value)</li>
                        <li>Math operators: +, -, *, /, ()</li>
                    </ul>
                </div>
            )}
        </div>
    )
}
