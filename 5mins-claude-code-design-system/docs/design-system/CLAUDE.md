# Design System Documentation

This directory contains the complete 5Mins.ai design system documentation.

## File Index

| File | What it covers | Read when... |
|------|---------------|--------------|
| `design-system-guidelines.md` | **Consolidated reference** — all tokens, quick decisions | Always read this first for any UI work |
| `buttons.md` | Button variants, semantic types, sizes, states, React implementation | Building any button or CTA |
| `badges.md` | Badge types, colors, icons, usage patterns | Adding status indicators, tags, or pills |
| `chips-and-tabs.md` | Chip component (filter pills, dismissible tags, selection chips with optional left/right icons) and Tabs component (underlined horizontal switcher with optional counter pills); all variants, states, design tokens, React implementation, plus a Chips vs Tabs decision table | Adding filter chips, selection pills, dismissible tags, tab bars, section switchers, or any small pill-shaped interactive label |
| `headers.md` | Page Header and Section Header with all sub-elements | Building page layouts, navigation, tabs, chips |
| `overlays.md` | Dialog, Modal, Side Drawer — specs, animations, accessibility | Building any overlay, popup, or panel |
| `cards.md` | Content card components: Lesson, Assessment, Course, and Skill cards; desktop variants, states, dimensions, tokens, and ready HTML/CSS specs | Building lesson lists, course catalogs, library grids, or any list of lessons, assessments, courses, or skills |
| `typography.md` | Type scale (H1-H6, body, buttons), weights, responsive rules | Any text styling decisions |
| `brand-colors.md` | Full color palette — Primary, Neutral-0→900, Semantic, Gamification | Choosing any raw palette value |
| `surface-colors.md` | Semantic surface tokens — page/card/input backgrounds, borders, button background states | Setting any background, border, or button surface color |
| `text-colors.md` | Semantic text tokens — hierarchy, button labels, status, interactive, quiz | Choosing any text color |
| `alerts.md` | Alert and Callout banner — both types, all prop combos, CSS, React implementation | Building any inline notification, warning banner, callout, or info strip |
| `search.md` | Search input — two sizes (M/L), three states (Enabled, Hover, Active), filled/empty modes, clear button | Building any search field, filter input, or keyword search bar |
| `iconography.md` | Iconsax React icons, sizes, variants, common patterns | Adding or styling any icon |
| `spacing.md` | Spacing scale, component padding, border radius | Layout, padding, margin, gap decisions |
| `input.md` | Text inputs, form fields, search boxes, email/password/numeric fields — all states (Enabled, Hover, Active, Filled, Disabled), validation states, label, helper text, right-side icon | Any user text-entry element or form control |
| `dropdown.md` | Dropdown/Select component — all sizes (S/M/L), all states (Default, Hover, Open, Selected, Disabled, Error), label, helper/error text, searchable variant, multi-select with chips, option groups, React implementation | Any dropdown, select field, option picker, filter selector, or combobox |
| `file-uploader.md` | File upload component — two sizes (L/S), all five states (Enabled, Hover, Error, Uploading, Filled), circular progress, filename display, Preview + Change File CTAs | Any file input, drag-and-drop zone, CSV import, document or media upload |
| `selection-controls.md` | Radio button, Checkbox (including indeterminate), and Toggle switch; all states (enabled, hover, disabled), dimensions, design tokens, CSS and React TypeScript implementations, grouping and accessibility patterns | Any single-choice option group (radio), multi-choice list or consent acknowledgement (checkbox), or instant on/off setting (toggle); filter panels, settings rows, permission switches, feature flags |

## Usage Pattern

```
1. Read design-system-guidelines.md (always)
2. Read the specific component file (for implementation details)
3. Follow tokens exactly — never improvise values
4. Prefer semantic tokens (surface-colors, text-colors) over raw palette values (brand-colors)
```
