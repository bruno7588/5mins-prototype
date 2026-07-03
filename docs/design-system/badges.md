---
name: 5mins-badges
description: Badge component for 5Mins.ai — pill-shaped status indicators (Success, Warning, Error, In Progress, Informative, New) with optional leading type-icon and dismissible right ✕. Use when implementing any status pill, state tag, category label, count chip, or dismissible filter badge in tables, cards, headers, or lists.
---

# 5Mins.ai Badge Component System

Complete badge implementation guide for the 5Mins.ai micro-learning platform. Badges are small, pill-shaped status indicators used to communicate state, category, or metadata at a glance.

Spec source: Figma Library — light `node 11915:3152`, dark `node 5799:479` (verified 2026-07-03). Same structure in both modes; the tinted backgrounds are literal rgba values shared across modes, text colors are semantic tokens that resolve per mode.

## Badge Architecture

The badge system uses a **type-based architecture** with three dimensions:

| Dimension | Options |
|-----------|---------|
| **Type** | Success, Warning, Error, In Progress, Informative, New (+ Quiz, app extension) |
| **iconLeft** | Leading 16px type-icon |
| **iconRight** | Trailing 16px close ✕ (dismissible) — not available on New |

All badges share the same shape and sizing — only color and content change between types.

## Visual Anatomy

Every badge follows this structure:

```
┌──────────────────────────────────┐
│  [iconLeft?]  Label Text  [ ✕? ] │   ← pill shape, fully rounded
└──────────────────────────────────┘
      ↑            ↑           ↑
    16px    14px Poppins    16px close
  type icon    Medium      (dismiss)
```

**Gaps:** `4px` between leading icon and label · `8px` between label and the ✕ (Informative uses `4px` on both sides — per Figma).

**Shared properties across all types:**

```css
.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;                    /* vertical | horizontal */
  border-radius: var(--xxl, 40px);      /* full pill shape */
  font-family: 'Poppins', sans-serif;
  font-weight: 500;                     /* Medium */
  font-size: 14px;
  line-height: 1.2;
  white-space: nowrap;
  gap: 4px;                             /* space between icon and text */
}
```

## Badge Types

### Success
Communicates completion, positive outcomes, or passing states. Used for "Completed" courses, passed quizzes, and successful actions.

```css
.badge-success {
  background: rgba(24, 169, 87, 0.16);       /* --success-500 at 16% */
  color: var(--text-success, #18A957);
}
```

**Icon:** `TickCircle` (Iconsax Linear) — checkmark in a circle

### Warning
Signals caution, pending attention, or approaching deadlines. Used for expiring content, items needing review, or caution states.

```css
.badge-warning {
  background: rgba(255, 165, 56, 0.16);      /* --warning-500 at 16% */
  color: var(--text-warning, #FFA538);
}
```

**Icon:** `InfoCircle` (Iconsax Linear) — info symbol in a circle

### Error
Indicates failure, overdue items, or critical issues. Used for failed quizzes, overdue assignments, or error states.

```css
.badge-error {
  background: rgba(223, 22, 66, 0.16);       /* --danger-500 at 16% */
  color: var(--text-error, #E95C7B);
}
```

**Icon:** `Danger` (Iconsax Linear) — warning triangle

### In Progress
Shows active or ongoing status. Used for courses currently being taken, pending actions, or loading states.

```css
.badge-in-progress {
  background: rgba(0, 206, 230, 0.16);       /* --primary-500 at 16% */
  color: var(--text-progress, #00CEE6);
}
```

**Icon:** `TaskSquare` (Iconsax Linear) — task clipboard

### Informative
Neutral metadata or supplementary information. Used for general labels, counts, or contextual tags that don't carry semantic weight.

```css
.badge-informative {
  background: var(--input-background, rgba(69, 76, 94, 0.16));
  color: var(--text-secondary, #BFC2CC);
}
```

**Icon:** `IoInformationCircleOutline` (Ionicons 5) — info circle outline

