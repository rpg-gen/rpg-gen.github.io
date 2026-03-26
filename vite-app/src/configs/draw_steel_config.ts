// Draw Steel rules markdown sources from SteelCompendium (DRAW STEEL Creator License)
const BASE = "https://raw.githubusercontent.com/SteelCompendium/data-rules-md/refs/heads/main"

export interface RulesSource {
    url?: string
    urls?: string[]
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
        slug: "skills-tests",
        description: "Skill groups, test types, and how to apply skills",
        keys: ["test-overview", "skills", "assist", "stealth", "group", "montage"],
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
    skills: [
        "applying-skills", "many-specific-skills",
        "crafting-skills", "exploration-skills", "interpersonal-skills",
        "intrigue-skills", "lore-skills",
    ],
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
