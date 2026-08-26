---
name: 5mins-design-system-guidelines
description: Design foundations for 5Mins.ai — brand identity, color system (incl. the three-amber selection tokens), typography, 4px spacing scale, border radius, iconography, accessibility, and quick decision tables. Component specs live in per-component docs (see section 7). Start here for any token or foundation question.
---

# 5Mins.ai Design System Guidelines

> **For Cursor / AI Code Assistants:** This file holds the design **foundations** (colors, type, spacing, radius, icons) and quick decision tables. Component-level specs each live in their own verified doc (see section 7) — read the component doc before building and match it exactly. Do not improvise values; if neither this file nor a component doc covers what you need, ask for the Figma link. The authoritative token values live in `src/styles/tokens.css` and `colors.md`.

---

## Table of Contents

1. [Brand Identity](#1-brand-identity)
2. [Color System](#2-color-system)
3. [Typography](#3-typography)
4. [Spacing System](#4-spacing-system)
5. [Border Radius](#5-border-radius)
6. [Iconography](#6-iconography)
7. [Component Specs — one doc per component](#7-component-specs--one-doc-per-component)
8. [Accessibility Requirements](#8-accessibility-requirements)
9. [Quick Decision Reference](#9-quick-decision-reference)

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

### 2.2 Secondary (Yellow/Gold) — the three-amber system

The amber family expresses selection, but through three distinct tokens — using the wrong one is the most common consistency mistake:

| Token | Value | Used for |
|-------|-----|-------|
| `--selected` | `#EDA30D` light / `#FFBB38` dark (mode-aware) | **Form-field active borders** (input, dropdown, date field, search), selection indicators (tab underline, calendar selected day, DnD affordances), toggle on-track |
| `--control-selected` | `#EDA30D` both modes (= `--secondary-600`) | Radio and checkbox selected fill |
| `--secondary-500` (raw) | `#FFBB38` both modes | **Selected fills** on chips, content-switcher segments, and listbox items — always with Bold `--neutral-800` text |

Never use amber for warnings (use `--warning-*`) or primary actions (use primary cyan). Some Figma light nodes still bind field-active borders to raw `Secondary-500` — those are stale; `--selected` is the rule.

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
| `--neutral-400` / `--text-tertiary` | #656B7C | Secondary/tertiary text, captions |
| `--neutral-300` / `--text-disabled` | #9EA4B3 | Disabled text, placeholders |
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
| `--border` (dark) | #2D313D | Dividers on dark bg |
| `--input-background` | rgba(69, 76, 94, 0.16) | Input fields on dark bg |
| `--input-background-elevated` | rgba(69, 76, 94, 0.24) | Input fields sitting on a card surface, dark bg |

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

**Primary:** Poppins (Google Fonts), weights 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold).
**Fallback:** -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif.

> **Every 12px text style has a 120% line height** — H6, Paragraph S, badges, tooltips, captions. **The one exception is Button S, which stays at 140%** so the Small button holds its 33px height. 16px and 14px stay at 150%.

```css
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

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
| H6 | 12px (0.75rem) | 1.2 | Tags, micro headers |

### 3.3 Type Scale — Body Text

Body text uses **Regular (400)**, **Medium (500)**, or **Semibold (600)** weight, color `--neutral-500` (#454C5E).

| Size | Font Size | Line Height | Usage |
|------|-----------|-------------|-------|
| Large | 16px (1rem) | 1.5 | Main body content, descriptions |
| Medium | 14px (0.875rem) | 1.5 | Secondary text, list items, table content |
| Small | 12px (0.75rem) | 1.2 | Captions, help text, timestamps |

Each size exists in three weights (Figma `5445:24009`, verified 2026-08-26) with the same line heights (1.5 / 1.5 / 1.2 for L / M / S). Utilities: `.text-{lg,md,sm}` (400), `.text-{lg,md,sm}-medium` (500), `.text-{lg,md,sm}-semibold` (600).

**Every form-field label is Paragraph M semibold** — 14px / 600 / 1.5, `--text-secondary`. See `input.md`.

### 3.4 Type Scale — Buttons

All button text uses **Bold (700)** weight, no text-transform.

| Size | Font Size | Line Height |
|------|-----------|-------------|
| Large | 16px | 1.5 |
| Medium | 14px | 1.5 |
| Small | 12px | 1.4 |

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
- Semibold (600) is for form-field labels.
- Medium (500) is for subtle emphasis within body text.
- Never make body text smaller than 14px. Minimum for main content is 16px.
- Never use bold for entire paragraphs.
- Never mix font families; always use Poppins.

---

## 4. Spacing System

All spacing uses a **4px base unit**. Layout spacing (padding, margins, gaps between blocks) must be a multiple of 4px. Three fine-grain tokens (2/6/10px) exist for micro spacing inside components — hairline gaps, icon nudges, compact control padding — never for layout.

### 4.1 Spacing Scale

| Token | rem | px | Usage |
|-------|-----|----|----|
| `--space-xxs` | 0.125rem | 2px | Hairline gaps, focus-ring offset, badge inner gap (micro only) |
| `--space-xs` | 0.25rem | 4px | Micro gaps, icon-to-text gap (small buttons) |
| `--space-xss` | 0.375rem | 6px | Compact chip/badge padding, tight icon nudges (micro only) |
| `--space-s` | 0.5rem | 8px | Small gaps, icon padding, button padding |
| `--space-ssm` | 0.625rem | 10px | Button padding-y (M/L), compact control padding (micro only) |
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
  --space-xxs: 0.125rem; /* 2px */
  --space-xs: 0.25rem;   /* 4px */
  --space-xss: 0.375rem; /* 6px */
  --space-s: 0.5rem;     /* 8px */
  --space-ssm: 0.625rem; /* 10px */
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

## 7. Component Specs — one doc per component

Component-level specs are **not duplicated here**. Each component has a verified spec file (Figma-checked 2026-07) — read it before building, and match it exactly:

| Component | Doc |
|---|---|
| Buttons (all families, sizes, states, AI gradient) | `buttons.md` |
| Badges / status pills | `badges.md` |
| Chips, Content Switcher, Tabs | `chips-switcher-tabs.md` |
| Page & Section Headers | `headers.md` |
| Cards (Lesson, Assessment, Course, Skill, Category, Folder) | `cards.md` |
| Dialog, Modal, Side Drawer | `overlays.md` |
| Alert, Callout, Toast, Tooltip | `alerts-toast.md` |
| Table (card-row spec) | `table.md` |
| Inputs (outlined, inline, radio-row, integer) | `input.md` |
| Dropdown / select | `dropdown.md` |
| Listbox / menu surface | `listbox.md` |
| Search field | `search.md` |
| Date field + calendar | `calendar.md` |
| Checkbox, Radio, Toggle | `selection-controls.md` |
| File uploader | `file-uploader.md` |
| Avatars + avatar groups | `avatars.md` |
| Empty states | `empty-state.md` |
| Top nav + side panel navigation | `navigation.md` |

If a component is not in this list, it has no verified spec yet — ask for the Figma link instead of improvising.

---

## 8. Accessibility Requirements

### 8.1 Color Contrast

- Normal text (16px): minimum 4.5:1 contrast ratio (WCAG AA)
- Large text (24px+): minimum 3:1 contrast ratio
- Safe: `--neutral-800` on white (AAA), `--neutral-500` on white (AA)
- **Unsafe:** `--primary-500` on white (fails contrast — never use for text on light bg)

### 8.2 Semantic HTML

- Use semantic heading tags (`<h1>`–`<h6>`) in logical order
- Use `<article>` for lesson cards
- Use `<nav>` for breadcrumbs with `aria-label="Breadcrumb"`
- Use `role="tablist"` and `role="tab"` with `aria-selected` for tabs
- Use `role="status"` on status badges
- Use `role="alertdialog"` for Dialog, `role="dialog"` for Modal and Side Drawer

### 8.3 Interactive Elements

- All buttons: visible focus indicator via `:focus-visible` — `outline: 2px solid var(--primary-600); outline-offset: 2px;`
- Icon-only buttons: require `aria-label`
- Disabled elements: `aria-disabled="true"`
- Loading buttons: `aria-busy="true"`
- Progress bars: `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- All overlays: `aria-modal="true"`, `aria-labelledby` pointing to title, focus trap mandatory, return focus on close

---

## 9. Quick Decision Reference

### "What color for…?"

| Need | Answer |
|------|--------|
| Primary CTA | `--primary-600` |
| Hover | `--primary-700` |
| Pressed | `--primary-800` |
| Links | `--primary-600` |
| Field active border / tab indicator | `--selected` (mode-aware) |
| Chip / switcher / listbox selected fill | `--secondary-500` + Bold `--neutral-800` text |
| Radio / checkbox selected | `--control-selected` |
| Success status | `--success-500` |
| Warning status | `--warning-500` |
| Error status | `--danger-500` |
| AI features | `--blaze-quiz` (#8158EC) |
| Overlay backdrop | `--scrim` — Neutral-900 @ 25% light / 50% dark |

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
| Button padding (medium) | 10px 20px |
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
