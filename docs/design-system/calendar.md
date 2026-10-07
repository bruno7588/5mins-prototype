---
name: 5mins-calendar
description: Calendar / date picker for 5Mins.ai — the date input field (Enabled, Hover, Active, Error states, optional label) and the month-grid calendar popover with all day-cell states (default, outside-month, hover, focus, current day, selected, streak illustration). Use when implementing any date field, date picker, calendar popover, scheduling input, or month grid.
---

# 5Mins.ai Calendar & Date Field

A date input field that opens a month-grid calendar popover. Weeks start on **Monday**.

Spec source: Figma Library (`EC26cSVe9KNTCWXvYovakw`) — date field light `11916:6112` / dark `11529:406`, day item light `11916:6094` / dark `5279:26511` (verified 2026-07-03). All colors are semantic tokens that resolve per mode (see `colors.md`).

> **Updated 2026-09-29 (verified against code):** field padding is 4px 12px with an 8px gap (`DatePickerField.css`); the field label is rendered by the caller and stays `--text-secondary` in Error; outside-month days are clickable; the popover shadow is `var(--shadow-l)`; the keyboard note now reflects that focus does not move into the portalled `DatePickerField` popover; the GSAP popover animation is marked not built; the input.md cross-reference is corrected.

> **Updated 2026-09-29 (aligned to prototype usage):** the built date field (`DatePickerField`) rests on `--border-elevated`, shows its value in `--text-primary` with a `--text-disabled` placeholder, and has no hover fill (border only). The current-day ring is `--border-elevated`. Arrow-key movement between days is not built. "Code reality" now points to the shared `DatePickerField` component.

> **Updated 2026-10-07 (Figma `11529:406`):** the calendar defaults to today's date. A date field opens with today already filled in (`dd/mm/yyyy`, `--text-primary`), and the month grid opens on today's month with today selected. The `dd/mm/yyyy` placeholder only shows in date filters, which start empty: the user profile's from/to range and the automations join-date filter (which shows "Date is required" until a date is picked).

## Usage

### Date field

**Intent:** the closed field that shows a chosen date as `dd/mm/yyyy` and opens the month grid. Full component guidance lives in [date-picker-field.md](date-picker-field.md).

**Use when**
- Any form or filter needs a single date, e.g. a completion date, a new due date, a start date, a join-date filter.

**Don't use when**
- The value is a number of days → use InputInteger ([doc](input.md))
- The value is free text → use InputField ([doc](input.md))

**Do**
- Use `DatePickerField` rather than `<input type="date">` or `InputField type="date"`.
- Default the value to today's date. Only leave it empty (placeholder showing) in date filters, where the user picks the date deliberately (e.g. the automations join-date filter).
- Show a missing or invalid date with the Error state (error border, warning icon, helper text).

**Don't**
- Don't use the browser's native date picker; it doesn't match the design system.
- Don't use raw `--secondary-500` for the active border; use the mode-aware `--selected`.

**Canonical spec:** see [date-picker-field.md](date-picker-field.md). Figma: Library `EC26cSVe9KNTCWXvYovakw`, light `11916:6112` / dark `11529:406`.

**Prototype:** `src/components/DatePickerField/DatePickerField.tsx`

**Production:**

| Design system | `@web/ui` component | Props mapping | Known drift |
|---|---|---|---|
| Date field | _to be mapped by engineering_ | | |

### Calendar (month grid)

**Intent:** a Monday-first month grid for picking one day, opened from a date field or embedded in a scheduling popover.

**Use when**
- Behind a date field (`DatePickerField` renders it for you).
- Inside a scheduling popover or drawer that needs a day picked inline, e.g. release and enrolment dates.

**Don't use when**
- The user types or steps a number of days → use InputInteger ([doc](input.md))

**Do**
- Reuse `MiniCalendar` rather than building a new picker.
- Open on today's month with today selected when there is no value yet.
- Pass `maxDate` when later days aren't valid (e.g. a completion date of today or earlier); later days then render disabled and the next-month chevron stops.
- Mark the selected day with `--selected` fill and `--text-on-selected` label (dark in both modes).

**Don't**
- Don't render the popover inside a clipping ancestor; portal it, as `DatePickerField` does.
- Don't start weeks on Sunday; weeks are Monday-first.

**Canonical spec:** popover `--cards-background`, 1px `--border-elevated`, radius `var(--radius-sm)` (12px), Shadow L, 352px wide. Day cells 40 × 40px, 8px gap; hover `--cards-background-hover` at `var(--radius-s)` (8px); current day 1px `--border-elevated` ring; selected `--selected` fill with Medium 14 `--text-on-selected`; out-of-month and disabled `--text-disabled` at 50% opacity. Month title Semibold 16 `--text-primary`; weekdays Regular 14 `--text-secondary`. Figma: Library `EC26cSVe9KNTCWXvYovakw`, day item light `11916:6094` / dark `5279:26511`, Calendar `11529:430`.