### Quiz (app extension)

> Not part of the Figma Badge component — the Library node defines only the six types above. Quiz badges exist in the app (lesson cards, assessment indicators) and follow the same pill pattern; treat this as an accepted code extension until it lands in the Library.

Indicates quiz-related status such as required assessments. Used for quiz badges on lesson cards, course requirements, and assessment indicators.

```css
.badge-quiz {
  background: rgba(99, 104, 219, 0.16);      /* --certificate-quiz at 16% */
  color: var(--text-quiz, #FFDBAF);
}
```

**Icon:** Custom `LessonQuiz` icon — quiz symbol

### New
A solid, high-contrast badge that draws attention to freshly added content. Unlike all other badges which use translucent backgrounds, New uses a solid fill. It does **not** support an icon variant.

```css
.badge-new {
  background: var(--danger-400, #E95C7B);
  color: var(--neutral-25, #F9F9FA);
}
```

**Icon:** None — the New badge intentionally has no icon variant.

## Color Token Summary

Backgrounds are literal 16% tints of the type's 500-level color, identical in both modes (Informative uses the mode-aware `--input-background`). Text colors are semantic tokens:

| Type | Background (both modes) | Text token | Light | Dark |
|------|------------------------|------------|-------|------|
| **Success** | `rgba(24, 169, 87, 0.16)` — Success-500 | `--text-success` | `#11763D` | `#18A957` |
| **Warning** | `rgba(255, 165, 56, 0.16)` — Warning-500 | `--text-warning` | `#E88206` | `#FFA538` |
| **Error** | `rgba(223, 22, 66, 0.16)` — Danger-500 | `--text-error` | `#DF1642` | `#E95C7B` |
| **In Progress** | `rgba(0, 206, 230, 0.16)` — Primary-500 | `--text-progress` | `#008393` | `#00CEE6` |
| **Informative** | `var(--input-background)` | `--text-secondary` | `#454C5E` | `#BFC2CC` |
| **Quiz** (ext.) | `rgba(99, 104, 219, 0.16)` — Certificate-quiz | `--text-quiz` | — | `#FFDBAF` |
| **New** | `var(--danger-400)` `#E95C7B` (solid) | `--neutral-25` | `#F9F9FA` | `#F9F9FA` |

The translucent background pattern (16% opacity) is a core design principle — it ensures badges feel lightweight while maintaining readable contrast. Icons always render in `currentColor`, matching the text token.

## React TypeScript Implementation

