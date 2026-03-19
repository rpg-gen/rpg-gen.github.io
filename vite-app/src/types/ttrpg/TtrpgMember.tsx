export interface TtrpgMemberItem {
    name: string
    quantity: number
}

export default interface TtrpgMember {
    id: string
    campaign_id: string
    name: string
    played_by: string
    notes: string
    items: TtrpgMemberItem[]
}
