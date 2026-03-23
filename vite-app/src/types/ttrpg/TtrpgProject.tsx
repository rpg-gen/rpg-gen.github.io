export interface TtrpgProjectContribution {
    contributor_name: string
    contributor_id: string
    contributor_type: "member" | "follower"
    points: number
    session_id: string
    member_id?: string
}

export interface TtrpgProjectData {
    title: string
    description: string
    point_total: number
    current_points: number
    completed: boolean
    created_at: string
    contributions: TtrpgProjectContribution[]
    last_contributed_at?: string
}

export default interface TtrpgProject {
    id: string
    campaign_id: string
    title: string
    description: string
    point_total: number
    current_points: number
    completed: boolean
    created_at: string
    contributions: TtrpgProjectContribution[]
    last_contributed_at: string
}
