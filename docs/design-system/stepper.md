---
name: 5mins-stepper
description: Stepper for 5Mins.ai - the numbered step bar in a multi-step wizard header (People, Dates, Sponsor, Review). Step types Current, Done and Upcoming; Enabled, Hover and Focus states; optional count; 3, 4 or 5 steps joined by lines. Use when building or changing any wizard, multi-step flow or progress-through-steps header.
---

# Stepper

A row of numbered steps across the top of a multi-step wizard. It shows where the admin is, what is done and what comes next, and lets them jump back to a step they have already reached.

**Code:** no shared component yet: page-local `src/pages/your-courses/components/WizardShell/WizardShell.tsx` (`layout="top"`), styles `.wzs-stepper*` in `WizardShell.css`
**Figma:** Library `EC26cSVe9KNTCWXvYovakw`, page "Stepper" `8108:4254`, doc frame `8108:5539` (light `12451:237` / dark `8108:5543`); Stepper step dark `12451:95` / light `12468:3923`; Stepper dark `12451:207` / light `12468:4115`
**Last verified:** 2026-10-14

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
- Step pill: radius `var(--radius-full)`, padding `var(--space-xs)` (4px all round), gap `var(--space-s)` (8px), 29px high, hugs content.
- Badge 20 × 20px:
  - Upcoming: 1px `--border-elevated` ring (same on hover), number 12px / 500 `--text-primary`, line height 1.
  - Current: Library `Illustrations/ Progress` `Type=Nearly there` (orange) with the number 12px / 500 in `--page-background` on top; pops in (320ms overshoot) when the step becomes current.
  - Done: Library `Illustrations/ Progress` `Type=Passed` (green) with a `--page-background` tick, 1.25px.
- Label: 14px / 400 `--text-secondary` (Paragraph M regular); Current is 14px / 500 `--text-primary` (Paragraph M medium). Count "(N)" 14px / 400 `--text-secondary`, `var(--space-xs)` (4px) after the label.
- Hover (clickable steps only): pill fill `--page-background-hover`. Focus-visible: 2px `--primary-button-background` outline, 2px offset.
- Line between steps: the Library Divider, 40 × 1px `--border-elevated`, `var(--space-s)` (8px) each side.

## Figma to code

Figma component properties (Library naming, same pattern as Breadcrumb item):

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

| Figma property | Figma values | React prop | Prop values | Notes |
|---|---|---|---|---|
| Stepper · Steps | 3 / 4 / 5 | `steps` | `WizardStep[]` (any length) | `{ id, title, sub, Icon, state, done?, count? }` |
| Stepper step · Type | Current | `state` | `'current'` | on screen; `aria-current="step"` |
| Stepper step · Type | Done | `done` | `true` | swaps the number for the Done tick on any non-current step (normally `'reachable'`) |
| Stepper step · Type | Upcoming | `state` | `'reachable'` (a button back to it) or `'locked'` (not reached yet; Tooltip shows `sub`) | both render as Upcoming |
| Stepper step · State | Enabled / Hover / Focus / n/a | n/a | CSS `:hover`, `:focus-visible` | states are CSS, not props; no hover on locked steps |
| Stepper step · Label | text | `title` | `string` | |
| Stepper step · Number | text | n/a | step index | |
| Stepper step · Count / Count value | boolean / "(3)" | `count` | `number` | rendered as "(N)" after the label |

`WizardShell` also takes `onStepSelect(id)`, called when a reachable step is clicked, and `layout` (`'top'` for this stepper).

- **Figma only:** none.
- **Code only:** `sub` (Tooltip text for locked steps), `Icon` and `state: 'inert'` (rail layout only), `onStepSelect`, `layout`.

### Migrating from the earlier proposed component

The Course details file used a local `5Mins / Wizard / Stepper step (proposed)`. Swap it for the Library component like this:

| Proposed | Library |
|---|---|
| `State=Current` | `Type=Current, State=n/a` |
| `State=Done` | `Type=Done, State=Enabled` |
| `State=Reachable` | `Type=Upcoming, State=Enabled` |
| `State=Locked` | `Type=Upcoming, State=Enabled` |
| `Show count` / `Count` (" (3)") | `Count` / `Count value` ("(3)", no leading space) |

### Known differences between Figma and code

- The number has no Library text style (12px Medium, line height 100%).
- Light mode Current badge: near-white number on orange is low contrast. It matches the prototype; flag before production.

**Production:**

| Design system | `@web/ui` component | Props mapping | Known drift |
|---|---|---|---|
| Stepper | _to be mapped by engineering_ | | |

## Anatomy

Step pill (badge + label + optional count), joined to the next step by a 40px Divider line. See the canonical spec in Usage for every value.

## Variants

- Step types: Upcoming, Done, Current.
- Stepper: 3, 4 or 5 steps.

## States

| Step | State | Tokens |
|---|---|---|
| Upcoming | Enabled | ring 1px `--border-elevated`, number `--text-primary`, label `--text-secondary` |
| Upcoming / Done | Hover (clickable steps only) | pill fill `--page-background-hover`; ring unchanged |
| Upcoming / Done | Focus-visible | 2px `--primary-button-background` outline, 2px offset |
| Upcoming (not reached) | Enabled only | same as Upcoming; no hover, plain cursor, `aria-disabled` |
| Current | n/a | `Type=Nearly there` badge, number `--page-background`, label 500 `--text-primary` |
| Done | Enabled | `Type=Passed` badge, `--page-background` tick |

## Tokens

`var(--border-elevated)` (ring, lines), `var(--text-primary)`, `var(--text-secondary)`, `var(--page-background)` (number on Current, Done tick), `var(--page-background-hover)` (hover), `var(--primary-button-background)` (focus ring), `var(--radius-full)`, `var(--space-xs)`, `var(--space-s)`.

## Accessibility

- The stepper is a `<nav>` labelled "{wizard title} steps".
- The current step carries `aria-current="step"`.
- Steps not reached yet are buttons with `aria-disabled="true"` and an accessible name that includes the `sub` ("People: Select people first"), shown as a Tooltip.
- The Done tick is `role="img"` with `aria-label="Completed"`.
- Clickable steps show the cyan focus ring on `:focus-visible`.
- Light mode Current badge contrast is low (see "Known differences").

## Content

- Step labels are short nouns ("People", "Dates").
- `sub` says what unlocks a step ("Select people first").
- Count format "(N)", no leading space in Figma; the code places it 4px after the label.

## Related

- [chips-switcher-tabs.md](chips-switcher-tabs.md): tabs for unordered sections
- [overlays.md](overlays.md): full-screen wizard shell
- [alerts-toast.md](alerts-toast.md): the Tooltip on locked steps
- [gamification.md](gamification.md): `Illustrations/ Progress`
