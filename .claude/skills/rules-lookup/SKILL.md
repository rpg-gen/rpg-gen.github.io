---
name: rules-lookup
description: Add a new rules reference topic to the unified rules lookup feature from a remote markdown source.
disable-model-invocation: true
argument-hint: <topic-name> from <markdown-url> [additional context]
---

# Rules Lookup Builder

ultrathink

Add a new rules topic to the unified rules lookup: $ARGUMENTS

All rules topics share a single route (`/rules`), a single floating button, a single sidebar, and a single search. Adding a new topic means extending the existing config and hook — **not** creating new layouts, routes, or entry points.

## Reference Implementation

Read every file listed below before writing any code. These are the source of truth.

**Config & Types:**
- `src/configs/draw_steel_config.ts` — all config maps (sources, anchors, labels, groups, children, project levels)
- `src/types/draw_steel_rules.ts` — `RulesSection` and `RulesProject` interfaces (shared, do not duplicate)

**Data Hook:**
- `src/hooks/use_draw_steel_rules.tsx` — fetches all sources in parallel, parses markdown, assigns project IDs, returns accessor functions

**Layout (generalized, shared by all topics):**
- `src/components/rules/rules_lookup_layout.tsx` — `RulesLookupConfig` and `RulesLookupData` interfaces, header + sidebar + content area
- `src/pages/rules/rules_layout.tsx` — thin wrapper passing Draw Steel config to `RulesLookupLayout`

**Page Components (shared, reused for all topics):**
- `src/pages/rules/rules_page.tsx` — branching router: loading → error → empty → project detail → project index → child page (with back link) → single page (with optional sub-page links)
- `src/pages/rules/rules_section_list.tsx` — renders `RulesSection[]` with heading + markdown + hash scroll
- `src/pages/rules/rules_project_index.tsx` — intro sections + clickable project card links
- `src/pages/rules/rules_project_detail.tsx` — back link + project sections

**Sidebar & Search (shared):**
- `src/components/rules/rules_sidebar.tsx` — grouped pages with section headers, nested child pages, project sub-links, exit button with sessionStorage origin tracking
- `src/components/rules/rules_search.tsx` — search with breadcrumbs, snippets, project-aware navigation
- `src/components/rules/rules_markdown.tsx` — styled markdown renderer

**Entry Point & Routes:**
- `src/components/rules_book_button.tsx` — single floating button, stores origin in sessionStorage, navigates to `/rules/project-overview`
- `src/navigation/routes.tsx` — single `/rules` route with `:page_key` and `:page_key/:project_id` children
- `src/configs/constants.tsx` — `nav_paths.rules` = `/rules`

---

## Step 1: Analyze the Markdown Source

Fetch the markdown URL and analyze its structure:

1. **Heading hierarchy** — Identify heading levels (`###` through `######`) and what each level represents.
2. **Page boundaries** — Identify which headings should map to separate sidebar pages. Each distinct topic area becomes a page_key.
3. **Page grouping** — Determine if pages form a logical group (like "Projects" or "Skills & Tests") that should appear under a group header in the sidebar.
4. **Project boundaries** — Within each page, identify which heading level defines a "project" (a discrete item that gets its own sub-page with index/detail views). Not every page needs projects.
5. **Child pages** — Identify pages that should be nested under a parent page in the sidebar (like individual skill groups nested under "Skills"). These are separate pages but visually indented.
6. **Intro content** — Identify sections that appear before the first project on each page (renders on the index page above project links).
7. **Hidden pages** — Identify headings that mark content you want to hide or skip. Map these to page keys prefixed with `_` (e.g., `_example_tests`) so they're parsed but not shown in the sidebar.

Document findings before writing any code.

## Step 2: Update the Config

Edit `src/configs/draw_steel_config.ts` — add entries to the existing maps:

### RULES_SOURCES
Add a new entry to the array:
```typescript
const RULES_SOURCES = [
    // ... existing sources
    {
        url: "https://raw.githubusercontent.com/.../NewChapter.md",
        default_page: "new-default-page",
    },
]
```
The `default_page` is the page_key assigned to sections before the first anchor heading is encountered in this source.

### ANCHOR_HEADINGS
Add mappings from UPPERCASE heading text to page_key for every heading that should switch the current page context:
```typescript
const ANCHOR_HEADINGS: Record<string, string> = {
    // ... existing entries
    "NEW TOPIC HEADING": "new-page-key",
}
```
**Key rules:**
- Keys MUST be UPPERCASE (parsing does case-insensitive comparison)
- Only include headings that define page boundaries, not every heading
- To hide a section, map it to a key prefixed with `_` (e.g., `"UNWANTED SECTION": "_hidden"`)

### PAGE_LABELS
Add display labels for every new page_key:
```typescript
const PAGE_LABELS: Record<string, string> = {
    // ... existing entries
    "new-page-key": "Display Label",
}
```

### PAGE_GROUPS
Add a new group or extend an existing one. Groups define sidebar section headers:
```typescript
const PAGE_GROUPS: PageGroup[] = [
    // ... existing groups
    { label: "New Group Name", keys: ["page-a", "page-b", "page-c"] },
]
```
The `keys` array determines sidebar order within the group. Only include top-level pages here — child pages are listed in `PAGE_CHILDREN` instead.

