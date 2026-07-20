---
name: 5mins-colors
description: Complete 5Mins.ai color system in one file — raw palettes (Brand Primary/Secondary, Neutral, System Success/Warning/Danger, Gamification) plus semantic Surface and Text tokens with dark- and light-mode values. Use when choosing ANY color — backgrounds, borders, buttons, text, status indicators, quiz badges. Token names mirror the Figma variables exactly. Replaces the former brand-colors.md, surface-colors.md, and text-colors.md.
---

# 5Mins.ai Colors

Single source of truth for every color in the 5Mins.ai platform. Token names follow the Figma variables **exactly** (lower-kebab-cased as CSS custom properties: Figma `Page-background` → `--page-background`).

## How the system works

Two layers:

1. **Raw palettes** (sections 1–3) — mode-independent hex scales. Never reference these directly in component CSS except where a semantic token doesn't exist yet.
2. **Semantic tokens** (sections 4–5) — express *intent* (page background, primary text, selected state) and carry a **dark-mode and light-mode value each**. Always prefer these: `--text-primary` over `--neutral-800`, `--cards-background` over `--neutral-0`, `--border` over `--neutral-100`.

The prototype currently ships **light mode only** — light-mode values live in `src/styles/tokens.css` `:root`; the dark-mode column is the spec for a future `[data-theme="dark"]` override block (included in section 6).

---

## 1. Brand colours

### Primary (Cyan)

Main brand identity, primary actions, navigation, links, progress.

| Token | Hex |
|---|---|
| `--primary-900` | `#002C31` |
| `--primary-800` | `#005862` |
| `--primary-700` | `#008393` |
| `--primary-600` | `#00AFC4` |
| `--primary-500` | `#00CEE6` |
| `--primary-400` | `#33E2F7` |
| `--primary-300` | `#66E9F9` |
| `--primary-200` | `#99F1FB` |
| `--primary-100` | `#CCF8FD` |

✓ Primary CTAs (`--primary-600` default, `-700` hover, `-800` pressed) · links · active navigation · progress indicators
✗ Never for warnings/errors · never `--primary-500` as text on white (fails WCAG contrast)

### Secondary (Yellow)

Active and selected states only — use sparingly.

| Token | Hex |
|---|---|
| `--secondary-900` | `#191306` |
| `--secondary-800` | `#33250B` |
| `--secondary-700` | `#664B16` |
| `--secondary-600` | `#EDA30D` |
| `--secondary-500` | `#FFBB38` |
| `--secondary-400` | `#FFCF74` |
| `--secondary-300` | `#FFE4AF` |
| `--secondary-200` | `#FFF1D7` |
| `--secondary-100` | `#FFF8EB` |

✓ Input focus/active (dropdown, search) · active tabs · selected checkboxes, radios, chips (via `--selected` / `--text-selected`)
✗ Not for warnings (use Warning scale) · not for primary actions · not for general highlights

### Gamification

Quiz types and interactive learning elements.

| Token | Hex | Figma name |
|---|---|---|
| `--blaze-quiz` | `#8158EC` | Blaze quiz |
| `--flash-poll` | `#9B55C9` | Flash Poll |
| `--lesson-quiz` | `#FA715F` | Lesson quiz |
| `--certificate-quiz` | `#6368DB` | Certificate quiz |
| `--course-assessments` | `#2A90D8` | Course assessments |

✓ Quiz type badges and indicators · achievement/gamification accents
✗ Never for general buttons or navigation · don't mix quiz colors in one component · never as large-area backgrounds

---

## 2. Neutral colours

Text hierarchy, backgrounds, borders, UI structure. Reference through the semantic tokens in sections 4–5 wherever one exists.

| Token | Hex |
|---|---|
| `--neutral-900` | `#0F1014` |
| `--neutral-800` | `#20222A` |
| `--neutral-700` | `#2D313D` |
| `--neutral-600` | `#383D4C` |
| `--neutral-500` | `#454C5E` |
| `--neutral-400` | `#656B7C` |
| `--neutral-300` | `#9EA4B3` |
| `--neutral-200` | `#BFC2CC` |
| `--neutral-100` | `#DFE1E6` |
| `--neutral-50` | `#EFF0F2` |
| `--neutral-25` | `#F9F9FA` |
| `--neutral-0` | `#FFFFFF` |

