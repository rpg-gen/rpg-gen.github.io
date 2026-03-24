import RulesLookupLayout from "../../components/rules/rules_lookup_layout"
import { PAGE_LABELS, PAGE_GROUPS, PAGE_CHILDREN } from "../../configs/draw_steel_config"
import useDrawSteelRules from "../../hooks/use_draw_steel_rules"

const config = {
    title: "Draw Steel Rules",
    base_path: "/rules",
    default_page: "project-overview",
    page_labels: PAGE_LABELS,
    page_groups: PAGE_GROUPS,
    page_children: PAGE_CHILDREN,
    exit_label: "Exit Rules",
    search_placeholder: "Search rules...",
}

export default function RulesLayout() {
    const data = useDrawSteelRules()
    return <RulesLookupLayout config={config} data={data} />
}
