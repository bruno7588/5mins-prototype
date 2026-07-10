import { useCallback, useRef, useState, type ReactNode } from 'react'
import Checkbox from '../Checkbox/Checkbox'
import './Table.css'

/**
 * Data table — 5Mins design system (docs/design-system/table.md).
 *
 * NOT a gridlined table: a borderless header over a vertical stack of
 * self-contained bordered row-cards, with a 12px gap between them. Columns are
 * column-driven — each column supplies its own cell renderer, so any DS cell
 * content type (text, thumbnail, badge, action icon, …) can be dropped in.
 *
 * The table owns its horizontal scroll (`.tbl-scroll`) and pins the first
 * column (checkbox + first data column when selectable) while scrolled, same
 * frozen-panel treatment as the Learning Records table.
 */
export type RowState = 'enabled' | 'hover' | 'selected' | 'disabled'

export interface Column<T> {
  key: string
  header: ReactNode
  sortable?: boolean
  /** CSS `flex` shorthand for fixed/uneven widths, e.g. "0 0 52px". Default: equal columns. */
  width?: string
  /** Horizontal alignment of the header + cell content. Default: left. */
  align?: 'left' | 'right' | 'center'
  render: (row: T) => ReactNode
}

const justifyFor = (align?: Column<unknown>['align']) =>
  align === 'right' ? 'flex-end' : align === 'center' ? 'center' : undefined

const cellStyle = (col: { width?: string; align?: Column<unknown>['align'] }) =>
  col.width || col.align ? { flex: col.width, justifyContent: justifyFor(col.align) } : undefined

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
  const scrollRef = useRef<HTMLDivElement>(null)
  const [scrolled, setScrolled] = useState(false)
  const handleScroll = useCallback(() => {
    if (scrollRef.current) setScrolled(scrollRef.current.scrollLeft > 0)
  }, [])

  // First data column pins after the checkbox column (52px) when selectable.
  const stickyLeft = selectable ? 52 : 0
  const stickyClass = (i: number, base: string) =>
    i === 0 ? `${base} is-sticky is-sticky-last` : base
  const stickyStyle = (i: number, style?: React.CSSProperties) =>
    i === 0 ? { ...style, left: stickyLeft } : style

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className={`tbl-scroll${scrolled ? ' tbl-scroll--scrolled' : ''}`}
    >
    <div className="tbl">
      <div className="tbl-head">
        {selectable && (
          <div className="tbl-head-cell is-checkbox is-sticky" style={{ flex: '0 0 52px', left: 0 }}>
            <Checkbox checked={!!allSelected} onChange={onToggleAll} />
          </div>
        )}
        {columns.map((col, ci) => (
          <div
            key={col.key}
            className={stickyClass(ci, `tbl-head-cell${col.sortable ? ' is-sortable' : ''}`)}
            style={stickyStyle(ci, cellStyle(col))}
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
              <div
                className="tbl-cell is-sticky"
                style={{ flex: '0 0 52px', left: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <Checkbox checked={!!selected} onChange={() => onToggleRow?.(row)} />
              </div>
            )}
            {columns.map((col, ci) => (
              <div key={col.key} className={stickyClass(ci, 'tbl-cell')} style={stickyStyle(ci, cellStyle(col))}>
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
    </div>
  )
}

export default Table
