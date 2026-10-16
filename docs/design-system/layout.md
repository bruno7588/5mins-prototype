---
name: 5mins-layout
description: 5Mins.ai layout foundations in one file - the 4px spacing scale (padding, margins, gaps), border radius (roundness), icon sizes, shadows (S/L/XL), and the overlay scrim with dark/light-mode opacities. Use when setting any spacing, padding, margin, gap, corner radius, icon size, box-shadow, or overlay backdrop. Token names mirror the Figma variables. Single source for shadow and scrim values.
---

# Layout

Layout foundations: spacing, roundness, padding, margins, icon sizes, shadows, and the overlay scrim. Everything derives from a **4px base unit** - all custom layout values must be multiples of 4px.

**Code:** tokens in `src/styles/tokens.css`; no component (there is no `Layout` component)
**Figma:** Library `EC26cSVe9KNTCWXvYovakw`, Spacing page `5446:24541`, Shadow page `5446:24653`, Utilities page `5446:24691` (overlay); variable collection Padding/Spacing/Roundness
**Last verified:** 2026-10-16

## Usage

### Spacing

**Intent:** a 4px rhythm so gaps and padding line up across every screen.

**Use when**
- Setting any padding, margin or gap.

**Don't use when**
- Sizing an icon → use the icon size tokens ([doc](iconography.md))

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

**Do**
- Use `var(--shadow-s)` or `var(--shadow-l)` (`var(--shadow-xl)` exists but is currently unused); `var(--shadow-card)` for a `--cards-background` card on `--page-background`; `var(--shadow-panel)` for right-anchored side panels.
- Write raw leftward Shadow L values as `var(--shadow-l)`.

**Don't**
- Don't stack shadows or invent in-between levels.

### Scrim

**Intent:** the blocking layer between the page and an overlay, so focus moves to the dialog, modal or drawer.

**Use when**
- The backdrop behind any dialog, modal, side drawer, lightbox or popover blocker.

**Don't use when**
- Darkening an image, hero or video so text on it reads → keep that component's own tint (see Overlay scrim below). Exception: an image crop preview dims the part that won't be kept with `var(--scrim)` (File uploader Image state)

**Do**
- `background: var(--scrim)` on every overlay backdrop.

**Don't**
- Don't hardcode `rgba(15, 16, 20, …)` or derive a one-off alpha for a backdrop; only the token flips between light and dark.

**Canonical spec:** spacing `--space-xs` 4 · `--space-s` 8 · `--space-sm` 12 · `--space-m` 16 · `--space-ml` 20 · `--space-l` 24 · `--space-xl` 32 · `--space-xxl` 40 (px); radius `--radius-xs` 4 · `--radius-s` 8 · `--radius-sm` 12 · `--radius-m` 16 · `--radius-ml` 20 · `--radius-l` 24 · `--radius-full`; icons `--icon-size-sm|md|lg|xl` 16/20/24/32; shadows `--shadow-s|l|xl`; `--scrim` Neutral-900 at 25% light / 50% dark.

## Figma to code

The Figma number variables and their CSS tokens. The same Figma scale drives **both** spacing and radius. The Figma variables carry WEB code syntax `var(--token)` matching `tokens.css`.

| Figma variable | px | Spacing token | Radius token | Usage |
|---|---|---|---|---|
| XXS | 2 | `--space-xxs` | - | Hairline gaps, focus-ring offset, badge inner gap (micro only) |
| XS | 4 | `--space-xs` | `--radius-xs` | Micro gaps, icon-to-text gap (small buttons) |
| XSS | 6 | `--space-xss` | - | Compact chip/badge padding, tight icon nudges (micro only) |
| S | 8 | `--space-s` | `--radius-s` | Small gaps, icon padding, button padding |
| SSM | 10 | `--space-ssm` | - | Button padding-y (M), compact control padding (micro only) |
| SM | 12 | `--space-sm` | `--radius-sm` | Compact spacing, input padding-x |
| M | 16 | `--space-m` | `--radius-m` | Default spacing, card padding, icon-header gap |
| ML | 20 | `--space-ml` | `--radius-ml` | Form gaps, section gaps |
| L | 24 | `--space-l` | `--radius-l` | Page padding, page gaps |
| XL | 32 | `--space-xl` | - | Large spacing |
| XXL | 40 | `--space-xxl` | - | Extra-large spacing |
| 0 | 0 | use `0` | use `0` | |
| 100 | 100 | use `100px` | - | |

