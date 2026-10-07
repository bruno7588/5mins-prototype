---
name: 5mins-listbox
description: Listbox / menu component for 5Mins.ai — the floating options surface used by dropdowns, action menus, and pickers. Covers the container (caret top/bottom, plain, grouped with headers + dividers) and the list item with its full slot matrix (icon left/right, avatar, skill icon, checkbox, radio, Integer stepper row, embedded search, supporting text, helper/options text) and states (Enabled, Hover, Selected, Selected + Hover, Read-only). Use for any menu, options list, action popover, or picker surface.
---

# 5Mins.ai Listbox

The floating menu surface: a container of list items that appears from a trigger (dropdown, "more" button, picker). Items support a wide range of slot configurations.

Spec source: Figma Library (`EC26cSVe9KNTCWXvYovakw`) — Listbox light `11923:3466` / dark `9162:1042`, List items light `11908:6300` / dark `9162:941` (verified 2026-07-03). Colors are semantic tokens resolving per mode (see `colors.md`).

> **Updated 2026-09-29 (verified against code):** arrow-key navigation marked as not built; danger icons turn red only with `color="currentColor"`; shadow named `var(--shadow-l)`; supporting-text rows now state both built variants (`RowActionsMenu` label 500 + `--text-tertiary`, `Dropdown` label 600 + `--text-secondary`).

> **Updated 2026-09-29 (aligned to prototype usage):** the container border and group divider are now `--border-elevated` (a menu is an elevated surface; `RowActionsMenu` already draws it this way), the selected row uses the mode-aware `--selected` rather than raw `--secondary-500` (as the built Dropdown menu does), and the leading icon is `--text-primary`.

> **Updated 2026-10-07 (Figma List items dark `9162:941`):** new **Integer** variant (radio + supporting text + Input integer stepper and a "day" / "days" unit, `12432:11845`), used by the Assign courses timing popover. **Selected + Hover** variants exist for every row type. **Rows with a checkbox or radio do not fill amber when selected**: the control carries the selection, hover is `--cards-background-hover` (the built `Dropdown` already does this). Checkbox rows have a 12px control-to-label gap. The Search row has Enabled, Hover, Selected (focused, amber border + clear ×) and Read-only states.

## Usage

**Intent:** the floating surface that lists options or actions under a trigger, so the user can pick a value or run an action without leaving the page.

**Use when**
- A row or toolbar needs a menu of actions behind a kebab or button (e.g. Unenrol, Rename) → `RowActionsMenu`.
- A Dropdown is open and shows its options (the Dropdown owns this surface for you).
- A typeahead or picker shows matches under a search field, e.g. the automation course search.
- A long filterable list needs an embedded search row pinned at the top, e.g. "Search filters".

**Don't use when**
- The user sets a form value from a fixed list → use Dropdown ([doc](dropdown.md)), which renders this surface itself
- The content is a form or several fields → use a Modal or Side Drawer ([doc](overlays.md))
- The content is a short hint on hover → use Tooltip ([doc](alerts-toast.md))

**Do**
- Use `RowActionsMenu` for action menus; it already implements this spec, the caret, the portal and Escape to close.
- Portal the menu to `<body>` and anchor it to the trigger's rect so a table cell, modal or drawer with `overflow: hidden` can't clip it.
- Colour leading icons `--text-primary` (20px Iconsax Linear); in `RowActionsMenu` pass `color="currentColor"` and the item supplies it. Mark destructive items with `danger`, which turns the label `--text-error`; the icon only turns red if it has `color="currentColor"`.
- Use `role="menu"` / `menuitem` for action menus and `role="listbox"` / `option` with `aria-selected` for value lists.
- Add a supporting line (`description`) only when the label alone doesn't separate one action from its neighbours.
- Use the Integer row when an option needs a number of days or weeks set inline, e.g. "After delay" / "X days after previous course enrolment" with the stepper and "day" / "days" under it.
- Let the checkbox or radio show a selected multi-select or radio row; keep the row background plain.
- Separate groups with a 1px `--border-elevated` divider (`dividerBefore`).

**Don't**
- Don't use `--border` for the container border or dividers; on a menu it matches `--cards-background` in dark mode and vanishes.
- Don't use raw `--secondary-500` for the selected row; use `--selected` with `--text-on-selected`.
- Don't fill a checkbox or radio row amber when it is selected; the amber fill is for plain single-select rows only.
- Don't add an empty icon slot to rows that have no icon; plain choice lists carry no icons.
- Don't build a new menu surface for a page when `RowActionsMenu` or `Dropdown` covers it.

