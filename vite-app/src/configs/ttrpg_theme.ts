import React from "react"

// ==================== COLOR PALETTE ====================

const colors = {
    // Page & surface
    pageBg: "#1a1f2e",
    cardBg: "#f5f0e8",
    cardBorder: "#c9b99a",

    // Text
    textDark: "#2c2416",
    textMuted: "#6b5d4d",
    textLight: "#d4c9b8",
    textOnDark: "#e8e0d4",

    // Accents
    gold: "#c9a84c",
    goldHover: "#d4b85c",
    goldMuted: "rgba(201, 168, 76, 0.2)",
    teal: "#4a9e8e",
    tealHover: "#5ab8a6",
    danger: "#a63d2f",
    dangerHover: "#c04838",
    dangerBg: "#3a1a14",
    dangerBorder: "#6b2e24",
    success: "#3a8a5c",
    successHover: "#48a86e",

    // Entity colors (parchment tints)
    person: "#e8dfd4",
    item: "#e8dcc6",
    place: "#d4e0d4",
    faction: "#e0d4d8",
    quest: "#e8e0c8",
    project: "#dcd4e4",
    member: "#dcd0e8",

    // Overlay
    backdropBg: "rgba(10, 12, 20, 0.7)",

    // UI
    inputBg: "#fff",
    inputBorder: "#c9b99a",
    divider: "rgba(201, 168, 76, 0.3)",
    dividerOnDark: "rgba(201, 168, 76, 0.25)",

    // Broken link
    brokenLinkBg: "#3a1a14",
    brokenLinkText: "#e07060",

    // Toggle circle
    toggleActive: "#3a8a5c",
    toggleInactive: "#c9b99a",

    // Tab bar
    tabBarBg: "rgba(26, 31, 46, 0.95)",
} as const

// ==================== TYPOGRAPHY ====================

const fonts = {
    heading: "'Cinzel', serif",
    body: "'Inter', system-ui, -apple-system, sans-serif",
} as const

// ==================== SPACING & RADIUS ====================

const radius = {
    sm: "4px",
    md: "8px",
    lg: "12px",
    pill: "16px",
    circle: "50%",
} as const

// ==================== SHADOWS ====================

const shadows = {
    card: "0 1px 3px rgba(0, 0, 0, 0.08)",
    cardHover: "0 4px 12px rgba(0, 0, 0, 0.15)",
    modal: "0 8px 32px rgba(0, 0, 0, 0.4)",
    sticky: "0 2px 8px rgba(0, 0, 0, 0.3)",
} as const

// ==================== TRANSITIONS ====================

const transitions = {
    fast: "0.15s ease",
    normal: "0.2s ease",
    slow: "0.3s ease",
} as const

// ==================== COMPOSED STYLES ====================

const card: React.CSSProperties = {
    backgroundColor: colors.cardBg,
    color: colors.textDark,
    border: `1px solid ${colors.cardBorder}`,
    borderRadius: radius.md,
    padding: "0.75rem",
    marginBottom: "0.5rem",
    boxShadow: shadows.card,
}

const primaryButton: React.CSSProperties = {
    backgroundColor: colors.gold,
    color: colors.textDark,
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: radius.sm,
    cursor: "pointer",
    fontWeight: 600,
    fontFamily: fonts.body,
}

const primaryButtonSmall: React.CSSProperties = {
    ...primaryButton,
    padding: "0.25rem 0.5rem",
    fontSize: "0.8rem",
}

const dangerButton: React.CSSProperties = {
    backgroundColor: colors.danger,
    color: "#fff",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: radius.sm,
    cursor: "pointer",
    fontWeight: 600,
    fontFamily: fonts.body,
}

const secondaryButton: React.CSSProperties = {
    backgroundColor: "transparent",
    color: colors.textLight,
    border: `1px solid ${colors.cardBorder}`,
    padding: "0.5rem 1rem",
    borderRadius: radius.sm,
    cursor: "pointer",
    fontFamily: fonts.body,
}

const ghostButton: React.CSSProperties = {
    background: "none",
    border: "none",
    color: colors.textLight,
    cursor: "pointer",
    padding: "0.25rem 0.5rem",
    fontFamily: fonts.body,
}

const modalBackdrop: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.backdropBg,
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
}

const modalContent: React.CSSProperties = {
    backgroundColor: colors.cardBg,
    borderRadius: radius.lg,
    width: "600px",
    maxWidth: "90vw",
    maxHeight: "80vh",
    padding: "1.25rem",
    display: "flex",
    flexDirection: "column",
    boxShadow: shadows.modal,
    color: colors.textDark,
    position: "relative",
}

