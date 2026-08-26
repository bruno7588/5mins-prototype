---
name: 5mins-badges
description: Badge component for 5Mins.ai — pill-shaped status indicators (Success, Warning, Error, In Progress, Informative, New) with an optional leading type-icon. Use when implementing any status pill, state tag, category label, or count chip in tables, cards, headers, or lists.
---

# 5Mins.ai Badge Component System

Badges are small, pill-shaped status indicators that communicate state, category, or metadata at a glance.

**Spec source:** Figma Library — dark `node 5799:479`, light `node 12137:2230` (verified 2026-08-26). Both nodes have the same structure; only the resolved text/fill tokens differ per mode.

**Implementation:** `src/components/Badge/Badge.tsx` + `Badge.css`. Use it — never hand-roll a pill.

## Architecture

| Dimension | Options |
|-----------|---------|
| **Type** | Success, Warning, Error, In Progress, Informative, New |
| **iconLeft** | Optional leading 16px type-icon (not available on New) |

There is **no size axis and no trailing/dismiss ✕** in the Library badge. For a dismissible pill use the Chip component (`chips-switcher-tabs.md`).

Two extra types exist in code only (see [App extensions](#app-extensions)): `quiz` and `scheduled`.

## Anatomy

```
┌────────────────────────────┐
│  [iconLeft?]  Label Text   │   ← pill, radius XXL (40px ≡ --radius-full)
└────────────────────────────┘
      ↑            ↑
    16px    14px Poppins Medium, line-height 1.2
```

| Property | Figma variable | Token |
|----------|----------------|-------|
| Padding (vertical) | XSS · 6 | `--space-xss` |
| Padding (horizontal) | SM · 12 | `--space-sm` |
| Gap icon → label | XS · 4 | `--space-xs` |
| Radius | XXL · 40 | `--radius-full` |
| Icon | 16 × 16, `currentColor` | — |

The box is identical with and without the leading icon — padding does **not** tighten on the icon side.

```css
.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  padding: var(--space-xss) var(--space-sm);
  border-radius: var(--radius-full);
  font-family: 'Poppins', sans-serif;
  font-weight: 500;
  font-size: 14px;
  line-height: 1.2;
  white-space: nowrap;
}

.badge__icon { display: flex; flex-shrink: 0; width: 16px; height: 16px; }
```

## Types and colours

Fills are literal 16% tints of the type's 500-level colour and are **the same in both modes** (Informative uses the mode-aware `--input-background`). Text is a semantic token that resolves per mode; icons inherit it via `currentColor`.

| Type | Fill (both modes) | Text token | Light | Dark | Leading icon (Iconsax Linear) | Default label |
|------|-------------------|------------|-------|------|-------------------------------|---------------|
| **Success** | `rgba(24, 169, 87, 0.16)` Success-500 | `--text-success` | `#11763D` | `#18A957` | `TickCircle` | Success |
| **Warning** | `rgba(255, 165, 56, 0.16)` Warning-500 | `--text-warning` | `#E88206` | `#FFA538` | `InfoCircle` | Warning |
| **Error** | `rgba(223, 22, 66, 0.16)` Danger-500 | `--text-error` | `#DF1642` | `#E95C7B` | `Danger` | Error |
| **In Progress** | `rgba(0, 206, 230, 0.16)` Primary-500 | `--text-progress` | `#008393` | `#00CEE6` | `TaskSquare` | In Progress |
| **Informative** | `var(--input-background)` Neutral @ 16% | `--text-secondary` | `#454C5E` | `#BFC2CC` | `InfoCircle` ¹ | Information |
| **New** | `var(--danger-400)` `#E95C7B` **solid** | `--neutral-25` | `#F9F9FA` | `#F9F9FA` | none — never | New |

¹ Figma draws Informative with Ionicons `IoInformationCircleOutline`; the codebase is Iconsax-only, so `InfoCircle` Linear is the approved stand-in (visually equivalent at 16px).

```css
.badge--success      { background: rgba(24, 169, 87, 0.16);  color: var(--text-success); }
.badge--warning      { background: rgba(255, 165, 56, 0.16); color: var(--text-warning); }
.badge--error        { background: rgba(223, 22, 66, 0.16);  color: var(--text-error); }
.badge--in-progress  { background: rgba(0, 206, 230, 0.16);  color: var(--text-progress); }
.badge--informative  { background: var(--input-background); color: var(--text-secondary); }
.badge--new          { background: var(--danger-400);        color: var(--neutral-25); }
```

**New** is the only solid badge — it draws attention to freshly added content and deliberately has no icon variant.

## App extensions

Not in the Library Badge component. They follow the same box and typography; treat them as accepted code extensions until they land in Figma.

| Type | Fill | Text token | Light | Dark | Icon | Default label | Source |
|------|------|------------|-------|------|------|---------------|--------|
| **Quiz** | `var(--quiz-background)` Certificate-quiz @ 16% | `--text-quiz` | `#6368DB` | `#FFDBAF` | custom `LessonQuiz` via `customIcon` | Quiz Required | lesson/assessment cards |
| **Scheduled** | `rgba(42, 144, 216, 0.16)` Course-assessments @ 16% | `--course-assessments` | `#2A90D8` | `#2A90D8` | — | Scheduled | Figma `9200:58569` (enrolment not yet open) |

```css
.badge--quiz       { background: var(--quiz-background);     color: var(--text-quiz); }
.badge--scheduled  { background: rgba(42, 144, 216, 0.16);   color: var(--course-assessments); }
```

## React API

```tsx
import Badge from '@/components/Badge/Badge'

type BadgeType =
  | 'success' | 'warning' | 'error' | 'in-progress' | 'informative' | 'new'
  | 'quiz' | 'scheduled'   // app extensions

interface BadgeProps {
  type?: BadgeType        // default 'success'
  icon?: boolean          // leading type-icon (iconLeft in Figma); ignored on 'new'
  customIcon?: ReactNode  // replaces the type icon (16px, currentColor)
  label?: string          // overrides the default label
  className?: string
}
```

```tsx
<Badge type="success" label="Completed" icon />
<Badge type="error" label="Overdue" icon />
<Badge type="in-progress" label="Enrolled" />
<Badge type="informative" label="12 Lessons" />
<Badge type="new" />
<Badge type="quiz" customIcon={<LessonQuizIcon />} />
```

Every icon is rendered `size={16} variant="Linear" color="currentColor"` — with iconsax-react 0.0.8 on React 19 the `color` prop must be passed explicitly.

## Usage guidelines

| Scenario | Type | Icon? |
|----------|------|-------|
| Course completed / quiz passed | Success | ✓ |
| Deadline approaching, expiring content | Warning | Optional |
| Quiz failed / overdue / deactivated | Error | ✓ |
| Course being taken, pending approval | In Progress | Optional |
| Category label, count, metadata | Informative | ✗ usually |
| Enrolment not open yet | Scheduled (ext.) | ✗ |
| Quiz required on a lesson | Quiz (ext.) | ✓ |
| Freshly added content | New | ✗ always |

Badges appear inside table cells, cards, headers, and list rows. The label is the primary carrier of meaning — never rely on colour alone; the icon is a secondary cue.

## Accessibility

- The component sets `role="status"` so state changes are announced. For purely decorative category tags, wrap in an element with `role="presentation"` or pass `aria-hidden` via the parent.
- All text/fill pairs meet WCAG AA at 14px Medium in both modes — the light text tokens are the darker 600/700 steps for exactly this reason. Do not place badges on coloured surfaces that undercut that contrast.