---

## 3. System colours

Status and feedback. Reference through semantic/button tokens where they exist.

### Success (Green)

| Token | Hex |
|---|---|
| `--success-900` | `#021109` |
| `--success-800` | `#052211` |
| `--success-700` | `#0A4423` |
| `--success-600` | `#11763D` |
| `--success-500` | `#18A957` |
| `--success-400` | `#5DC389` |
| `--success-300` | `#A3DDBC` |
| `--success-200` | `#D1EEDD` |
| `--success-100` | `#E8F6EE` |

✓ Completions · success toasts · "Completed" badges (bg `--success-100`, text `--text-success`) · positive validation

### Warning (Orange)

| Token | Hex |
|---|---|
| `--warning-900` | `#33210B` |
| `--warning-800` | `#664216` |
| `--warning-700` | `#996322` |
| `--warning-600` | `#E88206` |
| `--warning-500` | `#FFA538` |
| `--warning-400` | `#FFB760` |
| `--warning-300` | `#FFC988` |
| `--warning-200` | `#FFDBAF` |
| `--warning-100` | `#FFEDD7` |

✓ Expiring deadlines · "In Progress" indicators · caution alerts (badge bg `--warning-100`, text `--text-warning`)

### Danger (Red)

| Token | Hex |
|---|---|
| `--danger-900` | `#160207` |
| `--danger-800` | `#2D040D` |
| `--danger-700` | `#59091A` |
| `--danger-600` | `#9C0F2E` |
| `--danger-500` | `#DF1642` |
| `--danger-400` | `#E95C7B` |
| `--danger-300` | `#F2A2B3` |
| `--danger-200` | `#F9D0D9` |
| `--danger-100` | `#FCE8EC` |

✓ Delete/destructive actions · error messages · failed states (badge bg `--danger-100`, text `--text-error`)

---

## 4. Surface colours (semantic)

Backgrounds, borders, and button fills. Dark/light columns per the Figma variables.

| Token | Dark mode | Light mode | Usage |
|---|---|---|---|
| `--tooltip-background` | Neutral-900 `#0F1014` | Neutral-800 `#20222A` | Tooltip and popover containers |
| `--page-background` | Neutral-800 `#20222A` | Neutral-25 `#F9F9FA` | Main page/screen background |
| `--page-background-hover` | Neutral-700 `#2D313D` | Neutral-50 `#EFF0F2` | Hovered row, list item, sidebar item |
| `--cards-background` | Neutral-700 `#2D313D` | Neutral-0 `#FFFFFF` | Cards, panels, modals, side drawers |
| `--cards-background-hover` | Neutral-600 `#383D4C` | Neutral-50 `#EFF0F2` | Card hover state |
| `--input-background` | `#454C5E` @ 16% | `#BFC2CC` @ 16% | Input/dropdown/search background (translucent — apply only over a known surface) |
| `--input-background-hover` | Neutral-700 `#2D313D` | Neutral-100 `#DFE1E6` | Input background on hover |
| `--selected` | Secondary-500 `#FFBB38` | Secondary-600 `#EDA30D` | Active/selected state — inputs, tabs, chips, radios, checkboxes |
| `--border` | Neutral-600 `#383D4C` | Neutral-100 `#DFE1E6` | Default border — inputs, cards, modals, dividers, table rows |
| `--border-elevated` | Neutral-500 `#454C5E` | Neutral-200 `#BFC2CC` | Borders on elevated surfaces, skeletons |
| `--border-hover` | Neutral-300 `#9EA4B3` | Neutral-300 `#9EA4B3` | Any border on hover |

### Button backgrounds

