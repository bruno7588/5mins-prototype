---
name: 5mins-calendar
description: Calendar / date picker for 5Mins.ai — the date input field (Enabled, Hover, Active, Error states, optional label) and the month-grid calendar popover with all day-cell states (default, outside-month, hover, focus, current day, selected, streak illustration). Use when implementing any date field, date picker, calendar popover, scheduling input, or month grid.
---

# 5Mins.ai Calendar & Date Field

A date input field that opens a month-grid calendar popover. Weeks start on **Monday**.

Spec source: Figma Library — date field light `11916:6112` / dark `11529:406`, day item light `11916:6094` / dark `5279:26511` (verified 2026-07-03). All colors are semantic tokens that resolve per mode (see `colors.md`).

---

## Anatomy

```
Label                        ← optional, Poppins Semibold 14
┌──────────────────────┐
│ dd/mm/yyyy       [📅] │    ← trigger field
└──────────────────────┘
┌──────────────────────┐
│ July 2024        ‹ ›  │    ← popover (Active state)
│ Mon Tue Wed … Sun     │
│  27  28  29 … 2       │
│  …                    │
└──────────────────────┘
Date is required!            ← helper text (Error state only)
```

The column stacks label → field → popover/helper with an **8px gap**.

---

## Date Field (trigger)

```
Padding:  8px 12px   (--space-s --space-sm)
Radius:   12px       (--radius-sm)
Gap:      16px between value and icon
Icon:     calendar, 20px, trailing
Value:    Poppins Regular 14 — placeholder "dd/mm/yyyy"
Label:    Poppins Semibold 14, var(--text-secondary)   (Paragraph M semibold)
```

### States

| State | Border (1px) | Background | Value text | Extras |
|---|---|---|---|---|
| Enabled | `--border` | transparent | `--text-secondary` | — |
| Hover | `--border-hover` | `--input-background` | `--text-secondary` | — |
| Active (open) | `--selected` (`#EDA30D` light / `#FFBB38` dark) | transparent | `--text-primary` | popover renders below |
| Error | `--text-error` | transparent | `--text-primary` | warning-triangle icon (20px) before the calendar icon; label turns `--text-error`; helper text below |

- **Error helper:** Poppins Regular 14, `var(--text-error)` (e.g. "Date is required!").
- Token rule: **form-field active borders use the mode-aware `--selected` token** (`#EDA30D` light / `#FFBB38` dark — date field, dropdown, inputs, search), the same token as selection fills (day cells, tab indicator). The Figma light node shows a raw `Secondary-500` binding on this field — treat that as a stale binding; `--selected` is the rule.

---

## Calendar Popover

```
Background:  var(--cards-background)
Border:      1px solid var(--border)
Radius:      12px (--radius-sm)
Shadow:      Shadow L — -4px 0 24px rgba(32, 34, 42, 0.12)
Width:       360px  (7×40px cells + 6×8px gaps + 2×16px padding)
```

### Sections (top → bottom)

| Section | Padding | Content |
|---|---|---|
| Month header | 16px 16px 8px | Month + year, Poppins **Bold 16** (H4), `--text-primary`; prev/next chevrons 20px (Iconsax `ArrowLeft2`/`ArrowRight2`), 16px apart |
| Weekday row | 8px 16px 4px | Mon–Sun, 40×40 cells, Poppins Regular 14, `--text-secondary` |
| Date grid | 4px 16px 16px | Rows of 7 day items, 8px horizontal gap, no vertical gap |

---

## Day Item (40×40)

| State | Background | Border | Radius | Text |
|---|---|---|---|---|
| Default (in month) | — | — | 4px | Regular 14 `--text-primary` |
| Outside month / disabled | — | — | 4px | Regular 14 `--text-disabled`, **50% opacity** on the cell |
| Hover | `--cards-background-hover` | — | 8px | Regular 14 `--text-primary` |
| Focus | — | 1px `--selected` | 8px | Regular 14 `--text-primary` |
| Current day | — | 1px `--border` | 8px | Regular 14 `--text-primary` |
| **Selected** | `--selected` | — | 8px | **Medium 14 `--text-on-selected`** — dark label in both modes |
| Illustration | — | — | — | 23×28px streak graphic replaces the number (learner streak calendar) |

---

## CSS

