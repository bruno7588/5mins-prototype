---
name: 5mins-buttons
description: Button component system for 5Mins.ai — Filled, Outlined, Outlined-2, Text, and Link variants; Danger/Warning/Success semantic families (filled, outlined, text); AI gradient buttons; three sizes; Enabled/Hover/Pressed/Disabled/Loading states; leading-icon support. Use when implementing any button, CTA, or clickable action.
---

# 5Mins.ai Button Component System

Complete button implementation guide for the 5Mins.ai micro-learning platform with all variants, states, sizes, and accessibility patterns.

Spec source: Figma Library — parent frame `node 5453:38273` (dark board `10825:3269`, light board `12016:14084`), re-verified 2026-08-04. All colors are semantic tokens; **both light- and dark-mode resolutions are listed** because the two modes now use different state ladders.

> **Updated 2026-08-04:** major rework of both modes —
> 1. **Primary filled ladder is now mode-specific.** Light darkened one step (bg Primary-**700**, was 600); dark uses Primary-**500** with a **dark label** (`Neutral-800`) and goes **lighter on hover** (Primary-400).
> 2. **Outlined resting tint is gone.** New fill ladder: **transparent at rest → tint on hover → transparent on press**. Hover tint = Primary-500 @ 16% (primary) / family-500 @ **24%** (semantic families). Disabled is transparent too (the 16% neutral fill was removed).
> 3. **Icons are now LEADING** (before the label), not trailing. Gap 4px (S) / 8px (M, L); icon-side padding is one step tighter.
> 4. **AI gradients are per-state and per-mode**: the gradient start follows the primary filled ladder, the end is always Blaze `#8158EC`. AI hover gains a cyan border + purple glow. AI-Outlined lost its resting wash (wash only on hover, at 24%), and its 1px stroke is a **gradient**, not a flat cyan (corrected 2026-08-11 - see AI-Outlined below).
> 5. Warning/Success dark-mode filled hovers now go **lighter** (Warning-500 / Success-400). Danger darkens in both modes.
> 6. Coverage: Loading now exists for the semantic-outlined families; semantic-text variants (Danger/Warning/Success-text) are first-class.

## Button Architecture

| Dimension | Options |
|-----------|---------|
| **Configuration** | Filled, Outlined, Outlined-2, Text, Link, Danger(-outlined/-text), Warning(-outlined/-text), Success(-outlined/-text), AI, AI-Outlined |
| **Size** | Small (33px), Medium (41px), Large (48px) |
| **State** | Enabled, Hover, Pressed, Disabled, Loading |
| **Icon** | With leading icon, without (AI variants are always with icon) |

## Size System

All sizes share `border-radius: var(--radius-sm)` (12px) and Poppins **Bold** labels.

| Size | Height | Padding (no icon) | Padding (with icon) | Icon gap | Font | Icon |
|------|--------|-------------------|---------------------|----------|------|------|
| **Small** | 33px | 8px 16px | 8px **12px**/16px | 4px (`--space-xs`) | 12px / 1.4 (H6) | 16px |
| **Medium** | 41px | **10px** 20px (10px is intentionally off the 4px scale) | 10px **16px**/20px | 8px (`--space-s`) | 14px / 1.5 (H5) | 20px |
| **Large** | 48px | 12px 24px | 12px **20px**/24px | 8px (`--space-s`) | 16px / 1.5 (H4) | 24px |

With an icon, the **icon-side (left) padding is one step tighter** than the label-side padding — the icon leads.

```css
.btn    { border-radius: var(--radius-sm); font-family: 'Poppins'; font-weight: 700; }
.btn-sm { padding: var(--space-s) var(--space-m);  font-size: 12px; line-height: 1.4; gap: var(--space-xs); }
.btn-md { padding: 10px var(--space-ml);           font-size: 14px; line-height: 1.5; gap: var(--space-s); }
.btn-lg { padding: var(--space-sm) var(--space-l); font-size: 16px; line-height: 1.5; gap: var(--space-s); }
/* with icon: tighten the leading (icon) side one step */
.btn-sm.has-icon { padding-left: var(--space-sm); }  /* 12px */
.btn-md.has-icon { padding-left: var(--space-m); }   /* 16px */
.btn-lg.has-icon { padding-left: var(--space-ml); }  /* 20px */
```

