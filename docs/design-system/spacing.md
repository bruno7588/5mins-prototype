
# 5Mins.ai Spacing & Border Radius System

Unified spacing and border radius system for the 5Mins.ai platform using a 4px base unit.

## Spacing Philosophy

5Mins.ai uses a **4px base unit** for all spacing, sizing, padding, margins, border radius, and icon dimensions. This creates visual harmony and consistency across all components.

## Spacing Scale

| Token | rem | px | Usage |
|-------|-----|----|----|
| `xs` | 0.25rem | 4px | Micro spacing, gap between icon and text in Small Buttons |
| `s` | 0.5rem | 8px | Small gaps, icon padding, button padding |
| `sm` | 0.75rem | 12px | Compact spacing |
| `m` | 1rem | 16px | Default spacing, gap between icon and header, card padding |
| `ml` | 1.25rem | 20px | Medium spacing, form gaps, section gaps |
| `l` | 1.5rem | 24px | Medium-large spacing, page padding, page gaps |
| `xl` | 2rem | 32px | Large spacing |
| `xxl` | 2.5rem | 40px | Extra large spacing |

### CSS Variables

```css
:root {
  --space-xs: 0.25rem;   /* 4px */
  --space-s: 0.5rem;     /* 8px */
  --space-sm: 0.75rem;   /* 12px */
  --space-m: 1rem;       /* 16px */
  --space-ml: 1.25rem;   /* 20px */
  --space-l: 1.5rem;     /* 24px */
  --space-xl: 2rem;      /* 32px */
  --space-xxl: 2.5rem;   /* 40px */
}
```

## Component Padding Guidelines

### Buttons

```css
.btn-sm { padding: var(--space-s) var(--space-m); }    /* 8px 16px */
.btn-md { padding: var(--space-sm) var(--space-ml); }  /* 12px 20px */
.btn-lg { padding: var(--space-sm) var(--space-l); }   /* 12px 24px */
```

### Cards

```css
.card-sm { padding: var(--space-m); }   /* 16px */
.card-md { padding: var(--space-l); }   /* 24px */
```

### Inputs

```css
.input { padding: var(--space-sm) var(--space-m); }  /* 12px 16px */
```

## Border Radius System

Based on the 4px system for consistent roundness across components.

### Border Radius Tokens

| Token | rem | px | Usage |
|-------|-----|----|----|
| `none` | 0 | 0px | Sharp corners |
| `xs` | 0.25rem | 4px | Small elements, tags |
| `s` | 0.5rem | 8px | Buttons |
| `sm` | 0.75rem | 12px | Cards, inputs, badges |
| `m` | 1rem | 16px | Large cards, modals |
| `ml` | 1.25rem | 20px | Hero sections |
| `full` | 9999px | - | Circular elements |

### CSS Variables

```css
:root {
  --radius-none: 0;
  --radius-xs: 0.25rem;   /* 4px */
  --radius-s: 0.5rem;     /* 8px */
  --radius-sm: 0.75rem;   /* 12px */
  --radius-m: 1rem;       /* 16px */
  --radius-ml: 1.25rem;   /* 20px */
  --radius-full: 9999px;  /* Circular */
}
```

### Border Radius Usage

```css
/* Buttons */
.btn { border-radius: var(--radius-s); }           /* 8px */

/* Cards */
.card { border-radius: var(--radius-sm); }         /* 12px */

/* Inputs */
.input { border-radius: var(--radius-sm); }        /* 12px */

/* Avatar/Profile images */
.avatar { border-radius: var(--radius-full); }     /* Circular */

/* Badges/Tags */
.tag { border-radius: var(--radius-sm); }          /* 12px */
```

## Quick Reference

### "What spacing should I use for...?"

**Component Internal Spacing**
- Icon to text gap (small button) → `--space-xs` (4px)
- Icon to header gap → `--space-m` (16px)
- Button padding (small) → `--space-s` / `--space-m` (8px 16px)
- Button padding (medium) → `--space-sm` / `--space-ml` (12px 20px)
- Button padding (large) → `--space-sm` / `--space-l` (12px 24px)
- Input padding → `--space-sm` / `--space-m` (12px 16px)
- Card padding (compact) → `--space-m` (16px)
- Card padding (standard) → `--space-l` (24px)

**Layout Spacing**
- Form element gaps → `--space-ml` (20px)
- Section gaps → `--space-ml` (20px)
- Page padding → `--space-l` (24px)
- Page section gaps → `--space-l` (24px)
- Large section separation → `--space-xl` / `--space-xxl` (32px / 40px)

### "What border radius should I use for...?"

- Buttons → `--radius-s` (8px)
- Cards → `--radius-sm` (12px)
- Inputs → `--radius-sm` (12px)
- Tags/Badges → `--radius-sm` (12px)
- Large cards/Modals → `--radius-m` (16px)
- Hero sections → `--radius-ml` (20px)
- Avatars/Pills → `--radius-full` (circular)

## Best Practices

1. **Consistency**: Always use predefined spacing scale tokens
2. **4px Base**: Ensure all custom spacing is a multiple of 4px
3. **Logical Hierarchy**: Use smaller spacing for related elements, larger for sections
4. **Responsive Scaling**: Consider how spacing should adapt on different screen sizes
5. **Component Spacing**: Maintain consistent internal component spacing
6. **Layout Rhythm**: Use consistent spacing between layout sections

## Assets

Complete CSS file with all spacing and border radius tokens: `assets/spacing-system.css`

Import this file to access all spacing and border radius variables.
