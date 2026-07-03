---
name: 5mins-layout
description: 5Mins.ai layout foundations in one file — the 4px spacing scale (padding, margins, gaps), border radius (roundness), icon sizes, shadows (S/L/XL), and the overlay scrim with dark/light-mode opacities. Use when setting any spacing, padding, margin, gap, corner radius, icon size, box-shadow, or overlay backdrop. Token names mirror the Figma variables. Replaces the former spacing.md; single source for shadow and scrim values.
---

# 5Mins.ai Layout

Layout foundations: spacing, roundness, padding, margins, icon sizes, shadows, and the overlay scrim. Everything derives from a **4px base unit** — all custom values must be multiples of 4px.

---

## 1. The 4px scale

Reference ladder (Figma "Spacing/Roundness/Padding/Margins/Icons size"):

| rem | px |
|---|---|
| 0.25 | 4 |
| 0.5 | 8 |
| 0.75 | 12 |
| 1 | 16 |
| 1.25 | 20 |
| 1.5 | 24 |
| 2 | 32 |
| 2.5 | 40 |
| 3 | 48 |
| 3.5 | 56 |
| 4 | 64 |
| 4.5 | 72 |
| 5 | 80 |
| 6 | 96 |
| 10 | 160 |

Values above 40px have no named token — use the rem value directly (e.g. `3rem` for 48px section gaps).

## 2. Named tokens (Figma)

The Figma number variables and their CSS tokens. The same scale drives **both** spacing and radius:

| Figma name | px | Spacing token | Radius token |
|---|---|---|---|
| XS | 4 | `--space-xs` | `--radius-xs` |
| S | 8 | `--space-s` | `--radius-s` |
| SM | 12 | `--space-sm` | `--radius-sm` |
| M | 16 | `--space-m` | `--radius-m` |
| ML | 20 | `--space-ml` | `--radius-ml` |
| L | 24 | `--space-l` | — |
| XL | 32 | `--space-xl` | — |
| XXL | 40 | `--space-xxl` | — |
| 0 | 0 | use `0` | use `0` |
| 100 | 100 | use `100px` | — |

Code-only extra: `--radius-full: 9999px` for circular elements (avatars, pills, icon-button hover backgrounds — icon-only buttons **always** use circular hover, never squared).

```css
:root {
  /* Spacing (4px base) */
  --space-xs: 0.25rem;   /* 4px */
  --space-s: 0.5rem;     /* 8px */
  --space-sm: 0.75rem;   /* 12px */
  --space-m: 1rem;       /* 16px */
  --space-ml: 1.25rem;   /* 20px */
  --space-l: 1.5rem;     /* 24px */
  --space-xl: 2rem;      /* 32px */
  --space-xxl: 2.5rem;   /* 40px */

  /* Border Radius */
  --radius-xs: 0.25rem;  /* 4px */
  --radius-s: 0.5rem;    /* 8px */
  --radius-sm: 0.75rem;  /* 12px */
  --radius-m: 1rem;      /* 16px */
  --radius-ml: 1.25rem;  /* 20px */
  --radius-full: 9999px;
}
```

## 3. Padding & margin guidelines

### Component padding

```css
/* Buttons */
.btn-sm  { padding: var(--space-s) var(--space-m); }    /* 8px 16px */
.btn-md  { padding: var(--space-sm) var(--space-ml); }  /* 12px 20px */
.btn-lg  { padding: var(--space-sm) var(--space-l); }   /* 12px 24px */

/* Cards */
.card-sm { padding: var(--space-m); }   /* 16px */
.card-md { padding: var(--space-l); }   /* 24px */

/* Inputs */
.input   { padding: var(--space-sm) var(--space-m); }   /* 12px 16px */
```

### Quick reference

**Component internal spacing**
- Icon ↔ text gap (small button) → `--space-xs` (4px)
- Icon ↔ header gap → `--space-m` (16px)
- Input padding → `--space-sm` / `--space-m` (12px 16px)
- Card padding → `--space-m` compact / `--space-l` standard

