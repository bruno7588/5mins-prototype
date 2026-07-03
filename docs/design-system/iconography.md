
# 5Mins.ai Iconography System

Complete icon guidelines for 5Mins.ai using Iconsax React as the primary icon library.

## Overview

5Mins.ai uses **Iconsax React** for all iconography, providing a consistent, professional icon system with two variants (Linear and Bold) and full integration with the design system colors.

## Installation

```bash
npm install iconsax-react
```

## Basic Usage

```jsx
import { Home, User, Settings } from 'iconsax-react';

<Home size="24" color="var(--neutral-800)" />
<Home size="24" color="var(--neutral-800)" variant="Linear" />
<Home size="24" color="var(--primary-600)" variant="Bold" />
```

## Icon Size Scale

Use consistent icon sizes across the application:

| Size | Value | Usage |
|------|-------|-------|
| **Small** | 16px | Small indicators, inline icons, badges |
| **Medium** | 20px | Button icons, form elements, input icons |
| **Large** | 24px | Navigation, headers, cards (default) |
| **Extra Large** | 32px | Large interactive elements, hero sections |

### CSS Variables
```css
--icon-size-sm: 16px;
--icon-size-md: 20px;
--icon-size-lg: 24px;
--icon-size-xl: 32px;
```

### Implementation
```jsx
<InfoCircle size="16" />      /* Small */
<SearchNormal1 size="20" />   /* Medium */
<Home size="24" />            /* Large (default) */
<User size="32" />            /* Extra Large */
```

## Icon Colors

Icons follow the same color system as typography and brand colors.

### Color Guidelines

```jsx
// Primary (interactive, active elements)
<Settings size="24" color="var(--neutral-800)" />

// Secondary (less prominent)
<User size="24" color="var(--neutral-500)" />

// Muted (disabled, inactive)
<ArrowRight size="24" color="var(--neutral-300)" />

// Success state
<TickCircle size="24" color="var(--success-500)" />

// Warning state
<InfoCircle size="24" color="var(--warning-500)" />

// Error state
<CloseCircle size="24" color="var(--danger-500)" />

// Brand/Link
<Home size="24" color="var(--primary-600)" />
```

### Color Reference

| State | Color Variable | Usage |
|-------|---------------|-------|
| Primary | `--neutral-800` | Interactive elements |
| Secondary | `--neutral-500` | Supporting elements |
| Muted | `--neutral-300` | Disabled/inactive |
| Success | `--success-500` | Success states |
| Warning | `--warning-500` | Warnings |
| Danger | `--danger-500` | Errors, delete |
| Brand | `--primary-600` | Brand elements |

## Icon Variants

### Linear (Default)
Use for most UI elements, default states, general interface icons.

```jsx
<Home size="24" color="var(--neutral-800)" variant="Linear" />
```

**Usage:**
- Default navigation items
- Form field icons
- General UI elements
- Inactive states

### Bold
Use for active states, selected items, emphasis.

```jsx
<Home size="24" color="var(--primary-600)" variant="Bold" />
```

**Usage:**
- Active navigation items
- Selected states
- Important actions
- Emphasized elements

## Common Patterns

### Navigation Icons

```jsx
// Inactive
<Home 
  size="24" 
  color="var(--neutral-500)" 
  variant="Linear" 
/>

// Active
<Home 
  size="24" 
  color="var(--primary-600)" 
  variant="Bold" 
/>
```

### Button Icons

```jsx
// Primary button with icon
<button className="btn-primary">
  <ArrowRight size="20" color="white" />
  Continue
</button>

// Icon button
<button className="icon-button">
  <Settings size="24" color="var(--neutral-800)" />
</button>
```

### Interactive Icon Hover States

When an icon is used as a standalone clickable element (e.g. close button, action icon), the hover background must always be **circular** (`border-radius: 50%`), never squared.

```css
/* Icon button hover — ALWAYS use border-radius: 50% */
.icon-button {
  display: flex;
  padding: 4px;
  border-radius: 50%;
  background: none;
  border: none;
  cursor: pointer;
  transition: background 150ms ease;
}

.icon-button:hover {
  background: var(--neutral-50);
}
```

✓ Always use `border-radius: 50%` for icon hover backgrounds
✗ Never use squared corners (`border-radius: 4px` or `8px`) for icon hover states

### Input Icons

```jsx
// Search input
<div className="input-with-icon">
  <SearchNormal1 size="20" color="var(--neutral-500)" />
  <input placeholder="Search..." />
</div>
```

### Status Icons

