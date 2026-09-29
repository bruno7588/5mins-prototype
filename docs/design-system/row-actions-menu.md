---
name: 5mins-row-actions-menu
description: RowActionsMenu for 5Mins.ai - the kebab (more) button on a table or list row that opens a portalled action menu built on the DS listbox, with icons, supporting text, danger items, dividers and disabled items. Use when a row, card or toolbar needs an overflow menu of actions.
---

# 5Mins.ai Row Actions Menu

The kebab button at the end of a table row and the action menu it opens. The menu is the DS listbox ([listbox.md](listbox.md)) in its action-menu form: a floating surface of items that each run one action on that row. It is portalled to `<body>` so it escapes the table cell's `overflow: hidden`, and stays glued to its trigger on scroll and resize.

> **Updated 2026-09-29 (verified against code):** leading icons now `color="currentColor"` (`.ram-item-icon` supplies `--text-primary`); the unsupported "single action → Small Button" rule removed; disabled-item wording reworded; shadow named `var(--shadow-l)`; focus ring corrected to `--primary-button-background` (what `RowActionsMenu.css` uses); stale listbox `--border` bullet removed.

Spec source: Figma Library (`EC26cSVe9KNTCWXvYovakw`) via [listbox.md](listbox.md) - Listbox light `11923:3466` / dark `9162:1042`, List items light `11908:6300` / dark `9162:941`; two-line item People `8572:654`. Code is the reference for the trigger.

## Usage

**Intent:** keeps a row's secondary actions one click away without crowding the row, and says which actions exist for that row.

**Use when**
- A table or list row has more than one action (edit, change status, make admin, delete).
- A toolbar or the bulk action bar needs an "Actions" dropdown that opens a list of actions.
- A text button opens a short list of choices that each run immediately (Add Field in the Limited Admin drawer).

**Don't use when**
- The user picks a value for a form field or filter → use the Dropdown ([doc](dropdown.md))
- The action applies to several selected rows → use the bulk action bar ([doc](bulk-action-bar.md))

**Do**
- Use the shared component: `import RowActionsMenu, { type RowMenuItem } from '@/components/RowActionsMenu/RowActionsMenu'`.
- Give it an `ariaLabel` that names the row ("Actions for Jane Doe").
- Use 20px Iconsax Linear icons with `color="currentColor"` for leading icons; the item supplies `var(--text-primary)` through `.ram-item-icon`, and danger or disabled items recolour it.
- Put the destructive item last, with `danger: true` and `dividerBefore: true` to separate it.
- Give a danger item's icon `color="currentColor"` so it takes the item's `--text-error`.
- Add `description` where the label alone doesn't separate an action from its neighbours.
- If you show an action that isn't valid for this row, mark it `disabled: true` and give the reason in `description` or `title`.
- Leave out `icon` on every item when the menu is a list of plain choices.
- Restyle the trigger with `triggerClassName` and `triggerContent` (e.g. a text button, or the bulk bar "Actions" trigger) rather than building another menu.
- Use `placement="top"` and `caret={false}` when the menu opens upward from a toolbar or the bulk action bar.

**Don't**
- Don't hand-roll a kebab menu with page-level classes and your own positioning.
- Don't put the native `disabled` attribute on items; the component uses `aria-disabled` so keyboard and screen-reader users can still reach the item and its reason.
- Don't give a danger item's icon a raw palette colour such as `var(--danger-500)`; it reads darker than the label in dark mode.
- Don't wrap the menu in your own portal or popover; it already portals and positions itself.

