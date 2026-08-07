---
name: 5mins-buttons
description: Button component system for 5Mins.ai — Filled, Outlined, Outlined-2, Text, and Link variants; Danger/Warning/Success semantic families (filled, outlined, text); AI gradient buttons; three sizes; Enabled/Hover/Pressed/Disabled/Loading states; trailing-icon support. Use when implementing any button, CTA, or clickable action.
---

# 5Mins.ai Button Component System

Complete button implementation guide for the 5Mins.ai micro-learning platform with all variants, states, sizes, and accessibility patterns.

Spec source: Figma Library — light `node 11957:17281`, dark `node 10825:3269` (re-verified 2026-07-13). All colors are semantic tokens that resolve per mode (see `colors.md`); hexes below are light-mode resolutions.

> **Updated 2026-07-13:** two structural changes — (1) **radius is now 12px** (`--radius-sm`) on every size and family, up from 8px; (2) **Outlined variants now carry a 16% tint at rest** (were transparent), with a 16% → 24% (hover) → 8% (pressed) fill ladder. Also: `AI-Outlined` is a first-class family, `Outlined-2` gained a Loading state, and semantic size coverage expanded (see gap note).

> **Updated 2026-08-07:** the dark-mode brand ladders were missing from `tokens.css` (it asserted "brand fills unchanged in dark"). They are now implemented and documented — see **Dark Mode Ladders** below.

> **Known gap:** semantic (Danger/Warning/Success) and AI size coverage is now broad but still not total — `Danger` has all three sizes; `Warning`/`Warning-outlined` have Small + Medium; `Success` gained no-icon Medium. Any remaining holes: extrapolate from the Size System table.

## Button Architecture

| Dimension | Options |
|-----------|---------|
| **Configuration** | Filled, Outlined, Outlined-2, Text, Link, Danger(-outlined/-text), Warning(-outlined/-text), Success(-outlined/-text), AI, AI-Outlined |
| **Size** | Small (33px), Medium (41px), Large (48px) |
| **State** | Enabled, Hover, Pressed, Disabled, Loading |
| **Icon** | With trailing icon, without (AI variants are always with icon) |

## Size System

All sizes share `border-radius: var(--radius-sm)` (12px), Poppins **Bold** labels, and a **4px** icon gap.

| Size | Height | Padding | Font | Icon Size |
|------|--------|---------|------|-----------|
| **Small** | 33px | 8px 16px (`--space-s --space-m`) | 12px / 1.4 (H6) | 16px |
| **Medium** | 41px | **10px** 20px (10px is intentionally off the 4px scale) | 14px / 1.5 (H5) | 20px |
| **Large** | 48px | 12px 24px (`--space-sm --space-l`) | 16px / 1.5 (H4) | 24px |

```css
.btn    { border-radius: var(--radius-sm); font-family: 'Poppins'; font-weight: 700; gap: var(--space-xs); /* 4px */ }
.btn-sm { padding: var(--space-s) var(--space-m);  font-size: 12px; line-height: 1.4; }
.btn-md { padding: 10px var(--space-ml);           font-size: 14px; line-height: 1.5; }
.btn-lg { padding: var(--space-sm) var(--space-l); font-size: 16px; line-height: 1.5; }
```

## Icon Support

Icons are **trailing** — after the label, 4px gap, Iconsax Linear at the size-bound dimension (16/20/24px), `currentColor`:

```tsx
<Button icon={<Add size={20} color="currentColor" />}>Add Course</Button>
{/* renders: [ Button + ] — label first, icon after */}
```

## Primary Variants

### Filled (Default)

```css
.btn-filled {
  background: var(--primary-button-background);            /* Primary-600 #00AFC4 */
  color: var(--text-button-foreground);                    /* Neutral-25 #F9F9FA */
  border: none;
}
.btn-filled:hover    { background: var(--primary-button-background-hover); }   /* Primary-700 */
.btn-filled:active   { background: var(--primary-button-background-pressed); } /* Primary-800 */
.btn-filled:disabled {
  background: var(--button-background-disabled);           /* light: Neutral-100 / dark: Neutral-400 */
  color: var(--text-button-disabled);                      /* Neutral-300 */
}
```

### Outlined

Border with a **16% cyan tint at rest** (not transparent). Use for secondary actions. The fill deepens on hover and lightens on press — a 16% → 24% → 8% ladder.