**Prototype:** `src/pages/programs/components/CourseOutline/MiniCalendar.tsx`
- `value` (ISO `yyyy-mm-dd`), `onSelect(iso)`, `maxDate` (ISO)

**Production:**

| Design system | `@web/ui` component | Props mapping | Known drift |
|---|---|---|---|
| Calendar | _to be mapped by engineering_ | | |

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
Padding:  4px 12px   (--space-xs --space-sm), min height 37px
Radius:   12px       (--radius-sm)
Gap:      8px between value and icon   (--space-s)
Icon:     calendar, 20px, trailing
Value:    Poppins Regular 14, defaults to today's date; placeholder "dd/mm/yyyy" only when deliberately empty
Label:    Poppins Semibold 14, var(--text-secondary)   (Paragraph M semibold)
```

### States

| State | Border (1px) | Background | Value text | Extras |
|---|---|---|---|---|
| Enabled | `--border-elevated` | transparent | `--text-primary` (placeholder `--text-disabled`) | — |
| Hover | `--border-hover` | transparent | `--text-primary` (placeholder `--text-disabled`) | — |
| Active (open) | `--selected` (`#EDA30D` light / `#FFBB38` dark) | transparent | `--text-primary` | popover renders below |
| Error | `--text-error` | transparent | `--text-primary` | warning-triangle icon (20px) before the calendar icon; helper text below. The label is rendered by the caller and stays `--text-secondary` (Figma's Error variant reds the label; no call site does) |

- **Error helper:** Poppins Regular 14, `var(--text-error)` (e.g. "Date is required!").
- Token rule: **form-field active borders use the mode-aware `--selected` token** (`#EDA30D` light / `#FFBB38` dark — date field, dropdown, inputs, search), the same token as selection fills (day cells, tab indicator). The Figma light node shows a raw `Secondary-500` binding on this field — treat that as a stale binding; `--selected` is the rule.

---

## Calendar Popover

```
Background:  var(--cards-background)
Border:      1px solid var(--border-elevated)
Radius:      12px (--radius-sm)
Shadow:      Shadow L, var(--shadow-l)
Width:       352px  (7×40px cells + 6×8px gaps + 2×12px padding)
Gap:         0 between sections
Height:      344px (40 header + 48 weekday row + 256 six-week grid)
Source:      Figma Library Calendar 11529:430 (verified 2026-09-16)
```

### Sections (top → bottom)

| Section | Padding | Content |
|---|---|---|
| Month header | 12px 12px 4px | Month + year, Poppins **Semibold 16** (Paragraph L semibold), `--text-primary`; prev/next Library **Chevron** (`7443:1760`, overflow=false) at 20px: 12px Iconsax `ArrowLeft2`/`ArrowRight2` glyph in `--text-secondary`, hover circle `--page-background-hover`, disabled glyph `--text-disabled`; **4px** apart |
| Weekday row | 4px 12px | Mon–Sun, 40×40 cells, 8px gap, Poppins Regular 14, `--text-secondary` |
| Date grid | 4px 12px 12px | Rows of 7 day items, 8px horizontal gap, no vertical gap |

---

## Day Item (40×40)

| State | Background | Border | Radius | Text |
|---|---|---|---|---|
| Default (in month) | — | — | 4px | Regular 14 `--text-primary` |
| Outside month | — | — | 4px | Regular 14 `--text-disabled`, **50% opacity** on the cell; still clickable (selects that day) |
| Disabled (after `maxDate`) | — | — | 4px | Regular 14 `--text-disabled`, **50% opacity**, not clickable |
| Hover | `--cards-background-hover` | — | 8px | Regular 14 `--text-primary` |
| Focus | — | 1px `--primary-button-background` | 8px | Regular 14 `--text-primary` |
| Current day | — | 1px `--border-elevated` | 8px | Regular 14 `--text-primary` |
| **Selected** | `--selected` | — | 8px | **Medium 14 `--text-on-selected`** — dark label in both modes |
| Illustration | — | — | — | 23×28px streak graphic replaces the number (learner streak calendar) |

---

## CSS

```css
/* ── Field ── */
.date-field { display: flex; flex-direction: column; gap: var(--space-s); }

.date-field__label { font: 600 14px/1.5 'Poppins'; color: var(--text-secondary); }

.date-field__input {
  display: flex; align-items: center; gap: var(--space-s);
  min-height: 37px;
  padding: var(--space-xs) var(--space-sm);        /* 4px 12px */
  border: 1px solid var(--border-elevated);
  border-radius: var(--radius-sm);                  /* 12px */
  font: 400 14px/1.5 'Poppins'; color: var(--text-primary);
  cursor: pointer;
}
.date-field__input:hover  { border-color: var(--border-hover); }
.date-field__input.is-open  { border-color: var(--selected); color: var(--text-primary); }
.date-field--error .date-field__input { border-color: var(--text-error); color: var(--text-primary); }
.date-field__helper--error { color: var(--text-error); font: 400 14px/1.5 'Poppins'; }

/* ── Popover ── */
.calendar {
  background: var(--cards-background);
  border: 1px solid var(--border-elevated);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-l);                       /* Shadow L */
  display: flex; flex-direction: column;
}
.calendar__header { display: flex; align-items: center; justify-content: space-between; padding: 12px 12px 4px; }
.calendar__title  { font: 600 16px/1.5 'Poppins'; color: var(--text-primary); }
.calendar__nav    { display: flex; gap: var(--space-xs); }
.calendar__weekdays { display: flex; gap: var(--space-s); padding: 4px 12px; }
.calendar__weekday  { width: 40px; height: 40px; display: grid; place-items: center;
                      font: 400 14px/1.5 'Poppins'; color: var(--text-secondary); }
.calendar__grid  { padding: 4px 12px 12px; }
.calendar__row   { display: flex; gap: var(--space-s); }

/* ── Day item ── */
.cal-day {
  width: 40px; height: 40px;
  display: grid; place-items: center;
  border-radius: var(--radius-xs);                  /* 4px */
  font: 400 14px/1.5 'Poppins'; color: var(--text-primary);
  cursor: pointer;
}
.cal-day--outside  { color: var(--text-disabled); opacity: 0.5; }   /* still clickable */
.cal-day--disabled { color: var(--text-disabled); opacity: 0.5; pointer-events: none; }
.cal-day:hover     { background: var(--cards-background-hover); border-radius: var(--radius-s); }
.cal-day:focus-visible { border: 1px solid var(--primary-button-background); border-radius: var(--radius-s); outline: none; }
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

- **Default: today's date.** The field opens with today filled in, and the grid opens on today's month with today drawn as selected. If a field is deliberately empty, the grid still opens on today's month with today selected.
- Clicking the field toggles the popover; selecting a day fills the field (`dd/mm/yyyy`) and closes it.
- Chevrons page months; the grid always renders full weeks, padding with prev/next-month days (outside-month styling).
- Weeks are **Monday-first**.
- Keyboard: day cells are buttons (focus ring = 1px `--primary-button-background`, cyan like every focus ring), and Enter selects a focused day. Where `MiniCalendar` is embedded inline (`ReleasePopover`, `EnrolPeopleDrawer`) the days are reachable with Tab. In `DatePickerField` the popover is portalled to the end of `<body>` and focus does not move into it, so Tab from the field does not reach the days; Esc closes the popover. Arrow-key movement between days is not built.
- The popover opens and closes without animation in the prototype; the GSAP ease-in-out convention is not built here.

---

## Token Summary

| Token | Light | Dark | Used for |
|---|---|---|---|
| `--border-elevated` / `--border-hover` | `#DFE1E6` / `#9EA4B3` | `#383D4C` / `#9EA4B3` | Field border + current-day ring / hover |
| `--selected` | `#EDA30D` | `#FFBB38` | Field active border, selected day fill |
| `--cards-background` / `--cards-background-hover` | `#FFFFFF` / `#EFF0F2` | `#2D313D` / `#383D4C` | Popover / day hover |
| `--text-primary` / `--text-secondary` / `--text-disabled` | per colors.md | per colors.md | Day / weekday / outside-month text |
| `--text-error` | `#DF1642` | `#E95C7B` | Error border, warning icon, helper |
| `--text-on-selected` | `#20222A` | `#20222A` | Selected-day label (weight 500) |

---

## Code reality

`src/pages/programs/components/CourseOutline/MiniCalendar.tsx` (`.mc__*` classes) implements this month grid (Mon-first, 42-cell build, trailing-week trim, optional `maxDate`) from an earlier Figma node. The shared field + popover is `src/components/DatePickerField/DatePickerField.tsx`, which wraps MiniCalendar; see `date-picker-field.md`. Use it for any date input. `ReleasePopover.tsx` and `EnrolPeopleDrawer.tsx` embed MiniCalendar directly inside their own popovers.

## Related Skills

- `5mins-colors` (colors.md) — the semantic tokens above
- `layout.md` — spacing/radius scale, Shadow L
- `input.md` - text inputs (the date field shares the amber `--selected` active border, but has no hover fill and its own 4px 12px padding)
