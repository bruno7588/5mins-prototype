---
name: 5mins-design-system-guidelines
description: Design foundations for 5Mins.ai - brand identity, color system (incl. the three-amber selection tokens), typography, 4px spacing scale, border radius, iconography, accessibility, and quick decision tables. Component specs live in per-component docs (see the doc map). Start here for any token or foundation question.
---

# Design system guidelines

The index for the 5Mins.ai design system: the global rules, a map of every doc, and quick decision tables. 5Mins.ai is a B2B micro-learning platform for compliance-heavy industries; the UI is clean, professional and led by a cyan brand colour. Token values live in `src/styles/tokens.css`; never copy them into a doc or component.

## Global rules

1. **Tokens only.** Every colour, spacing, radius, font size, icon size and shadow is a `var(--token)` from `src/styles/tokens.css`. Any px or colour value resolves to its token. Never improvise a value; run `pnpm lint:css` on CSS you touch.
2. **Check before building.** Look in `src/components/` and the component doc first; never hand-roll a component that exists. If a component has no doc, say which one is missing and ask for the Figma link.
3. **Semantic tokens for surfaces, text and borders.** `--text-primary` not `--neutral-800`, `--cards-background` not `--neutral-0`. Raw `--neutral-*` doesn't flip in dark mode. Status icon colours are the exception (raw, mode-invariant).
4. **Borders by surface.** `--border` on the page ground and inside drawers and modals; `--border-elevated` on cards and menus, including the controls inside them.
5. **Poppins only**, weights 400/500/600/700: Bold for headings and buttons, Semibold for form-field labels, Medium for emphasis, Regular for body.
6. **Iconsax React only**, at 16/20/24/32px, with an explicit `color`. Icon-only buttons get an `aria-label`, a DS Tooltip on web and a circular `var(--radius-full)` hover.
7. **4px spacing.** Layout spacing is on the 4px scale; the 2/6/10px tokens are for inside components only.
8. **Visible focus everywhere.** Every interactive element has a `:focus-visible` ring: `outline: 2px solid var(--primary-button-background); outline-offset: 2px`.
9. **Copy casing.** Button labels in Title Case ("Save Mapping"); headings and other UI copy in sentence case.
10. **Colour roles.** Never `--primary-500` as text on white; never cyan or amber for warnings or errors; amber is selection only (see the three-amber system in `colors.md`).
11. **Overlays.** Backdrops are `var(--scrim)`; side drawers are 720px wide.
12. **No faked states.** Never fake a state with opacity; disabled uses `--button-background-disabled` / `--text-disabled`. Animate expand/collapse with `Collapse`. Every animation follows `motion.md`: sized to how often it is seen, under 300ms for UI, with a reduced-motion fallback.
13. **Semantic HTML and ARIA.** Headings in order; `<article>` for lesson cards; `<nav aria-label="Breadcrumb">`; tabs use `role="tablist"` / `role="tab"` with `aria-selected`; status badges `role="status"`; Dialog `role="alertdialog"`, Modal and Side Drawer `role="dialog"`. Disabled `aria-disabled="true"`; loading buttons `aria-busy="true"`; progress bars `role="progressbar"` with `aria-valuenow`/`-min`/`-max`; overlays `aria-modal="true"`, `aria-labelledby` the title, a focus trap and focus return on close.

## Doc map

Every component doc follows `_template.md`: Usage, then Figma to code. Read the doc before building and match it exactly.

