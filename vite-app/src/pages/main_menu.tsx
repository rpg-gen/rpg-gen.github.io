import { useNavigate, useLocation } from "react-router-dom"
import { useContext } from "react"

import { nav_paths } from "../configs/constants"
import UserContext from "../contexts/user_context"
import { is_admin, is_ttrpg_user } from "../configs/auth"
import { ttrpg } from "../configs/ttrpg_theme"

const PAGE_BG = ttrpg.colors.pageBg

export default function MainMenu() {
    const location = useLocation()
    const user_context = useContext(UserContext)

    let map_link_text = "Map"
    const email = user_context.username
    const show_public = !user_context.is_logged_in || is_admin(email)
    const show_rpg_notes = !user_context.is_logged_in || is_ttrpg_user(email)
    const show_admin = is_admin(email)

    if (location.pathname.includes(nav_paths.map)) {
        map_link_text = "Back to Map"
    }

    return (
        <div style={{
            minHeight: "100vh",
            backgroundColor: PAGE_BG,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem 1rem",
            boxSizing: "border-box",
        }}>
            <h1 style={{
                fontFamily: ttrpg.fonts.heading,
                color: ttrpg.colors.gold,
                fontSize: "clamp(1.8rem, 5vw, 2.8rem)",
                textAlign: "center",
                marginBottom: "0.25rem",
                letterSpacing: "0.05em",
            }}>
                RPG Gen
            </h1>
            <p style={{
                color: ttrpg.colors.textMuted,
                fontFamily: ttrpg.fonts.body,
                fontSize: "0.95rem",
                marginTop: 0,
                marginBottom: "2rem",
                textAlign: "center",
            }}>
                Tabletop tools &amp; utilities
            </p>

            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: "0.75rem",
                width: "100%",
                maxWidth: "480px",
            }}>
                {show_rpg_notes && (
                    <MenuCard label="RPG Notes" subtitle="Campaign tracker" target={nav_paths.rpg_notes} accent={ttrpg.colors.gold} />
                )}
                {show_public && (
                    <MenuCard label={map_link_text} subtitle="Hex grid editor" target={nav_paths.map} accent={ttrpg.colors.teal} />
                )}
                {show_public && (
                    <MenuCard label="Delve Cards" subtitle="Browse cards" target={nav_paths.delve_card_list} accent="#8b7ec8" />
                )}
                {show_public && (
                    <MenuCard label="Random Card" subtitle="Draw one" target={nav_paths.delve_card_random} accent="#c87e7e" />
                )}
                <MenuCard label="Account" subtitle="Login & settings" target="/account" accent={ttrpg.colors.textMuted} />
                {show_admin && (
                    <>
                        <MenuCard label="Tagger" subtitle="Admin" target="/tagger" accent="#6b7280" />
                        <MenuCard label="Feedback" subtitle="RPG Notes" target={nav_paths.feedback_management} accent="#6b7280" />
                        <MenuCard label="Utilities" subtitle="Admin" target={nav_paths.utilities_menu} accent="#6b7280" />
                    </>
                )}
            </div>
        </div>
    )
}

function MenuCard({ label, subtitle, target, accent }: { label: string; subtitle: string; target: string; accent: string }) {
    const navigate = useNavigate()

    return (
        <button
            onClick={() => navigate(target)}
            className="ttrpg-card"
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "1.25rem 0.75rem",
                backgroundColor: ttrpg.colors.cardBg,
                border: `1px solid ${ttrpg.colors.cardBorder}`,
                borderTop: `3px solid ${accent}`,
                borderRadius: ttrpg.radius.md,
                cursor: "pointer",
                textAlign: "center",
                minHeight: "80px",
            }}
        >
            <span style={{
                fontFamily: ttrpg.fonts.heading,
                fontSize: "1.05rem",
                color: ttrpg.colors.textDark,
                fontWeight: 600,
            }}>
                {label}
            </span>
            <span style={{
                fontSize: "0.8rem",
                color: ttrpg.colors.textMuted,
                marginTop: "0.25rem",
                fontFamily: ttrpg.fonts.body,
            }}>
                {subtitle}
            </span>
        </button>
    )
}
