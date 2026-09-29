---
name: 5mins-ds-audit
description: Compare a production web component (@web/ui) or one usage of it on a page (apps/web) against the 5Mins design system docs and the Figma Library, and report drift. Use when an engineer runs /5mins-ds-audit, or asks to audit, check, compare or verify a component against the design system or Figma, asks "does this match the design", or is about to build a screen and wants the right component, props and rules (build mode). Also maps a design-system component to the @web/ui component that implements it (map mode).
---

# 5Mins design system audit

The design system has three sources. They are ranked, so conflicts have one answer:

1. **Design-system docs** (`docs/design-system/*.md` in the prototype repo). These are the written rules: intent, do's and don'ts, canonical spec. **They win.**
2. **Figma Library** (file key `EC26cSVe9KNTCWXvYovakw`). It is the visual source the docs were verified against. Use it to confirm a value, never to overrule a doc. If Figma and the doc disagree, report it as a **doc question** for design, not as production drift.
3. **Production code** (this repo). This is what gets audited.

Never edit production code or the docs without the engineer's explicit go-ahead.

## Setup: find the docs

The docs live in the prototype repo `bruno7588/5mins-prototype`. They are read from a local clone so they stay current and are never copied into this repo.

1. Use `$FIVEMINS_DS_REPO` if it is set, otherwise `~/5mins-prototype`.
2. If the folder exists: `git -C <path> pull --ff-only` (quietly; if it fails, carry on with what is there and say the docs may be stale).
3. If it doesn't exist, ask the engineer before running `git clone https://github.com/bruno7588/5mins-prototype.git <path>`.
4. Docs are at `<path>/docs/design-system/`. Start with the `## Usage` block of the relevant doc; read the full spec sections only for the properties you are checking.

## Component to doc index

| Design-system component | Doc |
|---|---|
| Button (all variants, AI buttons) | `buttons.md` |
| Dialog / ConfirmModal | `confirm-modal.md`, `overlays.md` |
| Modal, Side Drawer | `overlays.md` |
| Bulk action bar | `bulk-action-bar.md` |
| Row actions / kebab menu | `row-actions-menu.md`, `listbox.md` |
| Menu, listbox, option list | `listbox.md` |
| Text input, inline input, integer stepper | `input.md` |
| Search | `search.md` |
| Dropdown / select (single, multi) | `dropdown.md` |
| Date field, calendar | `date-picker-field.md`, `calendar.md` |
| Radio, checkbox, toggle | `selection-controls.md` |
| File uploader | `file-uploader.md` |
| Alert, Callout, Toast, Tooltip | `alerts-toast.md` |
| Badge | `badges.md` |
| Chip, Content Switcher, Tabs | `chips-switcher-tabs.md` |
| Avatar, Avatar Group | `avatars.md` |
| Empty state | `empty-state.md` |
| Table (card rows, pagination) | `table.md` |
| Top nav, side panel, breadcrumb | `navigation.md` |
| Page header, section header | `headers.md` |
| Expand / collapse animation | `collapse.md` |
| Cards (lesson, course, skill, category...) | `cards.md`, `resource-card.md` |
| Colour, type, spacing, radius, shadows, icons | `colors.md`, `typography.md`, `layout.md`, `iconography.md` |

Foundations for every audit: `design-system-guidelines.md`.

## Where production drift hides

This repo mixes several UI libraries (MUI 5, Mantine 7, base-ui, emotion, styled-components). A component's rendered result can come from any of these layers, so read them all before concluding:

1. The component's own styles: `packages/web/ui/src/lib/<Component>/` (`styles.ts`, the component file).
2. The library it wraps: which MUI / Mantine / base-ui component, and that library's default padding, min-height and line-height.
3. Theme component overrides and base variants in `packages/web/utils/theme` (typography, component overrides, radius/shape).
4. Theme-level wrappers in the theme setup (anything that rescales type or spacing at breakpoints).
5. Call-site overrides: `sx`, `styled(...)`, inline `style`, and `!important`.

Declared values can differ from rendered ones, so measure when it matters (step 5 below).

## Mode 1: audit (default)