```jsx
// Success
<TickCircle size="20" color="var(--success-500)" variant="Bold" />

// Warning
<InfoCircle size="20" color="var(--warning-500)" variant="Linear" />

// Error
<CloseCircle size="20" color="var(--danger-500)" variant="Linear" />
```

### Quiz Type Icons

```jsx
// Blaze Quiz
<Flash size="24" color="var(--blaze-quiz)" variant="Bold" />

// Lesson Quiz
<Book1 size="24" color="var(--lesson-quiz)" variant="Linear" />

// Certificate Quiz
<Award size="24" color="var(--certificate-quiz)" variant="Bold" />

// Case Study Quiz
<DocumentText size="24" color="var(--case-study-quiz)" variant="Linear" />
```

## Commonly Used Icons

### Navigation
- `Home` - Dashboard, home page
- `Book1` - Courses, learning
- `Profile2User` - Team, users
- `Setting2` - Settings
- `NotificationBing` - Notifications

### Actions
- `Add` - Add, create
- `Edit` - Edit
- `Trash` - Delete
- `Eye` - View
- `Download` - Download
- `Share` - Share

### Status
- `TickCircle` - Success, completed
- `InfoCircle` - Information, warning
- `CloseCircle` - Error, failed
- `Clock` - Pending, in progress

### Form Elements
- `SearchNormal1` - Search
- `Calendar` - Date picker
- `Location` - Location
- `Sms` - Email
- `Lock` - Password

### Content Types
- `Video` - Video content
- `Image` - Images
- `DocumentText` - Documents
- `MicrophoneSlash` - Audio

## Best Practices

### 1. Consistency
Always use Iconsax React icons for visual consistency.

### 2. Size Standards
Stick to defined sizes: 16, 20, 24, 32px.

### 3. Color Harmony
Use colors from the design system palette (CSS variables).

### 4. Semantic Meaning
Choose icons that clearly represent their function.

### 5. Accessibility
Provide aria-labels for icon-only buttons.

```jsx
<button aria-label="Delete course">
  <Trash size="20" color="var(--danger-500)" />
</button>
```

### 6. Performance
Import only the icons you need.

```jsx
// ✓ Good
import { Home, User } from 'iconsax-react';

// ✗ Bad
import * as Icons from 'iconsax-react';
```

### 7. Variant Usage
- **Linear:** Default states
- **Bold:** Active/selected states

## Icon Size Guidelines

| Context | Size | Example |
|---------|------|---------|
| Badge | 16px | Small indicator |
| Button | 20px | Icon in button |
| Form input | 20px | Search icon |
| Navigation | 24px | Sidebar nav |
| Card header | 24px | Card title icon |
| Hero section | 32px | Large feature icon |

## Quick Decisions

**"What icon size for...?"**
- Navigation → 24px
- Button → 20px
- Form input → 20px
- Badge/indicator → 16px
- Hero/feature → 32px

**"What icon color for...?"**
- Active element → `--neutral-800`
- Inactive element → `--neutral-500`
- Disabled → `--neutral-300`
- Success → `--success-500`
- Warning → `--warning-500`
- Error → `--danger-500`

**"What variant for...?"**
- Default state → Linear
- Active/selected → Bold
- Emphasis → Bold
- Standard UI → Linear

## Resources

**Complete CSS Utilities:** `assets/iconography.css`
- Icon size scale variables
- Icon color variables
- Common icon patterns
- Icon container utilities

**Detailed Usage Guidelines:** `references/usage-guidelines.md`
- Comprehensive examples
- All common patterns
- Accessibility guidelines
- Complete icon reference

**Icon Documentation:**
- [Iconsax React Docs](https://iconsax-react.pages.dev/)
- [Iconsax Icon Library](https://iconsax.io/)

## Integration with Design System

Icons integrate seamlessly with:
- **5mins-brand-colors:** All icon colors reference color tokens
- **5mins-typography:** Icons sized to complement text
- **Components:** Icons used in buttons, inputs, navigation

## Common Mistakes to Avoid

### Don't:
✗ Use non-standard sizes (e.g., 23px)
✗ Use arbitrary colors outside the palette
✗ Mix icon libraries
✗ Forget accessibility labels
✗ Use Bold variant everywhere
✗ Import entire icon library

### Do:
✓ Use standard sizes (16, 20, 24, 32px)
✓ Use CSS color variables
✓ Stick to Iconsax React
✓ Add aria-labels to icon buttons
✓ Use Linear as default, Bold for active
✓ Import only needed icons
