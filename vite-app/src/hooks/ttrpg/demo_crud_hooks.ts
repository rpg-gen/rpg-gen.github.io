import TtrpgCampaign from "../../types/ttrpg/TtrpgCampaign"
import TtrpgSession from "../../types/ttrpg/TtrpgSession"
import TtrpgMember from "../../types/ttrpg/TtrpgMember"
import { TtrpgMemberItem, TtrpgMemberFollower } from "../../types/ttrpg/TtrpgMember"
import TtrpgSessionNote from "../../types/ttrpg/TtrpgSessionNote"
import TtrpgLoreEntry from "../../types/ttrpg/TtrpgLoreEntry"
import TtrpgQuest from "../../types/ttrpg/TtrpgQuest"
import TtrpgProject from "../../types/ttrpg/TtrpgProject"
import { TtrpgProjectContribution } from "../../types/ttrpg/TtrpgProject"
import TtrpgPartyResources from "../../types/ttrpg/TtrpgPartyResources"

type ReadFn = () => TtrpgCampaign
type WriteFn = (c: TtrpgCampaign) => void
type RefreshFn = () => void

function mutate(read: ReadFn, write: WriteFn, refresh: RefreshFn, fn: (c: TtrpgCampaign) => void) {
    const c = read()
    fn(c)
    write(c)
    refresh()
}

export function createDemoSessionsHook(read: ReadFn, write: WriteFn, refresh: RefreshFn) {
    return {
        createSession: async (session: Omit<TtrpgSession, "id">): Promise<string> => {
            const id = crypto.randomUUID()
            mutate(read, write, refresh, (c) => {
                c.sessions = c.sessions || {}
                c.sessions[id] = {
                    session_number: session.session_number,
                    date: session.date,
                    respite_count: session.respite_count,
                    ...(session.title ? { title: session.title } : {}),
                }
            })
            return id
        },
        updateSession: async (id: string, session: Partial<TtrpgSession>): Promise<void> => {
            mutate(read, write, refresh, (c) => {
                const s = c.sessions?.[id]
                if (!s) return
                if (session.session_number !== undefined) s.session_number = session.session_number
                if (session.date !== undefined) s.date = session.date
                if (session.title !== undefined) s.title = session.title
                if (session.respite_count !== undefined) s.respite_count = session.respite_count
            })
        },
        deleteSession: async (id: string): Promise<void> => {
            mutate(read, write, refresh, (c) => {
                if (c.sessions) delete c.sessions[id]
            })
        },
    }
}

export function createDemoMembersHook(read: ReadFn, write: WriteFn, refresh: RefreshFn) {
    return {
        getMembersByCampaign: async (): Promise<TtrpgMember[]> => [],
        createMember: async (member: Omit<TtrpgMember, "id">): Promise<string> => {
            const id = crypto.randomUUID()
            mutate(read, write, refresh, (c) => {
                c.members = c.members || {}
                c.members[id] = {
                    name: member.name,
                    played_by: member.played_by,
                    notes: member.notes,
                    items: member.items || [],
                    wealth: member.wealth ?? 0,
                    renown: member.renown ?? 0,
                    followers: member.followers || [],
                    titles: member.titles || [],
                }
            })
            return id
        },
        updateMember: async (id: string, member: Partial<TtrpgMember>): Promise<void> => {
            mutate(read, write, refresh, (c) => {
                const m = c.members?.[id]
                if (!m) return
                if (member.name !== undefined) m.name = member.name
                if (member.played_by !== undefined) m.played_by = member.played_by
                if (member.notes !== undefined) m.notes = member.notes
                if (member.items !== undefined) m.items = member.items
                if (member.wealth !== undefined) m.wealth = member.wealth
                if (member.renown !== undefined) m.renown = member.renown
                if (member.followers !== undefined) m.followers = member.followers
                if (member.titles !== undefined) m.titles = member.titles
            })
        },
        deleteMember: async (id: string): Promise<void> => {
            mutate(read, write, refresh, (c) => {
                if (c.members) delete c.members[id]
            })
        },
    }
}

