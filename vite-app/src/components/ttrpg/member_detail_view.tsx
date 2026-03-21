import TtrpgMember from "../../types/ttrpg/TtrpgMember"
import TtrpgSession from "../../types/ttrpg/TtrpgSession"
import TtrpgSessionNote from "../../types/ttrpg/TtrpgSessionNote"
import TtrpgLoreEntry from "../../types/ttrpg/TtrpgLoreEntry"
import TtrpgPartyResources from "../../types/ttrpg/TtrpgPartyResources"
import StatCounter from "./stat_counter"
import MemberInventory from "./member_inventory"
import MemberFollowers from "./member_followers"
import MemberTitles from "./member_titles"
import LoreNoteText from "./lore_note_text"
import { cardStyle } from "../../pages/ttrpg/campaign_detail_styles"

interface CampaignData {
    sessions: TtrpgSession[]
    members: TtrpgMember[]
    notes: TtrpgSessionNote[]
    lore: TtrpgLoreEntry[]
    partyResources: TtrpgPartyResources
}

interface MemberDetailViewProps {
    member: TtrpgMember
    campaignId: string
    data: CampaignData
    membersHook: {
        updateMember: (id: string, member: Partial<TtrpgMember>) => Promise<void>
    }
    partyResourcesHook: {
        unassignItemFromMember: (
            campaignId: string, memberId: string,
            item: { name: string; quantity: number },
            updatedItems: { name: string; quantity: number }[],
            currentUnassigned: { name: string; quantity: number }[]
        ) => Promise<void>
        unassignFollowerFromMember: (
            campaignId: string, memberId: string,
            follower: { name: string; roll_bonus: number; type: "sage" | "crafter" },
            updatedFollowers: { name: string; roll_bonus: number; type: "sage" | "crafter" }[],
            currentUnassigned: { name: string; roll_bonus: number; type: "sage" | "crafter" }[]
        ) => Promise<void>
    }
    updateMembers: (updater: (members: TtrpgMember[]) => TtrpgMember[]) => void
    updatePartyResources: (updater: (pr: TtrpgPartyResources) => TtrpgPartyResources) => void
    openLoreDetail: (entryId: string) => void
    openMemberDetail: (memberId: string) => void
    goToSession: (sessionId: string, noteId?: string) => void
    cameFromSessionId: string | null
    backToOriginSession: () => void
    clearCameFromSessionId: () => void
    onEdit: () => void
    onBack: () => void
}

export default function MemberDetailView({
    member, campaignId, data, membersHook, partyResourcesHook,
    updateMembers, updatePartyResources,
    openLoreDetail, openMemberDetail, goToSession,
    cameFromSessionId, backToOriginSession, clearCameFromSessionId,
    onEdit, onBack
}: MemberDetailViewProps) {

    function handleWealthChange(newVal: number) {
        const prev = member.wealth
        updateMembers(ms => ms.map(m => m.id === member.id ? { ...m, wealth: newVal } : m))
        membersHook.updateMember(member.id, { campaign_id: campaignId, wealth: newVal })
            .catch(() => {
                alert("Error saving wealth — reverting")
                updateMembers(ms => ms.map(m => m.id === member.id ? { ...m, wealth: prev } : m))
            })
    }

    function handleRenownChange(newVal: number) {
        const prev = member.renown
        updateMembers(ms => ms.map(m => m.id === member.id ? { ...m, renown: newVal } : m))
        membersHook.updateMember(member.id, { campaign_id: campaignId, renown: newVal })
            .catch(() => {
                alert("Error saving renown — reverting")
                updateMembers(ms => ms.map(m => m.id === member.id ? { ...m, renown: prev } : m))
            })
    }

    const mentions: { note: TtrpgSessionNote; session: TtrpgSession }[] = []
    for (const note of data.notes) {
        if (note.text.includes(`[[${member.name}]]`)) {
            const session = data.sessions.find(s => s.id === note.session_id)
            if (session) mentions.push({ note, session })
        }
    }
    mentions.sort((a, b) =>
        a.session.session_number - b.session.session_number
        || a.note.created_at.localeCompare(b.note.created_at)
    )

    return (
        <div>
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                {cameFromSessionId && <button onClick={backToOriginSession}>Back to session</button>}
                <button onClick={() => { onBack(); clearCameFromSessionId() }}>Back to party list</button>
            </div>

            <div style={{ ...cardStyle, backgroundColor: "#f3e8ff" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <div>
                        <strong style={{ fontSize: "1.2rem" }}>{member.name}</strong>
                        {member.played_by && <span style={{ fontStyle: "italic", color: "#666", marginLeft: "0.5rem" }}>({member.played_by})</span>}
                    </div>
                    <button onClick={onEdit}>Edit</button>
                </div>
                {member.notes && <div style={{ fontStyle: "italic", color: "#555", marginBottom: "0.75rem" }}>{member.notes}</div>}

                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" }}>
                    <StatCounter label="Wealth" value={member.wealth} min={0} max={5} onChange={handleWealthChange} />
                    <StatCounter label="Renown" value={member.renown} min={0} max={5} onChange={handleRenownChange} />
                </div>

                <SectionDivider title="Inventory" />
                <MemberInventory
                    member={member} membersHook={membersHook} updateMembers={updateMembers}
                    showUnassign campaignId={campaignId}
                    partyResourcesHook={partyResourcesHook}
                    partyResources={data.partyResources}
                    updatePartyResources={updatePartyResources}
                />

                <SectionDivider title="Followers" />
                <MemberFollowers
                    member={member} membersHook={membersHook} updateMembers={updateMembers}
                    campaignId={campaignId} partyResourcesHook={partyResourcesHook}
                    partyResources={data.partyResources} updatePartyResources={updatePartyResources}
                />

                <SectionDivider title="Titles" />
                <MemberTitles member={member} membersHook={membersHook} updateMembers={updateMembers} />

                {mentions.length > 0 ? (
                    <>
                        <SectionDivider title={`Session Mentions (${mentions.length})`} />
                        {mentions.map(({ note, session }) => (
                            <div key={note.id}
                                style={{ border: "1px solid #ddd", borderRadius: "4px", padding: "0.5rem", marginTop: "0.5rem", backgroundColor: "#fff", cursor: "pointer" }}
                                onClick={() => goToSession(session.id, note.id)}>
                                <div style={{ fontSize: "0.8rem", color: "#666", marginBottom: "0.25rem" }}>
                                    Session {session.session_number} — {session.date}
                                </div>
                                <div style={{ fontSize: "0.9rem", color: "#333" }}>
                                    <LoreNoteText text={note.text} loreEntries={data.lore} members={data.members} onLoreClick={openLoreDetail} onMemberClick={openMemberDetail} />
                                </div>
                            </div>
                        ))}
                    </>
                ) : (
                    <>
                        <SectionDivider title="Session Mentions" />
                        <div style={{ color: "#666", fontSize: "0.9rem" }}>No session mentions yet.</div>
                    </>
                )}
            </div>
        </div>
    )
}

function SectionDivider({ title }: { title: string }) {
    return (
        <div style={{ borderTop: "1px solid #ccc", paddingTop: "0.75rem", marginTop: "0.75rem", marginBottom: "0.5rem" }}>
            <strong>{title}</strong>
        </div>
    )
}
