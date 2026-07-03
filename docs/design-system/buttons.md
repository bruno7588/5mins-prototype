
# 5Mins.ai Button Component System

Complete button implementation guide for the 5Mins.ai micro-learning platform with all variants, states, sizes, and accessibility patterns.

## Button Architecture

The 5Mins.ai button system uses a **variant-based architecture** with these dimensions:

| Dimension | Options |
|-----------|---------|
| **Variant** | Filled, Outlined, Outlined-2, Text, Link |
| **Semantic** | Primary, Danger, Warning, Success, AI |
| **Size** | Small (33px), Medium (41px), Large (48px) |
| **State** | Enabled, Hover, Pressed, Disabled, Loading |
| **Icon** | With icon (leading), Without icon |

## Primary Variants

### Filled (Default)
Solid background with the brand cyan color. Use for primary actions.

```css
/* Primary Filled */
.btn-filled {
  background: var(--primary-600);     /* #00AFC4 - Default */
  color: var(--neutral-0);            /* #FFFFFF */
  border: none;
}
.btn-filled:hover {
  background: var(--primary-700);     /* #008393 */
}
.btn-filled:active {
  background: var(--primary-800);     /* #005862 */
}
.btn-filled:disabled {
  background: var(--neutral-100);     /* #DFE1E6 */
  color: var(--neutral-300);          /* #9EA4B3 */
}
```

### Outlined
Border with transparent background. Use for secondary actions.

```css
/* Primary Outlined */
.btn-outlined {
  background: transparent;
  color: var(--primary-600);          /* #00AFC4 */
  border: 1px solid var(--primary-600);
}
.btn-outlined:hover {
  background: var(--primary-100);     /* #CCF8FD */
  color: var(--primary-700);
  border-color: var(--primary-700);
}
.btn-outlined:active {
  background: var(--primary-200);
  color: var(--primary-800);
}
.btn-outlined:disabled {
  color: var(--neutral-300);
  border-color: var(--neutral-100);
}
```

### Outlined-2
Neutral outline at rest, cyan tint on interaction. Use for tertiary actions where you want a quieter default than the primary Outlined button but still want the brand color to surface on hover/press.

Source: Figma Library node `11609:8315` (Enabled / Hover / Pressed).

```css
/* Enabled */
.btn-outlined-2 {
  background: transparent;
  color: var(--text-primary);              /* --neutral-800 */
  border: 1px solid var(--text-primary);
}

/* Hover */
.btn-outlined-2:hover {
  background: rgba(0, 206, 230, 0.16);     /* primary-500 @ 16% */
  color: var(--primary-600);               /* #00AFC4 */
  border-color: var(--primary-600);
}

/* Pressed */
.btn-outlined-2:active {
  background: rgba(0, 206, 230, 0.16);
  color: var(--primary-700);               /* #008393 */
  border-color: var(--primary-700);
}

.btn-outlined-2:disabled {
  color: var(--neutral-300);
  border-color: var(--neutral-100);
  background: transparent;
}
```

**Notes**
- The default border uses `--text-primary` (dark neutral), **not** `--neutral-100`. Earlier versions of this doc were wrong on this — verify against the Figma library if in doubt.
- Hover background `rgba(0, 206, 230, 0.16)` is `--primary-500` at 16% opacity. There's no semantic token for it yet — inline the rgba.
- Padding for the **Medium** size is `10px 20px` (not `12px 20px` like other variants), to land on the 41px height shown in the Figma library. 10px is off the 4px scale, but matches the design intentionally.

### Text
No background or border, just text. Use for inline or subtle actions.

```css
.btn-text {
  background: transparent;
  color: var(--primary-600);
  border: none;
  padding-left: 0;
  padding-right: 0;
}
.btn-text:hover {
  color: var(--primary-700);
}
.btn-text:active {
  color: var(--primary-800);
}
```

### Link
Text with underline. Use for navigation-like actions within content.

```css
.btn-link {
  background: transparent;
  color: var(--primary-600);
  border: none;
  text-decoration: underline;
  padding: 0;
}
.btn-link:hover {
  color: var(--primary-700);
}
```

## Semantic Variants

### Danger (Destructive Actions)
Use for delete, remove, or destructive operations.

