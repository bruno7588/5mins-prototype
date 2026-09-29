---
name: 5mins-bulk-action-bar
description: BulkActionBar for 5Mins.ai - the floating dark pill that slides up from the bottom of the page when table rows are selected, with the selection count, a clear button and the bulk actions. Use when a table or list supports multi-select and the user needs to act on the selected rows.
---

# 5Mins.ai Bulk Action Bar

The floating pill that appears at the bottom centre of the page once one or more rows are selected. It shows how many rows are selected, lets the user clear the selection, and holds the actions that apply to all of them. It uses the same dark surface as the tooltip, so its light text reads in both modes.

> **Updated 2026-09-29 (verified against code):** the "no mode-aware tokens" rule narrowed to surface text and border tokens; "filled action last" and "count in every label" softened to match People, CourseDetails and MyTeam.

Spec source: Figma: not recorded; code is the reference (`src/components/BulkActionBar/BulkActionBar.tsx` + `BulkActionBar.css`).

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
- Write action labels in Title Case; where it helps, put the count or object in the label ("Deactivate 3 Users", "Delete 3 Permanently"), as People does.
- Group several actions behind an "Actions" dropdown: a `RowActionsMenu` with `placement="top"`, `caret={false}` and `triggerClassName="bulk-bar-btn bulk-bar-btn--outlined bulk-bar-trigger"`, with an `ArrowDown2` chevron in `.bulk-bar-trigger-chevron`.
- Route destructive bulk actions through a `ConfirmModal` ([doc](confirm-modal.md)) before they run.
- Clear the selection once an action has run.

**Don't**
- Don't guard it with `count > 0 &&`; that unmounts it before the exit animation can play.
- Don't use mode-aware surface text and border tokens such as `--border` or `--text-primary` for bar content; the pill is dark in both modes, so they flip and wash out. The built-in fills and states (`--input-background`, `--text-disabled`, `--primary-button-background`) are fine.

**Canonical spec:** surface `var(--tooltip-background)` (Neutral-800 light / Neutral-900 dark); radius `var(--radius-m)` (16px); padding and gaps `var(--space-sm)` (12px); anchored `var(--space-l)` (24px) from the bottom, centred in the content area (offset 240px for the side panel), `z-index: 100`; clear button 32px circle `var(--radius-full)` on `var(--input-background)`; count 14px Regular `var(--neutral-200)`; action buttons 14px Bold, padding `var(--space-s)` `var(--space-sm)` (8px 12px), radius `var(--radius-sm)` (12px); primary `var(--primary-button-background)`, danger `var(--danger-500)`; dropdown trigger open and focus `var(--selected)`. Figma: Library `EC26cSVe9KNTCWXvYovakw`, light not recorded / dark not recorded.

**Prototype:** `src/components/BulkActionBar/BulkActionBar.tsx`
- `count`: selected rows; drives show and hide.
- `onClear`: the ✕ button ("Clear selection").
- `label`: word after the count (default "selected").
- `children`: `.bulk-bar-btn` buttons, or a `RowActionsMenu` styled as the "Actions" trigger.

**Production:**

| Design system | `@web/ui` component | Props mapping | Known drift |
|---|---|---|---|
| BulkActionBar | _to be mapped by engineering_ | | |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `count` | `number` | required | `> 0` shows the bar; `0` animates it out. |
| `onClear` | `() => void` | required | Called by the ✕ button (`aria-label="Clear selection"`). |
| `children` | `ReactNode` | required | The actions. |
| `label` | `string` | `'selected'` | Rendered as `{count} {label}`. |

**Child classes** (defined in `BulkActionBar.css`)

| Class | Look |
|---|---|
| `.bulk-bar-btn--primary` | Filled primary, hover `--primary-button-background-hover` |
| `.bulk-bar-btn--danger` | Filled `--danger-500`, hover `--danger-600` |
| `.bulk-bar-btn--outlined` | Transparent, white hairline, brighter on hover |
| `.bulk-bar-trigger` | Adds dropdown look to an outlined button: Regular weight, chevron right, `--selected` border when open |

## Anatomy and behaviour

```
.bulk-bar-layer (fixed, bottom centre, pointer-events: none)
└─ .bulk-bar (role="region", aria-label="Bulk actions")
   └─ .bulk-bar-content
      ├─ .bulk-bar-close   ✕ clears the selection
      ├─ .bulk-bar-count   "3 selected"
      ├─ .bulk-bar-divider
      └─ .bulk-bar-actions (children)
```

- **Enter and exit:** Framer Motion slides the pill 16px up and fades it in over 140ms; it leaves a little faster (100ms) so dismissal feels responsive. `prefers-reduced-motion` removes the motion.
- **Width:** the pill measures its content and animates width changes (200ms ease-in-out) instead of jumping when the count label or the enabled actions change.
- **Held values on exit:** AnimatePresence keeps the last selected render while the bar leaves, so the count holds its value rather than flashing to zero.
- **Disabled actions:** a `.bulk-bar-btn:disabled` takes `--text-disabled` on a transparent fill.
- **Focus:** only `.bulk-bar-trigger` defines a `:focus-visible` ring (`--selected`); the clear button and the other `.bulk-bar-btn` variants have none yet. Add one when touching them.

**Current call sites:** `CourseDetails.tsx` (Actions dropdown + Send Reminder), `MyTeam.tsx` (Send Reminders), `UserProfile.tsx` (Actions dropdown), `People.tsx` (Deactivate; Reactivate + Delete on the deactivated tab).