| Token | Dark mode | Light mode |
|---|---|---|
| `--primary-button-background` | Primary-600 `#00AFC4` | Primary-600 `#00AFC4` |
| `--primary-button-background-hover` | Primary-700 `#008393` | Primary-700 `#008393` |
| `--primary-button-background-pressed` | Primary-800 `#005862` | Primary-800 `#005862` |
| `--button-background-disabled` | Neutral-400 `#656B7C` | Neutral-100 `#DFE1E6` |
| `--button-danger-hover` | Danger-600 `#9C0F2E` | Danger-600 `#9C0F2E` |
| `--button-danger-pressed` | Danger-700 `#59091A` | Danger-700 `#59091A` |
| `--button-warning-background` | Warning-600 `#E88206` | Warning-600 `#E88206` |
| `--button-warning-background-hover` | Warning-700 `#996322` | Warning-700 `#996322` |
| `--button-warning-background-pressed` | Warning-800 `#664216` | Warning-800 `#664216` |
| `--button-success-background` | Success-500 `#18A957` | Success-500 `#18A957` |
| `--button-success-background-hover` | Success-600 `#11763D` | Success-600 `#11763D` |
| `--button-success-background-pressed` | Success-700 `#0A4423` | Success-700 `#0A4423` |

> The danger button **default** background is not in the Figma variables; it is Danger-500 `#DF1642` per `buttons.md`.

---

## 5. Text colours (semantic)

| Token | Dark mode | Light mode | Usage |
|---|---|---|---|
| `--text-primary` | Neutral-25 `#F9F9FA` | Neutral-800 `#20222A` | Headings, high-emphasis labels — max one per visual group |
| `--text-secondary` | Neutral-200 `#BFC2CC` | Neutral-500 `#454C5E` | Body copy, descriptions — the default text color |
| `--text-tertiary` | Neutral-300 `#9EA4B3` | Neutral-400 `#656B7C` | Captions, placeholders, helper text, timestamps |
| `--text-disabled` | Neutral-400 `#656B7C` | Neutral-300 `#9EA4B3` | Disabled text — apply to label, value, and icon together |
| `--text-button-foreground` | Neutral-25 `#F9F9FA` | Neutral-25 `#F9F9FA` | Label on filled buttons (near-white, softer than pure white) |
| `--text-button-disabled` | Neutral-300 `#9EA4B3` | Neutral-300 `#9EA4B3` | Label on any disabled button |
| `--text-button-hover` | Primary-400 `#33E2F7` | Primary-700 `#008393` | Outlined/text button label on hover |
| `--text-button-outlined` | Primary-500 `#00CEE6` | Primary-600 `#00AFC4` | Outlined/text button label (default) |
| `--text-success` | Success-500 `#18A957` | Success-600 `#11763D` | Success messages, completed labels |
| `--text-warning` | Warning-500 `#FFA538` | Warning-600 `#E88206` | Warning messages, deadline labels |
| `--text-error` | Danger-400 `#E95C7B` | Danger-500 `#DF1642` | Error messages, failed validation |
| `--text-selected` | Secondary-500 `#FFBB38` | Secondary-600 `#EDA30D` | Selected tab label, active chip label |
| `--text-progress` | Primary-500 `#00CEE6` | Primary-700 `#008393` | Progress labels, "In Progress", step counters |

> The Figma variable is spelled `Text-button-foregorund` (typo in Figma); the CSS token uses the corrected spelling `--text-button-foreground`.

---

## 6. CSS token definitions

Light mode is the app default (`:root`); dark mode is a future `[data-theme="dark"]` override. Palette tokens are mode-independent.