```css
/* Danger Filled */
.btn-danger {
  background: var(--danger-500);      /* #DF1642 */
  color: var(--neutral-0);
}
.btn-danger:hover {
  background: var(--danger-600);      /* #9C0F2E */
}
.btn-danger:active {
  background: var(--danger-700);      /* #59091A */
}

/* Danger Outlined */
.btn-danger-outlined {
  background: transparent;
  color: var(--danger-500);
  border: 1px solid var(--danger-500);
}

/* Danger Text */
.btn-danger-text {
  background: transparent;
  color: var(--danger-500);
  border: none;
}
```

### Warning (Caution Actions)
Use for actions that require confirmation or have consequences.

```css
/* Warning Filled */
.btn-warning {
  background: var(--warning-500);     /* #FFA538 */
  color: var(--neutral-0);
}
.btn-warning:hover {
  background: var(--warning-600);     /* #E88206 */
}

/* Warning Outlined */
.btn-warning-outlined {
  background: transparent;
  color: var(--warning-500);
  border: 1px solid var(--warning-500);
}

/* Warning Text */
.btn-warning-text {
  background: transparent;
  color: var(--warning-500);
  border: none;
}
```

### Success (Positive Actions)
Use for confirmations, completions, or positive outcomes.

```css
/* Success Filled */
.btn-success {
  background: var(--success-500);     /* #18A957 */
  color: var(--neutral-0);
}
.btn-success:hover {
  background: var(--success-600);     /* #11763D */
}

/* Success Outlined */
.btn-success-outlined {
  background: transparent;
  color: var(--success-500);
  border: 1px solid var(--success-500);
}

/* Success Text */
.btn-success-text {
  background: transparent;
  color: var(--success-500);
  border: none;
}
```

### AI (AI-Powered Features)
Use for Hugo AI interactions and AI-powered features. Uses the Blaze Quiz purple.

```css
/* AI Filled */
.btn-ai {
  background: var(--blaze-quiz);      /* #8158EC */
  color: var(--neutral-0);
}
.btn-ai:hover {
  background: #6B45D1;                /* Darker purple */
}

/* AI Outlined */
.btn-ai-outlined {
  background: transparent;
  color: var(--blaze-quiz);
  border: 1px solid var(--blaze-quiz);
}
```

## Size System

All sizes use the 5Mins.ai spacing system (4px base unit).

| Size | Height | Padding | Font Size | Icon Size | Border Radius |
|------|--------|---------|-----------|-----------|---------------|
| **Small** | 33px | 8px 16px | 12px (H6) | 16px | 8px |
| **Medium** | 41px | 12px 20px | 14px (H5) | 20px | 8px |
| **Large** | 48px | 12px 24px | 16px (H4) | 24px | 8px |

```css
.btn-sm {
  height: 33px;
  padding: var(--space-s) var(--space-m);    /* 8px 16px */
  font-size: 12px;
  line-height: 1.4;
  gap: var(--space-xs);                       /* 4px icon gap */
}

.btn-md {
  height: 41px;
  padding: var(--space-sm) var(--space-ml);   /* 12px 20px */
  font-size: 14px;
  line-height: 1.5;
  gap: var(--space-s);                        /* 8px icon gap */
}

.btn-lg {
  height: 48px;
  padding: var(--space-sm) var(--space-l);    /* 12px 24px */
  font-size: 16px;
  line-height: 1.5;
  gap: var(--space-s);                        /* 8px icon gap */
}
```

## Icon Support

Icons appear as **leading icons** (before text). Use Iconsax icons from the 5Mins.ai icon system.

```tsx
<Button icon={<Add size={20} />}>Add Course</Button>
```

Icon sizing follows button size:
- **Small button**: 16px icon
- **Medium button**: 20px icon  
- **Large button**: 24px icon

## Loading State

Loading state replaces button content with a spinner while preserving button width.

```css
.btn-loading {
  position: relative;
  color: transparent;
  pointer-events: none;
}

.btn-loading::after {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

## React TypeScript Implementation

```tsx
import { ReactNode, ButtonHTMLAttributes } from 'react';

type ButtonVariant = 
  | 'filled' 
  | 'outlined' 
  | 'outlined-2' 
  | 'text' 
  | 'link';

type ButtonSemantic = 
  | 'primary' 
  | 'danger' 
  | 'warning' 
  | 'success' 
  | 'ai';

