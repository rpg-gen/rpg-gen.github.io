import { TtrpgMemberItem, TtrpgMemberFollower } from "./TtrpgMember"

export default interface TtrpgPartyResources {
    hero_tokens: number
    victories: number
    exp: number
    unassigned_items: TtrpgMemberItem[]
    unassigned_followers: TtrpgMemberFollower[]
}
