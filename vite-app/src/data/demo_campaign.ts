/* eslint-disable max-lines */
import TtrpgCampaign from "../types/ttrpg/TtrpgCampaign"

// Fixed UUIDs for cross-referencing between entities
const SESSION_IDS = {
    s1: "d0a1b2c3-0001-4000-a000-000000000001",
    s2: "d0a1b2c3-0002-4000-a000-000000000002",
    s3: "d0a1b2c3-0003-4000-a000-000000000003",
    s4: "d0a1b2c3-0004-4000-a000-000000000004",
}

const MEMBER_IDS = {
    kira: "d0a1b2c3-1001-4000-a000-000000000001",
    theron: "d0a1b2c3-1002-4000-a000-000000000002",
    yael: "d0a1b2c3-1003-4000-a000-000000000003",
    bram: "d0a1b2c3-1004-4000-a000-000000000004",
}

const LORE_IDS = {
    elderMorath: "d0a1b2c3-2001-4000-a000-000000000001",
    captainVoss: "d0a1b2c3-2002-4000-a000-000000000002",
    lirenTheSmith: "d0a1b2c3-2003-4000-a000-000000000003",
    shadowBroker: "d0a1b2c3-2004-4000-a000-000000000004",
    stormbreaker: "d0a1b2c3-2005-4000-a000-000000000005",
    voidstone: "d0a1b2c3-2006-4000-a000-000000000006",
    healingDraught: "d0a1b2c3-2007-4000-a000-000000000007",
    sunkenCitadel: "d0a1b2c3-2008-4000-a000-000000000008",
    ironholdVillage: "d0a1b2c3-2009-4000-a000-000000000009",
    whisperingWoods: "d0a1b2c3-200a-4000-a000-000000000010",
    dragonspirePeak: "d0a1b2c3-200b-4000-a000-000000000011",
    theForsakenVault: "d0a1b2c3-200c-4000-a000-000000000012",
    orderOfTheFlame: "d0a1b2c3-200d-4000-a000-000000000013",
    theIronPact: "d0a1b2c3-200e-4000-a000-000000000014",
    cultOfTheVoid: "d0a1b2c3-200f-4000-a000-000000000015",
    merchantsGuild: "d0a1b2c3-2010-4000-a000-000000000016",
}

const QUEST_IDS = {
    findCitadel: "d0a1b2c3-3001-4000-a000-000000000001",
    rescueSmith: "d0a1b2c3-3002-4000-a000-000000000002",
    stopCult: "d0a1b2c3-3003-4000-a000-000000000003",
    dragonTreasure: "d0a1b2c3-3004-4000-a000-000000000004",
}

const PROJECT_IDS = {
    fortify: "d0a1b2c3-4001-4000-a000-000000000001",
    arcaneWard: "d0a1b2c3-4002-4000-a000-000000000002",
}

const NOTE_IDS = {
    n1: "d0a1b2c3-5001-4000-a000-000000000001",
    n2: "d0a1b2c3-5002-4000-a000-000000000002",
    n3: "d0a1b2c3-5003-4000-a000-000000000003",
    n4: "d0a1b2c3-5004-4000-a000-000000000004",
    n5: "d0a1b2c3-5005-4000-a000-000000000005",
    n6: "d0a1b2c3-5006-4000-a000-000000000006",
    n7: "d0a1b2c3-5007-4000-a000-000000000007",
    n8: "d0a1b2c3-5008-4000-a000-000000000008",
    n9: "d0a1b2c3-5009-4000-a000-000000000009",
    n10: "d0a1b2c3-500a-4000-a000-000000000010",
}

export const DEMO_CAMPAIGN_ID = "demo"

