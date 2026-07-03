# 5Mins.ai Design System Guidelines

> **For Cursor / AI Code Assistants:** This is the single source of truth for generating UI code for 5Mins.ai. Follow these rules strictly. When building any component, find the relevant section below and match every token, spacing value, and pattern exactly. Do not improvise values — use only what is defined here.

---

## Table of Contents

1. [Brand Identity](#1-brand-identity)
2. [Color System](#2-color-system)
3. [Typography](#3-typography)
4. [Spacing System](#4-spacing-system)
5. [Border Radius](#5-border-radius)
6. [Iconography](#6-iconography)
7. [Buttons](#7-buttons)
8. [Badges](#8-badges)
9. [Headers](#9-headers)
10. [Lesson Cards](#10-lesson-cards)
11. [Overlays — Dialog, Modal, Side Drawer](#11-overlays)
12. [Accessibility Requirements](#12-accessibility-requirements)
13. [Quick Decision Reference](#13-quick-decision-reference)

---

## 1. Brand Identity

5Mins.ai is a B2B micro-learning platform for enterprise customers in compliance-heavy industries (hospitality, finance, healthcare). The visual language is clean, modern, and professional with a distinctive cyan brand color. The UI prioritises clarity, readability, and a consistent learning experience across web and mobile.

**Tech stack context:** React TypeScript, CSS with design tokens (CSS custom properties). Icon library: Iconsax React. Font: Poppins via Google Fonts.

---

## 2. Color System

### 2.1 Primary Brand (Cyan)

Used for main actions, navigation, links, and progress indicators.

| Token | Hex | Usage |
|-------|-----|-------|
| `--primary-500` | #00CEE6 | Main brand color |
| `--primary-600` | #00AFC4 | Default button state, links, active nav |
| `--primary-700` | #008393 | Hover states |
| `--primary-800` | #005862 | Pressed/active states |
| `--primary-100` | #CCF8FD | Secondary button hover bg |

**Rules:**
- Never use `--primary-500` for text on white backgrounds (fails WCAG contrast).
- Never use primary cyan for warnings or errors.
- Button mapping: Default → `--primary-600`, Hover → `--primary-700`, Pressed → `--primary-800`.

### 2.2 Secondary (Yellow/Gold)

| Token | Hex | Usage |
|-------|-----|-------|
| `--secondary-500` | #FFBB38 | Active/selected states only |

Used exclusively for: active tabs, selected checkboxes/radios, selected chips, input focus/active borders (dropdown, search). Never use for warnings (use `--warning-500`) or primary actions (use primary cyan).

### 2.3 Gamification Colors

Quiz type and interactive learning element colors:

| Token | Hex | Usage |
|-------|-----|-------|
| `--blaze-quiz` | #8158EC | Blaze Quiz — quick fire questions, AI features |
| `--flash-poll` | #9B55C9 | Flash Poll — instant feedback polls |
| `--lesson-quiz` | #FA715F | Lesson Quiz — standard assessments |
| `--certificate-quiz` | #6368DB | Certificate Quiz — formal testing |
| `--case-study-quiz` | #2A90D8 | Case Study — scenario-based learning |

**Rules:** Don't use for general buttons/navigation. Don't mix quiz colors within the same component. Don't use as background for large areas.

### 2.4 Semantic Colors

| Category | Token | Hex | Usage |
|----------|-------|-----|-------|
| Success | `--success-500` | #18A957 | Completion, positive, confirmation |
| Success light | `--success-100` | #E8F6EE | Badge backgrounds |
| Success text | `--text-success` | #18A957 | Success text, completed labels, positive validation |
| Warning | `--warning-500` | #FFA538 | Caution, in-progress, attention |
| Warning light | `--warning-100` | #FFEDD7 | Badge backgrounds |
| Warning text | `--text-warning` | #E2A610 | Warning text color |
| Danger | `--danger-500` | #DF1642 | Errors, destructive, critical |
| Danger light | `--danger-100` | #FCE8EC | Badge backgrounds |
| Danger secondary | `--danger-400` | #E95C7B | "New" badge solid fill |
| Error text | `--text-error` | #DF1642 | Error messages, failed validation, destructive labels |

### 2.5 Neutral Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--neutral-900` | #0F1014 | Overlay backdrop base |
| `--neutral-800` / `--text-primary` | #20222A | Headings, primary text |
| `--neutral-500` / `--text-secondary` (light) | #454C5E | Body text |
| `--neutral-400` / `--text-tertiary` | #656B7C | Secondary/tertiary text, placeholders |
| `--neutral-300` | #9EA4B3 | Disabled text |
| `--neutral-100` | #DFE1E6 | Borders, dividers |
| `--neutral-50` | #EFF0F2 | Card hover bg |
| `--neutral-25` | #F9F9FA | Page background |
| `--neutral-0` | #FFFFFF | Card backgrounds |

### 2.6 Overlay Tokens

Used in overlays, modals, and similar UI surfaces:

| Token | Hex | Usage |
|-------|-----|-------|
| `--page-background` | #20222A | Overlay panel surfaces |
| `--text-primary` (dark) | #F9F9FA | Titles on dark bg |
| `--text-secondary` (dark) | #BFC2CC | Descriptions on dark bg |
| `--text-tertiary` (dark) | #8E94A4 | Metadata on dark bg |
| `--border` (dark) | #383D4C | Dividers on dark bg |
| `--input-background` | rgba(69, 76, 94, 0.16) | Input fields on dark bg |

### 2.7 CSS Variables Template

```css
:root {
  /* Primary */
  --primary-100: #CCF8FD;
  --primary-500: #00CEE6;
  --primary-600: #00AFC4;
  --primary-700: #008393;
  --primary-800: #005862;

  /* Secondary */
  --secondary-500: #FFBB38;

  /* Gamification */
  --blaze-quiz: #8158EC;
  --flash-poll: #9B55C9;
  --lesson-quiz: #FA715F;
  --certificate-quiz: #6368DB;
  --case-study-quiz: #2A90D8;

  /* Semantic */
  --success-100: #E8F6EE;
  --success-500: #18A957;
  --text-success: #18A957;
  --warning-100: #FFEDD7;
  --warning-500: #FFA538;
  --text-warning: #E2A610;
  --danger-100: #FCE8EC;
  --danger-400: #E95C7B;
  --danger-500: #DF1642;
  --text-error: #DF1642;

  /* Neutrals */
  --neutral-900: #0F1014;
  --neutral-800: #20222A;
  --neutral-500: #454C5E;
  --neutral-400: #656B7C;
  --neutral-300: #9EA4B3;
  --neutral-100: #DFE1E6;
  --neutral-50: #EFF0F2;
  --neutral-25: #F9F9FA;
  --neutral-0: #FFFFFF;
}
```

---

## 3. Typography

### 3.1 Font Family

**Primary:** Poppins (Google Fonts), weights 400 (Regular), 500 (Medium), 700 (Bold).
**Fallback:** -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif.

```css
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700&display=swap');

font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
```

### 3.2 Type Scale — Headings

All headings use **Bold (700)** weight, color `--neutral-800` (#20222A).

| Level | Size | Line Height | Usage |
|-------|------|-------------|-------|
| H1 | 32px (2rem) | 1.5 | Course titles |
| H2 | 24px (1.5rem) | 1.5 | Page titles |
| H3 | 20px (1.25rem) | 1.5 | Section headers |
| H4 | 16px (1rem) | 1.5 | Card headers, component titles |
| H5 | 14px (0.875rem) | 1.5 | Small headers, labels |
| H6 | 12px (0.75rem) | 1.4 | Tags, micro headers |

### 3.3 Type Scale — Body Text

Body text uses **Regular (400)** or **Medium (500)** weight, color `--neutral-500` (#454C5E).

| Size | Font Size | Line Height | Usage |
|------|-----------|-------------|-------|
| Large | 16px (1rem) | 1.5 | Main body content, descriptions |
| Medium | 14px (0.875rem) | 1.5 | Secondary text, list items, table content |
| Small | 12px (0.75rem) | 1.4 | Captions, help text, timestamps |

### 3.4 Type Scale — Buttons

All button text uses **Bold (700)** weight, no text-transform.

| Size | Font Size | Line Height |
|------|-----------|-------------|
| Large | 16px | 1.5 |
| Medium | 14px | 1.5 |
| Small | 12px | 1.2 |

### 3.5 Text Color Hierarchy

| Role | Token | Hex |
|------|-------|-----|
| Headings / primary | `--neutral-800` | #20222A |
| Body / secondary | `--neutral-500` | #454C5E |
| Labels / tertiary | `--neutral-400` | #656B7C |
| Disabled / muted | `--neutral-300` | #9EA4B3 |
| Links | `--primary-600` | #00AFC4 |

### 3.6 Responsive Typography

- Tablet (≤768px): H1 → 28px, H2 → 22px
- Mobile (≤480px): H1 → 24px, H2 → 20px, minimum body text 16px

### 3.7 Typography Rules

- Use semantic heading hierarchy; never skip heading levels.
- Bold (700) is reserved for headings and buttons only.
- Medium (500) is for subtle emphasis within body text.
- Never make body text smaller than 14px. Minimum for main content is 16px.
- Never use bold for entire paragraphs.
- Never mix font families; always use Poppins.

---

## 4. Spacing System

All spacing uses a **4px base unit**. Every padding, margin, gap, and size value must be a multiple of 4px.

### 4.1 Spacing Scale

| Token | rem | px | Usage |
|-------|-----|----|----|
| `--space-xs` | 0.25rem | 4px | Micro gaps, icon-to-text gap (small buttons) |
| `--space-s` | 0.5rem | 8px | Small gaps, icon padding, button padding |
| `--space-sm` | 0.75rem | 12px | Compact spacing, input padding-y |
| `--space-m` | 1rem | 16px | Default spacing, card padding, icon-header gap |
| `--space-ml` | 1.25rem | 20px | Form gaps, section gaps |
| `--space-l` | 1.5rem | 24px | Page padding, page gaps |
| `--space-xl` | 2rem | 32px | Large spacing |
| `--space-xxl` | 2.5rem | 40px | Extra-large spacing |

### 4.2 Component Padding

| Component | Padding |
|-----------|---------|
| Button Small | 8px 16px (`--space-s` `--space-m`) |
| Button Medium | 12px 20px (`--space-sm` `--space-ml`) |
| Button Large | 12px 24px (`--space-sm` `--space-l`) |
| Input | 12px 16px (`--space-sm` `--space-m`) |
| Card (compact) | 16px (`--space-m`) |
| Card (standard) | 24px (`--space-l`) |

### 4.3 Layout Spacing

| Context | Value |
|---------|-------|
| Form element gaps | 20px (`--space-ml`) |
| Section gaps | 20px (`--space-ml`) |
| Page padding | 24px (`--space-l`) |
| Page section gaps | 24px (`--space-l`) |
| Large section separation | 32–40px (`--space-xl` / `--space-xxl`) |

### 4.4 CSS Variables

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

---

## 5. Border Radius

| Token | rem | px | Usage |
|-------|-----|----|----|
| `--radius-none` | 0 | 0px | Sharp corners |
| `--radius-xs` | 0.25rem | 4px | Small elements, tags |
| `--radius-s` | 0.5rem | 8px | Buttons |
| `--radius-sm` | 0.75rem | 12px | Cards, inputs, badges/tags, overlay panels |
| `--radius-m` | 1rem | 16px | Large cards, modals |
| `--radius-ml` | 1.25rem | 20px | Hero sections |
| `--radius-full` | 9999px | — | Circular elements (avatars, pills, badge pills) |

### CSS Variables

```css
:root {
  --radius-none: 0;
  --radius-xs: 0.25rem;   /* 4px */
  --radius-s: 0.5rem;     /* 8px */
  --radius-sm: 0.75rem;   /* 12px */
  --radius-m: 1rem;       /* 16px */
  --radius-ml: 1.25rem;   /* 20px */
  --radius-full: 9999px;
}
```

### Quick Reference

| Element | Radius |
|---------|--------|
| Buttons | `--radius-s` (8px) |
| Cards | `--radius-sm` (12px) |
| Inputs | `--radius-sm` (12px) |
| Tags/Badges | `--radius-sm` (12px) |
| Badge pills | `--radius-full` (40px) |
| Modals & Dialog | `--radius-sm` (12px) |
| Large cards | `--radius-m` (16px) |
| Hero sections | `--radius-ml` (20px) |
| Avatars | `--radius-full` (circular) |

---

## 6. Iconography

### 6.1 Icon Library

Use **Iconsax React** as the sole icon library. Never mix icon libraries. The one exception is `IoCloseOutline` and `IoInformationCircleOutline` from **Ionicons 5** (used in overlays and informative badges).

```bash
npm install iconsax-react react-icons
```

```jsx
import { Home, User, Settings } from 'iconsax-react';

<Home size="24" color="var(--neutral-800)" variant="Linear" />
```

### 6.2 Icon Sizes

Only use these four sizes. Never use non-standard sizes (e.g. 18px, 23px).

| Size | Value | Usage |
|------|-------|-------|
| Small | 16px | Small indicators, inline icons, badges |
| Medium | 20px | Button icons, form elements |
| Large | 24px | Navigation, headers, cards (default) |
| Extra Large | 32px | Hero sections, large interactive elements |

### 6.3 Icon Variants

| Variant | When to Use |
|---------|-------------|
| **Linear** (outline) | Default state for most UI elements, inactive states |
| **Bold** (filled) | Active/selected states, emphasis, important actions |

**Pattern:** Navigation items use Linear when inactive, Bold when active.

### 6.4 Icon Colors

| State | Color Token | Hex |
|-------|-------------|-----|
| Interactive / primary | `--neutral-800` | #20222A |
| Supporting / secondary | `--neutral-500` | #454C5E |
| Disabled / inactive | `--neutral-300` | #9EA4B3 |
| Success | `--success-500` | #18A957 |
| Warning | `--warning-500` | #FFA538 |
| Error / danger | `--danger-500` | #DF1642 |
| Brand / link | `--primary-600` | #00AFC4 |

### 6.5 Common Icons

| Category | Icons |
|----------|-------|
| **Navigation** | `Home`, `Book1`, `Profile2User`, `Setting2`, `NotificationBing` |
| **Actions** | `Add`, `Edit`, `Trash`, `Eye`, `Download`, `Share` |
| **Status** | `TickCircle` (success), `InfoCircle` (warning), `CloseCircle` (error), `Clock` (pending) |
| **Forms** | `SearchNormal1`, `Calendar`, `Location`, `Sms`, `Lock` |
| **Content** | `Video`, `Image`, `DocumentText`, `MicrophoneSlash` |
| **Quiz types** | `Flash` (blaze), `Book1` (lesson), `Award` (certificate), `DocumentText` (case study) |

### 6.6 Icon Accessibility

- Always provide `aria-label` for icon-only buttons.
- Import only needed icons, never the entire library.

```jsx
// ✓ Good
import { Home, User } from 'iconsax-react';
// ✗ Bad
import * as Icons from 'iconsax-react';
```

---

## 7. Buttons

### 7.1 Button Variants

| Variant | Style | Usage |
|---------|-------|-------|
| **Filled** | Solid background | Primary CTA, most important action |
| **Outlined** | Primary-colored border, transparent bg | Secondary actions |
| **Outlined-2** | Neutral border, transparent bg | Tertiary actions |
| **Text** | No border/bg, text only | Inline/subtle actions |
| **Link** | Text with underline | Navigation-like actions in content |

### 7.2 Semantic Types

| Type | Color | Usage |
|------|-------|-------|
| **Primary** | Cyan (`--primary-600`) | Default for most actions |
| **Danger** | Red (`--danger-500`) | Delete, remove, destructive |
| **Warning** | Orange (`--warning-500`) | Actions requiring confirmation |
| **Success** | Green (`--success-500`) | Confirmations, mark complete |
| **AI** | Purple (`--blaze-quiz` #8158EC) | Hugo AI interactions |

### 7.3 Button Sizes

| Size | Height | Padding | Font | Icon Size | Border Radius |
|------|--------|---------|------|-----------|---------------|
| Small | 33px | 8px 16px | 12px Bold | 16px | 8px |
| Medium | 41px | 12px 20px | 14px Bold | 20px | 8px |
| Large | 48px | 12px 24px | 16px Bold | 24px | 8px |

### 7.4 Button States

| State | Filled Primary | Outlined Primary |
|-------|---------------|-----------------|
| Enabled | bg: `--primary-600`, text: white | border/text: `--primary-600`, bg: transparent |
| Hover | bg: `--primary-700` | bg: `--primary-100`, border/text: `--primary-700` |
| Pressed | bg: `--primary-800` | bg: `--primary-100`, border/text: `--primary-800` |
| Disabled | bg: `--neutral-100`, text: `--neutral-300`, cursor: not-allowed | border: `--neutral-100`, text: `--neutral-300` |
| Loading | Content hidden, spinner shown, preserves width, pointer-events: none | Same |

### 7.5 Button Icon Placement

Icons appear as **trailing icons** (after text). Icon size matches button size tier (Small→16px, Medium→20px, Large→24px). Gap between icon and text: 4px (Small), 8px (Medium/Large).

### 7.6 Button Patterns

- **Primary + Secondary pair:** Outlined (Cancel) + Filled (Save)
- **Destructive confirmation:** Outlined (Cancel) + Danger Filled (Delete)
- **Focus indicator:** `outline: 2px solid var(--primary-600); outline-offset: 2px;`

### 7.7 CSS Implementation

```css
/* Filled Primary */
.btn-filled {
  background: var(--primary-600);
  color: var(--neutral-0);
  border: none;
  border-radius: var(--radius-s);
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  cursor: pointer;
}
.btn-filled:hover { background: var(--primary-700); }
.btn-filled:active { background: var(--primary-800); }
.btn-filled:disabled {
  background: var(--neutral-100);
  color: var(--neutral-300);
  cursor: not-allowed;
}

/* Outlined Primary */
.btn-outlined {
  background: transparent;
  color: var(--primary-600);
  border: 1px solid var(--primary-600);
  border-radius: var(--radius-s);
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  cursor: pointer;
}
.btn-outlined:hover {
  background: var(--primary-100);
  color: var(--primary-700);
  border-color: var(--primary-700);
}

/* Danger Filled */
.btn-danger {
  background: var(--danger-500);
  color: var(--neutral-0);
  border: none;
}
```

---

## 8. Badges

Badges are small, pill-shaped status indicators. They use a **type-based architecture** with translucent backgrounds (16% opacity) for lightweight appearance on dark surfaces.

### 8.1 Badge Anatomy

```css
.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  border-radius: var(--xxl, 40px);      /* full pill shape */
  font-family: 'Poppins', sans-serif;
  font-weight: 500;                     /* Medium */
  font-size: 14px;
  line-height: 1.2;
  white-space: nowrap;
  gap: 4px;                             /* icon-to-text gap when icon present */
}
```

### 8.2 Badge Types

| Type | Background | Text Color | Icon (16px, Linear) | Default Label |
|------|-----------|------------|------|---------------|
| **Success** | `rgba(24, 169, 87, 0.16)` | `#18A957` | `TickCircle` | "Success" |
| **Warning** | `rgba(255, 165, 56, 0.16)` | `#FFA538` | `InfoCircle` | "Warning" |
| **Error** | `rgba(223, 22, 66, 0.16)` | `#E95C7B` | `Danger` | "Error" |
| **In Progress** | `rgba(0, 206, 230, 0.16)` | `#00CEE6` | `TaskSquare` | "In Progress" |
| **Informative** | `rgba(69, 76, 94, 0.16)` | `#BFC2CC` | `IoInformationCircleOutline` (Ionicons) | "Information" |
| **Quiz** | `rgba(99, 104, 219, 0.16)` | `#FFDBAF` | Custom `LessonQuiz` | "Quiz Required" |
| **New** | `#E95C7B` (solid, not translucent) | `#F9F9FA` | None (never has icon) | "New" |

### 8.3 Badge Usage Guide

| Scenario | Type | Icon? |
|----------|------|-------|
| Course completed | Success | ✓ |
| Quiz passed | Success | ✓ |
| Assignment overdue | Warning | ✓ |
| Quiz failed | Error | ✓ |
| Course being taken | In Progress | ✓ |
| Category/metadata label | Informative | ✗ |
| Quiz required on lesson | Quiz | ✓ |
| Freshly added content | New | ✗ (always) |

### 8.4 React Implementation

```tsx
interface BadgeProps {
  type?: 'success' | 'warning' | 'error' | 'in-progress' | 'informative' | 'quiz' | 'new';
  icon?: boolean;
  label?: string;
}
```

Use `role="status"` for status badges, `role="presentation"` for decorative/category badges.

---

## 9. Headers

### 9.1 Component Overview

| Component | Purpose | Title Size | Section Gap | Unique Feature |
|-----------|---------|------------|-------------|----------------|
| **Page Header** | Main page identification | 24px Bold (H2) | 20px | Breadcrumb support |
| **Section Header** | Content sections, modals, dashboard widgets | 20px Bold (H3) | 16px | Compact layout |

Both support: eyebrow metadata, CTAs, description, tabs, chips, icon, avatar. Page Header additionally supports breadcrumbs.

### 9.2 When to Use Which

| Scenario | Use |
|----------|-----|
| Top of a page | Page Header |
| Inside a card or modal | Section Header |
| Dashboard widget | Section Header |
| Settings section | Section Header |

### 9.3 Header Typography

| Element | Size | Weight | Color |
|---------|------|--------|-------|
| Page title | 24px | Bold (700) | `--text-primary` |
| Page description | 16px | Regular (400) | `--text-secondary` |
| Section title | 20px | Bold (700) | `--text-primary` |
| Section description | 14px | Regular (400) | `--text-secondary` |
| Breadcrumb link | 12px | Regular (400) | `--text-tertiary` |
| Breadcrumb current | 12px | Regular (400) | `--text-secondary` |
| Eyebrow metadata | 14px | Regular (400) | `--text-tertiary` |
| Tab selected | 14px | Bold (700) | `--text-primary` |
| Tab unselected | 14px | Medium (500) | `--text-secondary` |
| Chip selected | 14px | Bold (700) | `--neutral-800` |
| Chip unselected | 14px | Regular (400) | `--text-secondary` |

### 9.4 Header Spacing

| Element | Value |
|---------|-------|
| Page Header section gap | 20px (`--space-ml`) |
| Section Header section gap | 16px (`--space-m`) |
| Breadcrumb item gap | 4px (`--space-xs`) |
| Eyebrow item gap | 8px (`--space-s`) |
| Eyebrow internal gap | 4px (`--space-xs`) |
| Title-to-description gap | 4px |
| Tab bottom indicator | 2px solid, `--secondary-500` (active) |

### 9.5 Heading Hierarchy

Page Header renders as `<h2>`. Section Headers render as `<h3>`. Course titles use `<h1>`. Maintain logical heading order throughout the page.

---

## 10. Lesson Cards

### 10.1 Views

| View | Dimensions | Thumbnail |
|------|-----------|-----------|
| Grid | 170×230px | Fills top area |
| List — Mobile | 343px wide | 56×56px |
| List — Web App | 900px wide | 80×80px |
| List — Admin | 900px wide | 48×48px |

### 10.2 Props

| Prop | Type | Default |
|------|------|---------|
| `view` | `"grid" \| "list"` | `"grid"` |
| `device` | `"Mobile" \| "Web app" \| "Admin" \| "n/a"` | `"n/a"` |
| `disabled` | `boolean` | `false` |
| `completed` | `boolean` | `false` |
| `state` | `"Enabled" \| "Hover"` | `"Enabled"` |
| `quiz` | `"Required" \| "Off" \| "Completed" \| "Pending" \| "Failed"` | `"Required"` |

### 10.3 Card States

| State | Behavior |
|-------|----------|
| Enabled | Default appearance |
| Hover | Background → `--cards-background-hover` (#EFF0F2), title → `--text-button-hover` (#00AFC4) |
| Disabled | Thumbnail: `mix-blend-mode: luminosity`, text: `--text-disabled`, lock icon shown |
| Completed | Progress bar fills with `--success-500` |

### 10.4 Quiz Badges on Cards

| Status | Background | Text Color |
|--------|-----------|------------|
| Required | `rgba(99, 104, 219, 0.16)` | #6368DB |
| Completed | `rgba(24, 169, 87, 0.16)` | #18A957 |
| Pending | `rgba(255, 165, 56, 0.16)` | #FFA538 |
| Failed | `rgba(223, 22, 66, 0.16)` | #DF1642 |

Badge styling: pill shape (`border-radius: 40px`), `padding: 4px 8px`, `gap: 4px` between icon and text.

### 10.5 Progress Bar

- Segmented (8 segments in-progress, 4 when completed)
- Default fill: `--primary-600` (#00AFC4)
- Completed fill: `--success-500` (#18A957)
- Empty segment: `--border` color
- Height: 8px, border-radius: 20px on first/last segments

### 10.6 Card Shadow

```css
box-shadow: -1px -1px 4px rgba(32, 34, 42, 0.06), 1px 1px 4px rgba(32, 34, 42, 0.06);
```

Applied to grid, web app, and admin cards. Not applied to mobile cards.

---

## 11. Overlays

The overlay system has three components sharing a common backdrop. Use the decision rule: Quick binary decision → **Dialog**. Moderate focused content → **Modal**. Extended working area → **Side Drawer**.

### 11.1 Shared Foundation

**Overlay Backdrop:**
```css
.overlay-backdrop {
  position: fixed;
  inset: 0;
  background: var(--neutral-900, #0F1014);
  opacity: 0.64;
  z-index: 1000;
}
```

**Close Button (Modal & Side Drawer only):**
```css
.overlay-close {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px;
  display: flex;
  align-items: center;
  cursor: pointer;
  color: var(--text-secondary, #BFC2CC);
  background: none;
  border: none;
}
.overlay-close:hover { color: var(--text-primary, #F9F9FA); }
```

Icon: `IoCloseOutline` (Ionicons 5) at 24×24px.

**Shadow L** (Dialog & Modal):
```css
box-shadow: -4px 0px 24px 0px rgba(32, 34, 42, 0.12);
```

### 11.2 Dialog

Compact, centered overlay for critical decisions. No close button — dismissal only through action buttons.

| Property | Value |
|----------|-------|
| Width | 345px |
| Padding | 24px (`--space-l`) uniform |
| Border radius | 12px (`--radius-sm`) |
| Background | `--page-background` (#20222A) |
| Content gap | 20px (`--space-ml`) |
| Text align | Center |

**Dialog types:** Error, Warning, Info, Success — each with a distinct 72×72px icon and button colors.

| Type | Filled Button Color | Outlined Button Border |
|------|--------------------|-----------------------|
| Error | `--danger-500` (#DF1642), text white | White border, white text |
| Warning | `--warning-500` (#FFA538), text dark | White border, white text |
| Info | `--primary-500` (#00CEE6), text dark | Cyan border, cyan text |
| Success | `--primary-500` (#00CEE6), text dark | Cyan border, cyan text |

**Close behavior:** Clicking backdrop does NOT close. No escape key. Only action buttons dismiss.

### 11.3 Modal

Centered overlay for focused tasks with moderate content.

| Property | Value |
|----------|-------|
| Width | 720px |
| Padding | 24px (`--space-l`) uniform |
| Border radius | 12px (`--radius-sm`) |
| Background | `--page-background` (#20222A) |
| Content gap | 20px (`--space-ml`) |
| Min content height | 320px |
| CTA | Single centered primary button |
| Close | ✕ button top-right + backdrop click + Escape key |

**Header:** Section Header style — 20px Bold title, 14px Regular supporting text, divider line.

### 11.4 Side Drawer

Right-anchored panel spanning full viewport height.

| Property | Value |
|----------|-------|
| Width | 720px |
| Height | 100vh |
| Padding | 20px top/bottom, 24px left/right |
| Border radius | None (flush to viewport edge) |
| Background | `--page-background` (#20222A) |
| Shadow | None |
| Content | Scrollable flex body |
| Footer | Sticky with divider + primary/secondary buttons |
| Close | ✕ button top-right + backdrop click + Escape key |

### 11.5 Overlay Animations

| Component | Animation | Duration | Easing |
|-----------|-----------|----------|--------|
| Backdrop | Fade in (opacity 0 → 0.64) | 200ms | ease-out |
| Dialog | Scale up + fade (0.95 → 1) | 200ms | ease-out |
| Modal | Scale up + fade (0.95 → 1) | 250ms | ease-out |
| Side Drawer | Slide in from right | 300ms | cubic-bezier(0.32, 0.72, 0, 1) |

### 11.6 Overlay Comparison

| Property | Dialog | Modal | Side Drawer |
|----------|--------|-------|-------------|
| Position | Centered | Centered | Right-anchored |
| Close button | None | ✓ | ✓ |
| Backdrop click closes | ✗ | ✓ | ✓ |
| Escape key closes | ✗ | ✓ | ✓ |
| CTA buttons | 2 (type-colored) | 1 (primary centered) | 2 (sticky footer) |
| Scrollable | No | Optional | Yes |

---

## 12. Accessibility Requirements

### 12.1 Color Contrast

- Normal text (16px): minimum 4.5:1 contrast ratio (WCAG AA)
- Large text (24px+): minimum 3:1 contrast ratio
- Safe: `--neutral-800` on white (AAA), `--neutral-500` on white (AA)
- **Unsafe:** `--primary-500` on white (fails contrast — never use for text on light bg)

### 12.2 Semantic HTML

- Use semantic heading tags (`<h1>`–`<h6>`) in logical order
- Use `<article>` for lesson cards
- Use `<nav>` for breadcrumbs with `aria-label="Breadcrumb"`
- Use `role="tablist"` and `role="tab"` with `aria-selected` for tabs
- Use `role="status"` on status badges
- Use `role="alertdialog"` for Dialog, `role="dialog"` for Modal and Side Drawer

### 12.3 Interactive Elements

- All buttons: visible focus indicator via `:focus-visible` — `outline: 2px solid var(--primary-600); outline-offset: 2px;`
- Icon-only buttons: require `aria-label`
- Disabled elements: `aria-disabled="true"`
- Loading buttons: `aria-busy="true"`
- Progress bars: `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- All overlays: `aria-modal="true"`, `aria-labelledby` pointing to title, focus trap mandatory, return focus on close

---

## 13. Quick Decision Reference

### "What color for…?"

| Need | Answer |
|------|--------|
| Primary CTA | `--primary-600` |
| Hover | `--primary-700` |
| Pressed | `--primary-800` |
| Links | `--primary-600` |
| Active tab/selection | `--secondary-500` |
| Success status | `--success-500` |
| Warning status | `--warning-500` |
| Error status | `--danger-500` |
| AI features | `--blaze-quiz` (#8158EC) |
| Overlay backdrop | `--neutral-900` at 64% opacity |

### "What size for…?"

| Element | Size |
|---------|------|
| Course title | H1 (32px) |
| Page title | H2 (24px) |
| Section header | H3 (20px) |
| Card header | H4 (16px) |
| Main body | 16px |
| Secondary text | 14px |
| Caption | 12px |
| Badge text | 14px Medium |
| Standard button | Medium (41px height) |
| Nav icon | 24px |
| Button icon | 20px |
| Badge icon | 16px |

### "What spacing for…?"

| Context | Value |
|---------|-------|
| Button padding (medium) | 12px 20px |
| Card padding (standard) | 24px |
| Input padding | 12px 16px |
| Badge padding | 6px 12px |
| Form gaps | 20px |
| Page padding | 24px |
| Dialog padding | 24px uniform |
| Modal padding | 24px uniform |
| Side Drawer padding | 20px vert / 24px horiz |

### "What radius for…?"

| Element | Value |
|---------|-------|
| Buttons | 8px (`--radius-s`) |
| Cards | 12px (`--radius-sm`) |
| Inputs | 12px (`--radius-sm`) |
| Modals & Dialogs | 12px (`--radius-sm`) |
| Large cards | 16px (`--radius-m`) |
| Avatars | 9999px (`--radius-full`) |
| Badge pills | 40px |

### "What overlay for…?"

| Scenario | Component |
|----------|-----------|
| Delete confirmation | Dialog (Error type) |
| Success feedback | Dialog (Success type) |
| Form/edit task | Modal |
| Settings panel | Side Drawer |
| Detail view | Side Drawer |
| Quick yes/no | Dialog |

### "What badge for…?"

| Scenario | Badge Type |
|----------|-----------|
| Completed / passed | Success |
| Overdue / deadline | Warning |
| Failed / error | Error |
| In progress / enrolled | In Progress |
| Category tag | Informative |
| Quiz required | Quiz |
| New content | New |