## Icon Support

Icons are **leading** — before the label, Iconsax Linear at the size-bound dimension (16/20/24px), `currentColor`:

```tsx
<Button icon={<Add size={20} color="currentColor" />}>Add Course</Button>
{/* renders: [ + Button ] — icon first, label after */}
```

> This flips the previous trailing-icon spec. Any call site that visually relies on a trailing icon should be re-checked against Figma.

## Primary Variants

### Filled (Default)

The ladder is **mode-aware** — light gets darker on interaction, dark gets *lighter* on hover, and the label flips to dark on the bright dark-mode fill:

| Token | Light | Dark |
|-------|-------|------|
| `--primary-button-background` | Primary-700 `#008393` | Primary-500 `#00CEE6` |
| `--primary-button-background-hover` | Primary-800 `#005862` | Primary-400 `#33E2F7` |
| `--primary-button-background-pressed` | Primary-900 `#002C31` | Primary-700 `#008393` |
| `--text-button-foreground` (label) | Neutral-25 `#F9F9FA` | **Neutral-800 `#20222A`** |
| `--button-background-disabled` | Neutral-100 `#DFE1E6` | Neutral-400 `#656B7C` |
| `--text-button-disabled` | Neutral-300 `#9EA4B3` | Neutral-300 `#9EA4B3` |

```css
.btn-filled {
  background: var(--primary-button-background);
  color: var(--text-button-foreground);           /* dark on cyan in dark mode — token handles it */
  border: none;
}
.btn-filled:hover    { background: var(--primary-button-background-hover); }
.btn-filled:active   { background: var(--primary-button-background-pressed); }
.btn-filled:disabled { background: var(--button-background-disabled); color: var(--text-button-disabled); }
```

### Outlined

**Transparent at rest** (the 16% resting tint is gone). Fill ladder: transparent → **16% Primary-500 tint on hover** → transparent on press. Border and text share one color per state:

| State | Fill | Border + text | Light | Dark |
|-------|------|---------------|-------|------|
| Enabled | transparent | `--text-button-outlined` | Primary-700 `#008393` | Primary-500 `#00CEE6` |
| Hover | `rgba(0,206,230,0.16)` | `--text-button-hover` | Primary-700 `#008393` | Primary-400 `#33E2F7` |
| Pressed | transparent | `--primary-button-background-pressed` | Primary-900 `#002C31` | Primary-700 `#008393` |
| Disabled | transparent | `--text-disabled` | Neutral-300 | Neutral-400 |

Note: in **light** mode the rest and hover chrome are the same color — the hover cue is the 16% fill. In **dark** mode the chrome also brightens.

```css
.btn-outlined {
  background: transparent;
  color: var(--text-button-outlined);
  border: 1px solid var(--text-button-outlined);
}
.btn-outlined:hover {
  background: rgba(0, 206, 230, 0.16);            /* Primary-500 @ 16%, both modes */
  color: var(--text-button-hover);
  border-color: var(--text-button-hover);
}
.btn-outlined:active {
  background: transparent;
  color: var(--primary-button-background-pressed);
  border-color: var(--primary-button-background-pressed);
}
.btn-outlined:disabled {
  background: transparent;
  color: var(--text-disabled);
  border-color: var(--text-disabled);
}
```

### Outlined-2

Neutral at rest: `--border` hairline + `--text-primary` label, transparent fill. Hover/Pressed are **identical to Outlined** (16% cyan tint on hover, brand chrome). Use for tertiary actions where the brand color should only surface on interaction. Has Loading in all three sizes.

```css
.btn-outlined-2 {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border);
}
/* :hover / :active — same as .btn-outlined */
```

### Text

No background, border, or padding — just the bold label. Same chrome ladder as Outlined:

```css
.btn-text {
  background: transparent; border: none; padding: 0;
  color: var(--text-button-outlined);
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

Semantic **filled labels are always `Neutral-25`** (`--neutral-25`, both modes) — do **not** use `--text-button-foreground`, which flips dark in dark mode. Semantic **outlined** follows the same fill ladder as primary Outlined but with a **24%** hover tint (vs 16% for primary).

### Danger (Destructive Actions)

Darkens on interaction in **both** modes:

```css
.btn-danger          { background: var(--danger-500); color: var(--neutral-25); }
.btn-danger:hover    { background: var(--button-danger-hover); }     /* Danger-600 #9C0F2E */
.btn-danger:active   { background: var(--button-danger-pressed); }   /* Danger-700 #59091A */

.btn-danger-outlined          { background: transparent; color: var(--danger-500); border: 1px solid var(--danger-500); }
.btn-danger-outlined:hover    { background: rgba(223, 22, 66, 0.24); /* Danger-500 @ 24% */
                                color: var(--text-error); border-color: var(--text-error); } /* light #DF1642 / dark Danger-400 #E95C7B */
.btn-danger-outlined:active   { background: transparent;
                                color: var(--button-danger-hover); border-color: var(--button-danger-pressed); } /* text and border differ — per Figma */
.btn-danger-text     { background: transparent; border: none; padding: 0; color: var(--danger-500); }
```

### Warning (Caution Actions)

Default is **Warning-600**. Dark mode goes **lighter** on hover:

| Token | Light | Dark |
|-------|-------|------|
| `--button-warning-background` | Warning-600 `#E88206` | Warning-600 `#E88206` |
| `--button-warning-background-hover` | Warning-700 `#996322` | **Warning-500 `#FFA538`** |
| `--button-warning-background-pressed` | Warning-800 `#664216` | **Warning-700 `#996322`** |
| `--text-warning` (outlined hover chrome) | Warning-600 `#E88206` | Warning-500 `#FFA538` |

```css
.btn-warning          { background: var(--button-warning-background); color: var(--neutral-25); }
.btn-warning:hover    { background: var(--button-warning-background-hover); }
.btn-warning:active   { background: var(--button-warning-background-pressed); }

.btn-warning-outlined          { background: transparent; color: var(--button-warning-background); border: 1px solid var(--button-warning-background); }
.btn-warning-outlined:hover    { background: rgba(255, 165, 56, 0.24); /* Warning-500 @ 24% */
                                 color: var(--text-warning); border-color: var(--text-warning); }
.btn-warning-outlined:active   { background: transparent;
                                 color: var(--button-warning-background-pressed); border-color: var(--button-warning-background-pressed); }
.btn-warning-text     { background: transparent; border: none; padding: 0; color: var(--button-warning-background); }
```

### Success (Positive Actions)

Dark mode goes **lighter** on hover:

| Token | Light | Dark |
|-------|-------|------|
| `--button-success-background` | Success-500 `#18A957` | Success-500 `#18A957` |
| `--button-success-background-hover` | Success-600 `#11763D` | **Success-400 `#5DC389`** |
| `--button-success-background-pressed` | Success-700 `#0A4423` | **Success-600 `#11763D`** |

```css
.btn-success          { background: var(--button-success-background); color: var(--neutral-25); }
.btn-success:hover    { background: var(--button-success-background-hover); }
.btn-success:active   { background: var(--button-success-background-pressed); }

.btn-success-outlined          { background: transparent; color: var(--button-success-background); border: 1px solid var(--button-success-background); }
.btn-success-outlined:hover    { background: rgba(24, 169, 87, 0.24); /* Success-500 @ 24% */
                                 border-color: var(--button-success-background-hover);
                                 color: var(--button-success-background); }  /* text stays base on hover — per Figma */
.btn-success-outlined:active   { background: transparent;
                                 color: var(--button-success-background-pressed); border-color: var(--button-success-background-pressed); }
.btn-success-text     { background: transparent; border: none; padding: 0; color: var(--button-success-background); }
```

Disabled state for all semantic variants = the shared disabled treatment (`--button-background-disabled` fill for filled; transparent fill + `--text-disabled` chrome for outlined/text).

## AI Variants (Hugo AI)

AI buttons use a diagonal **gradient that ends at Blaze `#8158EC`** and *starts* at the primary filled color for the current state and mode — so the gradient follows the same mode-aware ladder as `.btn-filled`. The sparkle "AI Generate" icon is **leading** and size-bound. Label is `--neutral-25` (white) in both modes. All three sizes, all five states.