**Canonical spec:** trigger 28px circle `var(--radius-full)`, hover and open `var(--input-background)`, kebab icon 20px; menu min-width 240px, `var(--cards-background)`, 1px `var(--border-elevated)`, radius `var(--radius-sm)` (12px), padding `var(--space-s)` (8px), item gap `var(--space-xs)` (4px), shadow `var(--shadow-l)`, 8px from the trigger; item padding `var(--space-s)` `var(--space-sm)` (8px 12px), radius `var(--radius-s)` (8px), hover `var(--cards-background-hover)`, label 14px Regular `var(--text-primary)` (Medium when stacked), icon `var(--text-primary)`, description 14px `var(--text-tertiary)`, danger `var(--text-error)`, disabled `var(--text-disabled)`; divider 1px `var(--border-elevated)`; focus 2px `var(--primary-button-background)` inset outline. Figma: Library `EC26cSVe9KNTCWXvYovakw`, light `11923:3466` / dark `9162:1042` (items light `11908:6300` / dark `9162:941`).

**Prototype:** `src/components/RowActionsMenu/RowActionsMenu.tsx`
- `items: RowMenuItem[]` (`key`, `label`, `icon`, `description`, `danger`, `dividerBefore`, `disabled`, `title`, `inert`).
- `onSelect(key)`: called on click; the menu closes first.
- `ariaLabel`, `placement` (`bottom` default, `top`), `caret` (default `true`).
- `triggerClassName` (default `ram-trigger`), `triggerContent` (default kebab icon).

**Production:**

| Design system | `@web/ui` component | Props mapping | Known drift |
|---|---|---|---|
| RowActionsMenu (Listbox action menu) | _to be mapped by engineering_ | | |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `items` | `RowMenuItem[]` | required | Rendered in order. |
| `onSelect` | `(key: string) => void` | required | Not called for `disabled` or `inert` items. |
| `ariaLabel` | `string` | `'Row actions'` | Trigger's `aria-label`. |
| `placement` | `'bottom' \| 'top'` | `'bottom'` | `top` opens above the trigger. |
| `triggerClassName` | `string` | `'ram-trigger'` | Replaces the trigger's class. |
| `triggerContent` | `ReactNode` | kebab icon | Replaces the trigger's contents. |
| `caret` | `boolean` | `true` | Caret pointing at the trigger; off for attached dropdowns. |

**`RowMenuItem`**

| Field | Notes |
|---|---|
| `key`, `label` | Required. Label is one line, no wrap. |
| `icon` | Optional leading icon. |
| `description` | Second line; turns the item into the stacked (two-line) form. |
| `danger` | `--text-error` label and icon. |
| `dividerBefore` | Divider above the item. |
| `disabled` | Greyed, `aria-disabled`, not clickable. |
| `title` | Native tooltip, e.g. why an item is unavailable. |
| `inert` | Looks enabled but does nothing; only the arrow cursor signals it. Use `disabled` when the grey carries meaning. |

## Anatomy and behaviour

```
button.ram-trigger   aria-haspopup="menu", aria-expanded
└─ (portal) div.ram-menu   role="menu", position: fixed, z-index 2000
   ├─ span.ram-caret        optional, top-right
   ├─ div.ram-divider       role="separator" (dividerBefore)
   └─ button.ram-item       role="menuitem"
      ├─ .ram-item-icon
      └─ .ram-item-label  |  .ram-item-body > label + .ram-item-description
```

- **Position:** right-aligned to the trigger, 8px below it (or above with `placement="top"`). A tall menu on a low row flips above the trigger when there is more room there. It re-measures on scroll and resize.
- **Close:** selecting an item, Escape, or mousedown outside the trigger and menu.
- **Keyboard:** items are buttons, so Tab moves through them; arrow-key navigation (listbox.md) is not implemented yet.
- **Motion:** the menu fades and slides 4px in over 120ms; `prefers-reduced-motion` removes it.
- **Trigger focus:** `.ram-trigger` has no `:focus-visible` ring of its own yet; add one when touching it.

**Known drift**
- Hand-rolled kebab menus still exist: `.programs-kebab-menu` (`ProgramsAdmin.tsx`), `.content-table-menu` (`your-courses/components/ContentTable/ContentTable.tsx`), `.lf-menu` (`for-you/components/LessonFeed.tsx`).
- The questions-bank and scorm-content content tables colour the Delete icon `var(--danger-500)` instead of `currentColor`.
