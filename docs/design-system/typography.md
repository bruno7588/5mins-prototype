---
name: 5mins-typography
description: Typography system for 5Mins.ai — Poppins type scale (6 heading levels, body and button sizes), weights 400/500/600/700, line heights, and text color pairing rules. Use for any font-size, weight, or text-style decision.
---

# 5Mins.ai Typography System

Complete typography guidelines for 5Mins.ai using Poppins font family with a clear, semantic type scale.

> **Updated 2026-09-29 (aligned to prototype usage):** heading and body colours are the semantic tokens `--text-primary` / `--text-secondary` used in `src/styles/typography.css` (were raw `--neutral-800` / `--neutral-500`, which don't flip in dark mode). The "CSS Custom Properties" list is marked as not defined in `tokens.css`.

> **Updated 2026-09-29 (verified against code):** removed the `.text-button-*` classes (they don't exist) and the responsive size steps (not implemented, off-scale); field labels are `--text-secondary`, not tertiary; removed links to `assets/typography.css` and `references/usage-guidelines.md` (neither exists); listed the sanctioned off-scale component exceptions.

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
- Stay on the scale: 12, 14, 16, 20, 24, 32px. Round an off-scale size to the nearest step (13px becomes 14px).
- 14px and 16px at line height 1.5; 12px at 1.2 (Button S keeps 1.4).
- Colour with semantic tokens: `--text-primary` headings and key content, `--text-secondary` body, `--text-tertiary` captions and metadata, `--text-disabled` disabled.
- Use semantic `h1`-`h6` elements in order; one `h1` per page.
- Button labels in Title Case; headings and other UI copy in sentence case.

**Don't**
- Don't load or mix another font family.
- Don't use Bold for body paragraphs, or Semibold for option text inside a radio, checkbox or toggle row.
- Don't use raw `--neutral-*` or hex for text colour; it won't flip in dark mode.
- Don't skip heading levels.

**Canonical spec:** Poppins; H1 32 / H2 24 / H3 20 / H4 16 / H5 14 Bold at 1.5, H6 12 Bold at 1.2; Paragraph L/M/S 16/14/12 at 1.5/1.5/1.2; Button L/M/S 16/14/12 Bold. Field label = Paragraph M semibold. The prototype writes these as literal px in component CSS (no font tokens exist). Figma: Library `EC26cSVe9KNTCWXvYovakw`, paragraph styles `5445:24009`; light/dark node ids not recorded (type does not change per mode).

**Prototype:** `src/styles/typography.css` (no component)
- `h1`-`h6` and `.h1`-`.h6`; `.text-lg|md|sm` with `-medium` and `-semibold` variants; `.text-primary|secondary|tertiary|disabled`; `.font-regular|medium|semibold|bold`.
- Poppins is set on `body` in `src/styles/reset.css` and loaded from Google Fonts in `index.html`.

**Production:**

| Design system | `@web/ui` component | Props mapping | Known drift |
|---|---|---|---|
| Typography | _to be mapped by engineering_ | | |

## Overview

5Mins.ai uses Poppins as the primary font for all text, providing a modern, clean, and highly readable experience across all interfaces. The system includes 6 heading levels, 3 body text sizes, and 3 button text sizes with consistent weights and line heights.

## Font Family

**Primary Font:** Poppins (Google Fonts)
- **Weights:** 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold)
- **Fallback:** System fonts (-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif)

> **Every 12px text style has a 120% line height** — H6, Paragraph S, badges, tooltips, captions. **The one exception is Button S, which stays at 140%** so the Small button holds its 33px height. 16px and 14px stay at 150%.

```css
font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
```

## Type Scale

### Headings (All Bold, 700 weight)

| Level | Size | Line Height | Usage |
|-------|------|-------------|-------|
| **H1** | 32px (2rem) | 1.5 | Page titles, main headers |
| **H2** | 24px (1.5rem) | 1.5 | Section headers, major blocks |
| **H3** | 20px (1.25rem) | 1.5 | Subsection headers |
| **H4** | 16px (1rem) | 1.5 | Component titles, card headers |
| **H5** | 14px (0.875rem) | 1.5 | Small headers, labels |
| **H6** | 12px (0.75rem) | 1.2 | Micro headers, tags |

**Color for all headings:** `--text-primary` (#20222A light / #F9F9FA dark)

### Body Text (Regular 400 / Medium 500 / Semibold 600)

| Size | Font Size | Weights | Line Height | Usage |
|------|-----------|---------|-------------|-------|
| **Large** | 16px (1rem) | 400, 500, 600 | 1.5 | Main body content, default text |
| **Medium** | 14px (0.875rem) | 400, 500, 600 | 1.5 | Secondary descriptions, lists |
| **Small** | 12px (0.75rem) | 400, 500, 600 | 1.2 | Captions, help text, labels |

**Color for body text:** `--text-secondary` (#454C5E light / #BFC2CC dark)

### Paragraph Medium (500)

Figma Library `5445:24009` (row `12132:2824`, verified 2026-08-26). Subtle emphasis inside body copy, and the label weight of badges and chips.

| Style | Font Size | Weight | Line Height |
|-------|-----------|--------|-------------|
| **Paragraph L medium** | 16px (1rem) | 500 | 1.5 |
| **Paragraph M medium** | 14px (0.875rem) | 500 | 1.5 |
| **Paragraph S medium** | 12px (0.75rem) | 500 | 1.2 |

### Paragraph Semibold (600)

Figma Library `5445:24009` (row `6634:1291`, verified 2026-08-26). Semibold sits between Medium and Bold: heavier than emphasis, without reading as a heading.

| Style | Font Size | Weight | Line Height |
|-------|-----------|--------|-------------|
| **Paragraph L semibold** | 16px (1rem) | 600 | 1.5 |
| **Paragraph M semibold** | 14px (0.875rem) | 600 | 1.5 |
| **Paragraph S semibold** | 12px (0.75rem) | 600 | 1.2 |

**Form-field labels use Paragraph M semibold.** Every visible label above (or beside) an input, dropdown, date field, textarea, or stepper — see `input.md`. Option text inside a radio, checkbox, or toggle row is *not* a field label and stays Regular 400.

### Button Text (All Bold, 700 weight)

| Size | Font Size | Line Height | Usage |
|------|-----------|-------------|-------|
| **Large** | 16px (1rem) | 1.5 | Primary CTAs, hero buttons |
| **Medium** | 14px (0.875rem) | 1.5 | Standard buttons (most common) |
| **Small** | 12px (0.75rem) | 1.4 | Compact buttons, toolbars |

## CSS Classes

### Headings
```css
h1–h6            /* semantic elements carry the style */
.h1 … .h6        /* same styles on any element */
```

### Paragraph (3 sizes × 3 weights)
```css
/* Regular 400 */
.text-lg           /* 16px, 1.5 */
.text-md           /* 14px, 1.5 */
.text-sm           /* 12px, 1.2 */

/* Medium 500 — subtle emphasis, badge/chip labels */
.text-lg-medium
.text-md-medium
.text-sm-medium

/* Semibold 600 — form-field labels use .text-md-semibold */
.text-lg-semibold
.text-md-semibold
.text-sm-semibold

/* Weight only */
.font-regular  .font-medium  .font-semibold  .font-bold
```

> These are the names implemented in `src/styles/typography.css`. There are no `.text-body-*` or `.heading-*` classes — use the `h1`–`h6` elements or `.h1`–`.h6`.

### Button Text

There are no button text classes; button label sizes (Button L/M/S, 16/14/12 Bold) come with the `Button` component ([doc](buttons.md)).

### Text Colors
```css
.text-primary    /* neutral-800 - Headings, primary content */
.text-secondary  /* neutral-500 - Body text, descriptions */
.text-tertiary   /* neutral-400 - Captions, metadata */
.text-disabled   /* neutral-300 - Disabled, deemphasized */
```

## Usage Guidelines

### Hierarchy Rules

**H1 - Page Titles**
- Use once per page
- Main page identifier
- Examples: "Team Dashboard", "Course Library"

**H2 - Section Headers**
- Major content divisions
- Examples: "Your Progress", "Course Overview"

**H3 - Subsection Headers**
- Content groups within H2 sections
- Examples: "Completed Courses", "Learning Objectives"

**H4 - Component Titles**
- Card headers, modal titles
- Examples: Course card names, dialog headers

**H5 - Small Component Headers**
- Sidebar labels, table headers
- Examples: Navigation section labels

**H6 - Micro Headers**
- Tags, badges, metadata labels
- Use sparingly for very small text

### Body Text Selection

**Use Large (16px) for:**
- Main content paragraphs
- Course descriptions
- Primary readable content

**Use Medium (14px) for:**
- Secondary descriptions
- List items
- Table content
- Card descriptions

**Use Small (12px) for:**
- Captions and help text
- Timestamps and metadata
- Footer text
- Very compact UIs

### Weight Selection

**Regular (400):** Default for body text
**Medium (500):** Subtle emphasis without bold
**Semibold (600):** Form-field labels; text that must lead a control without becoming a heading
**Bold (700):** Headings and buttons only

### Button Text Guidelines

- **Large buttons:** Primary CTAs, hero sections
- **Medium buttons:** Standard interface buttons (most common)
- **Small buttons:** Compact interfaces, tables, toolbars

All button text is bold (700) with no text-transform.

## Text Color Patterns

### Headings
Always use `.text-primary` (neutral-800) for all headings to maintain clear hierarchy.

### Body Content
```css
/* Standard body text */
.text-secondary  /* Default for paragraphs */

/* Form-field labels */
.text-md-semibold .text-secondary

/* Captions and metadata */
.text-sm .text-tertiary

/* Disabled or deemphasized */
.text-disabled
```

### Common Combinations

**Page Header:**
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

## Responsive typography

Not implemented: the type scale is the same at every width, and `typography.css` has no media queries. The older tablet and mobile steps listed here (28px, 22px) were off the type scale and have been removed.

## Sanctioned component exceptions

These component-level uses sit off the scale on purpose; keep them inside their components and don't copy them elsewhere:
- Avatar group "+N" counter: 8px at 24px and 10px at 32px (`AvatarGroup.css`)
- Badge label: 14px Medium at line height 1.2 (`badges.md`)
- Toast label: Bold 16 on every fill (`alerts-toast.md`)
- Mobile tab bar label: Regular 10px / 1.4 (`navigation.md`)

## Accessibility

### Contrast Requirements Met
- Primary text (neutral-800) on white: ✓ AAA
- Secondary text (neutral-500) on white: ✓ AA
- Label text (neutral-400) on white: ✓ AA
- Muted text (neutral-300): Use for disabled only

### Best Practices
✓ Use semantic HTML headings (h1-h6)
✓ Maintain logical heading order
✓ Don't skip heading levels
✓ Line height 1.5 for 16px and 14px body text, 1.2 for 12px text (Button S excepted at 1.4)
✓ Body text minimum 16px for main content
✓ Test with screen readers

## Font Loading

The typography system loads Poppins from Google Fonts:

```css
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
```

**Strategy:**
- Uses `display=swap` for better performance
- Text visible during font load (FOIT prevention)
- Falls back to system fonts if load fails

## CSS Custom Properties

These variables are **not defined** in `src/styles/tokens.css`; the prototype writes sizes and weights as literal px in component CSS, or uses the classes above. Treat the list as proposed naming only:

```css
/* Font families */
--font-family-primary

/* Font weights */
--font-weight-regular: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;

/* Font sizes - Headings */
--font-size-h1: 32px;
--font-size-h2: 24px;
--font-size-h3: 20px;
--font-size-h4: 16px;
--font-size-h5: 14px;
--font-size-h6: 12px;

/* Font sizes - Body */
--font-size-body-l: 16px;
--font-size-body-m: 14px;
--font-size-body-s: 12px;

/* Font sizes - Buttons */
--font-size-button-l: 16px;
--font-size-button-m: 14px;
--font-size-button-s: 12px;

/* Line heights */
--line-height-tight: 1.2;    /* 12px text (Button S uses 1.4) */
--line-height-compact: 1.4;
--line-height-normal: 1.5;
--line-height-loose: 1.6;
```

## Quick Decisions

**"What heading size for...?"**
- Page title → H1 (32px)
- Section header → H2 (24px)
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

**"What color for...?"**
- Headings → text-primary (neutral-800)
- Body → text-secondary (neutral-500)
- Field labels → text-secondary (neutral-500)
- Captions and metadata → text-tertiary (neutral-400)
- Disabled → text-disabled (neutral-300)

## Resources

**Implemented classes:** `src/styles/typography.css`

## Best Practices

### Do:
✓ Use semantic heading hierarchy
✓ Apply text colors consistently
✓ Use medium weight for subtle emphasis
✓ Test on actual devices
✓ Maintain line-height for readability
✓ Use Poppins for brand consistency

### Don't:
✗ Skip heading levels (H1 → H3)
✗ Use muted text for important content
✗ Make body text smaller than 14px
✗ Use bold for entire paragraphs
✗ Mix font families

