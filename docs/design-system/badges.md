---
name: 5mins-badges
description: Badge component for 5Mins.ai - pill-shaped status indicators (Success, Warning, Error, In Progress, Informative, New) with an optional leading type-icon and an optional trailing dismiss ✕. Use when implementing any status pill, state tag, category label, or count chip in tables, cards, headers, or lists.
---

# Badges

Small, pill-shaped status indicators that communicate state, category, or metadata at a glance.

**Code:** `import Badge from '@/components/Badge/Badge'` (`src/components/Badge/Badge.tsx` + `Badge.css`; use it, never hand-roll a pill)
**Figma:** Library `EC26cSVe9KNTCWXvYovakw`, `5799:479`
**Last verified:** 2026-10-14

Both nodes have the same structure; only the resolved text/fill tokens differ per mode.

## Usage

**Intent:** a small, read-only pill that tells the admin a record's state, category or a piece of metadata at a glance.

**Use when**
- Showing a status in a table row, card or header (enrolment, course or mapping status)
- Showing metadata such as a count or content type, with a 16px icon
- Listing values a control elsewhere owns, each removable with its own ×

**Don't use when**
- The pill is pressed, selected or toggled → Chip ([doc](chips-switcher-tabs.md))
- The message needs a sentence or an action → Alert or Callout ([doc](alerts-toast.md))
- Switching between views → Content Switcher or Tabs ([doc](chips-switcher-tabs.md))

**Badge ✕ or Chip ✕?** A dismissible badge removes a value from a set that something else owns: the picks under a scope row, the filters applied to a table. A Chip is the interactive control itself: it is pressed, selected and toggled, and its ✕ clears its own selection. If the pill is only ever read and dismissed, it is a badge (`chips-switcher-tabs.md` covers the other case).

**Do**
- Pick the type by meaning, using the scenario table below
- Let the label carry the meaning; the icon is a secondary cue and colour is never the only signal
- Use `customIcon` for a context-specific icon: 16px, `variant="Linear"`, `color="currentColor"`
- Make a badge removable by passing `onDismiss` (the × only renders with a handler); give it a `dismissLabel` when the label is not a plain string
- Move focus somewhere deliberate when the last removable value goes

**Don't**
- Don't hand-roll a status pill with its own classes and literal colours; use `Badge`
- Don't give `new` an icon at either end
- Don't pair a type icon with a × unless a spec calls for it
- Don't place badges on coloured surfaces that undercut the text contrast

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

Badges appear inside table cells, cards, headers, and list rows.

**Canonical spec:** padding `var(--space-xss) var(--space-sm)` (6px 12px); radius `var(--radius-full)`; gap `var(--space-xs)` (4px), `var(--space-s)` (8px) once a × is present; label 14px Medium, line height 1.2; icons 16px `currentColor`; text tokens `--text-success`, `--text-warning`, `--text-error`, `--text-progress`, `--text-secondary`; fills are 16% tints of the type colour, `var(--input-background)` for informative, solid `var(--danger-400)` for new; ✕ is io5 `IoCloseOutline` (1px stroke, 16px box); Hover (dismissible only) doubles the fill to 32% and puts the ✕ on a 24% disc of the type colour (informative: Neutral-200 light / Neutral-500 dark). Figma: Library `EC26cSVe9KNTCWXvYovakw`, `5799:479`.

## Figma to code

| Figma property | Figma values | React prop | Prop values | Notes |
|---|---|---|---|---|
| Type | Success / Warning / Error / In progress / Informative / New | `type` | `success` (default) / `warning` / `error` / `in-progress` / `informative` / `new` | Figma default is also Success |
| Icon left | true / false | `icon` | `true` / `false` (default) | `customIcon` replaces the type icon; ignored on `new` |
| Icon right | true / false | `onDismiss` | handler present / absent | the ✕ renders only when a handler is passed; there is no boolean |
| State | Enabled / Hover / Focus | n/a | CSS `:hover`, `:focus-visible` | Hover and Focus exist only on dismissible badges; Focus draws the ring on the ✕ |
| (label text) | each type carries its own label ("Success", "Warning", "In progress", "Error", "Informative", "New") | `label` | string or node, defaults to the type label | no shared text property on purpose: one would give every type the same default label; type over the text in Figma |

There is **no size axis**. Both icons are independent: a badge can carry either, both, or neither. Figma draws no variant with a type icon **and** a ✕; see Anatomy.