Two kinds of target:
- **Shared component:** `/5mins-ds-audit Button` or `/5mins-ds-audit packages/web/ui/src/lib/Search`. Audits the component itself.
- **Call site:** `/5mins-ds-audit <page path> <element>`, e.g. `/5mins-ds-audit apps/web/src/admin/People.tsx search field`. Audits one usage on a page. First check whether it uses the shared component at all: if it doesn't, that bypass is the headline finding (High), and the rest of the drift is measured against the doc, not against the shared component. If it does, audit only what the call site adds (props, `sx`, `styled`, wrappers).

1. **Identify.** Map the target to its design-system component and doc using the index. If the doc's Production table already names the `@web/ui` component, use it; otherwise find it (search `packages/web/ui/src/lib/` by name, then the Storybook titles) and say how you matched it. Ask if the match is ambiguous.
2. **Read the rules.** Read the doc's `## Usage` block first, then only the sections that hold the properties you check (States, Visual spec, Token summary; light and dark values usually live there, not in the one-line Canonical spec). When the Usage block and an older section below it disagree, the Usage block wins; note the conflict under Doc questions. Items already listed in the doc's "Code reality" / "Known drift" are **known**: report them with severity `known`, don't re-rank them.
3. **Confirm against Figma (only if needed).** Use the Figma MCP (`get_design_context`, `get_variable_defs`, `get_screenshot`) with the node ids in the doc's Canonical spec. Always read the **main component**, never a resized instance on a page. Skip this step when the doc already gives the value you need; Figma calls are rate-limited per seat.
4. **Read production.** Walk the five layers above; skip any layer that doesn't exist for this target and say so. Record each property's declared value and where it is set (`file:line`). When a property is not set anywhere (a missing hover rule, no clear button), write `absent`.
5. **Measure rendered values** for size, padding, radius, font and colour:
   - **Where:** for a shared component, its Storybook stories (`nx run web-ui:storybook` if not running). If it has no story, measure in the running app and list "missing story" (shared components only; page call sites never have stories). For a call site, measure the page in the running app.
   - **Theme:** in Storybook use the themes addon toolbar (or the `globals=theme:dark` URL parameter); in the app use its theme toggle or theme attribute. Measure light and dark.
   - **Reliability (the browser tool is shared and fragile):**
     - Freeze transitions before reading: inject `*,*::before,*::after{transition:none!important;animation:none!important}` once per page, or you will read mid-transition values and report false drift.
     - Read each state in a single `browser_evaluate` that first checks `location.href` is still the page you expect, then reads all the computed styles you need. Switch the theme inside the same evaluate to read light and dark in one call.
     - Hover needs a real pointer: re-snapshot, hover by role/name with `browser_hover`, then evaluate immediately. Focus-visible: tab to the element with `browser_press_key`, then evaluate. For text fields, read the Active (focused) state right after focusing the input, before any Tab moves focus on. If a state can't be measured, read its rule from CSS and mark the value `declared only`.
     - Ignore dev-only overlays and toolbars on the page.
     - Icon colours: SVG icons often report `stroke: none` in computed style; read the colour from the icon's `color` prop or SVG attribute instead.
   - States: enabled, hover, focus-visible, disabled, plus loading/error where the doc defines them.
6. **Check usage (bypasses).** Count places that do this job without the shared component (including the audited call site, if it is one), and give up to 5 examples. To confirm many hits, script the check (e.g. the icon within 3 lines of `<input`) rather than opening each file. Look for both:
   - library imports: `@mui/material` / `@mantine/core` / `@base-ui-components` components that `@web/ui` already wraps;
   - hand-rolled signatures (open each hit to confirm before counting; some are legitimate embedded variants the doc allows):

     | Component | Hand-rolled signature |
     |---|---|
     | Search | `SearchNormal1` icon next to a raw `<input>` |
     | Button | raw `<button>` or `styled('button')` with its own padding/colour |
     | Tooltip | native `title=` or a custom `*tooltip*` element |
     | Dialog / Modal / Drawer | a `position: fixed` scrim + panel outside the shared overlay |
     | Row actions menu | a `More` icon toggling an absolutely positioned list |
     | Avatar | `<img>` with a full radius, or an initials chip |
     | Table | `<table>`, or rows built from divs outside the shared Table |
     | Checkbox / Radio / Toggle | raw `input type="checkbox"` / `"radio"` or `role="switch"` |
     | Date field | `input type="date"` |
