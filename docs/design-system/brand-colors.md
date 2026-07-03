---
name: 5mins-brand-colors
description: 5Mins.ai brand color system and usage guidelines. Use when selecting colors for any 5Mins.ai UI element, determining button colors, choosing status indicator colors, or deciding on text/background colors. Provides the complete color palette including primary cyan, gamification colors for quiz types, semantic colors (success/warning/danger), and neutral grays with specific usage rules for each.
---

# 5Mins.ai Brand Colors

Complete color system for the 5Mins.ai micro-learning platform with usage guidelines.

## Color Philosophy

5Mins.ai uses a structured color system organized by purpose:
- **Primary (Cyan):** Brand identity, main actions, navigation
- **Gamification:** Quiz types and interactive learning
- **Secondary (Yellow):** Highlights and accents (use sparingly)
- **Semantic:** Status indicators (success/warning/danger)
- **Neutral:** Text, backgrounds, borders, structure

## Primary Colors (Cyan Brand)

**Purpose:** Main brand identity, primary actions, navigation, links

### Key Tokens
- `--primary-500` (#00CEE6): Main brand color, primary buttons
- `--primary-600` (#00AFC4): Default button state, links, active navigation
- `--primary-700` (#008393): Hover states for primary elements
- `--primary-800` (#005862): Pressed/active states
- `--primary-100` (#CCF8FD): Secondary button hover backgrounds

### Usage Rules
✓ Primary call-to-action buttons
✓ Navigation active states and links
✓ Progress bars and completion indicators
✓ Brand accent elements
✓ Interactive element highlights

✗ Don't use for warnings or errors
✗ Don't use for text on white backgrounds (insufficient contrast)

### Button Color Mapping
```css
/* Primary Button */
background: var(--primary-600);  /* Default */
background: var(--primary-700);  /* Hover */
background: var(--primary-800);  /* Pressed */

/* Secondary Button (outline) */
color: var(--primary-600);       /* Default */
border: 1px solid var(--primary-600);
background: var(--primary-100);  /* Hover background */
color: var(--primary-700);       /* Hover text */
```

## Gamification Colors

**Purpose:** Quiz types, interactive learning elements, achievements

### Quiz Type Colors
- `--blaze-quiz` (#8158EC): Blaze Quiz - Quick fire questions
- `--flash-poll` (#9B55C9): Flash Poll - Instant feedback polls
- `--lesson-quiz` (#FA715F): Lesson Quiz - Standard assessments
- `--certificate-quiz` (#6368DB): Certificate Quiz - Formal testing
- `--case-study-quiz` (#2A90D8): Case Study - Scenario-based learning

### Usage Rules
✓ Quiz type indicators and badges
✓ Interactive element highlights specific to quiz types
✓ Achievement badges and gamification features
✓ Color-coding for different learning modes

✗ Don't use for general buttons or navigation
✗ Don't mix quiz colors within the same component
✗ Don't use as background for large areas

### Implementation
```css
/* Quiz Badge Examples */
.badge-blaze { background: var(--blaze-quiz); color: white; }
.badge-flash { background: var(--flash-poll); color: white; }
.badge-lesson { background: var(--lesson-quiz); color: white; }
.badge-certificate { background: var(--certificate-quiz); color: white; }
.badge-case-study { background: var(--case-study-quiz); color: white; }
```

## Secondary Colors (Yellow/Gold)

**Purpose:** Active states and selection indicators

### Key Token
- `--secondary-500` (#FFBB38): Active/selected states

### Usage Rules

**Active States (Inputs)**
✓ Dropdown input focus/active state
✓ Search input focus/active state

**Selection States**
✓ Active tabs
✓ Selected checkboxes
✓ Selected radio buttons
✓ Selected chips

✗ Don't use for warnings (use warning-500 instead)
✗ Don't use for primary actions (use primary colors)
✗ Don't use for general highlights or accents

## Semantic Colors

### Success (Green)

**Purpose:** Completions, positive actions, confirmations

#### Key Tokens
- `--success-500` (#18A957): Success buttons, completed states, validation
- `--success-100` (#E8F6EE): Badge backgrounds, light success states

#### Usage Rules
✓ Course completion indicators
✓ Success messages and toast notifications
✓ "Completed" status badges
✓ Positive validation states
✓ Confirmation actions

```css
/* Success Button */
background: var(--success-500);
color: var(--neutral-0);

/* Success Badge */
background: var(--success-100);
color: var(--success-600);
```

### Warning (Orange)

**Purpose:** Caution states, in-progress, attention needed

#### Key Tokens
- `--warning-500` (#FFA538): Warning buttons, caution states
- `--warning-100` (#FFEDD7): Badge backgrounds
- `--text-warning` (#E2A610): Warning text color
- `--warning-bg` (rgba): Warning alert backgrounds

#### Usage Rules
✓ Expiring courses or deadlines approaching
✓ "In Progress" status indicators
✓ Caution messages and alerts
✓ Items requiring attention

```css
/* Warning Button */
background: var(--warning-500);
color: var(--neutral-0);

/* Warning Badge */
background: var(--warning-100);
color: var(--text-warning);

/* Warning Alert */
background: var(--warning-bg);
border-left: 4px solid var(--warning-500);
```

### Danger (Red)

**Purpose:** Errors, destructive actions, critical alerts

#### Key Tokens
- `--danger-500` (#DF1642): Error states, destructive buttons
- `--danger-100` (#FCE8EC): Badge backgrounds, light error states

#### Usage Rules
✓ Delete/remove actions
✓ Error messages and failed states
✓ Failed assessments or overdue items
✓ Critical alerts requiring immediate action

```css
/* Danger Button */
background: var(--danger-500);
color: var(--neutral-0);

/* Danger Badge */
background: var(--danger-100);
color: var(--danger-600);

/* Error Input */
border-color: var(--danger-500);
```

## Neutral Colors (Grays)

**Purpose:** Text hierarchy, backgrounds, borders, UI structure

### Complete Neutral Scale

| Token | Hex | Primary Usage |
|---|---|---|
| `--neutral-900` | `#0F1014` | Deepest dark — sidebar background, nav rail |
| `--neutral-800` | `#20222A` | Primary text, headings |
| `--neutral-700` | `#2D313D` | Secondary surface backgrounds (panels, drawers) |
| `--neutral-600` | `#383D4C` | Elevated surfaces, table headers |
| `--neutral-500` | `#454C5E` | Body text, secondary text |
| `--neutral-400` | `#656B7C` | Tertiary text, placeholders, captions |
| `--neutral-300` | `#9EA4B3` | Disabled text, muted icons |
| `--neutral-200` | `#BFC2CC` | Subtle borders, skeleton loaders |
| `--neutral-100` | `#DFE1E6` | Input borders, dividers, separators |
| `--neutral-50`  | `#EFF0F2` | Hover backgrounds (rows, sidebar items, cards) |
| `--neutral-25`  | `#F9F9FA` | Page background |
| `--neutral-0`   | `#FFFFFF` | Card backgrounds, pure white |

### Text Colors
- `--neutral-800` (`#20222A`): Primary text, headings
- `--neutral-500` (`#454C5E`): Body text, secondary text
- `--neutral-400` (`#656B7C`): Tertiary text, placeholders
- `--neutral-300` (`#9EA4B3`): Disabled text

### Background Colors
- `--neutral-900` (`#0F1014`): Deepest surfaces — sidebar, nav
- `--neutral-700` (`#2D313D`): Panel and drawer backgrounds
- `--neutral-600` (`#383D4C`): Elevated surfaces, table headers
- `--neutral-25`  (`#F9F9FA`): Page background
- `--neutral-0`   (`#FFFFFF`): Card and modal backgrounds
- `--neutral-50`  (`#EFF0F2`): Hover state backgrounds

### Border & Divider Colors
- `--neutral-100` (`#DFE1E6`): Standard borders, dividers
- `--neutral-200` (`#BFC2CC`): Subtle borders, skeleton loaders

### Usage Rules
```css
/* Text Hierarchy */
h1, h2, h3               { color: var(--neutral-800); }
p, body                  { color: var(--neutral-500); }
.caption, ::placeholder  { color: var(--neutral-400); }
.disabled                { color: var(--neutral-300); }

/* Backgrounds */
.sidebar, .nav-rail      { background: var(--neutral-900); }
.panel, .side-drawer     { background: var(--neutral-700); }
.table-header            { background: var(--neutral-600); }
body                     { background: var(--neutral-25); }
.card, .modal            { background: var(--neutral-0); }
.card:hover, .row:hover  { background: var(--neutral-50); }

/* Borders */
input, .card, .divider   { border: 1px solid var(--neutral-100); }
.skeleton                { background: var(--neutral-200); }
```

## Color Selection Quick Reference

### "What color should I use for...?"

**Primary Actions**
- Main CTA button → `--primary-600`
- Button hover → `--primary-700`
- Button pressed → `--primary-800`
- Links → `--primary-600`

**Status Indicators**
- Completed/Success → `--success-500`
- In Progress/Warning → `--warning-500`
- Failed/Error → `--danger-500`

**Active & Selection States**
- Input focus (dropdown, search) → `--secondary-500`
- Active tab → `--secondary-500`
- Selected checkbox/radio → `--secondary-500`
- Selected chip → `--secondary-500`

**Quiz Types**
- Blaze Quiz → `--blaze-quiz`
- Flash Poll → `--flash-poll`
- Lesson Quiz → `--lesson-quiz`
- Certificate → `--certificate-quiz`
- Case Study → `--case-study-quiz`

**Text**
- Headings → `--neutral-800`
- Body text → `--neutral-500`
- Secondary text → `--neutral-400`
- Disabled → `--neutral-300`

**Backgrounds**
- Sidebar / nav rail → `--neutral-900`
- Panel / side drawer → `--neutral-700`
- Table header → `--neutral-600`
- Page → `--neutral-25`
- Cards / modals → `--neutral-0`
- Row / card hover → `--neutral-50`

**Borders**
- Standard borders, dividers → `--neutral-100`
- Subtle borders, skeletons → `--neutral-200`

**Badges**
- Success badge bg → `--success-100`, text → `--success-600`
- Warning badge bg → `--warning-100`, text → `--text-warning`
- Danger badge bg → `--danger-100`, text → `--danger-600`

## Accessibility Guidelines

### Contrast Requirements
- Normal text (16px): Minimum 4.5:1 contrast ratio
- Large text (24px+): Minimum 3:1 contrast ratio

### Safe Combinations
✓ `--neutral-800` on `--neutral-0` (heading on white)
✓ `--neutral-500` on `--neutral-0` (body text on white)
✓ `--neutral-0` on `--primary-600` (white text on primary button)
✓ `--neutral-0` on semantic colors (white on success/warning/danger)
✓ `--neutral-25` on `--neutral-700` (page-bg text on panel/drawer)
✓ `--neutral-300` on `--neutral-800` (disabled text on dark surface)

✗ `--primary-500` on `--neutral-0` (insufficient contrast)
✗ `--neutral-400` on `--neutral-0` for body text (use for secondary only)
✗ `--neutral-400` on `--neutral-600` (insufficient contrast)

## Assets

Complete CSS file with all color tokens: `assets/brand-colors.css`

Import this file to access all brand colors via CSS variables.