export function createDemoNotesHook(read: ReadFn, write: WriteFn, refresh: RefreshFn) {
    return {
        getNotesByCampaign: async (): Promise<TtrpgSessionNote[]> => [],
        createNote: async (_campaignId: string, note: { session_id: string; text: string; author: string }): Promise<string> => {
            const id = crypto.randomUUID()
            const now = new Date().toISOString()
            mutate(read, write, refresh, (c) => {
                c.notes = c.notes || {}
                c.notes[id] = {
                    session_id: note.session_id,
                    text: note.text,
                    author: note.author,
                    created_at: now,
                    updated_at: now,
                }
            })
            return id
        },
        updateNote: async (_campaignId: string, id: string, note: Partial<TtrpgSessionNote>): Promise<void> => {
            mutate(read, write, refresh, (c) => {
                const n = c.notes?.[id]
                if (!n) return
                if (note.session_id !== undefined) n.session_id = note.session_id
                if (note.text !== undefined) n.text = note.text
                n.updated_at = new Date().toISOString()
            })
        },
        deleteNote: async (_campaignId: string, id: string): Promise<void> => {
            mutate(read, write, refresh, (c) => {
                if (c.notes) delete c.notes[id]
            })
        },
    }
}

export function createDemoLoreHook(read: ReadFn, write: WriteFn, refresh: RefreshFn) {
    return {
        getLoreByCampaign: async (): Promise<TtrpgLoreEntry[]> => [],
        createLoreEntry: async (_campaignId: string, entry: Omit<TtrpgLoreEntry, "id" | "campaign_id">): Promise<string> => {
            const id = crypto.randomUUID()
            mutate(read, write, refresh, (c) => {
                c.lore = c.lore || {}
                c.lore[id] = {
                    type: entry.type,
                    name: entry.name,
                    notes: entry.subtitle,
                    created_at: new Date().toISOString(),
                    ...(entry.session_id ? { session_id: entry.session_id } : {}),
                    ...(entry.faction_id ? { faction_id: entry.faction_id } : {}),
                }
            })
            return id
        },
        updateLoreEntry: async (_campaignId: string, id: string, entry: Partial<TtrpgLoreEntry>): Promise<void> => {
            mutate(read, write, refresh, (c) => {
                const l = c.lore?.[id]
                if (!l) return
                if (entry.type !== undefined) l.type = entry.type
                if (entry.name !== undefined) l.name = entry.name
                if (entry.subtitle !== undefined) l.notes = entry.subtitle
                if (entry.session_id !== undefined) l.session_id = entry.session_id
                if (entry.faction_id !== undefined) {
                    if (entry.faction_id === "") {
                        delete l.faction_id
                    } else {
                        l.faction_id = entry.faction_id
                    }
                }
            })
        },
        deleteLoreEntry: async (_campaignId: string, id: string): Promise<void> => {
            mutate(read, write, refresh, (c) => {
                if (c.lore) delete c.lore[id]
            })
        },
    }
}

export function createDemoQuestsHook(read: ReadFn, write: WriteFn, refresh: RefreshFn) {
    return {
        createQuest: async (_campaignId: string, quest: Omit<TtrpgQuest, "id" | "campaign_id">): Promise<string> => {
            const id = crypto.randomUUID()
            mutate(read, write, refresh, (c) => {
                c.quests = c.quests || {}
                c.quests[id] = {
                    short_title: quest.short_title,
                    description: quest.description,
                    completed: false,
                    created_at: new Date().toISOString(),
                    ...(quest.session_id ? { session_id: quest.session_id } : {}),
                }
            })
            return id
        },
        updateQuest: async (_campaignId: string, id: string, quest: Partial<Omit<TtrpgQuest, "id" | "campaign_id">>): Promise<void> => {
            mutate(read, write, refresh, (c) => {
                const q = c.quests?.[id]
                if (!q) return
                if (quest.short_title !== undefined) q.short_title = quest.short_title
                if (quest.description !== undefined) q.description = quest.description
                if (quest.session_id !== undefined) q.session_id = quest.session_id
                if (quest.completed !== undefined) q.completed = quest.completed
                if (quest.created_at !== undefined) q.created_at = quest.created_at
            })
        },
        deleteQuest: async (_campaignId: string, id: string): Promise<void> => {
            mutate(read, write, refresh, (c) => {
                if (c.quests) delete c.quests[id]
            })
        },
    }
}

