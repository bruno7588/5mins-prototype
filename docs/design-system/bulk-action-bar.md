---
name: 5mins-bulk-action-bar
description: BulkActionBar for 5Mins.ai - the floating dark pill that slides up from the bottom of the page when table rows are selected, with the selection count, a clear button and the bulk actions. Use when a table or list supports multi-select and the user needs to act on the selected rows.
---

# Bulk action bar

The floating pill at the bottom centre of the page that, once rows are selected, shows how many, lets the user clear the selection, and holds the actions that apply to all of them; it uses the same dark surface as the tooltip, so its light text reads in both modes.

**Code:** `import BulkActionBar from '@/components/BulkActionBar/BulkActionBar'` (`src/components/BulkActionBar/BulkActionBar.tsx` + `BulkActionBar.css`; code is the reference)
**Figma:** Library `EC26cSVe9KNTCWXvYovakw`, no component (light not recorded / dark not recorded)
**Last verified:** 2026-09-29

## Usage

**Intent:** lets the user act on every selected row at once, and always shows how many rows the action will touch.

**Use when**
- A table has row checkboxes and at least one action applies to the whole selection (send reminders, deactivate, reactivate, delete, extend due dates).
- You need a place for bulk actions that stays in view while the user scrolls the table.

**Don't use when**
- The action applies to a single row → use the row kebab menu ([doc](row-actions-menu.md))
- The action is a page-level action that needs no selection → use a header `Button` ([doc](buttons.md))
- The table has no multi-select → use the `Table` without selection ([doc](table.md))

**Do**
- Mount it unconditionally and let `count` drive it; the bar animates itself in above 0 and out at 0.
- Pass `onClear` that empties the selection, and a `label` noun when "selected" alone is vague ("enrolments selected").
- Render actions as plain `<button>` elements with `.bulk-bar-btn` plus one of `--primary`, `--danger` or `--outlined`.
- Order actions by how the flow reads; there is no fixed position for the filled action (People puts Reactivate before Delete).
- Group several actions behind an "Actions" dropdown: a `RowActionsMenu` with `placement="top"`, `caret={false}` and `triggerClassName="bulk-bar-btn bulk-bar-btn--outlined bulk-bar-trigger"`, with an `ArrowDown2` chevron in `.bulk-bar-trigger-chevron`.
- Route destructive bulk actions through a `ConfirmModal` ([doc](confirm-modal.md)) before they run.
- Clear the selection once an action has run.

**Don't**
- Don't guard it with `count > 0 &&`; that unmounts it before the exit animation can play.
- Don't use mode-aware surface text and border tokens such as `--border` or `--text-primary` for bar content; the pill is dark in both modes, so they flip and wash out. The built-in fills and states (`--input-background`, `--text-disabled`, `--primary-button-background`) are fine.

**Canonical spec:** surface `var(--tooltip-background)` (Neutral-800 light / Neutral-900 dark); radius `var(--radius-m)` (16px); padding and gaps `var(--space-sm)` (12px); anchored `var(--space-l)` (24px) from the bottom, centred in the content area (offset 240px for the side panel), `z-index: 100`; clear button 32px circle `var(--radius-full)` on `var(--input-background)`; count 14px Regular `var(--neutral-200)`; action buttons 14px Bold, padding `var(--space-s)` `var(--space-sm)` (8px 12px), radius `var(--radius-sm)` (12px); primary `var(--primary-button-background)`, danger `var(--danger-500)`; dropdown trigger open and focus `var(--selected)`.

## Figma to code

There is no Bulk action bar component in the Figma Library; the bar is specified by code. Its action buttons map to CSS classes, not to the DS `Button`.

| Figma property | Figma values | React prop | Prop values | Notes |
|---|---|---|---|---|
| n/a | n/a | child class | `.bulk-bar-btn--primary` / `--danger` / `--outlined` | Action button look, set by class on each child `<button>` |
| n/a | n/a | child class | `.bulk-bar-trigger` | Adds the dropdown look to an outlined `RowActionsMenu` trigger |

- **Figma only:** none.
- **Code only:** `count`, `onClear`, `label`, `children`.

