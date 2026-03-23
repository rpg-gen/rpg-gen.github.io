import { useState } from "react"
import { useNavigate } from "react-router-dom"
import TtrpgSession from "../../types/ttrpg/TtrpgSession"
import TtrpgSessionNote from "../../types/ttrpg/TtrpgSessionNote"
import TtrpgLoreEntry from "../../types/ttrpg/TtrpgLoreEntry"
import TtrpgMember from "../../types/ttrpg/TtrpgMember"
import TtrpgPartyResources from "../../types/ttrpg/TtrpgPartyResources"
import PartyResourcesPanel from "./party_resources_panel"
import MemberList from "./member_list"
import MemberForm from "./member_form"
import { nav_paths } from "../../configs/constants"

interface CampaignData {
    sessions: TtrpgSession[]
    members: TtrpgMember[]
    notes: TtrpgSessionNote[]
    lore: TtrpgLoreEntry[]
    partyResources: TtrpgPartyResources
}

interface MembersHook {
    createMember: (member: Omit<TtrpgMember, "id">) => Promise<string>
    updateMember: (id: string, member: Partial<TtrpgMember>) => Promise<void>
    deleteMember: (id: string) => Promise<void>
}

interface PartyResourcesHookType {
    updatePartyResources: (updates: Partial<TtrpgPartyResources>) => Promise<void>
    assignItemToMember: (campaignId: string, memberId: string, item: { name: string; quantity: number }, remaining: { name: string; quantity: number }[], memberItems: { name: string; quantity: number }[]) => Promise<void>
    unassignItemFromMember: (campaignId: string, memberId: string, item: { name: string; quantity: number }, updatedItems: { name: string; quantity: number }[], currentUnassigned: { name: string; quantity: number }[]) => Promise<void>
    assignFollowerToMember: (campaignId: string, memberId: string, follower: { name: string; roll_bonus: number; type: "sage" | "crafter" }, remaining: { name: string; roll_bonus: number; type: "sage" | "crafter" }[], memberFollowers: { name: string; roll_bonus: number; type: "sage" | "crafter" }[]) => Promise<void>
    unassignFollowerFromMember: (campaignId: string, memberId: string, follower: { name: string; roll_bonus: number; type: "sage" | "crafter" }, updatedFollowers: { name: string; roll_bonus: number; type: "sage" | "crafter" }[], currentUnassigned: { name: string; roll_bonus: number; type: "sage" | "crafter" }[]) => Promise<void>
}

interface PartyTabProps {
    campaignId: string
    data: CampaignData
    membersHook: MembersHook
    partyResourcesHook: PartyResourcesHookType
    updateMembers: (updater: (members: TtrpgMember[]) => TtrpgMember[]) => void
    updatePartyResources: (updater: (pr: TtrpgPartyResources) => TtrpgPartyResources) => void
}

export default function PartyTab({
    campaignId, data, membersHook, partyResourcesHook,
    updateMembers, updatePartyResources,
}: PartyTabProps) {
    const navigate = useNavigate()

    const [memberFormMode, setMemberFormMode] = useState<"add" | null>(null)
    const [formName, setFormName] = useState("")
    const [formPlayedBy, setFormPlayedBy] = useState("")
    const [formNotes, setFormNotes] = useState("")

    function clearForm() {
        setMemberFormMode(null)
        setFormName("")
        setFormPlayedBy("")
        setFormNotes("")
    }

    if (memberFormMode !== null) {
        return (
            <MemberForm
                campaignId={campaignId}
                formName={formName} formPlayedBy={formPlayedBy} formNotes={formNotes}
                setFormName={setFormName} setFormPlayedBy={setFormPlayedBy} setFormNotes={setFormNotes}
                membersHook={membersHook}
                onClose={clearForm}
            />
        )
    }

    return (
        <div>
            <PartyResourcesPanel
                campaignId={campaignId} partyResources={data.partyResources}
                members={data.members} partyResourcesHook={partyResourcesHook}
                updatePartyResources={updatePartyResources} updateMembers={updateMembers}
            />
            <MemberList
                members={data.members}
                onSelect={(id) => navigate(`${nav_paths.rpg_notes}/${campaignId}/party/${id}`)}
                onAdd={() => { clearForm(); setMemberFormMode("add") }}
            />
        </div>
    )
}
