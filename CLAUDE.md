# 5Mins.ai — Claude Code Instructions

## Project Overview

5Mins.ai is a B2B micro-learning platform for enterprise customers in compliance-heavy industries (hospitality, finance, healthcare). Tech stack: React TypeScript, CSS with design tokens (CSS custom properties).

## Commands

- `npm run dev` — Vite dev server at http://localhost:5173
- `npm run build` — type-check (`tsc -b`) + production build; run this to verify changes compile

## Project Structure

- `src/pages/<feature>/` — one folder per route/feature; page-local components live in `<feature>/components/`
- `src/components/` — shared reusable components, one folder per component (`Name/Name.tsx` + `Name.css`). Check here AND `docs/design-system/*.md` before building anything new — never improvise a custom component.
- `src/data/` — mock data stores
- `src/styles/` — global `tokens.css`, `reset.css`, `typography.css`
- `docs/design-system/` — design system documentation (see below)
- Routes are declared in `src/App.tsx`
- Import shared code via the `@/` alias (e.g. `@/components/Toast/Toast`), never deep relative paths like `../../../../components/...`
- **CSS is globally bundled** — class names collide across pages. Prefix page-level classes with the page name (e.g. `.roles-`, `.people-`) and grep for a class name before adding or restyling it.

## Design System

When building any UI component, feature, or screen, you MUST read the relevant design system documentation before writing code.

### How to use the design system docs

All component docs are Figma-verified (2026-07, with node refs in each file). **Prototype directly from these md files — do not fetch Figma links or screenshots for components that have a doc.** If a task needs a component that has no doc below, do not improvise or adapt a "close enough" pattern silently: say which component is missing and ask for the Figma link, then create its doc before/while building.

