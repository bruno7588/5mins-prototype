---
name: 5mins-production-claude-snippet
description: Paste-ready block for the production monorepo's CLAUDE.md / AGENTS.md. Always-on design-system rules and doc index, so agents follow the DS without having to invoke a skill.
---

# Production CLAUDE.md snippet

Paste everything between the two lines into the production repo's root `CLAUDE.md` (and `AGENTS.md`, if other agents read it). Keep it short: it is loaded on every request.

---

## Design system (5Mins)

**Source of truth:** the design-system docs in the prototype repo, `bruno7588/5mins-prototype` → `docs/design-system/`. Clone it once to `~/5mins-prototype` (or set `$FIVEMINS_DS_REPO`). Each doc starts with a `## Usage` block: intent, use when, don't use when, do / don't, canonical spec, production mapping. Read that block before building or restyling a component. Figma Library `EC26cSVe9KNTCWXvYovakw` is the visual reference; if Figma and a doc disagree, the doc wins and design should be told.

**To check a component against the DS, run `/5mins-ds-audit <component>`. Before building a screen, run `/5mins-ds-audit build <what you're building>`.**

### Non-negotiables
- Build UI from `@web/ui` components. Don't import an MUI / Mantine / base-ui component directly in `apps/*` when `@web/ui` has one for the job. If `@web/ui` lacks it, say so; don't hand-roll a lookalike.
- Theme values only: no raw hex, rgba or px for colour, spacing, radius, type or shadow in `styled()`, `sx` or style props. Missing a value? Add it to the theme.
- Every interactive element has a visible `:focus-visible` indicator, in `--primary-button-background` (cyan).
- Icons: Iconsax (`iconsax-reactjs`) only, 16 / 20 / 24 / 32px, `color` passed explicitly. Icon-only buttons have a circular hover and an `aria-label`.
- Type: Poppins, weights 400 / 500 / 600 / 700 only. Bold for headings and buttons, Semibold for field labels, Medium for emphasis, Regular for body.
- Copy: button labels in Title Case; everything else in sentence case.
- Support light and dark: use semantic colour tokens (text, surface, border), never raw palette steps, for anything that must flip.

### Quick decisions
| Need | Use |
|---|---|
| Main action | Button Filled, Medium |
| Cancel | Button Outlined-2, Medium |
| Secondary action (Save Draft, Download) | Button Outlined |
| Destructive confirm | Button Filled Danger |
| AI action | Button AI (gradient) |
| Quick yes/no decision | Dialog (ConfirmModal): 56px type icon, centred, Cancel + commit, close button |
| Moderate content task | Modal, 720px centred |
| Full working area beside the page | Side drawer, right-anchored, 720px |
| Details or options in the mobile app | Bottom sheet over a 50% scrim; drag down, tap outside or Escape to close |
| Row actions | Row actions menu (kebab), not a custom menu |
| Status label | Badge (type by meaning, not colour) |
| Inline notice | Callout / Alert; confirmation after an action: Toast |
| Hint on hover/focus | Tooltip (also over disabled buttons) |
| Data list | Table: card rows with a gap, not a gridlined table |
| Filter within a tabbed page | Chips, never nested tabs |
| Two views of one object | Content Switcher |
| Expand / collapse | Animated collapse (ease-in-out), never a hard mount/unmount |
| Person photo or placeholder | Avatar: photo, or the Library smiley when there is none (never initials); groups show up to 3 plus "+N" |
| Editable page or modal title | Inline input: size L on pages, M in modals and drawers; no box or focus ring, error message under the title |
| Selected table row | `--selected-row` fill and border, `--selected-row-hover` on hover; 24px checkbox in a 48px column |
| Page tab bar | Tabs, 16px gap, `--selected` indicator |

### Token scale (theme must expose these)
| Kind | Tokens |
|---|---|
| Spacing | 2, 4, 6, 8, 10, 12, 16, 20, 24, 32, 40px (`--space-xxs` ... `--space-xxl`) |
| Radius | 4, 8, **12** (default for inputs, buttons, cards, rows), 16, 20, 24 (chips), full (pills, avatars, icon-button hover) |
| Icon | 16, 20, 24, 32px |
| Shadow | S (cards, light only); **L for dialogs, modals, menus, dropdowns, tooltips, popovers**; panel (drawers) |
| Borders | `--border` on the page ground and inside drawers and modals (page-coloured panels); `--border-elevated` on cards and menus |

---