```css
.btn-outlined {
  background: rgba(0, 206, 230, 0.16);                     /* Primary-500 @ 16% — now the resting fill */
  color: var(--text-button-outlined);                      /* light: Primary-600 / dark: Primary-500 */
  border: 1px solid var(--text-button-outlined);
}
.btn-outlined:hover {
  background: rgba(0, 206, 230, 0.24);                     /* Primary-500 @ 24% */
  color: var(--text-button-hover);                         /* light: Primary-700 / dark: Primary-400 */
  border-color: var(--text-button-hover);
}
.btn-outlined:active {
  background: rgba(0, 206, 230, 0.08);                     /* Primary-500 @ 8% */
  color: var(--primary-button-background-pressed);
  border-color: var(--primary-button-background-pressed);
}
.btn-outlined:disabled {
  background: rgba(101, 107, 124, 0.16);                   /* Neutral @ 16% */
  color: var(--text-disabled);
  border-color: var(--text-disabled);
}
```

### Outlined-2

Neutral, **transparent** outline at rest (the one outlined family that stays fully transparent when idle); identical to Outlined on hover/press. Use for tertiary actions where the brand color should only surface on interaction. Has its own Loading variants in all three sizes.

```css
.btn-outlined-2 {
  background: transparent;
  color: var(--text-primary);                              /* Neutral-800 light / Neutral-25 dark */
  border: 1px solid var(--border);                         /* neutral hairline, not text-primary */
}
/* Hover and Pressed are IDENTICAL to .btn-outlined — 24% cyan tint on hover / 8% on press,
   hover border + text --text-button-hover */
```

### Text

No background, border, or padding — just the bold label.

```css
.btn-text {
  background: transparent; border: none; padding: 0;
  color: var(--text-button-outlined);                      /* light: Primary-600 / dark: Primary-500 */
}
.btn-text:hover    { color: var(--text-button-hover); }
.btn-text:active   { color: var(--primary-button-background-pressed); }
.btn-text:disabled { color: var(--text-disabled); }        /* note: --text-disabled, not --text-button-disabled */
```

### Link

Same as Text plus underline (`text-decoration-skip-ink: none`). Use for navigation-like actions within content.

```css
.btn-link { /* .btn-text + */ text-decoration: underline; text-decoration-skip-ink: none; }
```

## Semantic Variants

Each semantic family mirrors the primary structure: filled, outlined (border+text in the family color, **with a 16% tint of the family color at rest** — same as primary Outlined), and text (label only).

### Danger (Destructive Actions)

```css
.btn-danger          { background: var(--danger-500); color: var(--neutral-25); }
.btn-danger:hover    { background: var(--button-danger-hover); }     /* Danger-600 */
.btn-danger:active   { background: var(--button-danger-pressed); }   /* Danger-700 */

.btn-danger-outlined { background: rgba(223, 22, 66, 0.16); color: var(--danger-500); border: 1px solid var(--danger-500); } /* Danger-500 @ 16% */
.btn-danger-text     { background: transparent; border: none; padding: 0; color: var(--danger-500); }
```

### Warning (Caution Actions)

Default is **Warning-600**, not 500:

```css
.btn-warning          { background: var(--button-warning-background); color: var(--text-button-foreground); } /* Warning-600 */
.btn-warning:hover    { background: var(--button-warning-background-hover); }    /* Warning-700 */
.btn-warning:active   { background: var(--button-warning-background-pressed); }  /* Warning-800 */

.btn-warning-outlined { background: rgba(255, 165, 56, 0.16); color: var(--button-warning-background); border: 1px solid var(--button-warning-background); } /* Warning text @ 16% */
.btn-warning-text     { background: transparent; border: none; padding: 0; color: var(--button-warning-background); }
```

### Success (Positive Actions)

```css
.btn-success          { background: var(--button-success-background); color: var(--text-button-foreground); } /* Success-500 */
.btn-success:hover    { background: var(--button-success-background-hover); }    /* Success-600 */
.btn-success:active   { background: var(--button-success-background-pressed); }  /* Success-700 */

.btn-success-outlined { background: rgba(24, 169, 87, 0.16); color: var(--success-500); border: 1px solid var(--success-500); } /* Success-500 @ 16% */
.btn-success-text     { background: transparent; border: none; padding: 0; color: var(--button-success-background); }
```

Disabled state for all semantic variants = the shared disabled treatment (`--button-background-disabled` fill or border, `--text-button-disabled` label).

