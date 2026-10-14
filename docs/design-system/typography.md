---
name: 5mins-typography
description: Typography system for 5Mins.ai - Poppins type scale (6 heading levels, body and button sizes), weights 400/500/600/700, line heights, font-size tokens and text color pairing rules. Use for any font-size, weight, or text-style decision.
---

# Typography

One Poppins type scale for every 5Mins.ai screen: 6 heading levels, 3 body sizes in three weights, and 3 button sizes.

**Code:** `src/styles/typography.css` (classes), `--font-size-*` in `src/styles/tokens.css`; Poppins is set on `body` in `src/styles/reset.css` and loaded from Google Fonts in `index.html`. No component.
**Figma:** Library `EC26cSVe9KNTCWXvYovakw`, Typography page `5445:24004`, paragraph styles `5445:24009` (medium row `12132:2824`, semibold row `6634:1291`); type does not change per mode
**Last verified:** 2026-10-14

## Usage

**Intent:** one Poppins type scale so hierarchy reads the same on every screen: weight and size say what a piece of text is, colour says how important it is.

**Use when**
- Any text decision: font size, weight, line height, text colour.

**Don't use when**
- Button labels → sizes come with the Button component ([doc](buttons.md))
- Page or section titles → take the header specs ([doc](headers.md))

**Do**
- Poppins only, weights 400/500/600/700.
- Bold (700) for headings and buttons; Semibold (600) for form-field labels; Medium (500) for emphasis and badge/chip labels; Regular (400) for body.
- Stay on the scale: 12, 14, 16, 20, 24, 32px, written as `var(--font-size-*)`. Round an off-scale size to the nearest step (13px becomes 14px).
- 14px and 16px at line height 1.5; 12px at 1.2 (Button S keeps 1.4).
- Colour with semantic tokens: `--text-primary` headings and key content, `--text-secondary` body, `--text-tertiary` captions and metadata, `--text-disabled` disabled.
- Use semantic `h1`-`h6` elements in order; one `h1` per page.
- Button labels in Title Case; headings and other UI copy in sentence case.

**Don't**
- Don't load or mix another font family.
- Don't use Bold for body paragraphs, or Semibold for option text inside a radio, checkbox or toggle row.
- Don't use raw `--neutral-*` or hex for text colour; it won't flip in dark mode.
- Don't skip heading levels (H1 → H3).
- Don't make body text smaller than 14px; main content is 16px.
- Don't use muted text for important content.

**Canonical spec:** Poppins; H1 32 / H2 24 / H3 20 / H4 16 / H5 14 Bold at 1.5, H6 12 Bold at 1.2; Paragraph L/M/S 16/14/12 at 1.5/1.5/1.2; Button L/M/S 16/14/12 Bold. Field label = Paragraph M semibold. Sizes are `--font-size-*` tokens; run `pnpm lint:css`, which flags raw font sizes.

**Prototype:** `src/styles/typography.css`
- `h1`-`h6` and `.h1`-`.h6`; `.text-lg|md|sm` with `-medium` and `-semibold` variants; `.text-primary|secondary|tertiary|disabled`; `.font-regular|medium|semibold|bold`.

## Figma to code

Figma text styles map to CSS classes; their sizes map to the `--font-size-*` tokens.

| Figma text style | CSS class | Size token | Size | Weight | Line height |
|---|---|---|---|---|---|
| H1 (32) | `h1`, `.h1` | `--font-size-h1` | 32px (2rem) | 700 | 1.5 |
| H2 (24) | `h2`, `.h2` | `--font-size-h2` | 24px (1.5rem) | 700 | 1.5 |
| H3 (20) | `h3`, `.h3` | `--font-size-h3` | 20px (1.25rem) | 700 | 1.5 |
| H4 (16) | `h4`, `.h4` | `--font-size-h4` | 16px (1rem) | 700 | 1.5 |
| H5 (14) | `h5`, `.h5` | `--font-size-h5` | 14px (0.875rem) | 700 | 1.5 |
| H6 (12) | `h6`, `.h6` | `--font-size-h6` | 12px (0.75rem) | 700 | 1.2 |
| Paragraph L regular (16) | `.text-lg` | `--font-size-lg` | 16px | 400 | 1.5 |
| Paragraph M regular (14) | `.text-md` | `--font-size-md` | 14px | 400 | 1.5 |
| Paragraph S regular (12) | `.text-sm` | `--font-size-sm` | 12px | 400 | 1.2 |
| Paragraph L medium | `.text-lg-medium` | `--font-size-lg` | 16px | 500 | 1.5 |
| Paragraph M medium | `.text-md-medium` | `--font-size-md` | 14px | 500 | 1.5 |
| Paragraph S medium | `.text-sm-medium` | `--font-size-sm` | 12px | 500 | 1.2 |
| Paragraph L semibold (16) | `.text-lg-semibold` | `--font-size-lg` | 16px | 600 | 1.5 |
| Paragraph M semibold (14) | `.text-md-semibold` | `--font-size-md` | 14px | 600 | 1.5 |
| Paragraph S semibold (12) | `.text-sm-semibold` | `--font-size-sm` | 12px | 600 | 1.2 |
| Button M (Typography page only) | `.btn-*` labels | `--font-size-button` | 14px | 700 | 1.5 |