7. **Check the rules.** For each Do/Don't in the doc, give a verdict. Shared component: **enforced** (the component makes it the default or the only option), **possible** (allowed but not enforced) or **broken**. Call site: **followed** or **broken**. These go in the Rules check section of the report.
8. **Report** in the format below. Then offer fixes, one component and one property at a time, smallest change first. **Blast radius**: for a shared-component fix, the number of files that import it (plus how many call sites use the affected variant or size); for a call-site fix, that file plus any page CSS it shares with other files.

### Report format

```
## <Component> audit - <date>

Target: <shared component | call site: path + element> · Uses shared component: <yes | no | n/a>
Doc: <doc>.md (<sections read>) · Figma: <node ids used, or "not needed">
Production: <paths> · Library base: <MUI X / Mantine Y / custom> · Layers not present: <list or "none">
Measured: <Storybook | app route>, <states>, <light and dark | what couldn't be measured and why>

### Drift
| Property / rule | Design system | Production declared | Production rendered | Source | Severity |
|---|---|---|---|---|---|
(`absent` when nothing sets it; `declared only` when it couldn't be measured)

### Matches
- <one line listing what was checked and matches, so a clean audit still shows its coverage>

### Rules check
- <Do / Don't>: enforced | possible | broken (<evidence>)

### Doc questions for design
- <where Figma and the doc disagree, the doc is silent, the doc itself uses a raw value, or the doc conflicts with a design-wide rule in the CLAUDE.md snippet>

### Bypasses
- <count> places do this job outside the shared component, e.g. <file:line> (confirmed | heuristic)

### Suggested fixes (not applied)
1. <smallest fix first, with file and blast radius>
```

Severity:
- **High:** bypassing the shared component, a wrong component/variant for the job, a broken state (focus-visible missing, disabled not distinguishable), a colour off-token, or a size/radius that differs visibly across the app.
- **Medium:** the wrong semantic token (e.g. `--text-tertiary` where the doc says `--text-secondary`), off-token spacing/radius/type within 1-4px, or a missing state.
- **Low:** a raw value that equals the token, naming, story coverage.
- **known:** already listed as drift in the doc.
- When the doc itself uses a raw value and no token exists, don't rank production for copying it; list it under Doc questions.

## Mode 2: build

`/5mins-ds-audit build <component or screen description>`

Before code is written, return:
- which design-system component(s) the job needs, and why (from Intent / Use when / Don't use when);
- the `@web/ui` component and props to use, from the doc's Production table, or "not mapped yet" plus the closest existing `@web/ui` component;
- the Do / Don't list and the Canonical spec tokens;
- which states and themes to cover in the story.

If no design-system component fits, say so and tell the engineer to ask design; don't adapt a "close enough" pattern.

## Mode 3: map

`/5mins-ds-audit map <design-system component>`

Find the `@web/ui` component that implements it and propose the doc's Production row:

| Design system | `@web/ui` component | Props mapping | Known drift |

Props mapping lists each design-system variant/size/state and the production prop value that produces it (e.g. `Outlined-2 → variant="outlined" color="neutral"`). Known drift is a one-line summary from a quick audit, with the date. Give the row to the engineer to raise as a PR against the prototype repo's doc; don't commit to that repo yourself.

## Rules for any fix you propose

- Tokens and theme values only; never raw hex or px in component styles. If the theme has no token for a design-system value, propose adding it to the theme rather than hard-coding it.
- Fix the shared component (`@web/ui` / theme), not each call site, unless the doc says the call site is wrong.
- Keep a visible `:focus-visible` indicator on every interactive element.
- Icons are Iconsax (`iconsax-reactjs`), 16/20/24/32px. Pass `color` explicitly.
- Button labels are Title Case; other UI copy is sentence case.
- A change to a widely imported primitive needs a visual check of its stories in light and dark before merge.