XXS / XSS / SSM (2/6/10px) are for micro spacing inside components. They are off the 4px grid on purpose and must not be used for layout spacing.

| Figma effect style | CSS token | Value |
|---|---|---|
| Shadow S | `--shadow-s` | `-1px -1px 4px 0 rgba(32, 34, 42, 0.04), 1px 1px 4px 0 rgba(32, 34, 42, 0.04)` |
| Shadow L | `--shadow-l` | `-4px 0 24px 0 rgba(32, 34, 42, 0.12)` (leftward) |
| Shadow XL | `--shadow-xl` | `0 4px 32px 0 rgba(32, 34, 42, 0.24)` |

- **Figma only:** the `0` and `100` variables (no CSS token); the Inner-shadow effect style (`inner -4,-4 r0 #2D313D`, "Use this effect in Learning Path cards", no CSS token); the Breakpoints collection (XS 320, S 600, M 900, L 1200, XL 1536), which code does not use as tokens.
- **Code only:** `--radius-full: 9999px` for circular elements (avatars, pills, badges, chips, icon-button hover backgrounds; icon-only buttons **always** use circular hover, never squared); `--icon-size-sm|md|lg|xl`; `--shadow-card`, `--shadow-panel`, `--shadow-sticky`.
- **Scrim:** `--scrim` maps to the Figma colour variable `Surface colours / Scrim` (`VariableID:12522:2259`, WEB syntax `var(--scrim)`), Neutral-900 at 25% light / 50% dark.

**Production:**

| Design system | `@web/ui` component | Props mapping | Known drift |
|---|---|---|---|
| Spacing, radius, shadow tokens | _to be mapped by engineering_ | | |

### Known drift

- **Shadow page annotation:** the Figma Shadow page labels Shadow L `4px 4px 24px`; the effect style and code are `-4px 0 24px`. The effect style is right.
- **Spacing page ladder:** the Figma Spacing page lists 48, 56, 64, 72, 80, 96 and 160 (no variables) and omits 2/6/10 (which have variables).

## Variants

### The 4px scale

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

Values above 40px have no named token - use the rem value directly (e.g. `3rem` for 48px section gaps).

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

**Component internal spacing**
- Icon ↔ text gap (small button) → `--space-xs` (4px)
- Icon ↔ header gap → `--space-m` (16px)
- Input padding → `--space-s` / `--space-sm` (8px 12px)
- Card padding → `--space-m` compact / `--space-l` standard

**Layout spacing**
- Form element gaps, section gaps → `--space-ml` (20px)
- Page padding, page section gaps → `--space-l` (24px)
- Large section separation → `--space-xl` / `--space-xxl` (32/40px)

### Roundness (border radius)

| Element | Token |
|---|---|
| Buttons | `--radius-sm` (12px) |
| Cards, inputs, tags, dialogs, modals | `--radius-sm` (12px) |
| Large cards | `--radius-m` (16px) |
| Hero sections | `--radius-ml` (20px) |
| Avatars, pills, badges, circular icon-button hover | `--radius-full` |
| Small elements, tags | `--radius-xs` (4px) |

### Icon sizes

Iconsax React icons come in exactly four sizes - never others:

| Size | Token | Usage |
|---|---|---|
| 16px | `--icon-size-sm` | Small indicators, inline icons, badges |
| 20px | `--icon-size-md` | Button icons, form elements, input icons |
| 24px | `--icon-size-lg` | Navigation, headers, cards (default) |
| 32px | `--icon-size-xl` | Large interactive elements, hero sections |

See `iconography.md` for icon usage, variants, and colour rules.

### Shadows

Three elevation levels per the Figma styles:

| Token | Usage |
|---|---|
| `--shadow-s` | Cards, table rows - subtle all-around lift |
| `--shadow-l` | Dialogs, modals, menus, dropdowns, tooltips, popovers |
| `--shadow-xl` | Currently unused (modals and dialogs use Shadow L) |

`--shadow-card` is Shadow S in both modes, matching the Figma cards. Use it wherever a `--cards-background` card sits directly on `--page-background`.

`--shadow-panel` (`-24px 0 24px 0 rgba(32, 34, 42, 0.04)`) is the leftward shadow for right-anchored side panels. Shadow L itself is leftward in Figma, and the token matches it. A few `filter: drop-shadow()` surfaces (Tooltip and some popovers) cannot take the token and write the same value by hand.

`--shadow-sticky` (`4px 0 24px 0 rgba(32, 34, 42, 0.12)`, dark `rgba(0, 0, 0, 0.48)`) is Shadow L cast rightward, for a table's frozen first column once scrolled.

### Overlay scrim

Full-screen backdrop behind dialogs, modals, and side drawers. The base colour is always Neutral-900 `#0F1014`, exposed as the single token `--scrim`, and only the opacity changes per mode:

| Mode | Value |
|---|---|
| Light mode | Neutral-900 @ **25%** - `rgba(15, 16, 20, 0.25)` |
| Dark mode | Neutral-900 @ **50%** - `rgba(15, 16, 20, 0.5)` |

**Usage rule:** every overlay backdrop - dialog, modal, side drawer, lightbox, popover blocker - uses `background: var(--scrim)`. Never hardcode the rgba value, and never derive a one-off alpha: the token is the only thing that flips between modes.

```css
.overlay-backdrop {
  position: fixed;
  inset: 0;
  background: var(--scrim);
  z-index: 1000;
}
```

> **Code note:** `tokens.css` defines `--scrim` as `rgba(15, 16, 20, 0.25)` in `:root` and overrides it to `rgba(15, 16, 20, 0.5)` in the `[data-theme="dark"]` block. Dark mode is live in the prototype (`data-theme` on `<html>`, driven by `src/hooks/useTheme.ts`), so a literal will not follow the theme - always read `var(--scrim)`.

> **What this is not:** the scrim is the blocking layer between the page and an overlay panel. It is not an image-darkening layer, meaning the gradients and flat tints painted over hero images, banners, and card thumbnails to keep text on top legible. Those are a separate concern, belong to their own component spec, and keep their own alphas - do not replace them with `var(--scrim)`. The one exception is the image crop preview (File uploader Image state), where `var(--scrim)` dims the part of the image outside the crop square.

See `overlays.md` for the Dialog/Modal/Side-Drawer component specs that sit on top of this scrim.

## Tokens

All values live in `src/styles/tokens.css` (spacing, radius, icon sizes, shadows, `--scrim`); read them there rather than copying them.

Best practices:
1. Always use the named tokens; never hardcode px values that a token covers.
2. Every custom layout value must be a multiple of 4px.
3. Smaller spacing for related elements, larger for section separation.
4. One shadow level per surface - don't stack or invent intermediate shadows.

## Accessibility

- The scrim blocks the page behind an overlay; pair it with the overlay's focus trap and focus return (`overlays.md`).

## Related

- [colors.md](colors.md) - `--scrim` and surface tokens
- [iconography.md](iconography.md) - icon usage
- [overlays.md](overlays.md) - Dialog, Modal, Side Drawer
- [buttons.md](buttons.md) - button padding and heights