## Dark Mode Ladders

Spec source: Figma Library dark `node 10825:3269` (verified 2026-08-07). Every hex elsewhere in this doc is a **light-mode** resolution. In dark mode the brand ladders are not simply one shade over: fills brighten, **hover climbs the palette instead of deepening**, and the filled label flips to dark ink.

| Token | Light | Dark |
|-------|-------|------|
| `--primary-button-background` | Primary-600 `#00AFC4` | **Primary-500 `#00CEE6`** |
| `--primary-button-background-hover` | Primary-700 `#008393` | **Primary-400 `#33E2F7`** |
| `--primary-button-background-pressed` | Primary-800 `#005862` | **Primary-700 `#008393`** |
| `--text-button-foreground` | Neutral-25 `#F9F9FA` | **Neutral-800 `#20222A`** |
| `--button-success-background-hover` | Success-600 `#11763D` | **Success-400 `#5DC389`** |
| `--button-success-background-pressed` | Success-700 `#0A4423` | **Success-600 `#11763D`** |
| `--button-warning-background-hover` | Warning-700 `#996322` | **Warning-500 `#FFA538`** |
| `--button-warning-background-pressed` | Warning-800 `#664216` | **Warning-700 `#996322`** |
| `--button-background-disabled` | Neutral-100 | **Neutral-400 `#656B7C`** |

Identical in both modes: the Danger ladder (`--danger-500` / `--button-danger-hover` / `--button-danger-pressed`), `--button-success-background` (Success-500), `--button-warning-background` (Warning-600), and `--text-button-disabled` (Neutral-300).

**Danger and AI keep a white label in both modes** — `Button.css` hard-codes `--neutral-25` for those two families instead of reading `--text-button-foreground`. The dark Figma node carries Neutral-25 alongside the dark ink for exactly this reason.

## AI Variants (Hugo AI)

AI buttons use a **cyan→purple gradient**, always carry the "AI Generate" sparkle icon (trailing, size-bound), and exist in all three sizes.

### AI (filled)

A diagonal **multi-stop** cyan→blue→purple gradient (no longer a simple 2-stop):

```css
.btn-ai {
  background: linear-gradient(
    100deg,
    #00AFC4 0%,     /* Primary-600 */
    #10A4C9 12.5%,
    #2099CE 25%,
    #4184D8 50%,
    #616EE2 75%,
    #8158EC 100%    /* Blaze-quiz */
  );
  color: var(--neutral-25);
  border: none;
}
```

### AI-Outlined

A first-class family. Raw `#00cee6` border (Primary-500, hard-coded — not yet tokenized), a **faint 16% gradient wash** behind, and the **label + icon gradient-filled** via background-clip:

```css
.btn-ai-outlined {
  border: 1px solid #00cee6;                               /* raw hex — candidate for a token */
  /* 16% wash of the darker (Primary-700 → Blaze) gradient */
  background: linear-gradient(100deg,
    rgba(0,131,147,0.16) 0%, rgba(65,110,192,0.16) 50%, rgba(129,88,236,0.16) 100%);
}
.btn-ai-outlined .btn-label,
.btn-ai-outlined .btn-icon {
  background: linear-gradient(100deg, #00AFC4 0%, #8158EC 100%);  /* bright stops */
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
```

> The old spec (solid `--blaze-quiz` fill) is obsolete — AI buttons are gradients now.

## Loading State

Per Figma: the button takes the **disabled background** (`--button-background-disabled` for filled variants; text/outlined keep their chrome), the label is replaced by a **20px spinner** (`ImSpinner8`-style arc, `currentColor`), and the width is preserved.

```css
.btn-loading {
  pointer-events: none;
  background: var(--button-background-disabled);  /* filled variants */
}
.btn-loading .btn-label { display: none; }
.btn-loading::after {
  content: '';
  width: 20px; height: 20px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
```

## React TypeScript Implementation

Built as `src/components/Button/Button.tsx` (import `@/components/Button/Button`). It is namespaced `ds-btn` rather than `btn` so it doesn't collide with the legacy global `.btn-*` utility classes (CSS is globally bundled in this app). Props:

