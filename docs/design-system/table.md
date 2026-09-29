---
name: 5mins-table
description: Data table component for 5Mins.ai — card-style bordered rows (not a gridlined table), borderless header with optional sorting and select-all, all cell content types (text, supporting text, date, icon, checkbox, avatar, avatar group, illustration, thumbnail, progress bar, action icon, badge, button, dropdown), row states (Enabled, Hover, Selected, Selected-Hover, Disabled), pagination footer. Use for any data table, list view, records grid, or tabular layout.
---

# Table

Data table component for the 5Mins.ai admin and learner platform. Use for any rows of records: learners, enrolments, courses, roles, reports, audit logs, or any "show me rows of data" screen.

Spec source: Figma Library (`EC26cSVe9KNTCWXvYovakw`) — full table light `11927:7332` / dark `7896:2624`, row states light `11927:7487` / dark `7896:2804`, header light `11927:7554` / dark `11872:3077`, cell types light `11927:7602` / dark `11766:619` (verified 2026-07-03). Colors are semantic tokens resolving per mode (see `colors.md`).

> **Updated 2026-09-29 (aligned to prototype usage):** the sort arrow in "Header types" is 16px `ArrowDown`, revealed on hover and rotated for direction, matching `UserProfile.tsx`; it was listed as a 20px arrow.

> **Updated 2026-09-29 (verified against code):** selected rows now read `--selected-row` / `--selected-row-hover` throughout (the raw Secondary-500 12%/24% text is gone); the stale CSS block and React sample are replaced by a short example of the real `Table` API; date year is `--text-tertiary`, thumbnail 90×44, action-icon hover `--input-background`; avatar cells use `<Avatar>` / `<AvatarGroup>`; `RowActionsMenu` takes `ariaLabel`; tables in drawers and modals keep `--border`.

> **Updated 2026-09-29 (re-verified against Figma table data `11766:619`):** selected rows use the new `--selected-row` / `--selected-row-hover` tokens (Figma `Selected-row` / `Selected-row-hover`, Secondary-500 at 16% / 24%, both modes); row and header checkboxes sit in a 24px hit area in a 48px column (was 32px in 52px); single-line cell text is Regular 400 and only the primary line of a two-line cell is Semibold 600.

## Usage

**Intent:** show a set of records as rows the user can scan, compare, select in bulk and act on one at a time.

**Use when**
- The screen is "rows of records" with shared columns: people, courses, roles, enrolments, records, uploads.
- Users need to select several rows for a bulk action, sort by a column, or page through a long list.

**Don't use when**
- The items are rich visual content (thumbnails first, few fields) → use cards ([doc](cards.md))
- It is a short picker list inside a menu or dropdown → use Listbox ([doc](listbox.md))
- There are no rows yet → keep the header and show an empty state in place of the rows ([doc](empty-state.md))

**Do**
- Use `src/components/Table` for every data table; don't hand-roll one.
- Keep the card-row structure: filled header bar, then a stack of separate bordered rounded rows with a 12px gap. No gridlines, no outer border.
- Pass `pagination` and let the table render the "1-10 of 28" footer; it hides itself when everything fits on one page.
- Give fixed-width columns (actions, status) a `width` flex value such as `'0 0 56px'`; the header cell takes the same width automatically.
- For selection, pass `selectable`, `isSelected`, `onToggleRow`, `onToggleAll` and `allSelected`, and pair it with the BulkActionBar for the bulk actions.
- Put row actions in a trailing column with `RowActionsMenu` and an `ariaLabel` prop naming the row.
- Mark sortable columns with `sortable: true` and a 16px `ArrowDown` trailing the label: shown on the active column (rotated 180° for descending), revealed on hover for the others.
- Use a Toggle, Checkbox, Badge or Button component inside cells, not a restyled native control.
- Colours from semantic tokens only; rows sit on the page ground, so the row border is `--border`. The same holds inside drawers and modals, whose panels are `--page-background`.

**Don't**
- Don't build a gridlined `<table>` or a custom div table with its own classes.
- Don't write your own pagination row under a table.
- Don't hand-roll a switch in a cell; use Toggle.
- Don't wrap the table in your own horizontal scroll container; the table owns its scroll and pins the first column.
- Don't show the pagination footer for a single page of results.
- Don't turn cell text `--text-button-hover` on hover unless the cell is actually clickable.