const smallModalContent: React.CSSProperties = {
    ...modalContent,
    width: "400px",
}

const tinyModalContent: React.CSSProperties = {
    ...modalContent,
    width: "360px",
    padding: "1.25rem",
}

const sectionDivider: React.CSSProperties = {
    borderTop: `1px solid ${colors.divider}`,
    paddingTop: "0.75rem",
    marginTop: "0.75rem",
    marginBottom: "0.5rem",
}

const sectionDividerOnDark: React.CSSProperties = {
    borderTop: `1px solid ${colors.dividerOnDark}`,
    paddingTop: "0.75rem",
    marginTop: "0.75rem",
    marginBottom: "0.5rem",
}

const errorBanner: React.CSSProperties = {
    backgroundColor: colors.dangerBg,
    color: colors.brokenLinkText,
    border: `1px solid ${colors.dangerBorder}`,
    borderRadius: radius.sm,
    padding: "0.75rem",
    marginBottom: "1rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
}

const pill: React.CSSProperties = {
    padding: "0.1rem 0.4rem",
    borderRadius: radius.sm,
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "inherit",
}

const clickToEdit: React.CSSProperties = {
    cursor: "pointer",
    borderBottom: `1px dashed ${colors.goldMuted}`,
}

const clickToEditOnDark: React.CSSProperties = {
    cursor: "pointer",
    borderBottom: `1px dashed rgba(212, 201, 184, 0.4)`,
}

const textarea: React.CSSProperties = {
    width: "100%",
    minHeight: "60px",
    padding: "0.5rem",
    boxSizing: "border-box",
    backgroundColor: colors.inputBg,
    border: `2px solid ${colors.cardBorder}`,
    borderRadius: radius.sm,
    resize: "none",
    overflow: "hidden",
    fontFamily: "inherit",
    fontSize: "inherit",
    lineHeight: "inherit",
    color: colors.textDark,
}

const input: React.CSSProperties = {
    padding: "0.5rem",
    boxSizing: "border-box" as const,
    backgroundColor: colors.inputBg,
    border: `1px solid ${colors.cardBorder}`,
    borderRadius: radius.sm,
    color: colors.textDark,
    fontFamily: fonts.body,
}

const stickyHeader: React.CSSProperties = {
    position: "sticky",
    top: 0,
    zIndex: 10,
    backgroundColor: colors.tabBarBg,
    backdropFilter: "blur(8px)",
    paddingBottom: "0.5rem",
}

function tabStyle(activeTab: string, tab: string): React.CSSProperties {
    const isActive = activeTab === tab
    return {
        padding: "0.5rem 1rem",
        fontWeight: isActive ? 700 : 400,
        backgroundColor: "transparent",
        color: isActive ? colors.gold : colors.textLight,
        border: "none",
        borderBottom: isActive ? `2px solid ${colors.gold}` : "2px solid transparent",
        borderRadius: 0,
        cursor: "pointer",
        marginRight: "0.25rem",
        fontFamily: fonts.body,
        transition: `color ${transitions.fast}, border-color ${transitions.fast}`,
    }
}

function toggleCircle(completed: boolean): React.CSSProperties {
    return {
        flexShrink: 0,
        width: "28px",
        height: "28px",
        borderRadius: radius.circle,
        border: `2px solid ${completed ? colors.success : colors.cardBorder}`,
        backgroundColor: completed ? colors.success : "transparent",
        color: completed ? "#fff" : "transparent",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "0.85rem",
        transition: `background-color ${transitions.fast}, border-color ${transitions.fast}`,
    }
}

function entityCard(typeColor: string): React.CSSProperties {
    return {
        ...card,
        borderLeft: `4px solid ${typeColor}`,
    }
}

function initialBadge(bgColor: string): React.CSSProperties {
    return {
        width: "36px",
        height: "36px",
        borderRadius: radius.circle,
        backgroundColor: bgColor,
        color: colors.textDark,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: "1rem",
        fontFamily: fonts.heading,
        flexShrink: 0,
    }
}

// ==================== EXPORTS ====================

export const ttrpg = {
    colors,
    fonts,
    radius,
    shadows,
    transitions,
} as const

export const themeStyles = {
    card,
    primaryButton,
    primaryButtonSmall,
    dangerButton,
    secondaryButton,
    ghostButton,
    modalBackdrop,
    modalContent,
    smallModalContent,
    tinyModalContent,
    sectionDivider,
    sectionDividerOnDark,
    errorBanner,
    pill,
    clickToEdit,
    clickToEditOnDark,
    textarea,
    input,
    stickyHeader,
    tabStyle,
    toggleCircle,
    entityCard,
    initialBadge,
} as const
