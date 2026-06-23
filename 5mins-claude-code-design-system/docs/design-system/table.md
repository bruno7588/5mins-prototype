# Table

Data table component for the 5Mins.ai admin and learner platform. Use for any rows of records: learners, enrolments, courses, roles, reports, audit logs, or any "show me rows of data" screen.

Grounded in the Figma library `EC26cSVe9KNTCWXvYovakw` (Table component `11872:4048`).

## The one thing to get right first

This is **not** a traditional gridlined table. The defining structure is:

- The table is a vertical flex column with a `12px` gap between elements.
- The header is a borderless row of cells sitting at the top.
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
| Header row | flex row, no border, cells share the same column widths as data rows |
| Header cell | `flex: 1`, `padding: 0 12px`, text in `--text-secondary` |
| Data row | flex row, `border: 1px solid --border-default`, `border-radius: 12px` |
| Data cell | `flex: 1`, `padding: 8px 12px`, text in `--text-primary` |
| Pagination | flex row, `gap: 16px`, "x-y of N" label + prev/next 16px icons |

Columns size by `flex: 1` and `min-width: 0` by default (equal width, content-aware via `text-overflow: ellipsis`). For fixed-width columns (e.g. an action-icon column), override `flex` on that single cell in both header and rows so they stay aligned.

## Design tokens

Use the semantic token names, not raw hex. Cross-reference `surface-colors.md`, `brand-colors.md`, `text-colors.md`, `spacing.md`.

| Token | Value | Use |
|---|---|---|
| `--sm` | `12px` | cell padding-x, row gap, row radius |
| `--s` | `8px` | cell padding-y |
| `--xs` | `4px` | tight gaps |
| `--border-default` | `#DFE1E6` | row border, progress track |
| `--surface-page-hover` | `#EFF0F2` | row hover background |
| `--surface-selected` | `#FFBB38` | selected row (low opacity) and checked checkbox fill |
| `--text-primary` | `#20222A` | cell content |
| `--text-secondary` | `#454C5E` | header text, supporting text, date year |
| `--text-disabled` | `#9EA4B3` | read-only / disabled cell text |
| `--text-button-hover` | `#008393` | cell text on row hover (interactive cells only) |
| `--text-success` | `#11763D` | success badge text |
| `--primary-600` | `#00AFC4` | progress bar fill |

Selected rows use `--surface-selected` (`#FFBB38`) at 12% opacity when enabled and 24% on hover, applied to both background and border. Do not use the solid amber for the row fill.

## Typography

All table text is Poppins, `14px`, `line-height: 1.5`.

| Element | Weight | Color |
|---|---|---|
| Header cell | Regular (400) | `--text-secondary` |
| Data cell (single line) | Regular (400) | `--text-primary` |
| Primary line of a two-line cell | Medium (500) | `--text-primary` |
| Supporting text line | Regular (400) | `--text-secondary` |
| Date day line | Regular (400), 14px | `--text-primary` |
| Date year line | Regular (400), 12px | `--text-secondary` |
| Badge label | Medium (500), 12px | semantic |
| Button label | Bold (700), 12px | semantic |

## Row states

| State | Background | Border | Cell text |
|---|---|---|---|
| Enabled | transparent | `--border-default` | `--text-primary` |
| Hover | `--surface-page-hover` | `--border-default` | `--text-primary` (interactive cells go to `--text-button-hover`) |
| Selected | `rgba(255,187,56,0.12)` | `rgba(255,187,56,0.12)` | `--text-primary` |
| Selected + Hover | `rgba(255,187,56,0.24)` | `rgba(255,187,56,0.24)` | `--text-primary` |
| Disabled (read-only) | transparent | `--border-default` | `--text-disabled` |

## Header types

Header cells carry the same `flex` widths as the row below. Text is `--text-secondary` (or `--text-disabled` when disabled).

| Type | Composition |
|---|---|
| Text | label only |
| Checkbox + text | 20px select-all checkbox + label, `gap: 12px` |
| Text + sort | label + trailing 20px arrow-down, `gap: 4px` (sortable column) |
| Checkbox + text + sort | all three |

## Cell content types

Every cell is `flex: 1; display: flex; align-items: center; padding: 8px 12px; min-width: 0;`. The inner gap is `12px` when the cell holds an icon, avatar, thumbnail, or checkbox beside text, otherwise `0`.