**Canonical spec:** header bar `var(--input-background)`, `var(--radius-sm)` (12px); row `1px solid var(--border)`, radius 12px; row gap `var(--space-sm)` (12px); cell padding `var(--space-s) var(--space-sm)` (8px 12px); Poppins Regular 14px/1.5, header `--text-secondary`, cells `--text-primary`; row hover `--input-background`; selected row `var(--selected-row)` / `var(--selected-row-hover)`; checkbox column 48px with a 24px checkbox; single-line cell text Regular 400, primary line of a two-line cell Semibold 600. Figma: Library `EC26cSVe9KNTCWXvYovakw`, full table light `11927:7332` / dark `7896:2624`, row states light `11927:7487` / dark `7896:2804`.

**Prototype:** `src/components/Table/Table.tsx`
- `columns: Column<T>[]` with `key`, `header`, `render`, optional `sortable`, `width` (CSS flex shorthand), `align` (`left` | `right` | `center`), `cellClassName`.
- `rows`, `getRowKey` (required), `getRowState` (`enabled` | `hover` | `selected` | `disabled`), `onRowClick`.
- Selection: `selectable`, `isSelected`, `isRowSelectable`, `onToggleRow`, `onToggleAll`, `allSelected`, `selectAllIndeterminate`, `selectAllDisabled`.
- `onSort(key)`; the sort arrow itself is rendered by the caller inside `header`.
- `pagination: { from, to, total, onPrev, onNext }`.

**Production:**

| Design system | `@web/ui` component | Props mapping | Known drift |
|---|---|---|---|
| Table | _to be mapped by engineering_ | | |

## The one thing to get right first

This is **not** a traditional gridlined table. The defining structure is:

- The table is a vertical flex column with a `12px` gap between elements.
- The header is a **filled bar**: `background: var(--input-background)`, `border-radius: var(--radius-sm)` (12px), header cells padded `8px 12px` (`--space-s --space-sm`), text in `--text-secondary`. (Updated 2026-07 — was previously borderless/transparent.)
- Each data row is its own self-contained card: a `1px` border, `12px` corner radius, with the 12px gap showing the page background between rows.
- There are no vertical column dividers and no single outer table border.
- A pagination footer sits below, right-aligned.

If you render a classic bordered grid with shared cell lines, it is wrong. Think "stack of rounded row-cards under a plain header".

```
   Header    Header    Header    Header          <- borderless, text-secondary
 (12px gap)
┌─────────────────────────────────────────────┐
│  Cell      Cell      Cell      Cell          │  <- bordered rounded card
└─────────────────────────────────────────────┘
 (12px gap)
┌─────────────────────────────────────────────┐
│  Cell      Cell      Cell      Cell          │  <- bordered rounded card
└─────────────────────────────────────────────┘
                              1-10 of 28  <  >     <- pagination, right-aligned
```

## Architecture

| Part | What it is |
|---|---|
| Table | flex column, `gap: 12px`, `align-items: flex-end` (so pagination right-aligns) |
| Header row | flex row, `background: --input-background`, `border-radius: 12px`, cells share the same column widths as data rows |
| Header cell | `flex: 1`, `padding: 8px 12px`, text in `--text-secondary` |
| Data row | flex row, `border: 1px solid --border`, `border-radius: 12px` |
| Data cell | `flex: 1`, `padding: 8px 12px`, text in `--text-primary` |
| Pagination | flex row, `gap: 16px`, "x-y of N" label + prev/next 16px icons |

Columns size by `flex: 1` and `min-width: 0` by default (equal width, content-aware via `text-overflow: ellipsis`). For fixed-width columns (e.g. an action-icon column), override `flex` on that single cell in both header and rows so they stay aligned.

## Design tokens

Use the semantic token names, not raw hex. Cross-reference `colors.md`, `layout.md`.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--space-sm` | `12px` | `12px` | cell padding-x, row gap, row radius |
| `--space-s` | `8px` | `8px` | cell padding-y |
| `--space-xs` | `4px` | `4px` | tight gaps |
| `--border` | `#DFE1E6` | `#2D313D` | row border, progress track |
| `--input-background` | `rgba(191,194,204,0.16)` | `rgba(69,76,94,0.16)` | header bar fill, row hover background, action-icon hover pill |
| `--text-primary` | `#20222A` | `#F9F9FA` | cell content |
| `--text-secondary` | `#454C5E` | `#BFC2CC` | header text, supporting text |
| `--text-tertiary` | `#656B7C` | `#9EA4B3` | date year line |
| `--text-disabled` | `#9EA4B3` | `#656B7C` | read-only / disabled cell text |
| `--text-button-hover` | `#008393` | `#00CEE6` | hovered link-cell text |
| `--text-success` | `#11763D` | `#18A957` | success badge text |
| `--primary-600` | `#00AFC4` | `#00AFC4` | progress bar fill |

