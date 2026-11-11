---
name: 5mins-bulk-action-bar
description: BulkActionBar for 5Mins.ai - the floating dark pill that slides up from the bottom of the page when table rows are selected, with the selection count, a clear button and the bulk actions. Use when a table or list supports multi-select and the user needs to act on the selected rows.
---

# Bulk action bar

The floating pill at the bottom centre of the page that, once rows are selected, shows how many, lets the user clear the selection, and holds the actions that apply to all of them; it uses the same dark surface as the tooltip, so its light text reads in both modes.

**Code:** `import BulkActionBar from '@/components/BulkActionBar/BulkActionBar'` (`src/components/BulkActionBar/BulkActionBar.tsx` + `BulkActionBar.css`; code is the reference)
**Figma:** Library `EC26cSVe9KNTCWXvYovakw`, `12632:98` (one component set, Actions = Buttons / Menu; contents use dark-mode tokens in both themes)
**Last verified:** 2026-11-11

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
- Render filled actions with the shared `Button` (`src/components/Button`): default for the primary action, `semantic="danger"` for destructive ones, leading icons through its `icon` prop.
- Order actions by how the flow reads; there is no fixed position for the filled action (People puts Reactivate before Delete).
- Group several actions behind an "Actions" dropdown: a `RowActionsMenu` with `placement="top"`, `caret={false}` and `triggerClassName="bulk-bar-btn bulk-bar-btn--outlined bulk-bar-trigger"`, with an `ArrowDown2` chevron in `.bulk-bar-trigger-chevron`.
- Route destructive bulk actions through a `ConfirmModal` ([doc](confirm-modal.md)) before they run.
- Clear the selection once an action has run.

**Don't**
- Don't guard it with `count > 0 &&`; that unmounts it before the exit animation can play.
- Don't hard-code light-on-dark colours for bar content. `.bulk-bar-content` carries `data-theme="dark"`, so semantic tokens (`--text-primary`, `--text-secondary`, `--border-elevated`, `--input-background`) already resolve to their dark values in both modes.

**Canonical spec:** surface `var(--tooltip-background)` (Neutral-800 light / Neutral-900 dark); radius `var(--radius-m)` (16px); padding and gaps `var(--space-sm)` (12px); anchored `var(--space-l)` (24px) from the bottom, centred in the content area (offset 240px for the side panel), `z-index: 100`; shadow `var(--shadow-xl)`; clear button 32px circle `var(--radius-full)` on `var(--input-background)`; count 14px Regular `var(--text-secondary)`; divider 1 x 24px `var(--border-elevated)`; action buttons are the shared `Button`, Medium (41px tall); the Actions dropdown trigger matches Dropdown medium: 8px 12px, 37px tall, 1px `var(--border-elevated)`, hover `var(--border-hover)`; dropdown trigger open and focus `var(--selected)`.

## Figma to code

The Library component draws its actions with `Buttons` (Medium) and `Dropdown` instances. In code the buttons are the shared `Button`; the dropdown is a `RowActionsMenu` trigger styled by the bar's CSS.

| Figma property | Figma values | React prop | Prop values | Notes |
|---|---|---|---|---|
| Count (text) | "3 selected" | `count`, `label` | `number`, `string` | rendered as `{count} {label}` |
| Actions | Buttons | children | `<Button>` / `<Button semantic="danger">` | shared Button, Medium |
| Actions | Menu | child class | `.bulk-bar-btn--outlined` + `.bulk-bar-trigger` | Dropdown look on a `RowActionsMenu` trigger |

- **Figma only:** none.
- **Code only:** `onClear`, `children`.

**Props**

| Prop | Type | Default | Notes |
|---|---|---|---|
| `count` | `number` | required | Selected rows; drives show and hide. `> 0` shows the bar; `0` animates it out. |
| `onClear` | `() => void` | required | Called by the ✕ button (`aria-label="Clear selection"`). |
| `children` | `ReactNode` | required | The actions: shared `Button`s, and/or a `RowActionsMenu` styled as the "Actions" trigger. |
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
| `.bulk-bar-btn--outlined` | Transparent, `--border-elevated` hairline, `--border-hover` on hover |
| `.bulk-bar-trigger` | Adds dropdown look to an outlined button: Regular weight, chevron right, `--selected` border when open |

## States

| State | Behaviour and tokens |
|---|---|
| Entering | Framer Motion slides the pill 16px up and fades it in over 140ms. |
| Leaving | Leaves a little faster (100ms) so dismissal feels responsive. AnimatePresence keeps the last selected render while the bar leaves, so the count holds its value rather than flashing to zero. |
| Reduced motion | `prefers-reduced-motion` removes the motion. |
| Action hover | Buttons follow buttons.md; the trigger follows the child classes under Variants. |
| Action disabled | Buttons follow buttons.md; a disabled trigger takes `--text-disabled` on a transparent fill. |
| Trigger open | `.bulk-bar-trigger` border `var(--selected)`. |
| Focus-visible | `.bulk-bar-trigger` and the shared `Button` have `:focus-visible` rings; the clear button has none yet. Add one when touching it. |

## Tokens

`var(--tooltip-background)`, `var(--radius-m)`, `var(--radius-sm)`, `var(--radius-full)`, `var(--space-sm)`, `var(--space-s)`, `var(--space-l)`, `var(--input-background)`, `var(--text-primary)`, `var(--text-secondary)`, `var(--border-elevated)`, `var(--border-hover)`, `var(--shadow-xl)`, `var(--text-disabled)`, `var(--selected)`.

## Accessibility

- **Role:** `.bulk-bar` is `role="region"` with `aria-label="Bulk actions"`.
- **Labels:** the clear button is `aria-label="Clear selection"`.
- **Focus-visible:** see States; the clear button still needs a ring.

## Content

- Write action labels in Title Case; where it helps, put the count or object in the label ("Deactivate 3 Users", "Delete 3 Permanently"), as People does.

## Related

- [row-actions-menu.md](row-actions-menu.md) - single-row actions, and the "Actions" dropdown trigger
- [confirm-modal.md](confirm-modal.md) - confirming destructive bulk actions
- [table.md](table.md) - row selection
- [buttons.md](buttons.md) - page-level actions