- **Figma only:** Figma names the type "Informative"; the code default label is "Information". `Icon left` and `Icon right` stay variants, not booleans: the In progress label changes line height with the icon, the ✕ also widens the gap from XS to S, and Figma has no badge with both icons. The leading icon has no swap property because it is the type icon and differs per type; a single swap property would force one glyph on every type.
- **Code only:** types `quiz` and `scheduled` (see [App extensions](#app-extensions)); `customIcon`; `label` (string or node, so a label can pair two weights); `dismissLabel`; `className`.

**Props**

```tsx
import Badge from '@/components/Badge/Badge'

type BadgeType =
  | 'success' | 'warning' | 'error' | 'in-progress' | 'informative' | 'new'
  | 'quiz' | 'scheduled'   // app extensions

interface BadgeProps {
  type?: BadgeType        // default 'success'
  icon?: boolean          // leading type-icon (Icon left in Figma); ignored on 'new'
  customIcon?: ReactNode  // replaces the type icon (16px, currentColor)
  label?: ReactNode       // overrides the default label; a node can pair two weights
  className?: string
  onDismiss?: () => void  // trailing ✕ (Icon right in Figma); passing it is what renders it
  dismissLabel?: string   // aria-label for the ✕; defaults to `Remove ${label}`
}
```

**Production:**

| Design system | `@web/ui` component | Props mapping | Known drift |
|---|---|---|---|
| Badge | _to be mapped by engineering_ | | |

## Anatomy

```
┌────────────────────────────────────┐
│  [iconLeft?]  Label Text   [✕?]    │   ← pill, radius XXL (40px ≡ --radius-full)
└────────────────────────────────────┘
      ↑            ↑            ↑
    16px    14px Poppins       16px
            Medium, lh 1.2
```

| Property | Figma variable | Token |
|----------|----------------|-------|
| Padding (vertical) | XSS · 6 | `--space-xss` |
| Padding (horizontal) | SM · 12 | `--space-sm` |
| Gap icon → label | XS · 4 | `--space-xs` |
| Gap once the badge carries a ✕ | S · 8 | `--space-s` |
| Radius | XXL · 40 | `--radius-full` |
| Icon | 16 × 16, `currentColor` | n/a |

The box is identical whichever icons are present; padding does **not** tighten on either icon side. Only the gap changes: XS normally, S once a ✕ is in the pill, so the label and the control it sits beside stay legibly apart.

The Library draws the dismissible badge as `iconLeft + iconRight`, and there is no variant carrying a type icon **and** a ✕; the ✕ takes the leading icon's place. The component allows both because the two props are independent, but pair them only if a spec calls for it.

The ✕ is io5 `IoCloseOutline` as drawn in the Library: a 1px stroked path in a 16px box, in `currentColor`, so it resolves to the badge's own text token in every type and both modes.

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

/* Dismissible */
.badge--dismissible { gap: var(--space-s); }

/* Trailing dismiss: inherits the type's text colour, adds no chrome of its own */
.badge__dismiss {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding: 0;
  background: transparent;
  border: none;
  color: inherit;
  cursor: pointer;
}

.badge__dismiss:focus-visible {
  outline: 2px solid var(--primary-button-background);
  outline-offset: 2px;
  border-radius: var(--radius-xs);
}
```

## Variants

Fills are literal 16% tints of the type's 500-level colour and are **the same in both modes** (Informative uses the mode-aware `--input-background`). Text is a semantic token that resolves per mode; icons inherit it via `currentColor`.

| Type | Fill (both modes) | Text token | Light | Dark | Leading icon (Iconsax Linear) | Default label |
|------|-------------------|------------|-------|------|-------------------------------|---------------|
| **Success** | `rgba(24, 169, 87, 0.16)` Success-500 | `--text-success` | `#11763D` | `#18A957` | `TickCircle` | Success |
| **Warning** | `rgba(255, 165, 56, 0.16)` Warning-500 | `--text-warning` | `#E88206` | `#FFA538` | `InfoCircle` | Warning |
| **Error** | `rgba(223, 22, 66, 0.16)` Danger-500 | `--text-error` | `#DF1642` | `#E95C7B` | `Danger` | Error |
| **In Progress** | `rgba(0, 206, 230, 0.16)` Primary-500 | `--text-progress` | `#008393` | `#00CEE6` | `TaskSquare` | In Progress |
| **Informative** | `var(--input-background)` Neutral @ 16% | `--text-secondary` | `#454C5E` | `#BFC2CC` | `InfoCircle` ¹ | Information |
| **New** | `var(--danger-400)` `#E95C7B` **solid** | `--neutral-25` | `#F9F9FA` | `#F9F9FA` | none, never | New |

¹ Figma draws Informative with Ionicons `IoInformationCircleOutline`; the codebase is Iconsax-only, so `InfoCircle` Linear is the approved stand-in (visually equivalent at 16px).

```css
.badge--success      { background: rgba(24, 169, 87, 0.16);  color: var(--text-success); }
.badge--warning      { background: rgba(255, 165, 56, 0.16); color: var(--text-warning); }
.badge--error        { background: rgba(223, 22, 66, 0.16);  color: var(--text-error); }
.badge--in-progress  { background: rgba(0, 206, 230, 0.16);  color: var(--text-progress); }
.badge--informative  { background: var(--input-background); color: var(--text-secondary); }
.badge--new          { background: var(--danger-400);        color: var(--neutral-25); }
```

**New** is the only solid badge; it draws attention to freshly added content and deliberately has no icon variant.

### App extensions

Not in the Library Badge component. They follow the same box and typography; treat them as accepted code extensions until they land in Figma.

| Type | Fill | Text token | Light | Dark | Icon | Default label | Source |
|------|------|------------|-------|------|------|---------------|--------|
| **Quiz** | `var(--quiz-background)` Certificate-quiz @ 16% | `--text-quiz` | `#6368DB` | `#FFDBAF` | custom `LessonQuiz` via `customIcon` | Quiz Required | lesson/assessment cards |
| **Scheduled** | `rgba(42, 144, 216, 0.16)` Course-assessments @ 16% | `--course-assessments` | `#2A90D8` | `#2A90D8` | none | Scheduled | Figma `9200:58569` (enrolment not yet open) |

```css
.badge--quiz       { background: var(--quiz-background);     color: var(--text-quiz); }
.badge--scheduled  { background: rgba(42, 144, 216, 0.16);   color: var(--course-assessments); }
```

## States

| State | Applies to | Pill fill | ✕ |
|---|---|---|---|
| Enabled | all types | type fill (see Variants) | no chrome, inherits text colour |
| Hover | dismissible badges only | type colour at 32% (informative: Neutral-200 light / Neutral-500 dark at 32%) | sits on a 24% disc of the type colour (informative: Neutral-200 light / Neutral-500 dark) |
| Focus-visible | the ✕ button | unchanged | 2px `var(--primary-button-background)` outline, 2px offset, `var(--radius-xs)` |

A badge without a ✕ is read-only and has no hover.

## Tokens

`--space-xss`, `--space-sm`, `--space-xs`, `--space-s`, `--radius-full`, `--radius-xs`; text `--text-success`, `--text-warning`, `--text-error`, `--text-progress`, `--text-secondary`, `--neutral-25`, `--text-quiz`, `--course-assessments`; fills `--input-background`, `--danger-400`, `--quiz-background`; focus `--primary-button-background`. Values per type and mode are in the Variants tables.

## Accessibility

- The ✕ is a real `<button>` with an `aria-label` (`Remove <label>` by default) and a visible `:focus-visible` ring, so a dismissible badge is reachable and operable from the keyboard. Removing the last value should move focus somewhere deliberate, usually the control that adds values back.
- The component sets `role="status"` so state changes are announced. For purely decorative category tags, wrap in an element with `role="presentation"` or pass `aria-hidden` via the parent.
- The label is the primary carrier of meaning; never rely on colour alone. The icon is a secondary cue.
- All text/fill pairs meet WCAG AA at 14px Medium in both modes; the light text tokens are the darker 600/700 steps for exactly this reason. Do not place badges on coloured surfaces that undercut that contrast.

## Content

- Default labels: Success, Warning, Error, In Progress, Information, New, Quiz Required, Scheduled. Pass `label` to override.
- `New` takes no icons at either end.

## Examples

```tsx
<Badge type="success" label="Completed" icon />
<Badge type="error" label="Overdue" icon />
<Badge type="in-progress" label="Enrolled" />
<Badge type="informative" label="12 Lessons" />
<Badge type="new" />
<Badge type="quiz" customIcon={<LessonQuizIcon />} />
<Badge type="informative" label="Harbour View" onDismiss={() => remove('Harbour View')} />
```

`onDismiss` is the ✕: there is no boolean to draw one without a handler, because a dismiss that does nothing is a decoy control.

Every icon is rendered `size={16} variant="Linear" color="currentColor"`; with iconsax-react 0.0.8 on React 19 the `color` prop must be passed explicitly.

## Related

- [chips-switcher-tabs.md](chips-switcher-tabs.md) - Chip, the interactive pill
- [alerts-toast.md](alerts-toast.md) - Alert and Callout for messages
- [colors.md](colors.md) - the palette behind the text tokens