| Type | Composition |
|---|---|
| Text | single line, `--text-primary` |
| Text + supporting | two lines: Medium primary + Regular secondary, `2px` gap |
| Date | two lines: "Jan 1," (14px) over "2025" (12px secondary) |
| Text + icon | text + trailing 20px icon, `gap: 12px` |
| Checkbox | leading 20px checkbox + text, `gap: 12px` (checked fill `--surface-selected`) |
| Avatar | 32px round avatar + text, `gap: 12px` |
| Avatar + supporting | 40px avatar + two-line info |
| Avatar group | overlapping 32px avatars (`-8px` margin, 1px page-bg border) + "+N" pill |
| Illustration | 24px skill / gamification icon + text |
| Thumbnail | 90x44 rounded (`8px`) image + text |
| Progress bar | 72px x 8px segmented bar (8 segments) + % label; row height 56px |
| Action icon | centered 20px kebab; hover shows a 40px pill bg + tooltip |
| Badge | status pill (e.g. success: tick + label on `rgba(24,169,87,0.16)`) |
| Button | small outlined button (`12px` Bold label, `8px` radius) |
| Dropdown | bordered input + chevron (`12px` radius) |

### Cell states (apply within any content type)

- Enabled: base styling.
- Hover: interactive text turns `--text-button-hover` (`#008393`); action icons gain a pill background.
- Selected: checkbox shows the amber tick.
- Read-only / disabled: text goes to `--text-disabled`; avatars, thumbnails and illustrations get `mix-blend-mode: luminosity`; action icons drop to `50%` opacity.

> Checkboxes, radios and toggles in cells follow `selection-controls.md`. The 20px box with the amber checked fill comes from that spec; do not reinvent it here.

## Pagination footer

Label format: `"1-10 of 28"`. The footer right-aligns because the table container uses `align-items: flex-end`. Prev/next are 16px icons; disabled nav uses `opacity: 0.4`.

## Full CSS

