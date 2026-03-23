---
name: dev-plan
description: Create a developer implementation plan for a feature covering architecture, data patterns, testing, build verification, code quality, and housekeeping.
disable-model-invocation: true
argument-hint: [feature description or user-plan output]
---

# Developer Implementation Plan

ultrathink

Create an implementation plan for: $ARGUMENTS

## Critical Rules (follow these throughout)
- Read code before making any claims about it. Never assume file contents.
- Be specific: real file paths, function names, Firestore field paths. No placeholders.
- Follow all conventions from CLAUDE.md — do not reinvent patterns that already exist.
- Prefer reusing existing components, hooks, and utilities over creating new ones.

## Step 1: Explore

Before writing anything, read at minimum:
- The TypeScript types for the affected area
- The primary data hook (Firebase or campaign data)
- One existing reference implementation of a similar feature (e.g., `quest_detail.tsx` for a new detail view)
- Any components likely to be reused or modified

Use Glob and Grep to find related files. Continue exploring until you can name every file that will be created or changed.

## Step 2: Clarify (if needed)

If technically ambiguous, ask 2-4 targeted questions. Skip if requirements are clear from the input and codebase exploration.

## Step 3: Write the Plan

Use exactly this structure. Every section is required — if not applicable, state why in one line.

---

## Plan: [Feature Name]

### Summary
1-2 sentences.

### Files to Create
`src/path/file.tsx` — purpose (one line per file)

### Files to Modify
`src/path/file.tsx` — what changes (one line per file)

### Data Model
Document the Firestore structure (document path, fields, nested maps) and corresponding TypeScript interfaces.

Assess read/write impact:
- Count new Firestore reads this feature adds. Identify opportunities to reuse existing `onSnapshot` listeners instead of adding new ones.
- Confirm writes use dot-notation field updates, not full-doc overwrites.
- Estimate free-tier budget impact.

Assess concurrent user safety:
- Identify where simultaneous edits could cause data loss or overwrites.
- Document the merge strategy (merge writes, atomic operations, or last-write-wins) and justify the choice.

### Data Migration
If this feature changes the shape of existing Firestore data:
- Define the migration strategy (lazy on next read/write, or one-time script) with default values for documents missing new fields.
- Specify deploy ordering: can old and new shapes coexist, or must migration run first?
- Confirm new code handles un-migrated documents gracefully.

If repo sample data or fixtures exist for the affected area, update them to match.

Confirm TypeScript interfaces match the new Firestore shape exactly.

### Implementation Steps
Ordered list of concrete steps. Each step should be small enough to verify independently. Do not use generic boilerplate — tailor every step to this specific feature.

### UI/UX & Routing
- Identify which existing components to reuse and which new ones to create.
- Specify new routes, nav links, and protected route requirements.
- Note applicable UI patterns from CLAUDE.md (click-to-edit, optimistic updates, etc.) — reference them by name, don't restate them.
- Cover loading, empty, and error states.

### Verification
**Build**: The implementation must pass `npm run build` and `npm run lint` (zero warnings). Fix pre-existing lint issues in any modified file. No `any` types.

**Manual testing via Playwright browser tool** (no test framework exists):
- List specific scenarios to walk through: happy path, empty state, error state, mobile (500px viewport).
- Take screenshots of each key state to visually confirm correctness.
- Verify deep linking and navigation behavior.

**Deploy**: `bash build.sh` must produce a working `/docs` folder. Verify with `npm run preview`.

### Code Quality & Housekeeping
For every file touched by this feature:
- Identify files that will exceed 300 lines and plan how to split them.
- Remove dead code: unused imports, variables, functions, commented-out blocks.
- Fix nearby quality issues: inconsistent naming, missing types, duplicated logic, magic values, inline styles.
- Flag inconsistent patterns across the codebase and plan to consolidate toward one standard.
- Design new components for reuse (props over hardcoded behavior).

### Risks & Open Questions
- What could break in existing functionality.
- Performance concerns.
- Anything unresolved.

---

## Done Criteria
The plan is complete when a different Claude session could execute it start-to-finish without asking clarifying questions. If you can't meet that bar, move the gaps to Risks & Open Questions.
