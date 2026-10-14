---
name: 5mins-colors
description: Complete 5Mins.ai color system in one file - raw palettes (Brand Primary/Secondary, Neutral, System Success/Warning/Danger, Gamification) plus semantic Surface and Text tokens with dark- and light-mode values. Use when choosing ANY color - backgrounds, borders, buttons, text, status indicators, quiz badges. Token names mirror the Figma variables exactly.
---

# Colours

Single source of truth for every colour in the 5Mins.ai platform. Token names follow the Figma variables **exactly** (lower-kebab-cased as CSS custom properties: Figma `Page-background` → `--page-background`).

**Code:** `src/styles/tokens.css` (light values in `:root`, dark values in `[data-theme='dark']`); no component
**Figma:** Library `EC26cSVe9KNTCWXvYovakw`, Colour page `5445:24068`; variable collections Brand, Neutral, System, Surface and Text colours
**Last verified:** 2026-10-14

## Usage

**How the system works.** Two layers:

1. **Raw palettes** - mode-independent hex scales. Never reference these directly in component CSS except where a semantic token doesn't exist yet.
2. **Semantic tokens** - express *intent* (page background, primary text, selected state) and carry a **dark-mode and light-mode value each**. Always prefer these: `--text-primary` over `--neutral-800`, `--cards-background` over `--neutral-0`, `--border` over `--neutral-200`.

The prototype ships **light and dark mode**: light values live in `src/styles/tokens.css` `:root`, dark values in its `[data-theme="dark"]` block, applied via `<html data-theme="dark">` (`src/hooks/useTheme.ts`).

**Do**
- **Always semantic over raw.** `--text-primary`, not `--neutral-800`; `--cards-background`, not `--neutral-0`; `--border`, not `--neutral-100`. Raw palette values are for defining semantic tokens and for one-off cases with no semantic token; raw `--neutral-*` does not flip in dark mode.
- **Never improvise a colour.** Every value must be a token from this file.

**Don't**
- Don't use primary cyan for warnings or errors, or `--primary-500` as text on white (fails WCAG contrast).
- Don't use amber for warnings (use the Warning scale), for primary actions, or for general highlights.
- Don't use gamification colours for general buttons or navigation, mix quiz colours in one component, or use them as large-area backgrounds.

**Canonical spec:** two-tier tokens (palette → semantic), light and dark values per semantic token, all in `src/styles/tokens.css`; Figma variables carry WEB code syntax `var(--token)` matching the CSS names.

### Quick decision guide

| "What colour for…" | Token |
|---|---|
| Page background | `--page-background` |
| Dialog, modal, side drawer, bottom sheet surface | `--page-background` |
| Card, panel, menu | `--cards-background` |
| Row or sidebar item hover | `--page-background-hover` |
| Card hover | `--cards-background-hover` |
| Input / dropdown / search bg | `--input-background` (+ `-hover`; `-elevated` on a card fill) |
| Tooltip / popover | `--tooltip-background` |
| Border on the page ground, or inside a drawer or modal (table rows, page dividers) | `--border` (hover: `--border-hover`) |
| Border on an elevated surface (card, menu, and controls inside one) | `--border-elevated` (hover: `--border-hover`) |
| That same control when disabled | `--border` |
| Primary CTA | `--primary-button-background` (+ `-hover`, `-pressed`) |
| Destructive button | `--danger-500` (hover `--button-danger-hover`) |
| Caution button | `--button-warning-background` (+ `-hover`, `-pressed`) |
| Confirm button | `--button-success-background` (+ `-hover`, `-pressed`) |
| Disabled button bg / label | `--button-background-disabled` / `--text-button-disabled` |
| Headings | `--text-primary` |
| Body copy | `--text-secondary` |
| Captions, helper text | `--text-tertiary` |
| Placeholder in an empty field | `--text-disabled` |
| Filled-button label | `--text-button-foreground` |
| Selected tab/chip - border/fill vs label | `--selected` vs `--text-selected` |
| Label sitting ON the amber fill | `--text-on-selected` (weight 500) |
| Success / warning / error text | `--text-success` / `--text-warning` / `--text-error` |
| Progress labels | `--text-progress` |
| Quiz badges | `--blaze-quiz` `--flash-poll` `--lesson-quiz` `--certificate-quiz` `--course-assessments` |
| Success / warning / error badge fill | 16% tint of `--success-500` / `--warning-500` / `--danger-500`, same in both modes ([badges.md](badges.md)) |