export const DEMO_CAMPAIGN_SEED: TtrpgCampaign = {
    id: DEMO_CAMPAIGN_ID,
    name: "The Sunken Citadel",
    created_at: "2025-01-15T00:00:00.000Z",
    created_by: "demo",

    sessions: {
        [SESSION_IDS.s1]: {
            session_number: 1,
            date: "2025-01-15",
            title: "A Stranger in Ironhold",
            respite_count: 0,
        },
        [SESSION_IDS.s2]: {
            session_number: 2,
            date: "2025-01-22",
            title: "Into the Whispering Woods",
            respite_count: 1,
        },
        [SESSION_IDS.s3]: {
            session_number: 3,
            date: "2025-01-29",
            title: "The Vault Below",
            respite_count: 0,
        },
        [SESSION_IDS.s4]: {
            session_number: 4,
            date: "2025-02-05",
            title: "Dragonspire Ascent",
            respite_count: 1,
        },
    },

    members: {
        [MEMBER_IDS.kira]: {
            name: "Kira Swiftblade",
            played_by: "Alex",
            notes: "Human fighter and party leader. Carries a family heirloom longsword.",
            items: [
                { name: "Longsword of the Swift", quantity: 1 },
                { name: "Chain Mail", quantity: 1 },
                { name: "Healing Potion", quantity: 3 },
            ],
            wealth: 45,
            renown: 3,
            followers: [
                { name: "Pip", roll_bonus: 1, type: "sage" },
            ],
            titles: [
                { name: "Defender of Ironhold", description: "Awarded after repelling the raid" },
            ],
        },
        [MEMBER_IDS.theron]: {
            name: "Theron Ashwood",
            played_by: "Jordan",
            notes: "Elven elementalist who studied at the Academy of Winds. Searching for a lost mentor.",
            items: [
                { name: "Staff of Embers", quantity: 1 },
                { name: "Spellbook", quantity: 1 },
                { name: "Void Shard", quantity: 1 },
            ],
            wealth: 22,
            renown: 2,
            followers: [
                { name: "Sage Aldric", roll_bonus: 2, type: "sage" },
            ],
            titles: [],
        },
        [MEMBER_IDS.yael]: {
            name: "Yael Thornwood",
            played_by: "Morgan",
            notes: "Half-orc druid with a deep bond to the forest. Wields a living staff.",
            items: [
                { name: "Living Staff", quantity: 1 },
                { name: "Herbal Kit", quantity: 1 },
                { name: "Moonstone Pendant", quantity: 1 },
            ],
            wealth: 18,
            renown: 2,
            followers: [
                { name: "Fenwick", roll_bonus: 1, type: "crafter" },
            ],
            titles: [
                { name: "Voice of the Woods", description: "Recognized by the forest spirits" },
            ],
        },
        [MEMBER_IDS.bram]: {
            name: "Bram Copperhand",
            played_by: "Sam",
            notes: "Dwarf artificer and trap specialist. Former member of the Iron Pact.",
            items: [
                { name: "Crossbow, Modified", quantity: 1 },
                { name: "Tinker's Tools", quantity: 1 },
                { name: "Smoke Bomb", quantity: 4 },
                { name: "Grappling Hook", quantity: 1 },
            ],
            wealth: 60,
            renown: 1,
            followers: [
                { name: "Greta the Tinkerer", roll_bonus: 2, type: "crafter" },
            ],
            titles: [],
        },
    },

    lore: {
        [LORE_IDS.elderMorath]: {
            type: "person",
            name: "Elder Morath",
            notes: "Village elder of Ironhold. Wise but secretive about the village's past.",
            created_at: "2025-01-15T01:00:00.000Z",
            session_id: SESSION_IDS.s1,
        },
        [LORE_IDS.captainVoss]: {
            type: "person",
            name: "Captain Voss",
            notes: "Leader of the Ironhold militia. Gruff but dependable. Lost an eye in the last war.",
            created_at: "2025-01-15T02:00:00.000Z",
            session_id: SESSION_IDS.s1,
            faction_id: LORE_IDS.orderOfTheFlame,
        },
        [LORE_IDS.lirenTheSmith]: {
            type: "person",
            name: "Liren the Smith",
            notes: "Master blacksmith who disappeared into the Whispering Woods. Known for enchanted weapons.",
            created_at: "2025-01-22T01:00:00.000Z",
            session_id: SESSION_IDS.s2,
        },
        [LORE_IDS.shadowBroker]: {
            type: "person",
            name: "The Shadow Broker",
            notes: "Mysterious figure who trades in secrets. Always appears hooded. Claims to serve no faction.",
            created_at: "2025-01-29T01:00:00.000Z",
            session_id: SESSION_IDS.s3,
            faction_id: LORE_IDS.cultOfTheVoid,
        },
        [LORE_IDS.stormbreaker]: {
            type: "item",
            name: "Stormbreaker",
            notes: "Legendary warhammer said to be forged from a thunderbolt. Last seen in the Forsaken Vault.",
            created_at: "2025-01-15T03:00:00.000Z",
            session_id: SESSION_IDS.s1,
        },
        [LORE_IDS.voidstone]: {
            type: "item",
            name: "Voidstone Amulet",
            notes: "Dark artifact that pulses with corrupting energy. The Cult of the Void seeks to reassemble its fragments.",
            created_at: "2025-01-29T02:00:00.000Z",
            session_id: SESSION_IDS.s3,
        },
        [LORE_IDS.healingDraught]: {
            type: "item",
            name: "Everspring Draught",
            notes: "Rare healing elixir brewed from Whispering Woods flora. Heals wounds and cures minor curses.",
            created_at: "2025-01-22T02:00:00.000Z",
            session_id: SESSION_IDS.s2,
        },
        [LORE_IDS.sunkenCitadel]: {
            type: "place",
            name: "The Sunken Citadel",
            notes: "Ancient fortress that sank beneath the earth centuries ago. Rumored to contain powerful artifacts and the tomb of a forgotten king.",
            created_at: "2025-01-15T04:00:00.000Z",
            session_id: SESSION_IDS.s1,
        },
        [LORE_IDS.ironholdVillage]: {
            type: "place",
            name: "Ironhold Village",
            notes: "Small fortified settlement at the edge of the Whispering Woods. Known for its iron mines and stubborn people.",
            created_at: "2025-01-15T05:00:00.000Z",
            session_id: SESSION_IDS.s1,
        },
        [LORE_IDS.whisperingWoods]: {
            type: "place",
            name: "The Whispering Woods",
            notes: "Dense, ancient forest where the trees seem to speak. Home to druids, fey creatures, and hidden dangers.",
            created_at: "2025-01-22T03:00:00.000Z",
            session_id: SESSION_IDS.s2,
        },
        [LORE_IDS.dragonspirePeak]: {
            type: "place",
            name: "Dragonspire Peak",
            notes: "Towering mountain with a spiraling path to the summit. An ancient dragon once nested here.",
            created_at: "2025-02-05T01:00:00.000Z",
            session_id: SESSION_IDS.s4,
        },
        [LORE_IDS.theForsakenVault]: {
            type: "place",
            name: "The Forsaken Vault",
            notes: "Underground complex beneath the Sunken Citadel. Sealed centuries ago to imprison something terrible.",
            created_at: "2025-01-29T03:00:00.000Z",
            session_id: SESSION_IDS.s3,
        },
        [LORE_IDS.orderOfTheFlame]: {
            type: "faction",
            name: "Order of the Flame",
            notes: "Holy order of knights dedicated to protecting the realm from darkness. Headquartered in the capital.",
            created_at: "2025-01-15T06:00:00.000Z",
            session_id: SESSION_IDS.s1,
        },
        [LORE_IDS.theIronPact]: {
            type: "faction",
            name: "The Iron Pact",
            notes: "Dwarven alliance of artisans and warriors. Bram was once a member before a falling out over ethics.",
            created_at: "2025-01-15T07:00:00.000Z",
            session_id: SESSION_IDS.s1,
        },
        [LORE_IDS.cultOfTheVoid]: {
            type: "faction",
            name: "Cult of the Void",
            notes: "Secretive group that worships an entity from beyond the stars. Seeks the Voidstone Amulet to summon their patron.",
            created_at: "2025-01-29T04:00:00.000Z",
            session_id: SESSION_IDS.s3,
        },
        [LORE_IDS.merchantsGuild]: {
            type: "faction",
            name: "Merchant's Guild",
            notes: "Powerful trade organization controlling most commerce in the region. Officially neutral, but rumored to fund both sides of conflicts.",
            created_at: "2025-02-05T02:00:00.000Z",
            session_id: SESSION_IDS.s4,
        },
    },

    notes: {
        [NOTE_IDS.n1]: {
            session_id: SESSION_IDS.s1,
            text: "The party arrived in [[Ironhold Village]] and met [[Elder Morath]], who spoke of strange tremors and disappearances near the old mines.",
            author: "Alex",
            created_at: "2025-01-15T10:00:00.000Z",
            updated_at: "2025-01-15T10:00:00.000Z",
        },
        [NOTE_IDS.n2]: {
            session_id: SESSION_IDS.s1,
            text: "[[Captain Voss]] offered a bounty to investigate the mines. He mentioned that [[Liren the Smith]] went missing a week ago after heading toward [[The Whispering Woods]].",
            author: "Jordan",
            created_at: "2025-01-15T11:00:00.000Z",
            updated_at: "2025-01-15T11:00:00.000Z",
        },
        [NOTE_IDS.n3]: {
            session_id: SESSION_IDS.s1,
            text: "[[Kira Swiftblade]] found an old map in the tavern that references [[The Sunken Citadel]]. [[Elder Morath]] seemed nervous when asked about it.",
            author: "Alex",
            created_at: "2025-01-15T12:00:00.000Z",
            updated_at: "2025-01-15T12:00:00.000Z",
        },
        [NOTE_IDS.n4]: {
            session_id: SESSION_IDS.s2,
            text: "Entered [[The Whispering Woods]]. The trees literally whisper — [[Yael Thornwood]] could understand fragments. They warned of a 'dark hunger below.'",
            author: "Morgan",
            created_at: "2025-01-22T10:00:00.000Z",
            updated_at: "2025-01-22T10:00:00.000Z",
        },
        [NOTE_IDS.n5]: {
            session_id: SESSION_IDS.s2,
            text: "Found [[Liren the Smith]] trapped in a fey snare. Rescued him and he offered to forge gear for the party in gratitude. Gave us the [[Everspring Draught]] he was carrying.",
            author: "Sam",
            created_at: "2025-01-22T11:00:00.000Z",
            updated_at: "2025-01-22T11:00:00.000Z",
        },
        [NOTE_IDS.n6]: {
            session_id: SESSION_IDS.s3,
            text: "Descended into [[The Forsaken Vault]] beneath the citadel. Found evidence of the [[Cult of the Void]] — ritual markings, discarded robes.",
            author: "Jordan",
            created_at: "2025-01-29T10:00:00.000Z",
            updated_at: "2025-01-29T10:00:00.000Z",
        },
        [NOTE_IDS.n7]: {
            session_id: SESSION_IDS.s3,
            text: "Encountered [[The Shadow Broker]] who offered to sell us info about the [[Voidstone Amulet]]. [[Theron Ashwood]] negotiated a price of 20 gold for the location of one fragment.",
            author: "Jordan",
            created_at: "2025-01-29T11:00:00.000Z",
            updated_at: "2025-01-29T11:00:00.000Z",
        },
        [NOTE_IDS.n8]: {
            session_id: SESSION_IDS.s3,
            text: "[[Bram Copperhand]] recognized some of the vault's construction — dwarven engineering from the [[The Iron Pact]] era. He disabled several ancient traps.",
            author: "Sam",
            created_at: "2025-01-29T12:00:00.000Z",
            updated_at: "2025-01-29T12:00:00.000Z",
        },
        [NOTE_IDS.n9]: {
            session_id: SESSION_IDS.s4,
            text: "Began the ascent of [[Dragonspire Peak]]. [[Merchant's Guild]] traders at the base camp warned us about recent rockslides and strange lights at the summit.",
            author: "Alex",
            created_at: "2025-02-05T10:00:00.000Z",
            updated_at: "2025-02-05T10:00:00.000Z",
        },
        [NOTE_IDS.n10]: {
            session_id: SESSION_IDS.s4,
            text: "Found the ruins of a dragon's lair near the peak. The [[Stormbreaker]] was depicted in a mural alongside a warning: 'Only the worthy may lift the hammer.'",
            author: "Morgan",
            created_at: "2025-02-05T11:00:00.000Z",
            updated_at: "2025-02-05T11:00:00.000Z",
        },
    },

    quests: {
        [QUEST_IDS.findCitadel]: {
            short_title: "Locate the Sunken Citadel",
            description: "Follow the old map to find the entrance to the Sunken Citadel. Elder Morath hinted it lies beneath the Whispering Woods.",
            session_id: SESSION_IDS.s1,
            completed: true,
            created_at: "2025-01-15T13:00:00.000Z",
        },
        [QUEST_IDS.rescueSmith]: {
            short_title: "Rescue Liren the Smith",
            description: "Find Liren who went missing in the Whispering Woods. Captain Voss is offering a reward.",
            session_id: SESSION_IDS.s1,
            completed: true,
            created_at: "2025-01-15T14:00:00.000Z",
        },
        [QUEST_IDS.stopCult]: {
            short_title: "Stop the Cult of the Void",
            description: "Prevent the Cult from reassembling the Voidstone Amulet. Find and secure the remaining fragments before they do.",
            session_id: SESSION_IDS.s3,
            completed: false,
            created_at: "2025-01-29T13:00:00.000Z",
        },
        [QUEST_IDS.dragonTreasure]: {
            short_title: "Claim Stormbreaker",
            description: "Reach the summit of Dragonspire Peak and prove worthy to claim the legendary warhammer Stormbreaker.",
            session_id: SESSION_IDS.s4,
            completed: false,
            created_at: "2025-02-05T13:00:00.000Z",
        },
    },

    projects: {
        [PROJECT_IDS.fortify]: {
            title: "Fortify Ironhold Defenses",
            description: "Help strengthen Ironhold's walls and watchtowers against potential Cult attacks.",
            point_total: 10,
            current_points: 6,
            completed: false,
            created_at: "2025-01-22T13:00:00.000Z",
            contributions: [
                {
                    contributor_name: "Bram Copperhand",
                    contributor_id: MEMBER_IDS.bram,
                    contributor_type: "member",
                    points: 3,
                    session_id: SESSION_IDS.s2,
                },
                {
                    contributor_name: "Greta the Tinkerer",
                    contributor_id: `${MEMBER_IDS.bram}:follower:Greta the Tinkerer`,
                    contributor_type: "follower",
                    points: 2,
                    session_id: SESSION_IDS.s3,
                    member_id: MEMBER_IDS.bram,
                },
                {
                    contributor_name: "Kira Swiftblade",
                    contributor_id: MEMBER_IDS.kira,
                    contributor_type: "member",
                    points: 1,
                    session_id: SESSION_IDS.s3,
                },
            ],
            last_contributed_at: "2025-01-29T14:00:00.000Z",
        },
        [PROJECT_IDS.arcaneWard]: {
            title: "Arcane Ward Research",
            description: "Research and develop magical protections against Void corruption. Requires rare components from the Whispering Woods.",
            point_total: 8,
            current_points: 4,
            completed: false,
            created_at: "2025-01-29T14:00:00.000Z",
            contributions: [
                {
                    contributor_name: "Theron Ashwood",
                    contributor_id: MEMBER_IDS.theron,
                    contributor_type: "member",
                    points: 2,
                    session_id: SESSION_IDS.s3,
                },
                {
                    contributor_name: "Sage Aldric",
                    contributor_id: `${MEMBER_IDS.theron}:follower:Sage Aldric`,
                    contributor_type: "follower",
                    points: 1,
                    session_id: SESSION_IDS.s3,
                    member_id: MEMBER_IDS.theron,
                },
                {
                    contributor_name: "Yael Thornwood",
                    contributor_id: MEMBER_IDS.yael,
                    contributor_type: "member",
                    points: 1,
                    session_id: SESSION_IDS.s4,
                },
            ],
            last_contributed_at: "2025-02-05T14:00:00.000Z",
        },
    },

    party_resources: {
        hero_tokens: 2,
        victories: 3,
        exp: 150,
        unassigned_items: [
            { name: "Ancient Coin", quantity: 5 },
            { name: "Rope, 50ft", quantity: 1 },
        ],
        unassigned_followers: [
            { name: "Milo the Scout", roll_bonus: 1, type: "sage" },
        ],
    },
}