| Doc | Covers | Read when |
|---|---|---|
| `_template.md` | The section order every doc follows | Writing or restructuring a doc |
| `CHANGELOG.md` | Dated history removed from the docs | You need to know when or why a rule changed; not needed to build |
| `colors.md` | Palettes, semantic surface/text tokens, light/dark values, three-amber system | Any colour decision |
| `typography.md` | Poppins scale, weights, line heights, `--font-size-*` | Any text style |
| `layout.md` | Spacing, radius, icon sizes, shadows, scrim | Any spacing, radius, elevation or backdrop |
| `motion.md` | When to animate, durations, easing, which tool, reduced motion | Adding or changing any animation or transition |
| `iconography.md` | Iconsax rules, variants, colours, skill illustrations | Choosing or sizing an icon |
| `buttons.md` | All button families, sizes, states, AI gradient | Any button or link |
| `badges.md` | Status pills, quiz and scheduled badges | Any status, tag or count pill |
| `chips-switcher-tabs.md` | Chips, content switcher, tabs | Filters, segmented controls, tab bars |
| `headers.md` | Page and section headers | Any page or section title row |
| `cards.md` | Lesson, assessment, course, skill, category, folder cards; media type tag | Any card |
| `resource-card.md` | Course file and link card | Attachments and downloads |
| `table.md` | Card-row data table | Any data table or list view |
| `overlays.md` | Dialog, Modal, Side Drawer, mobile Bottom Sheet | Any overlay |
| `confirm-modal.md` | `ConfirmModal` dialog shell | Confirmations and small modals |
| `alerts-toast.md` | Alert, Callout, Toast, Tooltip | Inline messages, feedback, hints |
| `input.md` | Outlined, inline, radio-row and integer inputs | Any text or number entry |
| `dropdown.md` | Dropdown / select, multi-select | Any option picker |
| `listbox.md` | Menu surface and list items | Menus and popovers |
| `search.md` | Search field | Any search input |
| `calendar.md` | Date field and month calendar | Date picking UI |
| `date-picker-field.md` | `DatePickerField` component | Any date input |
| `selection-controls.md` | Checkbox, radio, toggle | Choice and on/off controls |
| `file-uploader.md` | File upload, L and S | Any upload |
| `filter-bar.md` | Filter bar and active-filter pills | Multi-field filters above a table |
| `row-actions-menu.md` | Kebab row actions | Per-row or toolbar actions |
| `bulk-action-bar.md` | Bulk action bar | Multi-select actions |
| `stepper.md` | Wizard step bar | Multi-step flows |
| `collapse.md` | Animated expand/collapse | Any accordion or revealed section |
| `avatars.md` | Avatar and avatar group | Any person photo or stack |
| `empty-state.md` | Empty state with illustration | Empty lists, tables, searches |
| `navigation.md` | Top nav, side panel, breadcrumb, mobile tab bar | App shell and navigation |
| `gamification.md` | Levels, streaks, quiz-type and certificate artwork | Learner progression UI |
| `program-certificate.md` | Program certificate, Locked and Unlocked | Program certification section |
| `impersonation-banner.md` | Impersonation session bar | Changing the banner or adding fixed layers |
| `drift-report.md` | Known hand-rolled duplicates (report, not guidance) | Before refactoring a page |
| `production-claude-snippet.md` | Paste-ready DS block for the production repo | Setting up agents in production |
| `eng-skill/` | Engineering DS audit skill and README | Auditing production code against the DS |

## Quick decision reference

### What colour for…
| Need | Answer |
|---|---|
| Primary CTA | `--primary-button-background` (hover `-hover`, pressed `-pressed`) |
| Links | `--primary-button-background` ladder (Link button) |
| Field active border / tab indicator | `--selected` (mode-aware) |
| Chip / switcher selected fill | `--secondary-500` + Bold `--text-on-selected` |
| Listbox selected row | `--selected` + `--text-on-selected` at 500 |
| Radio / checkbox selected | `--control-selected` |
| Success / warning / error status icon; text | `--success-500` / `--warning-500` / `--danger-500`; `--text-success` / `--text-warning` / `--text-error` |
| AI features | `--blaze-quiz`; gradients `--gradient-ai` / `--gradient-ai-diagonal` |
| Overlay backdrop | `--scrim` (Neutral-900 @ 25% light / 50% dark) |
| Overlay panel surface | `--page-background` |

### What size for…
| Element | Size |
|---|---|
| Course / page / section title | `--font-size-h1` 32px / `--font-size-h2` 24px on an `<h2>` / `--font-size-h3` 20px on an `<h3>` |
| Card header | `--font-size-h4` (16px) |
| Main body / secondary / caption | `--font-size-lg` 16px / `--font-size-md` 14px / `--font-size-sm` 12px |
| Standard button / badge text | Medium button, 41px high / 14px Medium |
| Nav / button / badge icon | 24px / 20px / 16px (`--icon-size-lg` / `-md` / `-sm`) |

### What spacing for…
| Context | Value |
|---|---|
| Button padding (Medium) | 10px 20px (`--space-ssm` `--space-ml`) |
| Card padding (standard / compact) | 24px `--space-l` / 16px `--space-m` |
| Input / badge padding | 8px 12px (`--space-s` `--space-sm`) / 6px 12px (`--space-xss` `--space-sm`) |
| Form gaps / page padding | 20px `--space-ml` / 24px `--space-l` |
| Dialog and Modal / Side Drawer padding | 24px uniform `--space-l` / 20px vertical, 24px horizontal |

### What radius for…
| Element | Value |
|---|---|
| Buttons, cards, inputs, dialogs, modals | `--radius-sm` (12px) |
| Large cards / hero sections | `--radius-m` (16px) / `--radius-ml` (20px) |
| Avatars, badges, chips, icon-button hover / Side Drawer | `--radius-full` (square company / instructor avatar `--radius-sm`) / none (flush) |

### What overlay for…
- Delete or hard-to-undo confirmation, quick yes/no → **Dialog** (`semantic="danger"` when destructive)
- Feedback after an action → **Toast**
- Short form on one record, content preview → **Modal**
- Long form, editing many fields, settings, detail view → **Side Drawer**

### What badge for…
- Course completed / quiz passed → **Success** · deadline approaching, expiring content → **Warning** · quiz failed / overdue / deactivated → **Error**
- Course being taken, pending approval → **In Progress** · category label, count, metadata → **Informative** · freshly added content → **New**
- Enrolment not open yet → **Scheduled** · quiz required on a lesson → **Quiz**