- **Figma only:** Button L/M/S are drawn on the Typography page but have no Figma text style; button label sizes come with the `Button` component ([doc](buttons.md)). The Figma Typography variable collection is empty.
- **Code only:** `--font-size-button` (14px, the legacy `.btn-*` label). There are no `.text-body-*`, `.heading-*` or `.text-button-*` classes.

**Production:**

| Design system | `@web/ui` component | Props mapping | Known drift |
|---|---|---|---|
| Typography | _to be mapped by engineering_ | | |

### Known drift

- **H6 line height:** Figma H6 (12) is 140%; code `h6`/`.h6` is 1.2. Don't change either side without a ruling.

## Variants

### Font family

**Primary font:** Poppins (Google Fonts)
- **Weights:** 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold)
- **Fallback:** system fonts (-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif)

> **Every 12px text style has a 120% line height** - H6, Paragraph S, badges, tooltips, captions. **The one exception is Button S, which stays at 140%** so the Small button holds its 33px height. 16px and 14px stay at 150%.

```css
font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
```

### Headings (all Bold, 700)

| Level | Size | Line height | Usage |
|-------|------|-------------|-------|
| **H1** | 32px (2rem) | 1.5 | Course titles, main headers |
| **H2** | 24px (1.5rem) | 1.5 | Page titles (the Page Header renders it as `<h2>`, see `headers.md`), major blocks |
| **H3** | 20px (1.25rem) | 1.5 | Section headers, subsection headers |
| **H4** | 16px (1rem) | 1.5 | Component titles, card headers |
| **H5** | 14px (0.875rem) | 1.5 | Small headers, labels |
| **H6** | 12px (0.75rem) | 1.2 | Micro headers, tags |

