---
name: 5mins-buttons
description: Button component system for 5Mins.ai — Filled, Outlined, Outlined-2, Text, and Link variants; Danger/Warning/Success semantic families (filled, outlined, text); AI gradient buttons; three sizes; Enabled/Hover/Pressed/Disabled/Loading states; trailing-icon support. Use when implementing any button, CTA, or clickable action.
---

# 5Mins.ai Button Component System

Complete button implementation guide for the 5Mins.ai micro-learning platform with all variants, states, sizes, and accessibility patterns.

Spec source: Figma Library — light `node 11915:4346`, dark `node 10825:3269` (verified 2026-07-03). All colors are semantic tokens that resolve per mode (see `colors.md`); hexes below are light-mode resolutions.

> **Known gap:** the Library defines semantic (Danger/Warning/Success) and AI variants at partial size coverage (mostly Large + Medium; Danger/Success-outlined only Large). Missing sizes will be added to Figma later — until then, extrapolate from the Size System table.

## Button Architecture

| Dimension | Options |
|-----------|---------|
| **Configuration** | Filled, Outlined, Outlined-2, Text, Link, Danger(-outlined/-text), Warning(-outlined/-text), Success(-outlined/-text), AI, AI-Outlined |
| **Size** | Small (33px), Medium (41px), Large (48px) |
| **State** | Enabled, Hover, Pressed, Disabled, Loading |
| **Icon** | With trailing icon, without (AI variants are always with icon) |

## Size System

All sizes share `border-radius: var(--radius-s)` (8px), Poppins **Bold** labels, and a **4px** icon gap.

| Size | Height | Padding | Font | Icon Size |
|------|--------|---------|------|-----------|
| **Small** | 33px | 8px 16px (`--space-s --space-m`) | 12px / 1.4 (H6) | 16px |
| **Medium** | 41px | **10px** 20px (10px is intentionally off the 4px scale) | 14px / 1.5 (H5) | 20px |
| **Large** | 48px | 12px 24px (`--space-sm --space-l`) | 16px / 1.5 (H4) | 24px |

```css
.btn    { border-radius: var(--radius-s); font-family: 'Poppins'; font-weight: 700; gap: var(--space-xs); /* 4px */ }
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

Border with transparent background. Use for secondary actions.

```css
.btn-outlined {
  background: transparent;
  color: var(--primary-button-background);                 /* Primary-600 */
  border: 1px solid var(--primary-button-background);
}
.btn-outlined:hover {
  background: rgba(0, 206, 230, 0.16);                     /* Primary-500 @ 16% */
  color: var(--text-button-hover);                         /* light: Primary-700 / dark: Primary-500 */
  border-color: var(--primary-button-background-hover);
}
.btn-outlined:active {
  background: rgba(0, 206, 230, 0.16);
  color: var(--primary-button-background-pressed);
  border-color: var(--primary-button-background-pressed);
}
.btn-outlined:disabled {
  color: var(--text-button-disabled);
  border-color: var(--button-background-disabled);
  background: transparent;
}
```

### Outlined-2

Neutral outline at rest; identical to Outlined on hover/press. Use for tertiary actions where the brand color should only surface on interaction.

```css
.btn-outlined-2 {
  background: transparent;
  color: var(--text-primary);                              /* Neutral-800 light / Neutral-25 dark */
  border: 1px solid var(--text-primary);
}
/* Hover and Pressed are IDENTICAL to .btn-outlined — 16% cyan tint,
   hover border --primary-button-background-hover, text --text-button-hover */
