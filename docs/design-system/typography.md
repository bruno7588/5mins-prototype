
# 5Mins.ai Typography System

Complete typography guidelines for 5Mins.ai using Poppins font family with a clear, semantic type scale.

## Overview

5Mins.ai uses Poppins as the primary font for all text, providing a modern, clean, and highly readable experience across all interfaces. The system includes 6 heading levels, 3 body text sizes, and 3 button text sizes with consistent weights and line heights.

## Font Family

**Primary Font:** Poppins (Google Fonts)
- **Weights:** 400 (Regular), 500 (Medium), 700 (Bold)
- **Fallback:** System fonts (-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif)

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
| **H6** | 12px (0.75rem) | 1.4 | Micro headers, tags |

**Color for all headings:** `--neutral-800` (#20222A)

### Body Text (Regular 400 / Medium 500)

| Size | Font Size | Weights | Line Height | Usage |
|------|-----------|---------|-------------|-------|
| **Large** | 16px (1rem) | 400, 500 | 1.5 | Main body content, default text |
| **Medium** | 14px (0.875rem) | 400, 500 | 1.5 | Secondary descriptions, lists |
| **Small** | 12px (0.75rem) | 400, 500 | 1.4 | Captions, help text, labels |

**Color for body text:** `--neutral-500` (#454C5E)

### Button Text (All Bold, 700 weight)

| Size | Font Size | Line Height | Usage |
|------|-----------|-------------|-------|
| **Large** | 16px (1rem) | 1.5 | Primary CTAs, hero buttons |
| **Medium** | 14px (0.875rem) | 1.5 | Standard buttons (most common) |
| **Small** | 12px (0.75rem) | 1.2 | Compact buttons, toolbars |

## CSS Classes

### Headings
```css
.heading-1  /* or use <h1> */
.heading-2  /* or use <h2> */
.heading-3  /* or use <h3> */
.heading-4  /* or use <h4> */
.heading-5  /* or use <h5> */
.heading-6  /* or use <h6> */
```

### Body Text
```css
/* Large (16px) */
.text-body-l          /* Regular weight */
.text-body-l-regular  /* Regular weight (explicit) */
.text-body-l-medium   /* Medium weight */

/* Medium (14px) */
.text-body-m          /* Regular weight */
.text-body-m-regular  /* Regular weight (explicit) */
.text-body-m-medium   /* Medium weight */

/* Small (12px) */
.text-body-s          /* Regular weight */
.text-body-s-regular  /* Regular weight (explicit) */
.text-body-s-medium   /* Medium weight */
```

### Button Text
```css
.text-button-l  /* 16px, Bold */
.text-button-m  /* 14px, Bold */
.text-button-s  /* 12px, Bold */
```

### Text Colors
```css
.text-primary    /* neutral-800 - Headings, primary content */
.text-secondary  /* neutral-500 - Body text, descriptions */
.text-label      /* neutral-400 - Labels, captions, placeholders */
.text-muted      /* neutral-300 - Disabled, deemphasized */
.text-link       /* primary-600 - Links (with hover state) */
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

/* Form labels */
.text-body-m-medium .text-secondary

/* Captions and metadata */
.text-body-s .text-label

/* Disabled or deemphasized */
.text-muted
```

### Common Combinations

**Page Header:**
```html
<h1 class="heading-1">Team Management</h1>
<p class="text-body-m text-label">Manage your team's learning progress</p>
```

**Card:**
```html
<h4 class="heading-4">Workplace Safety</h4>
<p class="text-body-m text-secondary">Essential safety protocols</p>
```

**Stats:**
```html
<p class="text-body-s text-label">Total Learners</p>
<h2 class="heading-2">1,234</h2>
```

**Button:**
```html
<button class="btn-primary text-button-m">Continue Learning</button>
```

## Responsive Typography

### Tablet (≤768px)
- H1: 32px → 28px
- H2: 24px → 22px
- Other sizes remain consistent

### Mobile (≤480px)
- H1: 32px → 24px
- H2: 24px → 20px
- Body text maintains 16px minimum for readability

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
✓ Line height 1.5 for body text (optimal readability)
✓ Body text minimum 16px for main content
✓ Test with screen readers

## Font Loading

The typography system loads Poppins from Google Fonts:

```css
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700&display=swap');
```

**Strategy:**
- Uses `display=swap` for better performance
- Text visible during font load (FOIT prevention)
- Falls back to system fonts if load fails

## CSS Custom Properties

All typography values available as CSS variables:

```css
/* Font families */
--font-family-primary

/* Font weights */
--font-weight-regular: 400;
--font-weight-medium: 500;
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
--line-height-tight: 1.2;
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
- Buttons → Bold (700)

**"What color for...?"**
- Headings → text-primary (neutral-800)
- Body → text-secondary (neutral-500)
- Labels → text-label (neutral-400)
- Disabled → text-muted (neutral-300)

## Resources

**Complete Typography CSS:** `assets/typography.css`
- All font imports
- Complete type scale
- All utility classes
- Responsive adjustments

**Detailed Usage Guidelines:** `references/usage-guidelines.md`
- Comprehensive examples
- Common patterns
- Semantic usage rules
- Accessibility guidelines
- Mobile considerations

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
✗ Ignore responsive adjustments