```css
.tbl {
  display: flex; flex-direction: column; gap: var(--sm);
  align-items: flex-end; width: 100%;
  font-family: "Poppins", sans-serif;
}

/* Header */
.tbl-head { display: flex; align-items: center; width: 100%; }
.tbl-head-cell {
  flex: 1 1 0; min-width: 0; display: flex; align-items: center;
  padding: 0 var(--sm); color: var(--text-secondary);
  font: 400 14px/1.5 "Poppins", sans-serif;
  max-height: 42px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.tbl-head-cell.is-sortable { gap: var(--xs); cursor: pointer; }
.tbl-head-cell.is-checkbox { gap: var(--sm); }
.tbl-head-cell.is-disabled { color: var(--text-disabled); }
.tbl-head-cell .sort { width: 20px; height: 20px; flex: 0 0 20px; }

/* Row */
.tbl-row {
  display: flex; align-items: center; width: 100%;
  border: 1px solid var(--border-default); border-radius: var(--sm);
}
.tbl-row.is-hover, .tbl-row:hover { background: var(--surface-page-hover); }
.tbl-row.is-selected { background: rgba(255,187,56,0.12); border-color: rgba(255,187,56,0.12); }
.tbl-row.is-selected.is-hover, .tbl-row.is-selected:hover { background: rgba(255,187,56,0.24); border-color: rgba(255,187,56,0.24); }
.tbl-row.is-disabled .tbl-cell { color: var(--text-disabled); }
.tbl-row.is-disabled img.avatar-32,
.tbl-row.is-disabled img.avatar-40,
.tbl-row.is-disabled img.thumbnail,
.tbl-row.is-disabled .illustration-24 { mix-blend-mode: luminosity; }

/* Cell base */
.tbl-cell {
  flex: 1 1 0; min-width: 0; display: flex; align-items: center;
  padding: var(--s) var(--sm); color: var(--text-primary);
  font: 400 14px/1.5 "Poppins", sans-serif;
  max-height: 58px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.tbl-row:hover .tbl-cell.is-link, .tbl-cell.is-hover { color: var(--text-button-hover); }

/* Two-line stacks */
.tbl-stack { display: flex; flex-direction: column; gap: 2px; align-items: flex-start; min-width: 0; }
.tbl-stack .primary { font-weight: 500; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; }
.tbl-stack .supporting { font-weight: 400; color: var(--text-secondary); overflow: hidden; text-overflow: ellipsis; }

/* Date */
.tbl-date { flex-direction: column; align-items: flex-start; gap: 0; }
.tbl-date .day  { font-size: 14px; line-height: 1.5; color: var(--text-primary); }
.tbl-date .year { font-size: 12px; line-height: 1.2; color: var(--text-secondary); }

/* Avatars */
.avatar-32 { width: 32px; height: 32px; border-radius: 100px; object-fit: cover; flex: 0 0 32px; }
.avatar-40 { width: 40px; height: 40px; border-radius: 100px; object-fit: cover; flex: 0 0 40px; }
.avatar-group { display: flex; align-items: center; }
.avatar-group .avatar-32 { margin-right: -8px; border: 1px solid var(--surface-page); }
.avatar-group .avatar-more {
  display: inline-flex; align-items: center; justify-content: center;
  width: 30px; height: 30px; border-radius: 85px;
  background: var(--surface-page-hover); color: var(--text-secondary);
  font: 400 11px/1.5 "Poppins", sans-serif;
}

/* Icons / illustration / thumbnail */
.icon-20 { width: 20px; height: 20px; flex: 0 0 20px; }
.illustration-24 { width: 24px; height: 24px; flex: 0 0 24px; display: inline-flex; align-items: center; justify-content: center; }
.thumbnail { width: 90px; height: 44px; border-radius: var(--s); object-fit: cover; flex: 0 0 90px; }

/* Checkbox (mirror of selection-controls.md) */
.checkbox {
  width: 20px; height: 20px; flex: 0 0 20px;
  border: 1.5px solid var(--border-default); border-radius: 6px;
  display: inline-flex; align-items: center; justify-content: center;
}
.checkbox[data-checked="true"] { background: var(--surface-selected); border-color: var(--surface-selected); }
.checkbox[data-checked="true"]::after {
  content: ""; width: 5px; height: 9px; margin-top: -2px;
  border: solid #fff; border-width: 0 2px 2px 0; transform: rotate(45deg);
}

/* Progress bar */
.tbl-progress { gap: var(--sm); height: 56px; }
.tbl-progress .bar { display: flex; width: 72px; height: 8px; border-radius: var(--s); overflow: hidden; flex: 0 0 72px; }
.tbl-progress .seg { flex: 1 1 0; min-width: 0; height: 100%; background: var(--border-default); }
.tbl-progress .seg.fill { background: var(--primary-600); }
.tbl-progress .pct { width: 33px; flex: 0 0 33px; color: var(--text-primary); font: 400 14px/1.5 "Poppins", sans-serif; }

/* Action icon */
.tbl-action { justify-content: center; }
.tbl-action .icon-btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; border: none; background: transparent;
  border-radius: 40px; cursor: pointer;
}
.tbl-action .icon-btn:hover { background: var(--surface-input-hover); }
.tbl-action .more-20 { width: 20px; height: 20px; }
.tbl-action.is-disabled .icon-btn { opacity: 0.5; cursor: default; }

/* Badge */
.badge { display: inline-flex; align-items: center; gap: var(--xs); padding: 6px 12px; border-radius: 40px; font: 500 14px/1.2 "Poppins", sans-serif; }
.badge .tick-16 { width: 16px; height: 16px; }
.badge-success { background: rgba(24,169,87,0.16); color: var(--text-success); }
.badge.is-disabled { background: rgba(69,76,94,0.16); color: var(--text-disabled); mix-blend-mode: luminosity; }

/* Button cell */
.tbl-btn { padding: 8px 16px; border: 1px solid var(--primary-600); border-radius: var(--s); background: transparent; color: var(--primary-600); font: 700 12px/1.4 "Poppins", sans-serif; cursor: pointer; }
.tbl-btn:disabled { border-color: var(--text-disabled); color: var(--text-disabled); cursor: default; }

/* Dropdown cell */
.tbl-dropdown { display: inline-flex; align-items: center; gap: var(--s); padding: var(--s) var(--sm); border: 1px solid var(--border-default); border-radius: var(--sm); background: transparent; color: var(--text-primary); font: 400 14px/1.5 "Poppins", sans-serif; cursor: pointer; }
.tbl-dropdown:disabled { color: var(--text-disabled); }
.tbl-dropdown .chevron-20 { width: 20px; height: 20px; }

/* Pagination */
.tbl-pagination { display: flex; align-items: center; justify-content: center; gap: 16px; }
.tbl-pagination .count { color: var(--text-secondary); font: 400 14px/1.5 "Poppins", sans-serif; }
.tbl-pagination .nav { width: 16px; height: 16px; cursor: pointer; }
.tbl-pagination .nav[aria-disabled="true"] { opacity: 0.4; cursor: default; }

/* Fixed-width helper: apply to both header cell and data cell */
.tbl-col-action { flex: 0 0 52px; }
```

## React TypeScript implementation

A generic, column-driven table. Columns declare their own cell renderer so any of the content types above can be dropped in.