### The three-amber system

The amber family expresses selection through three distinct tokens. Using the wrong one is the most common consistency mistake:

| Token | Value | Used for |
|---|---|---|
| `--selected` | `#EDA30D` light / `#FFBB38` dark (mode-aware) | **Form-field active borders** (input, dropdown, date field, search), selection indicators (tab underline, calendar selected day, DnD affordances), toggle on-track |
| `--control-selected` | `#EDA30D` light / `#FFBB38` dark (Secondary-600 / Secondary-500) | Radio and checkbox selected fill |
| `--secondary-500` (raw) | `#FFBB38` both modes | **Selected fills** on chips and content-switcher segments, with `--text-on-selected` (`--neutral-800`) text |

## Figma to code

Every Figma variable maps to the CSS custom property of the same name, lower-kebab-cased. The Figma variables carry WEB code syntax `var(--token)` that matches `tokens.css`.

### Brand: Primary (cyan)

Main brand identity, primary actions, navigation, links, progress.

| Figma variable | CSS | Hex |
|---|---|---|
| Primary-900 | `--primary-900` | `#002C31` |
| Primary-800 | `--primary-800` | `#005862` |
| Primary-700 | `--primary-700` | `#008393` |
| Primary-600 | `--primary-600` | `#00AFC4` |
| Primary-500 | `--primary-500` | `#00CEE6` |
| Primary-400 | `--primary-400` | `#33E2F7` |
| Primary-300 | `--primary-300` | `#66E9F9` |
| Primary-200 | `--primary-200` | `#99F1FB` |
| Primary-100 | `--primary-100` | `#CCF8FD` |

✓ Primary CTAs (through `--primary-button-background`, `-hover`, `-pressed`) · links · active navigation · progress indicators
✗ Never for warnings/errors · never `--primary-500` as text on white (fails WCAG contrast)

### Brand: Secondary (yellow)

Active and selected states only - use sparingly.

| Figma variable | CSS | Hex |
|---|---|---|
| Secondary-900 | `--secondary-900` | `#191306` |
| Secondary-800 | `--secondary-800` | `#33250B` |
| Secondary-700 | `--secondary-700` | `#664B16` |
| Secondary-600 | `--secondary-600` | `#EDA30D` |
| Secondary-500 | `--secondary-500` | `#FFBB38` |
| Secondary-400 | `--secondary-400` | `#FFCF74` |
| Secondary-300 | `--secondary-300` | `#FFE4AF` |
| Secondary-200 | `--secondary-200` | `#FFF1D7` |
| Secondary-100 | `--secondary-100` | `#FFF8EB` |

✓ Input focus/active (dropdown, search) · active tabs · selected checkboxes, radios, chips (via `--selected` / `--text-selected`, see the three-amber system)
✗ Not for warnings (use Warning scale) · not for primary actions · not for general highlights

### Brand: Gamification

Quiz types and interactive learning elements.

| Figma variable | CSS | Hex | Usage |
|---|---|---|---|
| Blaze quiz | `--blaze-quiz` | `#8158EC` | Blaze Quiz (quick-fire questions); AI features |
| Flash Poll | `--flash-poll` | `#9B55C9` | Flash Poll (instant feedback polls) |
| Lesson quiz | `--lesson-quiz` | `#FA715F` | Lesson Quiz (standard assessments) |
| Certificate quiz | `--certificate-quiz` | `#6368DB` | Certificate Quiz (formal testing) |
| Course assessments | `--course-assessments` | `#2A90D8` | Course assessments |