```css
:root {
  /* ── Brand: Primary (Cyan) ── */
  --primary-900: #002C31;
  --primary-800: #005862;
  --primary-700: #008393;
  --primary-600: #00AFC4;
  --primary-500: #00CEE6;
  --primary-400: #33E2F7;
  --primary-300: #66E9F9;
  --primary-200: #99F1FB;
  --primary-100: #CCF8FD;

  /* ── Brand: Secondary (Yellow) ── */
  --secondary-900: #191306;
  --secondary-800: #33250B;
  --secondary-700: #664B16;
  --secondary-600: #EDA30D;
  --secondary-500: #FFBB38;
  --secondary-400: #FFCF74;
  --secondary-300: #FFE4AF;
  --secondary-200: #FFF1D7;
  --secondary-100: #FFF8EB;

  /* ── Gamification ── */
  --blaze-quiz: #8158EC;
  --flash-poll: #9B55C9;
  --lesson-quiz: #FA715F;
  --certificate-quiz: #6368DB;
  --course-assessments: #2A90D8;

  /* ── Neutral ── */
  --neutral-900: #0F1014;
  --neutral-800: #20222A;
  --neutral-700: #2D313D;
  --neutral-600: #383D4C;
  --neutral-500: #454C5E;
  --neutral-400: #656B7C;
  --neutral-300: #9EA4B3;
  --neutral-200: #BFC2CC;
  --neutral-100: #DFE1E6;
  --neutral-50:  #EFF0F2;
  --neutral-25:  #F9F9FA;
  --neutral-0:   #FFFFFF;

  /* ── System: Success ── */
  --success-900: #021109;
  --success-800: #052211;
  --success-700: #0A4423;
  --success-600: #11763D;
  --success-500: #18A957;
  --success-400: #5DC389;
  --success-300: #A3DDBC;
  --success-200: #D1EEDD;
  --success-100: #E8F6EE;

  /* ── System: Warning ── */
  --warning-900: #33210B;
  --warning-800: #664216;
  --warning-700: #996322;
  --warning-600: #E88206;
  --warning-500: #FFA538;
  --warning-400: #FFB760;
  --warning-300: #FFC988;
  --warning-200: #FFDBAF;
  --warning-100: #FFEDD7;

  /* ── System: Danger ── */
  --danger-900: #160207;
  --danger-800: #2D040D;
  --danger-700: #59091A;
  --danger-600: #9C0F2E;
  --danger-500: #DF1642;
  --danger-400: #E95C7B;
  --danger-300: #F2A2B3;
  --danger-200: #F9D0D9;
  --danger-100: #FCE8EC;

  /* ── Surface (light mode) ── */
  --tooltip-background: var(--neutral-800);
  --page-background: var(--neutral-25);
  --page-background-hover: var(--neutral-50);
  --cards-background: var(--neutral-0);
  --cards-background-hover: var(--neutral-50);
  --input-background: rgba(191, 194, 204, 0.16);  /* #BFC2CC @ 16% */
  --input-background-hover: var(--neutral-100);
  --selected: var(--secondary-600);
  --border: var(--neutral-100);
  --border-elevated: var(--neutral-200);
  --border-hover: var(--neutral-300);

  /* ── Button backgrounds (light mode) ── */
  --primary-button-background: var(--primary-600);
  --primary-button-background-hover: var(--primary-700);
  --primary-button-background-pressed: var(--primary-800);
  --button-background-disabled: var(--neutral-100);
  --button-danger-hover: var(--danger-600);
  --button-danger-pressed: var(--danger-700);
  --button-warning-background: var(--warning-600);
  --button-warning-background-hover: var(--warning-700);
  --button-warning-background-pressed: var(--warning-800);
  --button-success-background: var(--success-500);
  --button-success-background-hover: var(--success-600);
  --button-success-background-pressed: var(--success-700);

  /* ── Text (light mode) ── */
  --text-primary: var(--neutral-800);
  --text-secondary: var(--neutral-500);
  --text-tertiary: var(--neutral-400);
  --text-disabled: var(--neutral-300);
  --text-button-foreground: var(--neutral-25);
  --text-button-disabled: var(--neutral-300);
  --text-button-hover: var(--primary-700);
  --text-button-outlined: var(--primary-600);
  --text-success: var(--success-600);
  --text-warning: var(--warning-600);
  --text-error: var(--danger-500);
  --text-selected: var(--secondary-600);
  --text-progress: var(--primary-700);
}

[data-theme='dark'] {
  /* ── Surface (dark mode) ── */
  --tooltip-background: var(--neutral-900);
  --page-background: var(--neutral-800);
  --page-background-hover: var(--neutral-700);
  --cards-background: var(--neutral-700);
  --cards-background-hover: var(--neutral-600);
  --input-background: rgba(69, 76, 94, 0.16);  /* #454C5E @ 16% */
  --input-background-hover: var(--neutral-700);
  --selected: var(--secondary-500);
  --border: var(--neutral-600);
  --border-elevated: var(--neutral-500);
  --border-hover: var(--neutral-300);

  /* ── Button backgrounds (dark mode; primary/danger/warning/success same as light) ── */
  --button-background-disabled: var(--neutral-400);

  /* ── Text (dark mode) ── */
  --text-primary: var(--neutral-25);
  --text-secondary: var(--neutral-200);
  --text-tertiary: var(--neutral-300);
  --text-disabled: var(--neutral-400);
  --text-button-hover: var(--primary-400);
  --text-button-outlined: var(--primary-500);
  --text-success: var(--success-500);
  --text-warning: var(--warning-500);
  --text-error: var(--danger-400);
  --text-selected: var(--secondary-500);
  --text-progress: var(--primary-500);
}
```

