---
name: 5mins-filter-bar
description: Filter bar component for 5Mins.ai (`src/components/FilterBar`). Use when a table or list needs more than one field filter - the People step, Learning records, a learner's course progress. Covers the four Library states (Empty/Filled x Collapsed/Expanded), collapsed pills with "+N" overflow, one row per filter (icon, "<Field> is", control, remove), Add Filter and Clear All, tokens and the React API. Trigger whenever building a filter panel, "Add Filter" flow, active-filter pills, or a collapsible filters card.
---

# Filter bar

A card that holds a list's field filters. The head always shows **Filters** and a count; collapsed, it summarises the active filters as pills; expanded, it shows one row per filter with its control.

**Code:** `import FilterBar, { FilterBarAddButton, type FilterBarFilter } from '@/components/FilterBar/FilterBar'`
**Figma:** Library `EC26cSVe9KNTCWXvYovakw`, component set "Filter bar", dark `12438:2724` / light `12462:987`. Built from the People picker filter bar (`PeoplePicker.tsx`). Colours are semantic tokens resolving per mode (see `colors.md`).
**Last verified:** 2026-10-08

## Usage

**Intent:** let an admin narrow a table or list by several fields at once, and see at a glance which filters are on.

**Use when**
- A list can be filtered by two or more fields (team, status, dates, custom fields), e.g. the People step, Learning records, a learner's Course progress.
- Admins add filters one at a time from a menu of fields.

**Don't use when**
- There is one free-text filter → Search ([doc](search.md))
- The list switches between a few fixed views → Chips or Content switcher ([doc](chips-switcher-tabs.md))
- A single field is filtered from a column header or toolbar → Dropdown ([doc](dropdown.md))
- The rows are form input that gets saved, not a view of a list (e.g. Automations trigger criteria in `TriggerFilters.tsx`, which live inside a card, are always visible and feed save validation) → keep them as form rows; a collapsible card would hide required inputs

**Do**
- Use `FilterBar`; the page keeps filter state, renders each row's control and owns the Add Filter menu (usually a Listbox, [doc](listbox.md)).
- Use `FilterBarAddButton` for the Add Filter trigger so the icon, tooltip and disabled reason match everywhere.
- Label rows "<Field> is" (the default). Pass `rowLabel` only when "is" reads wrongly (custom fields: "Account Type").
- Pass `removable: false` when the control carries its own remove (a multi select with its own ×).
- Pass `pillLabel` with the chosen value when one fits ("Completed", "Progress 20-80%"), so the collapsed bar says what is filtered, not just which field.
- Put the bar directly above the list it filters, full width.

**Don't**
- Don't hand-roll the card, count badge, chevron or pills; every filter bar in the product should look the same.
- Don't nest a Filter bar inside a card; it is the card (Shadow S on the page ground).
- Don't hide Clear All when nothing is set; it stays visible and disabled, with a "No filters to clear" tooltip.

## Figma to code

| Figma property | Figma values | React prop | Prop values | Notes |
|---|---|---|---|---|
| State | Empty / Filled | `filters` | `[]` / one or more `FilterBarFilter` | derived from `filters.length`, not a prop |
| Expanded | false / true | `expanded` | `false` / `true` | page owns the state; toggled through `onToggleExpanded` |
| Body (slot) | filter rows | `filters[].control` | ReactNode per filter | each row's control is rendered by the page |

- **Figma only:** the `Body` slot as a free container; no hover or focus variants (hover and focus are CSS in code).
- **Code only:** `onToggleExpanded`, `onRemove(id)`, `onClearAll`, `renderAddFilter(placement)`, `maxPills` (default 6), `className`; on `FilterBarFilter`: `id`, `title`, `Icon`, `pillLabel`, `rowLabel`, `removable`; the `FilterBarAddButton` export (`open`, `onClick`, `disabled`, `disabledReason`, children).

**Production:**

| Design system | `@web/ui` component | Props mapping | Known drift |
|---|---|---|---|
| Filter bar | _to be mapped by engineering_ | | |

## Anatomy

