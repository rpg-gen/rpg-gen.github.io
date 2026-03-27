import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ttrpg } from "../../configs/ttrpg_theme"
import { mobile } from "../../configs/constants"
import { RulesSection, RulesProject } from "../../types/draw_steel_rules"
import { PageGroup } from "../../configs/draw_steel_config"
import RulesSidebar from "./rules_sidebar"
import RulesSearch from "./rules_search"
import RulesPage from "../../pages/rules/rules_page"
import useWindowSize from "../../hooks/useWindowSize"

export interface RulesLookupConfig {
    title: string
    base_path: string
    default_page: string
    page_labels: Record<string, string>
    page_groups: PageGroup[]
    page_children: Record<string, string[]>
    exit_label: string
    search_placeholder: string
}

export interface RulesLookupData {
    loading: boolean
    error: string | null
    sections_for_page: (page_key: string) => RulesSection[]
    has_sub_pages: (page_key: string) => boolean
    projects_for_page: (page_key: string) => RulesProject[]
    intro_for_page: (page_key: string) => RulesSection[]
    sections_for_project: (page_key: string, project_id: string) => RulesSection[]
    search: (query: string) => RulesSection[]
}

interface Props {
    config: RulesLookupConfig
    data: RulesLookupData
}

export default function RulesLookupLayout({ config, data }: Props) {
    const navigate = useNavigate()
    const [sidebar_open, set_sidebar_open] = useState(false)
    const [width] = useWindowSize()
    const is_mobile = width <= mobile.break_point

    function handleClose() {
        const origin = sessionStorage.getItem("rules_entry_origin")
        navigate(origin || "/")
    }

    return (
        <div style={page_style}>
            <div style={header_style}>
                {is_mobile && (
                    <button
                        onClick={() => set_sidebar_open(!sidebar_open)}
                        style={hamburger_style}
                    >
                        {sidebar_open ? "\u2715" : "\u2630"}
                    </button>
                )}
                {!is_mobile && <h1 style={title_style}>{config.title}</h1>}
                <RulesSearch
                    base_path={config.base_path}
                    page_labels={config.page_labels}
                    search={data.search}
                    projects_for_page={data.projects_for_page}
                    placeholder={config.search_placeholder}
                />
                <button
                    onClick={handleClose}
                    style={close_button_style}
                    title="Close rules"
                >
                    {"\u2715"}
                </button>
            </div>

            <div style={body_style}>
                {(!is_mobile || sidebar_open) && (
                    <div style={{
                        ...sidebar_container_style,
                        ...(is_mobile ? mobile_sidebar_style : {}),
                    }}>
                        <RulesSidebar
                            base_path={config.base_path}
                            page_labels={config.page_labels}
                            page_groups={config.page_groups}
                            page_children={config.page_children}
                            exit_label={config.exit_label}
                            on_navigate={() => set_sidebar_open(false)}
                            projects_for_page={data.projects_for_page}
                            has_sub_pages={data.has_sub_pages}
                        />
                    </div>
                )}

                <div style={content_area_style}>
                    <RulesPage
                        base_path={config.base_path}
                        default_page={config.default_page}
                        page_labels={config.page_labels}
                        page_groups={config.page_groups}
                        page_children={config.page_children}
                        sections_for_page={data.sections_for_page}
                        has_sub_pages={data.has_sub_pages}
                        projects_for_page={data.projects_for_page}
                        intro_for_page={data.intro_for_page}
                        sections_for_project={data.sections_for_project}
                        loading={data.loading}
                        error={data.error}
                    />
                </div>
            </div>
        </div>
    )
}

const page_style: React.CSSProperties = {
    height: "100vh",
    backgroundColor: ttrpg.colors.pageBg,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
}

const header_style: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    padding: "0.75rem 1rem",
    borderBottom: `1px solid ${ttrpg.colors.dividerOnDark}`,
    backgroundColor: ttrpg.colors.tabBarBg,
    backdropFilter: "blur(8px)",
    flexShrink: 0,
    zIndex: 20,
}

const title_style: React.CSSProperties = {
    fontFamily: ttrpg.fonts.heading,
    color: ttrpg.colors.gold,
    fontSize: "1.1rem",
    margin: 0,
    whiteSpace: "nowrap",
}

const hamburger_style: React.CSSProperties = {
    background: "none",
    border: "none",
    color: ttrpg.colors.textOnDark,
    fontSize: "1.3rem",
    cursor: "pointer",
    padding: "0.25rem",
}

const body_style: React.CSSProperties = {
    display: "flex",
    flex: 1,
    position: "relative",
    overflow: "hidden",
    minHeight: 0,
}

const sidebar_container_style: React.CSSProperties = {
    width: "200px",
    flexShrink: 0,
    borderRight: `1px solid ${ttrpg.colors.dividerOnDark}`,
    overflowY: "auto",
    backgroundColor: ttrpg.colors.pageBg,
}

const mobile_sidebar_style: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: "240px",
    backgroundColor: ttrpg.colors.pageBg,
    zIndex: 15,
    boxShadow: "4px 0 12px rgba(0,0,0,0.4)",
}

const close_button_style: React.CSSProperties = {
    background: "none",
    border: "none",
    color: ttrpg.colors.textOnDark,
    fontSize: "1.2rem",
    cursor: "pointer",
    padding: "0.25rem 0.5rem",
    flexShrink: 0,
}

const content_area_style: React.CSSProperties = {
    flex: 1,
    overflowY: "auto",
    minWidth: 0,
    backgroundColor: ttrpg.colors.pageBg,
}