```tsx
import Button from '@/components/Button/Button';

type ButtonVariant = 'filled' | 'outlined' | 'outlined-2' | 'text' | 'link';
type ButtonSemantic = 'primary' | 'danger' | 'warning' | 'success' | 'ai';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;    // default 'filled'
  semantic?: ButtonSemantic;  // default 'primary'
  size?: ButtonSize;          // default 'md'
  icon?: ReactNode;           // trailing icon — rendered AFTER the label
  loading?: boolean;
  children?: ReactNode;
}
```

The component composes one appearance class from `(semantic, variant)` — `ds-btn--filled`, `ds-btn--danger-outlined`, `ds-btn--ai`, etc. Semantic families (danger/warning/success) only mirror filled/outlined/text; AI is filled + outlined only. See `Button.css` for the full class matrix.

## Usage Guidelines

### Variant Selection

- **Filled** — primary CTA, form submits, the one most-important action on the page
- **Outlined** — secondary actions, Cancel (paired with Filled)
- **Outlined-2** — tertiary/neutral actions that shouldn't read as brand-colored at rest
- **Text** — inline, subtle actions
- **Link** — navigation-like actions within content

### Semantic Selection

**Primary (Cyan):** default · **Danger (Red):** delete/destructive · **Warning (Orange):** consequence-laden actions · **Success (Green):** confirm/complete · **AI (Gradient):** Hugo AI and AI-powered features

### Size Selection

**Large:** hero sections, primary CTAs, modal footers · **Medium:** standard (most common) · **Small:** tables, compact UIs

## Accessibility

```tsx
<Button>Save Changes</Button>                              // always descriptive, Title Case
<Button icon={<Trash />} aria-label="Delete item" />       // icon-only needs aria-label
<Button loading aria-busy="true">Submitting…</Button>
```

```css
.btn:focus-visible { outline: 2px solid var(--primary-button-background); outline-offset: 2px; }
```

Contrast: filled combinations meet WCAG AA; never use `--primary-500` as text on white.

## Common Patterns

```tsx
{/* Primary + secondary pair */}
<Button variant="outlined">Cancel</Button>
<Button variant="filled">Save Changes</Button>

{/* Destructive confirmation */}
<Button variant="outlined">Cancel</Button>
<Button semantic="danger">Delete Course</Button>

{/* AI action */}
<Button semantic="ai" icon={<AiGenerateIcon size={20} />}>Generate</Button>
```

## Quick Reference

| Action | Variant | Semantic | Size |
|--------|---------|----------|------|
| Main CTA | Filled | Primary | Large |
| Form submit | Filled | Primary | Medium |
| Cancel | Outlined | Primary | Medium |
| Delete | Filled | Danger | Medium |
| Neutral tertiary | Outlined-2 | Primary | Medium |
| Inline link | Link | Primary | — |
| AI feature | Filled (gradient) | AI | Medium |
| Mark complete | Filled | Success | Medium |

### States Cheatsheet

| State | Filled bg | Outlined (fill / border / text) | Text/Link color |
|-------|-----------|----------|-----------------|
| Enabled | `--primary-button-background` | **16% cyan** / `--text-button-outlined` / `--text-button-outlined` | `--text-button-outlined` |
| Hover | `…-hover` | **24% cyan** / `--text-button-hover` / `--text-button-hover` | `--text-button-hover` |
| Pressed | `…-pressed` | **8% cyan** / `…-pressed` / `…-pressed` | `--primary-button-background-pressed` |
| Disabled | `--button-background-disabled` + `--text-button-disabled` | 16% neutral / `--text-disabled` / `--text-disabled` | `--text-disabled` |
| Loading | `--button-background-disabled` + 20px spinner, width preserved | same pattern | spinner replaces label |

## Code reality

**`src/components/Button/Button.tsx` is the source of truth** — it implements this full spec (all variants, semantic families, sizes, pressed/disabled/loading, AI gradients). Use it for all new work: `import Button from '@/components/Button/Button'`.

Two button patterns still exist alongside it, to be migrated opportunistically (convert a call site when you're already editing that file — no big-bang sweep):

- **Legacy global classes** in `src/styles/tokens.css` — `.btn-primary`, `.btn-outlined`, `.btn-success`, `.btn-danger`, `.btn-text` (~50 usages). These predate the component and cover only the common cases (no pressed/loading/AI, no size modifiers). Kept as a fallback until adoption is high, then delete.
- **Raw `<button>` elements** with hand-rolled styling across pages.

The component is namespaced `ds-btn` precisely so it can coexist with the legacy `.btn-*` classes without collision.