| State | Light gradient start | Dark gradient start | Extra chrome |
|-------|---------------------|---------------------|--------------|
| Enabled | Primary-700 `#008393` | Primary-500 `#00CEE6` | — |
| Hover | Primary-800 `#005862` | Primary-400 `#33E2F7` | **2px `#00CEE6` border + glow** `drop-shadow(1px 1px 16px rgba(129,88,236,0.5))` |
| Pressed | Primary-900 `#002C31` | Primary-700 `#008393` | 1px `#00CEE6` border |
| Disabled | standard disabled fill + label | standard | — |

**Gradient geometry (verified against rendered pixels 2026-08-04):** Figma uses a **diamond gradient centered at the button's top-left corner** (its 6 stops are collinear, so only the two endpoint colors matter). The closest CSS equivalent is `radial-gradient(circle at top left, start, end)` — corner samples match within ~4%. A `linear-gradient(120deg, …)` is an acceptable fallback; ~100deg is too flat (the left edge visibly shifts toward purple as it descends).

```css
.btn-ai {
  /* start = the mode-resolved primary filled token, end = Blaze */
  background: radial-gradient(circle at top left, var(--primary-button-background) 0%, var(--blaze-quiz, #8158EC) 100%);
  color: var(--neutral-25);
  border: none;
}
.btn-ai:hover {
  background: radial-gradient(circle at top left, var(--primary-button-background-hover) 0%, #8158EC 100%);
  border: 2px solid #00cee6;                       /* raw Primary-500, both modes */
  filter: drop-shadow(1px 1px 16px rgba(129, 88, 236, 0.5));
}
.btn-ai:active {
  background: radial-gradient(circle at top left, var(--primary-button-background-pressed) 0%, #8158EC 100%);
  border: 1px solid #00cee6;
}
```

### AI-Outlined

**Transparent at rest** (the old 16% resting wash is gone). The 1px stroke is **the AI gradient, not a flat cyan** - it sweeps cyan through purple along the edge, on the same per-state ladder as the label it frames. The **label + icon are gradient-filled** via background-clip with that same gradient.

> **Verified 2026-08-11 against Figma `8998:65562`** by sampling the rendered stroke: `rgb(19,171,202)` → `rgb(143,94,203)` → `rgb(5,201,228)` → `rgb(90,105,210)` across the top edge. Note the MCP code export flattens this stroke to its first stop and reports `border: 1px solid #00cee6` - that export is wrong, and this doc said the same thing until the pixels were checked. Figma paints a diamond gradient, so CSS uses the documented `radial-gradient(circle at top left, …)` approximation, exactly as `.btn-ai` already does for its fill.

The ring is drawn as a **masked pseudo-element**, not a border: the button is transparent at rest, so the usual two-background border trick (which needs an opaque inner fill) does not apply, and `border-image` ignores the 12px radius. Keep the transparent `border` in the box model so nothing reflows between states.

```css
.btn-ai-outlined {
  background: transparent;
  border: 1px solid transparent;                   /* holds the box, ring is painted below */
}
.btn-ai-outlined::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;                                    /* = stroke width */
  background: radial-gradient(circle at top left, var(--text-button-outlined) 0%, #8158EC 100%);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  mask-composite: exclude;
  pointer-events: none;
}
/* the ring follows the same state ladder as the label */
.btn-ai-outlined:hover::before  { background: radial-gradient(circle at top left, var(--text-button-hover) 0%, #8158EC 100%); }
.btn-ai-outlined:active::before { background: radial-gradient(circle at top left, var(--primary-button-background-pressed) 0%, #8158EC 100%); }
.btn-ai-outlined:disabled::before { display: none; }   /* disabled takes the shared flat treatment */
.btn-ai-outlined:hover {
  /* wash = the HOVER gradient at 24% opacity, plus a soft glow */
  background: radial-gradient(circle at top left,
    rgb(from var(--primary-button-background-hover) r g b / 0.24) 0%,
    rgba(129, 88, 236, 0.24) 100%);
  box-shadow: 1px 1px 32px 0 rgba(129, 88, 236, 0.16);
}
.btn-ai-outlined:active { background: transparent; }

/* Label/icon gradient starts on the TEXT-chrome ladder (Figma node 11210:4067 binds the
   start stop to Text-button-outlined), NOT the filled background token. The 24% hover
   wash behind the button does use the background-hover ladder. */
.btn-ai-outlined .btn-label,
.btn-ai-outlined .btn-icon {
  background: radial-gradient(circle at top left, var(--text-button-outlined) 0%, #8158EC 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.btn-ai-outlined:hover .btn-label  { background-image: radial-gradient(circle at top left, var(--text-button-hover) 0%, #8158EC 100%); }
.btn-ai-outlined:active .btn-label { background-image: radial-gradient(circle at top left, var(--primary-button-background-pressed) 0%, #8158EC 100%); }
```