```

### Text

No background, border, or padding — just the bold label.

```css
.btn-text {
  background: transparent; border: none; padding: 0;
  color: var(--primary-button-background);                 /* Primary-600 */
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

Each semantic family mirrors the primary structure: filled, outlined (border+text in the family color, transparent bg), and text (label only).

### Danger (Destructive Actions)

```css
.btn-danger          { background: var(--danger-500); color: var(--neutral-25); }
.btn-danger:hover    { background: var(--button-danger-hover); }     /* Danger-600 */
.btn-danger:active   { background: var(--button-danger-pressed); }   /* Danger-700 */

.btn-danger-outlined { background: transparent; color: var(--danger-500); border: 1px solid var(--danger-500); }
.btn-danger-text     { background: transparent; border: none; padding: 0; color: var(--danger-500); }
```

### Warning (Caution Actions)

Default is **Warning-600**, not 500:

```css
.btn-warning          { background: var(--button-warning-background); color: var(--text-button-foreground); } /* Warning-600 */
.btn-warning:hover    { background: var(--button-warning-background-hover); }    /* Warning-700 */
.btn-warning:active   { background: var(--button-warning-background-pressed); }  /* Warning-800 */

.btn-warning-outlined { background: transparent; color: var(--button-warning-background); border: 1px solid var(--button-warning-background); }
.btn-warning-text     { background: transparent; border: none; padding: 0; color: var(--button-warning-background); }
```

### Success (Positive Actions)

```css
.btn-success          { background: var(--button-success-background); color: var(--text-button-foreground); } /* Success-500 */
.btn-success:hover    { background: var(--button-success-background-hover); }    /* Success-600 */
.btn-success:active   { background: var(--button-success-background-pressed); }  /* Success-700 */

.btn-success-outlined { background: transparent; color: var(--button-success-background); border: 1px solid var(--button-success-background); }
.btn-success-text     { background: transparent; border: none; padding: 0; color: var(--button-success-background); }
```

Disabled state for all semantic variants = the shared disabled treatment (`--button-background-disabled` fill or border, `--text-button-disabled` label).

## AI Variants (Hugo AI)

AI buttons use a **cyan→purple gradient**, always carry the "AI Generate" sparkle icon (trailing, size-bound), and exist in all three sizes.

### AI (filled)

```css
.btn-ai {
  background: linear-gradient(100deg, #00AFC4 0%, #8158EC 100%);  /* Primary-600 → Blaze-quiz */
  color: var(--neutral-25);
  border: none;
}
```

### AI-Outlined

Border in Primary-500; the **label and icon are gradient-filled** via background-clip:

```css
.btn-ai-outlined {
  background: transparent;
  border: 1px solid var(--primary-500);                    /* #00CEE6 */
}
.btn-ai-outlined .btn-label {
  background: linear-gradient(100deg, #008393 0%, #8158EC 100%);  /* Primary-700 → Blaze-quiz (light mode) */
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

```tsx
import { ReactNode, ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'filled' | 'outlined' | 'outlined-2' | 'text' | 'link';
type ButtonSemantic = 'primary' | 'danger' | 'warning' | 'success' | 'ai';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  semantic?: ButtonSemantic;
  size?: ButtonSize;
  icon?: ReactNode;          // trailing icon — rendered AFTER the label
  loading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = 'filled', semantic = 'primary', size = 'md',
  icon, loading = false, disabled, children, className, ...props
}: ButtonProps) {
  return (
    <button
      className={[
        'btn',
        `btn-${variant}`,
        semantic !== 'primary' ? `btn-${semantic}` : '',
        `btn-${size}`,
        loading ? 'btn-loading' : '',
        className,
      ].filter(Boolean).join(' ')}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      <span className="btn-label">{children}</span>
      {icon && <span className="btn-icon">{icon}</span>}
    </button>
  );
}
```

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

| State | Filled bg | Outlined | Text/Link color |
|-------|-----------|----------|-----------------|
| Enabled | `--primary-button-background` | border+text `--primary-button-background` | `--primary-button-background` |
| Hover | `…-hover` | 16% cyan tint, border `…-hover`, text `--text-button-hover` | `--text-button-hover` |
| Pressed | `…-pressed` | 16% cyan tint, border+text `…-pressed` | `--primary-button-background-pressed` |
| Disabled | `--button-background-disabled` + `--text-button-disabled` | muted border+text | `--text-disabled` |
| Loading | `--button-background-disabled` + 20px spinner, width preserved | same pattern | spinner replaces label |

## Code reality

`src/styles/tokens.css` ships global `.btn-primary`, `.btn-outlined`, `.btn-success`, `.btn-danger` classes — there is **no Button React component** in `src/components/`. They predate this spec: padding `10px 20px` ✓, but there's no pressed/loading/AI support and no size modifiers. Extend those classes against this spec rather than inventing new ones.
