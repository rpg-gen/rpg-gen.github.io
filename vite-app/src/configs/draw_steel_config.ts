// Draw Steel rules markdown sources from SteelCompendium (DRAW STEEL Creator License)
const BASE = "https://raw.githubusercontent.com/SteelCompendium/data-rules-md/refs/heads/main"

// Malice rules from Draw Steel Monsters (not in SteelCompendium repo)
const MALICE_MARKDOWN = `## Malice

Just as every hero has a Heroic Resource determined by their class, so too do the heroes' foes need their own juice to fuel their strongest threats. Malice is a resource gained and used by the Director. You use Malice to let enemies in the game activate their most powerful abilities and throw surprises at the heroes during combat.

### Earning Malice

At the start of combat, you gain Malice equal to the average number of Victories per hero. Then at the start of each combat round, you gain Malice equal to the number of heroes in the battle, plus the combat round number.

For instance, if five heroes with three Victories each are just starting their first combat round, you begin that combat with 9 Malice — 3 for the average number of Victories, 5 for the number of heroes, and 1 for the first round of combat. At the start of the next round, provided all the heroes are still alive, you gain 7 Malice — 5 for the number of heroes plus 2 for the second round. As long as none of the heroes is taken out of the fight, you gain 8 Malice in the third round, 9 Malice in the fourth round, and so on.

If a hero dies, they stop generating Malice for you. At the end of an encounter, any unused Malice is lost.

### Spending Malice

Monsters can spend Malice the way heroes spend their Heroic Resource, activating and enhancing their abilities. Abilities that make use of Malice have their Malice cost noted in a creature's stat block.

Specific types of monsters sometimes have other ways they can spend Malice once per turn, typically on features that affect an entire group of enemies, additional main actions or maneuvers they can take during their turn, or events that affect the encounter environment.

### Basic Malice Features

All monsters have access to the following Malice features, in addition to any "[Creature] Malice" features they might have. At the start of any monster's turn, you can spend Malice to activate one of the following features:

#### Brutal Effectiveness — 3 Malice

The monster digs into the enemy's weak spot. The next ability the monster uses with a potency has that potency increased by 1.

#### Malicious Strike — 5+ Malice

The monster pours all their animosity into their attack. Their next strike deals extra damage to one target equal to the monster's highest characteristic score. The extra damage increases by 1 for each additional Malice spent on this feature (to a maximum of three times the monster's highest characteristic). This feature can't be used two rounds in a row, even by different monsters.
`

export interface RulesSource {
    url?: string
    urls?: string[]
    inline?: string
    default_page: string
    strip_frontmatter?: boolean
}

const RULES_SOURCES: RulesSource[] = [
    { url: `${BASE}/Chapters/The%20Basics.md`, default_page: "characteristics" },
    { url: `${BASE}/Chapters/Downtime%20Projects.md`, default_page: "project-overview" },
    { url: `${BASE}/Chapters/Tests.md`, default_page: "test-overview" },
    { url: `${BASE}/Chapters/Combat.md`, default_page: "combat-overview" },
    { url: `${BASE}/Chapters/Complications.md`, default_page: "complications-overview" },
    {
        urls: [
            `${BASE}/Conditions/Bleeding.md`,
            `${BASE}/Conditions/Dazed.md`,
            `${BASE}/Conditions/Frightened.md`,
            `${BASE}/Conditions/Grabbed.md`,
            `${BASE}/Conditions/Prone.md`,
            `${BASE}/Conditions/Restrained.md`,
            `${BASE}/Conditions/Slowed.md`,
            `${BASE}/Conditions/Taunted.md`,
            `${BASE}/Conditions/Weakened.md`,
        ],
        default_page: "conditions",
        strip_frontmatter: true,
    },
    { url: `${BASE}/Chapters/Negotiation.md`, default_page: "negotiation-overview" },
    {
        inline: MALICE_MARKDOWN,
        default_page: "malice",
    },
]