✓ Quiz type badges and indicators · achievement/gamification accents
✗ Never for general buttons or navigation · don't mix quiz colours in one component · never as large-area backgrounds

### Neutral

Text hierarchy, backgrounds, borders, UI structure. Reference through the semantic tokens below wherever one exists. Neutral-900 is the scrim base (`--scrim`).

| Figma variable | CSS | Hex |
|---|---|---|
| Neutral-900 | `--neutral-900` | `#0F1014` |
| Neutral-800 | `--neutral-800` | `#20222A` |
| Neutral-700 | `--neutral-700` | `#2D313D` |
| Neutral-600 | `--neutral-600` | `#383D4C` |
| Neutral-500 | `--neutral-500` | `#454C5E` |
| Neutral-400 | `--neutral-400` | `#656B7C` |
| Neutral-300 | `--neutral-300` | `#9EA4B3` |
| Neutral-200 | `--neutral-200` | `#BFC2CC` |
| Neutral-100 | `--neutral-100` | `#DFE1E6` |
| Neutral-50 | `--neutral-50` | `#EFF0F2` |
| Neutral-25 | `--neutral-25` | `#F9F9FA` |
| Neutral-0 | `--neutral-0` | `#FFFFFF` |

### System: Success (green)

| Figma variable | CSS | Hex |
|---|---|---|
| Success-900 | `--success-900` | `#021109` |
| Success-800 | `--success-800` | `#052211` |
| Success-700 | `--success-700` | `#0A4423` |
| Success-600 | `--success-600` | `#11763D` |
| Success-500 | `--success-500` | `#18A957` |
| Success-400 | `--success-400` | `#5DC389` |
| Success-300 | `--success-300` | `#A3DDBC` |
| Success-200 | `--success-200` | `#D1EEDD` |
| Success-100 | `--success-100` | `#E8F6EE` |

✓ Completions · success toasts · "Completed" badges (16% Success-500 tint, text `--text-success`) · positive validation

### System: Warning (orange)

| Figma variable | CSS | Hex |
|---|---|---|
| Warning-900 | `--warning-900` | `#33210B` |
| Warning-800 | `--warning-800` | `#664216` |
| Warning-700 | `--warning-700` | `#996322` |
| Warning-600 | `--warning-600` | `#E88206` |
| Warning-500 | `--warning-500` | `#FFA538` |
| Warning-400 | `--warning-400` | `#FFB760` |
| Warning-300 | `--warning-300` | `#FFC988` |
| Warning-200 | `--warning-200` | `#FFDBAF` |
| Warning-100 | `--warning-100` | `#FFEDD7` |

✓ Expiring deadlines · "In Progress" indicators · caution alerts (badge: 16% Warning-500 tint, text `--text-warning`)

### System: Danger (red)

| Figma variable | CSS | Hex |
|---|---|---|
| Danger-900 | `--danger-900` | `#160207` |
| Danger-800 | `--danger-800` | `#2D040D` |
| Danger-700 | `--danger-700` | `#59091A` |
| Danger-600 | `--danger-600` | `#9C0F2E` |
| Danger-500 | `--danger-500` | `#DF1642` |
| Danger-400 | `--danger-400` | `#E95C7B` |
| Danger-300 | `--danger-300` | `#F2A2B3` |
| Danger-200 | `--danger-200` | `#F9D0D9` |
| Danger-100 | `--danger-100` | `#FCE8EC` |

✓ Delete/destructive actions · error messages · failed states (badge: 16% Danger-500 tint, text `--text-error`) · `--danger-400` is the solid fill of the "New" badge

### Surface colours (semantic)

Backgrounds, borders, and button fills.

