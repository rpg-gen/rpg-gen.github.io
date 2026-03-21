import { useState, useEffect } from "react"
import TtrpgSession from "../../types/ttrpg/TtrpgSession"
import TtrpgSessionNote from "../../types/ttrpg/TtrpgSessionNote"
import TtrpgLoreEntry from "../../types/ttrpg/TtrpgLoreEntry"
import TtrpgMember from "../../types/ttrpg/TtrpgMember"
import TtrpgPartyResources from "../../types/ttrpg/TtrpgPartyResources"
import PartyResourcesPanel from "./party_resources_panel"
import MemberList from "./member_list"
import MemberDetailView from "./member_detail_view"
import MemberForm from "./member_form"

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

interface NotesHook {
    updateNote: (id: string, note: Partial<TtrpgSessionNote>) => Promise<void>
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
    notesHook: NotesHook
    partyResourcesHook: PartyResourcesHookType
    updateMembers: (updater: (members: TtrpgMember[]) => TtrpgMember[]) => void
    updatePartyResources: (updater: (pr: TtrpgPartyResources) => TtrpgPartyResources) => void
    openLoreDetail: (entryId: string) => void
    openMemberDetail: (memberId: string) => void
    goToSession: (sessionId: string, noteId?: string) => void
    cameFromSessionId: string | null
    backToOriginSession: () => void
    pendingDetailId: string | null
    clearPendingDetailId: () => void
    resetSignal: number
    clearCameFromSessionId: () => void
}

export default function PartyTab({
    campaignId, data, membersHook, notesHook, partyResourcesHook,
    updateMembers, updatePartyResources,
    openLoreDetail, openMemberDetail, goToSession,
    cameFromSessionId, backToOriginSession,
    pendingDetailId, clearPendingDetailId, resetSignal, clearCameFromSessionId
}: PartyTabProps) {

    const [memberDetailId, setMemberDetailId] = useState<string | null>(pendingDetailId)
    const [memberFormMode, setMemberFormMode] = useState<string | null>(null)
    const [formName, setFormName] = useState("")
    const [formPlayedBy, setFormPlayedBy] = useState("")
    const [formNotes, setFormNotes] = useState("")

    useEffect(() => {
        if (pendingDetailId) {
            setMemberDetailId(pendingDetailId)
            setMemberFormMode(null)
            clearPendingDetailId()
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pendingDetailId])

    useEffect(() => {
        if (resetSignal > 0 && !pendingDetailId) setMemberDetailId(null)
    }, [resetSignal, pendingDetailId])

    function clearForm() {
        setMemberFormMode(null)
        setFormName("")
        setFormPlayedBy("")
        setFormNotes("")
    }

    // Detail view
    if (memberFormMode === null && memberDetailId !== null) {
        const member = data.members.find(m => m.id === memberDetailId)
        if (!member) return <div><button onClick={() => setMemberDetailId(null)}>Back</button><p>Member not found.</p></div>

        return (
            <MemberDetailView
                member={member} campaignId={campaignId} data={data}
                membersHook={membersHook} partyResourcesHook={partyResourcesHook}
                updateMembers={updateMembers} updatePartyResources={updatePartyResources}
                openLoreDetail={openLoreDetail} openMemberDetail={openMemberDetail} goToSession={goToSession}
                cameFromSessionId={cameFromSessionId} backToOriginSession={backToOriginSession}
                clearCameFromSessionId={clearCameFromSessionId}
                onEdit={() => { setMemberDetailId(null); setMemberFormMode(member.id); setFormName(member.name); setFormPlayedBy(member.played_by || ""); setFormNotes(member.notes || "") }}
                onBack={() => setMemberDetailId(null)}
            />
        )
    }

    // Form view
    if (memberFormMode !== null) {
        return (
            <MemberForm
                campaignId={campaignId} formMode={memberFormMode}
                formName={formName} formPlayedBy={formPlayedBy} formNotes={formNotes}
                setFormName={setFormName} setFormPlayedBy={setFormPlayedBy} setFormNotes={setFormNotes}
                members={data.members} notes={data.notes}
                membersHook={membersHook} notesHook={notesHook}
                onClose={clearForm}
            />
        )
    }

    // List view
    return (
        <div>
            <PartyResourcesPanel
                campaignId={campaignId} partyResources={data.partyResources}
                members={data.members} partyResourcesHook={partyResourcesHook}
                updatePartyResources={updatePartyResources} updateMembers={updateMembers}
            />
            <MemberList
                members={data.members}
                onSelect={(id) => setMemberDetailId(id)}
                onAdd={() => { clearForm(); setMemberFormMode("add") }}
                clearCameFromSessionId={clearCameFromSessionId}
            />
        </div>
    )
}
