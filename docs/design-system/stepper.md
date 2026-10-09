---
name: 5mins-stepper
description: Stepper for 5Mins.ai - the numbered step bar in a multi-step wizard header (People, Dates, Sponsor, Review). Step types Current, Done and Upcoming; Enabled, Hover and Focus states; optional count; 3, 4 or 5 steps joined by lines. Use when building or changing any wizard, multi-step flow or progress-through-steps header.
---

# Stepper

A row of numbered steps across the top of a multi-step wizard. It shows where the admin is, what is done and what comes next, and lets them jump back to a step they have already reached.

Spec source: Figma Library `EC26cSVe9KNTCWXvYovakw`, page "Stepper" `8108:4254`, doc frame `8108:5539` - light `12451:237` / dark `8108:5543`; step sets light `12452:1541` / dark `12451:95` (re-verified 2026-10-09).

## Usage

**Intent:** show progress through a fixed sequence of steps and give a way back to earlier ones.

**Use when**
- A task is split into 3 to 5 ordered steps on one full-screen wizard (Enrol People, Assign Courses).
- Later steps depend on earlier ones, so the order matters.

**Don't use when**
- The sections can be filled in any order → use Tabs ([doc](chips-switcher-tabs.md))
- There are only 2 steps → a single form with a Continue button is clearer
- Showing progress through content (lessons, a course) → use a progress bar ([doc](table.md) progress cell, [doc](gamification.md))

**Do**
- Use `WizardShell` with `layout="top"`; it renders the stepper, sticky footer and success takeover.
- Give every step a short noun label ("People", "Dates") and, for steps not reached yet, a `sub` that says what unlocks them ("Select people first"); it shows as the Tooltip.
- Show a count after the label when the step collects items ("Courses (3)").
- Let Done and reachable Upcoming steps go back with `onStepSelect`.

**Don't**
- Don't grey out steps that are not reached yet. They look like any Upcoming step; they are just not clickable (no hover, plain cursor, `aria-disabled`).
- Don't let the admin jump forward past a step whose input is missing.
- Don't hand-roll a stepper on a page; use `WizardShell`.

**Canonical spec:**
- Step pill: radius `var(--radius-full)`, padding `var(--space-xs) var(--space-sm) var(--space-xs) var(--space-xs)` (4px 12px 4px 4px), gap `var(--space-s)` (8px), 32px high, hugs content.
- Badge 24 × 24px:
  - Upcoming: 1px `--border` ring (`--border-elevated` on hover), number 14px / 600 `--text-primary`.
  - Current: Library `Illustrations/ Progress` (orange) with the number 14px / 600 in `--page-background` on top; pops in (320ms overshoot) when the step becomes current.
  - Done: Library `Illustrations/ Progress` `Type=Passed` (green) with a `--page-background` tick, 1.5px.
- Label: 14px / 400 `--text-secondary` (Paragraph M regular); Current is 14px / 600 `--text-primary`. Count "(N)" 14px / 400 `--text-secondary` after the label.
- Hover (clickable steps only): pill fill `--page-background-hover`. Focus-visible: 2px `--primary-button-background` outline, 2px offset.
- Line between steps: the Library Divider, 40 × 1px `--border`, `var(--space-s)` (8px) each side.

**Figma component properties** (Library naming, same pattern as Breadcrumb item):

| Component | Property | Values | Default |
|---|---|---|---|
| Stepper step | `Type` | Upcoming / Done / Current | Upcoming |
| Stepper step | `State` | Enabled / Hover / Focus (Upcoming, Done); n/a (Current) | Enabled |
| Stepper step | `Label` | text | "Label" |
| Stepper step | `Number` | text (unused on Done) | "1" |
| Stepper step | `Count` | boolean | false |
| Stepper step | `Count value` | text | "(3)" |
| Stepper | `Steps` | 3 / 4 / 5 | 3 |

A step not reached yet is `Type=Upcoming, State=Enabled`; it has no variant of its own.

**Prototype:** `src/pages/your-courses/components/WizardShell/WizardShell.tsx` (`layout="top"`), styles `.wzs-stepper*` in `WizardShell.css`
- `steps: WizardStep[]` - `{ id, title, sub, Icon, state, done?, count? }`
- `state`: `'current'` (on screen), `'reachable'` (a button back to it), `'locked'` (not reached yet; Tooltip shows `sub`), `'inert'` (rail layout only)
- `done: true` swaps the number for the Done tick
- `onStepSelect(id)` - called when a reachable step is clicked

**Production:**

| Design system | `@web/ui` component | Props mapping | Known drift |
|---|---|---|---|
| Stepper | _to be mapped by engineering_ | | |

## Mapping from the earlier proposed component

The Course details file used a local `5Mins / Wizard / Stepper step (proposed)`. Swap it for the Library component like this:

| Proposed | Library |
|---|---|
| `State=Current` | `Type=Current, State=n/a` |
| `State=Done` | `Type=Done, State=Enabled` |
| `State=Reachable` | `Type=Upcoming, State=Enabled` |
| `State=Locked` | `Type=Upcoming, State=Enabled` |
| `Show count` / `Count` (" (3)") | `Count` / `Count value` ("(3)", no leading space) |

## Known differences between Figma and code

- Count spacing: code uses a space character before "(N)"; Figma uses a 4px gap (about 0.4px wider).
- Number line height: code uses 1; the Figma text style is 150%. Both centre in the 24px badge.
- Light mode Current badge: near-white number on orange is low contrast. It matches the prototype; flag before production.

## Changelog

- **2026-10-09 (Library edits)** - Upcoming ring is `--border`, stepping up to `--border-elevated` on hover (was `--border-hover`); labels are Regular 400 (was Medium 500); lines are the Library Divider in `--border` (was `--border-hover`). Light set rebuilt: step set `12452:1541`, Stepper `12452:1419`, usage `12452:1378`.
- **2026-10-09** - Built in the Library with Light and Dark sets. Steps not reached yet no longer use a disabled look (`--text-disabled` / `--border`); they match Upcoming and are only non-clickable.