---

## 7. Usage rules & accessibility

- **Always semantic over raw.** `--text-primary`, not `--neutral-800`; `--cards-background`, not `--neutral-0`; `--border`, not `--neutral-100`. Raw palette values are for defining semantic tokens and for one-off cases with no semantic token.
- **Never improvise a color.** Every value must be a token from this file.
- **Contrast:** normal text needs 4.5:1, large text (24px+) needs 3:1.
  - ✓ `--text-primary` / `--text-secondary` on `--cards-background`
  - ✓ `--text-button-foreground` on any filled button background
  - ✗ `--primary-500` as text on white
  - ✗ `--text-tertiary` for body copy (supporting detail only)

### Quick decision guide

| "What color for…" | Token |
|---|---|
| Page background | `--page-background` |
| Card / panel / modal / drawer | `--cards-background` |
| Row or sidebar item hover | `--page-background-hover` |
| Card hover | `--cards-background-hover` |
| Input / dropdown / search bg | `--input-background` (+ `-hover`) |
| Tooltip / popover | `--tooltip-background` |
| Any border | `--border` (hover: `--border-hover`) |
| Primary CTA | `--primary-button-background` (+ `-hover`, `-pressed`) |
| Destructive button | `--danger-500` (hover `--button-danger-hover`) |
| Caution button | `--button-warning-background` (+ `-hover`, `-pressed`) |
| Confirm button | `--button-success-background` (+ `-hover`, `-pressed`) |
| Disabled button bg / label | `--button-background-disabled` / `--text-button-disabled` |
| Headings | `--text-primary` |
| Body copy | `--text-secondary` |
| Captions, placeholders | `--text-tertiary` |
| Filled-button label | `--text-button-foreground` |
| Selected tab/chip — border/fill vs label | `--selected` vs `--text-selected` |
| Success / warning / error text | `--text-success` / `--text-warning` / `--text-error` |
| Progress labels | `--text-progress` |
| Quiz badges | `--blaze-quiz` `--flash-poll` `--lesson-quiz` `--certificate-quiz` `--course-assessments` |
| Success / warning / danger badge bg | `--success-100` / `--warning-100` / `--danger-100` |

---

## 8. Relationship to code

`src/styles/tokens.css` was aligned to this spec on 2026-07-03: full 100–900 palettes, Figma hex values, Figma token names (`--primary-button-background(-hover/-pressed)`, `--course-assessments`), and `--selected` resolving to Secondary-600 in light mode.

Code-only tokens that intentionally extend this spec (keep them). Dark-mode values shipped in `tokens.css` on 2026-07-06 (translucent `--selected-fill(-hover)` dark stand-ins pending designer review):

| Token | Light | Dark | Purpose |
|---|---|---|---|
| `--selected-tint` | `rgba(237, 163, 13, 0.15)` | `rgba(255, 187, 56, 0.15)` | Selected-row / highlight fill derived from `--selected` |
| `--selected-tint-hover` | `rgba(237, 163, 13, 0.24)` | `rgba(255, 187, 56, 0.24)` | Hover state of `--selected-tint` rows |
| `--selected-fill` | `#FCF1DB` | `rgba(255, 187, 56, 0.16)` | Opaque equivalent of `--selected-tint` for sticky cells over scrolling content |
| `--selected-fill-hover` | `#FDECC5` | `rgba(255, 187, 56, 0.24)` | Hover state of `--selected-fill` / selected rows |
| `--control-selected` | `var(--secondary-600)` | `var(--secondary-500)` | Radio/checkbox selected amber, per selection-controls.md |
| `--scrim` | `rgba(15, 16, 20, 0.25)` | `rgba(15, 16, 20, 0.5)` | Overlay backdrop fill (light 25% / dark 50%) |