```css
/* ── Field ── */
.date-field { display: flex; flex-direction: column; gap: var(--space-s); }

.date-field__label { font: 600 14px/1.5 'Poppins'; color: var(--text-secondary); }

.date-field__input {
  display: flex; align-items: center; gap: var(--space-m);
  padding: var(--space-s) var(--space-sm);         /* 8px 12px */
  border: 1px solid var(--border-elevated);
  border-radius: var(--radius-sm);                  /* 12px */
  font: 400 14px/1.5 'Poppins'; color: var(--text-secondary);
  cursor: pointer;
}
.date-field__input:hover  { border-color: var(--border-hover); background: var(--input-background); }
.date-field__input.is-open  { border-color: var(--selected); color: var(--text-primary); }
.date-field--error .date-field__input { border-color: var(--text-error); color: var(--text-primary); }
.date-field--error .date-field__label,
.date-field__helper--error { color: var(--text-error); font: 400 14px/1.5 'Poppins'; }

/* ── Popover ── */
.calendar {
  background: var(--cards-background);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  box-shadow: -4px 0 24px rgba(32, 34, 42, 0.12);   /* Shadow L, leftward */
}
.calendar__header { display: flex; align-items: center; justify-content: space-between; padding: 16px 16px 8px; }
.calendar__title  { font: 700 16px/1.5 'Poppins'; color: var(--text-primary); }
.calendar__nav    { display: flex; gap: var(--space-m); }
.calendar__weekdays { display: flex; gap: var(--space-s); padding: 8px 16px 4px; }
.calendar__weekday  { width: 40px; height: 40px; display: grid; place-items: center;
                      font: 400 14px/1.5 'Poppins'; color: var(--text-secondary); }
.calendar__grid  { padding: 4px 16px 16px; }
.calendar__row   { display: flex; gap: var(--space-s); }

/* ── Day item ── */
.cal-day {
  width: 40px; height: 40px;
  display: grid; place-items: center;
  border-radius: var(--radius-xs);                  /* 4px */
  font: 400 14px/1.5 'Poppins'; color: var(--text-primary);
  cursor: pointer;
}
.cal-day--outside  { color: var(--text-disabled); opacity: 0.5; pointer-events: none; }
.cal-day:hover     { background: var(--cards-background-hover); border-radius: var(--radius-s); }
.cal-day:focus-visible { border: 1px solid var(--selected); border-radius: var(--radius-s); outline: none; }
.cal-day--today    { border: 1px solid var(--border-elevated); border-radius: var(--radius-s); }
.cal-day--selected {
  background: var(--selected);
  border-radius: var(--radius-s);
  font-weight: 500;
  color: var(--text-on-selected);                        /* dark label in BOTH modes */
}
```

---

## Behaviour

- Clicking the field toggles the popover; selecting a day fills the field (`dd/mm/yyyy`) and closes it.
- Chevrons page months; the grid always renders full weeks, padding with prev/next-month days (outside-month styling).
- Weeks are **Monday-first**.
- Keyboard: arrow keys move day focus (focus ring = 1px `--selected`); Enter selects; Esc closes back to the field (Active border until closed).
- Popover open/close should animate per the project's GSAP ease-in-out convention.

---

## Token Summary

| Token | Light | Dark | Used for |
|---|---|---|---|
| `--border` / `--border-hover` | `#BFC2CC` / `#9EA4B3` | `#383D4C` / `#9EA4B3` | Field border + current-day ring / hover |
| `--input-background` | `#BFC2CC` @16% | `#454C5E` @16% | Field hover fill |
| `--selected` | `#EDA30D` | `#FFBB38` | Field active border, selected day fill, focus ring |
| `--cards-background` / `--cards-background-hover` | `#FFFFFF` / `#EFF0F2` | `#2D313D` / `#383D4C` | Popover / day hover |
| `--text-primary` / `--text-secondary` / `--text-disabled` | per colors.md | per colors.md | Day / weekday / outside-month text |
| `--text-error` | `#DF1642` | `#E95C7B` | Error border, label, helper |
| `--text-on-selected` | `#20222A` | `#20222A` | Selected-day label (weight 500) |

---

## Code reality

`src/pages/programs/components/CourseOutline/MiniCalendar.tsx` (`.mc__*` classes) implements this month grid (Mon-first, 42-cell build, trailing-week trim) from an earlier Figma node — reuse/extend it rather than building a new picker. The date *field* trigger appears in `ReleasePopover.tsx` and `EnrolPeopleDrawer.tsx`. There is no shared component in `src/components/` yet; promote MiniCalendar there if a third feature needs it.

## Related Skills

- `5mins-colors` (colors.md) — the semantic tokens above
- `layout.md` — spacing/radius scale, Shadow L
- `input.md` — text inputs (the date field follows the same state pattern with an amber active border)
