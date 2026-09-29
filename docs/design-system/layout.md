---
name: 5mins-layout
description: 5Mins.ai layout foundations in one file — the 4px spacing scale (padding, margins, gaps), border radius (roundness), icon sizes, shadows (S/L/XL), and the overlay scrim with dark/light-mode opacities. Use when setting any spacing, padding, margin, gap, corner radius, icon size, box-shadow, or overlay backdrop. Token names mirror the Figma variables. Replaces the former spacing.md; single source for shadow and scrim values.
---

# 5Mins.ai Layout

Layout foundations: spacing, roundness, padding, margins, icon sizes, shadows, and the overlay scrim. Everything derives from a **4px base unit** — all custom values must be multiples of 4px.

> **Updated 2026-09-29 (verified against code):** Shadow L is the level for dialogs, modals, menus, dropdowns, tooltips and popovers; XL is currently unused; raw leftward Shadow L values are to be written as `var(--shadow-l)`; the shared Canonical spec line now has its own heading instead of sitting under Scrim.

> **Updated 2026-09-29 (aligned to prototype usage):** §3 and §4 now match the code: Medium buttons pad `10px 20px` (`--space-ssm` / `--space-ml`), inputs pad `8px 12px` (`--space-s` / `--space-sm`), and buttons, dialogs and modals round at `--radius-sm` (12px), per `Button.css`, `InputField.css` and `ConfirmModal.css`.

## Usage

These are foundations, not components: there is no `Layout` component, so the Prototype and Production component rows are left out. The tokens live in `src/styles/tokens.css`.

### Spacing

**Intent:** a 4px rhythm so gaps and padding line up across every screen.

**Use when**
- Setting any padding, margin or gap.

**Don't use when**
- Sizing an icon → use the icon size tokens (§5) ([doc](iconography.md))

**Do**
- Use `var(--space-*)` for every value the scale covers, e.g. `padding: var(--space-s) var(--space-sm)`.
- Keep custom values on multiples of 4px; above 40px use the rem step (e.g. `3rem`).
- Tighter spacing inside a group, larger between sections.

**Don't**
- Don't write raw px that a token covers.
- Don't use the micro tokens `--space-xxs` / `--space-xss` / `--space-ssm` (2/6/10px) for layout spacing; they are for inside components.

### Radius

**Intent:** consistent corner roundness that tells surfaces and controls apart.

**Use when**
- Setting any `border-radius`.

**Don't use when**
- Icon-only button hover or avatars → always `var(--radius-full)`, never a square

**Do**
- Buttons, inputs, cards, table rows, dialogs and modals: `var(--radius-sm)` (12px).
- Icon-only buttons: circular `var(--radius-full)` hover background.

**Don't**
- Don't use a squared hover on an icon-only button.
- Don't write a raw radius value.

### Shadows

**Intent:** show elevation with three fixed levels.

**Use when**
- A surface floats above the page: dialogs, modals, menus, dropdowns, tooltips and popovers (L); cards (S).

**Don't use when**
- Separating a filled card from the page in dark mode → `var(--shadow-card)` already drops to none there

**Do**
- Use `var(--shadow-s)` or `var(--shadow-l)` (`var(--shadow-xl)` exists but is currently unused); `var(--shadow-card)` for a `--cards-background` card on `--page-background`; `var(--shadow-panel)` for right-anchored side panels.

**Don't**
- Don't stack shadows or invent in-between levels.

### Scrim

**Intent:** the blocking layer between the page and an overlay, so focus moves to the dialog, modal or drawer.

**Use when**
- The backdrop behind any dialog, modal, side drawer, lightbox or popover blocker.

**Don't use when**
- Darkening an image, hero or video so text on it reads → keep that component's own tint (see §7)

**Do**
- `background: var(--scrim)` on every overlay backdrop.

**Don't**
- Don't hardcode `rgba(15, 16, 20, …)` or derive a one-off alpha for a backdrop; only the token flips between light and dark.

### Canonical spec

**Canonical spec:** spacing `--space-xs` 4 · `--space-s` 8 · `--space-sm` 12 · `--space-m` 16 · `--space-ml` 20 · `--space-l` 24 · `--space-xl` 32 · `--space-xxl` 40 (px); radius `--radius-xs` 4 · `--radius-s` 8 · `--radius-sm` 12 · `--radius-m` 16 · `--radius-ml` 20 · `--radius-l` 24 · `--radius-full`; icons `--icon-size-sm|md|lg|xl` 16/20/24/32; shadows `--shadow-s|l|xl`; `--scrim` Neutral-900 at 25% light / 50% dark. Figma: Library `EC26cSVe9KNTCWXvYovakw`, node ids not recorded.

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
| XXS | 2 | `--space-xxs` | — |
| XS | 4 | `--space-xs` | `--radius-xs` |
| XSS | 6 | `--space-xss` | — |
| S | 8 | `--space-s` | `--radius-s` |
| SSM | 10 | `--space-ssm` | — |
| SM | 12 | `--space-sm` | `--radius-sm` |
| M | 16 | `--space-m` | `--radius-m` |
| ML | 20 | `--space-ml` | `--radius-ml` |
| L | 24 | `--space-l` | `--radius-l` |
| XL | 32 | `--space-xl` | — |
| XXL | 40 | `--space-xxl` | — |
| 0 | 0 | use `0` | use `0` |
| 100 | 100 | use `100px` | — |