Selected rows use `var(--selected-row)` when enabled and `var(--selected-row-hover)` on hover, applied to both background and border (`Table.css`). They mirror the Figma variables `Selected-row` / `Selected-row-hover`: Secondary-500 `#FFBB38` at 16% / 24% in both modes, so there is no dark override. Do not use the solid amber for the row fill. Checkboxes take their checked fill from `selection-controls.md` (`--control-selected`).

## Typography

All table text is Poppins, `14px`, `line-height: 1.5`.

| Element | Weight | Color |
|---|---|---|
| Header cell | Regular (400) | `--text-secondary` |
| Data cell (single line) | Regular (400) | `--text-primary` |
| Primary line of a two-line cell | **Semibold (600)**, Paragraph M semibold (Regular when the stack has no supporting line) | `--text-primary` |
| Supporting text line | Regular (400) | `--text-secondary` |
| Date day line | Regular (400), 14px | `--text-primary` |
| Date year line | Regular (400), 12px | `--text-tertiary` |
| Badge label | Medium (500), 14px, line-height 1.2 | semantic |
| Button label | Bold (700), 12px | semantic |

## Row states

| State | Background | Border | Cell text |
|---|---|---|---|
| Enabled | transparent | `--border` | `--text-primary` |
| Hover | `--input-background` | `--border` | `--text-primary` (interactive cells go to `--text-button-hover`) |
| Selected | `--selected-row` | `--selected-row` | `--text-primary` |
| Selected + Hover | `--selected-row-hover` | `--selected-row-hover` | `--text-primary` |
| Disabled (read-only) | transparent | `--border` | `--text-disabled` |

## Header types

Header cells carry the same `flex` widths as the row below. Text is `--text-secondary` (or `--text-disabled` when disabled).

| Type | Composition |
|---|---|
| Text | label only |
| Checkbox + text | 24px select-all checkbox + label, `gap: 12px` |
| Text + sort | label + trailing 16px `ArrowDown`, `gap: 4px` (sortable column); hidden until hover except on the active column, rotated 180° for descending |
| Checkbox + text + sort | all three |

## Cell content types

Every cell is `flex: 1; display: flex; align-items: center; padding: 8px 12px; min-width: 0;`. The inner gap is `12px` when the cell holds an icon, avatar, thumbnail, or checkbox beside text, otherwise `0`.

| Type | Composition |
|---|---|
| Text | single line, `--text-primary` |
| Text + supporting | two lines: **Semibold (600)** primary + Regular secondary, `2px` gap |
| Date | two lines: "Jan 1," (14px) over "2025" (12px `--text-tertiary`) |
| Text + icon | text + trailing 20px icon, `gap: 12px` |
| Checkbox | leading 24px checkbox + text, `gap: 12px` (checked fill per `selection-controls.md`) |
| Avatar | `<Avatar size={32}>` + text, `gap: 12px` |
| Avatar + supporting | `<Avatar size={40}>` + two-line info |
| Avatar group | `<AvatarGroup size={32}>`: overlapping 32px avatars (`-12px` overlap, 1px `--page-background` ring); "+N" is a same-size 32px circle via `remaining` ([avatars.md](avatars.md)) |
| Illustration | 24px skill / gamification icon + text |
| Thumbnail | 90×44 rounded (`8px`) image + text (`.tbl-thumb`) |
| Progress bar | 72px x 8px segmented bar (8 segments) + % label; row height 56px |
| Action icon | centred 20px kebab in a 28px circular button; hover fills it with `--input-background` |
| Badge | status pill (e.g. success: tick + label on `rgba(24,169,87,0.16)`) |
| Button | small outlined button (`12px` Bold label, `8px` radius) |
| Dropdown | bordered input + chevron (`12px` radius) |

### Cell states (apply within any content type)

- Enabled: base styling.
- Hover: interactive text turns `--text-button-hover` (`#008393` light / `#00CEE6` dark) — with a two-line stack, the whole cluster turns; action icons gain a circular `--input-background` fill.
- Selected: checkbox shows the amber tick.
- Read-only / disabled: text goes to `--text-disabled`; avatars and thumbnails get `mix-blend-mode: luminosity`; action icons turn `--text-disabled`.