// "Anchor" headings that switch the current page_key when encountered.
// Keys are UPPERCASE heading text.
const ANCHOR_HEADINGS: Record<string, string> = {
    // The Basics
    "CHARACTERISTICS": "characteristics",
    "DICE": "power-rolls",
    "POWER ROLLS": "power-rolls",
    "EDGES AND BANES": "power-rolls",
    "HERO TOKENS": "hero-resources",
    "GAME OF EXCEPTIONS": "basics-general",
    "ALWAYS ROUND DOWN": "basics-general",
    "CREATURES AND OBJECTS": "basics-general",
    "SUPERNATURAL OR MUNDANE": "basics-general",
    "PCS AND NPCS": "basics-general",
    "BUILDING A HEROIC NARRATIVE": "basics-general",
    "ECHELONS OF PLAY": "echelons",
    "ORDEN AND THE TIMESCAPE": "_setting",
    // Projects
    "TRACKING PROJECTS": "project-overview",
    "PROJECT PREREQUISITES": "project-overview",
    "PROJECT ROLL": "project-overview",
    "CRAFTING PROJECTS": "crafting",
    "IMBUE TREASURE": "imbue",
    "RESEARCH PROJECTS": "research",
    "OTHER PROJECTS": "other",
    // Skills & Tests
    "WHEN TO MAKE A TEST": "test-overview",
    "SKILLS": "skills",
    "APPLYING SKILLS": "applying-skills",
    "MANY SPECIFIC SKILLS": "many-specific-skills",
    "SKILL GROUPS": "skills",
    "CRAFTING SKILLS": "crafting-skills",
    "EXPLORATION SKILLS": "exploration-skills",
    "INTERPERSONAL SKILLS": "interpersonal-skills",
    "INTRIGUE SKILLS": "intrigue-skills",
    "LORE SKILLS": "lore-skills",
    "EXAMPLE TESTS": "_example_tests",
    "ASSIST A TEST": "assist",
    "HIDE AND SNEAK": "stealth",
    "GROUP TESTS": "group",
    "MONTAGE TESTS": "montage",
    // Combat
    "SET THE MAP": "combat-overview",
    "COMBAT ROUND": "combat-round",
    "TAKING A TURN": "taking-a-turn",
    "MOVE ACTIONS": "move-actions",
    "MANEUVERS": "maneuvers",
    "MAIN ACTIONS": "main-actions",
    "FREE STRIKES": "free-strikes",
    "MOVEMENT": "movement",
    "FORCED MOVEMENT": "forced-movement",
    "FLANKING": "battlefield",
    "COVER": "battlefield",
    "CONCEALMENT": "battlefield",
    "DAMAGE": "damage",
    "STAMINA": "stamina",
    "UNDERWATER COMBAT": "special-combat",
    "SUFFOCATING": "special-combat",
    "MOUNTED COMBAT": "special-combat",
    "END OF COMBAT": "end-of-combat",
    // Complications
    "BENEFIT AND DRAWBACK": "complications-overview",
    "MODIFYING THE STORY": "complications-overview",
    "CHOOSING A COMPLICATION": "complications-overview",
    "COMPLICATIONS TABLE 2-COLUMN": "complications-table",
    "COMPLICATIONS TABLE": "_complications-table-single",
    "ADVANCED STUDIES": "complications",
    // Negotiation
    "WHEN TO NEGOTIATE": "negotiation-overview",
    "NEGOTIATION STATS": "negotiation-stats",
    "OPENING A NEGOTIATION": "opening-negotiation",
    "UNCOVERING MOTIVATIONS": "motivations",
    "MAKING ARGUMENTS": "arguments",
    "NPC RESPONSE AND OFFER": "npc-response",
    "KEEP GOING OR STOP": "npc-response",
    "SAMPLE NEGOTIATION": "_negotiation_sample",
    // Malice
    "EARNING MALICE": "malice",
    "SPENDING MALICE": "malice",
    "BASIC MALICE FEATURES": "malice-features",
}

