import React from "react"

export const cardStyle: React.CSSProperties = {
    backgroundColor: "#fff",
    color: "#222",
    border: "1px solid #ccc",
    borderRadius: "4px",
    padding: "0.75rem",
    marginBottom: "0.5rem"
}

export const primaryButtonStyle: React.CSSProperties = {
    backgroundColor: "#27ae60",
    color: "#fff",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "4px",
    cursor: "pointer"
}

export const primaryButtonSmallStyle: React.CSSProperties = {
    ...primaryButtonStyle,
    padding: "0.25rem 0.5rem",
    fontSize: "0.8rem"
}

export const textareaStyle: React.CSSProperties = {
    width: "100%",
    minHeight: "60px",
    padding: "0.5rem",
    boxSizing: "border-box",
    backgroundColor: "#fff",
    border: "2px solid #555",
    borderRadius: "4px",
    resize: "none",
    overflow: "hidden",
    fontFamily: "inherit",
    fontSize: "inherit",
    lineHeight: "inherit"
}

export function tabStyle(activeTab: string, tab: string): React.CSSProperties {
    return {
        padding: "0.5rem 1rem",
        fontWeight: activeTab === tab ? "bold" : "normal",
        backgroundColor: activeTab === tab ? "#fff" : "transparent",
        color: activeTab === tab ? "#222" : "rgba(255,255,255,0.5)",
        border: activeTab === tab ? "1px solid #ccc" : "1px solid rgba(255,255,255,0.3)",
        borderRadius: "4px",
        cursor: "pointer",
        marginRight: "0.25rem"
    }
}
