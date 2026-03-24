export interface RulesSection {
    id: string
    heading: string
    level: number
    content: string
    page_key: string
    project_id?: string
}

export interface RulesProject {
    id: string
    heading: string
    page_key: string
}