1. **Always start** with `docs/design-system/design-system-guidelines.md` — the design foundations (colors incl. the three-amber selection tokens, typography, spacing, radius, icons, accessibility) plus quick decision tables. Component specs live in the per-component docs.
2. **Then read the specific component doc** for detailed implementation (React TypeScript code, full CSS, usage examples):
   - `docs/design-system/buttons.md` — Button system: Filled/Outlined/Outlined-2/Text/Link + Danger/Warning/Success families + AI gradient buttons; 3 sizes, all states incl. Loading; trailing icons
   - `docs/design-system/badges.md` — Status badges, pill indicators, quiz badges
   - `docs/design-system/chips-switcher-tabs.md` - Chip component (filter pills, dismissible tags, selection chips with optional left/right icons), Content Switcher (segmented control in a filled track), and Tabs component (underlined horizontal switcher with optional counter pills); all variants, states, design tokens, React implementation, plus a Chips vs Switcher vs Tabs decision table | Any filter chip, selection pill, dismissible tag, segmented control, tab bar, section switcher, or small pill-shaped interactive label
   - `docs/design-system/headers.md` — Page and Section Headers: slot-based (label ↔ breadcrumb, tabs ↔ chips, configurable CTA cluster with search/AI/buttons) | Any page or section heading, title bar, header with actions
   - `docs/design-system/overlays.md` — Dialog (Error/Warning/Info/Success types, 56px icons), Modal (720px, centered), and Side Drawer (right-anchored) — shared scrim, close behavior, animations | Any overlay, confirmation, popup, panel, or drawer
   - `docs/design-system/calendar.md` — Date field (Enabled/Hover/Active/Error, optional label) + month-grid calendar popover with all day-cell states (selected, today, focus, hover, outside-month, streak illustration) | Any date picker, date input, or scheduling UI
   - `docs/design-system/cards.md` — Lesson, Assessment, Course, Skill, Category, and Folder card components; desktop variants, states, dimensions, tokens, and ready HTML/CSS specs
   - `docs/design-system/table.md` — Data table component. Card-style bordered rows (not a gridlined table), borderless header with optional sorting and select-all, all 16 cell content types (text, supporting text, date, icon, checkbox, avatar, avatar group, illustration, thumbnail, progress bar, action icon, badge, button, dropdown), 5 row states (Enabled, Hover, Selected, Selected-Hover, Disabled), pagination footer, design tokens, full CSS and React implementation | Any data table, list view, records grid, enrolments/learners/roles/reports table, or tabular layout
   - `docs/design-system/typography.md` — Type scale, weights, colors
   - `docs/design-system/colors.md` — Complete color system: raw palettes (Primary, Secondary, Neutral, Success/Warning/Danger, Gamification) + semantic surface and text tokens with dark- and light-mode values | Any color decision — backgrounds, borders, buttons, text, status, badges
   - `docs/design-system/iconography.md` — Iconsax React icons, sizes, variants; skill-category illustration library (`src/assets/skill-icons/`, lookup by skill name)
   - `docs/design-system/gamification.md` — Gamification elements: skill-level shield/medal illustrations (levels 1–5 + Advanced/Expert/Master, small 56/large 72, enabled/disabled), progress stat icons (streak/points/jewels/certificates + quiz outcomes, 40px), certificate artwork (4 sizes 20–240px), 96px hero illustrations, and pointers to the skill-category illustrations — all under `src/assets/*-illustrations/` | Any learner progression UI — skill levels, learning paths, level badges, streaks, points, certificates, celebrations
   - `docs/design-system/layout.md` — Layout foundations: 4px spacing scale (padding, margins, gaps), border radius, icon sizes, shadows (S/L/XL), overlay scrim with dark/light values | Any spacing, roundness, elevation, or backdrop decision
   - `docs/design-system/input.md` - Input system, four types: Outlined text field, Inline borderless title/description editor, Radio option-row input, Integer stepper — all states (Enabled, Hover, Active amber, Filled, Disabled), error/success validation, label, helper, right icon | Any text entry, form field, title editing, or numeric setting
   - `docs/design-system/empty-state.md` — Empty State: 72px illustration + Bold-20 title + 600px-max description + outlined/filled CTA pair | Any empty list, table, tab, folder, or no-results view
   - `docs/design-system/dropdown.md` — Dropdown/Select component — all sizes (S/M/L), all states (Default, Hover, Open, Selected, Disabled, Error), label, helper/error text, searchable variant, multi-select with chips, option groups, React implementation | Any dropdown, select field, option picker, filter selector, or combobox
   - `docs/design-system/listbox.md` — Listbox/menu surface: container (caret top/bottom, plain, grouped with headers+dividers) + list items with full slot matrix (icons, avatar, checkbox, radio, embedded search, supporting text) and Enabled/Hover/Selected/Read-only states | Any menu, options list, action popover, or picker
   - `docs/design-system/navigation.md` — Navigation system: Top Navigation bar (Web app + Admin, large/small breakpoints), Side Panel Navigation (Web app + Admin, Expanded/Collapsed) — menu-item state matrix (hover fill, amber Bold selected via --text-selected, collapsed hover tooltip flyout), expandable Admin groups with sub-menus, profile card + powered-by footer, and the Breadcrumb trail component (chevron-separated, link/current/disabled states) | Any app shell, top bar, sidebar, menu item, breadcrumb, or navigation chrome
   - `docs/design-system/file-uploader.md` - File upload component — two sizes (L/S), all five states (Enabled, Hover, Error, Uploading, Filled), circular progress, filename display, Preview + Change File CTAs | Any file input, drag-and-drop zone, CSV import, document or media upload
   - `docs/design-system/alerts-toast.md` — Informative components: Alert and Callout inline banners (both types, all prop combos), Toast floating feedback pill (Success/Warning/Error/Info, Bold-16 label, auto-dismiss), and Tooltip (4 positions, 3 alignments, optional info-icon anchor, caret, dark bg, max-width 288px) — CSS, React implementations | Building any inline notification, warning banner, callout, info strip, toast, snackbar, tooltip, or contextual hint
   - `docs/design-system/avatars.md` — Avatar (7 sizes, picture/fallback) and Avatar Group (3 sizes, overlap + "+N" counter bubble) | Any user photo, initials chip, member stack, or people indicator
   - `docs/design-system/search.md` — Search input — two sizes (M/L), three states (Enabled, Hover, Active), filled/empty modes, clear button | Building any search field, filter input, or keyword search bar
   - `docs/design-system/selection-controls.md` - Radio button, Checkbox (including indeterminate), and Toggle switch; all states (enabled, hover, disabled), dimensions, design tokens (selected amber, hover halo, disabled gray), CSS and React TypeScript implementations, grouping and accessibility patterns | Any single-choice option group (radio), multi-choice list or consent acknowledgement (checkbox), or instant on/off setting (toggle); filter panels, settings rows, permission switches, feature flags

### Strict rules

- **Never improvise design values.** Use only tokens defined in the design system (colors, spacing, radius, font sizes).
- **Always use semantic tokens over raw palette values.** Prefer `--text-primary` over `--neutral-800`, `--cards-background` over `--neutral-0`, `--border` over `--neutral-100`.
- **Always use Poppins** as the font family. Weights: 400, 500, 700 only.
- **Always use Iconsax React** for icons. Standard sizes: 16, 20, 24, 32px only.
- **All spacing must be multiples of 4px.** Use the spacing scale tokens.
- **Never use `--primary-500` for text on white backgrounds** — it fails WCAG contrast.
- **Bold (700) is only for headings and buttons.** Medium (500) for subtle emphasis. Regular (400) for body text.
- **Follow the component patterns exactly** — button pairing, overlay selection, badge type mapping, header hierarchy, table card-row structure (each row a bordered rounded card with a gap between rows, never a gridlined table).

## Code Style

- React functional components with TypeScript
- CSS custom properties (design tokens) for all styling values
- Semantic HTML with proper ARIA attributes
- All interactive elements must have visible `:focus-visible` indicators

## Karpathy Skills — Coding Principles

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

### 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