export function createDemoProjectsHook(read: ReadFn, write: WriteFn, refresh: RefreshFn) {
    return {
        createProject: async (_campaignId: string, project: Pick<TtrpgProject, "title" | "description" | "point_total">): Promise<string> => {
            const id = crypto.randomUUID()
            mutate(read, write, refresh, (c) => {
                c.projects = c.projects || {}
                c.projects[id] = {
                    title: project.title,
                    description: project.description,
                    point_total: project.point_total,
                    current_points: 0,
                    completed: false,
                    created_at: new Date().toISOString(),
                    contributions: [],
                }
            })
            return id
        },
        updateProject: async (_campaignId: string, id: string, updates: Partial<Omit<TtrpgProject, "id" | "campaign_id">>): Promise<void> => {
            mutate(read, write, refresh, (c) => {
                const p = c.projects?.[id]
                if (!p) return
                if (updates.title !== undefined) p.title = updates.title
                if (updates.description !== undefined) p.description = updates.description
                if (updates.point_total !== undefined) p.point_total = updates.point_total
                if (updates.completed !== undefined) p.completed = updates.completed
            })
        },
        addContribution: async (
            _campaignId: string,
            projectId: string,
            currentContributions: TtrpgProjectContribution[],
            currentPoints: number,
            contribution: TtrpgProjectContribution
        ): Promise<void> => {
            mutate(read, write, refresh, (c) => {
                const p = c.projects?.[projectId]
                if (!p) return
                p.contributions = [...currentContributions, contribution]
                p.current_points = currentPoints + contribution.points
                p.last_contributed_at = new Date().toISOString()
            })
        },
        updateContributions: async (
            _campaignId: string,
            projectId: string,
            contributions: TtrpgProjectContribution[]
        ): Promise<void> => {
            mutate(read, write, refresh, (c) => {
                const p = c.projects?.[projectId]
                if (!p) return
                p.contributions = contributions
                p.current_points = contributions.reduce((sum, co) => sum + co.points, 0)
            })
        },
        deleteProject: async (_campaignId: string, id: string): Promise<void> => {
            mutate(read, write, refresh, (c) => {
                if (c.projects) delete c.projects[id]
            })
        },
    }
}

export function createDemoPartyResourcesHook(read: ReadFn, write: WriteFn, refresh: RefreshFn) {
    return {
        updatePartyResources: async (updates: Partial<TtrpgPartyResources>): Promise<void> => {
            mutate(read, write, refresh, (c) => {
                c.party_resources = c.party_resources || { hero_tokens: 0, victories: 0, exp: 0, unassigned_items: [], unassigned_followers: [] }
                for (const [key, value] of Object.entries(updates)) {
                    (c.party_resources as Record<string, unknown>)[key] = value
                }
            })
        },
        assignItemToMember: async (
            _campaignId: string,
            memberId: string,
            item: TtrpgMemberItem,
            remainingUnassigned: TtrpgMemberItem[],
            memberItems: TtrpgMemberItem[]
        ): Promise<void> => {
            mutate(read, write, refresh, (c) => {
                if (c.party_resources) c.party_resources.unassigned_items = remainingUnassigned
                const m = c.members?.[memberId]
                if (!m) return
                const idx = memberItems.findIndex(i => i.name === item.name)
                if (idx >= 0) {
                    m.items = memberItems.map((i, j) => j === idx ? { ...i, quantity: i.quantity + item.quantity } : i)
                } else {
                    m.items = [...memberItems, item]
                }
            })
        },
        unassignItemFromMember: async (
            _campaignId: string,
            memberId: string,
            item: TtrpgMemberItem,
            updatedMemberItems: TtrpgMemberItem[],
            currentUnassigned: TtrpgMemberItem[]
        ): Promise<void> => {
            mutate(read, write, refresh, (c) => {
                const m = c.members?.[memberId]
                if (m) m.items = updatedMemberItems
                if (!c.party_resources) return
                const idx = currentUnassigned.findIndex(i => i.name === item.name)
                if (idx >= 0) {
                    c.party_resources.unassigned_items = currentUnassigned.map((i, j) =>
                        j === idx ? { ...i, quantity: i.quantity + item.quantity } : i
                    )
                } else {
                    c.party_resources.unassigned_items = [...currentUnassigned, item]
                }
            })
        },
        assignFollowerToMember: async (
            _campaignId: string,
            memberId: string,
            follower: TtrpgMemberFollower,
            remainingUnassigned: TtrpgMemberFollower[],
            memberFollowers: TtrpgMemberFollower[]
        ): Promise<void> => {
            mutate(read, write, refresh, (c) => {
                if (c.party_resources) c.party_resources.unassigned_followers = remainingUnassigned
                const m = c.members?.[memberId]
                if (m) m.followers = [...memberFollowers, follower]
            })
        },
        unassignFollowerFromMember: async (
            _campaignId: string,
            memberId: string,
            follower: TtrpgMemberFollower,
            updatedMemberFollowers: TtrpgMemberFollower[],
            currentUnassigned: TtrpgMemberFollower[]
        ): Promise<void> => {
            mutate(read, write, refresh, (c) => {
                const m = c.members?.[memberId]
                if (m) m.followers = updatedMemberFollowers
                if (c.party_resources) {
                    c.party_resources.unassigned_followers = [...currentUnassigned, follower]
                }
            })
        },
    }
}
