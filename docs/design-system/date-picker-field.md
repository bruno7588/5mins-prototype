---
name: 5mins-date-picker-field
description: DatePickerField for 5Mins.ai, the shared date input that shows a dd/mm/yyyy value and opens the DS month-grid calendar in a portalled popover. Covers props, the Enabled, Hover, Active and Error states, maxDate bounds and from/to date ranges. Use when building any date field, due date, start or completion date, or date-range filter instead of a native date input.
---

# 5Mins.ai DatePickerField

`DatePickerField` is the shared date input: a bordered trigger that shows the chosen date as `dd/mm/yyyy` and opens the Monday-first month grid (`MiniCalendar`) in a popover. It replaces the browser's native `<input type="date">` so date entry matches the design system. The visual spec for the field and the grid lives in `calendar.md`; this doc covers the built component.

Spec source: Figma Library (`EC26cSVe9KNTCWXvYovakw`), date field light `11916:6112` / dark `11529:406` (from `calendar.md`); `src/components/DatePickerField/DatePickerField.tsx` is the reference for behaviour.

> **Updated 2026-09-29 (verified against code):** the popover's Shadow L is named as `var(--shadow-l)`, the z-index wording now gives the layer numbers, the label colour in Error is stated (stays `--text-secondary`), and a keyboard note records that focus does not enter the popover.

## Usage

**Intent:** lets the user pick a single calendar date from a month grid, stored as an ISO date.

**Use when**
- A form or modal needs one date, e.g. "Completion date", "New due date", "Start date".
- A filter row needs a date or a from/to range, e.g. "between [date] and [date]" or a join-date trigger filter.

**Don't use when**
- The value is a number of days → use InputInteger ([doc](input.md))
- The value is free text → use InputField ([doc](input.md))
- The date is picked inline inside a scheduling popover that already has its own layout → embed `MiniCalendar` directly ([doc](calendar.md))

**Do**
- Use `DatePickerField` for every date input; don't use `<input type="date">` or `InputField type="date"`.
- Pass a specific `ariaLabel` (e.g. "Completion date", "Start date"); the default "Choose a date" doesn't say which date.
- Render the visible label yourself above the field, as Paragraph M semibold (14px / 600) in `--text-secondary`; the component has no `label` prop. The label stays `--text-secondary` in the Error state at every current call site.
- Pass `maxDate` when later days aren't valid, and say so in the label hint (e.g. "today or earlier").
- Pass `error` with the message when a missing or invalid date blocks saving, so the field shows the problem where it is rather than only on the button.
- For a range, place two fields side by side with "from" and "to" `ariaLabel`s.
- Store and pass the value as ISO `yyyy-mm-dd` (`''` when empty); the field formats it for display.

**Don't**
- Don't restyle the popover through ancestor selectors; it is portalled to `<body>`, outside the field's DOM.
- Don't give the field a hover fill; hover only changes the border to `--border-hover`.
- Don't use raw `--secondary-500` for the open border; use the mode-aware `--selected`.
- Don't pass a display-formatted string (`dd/mm/yyyy`) as `value`.

**Canonical spec:** min width 160px, min height 37px, padding `var(--space-xs) var(--space-sm)` (4px 12px), radius `var(--radius-sm)` (12px), gap `var(--space-s)` (8px), text 14px Poppins. Border `--border-elevated`, `--border-hover` on hover, `--selected` while open, `--text-error` on error. Value `--text-primary`, placeholder `--text-disabled`. Calendar icon 20px Linear `--text-primary`; on error a 20px Linear `Danger` in `--text-error` sits before it; error helper 14px / 400 / 1.5 `--text-error`, `var(--space-s)` (8px) below. Popover per `calendar.md`, with Shadow L (`var(--shadow-l)`). Figma: Library `EC26cSVe9KNTCWXvYovakw`, light `11916:6112` / dark `11529:406`.

**Prototype:** `src/components/DatePickerField/DatePickerField.tsx` (default export)
- `value` (ISO or `''`), `onChange(iso)` (both required)
- `ariaLabel` (default "Choose a date"), `placeholder` (default "dd/mm/yyyy")
- `maxDate` (ISO) disables later days
- `error` (message) turns on the Error state and helper line
- `className`

**Production:**

| Design system | `@web/ui` component | Props mapping | Known drift |
|---|---|---|---|
| DatePickerField | _to be mapped by engineering_ | | |

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | required | ISO `yyyy-mm-dd`, or `''` when empty |
| `onChange` | `(iso: string) => void` | required | Fires with the picked day as ISO; the popover then closes |
| `placeholder` | `string` | `'dd/mm/yyyy'` | Shown in `--text-disabled` while `value` is empty |
| `ariaLabel` | `string` | `'Choose a date'` | Accessible name of the trigger button |
| `maxDate` | `string` | none | ISO; later days render disabled in the grid |
| `error` | `string` | none | Shows the Error state and renders this text as the helper line |
| `className` | `string` | `''` | Extra class on the wrapper |

There is no `label`, `disabled` or `minDate` prop.

## Anatomy and behaviour

```
[ dd/mm/yyyy        (!) [cal] ]   ← trigger button (warning icon only in Error)
Date is required.                 ← helper line (Error only)
┌──────────────────────────┐
│ September 2026     ‹ ›   │      ← MiniCalendar popover, portalled to <body>
│ Mon Tue Wed … Sun        │
└──────────────────────────┘
```

- **Trigger.** A `<button>` with `aria-haspopup="dialog"`, `aria-expanded`, and `aria-invalid` plus `aria-describedby` (pointing at the helper) when `error` is set. Clicking toggles the popover.
- **Display.** The ISO value is shown as `dd/mm/yyyy`; an empty value shows the placeholder.
- **Popover.** Rendered with `createPortal` into `<body>` at `position: fixed` and `z-index: 1060`, which sits above the modal and drawer layers (1000 to 1050) and below toasts (1100), 6px below the field. It follows the field on scroll and resize, flips above the field when there isn't room below, and is clamped 8px inside the viewport.
- **Selecting.** Picking a day calls `onChange(iso)` and closes the popover. With no value set, the grid opens on today's month with today drawn as the selection (the component passes today to `MiniCalendar`).
- **Closing.** A mousedown outside both the field and the popover closes it (listened for in the capture phase, so a modal that stops mousedown bubbling doesn't block it), and so does Escape.
- **Keyboard.** Focus does not move into the portalled popover, so Tab from the field does not reach the day cells; arrow-key movement is not built.
- **States.** Enabled, Hover (border only), Active while open (`--selected` border), Error (`--text-error` border, warning icon, helper). Placeholder and value colours follow `input.md`: `--text-disabled` empty, `--text-primary` filled.
- **Grid.** `MiniCalendar` (`src/pages/programs/components/CourseOutline/MiniCalendar.tsx`) draws the month header, weekday row and day cells per `calendar.md`, and disables days after `maxDate`.

## Related docs

- `calendar.md` for the field states and the month-grid spec
- `input.md` for field label typography and placeholder colour
- `overlays.md` for the modals this field often sits in