**Colour for all headings:** `--text-primary` (#20222A light / #F9F9FA dark)

### Body text (Regular 400 / Medium 500 / Semibold 600)

| Size | Font size | Weights | Line height | Usage |
|------|-----------|---------|-------------|-------|
| **Large** | 16px (1rem) | 400, 500, 600 | 1.5 | Main body content, default text |
| **Medium** | 14px (0.875rem) | 400, 500, 600 | 1.5 | Secondary descriptions, lists, table content |
| **Small** | 12px (0.75rem) | 400, 500, 600 | 1.2 | Captions, help text, timestamps, labels |

**Colour for body text:** `--text-secondary` (#454C5E light / #BFC2CC dark)

**Paragraph medium (500):** subtle emphasis inside body copy, and the label weight of badges and chips.

**Paragraph semibold (600):** sits between Medium and Bold: heavier than emphasis, without reading as a heading.

**Form-field labels use Paragraph M semibold** (14px / 600 / 1.5, `--text-secondary`). Every visible label above (or beside) an input, dropdown, date field, textarea, or stepper - see `input.md`. Option text inside a radio, checkbox, or toggle row is *not* a field label and stays Regular 400.

### Button text (all Bold, 700)

| Size | Font size | Line height | Usage |
|------|-----------|-------------|-------|
| **Large** | 16px (1rem) | 1.5 | Primary CTAs, hero buttons |
| **Medium** | 14px (0.875rem) | 1.5 | Standard buttons (most common) |
| **Small** | 12px (0.75rem) | 1.4 | Compact buttons, tables, toolbars |

All button text is Bold (700) with no text-transform. There are no button text classes; use the `Button` component ([doc](buttons.md)).

### Hierarchy rules

- **H1 (32px):** course titles and main headers. Page titles do not use `<h1>`: the Page Header title is a 24px `<h2>` and Section Header titles are `<h3>` (see `headers.md`).
- **H2 (24px):** page titles and major content divisions. Examples: "Team Dashboard", "Course Library".
- **H3 (20px):** section and subsection headers. Examples: "Your Progress", "Completed Courses", "Learning Objectives".
- **H4 (16px):** component titles: card headers, modal titles. Examples: course card names, dialog headers.
- **H5 (14px):** small component headers: sidebar labels, table headers, navigation section labels.
- **H6 (12px):** micro headers: tags, badges, metadata labels. Use sparingly.

### Body size selection

- **Large (16px):** main content paragraphs, course descriptions, primary readable content.
- **Medium (14px):** secondary descriptions, list items, table content, card descriptions.
- **Small (12px):** captions and help text, timestamps and metadata, footer text, very compact UIs.

### Weight selection

- **Regular (400):** default for body text.
- **Medium (500):** subtle emphasis without bold.
- **Semibold (600):** form-field labels; text that must lead a control without becoming a heading.
- **Bold (700):** headings and buttons only. Never for entire paragraphs.

### Responsive typography

Not implemented: the type scale is the same at every width, and `typography.css` has no media queries.

### Sanctioned component exceptions

These component-level uses sit off the scale on purpose; keep them inside their components and don't copy them elsewhere:
- Avatar group "+N" counter: 8px at 24px and 10px at 32px (`AvatarGroup.css`)
- Badge label: 14px Medium at line height 1.2 (`badges.md`)
- Toast label: Bold 16 on every fill (`alerts-toast.md`)
- Mobile tab bar label: Regular 10px / 1.4 (`navigation.md`)

## Tokens

Font sizes are tokens in `src/styles/tokens.css`:

```css
--font-size-h1: 32px;
--font-size-h2: 24px;
--font-size-h3: 20px;
--font-size-h4: 16px;
--font-size-h5: 14px;
--font-size-h6: 12px;
--font-size-lg: 16px;
--font-size-md: 14px;
--font-size-sm: 12px;
--font-size-button: 14px; /* .btn-* label */
```

Text colour classes in `typography.css`:

```css
.text-primary    /* --text-primary - headings, primary content */
.text-secondary  /* --text-secondary - body text, descriptions */
.text-tertiary   /* --text-tertiary - captions, metadata */
.text-disabled   /* --text-disabled - disabled, deemphasised */
```

Font family, weight and line-height tokens are **not defined**; weights and line heights are written as literals (400/500/600/700; 1.2/1.4/1.5) or come from the classes. Treat these names as proposed only:

```css
--font-family-primary
--font-weight-regular: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
--line-height-tight: 1.2;    /* 12px text (Button S uses 1.4) */
--line-height-compact: 1.4;
--line-height-normal: 1.5;
--line-height-loose: 1.6;
```

### Font loading

Poppins loads from Google Fonts:

```css
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
```

- `display=swap` keeps text visible during font load.
- Falls back to system fonts if the load fails.

## Accessibility

- Primary text (`--text-primary`) on white: AAA.
- Secondary text (`--text-secondary`) on white: AA.
- Tertiary text (`--text-tertiary`) on white: AA.
- Disabled text (`--text-disabled`): use for disabled only.
- Use semantic HTML headings (`h1`-`h6`) in logical order; don't skip levels.
- Line height 1.5 for 16px and 14px body text, 1.2 for 12px text (Button S excepted at 1.4).
- Body text minimum 16px for main content.
- Test with screen readers and on actual devices.

## Examples

```css
/* Standard body text */
.text-secondary  /* default for paragraphs */

/* Form-field labels */
.text-md-semibold .text-secondary

/* Captions and metadata */
.text-sm .text-tertiary

/* Disabled or deemphasised */
.text-disabled
```

**Page header:**
```html
<h1>Team Management</h1>
<p class="text-md text-tertiary">Manage your team's learning progress</p>
```

**Card:**
```html
<h4>Workplace Safety</h4>
<p class="text-md text-secondary">Essential safety protocols</p>
```

**Stats:**
```html
<p class="text-sm text-tertiary">Total Learners</p>
<h2>1,234</h2>
```

**Button:** use the `Button` component; don't style a label with typography classes.

### Quick decisions

**"What heading size for...?"**
- Course title → H1 (32px)
- Page title → 24px `<h2>`
- Section header → 20px (H3 style)
- Card header → H4 (16px)
- Small label → H5 (14px)

**"What body text size for...?"**
- Main content → Large (16px)
- List items → Medium (14px)
- Caption → Small (12px)

**"What font weight for...?"**
- Headings → Bold (700)
- Body text → Regular (400)
- Emphasis → Medium (500)
- Form-field labels → Semibold (600)
- Buttons → Bold (700)

**"What colour for...?"**
- Headings → `--text-primary`
- Body → `--text-secondary`
- Field labels → `--text-secondary`
- Captions and metadata → `--text-tertiary`
- Disabled → `--text-disabled`
- Links → the Link button colour ladder, `--primary-button-background` ([doc](buttons.md))

## Related

- [colors.md](colors.md) - text colour tokens and their light/dark values
- [headers.md](headers.md) - page and section title specs
- [buttons.md](buttons.md) - button label sizes
- [input.md](input.md) - field label rule
