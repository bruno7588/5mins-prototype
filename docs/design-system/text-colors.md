---
name: 5mins-text-colors
description: 5Mins.ai semantic text color tokens and usage guidelines. Use when choosing any text color — headings, body copy, labels, captions, button labels, status text, error messages, selected states, or progress indicators. Always prefer these named tokens over raw neutral/primary values. Trigger this skill whenever writing text styling for any 5Mins.ai admin or learner UI component.
---

# 5Mins.ai Text Colors

Semantic text color tokens for the 5Mins.ai platform. Use these instead of raw palette values to keep text intent consistent across components.

All neutral-derived token hex values are confirmed against the Figma variables panel (full Neutral-0 → Neutral-900 scale). Two tokens remain pending — `--text-warning` (Warning-700) and `--text-selected` (Secondary-600) — marked with ⚠ below.

Cross-reference with `5mins-brand-colors` for the full raw palette and `5mins-surface-colors` for the backgrounds these text colors sit on top of.

---

## Text Hierarchy (General UI)

| Token | Resolves To | Hex | Usage |
|---|---|---|---|
| `--text-primary` | Neutral-800 | `#20222A` | Headings, high-emphasis labels, primary content |
| `--text-secondary` | Neutral-500 | `#454C5E` | Body copy, descriptions, secondary labels |
| `--text-tertiary` | Neutral-400 | `#656B7C` | Captions, placeholders, helper text, metadata |
| `--text-disabled` | Neutral-300 | `#9EA4B3` | Any disabled text — inputs, labels, links |

```css
h1, h2, h3, .label-strong  { color: var(--text-primary); }
p, .body, .description      { color: var(--text-secondary); }
.caption, .helper, ::placeholder { color: var(--text-tertiary); }
.disabled, [disabled]       { color: var(--text-disabled); }
```

### Hierarchy Rules
- Use `--text-primary` for the most important piece of information in a component — never more than one per visual group.
- `--text-secondary` is the default for body and descriptive content.
- `--text-tertiary` is for supporting detail — timestamps, helper text, character counts.
- `--text-disabled` applies to the entire element when it is non-interactive — label, value, and icon together.

---

## Button Text

| Token | Resolves To | Hex | Usage |
|---|---|---|---|
| `--text-btn-fg` | Neutral-25 | `#F9F9FA` | Label on filled buttons (primary, danger, warning, success) |
| `--text-btn-disabled` | Neutral-300 | `#9EA4B3` | Label on any disabled button |
| `--text-btn-hover` | Primary-700 | `#008393` | Label on outlined/text button hover state |

```css
/* Filled button label */
.btn-filled .label          { color: var(--text-btn-fg); }

/* Disabled button label — all variants */
.btn:disabled .label        { color: var(--text-btn-disabled); }

/* Outlined / text button hover */
.btn-outlined:hover .label,
.btn-text:hover .label      { color: var(--text-btn-hover); }
```

> **Note:** `--text-btn-fg` (Neutral-25, near-white) is used instead of pure white (`--neutral-0`) on filled buttons to soften the contrast slightly while remaining fully accessible.

---

## Semantic Text Colors

| Token | Resolves To | Hex | Usage |
|---|---|---|---|
| `--text-success` | Success-600 | `#11763D` | Success messages, completed state labels, positive validation |
| `--text-warning` | Warning-700 | `⚠ see note` | Warning messages, expiring deadlines, caution labels |
| `--text-error` | Danger-500 | `#DF1642` | Error messages, failed validation, destructive action labels |

```css
.message--success, .badge--success .label { color: var(--text-success); }
.message--warning, .badge--warning .label { color: var(--text-warning); }
.message--error, .input--error .helper    { color: var(--text-error); }
```

> ⚠ **Warning-700 hex needed** — not yet confirmed from Figma. Please supply the exact value so this token can be finalised.

---

## Interactive & State Text

| Token | Resolves To | Hex | Usage |
|---|---|---|---|
| `--text-selected` | Secondary-600 | `⚠ see note` | Selected tab label, active chip label, selected list item |
| `--text-progress` | Primary-700 | `#008393` | Progress indicators, "In Progress" labels, step counters |

```css
.tab--active .label,
.chip--selected .label      { color: var(--text-selected); }

.progress-label,
.step--active .label        { color: var(--text-progress); }
```

> ⚠ **Secondary-600 hex needed** — not yet confirmed from Figma. Please supply the exact value so this token can be finalised.

---

## Quiz Text

| Token | Resolves To | Hex | Usage |
|---|---|---|---|
| `--text-quiz` | Certificate-quiz | `#6368DB` | Quiz type labels, quiz badge text |

```css
.quiz-label, .badge--quiz .label { color: var(--text-quiz); }
```

> For other quiz type text colors, use the gamification tokens from `5mins-brand-colors` (`--blaze-quiz`, `--flash-poll`, `--lesson-quiz`, `--case-study-quiz`).

---

## Complete CSS Token Definitions

```css
:root {
  /* ── Text Hierarchy ── */
  --text-primary:           #20222A;   /* Neutral-800 */
  --text-secondary:         #454C5E;   /* Neutral-500 */
  --text-tertiary:          #656B7C;   /* Neutral-400 */
  --text-disabled:          #9EA4B3;   /* Neutral-300 */

  /* ── Button Text ── */
  --text-btn-fg:            #F9F9FA;   /* Neutral-25 */
  --text-btn-disabled:      #9EA4B3;   /* Neutral-300 */
  --text-btn-hover:         #008393;   /* Primary-700 */

  /* ── Semantic Text ── */
  --text-success:           #11763D;   /* Success-600 */
  --text-warning:           /* ⚠ Warning-700 — confirm from Figma */;
  --text-error:             #DF1642;   /* Danger-500 */

  /* ── Interactive & State ── */
  --text-selected:          /* ⚠ Secondary-600 — confirm from Figma */;
  --text-progress:          #008393;   /* Primary-700 */

  /* ── Quiz ── */
  --text-quiz:              #6368DB;   /* Certificate-quiz */
}
```

---

## Quick Decision Guide

**"What text color should I use for…?"**

| Context | Token |
|---|---|
| Page headings, card titles, strong labels | `--text-primary` |
| Body copy, descriptions, paragraph text | `--text-secondary` |
| Captions, placeholders, helper text, timestamps | `--text-tertiary` |
| Any disabled text | `--text-disabled` |
| Label on a filled button | `--text-btn-fg` |
| Label on a disabled button | `--text-btn-disabled` |
| Outlined/text button label on hover | `--text-btn-hover` |
| Success message or completed label | `--text-success` |
| Warning message or deadline label | `--text-warning` |
| Error message or failed validation | `--text-error` |
| Active tab, selected chip | `--text-selected` |
| Progress label, in-progress step | `--text-progress` |
| Quiz type label or badge | `--text-quiz` |

---

## Related Skills

- `5mins-brand-colors` — raw palette hex values (Primary, Neutral, Semantic, Gamification)
- `5mins-surface-colors` — background and border tokens these text colors sit on top of
- `buttons` — full button system including sizing, icon rules, and variant pairing
- `5mins-badges` — badge component with correct text/background token pairings
