import { type ReactNode } from 'react'
import Checkbox from '../Checkbox/Checkbox'
import './Table.css'

/**
 * Data table — 5Mins design system (docs/design-system/table.md).
 *
 * NOT a gridlined table: a borderless header over a vertical stack of
 * self-contained bordered row-cards, with a 12px gap between them. Columns are
 * column-driven — each column supplies its own cell renderer, so any DS cell
 * content type (text, thumbnail, badge, action icon, …) can be dropped in.
 */
export type RowState = 'enabled' | 'hover' | 'selected' | 'disabled'

export interface Column<T> {
  key: string
  header: ReactNode
  sortable?: boolean
  /** CSS `flex` shorthand for fixed/uneven widths, e.g. "0 0 52px". Default: equal columns. */
  width?: string
  render: (row: T) => ReactNode
}

export interface TablePagination {
  from: number
  to: number
  total: number
  onPrev?: () => void
  onNext?: () => void
}

interface TableProps<T> {
  columns: Column<T>[]
  rows: T[]
  getRowKey: (row: T, index: number) => string
  getRowState?: (row: T) => RowState
  onRowClick?: (row: T) => void
  selectable?: boolean
  isSelected?: (row: T) => boolean
  onToggleRow?: (row: T) => void
  onToggleAll?: () => void
  allSelected?: boolean
  onSort?: (key: string) => void
  pagination?: TablePagination
}

export function Table<T>({
  columns,
  rows,
  getRowKey,
  getRowState,
  onRowClick,
  selectable,
  isSelected,
  onToggleRow,
  onToggleAll,
  allSelected,
  onSort,
  pagination,
}: TableProps<T>) {
  return (
    <div className="tbl">
      <div className="tbl-head">
        {selectable && (
          <div className="tbl-head-cell is-checkbox" style={{ flex: '0 0 52px' }}>
            <Checkbox checked={!!allSelected} onChange={onToggleAll} />
          </div>
        )}
        {columns.map((col) => (
          <div
            key={col.key}
            className={`tbl-head-cell${col.sortable ? ' is-sortable' : ''}`}
            style={col.width ? { flex: col.width } : undefined}
            onClick={col.sortable ? () => onSort?.(col.key) : undefined}
          >
            <span>{col.header}</span>
          </div>
        ))}
      </div>

      {rows.map((row, i) => {
        const state = getRowState?.(row) ?? 'enabled'
        const selected = isSelected?.(row)
        return (
          <div
            key={getRowKey(row, i)}
            className={[
              'tbl-row',
              state === 'hover' && 'is-hover',
              (state === 'selected' || selected) && 'is-selected',
              state === 'disabled' && 'is-disabled',
              onRowClick && 'is-clickable',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
          >
            {selectable && (
              <div className="tbl-cell" style={{ flex: '0 0 52px' }} onClick={(e) => e.stopPropagation()}>
                <Checkbox checked={!!selected} onChange={() => onToggleRow?.(row)} />
              </div>
            )}
            {columns.map((col) => (
              <div key={col.key} className="tbl-cell" style={col.width ? { flex: col.width } : undefined}>
                {col.render(row)}
              </div>
            ))}
          </div>
        )
      })}

      {pagination && (
        <div className="tbl-pagination">
          <span className="count">
            {pagination.from}-{pagination.to} of {pagination.total}
          </span>
          <button
            type="button"
            className="nav"
            aria-label="Previous page"
            aria-disabled={pagination.from <= 1}
            onClick={pagination.from <= 1 ? undefined : pagination.onPrev}
          >
            ‹
          </button>
          <button
            type="button"
            className="nav"
            aria-label="Next page"
            aria-disabled={pagination.to >= pagination.total}
            onClick={pagination.to >= pagination.total ? undefined : pagination.onNext}
          >
            ›
          </button>
        </div>
      )}
    </div>
  )
}

export default Table