**Layout spacing**
- Form element gaps, section gaps → `--space-ml` (20px)
- Page padding, page section gaps → `--space-l` (24px)
- Large section separation → `--space-xl` / `--space-xxl` (32/40px)

## 4. Roundness (border radius)

| Element | Token |
|---|---|
| Buttons | `--radius-s` (8px) |
| Cards, inputs, tags, badges | `--radius-sm` (12px) |
| Large cards, modals | `--radius-m` (16px) |
| Hero sections | `--radius-ml` (20px) |
| Avatars, pills, circular icon-button hover | `--radius-full` |
| Small elements, tags | `--radius-xs` (4px) |

## 5. Icon sizes

Iconsax React icons come in exactly four sizes — never others:

| Size | Token | Usage |
|---|---|---|
| 16px | `--icon-size-sm` | Small indicators, inline icons, badges |
| 20px | `--icon-size-md` | Button icons, form elements, input icons |
| 24px | `--icon-size-lg` | Navigation, headers, cards (default) |
| 32px | `--icon-size-xl` | Large interactive elements, hero sections |

See `iconography.md` for icon usage, variants, and color rules.

## 6. Shadows

Three elevation levels per the Figma styles:

| Token | Value | Usage |
|---|---|---|
| `--shadow-s` | `-1px -1px 4px 0 rgba(32, 34, 42, 0.04), 1px 1px 4px 0 rgba(32, 34, 42, 0.04)` | Cards, table rows — subtle all-around lift |
| `--shadow-l` | `4px 4px 24px 0 rgba(32, 34, 42, 0.12)` | Tooltips, dropdown menus, popovers |
| `--shadow-xl` | `0 4px 32px 0 rgba(32, 34, 42, 0.24)` | Modals, dialogs — highest elevation |

```css
:root {
  --shadow-s:  -1px -1px 4px 0 rgba(32, 34, 42, 0.04), 1px 1px 4px 0 rgba(32, 34, 42, 0.04);
  --shadow-l:  4px 4px 24px 0 rgba(32, 34, 42, 0.12);
  --shadow-xl: 0 4px 32px 0 rgba(32, 34, 42, 0.24);
}
```

Code-only extra: `--shadow-panel` (`-24px 0 24px 0 rgba(32, 34, 42, 0.04)`) — leftward shadow for right-anchored side panels. Directional variants of Shadow L (e.g. the tooltip's `drop-shadow(-4px 0 24px rgba(32,34,42,0.12))` and the drawer's `-4px 0 24px`) reuse L's blur/opacity with a shifted offset.

## 7. Overlay scrim

Full-screen backdrop behind dialogs, modals, and side drawers. Always Neutral-900 `#0F1014`, opacity per mode:

| Mode | Value |
|---|---|
| Light mode | Neutral-900 @ **25%** — `rgba(15, 16, 20, 0.25)` |
| Dark mode | Neutral-900 @ **50%** — `rgba(15, 16, 20, 0.5)` |

Use the token, never a literal:

```css
.overlay-backdrop {
  position: fixed;
  inset: 0;
  background: var(--scrim);
  z-index: 1000;
}
```

> **Code note:** `tokens.css` currently defines `--scrim: rgba(15, 16, 20, 0.5)` — the dark-mode value — while the app runs in light mode (Figma light = 25%). Aligning it is a visible change to every overlay; do it as a deliberate decision, not in passing.

See `overlays.md` for the Dialog/Modal/Side-Drawer component specs that sit on top of this scrim.

---

## Best practices

1. Always use the named tokens; never hardcode px values that a token covers.
2. Every custom value must be a multiple of 4px.
3. Smaller spacing for related elements, larger for section separation.
4. One shadow level per surface — don't stack or invent intermediate shadows.