```tsx
import { ReactNode } from 'react';

type BadgeType =
  | 'success'
  | 'warning'
  | 'error'
  | 'in-progress'
  | 'informative'
  | 'quiz'
  | 'new';

interface BadgeProps {
  type?: BadgeType;
  icon?: boolean;          // leading type-icon (iconLeft in Figma)
  onDismiss?: () => void;  // renders the trailing ✕ (iconRight); not for type="new"
  label?: string;
  className?: string;
}

const BADGE_CONFIG: Record<BadgeType, {
  bg: string;
  color: string;
  defaultLabel: string;
}> = {
  success: {
    bg: 'rgba(24, 169, 87, 0.16)',
    color: 'var(--text-success, #18A957)',
    defaultLabel: 'Success',
  },
  warning: {
    bg: 'rgba(255, 165, 56, 0.16)',
    color: 'var(--text-warning, #FFA538)',
    defaultLabel: 'Warning',
  },
  error: {
    bg: 'rgba(223, 22, 66, 0.16)',
    color: 'var(--text-error, #E95C7B)',
    defaultLabel: 'Error',
  },
  'in-progress': {
    bg: 'rgba(0, 206, 230, 0.16)',
    color: 'var(--text-progress, #00CEE6)',
    defaultLabel: 'In Progress',
  },
  informative: {
    bg: 'var(--input-background, rgba(69, 76, 94, 0.16))',
    color: 'var(--text-secondary, #BFC2CC)',
    defaultLabel: 'Information',
  },
  quiz: {
    bg: 'rgba(99, 104, 219, 0.16)',
    color: 'var(--text-quiz, #FFDBAF)',
    defaultLabel: 'Quiz Required',
  },
  new: {
    bg: 'var(--danger-400, #E95C7B)',
    color: 'var(--neutral-25, #F9F9FA)',
    defaultLabel: 'New',
  },
};

export function Badge({
  type = 'success',
  icon = false,
  onDismiss,
  label,
  className,
}: BadgeProps) {
  const config = BADGE_CONFIG[type];
  // The "new" badge never shows icons — leading or dismiss
  const showIcon = icon && type !== 'new';
  const dismissible = !!onDismiss && type !== 'new';

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: showIcon ? '4px' : dismissible ? '8px' : undefined,
        padding: '6px 12px',
        borderRadius: 'var(--xxl, 40px)',
        background: config.bg,
        color: config.color,
        fontFamily: "'Poppins', sans-serif",
        fontWeight: 500,
        fontSize: '14px',
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
      }}
      role="status"
    >
      {showIcon && <BadgeIcon type={type} />}
      {label ?? config.defaultLabel}
      {dismissible && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Remove"
          style={{
            display: 'flex', flexShrink: 0, width: 16, height: 16,
            padding: 0, background: 'transparent', border: 'none',
            color: 'inherit', cursor: 'pointer',
          }}
        >
          <IoCloseOutline size={16} />
        </button>
      )}
    </span>
  );
}
```

### Icon Mapping

Each badge type maps to a specific 16×16px **leading** icon from the Iconsax library (Linear variant), except Informative which uses Ionicons 5. The **trailing dismiss icon is always** Ionicons 5 `IoCloseOutline` (16px, currentColor), regardless of type:

```tsx
function BadgeIcon({ type }: { type: BadgeType }) {
  // All icons render at 16×16px with currentColor
  const iconMap: Partial<Record<BadgeType, ReactNode>> = {
    success:       <TickCircle size={16} variant="Linear" />,
    warning:       <InfoCircle size={16} variant="Linear" />,
    error:         <Danger size={16} variant="Linear" />,
    'in-progress': <TaskSquare size={16} variant="Linear" />,
    informative:   <IoInformationCircleOutline size={16} />,
    quiz:          <LessonQuizIcon size={16} />,
  };

  const icon = iconMap[type];
  return icon ? <span style={{ display: 'flex', flexShrink: 0 }}>{icon}</span> : null;
}
```

## CSS Class Implementation

For projects preferring CSS classes over inline styles:

```css
/* Base badge */
.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  border-radius: var(--xxl, 40px);
  font-family: 'Poppins', sans-serif;
  font-weight: 500;
  font-size: 14px;
  line-height: 1.2;
  white-space: nowrap;
}

/* Icon gaps */
.badge--icon      { gap: 4px; }  /* leading type-icon */
.badge--dismiss   { gap: 8px; }  /* trailing ✕ only (Informative: keep 4px) */

/* Badge icon container (leading icon and ✕ alike) */
.badge__icon,
.badge__dismiss {
  display: flex;
  flex-shrink: 0;
  width: 16px;
  height: 16px;
}

.badge__dismiss {
  padding: 0;
  background: transparent;
  border: none;
  color: inherit;
  cursor: pointer;
}

/* Type variants */
.badge--success      { background: rgba(24, 169, 87, 0.16);  color: var(--text-success, #18A957); }
.badge--warning      { background: rgba(255, 165, 56, 0.16); color: var(--text-warning, #FFA538); }
.badge--error        { background: rgba(223, 22, 66, 0.16);  color: var(--text-error, #E95C7B); }
.badge--in-progress  { background: rgba(0, 206, 230, 0.16);  color: var(--text-progress, #00CEE6); }
.badge--informative  { background: var(--input-background, rgba(69, 76, 94, 0.16)); color: var(--text-secondary, #BFC2CC); }
.badge--quiz         { background: rgba(99, 104, 219, 0.16); color: var(--text-quiz, #FFDBAF); }
.badge--new          { background: var(--danger-400, #E95C7B); color: var(--neutral-25, #F9F9FA); }
```