type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  semantic?: ButtonSemantic;
  size?: ButtonSize;
  icon?: ReactNode;
  loading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = 'filled',
  semantic = 'primary',
  size = 'md',
  icon,
  loading = false,
  disabled,
  children,
  className,
  ...props
}: ButtonProps) {
  const baseClass = 'btn';
  const variantClass = `btn-${variant}`;
  const semanticClass = semantic !== 'primary' ? `btn-${semantic}` : '';
  const sizeClass = `btn-${size}`;
  const loadingClass = loading ? 'btn-loading' : '';
  
  return (
    <button
      className={[
        baseClass,
        variantClass,
        semanticClass,
        sizeClass,
        loadingClass,
        className
      ].filter(Boolean).join(' ')}
      disabled={disabled || loading}
      {...props}
    >
      {icon && <span className="btn-icon">{icon}</span>}
      <span className="btn-label">{children}</span>
    </button>
  );
}
```

## Usage Guidelines

### Variant Selection

**Use Filled for:**
- Primary call-to-action
- Most important action on the page
- Form submissions
- Starting courses

**Use Outlined for:**
- Secondary actions
- Cancel buttons (paired with Filled)
- Alternative options

**Use Outlined-2 for:**
- Tertiary actions
- Less prominent options
- Neutral actions

**Use Text for:**
- Inline actions
- Subtle interactions
- "Learn more" type links

**Use Link for:**
- Navigation within content
- Breadcrumb-style navigation

### Semantic Selection

**Primary (Cyan):** Default for most actions
**Danger (Red):** Delete, remove, destructive actions
**Warning (Orange):** Actions requiring confirmation
**Success (Green):** Positive confirmations, mark complete
**AI (Purple):** Hugo AI interactions, AI-powered features

### Size Selection

**Large:** Hero sections, primary CTAs, modal footers
**Medium:** Standard buttons (most common), forms
**Small:** Tables, compact UIs, secondary actions

## Accessibility

### Required Attributes

```tsx
// Always include descriptive text
<Button>Save Changes</Button>

// For icon-only buttons, use aria-label
<Button icon={<Trash />} aria-label="Delete item" />

// Loading state announcement
<Button loading aria-busy="true">
  Submitting...
</Button>

// Disabled state
<Button disabled aria-disabled="true">
  Not Available
</Button>
```

### Focus States

All buttons must have visible focus indicators:

```css
.btn:focus-visible {
  outline: 2px solid var(--primary-600);
  outline-offset: 2px;
}
```

### Color Contrast

All button color combinations meet WCAG AA standards:
- White text on colored backgrounds: ✓
- Colored text on white backgrounds: ✓ (except primary-500)

## Common Patterns

### Primary + Secondary Pair

```tsx
<div className="btn-group">
  <Button variant="outlined">Cancel</Button>
  <Button variant="filled">Save Changes</Button>
</div>
```

### Destructive Action Confirmation

```tsx
<div className="btn-group">
  <Button variant="outlined">Cancel</Button>
  <Button semantic="danger">Delete Course</Button>
</div>
```

### Loading Form Submit

```tsx
<Button loading={isSubmitting} type="submit">
  {isSubmitting ? 'Saving...' : 'Save'}
</Button>
```

### Button with Icon

```tsx
<Button icon={<Add size={20} />}>
  Add Team Member
</Button>
```

## Quick Reference

### "What button should I use for...?"

| Action | Variant | Semantic | Size |
|--------|---------|----------|------|
| Main CTA | Filled | Primary | Large |
| Form submit | Filled | Primary | Medium |
| Cancel | Outlined | Primary | Medium |
| Delete | Filled | Danger | Medium |
| Secondary option | Outlined-2 | Primary | Medium |
| Inline link | Link | Primary | - |
| AI feature | Filled | AI | Medium |
| Mark complete | Filled | Success | Medium |

### Button States Cheatsheet

| State | Background | Text | Border | Cursor |
|-------|------------|------|--------|--------|
| Enabled | Normal | Normal | Normal | pointer |
| Hover | Darker | Normal | Darker | pointer |
| Pressed | Darkest | Normal | Darkest | pointer |
| Disabled | Gray | Muted | Gray | not-allowed |
| Loading | Normal | Hidden | Normal | wait |

## Assets

Complete CSS implementation: `assets/buttons.css`

Import this file for the full button system including all variants, sizes, and states.
