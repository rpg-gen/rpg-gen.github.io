export default interface TtrpgQuest {
    id: string
    campaign_id: string
    short_title: string
    description: string
    session_id?: string
    completed: boolean
    created_at: string
}