## Usage Guidelines

### "What badge should I use for...?"

| Scenario | Badge Type | Icon? |
|----------|-----------|-------|
| Course completed | Success | ✓ |
| Quiz passed | Success | ✓ |
| Assignment overdue | Warning | ✓ |
| Deadline approaching | Warning | Optional |
| Quiz failed | Error | ✓ |
| Account deactivated | Error | Optional |
| Course being taken | In Progress | ✓ |
| Pending approval | In Progress | Optional |
| Category label | Informative | Optional |
| Metadata tag | Informative | ✗ |
| Quiz required on lesson | Quiz | ✓ |
| Assessment pending | Quiz | ✓ |
| Freshly added content | New | ✗ (always) |

### Combining with Other Components

Badges commonly appear inside:
- **Lesson cards** — quiz status, completion status
- **Tables** — user status, course status columns
- **Headers** — metadata alongside titles
- **Lists** — inline status next to item names

```tsx
{/* Badge in a lesson card */}
<LessonCard>
  <LessonCard.Thumbnail src={thumb} />
  <LessonCard.Title>Fire Safety Training</LessonCard.Title>
  <Badge type="quiz" icon />
  <Badge type="in-progress" />
</LessonCard>

{/* Badge in an admin table */}
<td>
  <Badge type="success" label="Active" />
</td>

{/* Badge next to a page header */}
<PageHeader>
  <h1>Course Library</h1>
  <Badge type="new" label="3 New" />
</PageHeader>
```

### Custom Labels

The `label` prop overrides the default text. This is useful when the same badge type communicates different states:

```tsx
<Badge type="success" label="Active" />
<Badge type="success" label="Completed" icon />
<Badge type="error" label="Overdue" icon />
<Badge type="error" label="Failed" />
<Badge type="in-progress" label="Enrolled" />
<Badge type="warning" label="Expiring Soon" icon />
<Badge type="informative" label="12 Lessons" />
```

## Accessibility

### Required Practices

Badges use `role="status"` so screen readers announce state changes. For purely decorative badges (e.g., category tags), use `role="presentation"` instead.

```tsx
{/* Status badge — announces to screen readers */}
<Badge type="success" label="Completed" />
{/* → <span role="status">Completed</span> */}

{/* Decorative/category badge */}
<Badge type="informative" label="Finance" role="presentation" />
```

### Color Contrast

All badge text/background combinations meet WCAG AA for the 14px Medium weight used:
- Translucent backgrounds on dark surfaces provide sufficient contrast
- The "New" badge uses high-contrast solid pink with near-white text
- Avoid placing badges on colored backgrounds that may reduce contrast

### Don't Rely on Color Alone

Always pair badge color with a text label. The icon provides an additional visual cue but the label is the primary communicator of meaning.

## Quick Reference

### All Badge Variants at a Glance

| Type | BG Pattern | Text | Leading icon | Dismissible ✕ | Default Label |
|------|-----------|------|--------------|---------------|---------------|
| Success | 16% green | Green | TickCircle | ✓ | "Success" |
| Warning | 16% orange | Orange | InfoCircle | ✓ | "Warning" |
| Error | 16% red | Red/pink | Danger | ✓ | "Error" |
| In Progress | 16% cyan | Cyan | TaskSquare | ✓ | "In Progress" |
| Informative | 16% gray | Gray | InfoCircleOutline | ✓ (4px gap) | "Information" |
| Quiz (ext.) | 16% purple | Warm cream | LessonQuiz | — | "Quiz Required" |
| New | Solid pink | White | None | ✗ never | "New" |
