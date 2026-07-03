---
name: 5mins-surface-colors
description: 5Mins.ai semantic surface color tokens and usage guidelines. Use when choosing background colors for any UI surface (pages, cards, tooltips, inputs), selecting border colors, or determining button background states (default, hover, pressed, disabled). These are the semantic layer on top of the raw brand palette — always prefer these named tokens over raw neutral/primary values in prototypes. Trigger this skill whenever building or refining any 5Mins.ai admin or learner UI and needing to set background, border, or button surface colors.
---

# 5Mins.ai Surface Colors

Semantic surface tokens for the 5Mins.ai platform. These sit on top of the raw brand palette and express *intent* — use them instead of raw `--neutral-X` or `--primary-X` values wherever possible. This ensures components adapt correctly as the design system evolves.

Cross-reference with `5mins-brand-colors` for the raw palette values these tokens resolve to.

---

## Backgrounds & Surfaces

### Page Surfaces

| Token | Resolves To | Hex | Usage |
|---|---|---|---|
| `--surface-page` | Neutral-25 | `#F9F9FA` | Main page/screen background |
| `--surface-page-hover` | Neutral-50 | `#EFF0F2` | Hovered row, list item, or sidebar item |
| `--surface-tooltip` | Neutral-800 | `#20222A` | Tooltip containers and popovers |

```css
/* Layout backgrounds */
.page-wrapper     { background: var(--surface-page); }
.sidebar-item:hover { background: var(--surface-page-hover); }
.tooltip          { background: var(--surface-tooltip); color: #fff; }
```

### Card Surfaces

| Token | Resolves To | Hex | Usage |
|---|---|---|---|
| `--surface-card` | Neutral-0 | `#FFFFFF` | Default card, panel, modal background |
| `--surface-card-hover` | Neutral-50 | `#EFF0F2` | Card hover state |

```css
.card             { background: var(--surface-card); }
.card:hover       { background: var(--surface-card-hover); }
.modal            { background: var(--surface-card); }
.side-drawer      { background: var(--surface-card); }
```

### Input Surfaces

| Token | Resolves To | Usage |
|---|---|---|
| `--surface-input` | `rgba(191, 194, 204, 0.16)` | Default input/field background (translucent) |
| `--surface-input-hover` | Neutral-100 (`#DFE1E6`) | Input background on hover |
| `--surface-selected` | Secondary-500 (`#FFBB38`) | Active/selected state for inputs, tabs, chips |

```css
input, .dropdown, .search-field {
  background: var(--surface-input);
}
input:hover, .dropdown:hover {
  background: var(--surface-input-hover);
}
.tab--active, .chip--selected, input:focus {
  border-color: var(--surface-selected);
}
```

> **Note:** `--surface-input` uses a translucent value (`rgba(191, 194, 204, 0.16)`) so the underlying page or card background shows through slightly. Always apply it on top of a defined surface background, never on an unknown color.

---

## Borders

| Token | Resolves To | Hex | Usage |
|---|---|---|---|
| `--border-default` | Neutral-100 | `#DFE1E6` | All borders — inputs, dividers, cards, modals, dropdowns |
| `--border-hover` | Neutral-300 | `#9EA4B3` | Hover state borders |

```css
/* Borders */
input, .card, .modal, .dropdown { border: 1px solid var(--border-default); }
input:hover                      { border-color: var(--border-hover); }

/* Dividers */
.section-divider { border-top: 1px solid var(--border-default); }
.table-row       { border-bottom: 1px solid var(--border-default); }
```

### Border Rules
- **`--border-default`** — every bordered surface: inputs, cards, modals, dropdowns, table rows, dividers
- **`--border-hover`** — any border on hover; conveys interactivity without a fill change

---

## Button Backgrounds

### Primary Button

| State | Token | Resolves To | Hex |
|---|---|---|---|
| Default | `--btn-primary` | Primary-600 | `#00AFC4` |
| Hover | `--btn-primary-hover` | Primary-700 | `#008393` |
| Pressed | `--btn-primary-pressed` | Primary-800 | `#005862` |
| Disabled | `--btn-disabled` | Neutral-100 | `#DFE1E6` |

```css
.btn-primary              { background: var(--btn-primary); }
.btn-primary:hover        { background: var(--btn-primary-hover); }
.btn-primary:active       { background: var(--btn-primary-pressed); }
.btn-primary:disabled,
.btn-primary[disabled]    { background: var(--btn-disabled); color: var(--neutral-300); }
```

### Danger Button

| State | Token | Resolves To | Hex |
|---|---|---|---|
| Default | — | Danger-500 | `#DF1642` |
| Hover | `--btn-danger-hover` | Danger-600 | `#9C0F2E` |
| Pressed | `--btn-danger-pressed` | Danger-700 | `#59091A` |