| Figma variable | CSS | Dark mode | Light mode | Usage |
|---|---|---|---|---|
| Tooltip-background | `--tooltip-background` | Neutral-900 `#0F1014` | Neutral-800 `#20222A` | Tooltip and popover containers |
| Page-background | `--page-background` | Neutral-800 `#20222A` | Neutral-25 `#F9F9FA` | Main page/screen background; overlay panel surfaces (dialog, modal, side drawer, bottom sheet) |
| Page-background-hover | `--page-background-hover` | Neutral-700 `#2D313D` | Neutral-50 `#EFF0F2` | Hovered row, list item, sidebar item |
| Cards-background | `--cards-background` | Neutral-700 `#2D313D` | Neutral-0 `#FFFFFF` | Cards, panels, menus |
| Cards-background-hover | `--cards-background-hover` | Neutral-600 `#383D4C` | Neutral-50 `#EFF0F2` | Card hover state |
| Input-background | `--input-background` | `#454C5E` @ 16% | `#BFC2CC` @ 16% | Input/dropdown/search background on the page surface (translucent - apply only over a known surface; over a card fill use `--input-background-elevated`) |
| Input-background-elevated | `--input-background-elevated` | `#454C5E` @ 32% | `#BFC2CC` @ 32% | The same fill one step up, for a field sitting on a card surface (`--cards-background`) |
| Input-background-hover | `--input-background-hover` | Neutral-700 `#2D313D` | Neutral-100 `#DFE1E6` | Input background on hover |
| Selected | `--selected` | Secondary-500 `#FFBB38` | Secondary-600 `#EDA30D` | Active/selected state - inputs, tabs, chips, radios, checkboxes |
| Selected-row | `--selected-row` | `#FFBB38` @ 16% | `#FFBB38` @ 16% | Selected table row fill and border |
| Selected-row-hover | `--selected-row-hover` | `#FFBB38` @ 24% | `#FFBB38` @ 24% | Selected table row on hover |
| Border | `--border` | Neutral-700 `#2D313D` | Neutral-100 `#DFE1E6` | The quiet border: table rows, dividers, dashed drop zones, skeletons and disabled controls on the page, and borders inside drawers and modals. In dark mode it is the same colour as `--cards-background`, so on a card or menu use `--border-elevated` |
| Border-elevated | `--border-elevated` | Neutral-600 `#383D4C` | Neutral-100 `#DFE1E6` | The border on an **elevated surface**: a card or menu, and the controls inside one. One step lighter than `--border` in dark mode, as in Figma |
| Border-hover | `--border-hover` | Neutral-300 `#9EA4B3` | Neutral-300 `#9EA4B3` | Any border on hover |

#### Button backgrounds

| Figma variable | CSS | Dark mode | Light mode |
|---|---|---|---|
| Primary-Button-background | `--primary-button-background` | Primary-500 `#00CEE6` | Primary-700 `#008393` |
| Primary-button-background-hover | `--primary-button-background-hover` | Primary-400 `#33E2F7` | Primary-800 `#005862` |
| Primary-button-background-pressed | `--primary-button-background-pressed` | Primary-600 `#00AFC4` | Primary-900 `#002C31` |
| Button-background-disabled | `--button-background-disabled` | Neutral-400 `#656B7C` | Neutral-100 `#DFE1E6` |
| Button-danger-hover | `--button-danger-hover` | Danger-600 `#9C0F2E` | Danger-600 `#9C0F2E` |
| Button-danger-pressed | `--button-danger-pressed` | Danger-700 `#59091A` | Danger-700 `#59091A` |
| Button-warning-background | `--button-warning-background` | Warning-600 `#E88206` | Warning-600 `#E88206` |
| Button-warning-background-hover | `--button-warning-background-hover` | Warning-700 `#996322` | Warning-700 `#996322` |
| Button-warning-background-pressed | `--button-warning-background-pressed` | Warning-800 `#664216` | Warning-800 `#664216` |
| Button-success-background | `--button-success-background` | Success-500 `#18A957` | Success-500 `#18A957` |
| Button-success-background-hover | `--button-success-background-hover` | Success-600 `#11763D` | Success-600 `#11763D` |
| Button-success-background-pressed | `--button-success-background-pressed` | Success-700 `#0A4423` | Success-700 `#0A4423` |