**Props**

| Prop | Type | Default | Notes |
|---|---|---|---|
| `count` | `number` | required | Selected rows; drives show and hide. `> 0` shows the bar; `0` animates it out. |
| `onClear` | `() => void` | required | Called by the ✕ button (`aria-label="Clear selection"`). |
| `children` | `ReactNode` | required | The actions: `.bulk-bar-btn` buttons, or a `RowActionsMenu` styled as the "Actions" trigger. |
| `label` | `string` | `'selected'` | Word after the count, rendered as `{count} {label}`. |

**Production:**

| Design system | `@web/ui` component | Props mapping | Known drift |
|---|---|---|---|
| BulkActionBar | _to be mapped by engineering_ | | |

## Anatomy

```
.bulk-bar-layer (fixed, bottom centre, pointer-events: none)
└─ .bulk-bar (role="region", aria-label="Bulk actions")
   └─ .bulk-bar-content
      ├─ .bulk-bar-close   ✕ clears the selection
      ├─ .bulk-bar-count   "3 selected"
      ├─ .bulk-bar-divider
      └─ .bulk-bar-actions (children)
```

- **Width:** the pill measures its content and animates width changes (200ms ease-in-out) instead of jumping when the count label or the enabled actions change.
- **Current call sites:** `CourseDetails.tsx` (Actions dropdown + Send Reminder), `MyTeam.tsx` (Send Reminders), `UserProfile.tsx` (Actions dropdown), `People.tsx` (Deactivate; Reactivate + Delete on the deactivated tab).

## Variants

**Child classes** (defined in `BulkActionBar.css`)

| Class | Look |
|---|---|
| `.bulk-bar-btn--primary` | Filled primary, hover `--primary-button-background-hover` |
| `.bulk-bar-btn--danger` | Filled `--danger-500`, hover `--danger-600` |
| `.bulk-bar-btn--outlined` | Transparent, white hairline, brighter on hover |
| `.bulk-bar-trigger` | Adds dropdown look to an outlined button: Regular weight, chevron right, `--selected` border when open |

## States

| State | Behaviour and tokens |
|---|---|
| Entering | Framer Motion slides the pill 16px up and fades it in over 140ms. |
| Leaving | Leaves a little faster (100ms) so dismissal feels responsive. AnimatePresence keeps the last selected render while the bar leaves, so the count holds its value rather than flashing to zero. |
| Reduced motion | `prefers-reduced-motion` removes the motion. |
| Action hover | See the child classes under Variants. |
| Action disabled | `.bulk-bar-btn:disabled` takes `--text-disabled` on a transparent fill. |
| Trigger open | `.bulk-bar-trigger` border `var(--selected)`. |
| Focus-visible | Only `.bulk-bar-trigger` defines a `:focus-visible` ring (`--selected`); the clear button and the other `.bulk-bar-btn` variants have none yet. Add one when touching them. |

## Tokens

`var(--tooltip-background)`, `var(--radius-m)`, `var(--radius-sm)`, `var(--radius-full)`, `var(--space-sm)`, `var(--space-s)`, `var(--space-l)`, `var(--input-background)`, `var(--neutral-200)`, `var(--primary-button-background)`, `var(--primary-button-background-hover)`, `var(--danger-500)`, `var(--danger-600)`, `var(--text-disabled)`, `var(--selected)`.

## Accessibility

- **Role:** `.bulk-bar` is `role="region"` with `aria-label="Bulk actions"`.
- **Labels:** the clear button is `aria-label="Clear selection"`.
- **Focus-visible:** see States; the clear button and plain `.bulk-bar-btn` variants still need a ring.

## Content

- Write action labels in Title Case; where it helps, put the count or object in the label ("Deactivate 3 Users", "Delete 3 Permanently"), as People does.

## Related

- [row-actions-menu.md](row-actions-menu.md) - single-row actions, and the "Actions" dropdown trigger
- [confirm-modal.md](confirm-modal.md) - confirming destructive bulk actions
- [table.md](table.md) - row selection
- [buttons.md](buttons.md) - page-level actions