> Checkboxes, radios and toggles in cells follow `selection-controls.md`. The 24px box with the amber checked fill comes from that spec; do not reinvent it here.

## Pagination footer

Label format: `"1-10 of 28"`. The footer right-aligns because the table container uses `align-items: flex-end`. Prev/next are 16px icons; disabled nav uses `opacity: 0.4`.

## CSS and React

> Superseded, see Usage: the full CSS block and hand-written React component that lived here predated `src/components/Table` (raw amber selected rows, a `.sort` span, fake checkboxes, `.avatar-32` / `.avatar-40` classes, `key={i}`, no `getRowKey`). `Table.tsx` and `Table.css` are the reference; don't copy styles out of them, use the component.

Helper classes `Table.css` provides for cell content: `.tbl-media` (media + text, 12px gap), `.tbl-stack` with `.primary` / `.supporting` (two-line stack, 2px gap), `.tbl-date` with `.day` / `.year`, `.tbl-thumb` (90×44), `.tbl-progress`, `.tbl-action`, `.tbl-col-action` (`flex: 0 0 52px`), and `is-link` / `is-overflow` via `cellClassName`.

```tsx
import { ArrowDown } from 'iconsax-react'
import Table from '@/components/Table/Table'
import Avatar from '@/components/Avatar/Avatar'
import RowActionsMenu from '@/components/RowActionsMenu/RowActionsMenu'

<Table
  columns={[
    { key: 'name', header: 'Name', render: (u) => (
      <span className="tbl-media">
        <Avatar size={40} src={u.avatar} />
        <span className="tbl-stack">
          <span className="primary">{u.name}</span>
          <span className="supporting">{u.email}</span>
        </span>
      </span>
    )},
    { key: 'role', sortable: true, render: (u) => u.role, header: (
      <>Role <ArrowDown size={16} color="currentColor" className={sortArrowClass('role')} /></>
    )},
    { key: 'actions', header: '', width: '0 0 56px', align: 'center', cellClassName: 'is-overflow',
      render: (u) => <RowActionsMenu ariaLabel={`Actions for ${u.name}`} items={actionsFor(u)} /> },
  ]}
  rows={people}
  getRowKey={(u) => u.id}
  selectable
  isSelected={(u) => selectedIds.has(u.id)}
  onToggleRow={(u) => toggle(u.id)}
  onToggleAll={toggleAll}
  allSelected={allSelected}
  onSort={handleSort}
  pagination={{ from: 1, to: 10, total: 28, onPrev, onNext }}
/>
```

The sort arrow class (`sortArrowClass` above) is the caller's: show it on the active column, rotate 180° for descending, reveal it on hover for the others (see `.up-sort` in `UserProfile.css`).

## Usage guidance

- Column count: equal `flex: 1` columns are the default. Give an action-icon column a fixed `flex: 0 0 52px` and match it in the header so columns line up.
- Selection tables: lead with a checkbox header (select-all) and checkbox cells; apply the selected row state when checked.
- A progress-bar cell sets the row height to 56px; check vertical rhythm when mixing it with short cells.
- Read-only rows (e.g. archived records): return `'disabled'` from `getRowState`, which styles the whole row, not individual cells.
- Empty state: when there are no rows, show an empty-state block in place of the rows, keep the header, and hide pagination.
- Hover affordance: only turn cell text to `--text-button-hover` for cells that are actually clickable (a name that links to a profile, not a plain status cell).
- Accessibility: every interactive cell element needs a visible `:focus-visible` indicator and an `aria-label` where there is no text (action icons, pagination nav).

## Code reality

`src/components/Table/` is the reusable implementation of this spec — use it for any data table, don't hand-roll. Drift from the nodes (flagged, not changed): row hover uses `--input-background` — the translucent tint every table in the app now shares, and the same fill the header bar carries — which matches the Figma row-state variable `Input-background`. Selected rows use `--selected-row` / `--selected-row-hover`, matching the Figma variables.

## Related docs

- `colors.md` - row border, hover, and selected backgrounds, plus the raw palette behind the tokens
- `typography.md` - the Poppins type scale
- `iconography.md` - sort, kebab, and status icons
- `selection-controls.md` - the checkbox used in selectable tables
- `badges.md` - the badge cell type
- `buttons.md` - the button cell type