```css
.btn-danger               { background: var(--danger-500); }
.btn-danger:hover         { background: var(--btn-danger-hover); }
.btn-danger:active        { background: var(--btn-danger-pressed); }
```

### Warning Button

| State | Token | Resolves To | Hex |
|---|---|---|---|
| Default | `--btn-warning` | Warning-500 | `#FFA538` |
| Hover | `--btn-warning-hover` | Warning-600 | `#E88206` |
| Pressed | `--btn-warning-pressed` | Warning-600 | `#E88206` |

```css
.btn-warning              { background: var(--btn-warning); }
.btn-warning:hover        { background: var(--btn-warning-hover); }
.btn-warning:active       { background: var(--btn-warning-pressed); }
```

> **Note:** Warning-600 (hover) and Warning-pressed share the same value — this is intentional from the Figma spec.

### Success Button

| State | Token | Resolves To | Hex |
|---|---|---|---|
| Default | `--btn-success` | Success-500 | `#18A957` |
| Hover | `--btn-success-hover` | Success-600 | `#11763D` |
| Pressed | `--btn-success-pressed` | Success-600 | `#11763D` |

```css
.btn-success              { background: var(--btn-success); }
.btn-success:hover        { background: var(--btn-success-hover); }
.btn-success:active       { background: var(--btn-success-pressed); }
```

> **Note:** Success-600 (hover) and Success-pressed share the same value — intentional from spec.

---

## Complete CSS Token Definitions

Copy this block into your prototype's `:root` or global stylesheet:

```css
:root {
  /* ── Backgrounds ── */
  --surface-page:         #F9F9FA;              /* Neutral-25 */
  --surface-page-hover:   #EFF0F2;              /* Neutral-50 */
  --surface-tooltip:      #20222A;              /* Neutral-800 */
  --surface-card:         #FFFFFF;              /* Neutral-0 */
  --surface-card-hover:   #EFF0F2;              /* Neutral-50 */
  --surface-input:        rgba(191,194,204,0.16); /* BFC2CC @ 16% */
  --surface-input-hover:  #DFE1E6;              /* Neutral-100 */
  --surface-selected:     #FFBB38;              /* Secondary-500 */

  /* ── Borders ── */
  --border-default:       #DFE1E6;              /* Neutral-100 */
  --border-hover:         #9EA4B3;              /* Neutral-300 */

  /* ── Button Backgrounds ── */
  --btn-primary:          #00AFC4;              /* Primary-600 */
  --btn-primary-hover:    #008393;              /* Primary-700 */
  --btn-primary-pressed:  #005862;              /* Primary-800 */
  --btn-disabled:         #DFE1E6;              /* Neutral-100 */
  --btn-danger-hover:     #9C0F2E;              /* Danger-600 */
  --btn-danger-pressed:   #59091A;              /* Danger-700 */
  --btn-warning:          #FFA538;              /* Warning-500 */
  --btn-warning-hover:    #E88206;              /* Warning-600 */
  --btn-warning-pressed:  #E88206;              /* Warning-600 */
  --btn-success:          #18A957;              /* Success-500 */
  --btn-success-hover:    #11763D;              /* Success-600 */
  --btn-success-pressed:  #11763D;              /* Success-600 */
}
```

---

## Quick Decision Guide

**"What background should I use for…?"**

| Surface | Token |
|---|---|
| The page itself | `--surface-page` |
| A card, panel, or modal | `--surface-card` |
| A table row or sidebar item on hover | `--surface-page-hover` |
| A card on hover | `--surface-card-hover` |
| A text input, dropdown, or search | `--surface-input` |
| A text input on hover | `--surface-input-hover` |
| A tooltip or popover | `--surface-tooltip` |

**"What border should I use for…?"**

| Context | Token |
|---|---|
| Any bordered surface (inputs, cards, modals, dropdowns, dividers) | `--border-default` |
| Any border on hover | `--border-hover` |

**"What button background for…?"**

| Intent | Default Token | Hover Token |
|---|---|---|
| Primary action | `--btn-primary` | `--btn-primary-hover` |
| Destructive action | `--danger-500` | `--btn-danger-hover` |
| Caution action | `--btn-warning` | `--btn-warning-hover` |
| Positive/confirm action | `--btn-success` | `--btn-success-hover` |
| Any disabled button | `--btn-disabled` | — |

---

## Related Skills

- `5mins-brand-colors` — raw palette values (Primary, Neutral, Semantic, Gamification)
- `buttons` — full button component system including text color, sizing, and icon rules
- `5mins-inputs` — complete input component with all states