**Canonical spec:** container `--cards-background`, 1px `--border-elevated`, radius `var(--radius-sm)` (12px), padding `var(--space-s)` (8px), shadow `var(--shadow-l)` (see `layout.md`). Item padding `var(--space-s) var(--space-sm)` (8px 12px), radius `var(--radius-s)` (8px), label 14px / 400 / 1.5 `--text-primary`, icon-to-label gap `var(--space-s)` (8px). Hover `--cards-background-hover`; selected (plain, icon, avatar, skill-icon and supporting-text rows) `--selected` with `--text-on-selected` at weight 500; selected checkbox / radio / Integer rows keep the plain background and show the ticked control, hovering to `--cards-background-hover`; read-only `--text-disabled`. Integer row: radio, then a column with an 8px gap: label 14px / 500 `--text-primary` over supporting text 14px / 400 `--text-tertiary` (4px gap), then the Input integer stepper and the unit 14px / 400 `--text-secondary`, 8px apart. Figma: Library `EC26cSVe9KNTCWXvYovakw`, Listbox light `11923:3466` / dark `9162:1042`, List items light `11908:6300` / dark `9162:941`.

**Prototype:**
- `src/components/RowActionsMenu/RowActionsMenu.tsx`: `items` (`key`, `label`, `icon`, `description`, `danger`, `dividerBefore`, `disabled`, `title`, `inert`), `onSelect`, `placement` `'bottom' | 'top'`, `caret` (default on), `triggerClassName` / `triggerContent` to replace the kebab.
- `src/components/Dropdown/Dropdown.tsx`: renders this surface as its menu (`.dropdown-menu`), with checkbox rows in `multiple` mode.
- Integer row: `src/pages/your-courses/components/AssignCoursesWizard/SchedulePopover.tsx` (`.acw-pop-option`, built from `Radio` + `InputInteger`; page-local, no shared component yet).

**Production:**

| Design system | `@web/ui` component | Props mapping | Known drift |
|---|---|---|---|
| Listbox (RowActionsMenu, Dropdown menu) | _to be mapped by engineering_ | | |

---

## Container

```
Background:  var(--cards-background)
Border:      1px solid var(--border-elevated)
Radius:      12px (--radius-sm)
Padding:     8px (--space-s)
Shadow:      var(--shadow-l)
```

### Variants

| Variant | Use |
|---|---|
| **Caret = Bottom** | Menu opens *below* the trigger — caret (8px arrow) points up from the container's top-right |
| **Caret = Top** | Menu opens *above* — caret points down at bottom-right (16px inset) |
| **No caret** | Default attached menu (dropdown lists) |
| **Wrapping menu items** (grouped) | Sections with a **group header** (Poppins Medium 14, `--text-tertiary`, `4px` h-padding / `8px` v-padding; subsequent groups `12px` top) separated by a 1px `--border-elevated` divider; 4px gap between groups |

```css
.listbox {
  background: var(--cards-background);
  border: 1px solid var(--border-elevated);
  border-radius: var(--radius-sm);      /* 12px */
  padding: var(--space-s);              /* 8px */
  box-shadow: var(--shadow-l);
  display: flex;
  flex-direction: column;
  max-height: 320px;                    /* then scroll */
  overflow-y: auto;
}

.listbox__group-header {
  padding: 8px 4px;
  font: 500 14px/1.5 'Poppins', sans-serif;
  color: var(--text-tertiary);
}
.listbox__group + .listbox__group .listbox__group-header { padding-top: 12px; }

.listbox__divider { height: 1px; margin: 0 4px; background: var(--border-elevated); border-radius: 4px; }
```

---

## List Item

Base: `padding: 8px 12px` · `radius: 8px` (`--radius-s`) · label Poppins Regular 14 `--text-primary`.

### States

| State | Background | Label |
|---|---|---|
| Enabled | transparent (container bg) | `--text-primary` |
| Hover | `--cards-background-hover` | `--text-primary` |
| **Selected** | `--selected` (`#EDA30D` light / `#FFBB38` dark) | **`--text-on-selected`** (weight 500) — dark on amber, same family as chips/switcher |
| Selected + Hover | `--selected` | `--text-on-selected` |
| Selected, checkbox / radio / Integer row | transparent; the control shows the selection | `--text-primary` |
| Selected + Hover, checkbox / radio / Integer row | `--cards-background-hover` | `--text-primary` |
| Read-only (disabled) | transparent | `--text-disabled`, muted slots |

### Slot matrix

All combinable per the Figma variant axes; gaps are the load-bearing detail:

