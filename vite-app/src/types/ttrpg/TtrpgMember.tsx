export interface TtrpgMemberItem {
    name: string
    quantity: number
}

export interface TtrpgMemberFollower {
    name: string
    roll_bonus: number
    type: "sage" | "crafter"
}

export interface TtrpgMemberTitle {
    name: string
    description: string
}

export interface TtrpgMemberStatus {
    name: string
    color: string
}

export default interface TtrpgMember {
    id: string
    campaign_id: string
    name: string
    played_by: string
    notes: string
    items: TtrpgMemberItem[]
    wealth: number
    renown: number
    followers: TtrpgMemberFollower[]
    titles: TtrpgMemberTitle[]
    statuses: TtrpgMemberStatus[]
}
