# 5Mins.ai — Claude Code Instructions

## Project Overview

5Mins.ai is a B2B micro-learning platform for enterprise customers in compliance-heavy industries (hospitality, finance, healthcare). Tech stack: React TypeScript, CSS with design tokens (CSS custom properties).

## Design System

When building any UI component, feature, or screen, you MUST read the relevant design system documentation before writing code.

### How to use the design system docs

1. **Always start** with `docs/design-system/design-system-guidelines.md` — this is the consolidated reference with all tokens, colors, typography, spacing, and component specs.
2. **Then read the specific component doc** for detailed implementation (React TypeScript code, full CSS, usage examples):
   - `docs/design-system/buttons.md` — Button variants, semantic types, sizes, states
   - `docs/design-system/badges.md` — Status badges, pill indicators, quiz badges
   - `docs/design-system/chips-and-tabs.md` - Chip component (filter pills, dismissible tags, selection chips with optional left/right icons) and Tabs component (underlined horizontal switcher with optional counter pills); all variants, states, design tokens, React implementation, plus a Chips vs Tabs decision table | Any filter chip, selection pill, dismissible tag, tab bar, section switcher, or small pill-shaped interactive label
   - `docs/design-system/headers.md` — Page Headers and Section Headers
   - `docs/design-system/overlays.md` — Dialog, Modal, and Side Drawer
   - `docs/design-system/cards.md` — Lesson, Assessment, Course, and Skill card components; desktop variants, states, dimensions, tokens, and ready HTML/CSS specs
   - `docs/design-system/table.md` — Data table component. Card-style bordered rows (not a gridlined table), borderless header with optional sorting and select-all, all 16 cell content types (text, supporting text, date, icon, checkbox, avatar, avatar group, illustration, thumbnail, progress bar, action icon, badge, button, dropdown), 5 row states (Enabled, Hover, Selected, Selected-Hover, Disabled), pagination footer, design tokens, full CSS and React implementation | Any data table, list view, records grid, enrolments/learners/roles/reports table, or tabular layout
   - `docs/design-system/typography.md` — Type scale, weights, colors
   - `docs/design-system/brand-colors.md` — Full color palette and usage rules (Primary, Neutral-0→900, Semantic, Gamification)
   - `docs/design-system/surface-colors.md` — Semantic surface tokens for backgrounds, borders, and button states
   - `docs/design-system/text-colors.md` — Semantic text color tokens for all text roles (hierarchy, buttons, status, interactive, quiz)
   - `docs/design-system/iconography.md` — Iconsax React icons, sizes, variants
   - `docs/design-system/spacing.md` — Spacing scale and border radius system
   - `docs/design-system/input.md` - Text inputs, form fields, search boxes, email/password/numeric fields — all states (Enabled, Hover, Active, Filled, Disabled), validation states, label, helper text, right-side icon | Any user text-entry element or form control
   - `docs/design-system/dropdown.md` — Dropdown/Select component — all sizes (S/M/L), all states (Default, Hover, Open, Selected, Disabled, Error), label, helper/error text, searchable variant, multi-select with chips, option groups, React implementation | Any dropdown, select field, option picker, filter selector, or combobox
   - `docs/design-system/file-uploader.md` - File upload component — two sizes (L/S), all five states (Enabled, Hover, Error, Uploading, Filled), circular progress, filename display, Preview + Change File CTAs | Any file input, drag-and-drop zone, CSV import, document or media upload
   - `docs/design-system/alerts.md` — Alert and Callout banner — both types, all prop combos, CSS, React implementation | Building any inline notification, warning banner, callout, or info strip
   - `docs/design-system/search.md` — Search input — two sizes (M/L), three states (Enabled, Hover, Active), filled/empty modes, clear button | Building any search field, filter input, or keyword search bar
   - `docs/design-system/tooltip.md` — Tooltip component — 4 positions (Top/Bottom/Left/Right), 3 alignments (Center/Start/End), optional info icon anchor, caret, dark background, max-width 288px, React implementation | Any tooltip, contextual hint, helper text on hover/focus, or info icon with floating label
   - `docs/design-system/selection-controls.md` - Radio button, Checkbox (including indeterminate), and Toggle switch; all states (enabled, hover, disabled), dimensions, design tokens (selected amber, hover halo, disabled gray), CSS and React TypeScript implementations, grouping and accessibility patterns | Any single-choice option group (radio), multi-choice list or consent acknowledgement (checkbox), or instant on/off setting (toggle); filter panels, settings rows, permission switches, feature flags

### Strict rules

- **Never improvise design values.** Use only tokens defined in the design system (colors, spacing, radius, font sizes).
- **Always use semantic tokens over raw palette values.** Prefer `--text-primary` over `--neutral-800`, `--surface-card` over `--neutral-0`, `--border-default` over `--neutral-100`.
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