| Slot | Spec | Gap to label |
|---|---|---|
| **Icon left** | 20px Iconsax Linear, `--text-primary` | 8px |
| **Icon right / chevron** | 21px `ArrowRight2` for submenu / drill-in | in right cluster |
| **Helper ("options") text** | Regular 14 `--text-secondary` + chevron, right-aligned cluster (8px internal gap) | **24px** from the label cluster |
| **Avatar** | 40px circular (see `avatars.md`) | 12px |
| **Skill icon** | 20px illustration (see skill card) | 8px |
| **Checkbox** | 16px checkbox box (see `selection-controls.md`) — multi-select lists. No amber fill when selected | **12px** |
| **Radio** | radio in a 16 x 24 column — single-select lists. No amber fill when selected | 8px |
| **Integer** | radio + supporting text, then an Input integer stepper (see `input.md`) and a unit ("day" / "days", 14px `--text-secondary`) 8px apart, 8px under the text. Label Medium 500. Figma `12432:11845` (Disabled `12432:13335`: every text `--text-disabled`) | 8px |
| **Supporting text** | second line, Regular 14. The two built menus differ: `RowActionsMenu` uses a **Medium (500)** label over a `--text-tertiary` description (Figma Library spec), while `Dropdown` uses a **Semibold (600)** label over a `--text-secondary` description that may wrap (`Dropdown.css`). **4px** column gap in `RowActionsMenu`; items top-aligned; in `RowActionsMenu` both lines stay on one row (no wrap). Read-only turns both lines `--text-disabled`. Figma Library List items `10187:2585` (verified 2026-09-16) | — |
| **Search** | an embedded search field as the first item: 240px, `--input-background` fill, radius 12, `8px 12px` padding, 18px icon, placeholder `--text-disabled`. States: Enabled, Hover (`--border-hover` outline), Selected (focused: `--selected` border, typed text, clear ×), Read-only. Figma `10775:2692` | — |

Item heights for reference: 37px plain · 40px with avatar/radio · ~60–62px with supporting text · 107px Integer row · 53px search row.

### CSS

```css
.listbox__item {
  display: flex;
  align-items: center;
  gap: var(--space-s);                  /* 8px; avatar rows use 12px */
  padding: var(--space-s) var(--space-sm);  /* 8px 12px */
  border-radius: var(--radius-s);       /* 8px */
  font: 400 14px/1.5 'Poppins', sans-serif;
  color: var(--text-primary);
  cursor: pointer;
  white-space: nowrap;
}
.listbox__item:hover        { background: var(--cards-background-hover); }
.listbox__item.is-selected  { background: var(--selected); color: var(--text-on-selected); font-weight: 500; }
.listbox__item.is-readonly  { color: var(--text-disabled); pointer-events: none; }

/* Right-aligned options cluster (helper text + chevron) */
.listbox__item-options {
  display: flex;
  align-items: center;
  gap: var(--space-s);
  margin-left: var(--space-l);          /* 24px from label */
  color: var(--text-secondary);
}

/* Supporting-text rows (RowActionsMenu values; Dropdown uses label 600 + --text-secondary) */
.listbox__item--rich { align-items: flex-start; }
.listbox__item--rich .listbox__item-info { display: flex; flex-direction: column; gap: var(--space-xs); white-space: nowrap; }
.listbox__item--rich .listbox__item-title { font-weight: 500; }
.listbox__item--rich .listbox__item-supporting { font-weight: 400; color: var(--text-tertiary); }
.listbox__item--rich.is-readonly .listbox__item-title,
.listbox__item--rich.is-readonly .listbox__item-supporting { color: var(--text-disabled); }
```

### React sketch

```tsx
interface ListboxItemProps {
  label: string;
  supporting?: string;
  iconLeft?: ReactNode;      // 20px
  avatar?: string;           // 40px src
  options?: string;          // right helper text (+ chevron for submenu)
  checkbox?: boolean;
  radio?: boolean;
  selected?: boolean;
  readOnly?: boolean;
  onSelect?: () => void;
}

<div className="listbox" role="listbox">
  <ListboxItem label="Rename" iconLeft={<Edit2 size={20} />} />
  <ListboxItem label="Move to" options="Folder" />          {/* chevron submenu */}
  <ListboxItem label="Archive" selected />
</div>
```

---

## Behaviour

- Anchored to its trigger; caret variants for detached/tooltip-style anchoring, no-caret for flush dropdown menus.
- Max height then scroll; the embedded Search item stays pinned at the top for long filterable lists.
- Keyboard: `Enter` selects and `Esc` closes; Tab moves between items. `↑ ↓` arrow-key navigation is the target but is not built in `RowActionsMenu` or `Dropdown` yet. Roles: `role="listbox"` / `role="option"` + `aria-selected` (or `role="menu"`/`menuitem` for action menus).
- Checkbox rows toggle without closing the menu; radio and plain rows select and close.

## Relationship to other components

- **`dropdown.md`** — the dropdown trigger opens this listbox (its previous "extrapolated menu" section is superseded by this spec).
- **`chips-switcher-tabs.md`** — the selected-item amber matches chips and the content switcher; listbox rows use the mode-aware `--selected` + `--text-on-selected`.
- **`avatars.md` / `selection-controls.md` / `search.md`** — the slot components used inside items.
