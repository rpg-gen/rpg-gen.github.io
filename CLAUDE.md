# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RPG tooling SPA (React + TypeScript + Vite) with two main features: a hexagon grid map editor and a "Delve Cards" card management system. Firebase provides auth and Firestore persistence. Deployed to GitHub Pages via the `/docs` folder.

## Development Commands

All commands run from `/vite-app/`:

```bash
cd vite-app
npm run dev          # Start dev server with HMR
npm run build        # TypeScript compile + Vite production build
npm run lint         # ESLint (zero warnings enforced)
npm run preview      # Preview production build locally
```

**Deploy build:** From `vite-app/`, run `bash build.sh` — this builds, deletes `/docs`, and moves `dist` to `/docs` for GitHub Pages.

No test framework is configured.

## Architecture

**Entry flow:** `src/main.tsx` → `src/navigation/routes.tsx` (React Router) → `src/App.tsx` (layout + context providers) → pages

### Key Layers

- **Pages** (`src/pages/`) — Route-level components. Delve card pages are in `src/pages/delve_cards/`.
- **Components** (`src/components/`) — Reusable UI. `delve_card_display.tsx`, `delve_card_filter.tsx`, and `delve_card_chip_selector.tsx` are the main shared card components.
- **Hooks** (`src/hooks/`) — All Firebase data access. `delve_cards/use_delve_card_data.tsx` is the consolidated hook that loads cards, tags, and decks together. Individual CRUD hooks are in `use_firebase_delve_cards.tsx`, `use_firebase_delve_card_tags.tsx`, `use_firebase_delve_card_decks.tsx`.
- **Contexts** (`src/contexts/`) — Four React contexts: `UserContext` (auth state), `ScaleContext` (map zoom), `DataContext` (map matrix data), `DelveCardFilterContext` (card filter state with tags, decks, rarities, text search).
- **Configs** (`src/configs/`) — Constants, colors, feature flags, nav paths. `constants.tsx` has `nav_paths` used for routing. `delve_card_colors.ts` centralizes all card color schemes.
- **Utilities** (`src/utility/`) — Pure helper functions. `card_filter_utils.ts` handles card filtering logic. `delve_card_helpers.ts` has tag/deck name resolution helpers. `filter_initialization.ts` handles default filter setup.
- **Types** (`src/types/`) — TypeScript interfaces for DelveCard, DelveCardTag, DelveCardDeck, map/hexagon types, and context types.
- **Classes** (`src/classes/`) — `Matrix.tsx` (hexagon grid data structure) and `Hexagon.tsx` (individual hex with Fabric.js integration).

### Auth & Protected Routes

Firebase email/password auth managed by `useFirebaseAuth` hook → `UserContext`. Admin-only pages (card editing, tag/deck management, tagger, utilities) are wrapped with `<ProtectedRoute>`.

### Feature Flags

`src/configs/feature_flags.tsx` — currently controls `is_persist_to_firebase` for map persistence.

## Conventions

- **File size limit:** Files must stay under 400 lines (enforced by ESLint `max-lines`). Target 300 lines or fewer — when a file exceeds 300 lines, proactively split it into smaller modules (extract components, hooks, or helpers into separate files) before it hits the 400-line hard limit. Never reduce line count by removing blank lines, compressing formatting, or inlining code — the goal is modularization, not minification. Data-oriented files (`src/configs/`, `src/types/`) are exempt from the line limit since they are pure declarations that don't benefit from splitting.
- File naming: `snake_case.tsx` throughout (except `App.tsx`, `Tagger.tsx`)
- Firebase hooks follow `use_firebase_*.tsx` pattern
- Card-related code is namespaced under `delve_cards/` subdirectories in pages and hooks
- Colors and styling constants are centralized in `src/configs/` rather than inline
- Mobile breakpoint: 500px (`mobile.break_point` in constants)

### RPG Notes Click-to-Edit Pattern

- `editingField` state + `editingFieldRef` (useRef) to guard useEffect syncs
- Text fields: click to reveal input, save on blur/Enter
- Textarea fields: click to reveal textarea, explicit "Save" button
- Dropdowns: always visible, save on change
- Name renames update `[[OldName]]` refs in session notes
- Delete button at bottom of every detail view
- Form components are add-only; all editing happens in detail views
- Reference implementation: `quest_detail.tsx`

### TTRPG Single-Document Firestore Storage

- All campaign data in one doc: `ttrpg_campaigns/{campaignId}` with nested maps (sessions, members, notes, lore, quests, party_resources)
- Real-time via `onSnapshot` in `use_ttrpg_campaign_data.tsx`
- Writes use dot-notation paths: `"lore.{id}.name"` for field updates
- Deletions use `deleteField()` for entities or optional fields
- Creates use `setDoc` with `{ merge: true }`
- Firebase hooks handle raw Firestore; `useTtrpgCampaignData` wraps with campaignId injection