### PAGE_CHILDREN (optional)
If some pages should be nested under a parent page in the sidebar:
```typescript
const PAGE_CHILDREN: Record<string, string[]> = {
    // ... existing entries
    "parent-page": ["child-a", "child-b", "child-c"],
}
```
**Behavior:**
- Child pages appear indented below the parent when the parent or any child is active
- Child pages show a "Back to [Parent]" link above their content
- The parent page shows clickable card links to each child at the bottom of its content
- Child page keys should NOT appear in `PAGE_GROUPS.keys` — they're only listed in `PAGE_CHILDREN`

### PROJECT_LEVELS (optional)
If a page contains discrete items that should each get their own sub-page (index + detail views):
```typescript
const PROJECT_LEVELS: Record<string, number> = {
    // ... existing entries
    "new-page": 4,  // h4 headings define projects on this page
}
```
**Behavior when set:**
- Page shows an index view: intro content + clickable project card links
- Each project card links to `/rules/page-key/project-id`
- Project detail view shows a "Back to [Page]" link + that project's sections
- Sidebar expands to show project sub-links when the page is active

## Step 3: Verify the Hook Handles It

The hook at `src/hooks/use_draw_steel_rules.tsx` automatically:
1. Fetches all `RULES_SOURCES` in parallel via `Promise.all`
2. Parses each with `parse_markdown(text, source.default_page)`
3. Runs `assign_project_ids()` on the combined flat array
4. Caches results at module level

**No hook changes needed** unless the new markdown source requires different parsing (e.g., different heading levels, closing hashes, etc.). If so, adjust `parse_markdown()`.

The heading regex `/^(#{3,6})\s+(.+)/` skips `#` and `##` levels by default. If the source uses those meaningfully, adjust the regex.

## Step 4: No New Components Needed

All page components, sidebar, search, and layout are fully generalized:

- **`RulesPage`** branches on: `project_id` param + `has_sub_pages()` + `find_parent()` + `page_children`
- **`RulesSidebar`** reads `PAGE_GROUPS`, `PAGE_CHILDREN`, and project data to render the full nav tree
- **`RulesSearch`** uses `base_path`, `page_labels`, and `project_id` to build correct URLs and breadcrumbs
- **`RulesLookupLayout`** orchestrates header, sidebar, and content area with mobile responsiveness

### Page rendering logic (for reference):
```
if (loading) → spinner
if (error) → error message
if (no sections) → empty state
if (project_id && has_sub_pages) → RulesProjectDetail (back link + sections)
if (has_sub_pages) → RulesProjectIndex (intro + project card links)
if (find_parent) → back link to parent + sections
else → sections + optional child page card links
```

### In-content navigation links

Pages automatically render clickable card-style links to their sub-items within the content area:

- **Project index pages** (`PROJECT_LEVELS`): After intro sections, a grid of card links appears — one per project. Each links to `/rules/page-key/project-id`. Styled as gold-text cards with subtle border on dark background.
- **Parent pages** (`PAGE_CHILDREN`): After the page's section content, a grid of card links appears — one per child page. Each links to `/rules/child-key`. Same card styling as project cards.
- **Child pages**: Show a "Back to [Parent]" link above the section content.
- **Project detail pages**: Show a "Back to [Page]" link above the project's sections.

This means users can navigate to sub-items both from the sidebar AND from within the page content itself.

## Step 5: No Route Changes Needed

The existing route structure handles all topics:
```typescript
{
    path: nav_paths.rules,        // "/rules"
    element: <RulesLayout />,
    children: [
        { index: true, element: <Navigate to="project-overview" replace /> },
        { path: ":page_key", element: null },
        { path: ":page_key/:project_id", element: null },
    ]
}
```

If the new topic should be the default landing page, update the index redirect.

## Step 6: No Entry Point Changes Needed

The single floating button at `src/components/rules_book_button.tsx`:
- Stores current path in `sessionStorage("rules_entry_origin")` before navigating
- Navigates to `/rules/project-overview` (the default page)
- Hides when already on `/rules`
- The sidebar "Exit Rules" button reads the stored origin to return the user to where they came from

---

## Page Types Summary

| Type | Config | URL | Content |
|---|---|---|---|
| **Single page** | page_key in `PAGE_GROUPS.keys`, not in `PROJECT_LEVELS` or `PAGE_CHILDREN` | `/rules/page-key` | All sections rendered with optional child page links at bottom |
| **Project index** | page_key in `PROJECT_LEVELS` | `/rules/page-key` | Intro sections + clickable project card grid |
| **Project detail** | (navigated from index) | `/rules/page-key/project-id` | Back link + project's sections |
| **Parent page** | page_key in `PAGE_CHILDREN` keys | `/rules/page-key` | Sections + child page card links at bottom |
| **Child page** | page_key in `PAGE_CHILDREN` values | `/rules/child-key` | Back link to parent + sections |
| **Hidden page** | page_key starts with `_`, not in `PAGE_GROUPS` | (not navigable) | Content parsed but not shown |

---

## Verification Checklist

1. `npm run build` — zero errors
2. Navigate to each new page — content renders correctly
3. Sidebar shows new group with correct pages
4. If using `PROJECT_LEVELS`: index shows intro + project cards, detail shows project content, back link works
5. If using `PAGE_CHILDREN`: parent shows child links at bottom, children show back link to parent, sidebar nests children under parent
6. Search finds content from new source, breadcrumbs show correct "Page > Project" path
7. Clicking search results navigates to correct URL and scrolls to section
8. Mobile: hamburger works, sidebar overlay shows new pages, project cards render
9. Exit button returns to page user was on before entering rules
10. All files under 400 lines