### Text colours (semantic)

| Figma variable | CSS | Dark mode | Light mode | Usage |
|---|---|---|---|---|
| Text-primary | `--text-primary` | Neutral-25 `#F9F9FA` | Neutral-800 `#20222A` | Headings, high-emphasis labels - max one per visual group |
| Text-secondary | `--text-secondary` | Neutral-200 `#BFC2CC` | Neutral-500 `#454C5E` | Body copy, descriptions - the default text colour |
| Text-tertiary | `--text-tertiary` | Neutral-300 `#9EA4B3` | Neutral-400 `#656B7C` | Captions, helper text, timestamps |
| Text-disabled | `--text-disabled` | Neutral-400 `#656B7C` | Neutral-300 `#9EA4B3` | Disabled text - apply to label, value, and icon together; also the placeholder in any empty field |
| Text-button-foreground | `--text-button-foreground` | **Neutral-800 `#20222A`** | Neutral-25 `#F9F9FA` | Label on the **primary** filled button - flips dark on the bright cyan dark-mode fill. Semantic filled buttons (danger/warning/success) use raw `--neutral-25` in both modes instead |
| Text-button-disabled | `--text-button-disabled` | Neutral-300 `#9EA4B3` | Neutral-300 `#9EA4B3` | Label on any disabled button |
| code only | `--text-button-hover` | Primary-400 `#33E2F7` | Primary-700 `#008393` | Outlined/text button label on hover |
| code only | `--text-button-outlined` | Primary-500 `#00CEE6` | Primary-700 `#008393` | Outlined/text button label (default) |
| Text-success | `--text-success` | Success-500 `#18A957` | Success-600 `#11763D` | Success messages, completed labels |
| Text-warning | `--text-warning` | Warning-500 `#FFA538` | Warning-600 `#E88206` | Warning messages, deadline labels; warning-outlined button hover chrome |
| Text-error | `--text-error` | Danger-400 `#E95C7B` | Danger-500 `#DF1642` | Error messages, failed validation |
| Text-selected | `--text-selected` | Secondary-500 `#FFBB38` | Secondary-600 `#EDA30D` | Selected tab label, active chip label |
| code only | `--text-on-selected` | Neutral-800 `#20222A` | Neutral-800 `#20222A` | Knockout label ON the amber `--selected` fill - chips, switcher pills, selected menu options, selected day cells. Mode-invariant; pair with weight 500 |
| Text-progress | `--text-progress` | Primary-500 `#00CEE6` | Primary-700 `#008393` | Progress labels, "In Progress", step counters |
| Text-quiz | `--text-quiz` | Warning-200 `#FFDBAF` | Certificate quiz `#6368DB` | Quiz badge label (see `badges.md`) |

- **Figma only:** none of the colour variables is missing from code. There is no `Button-danger-background` variable; the danger button **default** background is Danger-500 `#DF1642` (raw `--danger-500`) per `buttons.md`.
- **Code only:** tokens that intentionally extend Figma (keep them):