```tsx
import { ReactNode } from "react";

type RowState = "enabled" | "hover" | "selected" | "disabled";

interface Column<T> {
  key: string;
  header: ReactNode;
  sortable?: boolean;
  width?: string;              // e.g. "0 0 52px" for an action column
  render: (row: T) => ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  rows: T[];
  getRowState?: (row: T) => RowState;
  selectable?: boolean;
  isSelected?: (row: T) => boolean;
  onToggleRow?: (row: T) => void;
  onToggleAll?: () => void;
  onSort?: (key: string) => void;
  pagination?: { from: number; to: number; total: number; onPrev?: () => void; onNext?: () => void };
}

export function Table<T>({
  columns, rows, getRowState, selectable, isSelected,
  onToggleRow, onToggleAll, onSort, pagination,
}: TableProps<T>) {
  return (
    <div className="tbl">
      <div className="tbl-head">
        {selectable && (
          <div className="tbl-head-cell is-checkbox" style={{ flex: "0 0 52px" }}>
            <span className="checkbox" role="checkbox" onClick={onToggleAll} />
          </div>
        )}
        {columns.map((col) => (
          <div
            key={col.key}
            className={`tbl-head-cell${col.sortable ? " is-sortable" : ""}`}
            style={col.width ? { flex: col.width } : undefined}
            onClick={col.sortable ? () => onSort?.(col.key) : undefined}
          >
            <span>{col.header}</span>
            {col.sortable && <span className="sort" aria-hidden />}
          </div>
        ))}
      </div>

      {rows.map((row, i) => {
        const state = getRowState?.(row) ?? "enabled";
        const selected = isSelected?.(row);
        return (
          <div
            key={i}
            className={[
              "tbl-row",
              state === "hover" && "is-hover",
              (state === "selected" || selected) && "is-selected",
              state === "disabled" && "is-disabled",
            ].filter(Boolean).join(" ")}
          >
            {selectable && (
              <div className="tbl-cell" style={{ flex: "0 0 52px" }}>
                <span
                  className="checkbox"
                  role="checkbox"
                  aria-checked={selected}
                  data-checked={selected ? "true" : "false"}
                  onClick={() => onToggleRow?.(row)}
                />
              </div>
            )}
            {columns.map((col) => (
              <div
                key={col.key}
                className="tbl-cell"
                style={col.width ? { flex: col.width } : undefined}
              >
                {col.render(row)}
              </div>
            ))}
          </div>
        );
      })}

      {pagination && (
        <div className="tbl-pagination">
          <span className="count">
            {pagination.from}-{pagination.to} of {pagination.total}
          </span>
          <span
            className="nav"
            role="button"
            aria-label="Previous page"
            aria-disabled={pagination.from <= 1}
            onClick={pagination.onPrev}
          />
          <span
            className="nav"
            role="button"
            aria-label="Next page"
            aria-disabled={pagination.to >= pagination.total}
            onClick={pagination.onNext}
          />
        </div>
      )}
    </div>
  );
}
```

Usage:

```tsx
<Table
  selectable
  columns={[
    { key: "name", header: "Name", render: (u) => (
      <span style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <img className="avatar-40" src={u.avatar} alt="" />
        <span className="tbl-stack">
          <span className="primary">{u.name}</span>
          <span className="supporting">{u.email}</span>
        </span>
      </span>
    )},
    { key: "role", header: "Role", sortable: true, render: (u) => u.role },
    { key: "joined", header: "Joined", render: (u) => (
      <span className="tbl-date">
        <span className="day">{u.joinedDay}</span>
        <span className="year">{u.joinedYear}</span>
      </span>
    )},
    { key: "actions", header: "", width: "0 0 52px", render: () => (
      <button className="icon-btn" aria-label="More actions" />
    )},
  ]}
  rows={people}
  isSelected={(u) => selectedIds.includes(u.id)}
  onToggleRow={(u) => toggle(u.id)}
  pagination={{ from: 1, to: 10, total: 28 }}
/>
```

## Usage guidance

- Column count: equal `flex: 1` columns are the default. Give an action-icon column a fixed `flex: 0 0 52px` and match it in the header so columns line up.
- Selection tables: lead with a checkbox header (select-all) and checkbox cells; apply the selected row state when checked.
- A progress-bar cell sets the row height to 56px; check vertical rhythm when mixing it with short cells.
- Read-only rows (e.g. archived records): apply `.is-disabled` to the row, not to individual cells.
- Empty state: when there are no rows, show an empty-state block in place of the rows, keep the header, and hide pagination.
- Hover affordance: only turn cell text to `--text-button-hover` for cells that are actually clickable (a name that links to a profile, not a plain status cell).
- Accessibility: every interactive cell element needs a visible `:focus-visible` indicator and an `aria-label` where there is no text (action icons, pagination nav).

## Related docs

- `surface-colors.md` - row border, hover, and selected backgrounds
- `brand-colors.md` - raw palette behind the tokens
- `typography.md` - the Poppins type scale
- `iconography.md` - sort, kebab, and status icons
- `selection-controls.md` - the checkbox used in selectable tables
- `badges.md` - the badge cell type
- `buttons.md` - the button cell type