| Part | Spec |
|---|---|
| Card | `--cards-background`, radius `--radius-sm` (12), padding `--space-s` (8) vertical / `--space-sm` (12) horizontal, `--shadow-s` |
| Head | row, gap `--space-sm` (12), min height 37 |
| "Filters" | Poppins Bold 14 (H5), `--text-primary` |
| Count | pill, `--input-background-elevated`, Regular 14 `--text-secondary`, padding 1px `--space-xss` (6), min width 24, radius full |
| Collapsed, empty | Add Filter text button (20px `Add` icon) |
| Collapsed, filled | one Chip per filter (16px field icon, label, ×), gap `--space-sm` (12); past `maxPills` (default 6) a "+N" chip. Clicking a pill expands the bar; its × removes the filter. |
| Chevron | 16px `ArrowDown2`, `--text-tertiary`, in a 28px circle (hover `--cards-background-hover`); rotates 180° when expanded |
| Body (expanded) | column, gap `--space-sm` (12); `--space-m` (16) under the head, `--space-sm` (12) when empty |
| Filter row | 20px field icon (`--text-secondary`), "<Field> is" Regular 14 `--text-primary`, the control, 16px CloseButton remove (hover: `--cards-background-hover` circle, glyph `--text-error`, Tooltip "Remove <Field> filter"); gap `--space-s` (8), min height 37 |
| Actions | Add Filter + Clear All text buttons, gap `--space-m` (16). Clear All rests `--text-primary`, disabled `--text-disabled` |

The collapsed summary fades out (220ms) while the body opens with `Collapse` (GSAP), so the head never jumps. Reduced motion turns both off.

## States

| State | Head | Body |
|---|---|---|
| Empty, collapsed | Filters 0 · Add Filter · chevron | - |
| Filled, collapsed | Filters N · pills (+N) · chevron | - |
| Filled, expanded | Filters N · chevron | rows, then Add Filter / Clear All |
| Empty, expanded | Filters 0 · chevron | Add Filter / Clear All (disabled) |

| Interaction | Tokens |
|---|---|
| Chevron hover | 28px circle `--cards-background-hover` |
| Row remove hover | `--cards-background-hover` circle, glyph `--text-error` |
| Clear All disabled | `--text-disabled`, tooltip "No filters to clear" |
| Add Filter disabled | tooltip gives the reason ("All filters are already added") |
| Focus-visible | cyan `--primary-button-background` ring, 2px, offset 2 |

## Tokens

`var(--cards-background)`, `var(--cards-background-hover)`, `var(--input-background-elevated)`, `var(--text-primary)`, `var(--text-secondary)`, `var(--text-tertiary)`, `var(--text-error)`, `var(--text-disabled)`, `var(--primary-button-background)` (focus ring), `var(--shadow-s)`, `var(--radius-sm)`, `var(--space-xss)`, `var(--space-s)`, `var(--space-sm)`, `var(--space-m)`.

## Accessibility

- The "Filters" label and the chevron are both buttons with `aria-expanded`; the chevron's name is "Expand filters" / "Collapse filters".
- Each remove button is named "Remove <Field> filter".
- Add Filter sets `aria-haspopup="listbox"` and `aria-expanded`; when disabled, its tooltip says why.
- Focus rings: cyan `--primary-button-background`, 2px, offset 2.

## Examples

```tsx
import FilterBar, { FilterBarAddButton, type FilterBarFilter } from '@/components/FilterBar/FilterBar'

const active: FilterBarFilter[] = activeIds.map((id) => ({
  id,
  title: FIELDS[id].title,          // "Team"
  Icon: FIELDS[id].Icon,            // Iconsax component
  control: renderControl(id),       // Dropdown, multi select, DatePickerField
  removable: FIELDS[id].kind !== 'multi',
}))

<FilterBar
  filters={active}
  expanded={expanded}
  onToggleExpanded={() => setExpanded((e) => !e)}
  onRemove={removeFilter}
  onClearAll={() => setFilters({})}
  renderAddFilter={(placement) => {
    const ref = placement === 'header' ? headerAddRef : actionsAddRef
    const open = addOpen === placement
    return (
      <FilterBarAddButton ref={ref} open={open} disabled={available.length === 0} onClick={() => setAddOpen(open ? null : placement)}>
        <FilterListbox open={open} anchorRef={ref} groups={available} onSelect={addFilter} onClose={() => setAddOpen(null)} />
      </FilterBarAddButton>
    )
  }}
/>
```

`FilterBarFilter`: `id`, `title`, `Icon`, `control`, optional `pillLabel`, `rowLabel`, `removable`.

Props: `filters`, `expanded`, `onToggleExpanded`, `onRemove(id)`, `onClearAll`, `renderAddFilter(placement)`, `maxPills` (6), `className`. `FilterBarAddButton`: `open`, `onClick`, `disabled`, `disabledReason` ("All filters are already added"), children = the menu, anchored to its wrapper (`ref`).

## Related

- [search.md](search.md) - single free-text filter
- [dropdown.md](dropdown.md) - row controls and single-field filters
- [listbox.md](listbox.md) - the Add Filter menu
- [chips-switcher-tabs.md](chips-switcher-tabs.md) - the collapsed pills and fixed-view switching
- [collapse.md](collapse.md) - the expand animation