| Token | Light | Dark | Purpose |
|---|---|---|---|
| `--selected-tint` | `rgba(237, 163, 13, 0.15)` | `rgba(255, 187, 56, 0.15)` | Highlight fill derived from `--selected` (table rows use `--selected-row`) |
| `--selected-tint-hover` | `rgba(237, 163, 13, 0.24)` | `rgba(255, 187, 56, 0.24)` | Hover state of `--selected-tint` rows |
| `--success-tint` / `--warning-tint` / `--primary-tint` / `--danger-tint` / `--ai-tint` / `--course-assessments-tint` | the 500 colour (Blaze, Course assessments) @ 16% | same | Status backgrounds behind badges, chips and callouts. For another opacity use `color-mix(in srgb, var(--success-500) 32%, transparent)` |
| `--selected-fill` | Secondary-100 `#FFF8EB` | Secondary-800 `#33250B` | Opaque fill for sticky cells over scrolling content |
| `--selected-fill-hover` | `#FDECC5` | `rgba(255, 187, 56, 0.24)` | Hover state of `--selected-fill` / selected rows. The dark value is a translucent stand-in pending designer review |
| `--control-selected` | `var(--secondary-600)` | `var(--secondary-500)` | Radio/checkbox selected amber, per selection-controls.md |
| `--scrim` | `rgba(15, 16, 20, 0.25)` | `rgba(15, 16, 20, 0.5)` | Overlay backdrop fill - Neutral-900 @ 25% light / 50% dark; spec in `layout.md` |
| `--quiz-background` | `rgba(99, 104, 219, 0.16)` | same | Certificate-quiz @ 16%: quiz badge fill, callout on assessment drawers |
| `--ai-callout-background` | `rgba(0, 131, 147, 0.16)` | same | AI callout banner fill |
| `--ai-callout-text` | `var(--primary-700)` | `var(--secondary-400)` | AI callout banner text |
| `--gradient-ai`, `--gradient-ai-diagonal`, `--gradient-ai-text`, `--gradient-ai-stops` | Primary-500 → Blaze quiz (text starts at Primary-400) | same | AI gradient fills at 90deg / 135deg; buttons use their own radial gradient (`buttons.md`) |
| `--button-outline-hover`, `--button-outline-fill(-hover/-pressed/-disabled)` | transparent; hover `rgba(0, 206, 230, 0.16)` | same | Outlined/Text button fill ladder (`buttons.md`) |

**Production:**

| Design system | `@web/ui` component | Props mapping | Known drift |
|---|---|---|---|
| Colour tokens | _to be mapped by engineering_ | | |

### Known drift

Figma and code disagree on these. Code values above are what ships; don't change either side without a ruling.

- **Text-quiz modes are swapped in Figma:** Figma dark = Certificate quiz, light = Warning-200; code is the reverse (Warning-200 on a light page fails contrast, so code is likely right).
- **Field-active borders:** some Figma light nodes still bind field-active borders to raw `Secondary-500`; `--selected` is the rule.

## States

Button background ladders (see `buttons.md` for the full state matrix):

- **Primary** is mode-specific: light darkens (Primary-700 → 800 → 900); dark starts at Primary-500, goes **lighter** on hover (Primary-400) and presses to Primary-600.
- **Warning, Success and Danger** each keep one darkening ladder with the same values in both modes (Warning 600 → 700 → 800, Success 500 → 600 → 700, Danger 500 → 600 → 700).
- **Disabled:** `--button-background-disabled` with `--text-button-disabled`.

## Tokens

All values live in `src/styles/tokens.css`; read them there rather than copying them. Light mode is the app default (`:root`); dark mode is the `[data-theme='dark']` override. Palette tokens are mode-independent.

## Accessibility

- **Contrast:** normal text needs 4.5:1, large text (24px+) needs 3:1.
  - ✓ `--text-primary` / `--text-secondary` on `--cards-background`
  - ✓ `--text-button-foreground` on the primary filled button (mode-aware); `--neutral-25` on semantic filled buttons
  - ✗ `--primary-500` as text on white
  - ✗ `--text-tertiary` for body copy (supporting detail only)

## Related

- [typography.md](typography.md) - text colour pairing with the type scale
- [layout.md](layout.md) - scrim and shadows
- [buttons.md](buttons.md) - button ladders in context
- [badges.md](badges.md) - badge fills and text tokens
