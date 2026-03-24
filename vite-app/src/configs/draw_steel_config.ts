// Draw Steel rules markdown sources from SteelCompendium (DRAW STEEL Creator License)
const RULES_SOURCES = [
    {
        url: "https://raw.githubusercontent.com/SteelCompendium/data-rules-md/refs/heads/main/Chapters/Downtime%20Projects.md",
        default_page: "project-overview",
    },
    {
        url: "https://raw.githubusercontent.com/SteelCompendium/data-rules-md/refs/heads/main/Chapters/Tests.md",
        default_page: "test-overview",
    },
]

// "Anchor" headings that switch the current page_key when encountered.
// Keys are UPPERCASE heading text.
const ANCHOR_HEADINGS: Record<string, string> = {
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
}

const PAGE_LABELS: Record<string, string> = {
    "project-overview": "Overview",
    crafting: "Crafting",
    imbue: "Imbue",
    research: "Research",
    other: "Other",
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
}

export interface PageGroup {
    label: string
    keys: string[]
}

const PAGE_GROUPS: PageGroup[] = [
    { label: "Projects", keys: ["project-overview", "crafting", "imbue", "research", "other"] },
    {
        label: "Skills & Tests",
        keys: ["test-overview", "skills", "assist", "stealth", "group", "montage"],
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
}

// Heading level that defines a "project" within each page.
const PROJECT_LEVELS: Record<string, number> = {
    crafting: 4,
    imbue: 5,
    research: 4,
    other: 4,
}

export {
    RULES_SOURCES, ANCHOR_HEADINGS, PAGE_LABELS,
    PAGE_GROUPS, PAGE_CHILDREN, PROJECT_LEVELS,
}