XXS / XSS / SSM (2/6/10px) were added 2026-08-26 for micro spacing inside components. They are off the 4px grid on purpose and must not be used for layout spacing.

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
.btn-md  { padding: var(--space-ssm) var(--space-ml); } /* 10px 20px */
.btn-lg  { padding: var(--space-sm) var(--space-l); }   /* 12px 24px */

/* Cards */
.card-sm { padding: var(--space-m); }   /* 16px */
.card-md { padding: var(--space-l); }   /* 24px */

/* Inputs */
.input   { padding: var(--space-s) var(--space-sm); }   /* 8px 12px */
```

### Quick reference

**Component internal spacing**
- Icon ↔ text gap (small button) → `--space-xs` (4px)
- Icon ↔ header gap → `--space-m` (16px)
- Input padding → `--space-s` / `--space-sm` (8px 12px)
- Card padding → `--space-m` compact / `--space-l` standard

**Layout spacing**
- Form element gaps, section gaps → `--space-ml` (20px)
- Page padding, page section gaps → `--space-l` (24px)
- Large section separation → `--space-xl` / `--space-xxl` (32/40px)

## 4. Roundness (border radius)

| Element | Token |
|---|---|
| Buttons | `--radius-sm` (12px) |
| Cards, inputs, tags, badges, dialogs, modals | `--radius-sm` (12px) |
| Large cards | `--radius-m` (16px) |
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
| `--shadow-l` | `-4px 0 24px 0 rgba(32, 34, 42, 0.12)` (Figma Shadow L, leftward) | Dialogs, modals, menus, dropdowns, tooltips, popovers |
| `--shadow-xl` | `0 4px 32px 0 rgba(32, 34, 42, 0.24)` | Currently unused (modals and dialogs use Shadow L) |

```css
:root {
  --shadow-s:  -1px -1px 4px 0 rgba(32, 34, 42, 0.04), 1px 1px 4px 0 rgba(32, 34, 42, 0.04);
  --shadow-l:  -4px 0 24px 0 rgba(32, 34, 42, 0.12);
  --shadow-xl: 0 4px 32px 0 rgba(32, 34, 42, 0.24);
}
```

Code-only extra: `--shadow-card` — Shadow S in light mode, `none` in dark. For a filled card on the page background: in light the two surfaces are one step apart and the fill alone doesn't separate them, in dark they already are. Use it wherever a `--cards-background` card sits directly on `--page-background`.

Code-only extra: `--shadow-panel` (`-24px 0 24px 0 rgba(32, 34, 42, 0.04)`) — leftward shadow for right-anchored side panels. Shadow L itself is leftward in Figma, and the token matches it (re-verified 2026-09-29). A few `filter: drop-shadow()` surfaces (Tooltip and some popovers) cannot take the token and write the same value by hand.

## 7. Overlay scrim

Full-screen backdrop behind dialogs, modals, and side drawers. The base colour is always Neutral-900 `#0F1014`, exposed as the single token `--scrim`, and only the opacity changes per mode:

| Mode | Value |
|---|---|
| Light mode | Neutral-900 @ **25%** — `rgba(15, 16, 20, 0.25)` |
| Dark mode | Neutral-900 @ **50%** — `rgba(15, 16, 20, 0.5)` |

**Usage rule:** every overlay backdrop - dialog, modal, side drawer, lightbox, popover blocker - uses `background: var(--scrim)`. Never hardcode the rgba value, and never derive a one-off alpha: the token is the only thing that flips between modes.

```css
.overlay-backdrop {
  position: fixed;
  inset: 0;
  background: var(--scrim);
  z-index: 1000;
}
```

> **Code note:** `tokens.css` ships both values today. `:root` defines `--scrim` as `rgba(15, 16, 20, 0.25)` and the `[data-theme="dark"]` block overrides it to `rgba(15, 16, 20, 0.5)`. Dark mode is live in the prototype (`data-theme` on `<html>`, driven by `src/hooks/useTheme.ts`), so a literal will not follow the theme - always read `var(--scrim)`.

> **What this is not:** the scrim is the blocking layer between the page and an overlay panel. It is not an image-darkening layer, meaning the gradients and flat tints painted over hero images, banners, and card thumbnails to keep text on top legible. Those are a separate concern, belong to their own component spec, and keep their own alphas - do not replace them with `var(--scrim)`.

See `overlays.md` for the Dialog/Modal/Side-Drawer component specs that sit on top of this scrim.

---

## Best practices

1. Always use the named tokens; never hardcode px values that a token covers.
2. Every custom value must be a multiple of 4px.
3. Smaller spacing for related elements, larger for section separation.
4. One shadow level per surface — don't stack or invent intermediate shadows.