const PAGE_LABELS: Record<string, string> = {
    // The Basics
    characteristics: "Characteristics",
    "power-rolls": "Power Rolls",
    "hero-resources": "Hero Tokens & Resources",
    "basics-general": "General Rules",
    echelons: "Echelons of Play",
    // Projects
    "project-overview": "Overview",
    crafting: "Crafting",
    imbue: "Imbue",
    research: "Research",
    other: "Other",
    // Skills & Tests
    "test-overview": "Overview",
    skills: "Skills",
    "applying-skills": "Applying Skills",
    "many-specific-skills": "Many Specific Skills",
    "crafting-skills": "Crafting",
    "exploration-skills": "Exploration",
    "interpersonal-skills": "Interpersonal",
    "intrigue-skills": "Intrigue",
    "lore-skills": "Lore",
    assist: "Assist a Test",
    stealth: "Stealth",
    group: "Group Tests",
    montage: "Montage Tests",
    // Combat
    "combat-overview": "Overview",
    "combat-round": "Combat Round",
    "taking-a-turn": "Taking a Turn",
    "move-actions": "Move Actions",
    maneuvers: "Maneuvers",
    "main-actions": "Main Actions",
    "free-strikes": "Free Strikes",
    movement: "Movement",
    "forced-movement": "Forced Movement",
    battlefield: "Battlefield",
    damage: "Damage",
    stamina: "Stamina",
    "special-combat": "Special Combat",
    "end-of-combat": "End of Combat",
    // Conditions
    conditions: "Conditions",
    // Complications
    "complications-overview": "Overview",
    "complications-table": "Roll Table",
    complications: "Complications",
    // Malice
    malice: "Overview",
    "malice-features": "Basic Features",
    // Negotiation
    "negotiation-overview": "Overview",
    "negotiation-stats": "Negotiation Stats",
    "opening-negotiation": "Opening",
    motivations: "Motivations",
    arguments: "Arguments",
    "npc-response": "NPC Response",
}

export interface PageGroup {
    label: string
    keys: string[]
    description?: string
    slug?: string
    sub_groups?: string[]
    parent_slug?: string
}

const PAGE_GROUPS: PageGroup[] = [
    {
        label: "The Basics",
        slug: "basics",
        description: "Characteristics, power rolls, edges & banes, hero tokens",
        keys: ["characteristics", "power-rolls", "hero-resources", "basics-general", "echelons"],
    },
    {
        label: "Projects",
        slug: "projects",
        description: "Crafting, research, imbuing, and other downtime projects",
        keys: ["project-overview", "crafting", "imbue", "research", "other"],
    },
    {
        label: "Skills & Tests",
        slug: "skills",
        description: "Skill groups, test types, and how to apply skills",
        keys: [],
        sub_groups: ["skills-tests", "skill-lists"],
    },
    {
        label: "Tests & Skills",
        slug: "skills-tests",
        parent_slug: "skills",
        description: "Skill groups, test types, and how to apply skills",
        keys: ["test-overview", "skills", "assist", "stealth", "group", "montage"],
    },
    {
        label: "Skill Lists",
        slug: "skill-lists",
        parent_slug: "skills",
        description: "Crafting, exploration, interpersonal, intrigue, and lore",
        keys: [
            "crafting-skills", "exploration-skills", "interpersonal-skills",
            "intrigue-skills", "lore-skills",
        ],
    },
    {
        label: "Combat",
        slug: "combat",
        description: "Actions, movement, damage, and battlefield rules",
        keys: [
            "combat-overview", "combat-round", "taking-a-turn", "movement",
            "battlefield", "damage", "stamina", "special-combat", "end-of-combat",
        ],
    },
    {
        label: "Conditions",
        description: "Bleeding, dazed, grabbed, and more",
        keys: ["conditions"],
    },
    {
        label: "Complications",
        slug: "complications-group",
        description: "Optional hero features with benefits and drawbacks",
        keys: ["complications-overview", "complications-table", "complications"],
    },
    {
        label: "Malice",
        slug: "malice-group",
        description: "Director resource for powering monster abilities",
        keys: ["malice", "malice-features"],
    },
    {
        label: "Negotiation",
        slug: "negotiation",
        description: "Motivations, arguments, and NPC responses",
        keys: [
            "negotiation-overview", "negotiation-stats", "opening-negotiation",
            "motivations", "arguments", "npc-response",
        ],
    },
]

// Pages that appear as indented sub-links under a parent page in the sidebar.
// They are separate pages (own route) but visually nested.
const PAGE_CHILDREN: Record<string, string[]> = {
    skills: ["applying-skills", "many-specific-skills"],
    "taking-a-turn": ["move-actions", "maneuvers", "main-actions", "free-strikes"],
    movement: ["forced-movement"],
}

// Heading level that defines a "project" within each page.
const PROJECT_LEVELS: Record<string, number> = {
    crafting: 4,
    imbue: 5,
    research: 4,
    other: 4,
    movement: 4,
    maneuvers: 4,
    "main-actions": 4,
    "end-of-combat": 4,
    complications: 4,
}

export {
    RULES_SOURCES, ANCHOR_HEADINGS, PAGE_LABELS,
    PAGE_GROUPS, PAGE_CHILDREN, PROJECT_LEVELS,
}