## Loading State

Unchanged: the button takes the **disabled background** (`--button-background-disabled` for filled variants; text/outlined keep their chrome), the label is replaced by a **20px spinner** (arc, `currentColor`), and the width is preserved.

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

## Size / state coverage in Figma

Both mode boards carry the identical matrix. Primary variants (Filled/Outlined/Outlined-2/Text/Link) and AI/AI-Outlined cover **all three sizes**. Semantic coverage:

| Family | Sizes in Figma |
|--------|----------------|
| Danger | S, M, L |
| Danger-outlined | L only |
| Danger-text | M, L |
| Warning | M, L |
| Warning-outlined | S, M, L |
| Warning-text | L only |
| Success | M, L |
| Success-outlined | M, L |
| Success-text | L only |

Every present size has all five states (incl. Loading). For missing sizes, extrapolate from the Size System table.

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
  icon?: ReactNode;           // leading icon — rendered BEFORE the label
  loading?: boolean;
  children?: ReactNode;
}
```

The component composes one appearance class from `(semantic, variant)` — `ds-btn--filled`, `ds-btn--danger-outlined`, `ds-btn--ai`, etc. Semantic families (danger/warning/success) mirror filled/outlined/text; AI is filled + outlined only. See `Button.css` for the full class matrix.

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

Contrast: the light filled base darkened to Primary-700 and the dark filled base flipped to a dark label on Primary-500 — both changes exist to meet WCAG AA. Never use `--primary-500` as text on white.

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

| State | Filled bg | Outlined (fill / chrome) | Text/Link color |
|-------|-----------|--------------------------|-----------------|
| Enabled | `--primary-button-background` (L: 700 / D: 500) | **transparent** / `--text-button-outlined` | `--text-button-outlined` |
| Hover | `…-hover` (L: 800 / D: **400** ↑) | **16% cyan** (24% for semantic families) / `--text-button-hover` | `--text-button-hover` |
| Pressed | `…-pressed` (L: 900 / D: 700) | **transparent** / `…-pressed` | `--primary-button-background-pressed` |
| Disabled | `--button-background-disabled` + `--text-button-disabled` | transparent / `--text-disabled` | `--text-disabled` |
| Loading | `--button-background-disabled` + 20px spinner, width preserved | same pattern | spinner replaces label |

## Code reality

**`src/components/Button/Button.tsx` is the canonical component** — use it for all new work: `import Button from '@/components/Button/Button'`. Component, `Button.css`, and the token definitions in `src/styles/tokens.css` were migrated to this spec on 2026-08-04 (mode-aware ladders, leading icons, transparent outlined rest, per-state AI gradients — the AI hover's 2px border is rendered as 1px border + 1px inset ring to avoid layout shift).

Two legacy button patterns also still exist, to be migrated opportunistically (convert a call site when you're already editing that file — no big-bang sweep):

- **Legacy global classes** in `src/styles/tokens.css` — `.btn-primary`, `.btn-outlined`, `.btn-success`, `.btn-danger`, `.btn-text` (~50 usages). These predate the component and cover only the common cases.
- **Raw `<button>` elements** with hand-rolled styling across pages.

The component is namespaced `ds-btn` precisely so it can coexist with the legacy `.btn-*` classes without collision.
