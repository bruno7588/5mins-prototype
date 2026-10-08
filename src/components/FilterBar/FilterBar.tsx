import { forwardRef, type ElementType, type ReactNode } from 'react'
import { Add, ArrowDown2 } from 'iconsax-react'
import Button from '@/components/Button/Button'
import Chip from '@/components/Chip/Chip'
import CloseButton from '@/components/CloseButton/CloseButton'
import Collapse from '@/components/Collapse/Collapse'
import Tooltip from '@/components/Tooltip/Tooltip'
import './FilterBar.css'

/* Filter bar (DS filter-bar.md, Library "Filter bar" 12438:2724). A card that holds a
   list's filters: "Filters" + count and a chevron. Collapsed, it shows Add Filter when
   empty or one pill per active filter (+N past `maxPills`). Expanded, one row per filter
   (icon, "<Field> is", the page's control, remove) and Add Filter / Clear All.
   The page owns filter state, each row's control and the Add Filter menu. */

// Any Iconsax icon (function or class component). FilterBar renders it with size, color and variant="Linear".
type IconComponent = ElementType

export interface FilterBarFilter {
  id: string
  /** Field name, used for the pill and the remove label: "Team". */
  title: string
  Icon: IconComponent
  /** Collapsed pill text, e.g. the chosen value ("Completed", "Progress 20-80%"). Defaults to `title`. */
  pillLabel?: string
  /** Row label. Defaults to "<title> is". */
  rowLabel?: string
  /** The field's control: Dropdown, multi select, date field. */
  control: ReactNode
  /** False when the control carries its own remove (e.g. a multi select). Default true. */
  removable?: boolean
}

interface FilterBarProps {
  /** Active filters, in the order they were added. */
  filters: FilterBarFilter[]
  expanded: boolean
  onToggleExpanded: () => void
  onRemove: (id: string) => void
  onClearAll: () => void
  /** The Add Filter trigger plus its menu. Rendered in the collapsed header (when no
      filter is active) and in the expanded actions; `placement` says which. Use
      `FilterBarAddButton` for the trigger. */
  renderAddFilter: (placement: 'header' | 'actions') => ReactNode
  /** Pills shown collapsed before a "+N" pill. Default 6, as in the Library. */
  maxPills?: number
  className?: string
}

/** The Add Filter text button. Disabled with a reason tooltip once every filter is in use. */
export const FilterBarAddButton = forwardRef<
  HTMLDivElement,
  { open: boolean; onClick: () => void; disabled?: boolean; disabledReason?: string; children?: ReactNode }
>(function FilterBarAddButton({ open, onClick, disabled = false, disabledReason = 'All filters are already added', children }, ref) {
  return (
    <div className="filter-bar__add" ref={ref}>
      <Tooltip text={disabledReason} position="Top" icon={false} disabled={!disabled}>
        <Button
          variant="text"
          size="md"
          icon={<Add size={20} color="currentColor" variant="Linear" />}
          aria-haspopup="listbox"
          aria-expanded={open}
          disabled={disabled}
          onClick={onClick}
        >
          Add Filter
        </Button>
      </Tooltip>
      {children}
    </div>
  )
})

function FilterBar({
  filters,
  expanded,
  onToggleExpanded,
  onRemove,
  onClearAll,
  renderAddFilter,
  maxPills = 6,
  className = '',
}: FilterBarProps) {
  const count = filters.length
  const pills = filters.slice(0, maxPills)
  const overflow = count - pills.length

  return (
    <div className={`filter-bar${className ? ` ${className}` : ''}`}>
      <div className="filter-bar__head">
        <button type="button" className="filter-bar__toggle" aria-expanded={expanded} onClick={onToggleExpanded}>
          <span className="filter-bar__label">Filters</span>
          <span className="filter-bar__count">{count}</span>
        </button>

        <div className={`filter-bar__collapsed${expanded ? ' filter-bar__collapsed--hidden' : ''}`} aria-hidden={expanded || undefined}>
          {count === 0 ? (
            renderAddFilter('header')
          ) : (
            <div className="filter-bar__pills">
              {pills.map((f) => (
                <Chip
                  key={f.id}
                  label={f.pillLabel ?? f.title}
                  customIconLeft={<f.Icon size={16} color="currentColor" variant="Linear" />}
                  iconRight
                  onClick={onToggleExpanded}
                  onDismiss={() => onRemove(f.id)}
                />
              ))}
              {overflow > 0 && <Chip label={`+${overflow}`} onClick={onToggleExpanded} />}
            </div>
          )}
        </div>

        <button
          type="button"
          className="filter-bar__chevron-btn"
          aria-label={expanded ? 'Collapse filters' : 'Expand filters'}
          aria-expanded={expanded}
          onClick={onToggleExpanded}
        >
          <span className={`filter-bar__chevron${expanded ? ' filter-bar__chevron--open' : ''}`}>
            <ArrowDown2 size={16} color="var(--text-tertiary)" variant="Linear" />
          </span>
        </button>
      </div>

      <Collapse open={expanded}>
        <div className={`filter-bar__body${count === 0 ? ' filter-bar__body--empty' : ''}`}>
          {filters.map((f) => (
            <div className="filter-bar__row" key={f.id}>
              <span className="filter-bar__row-icon">
                <f.Icon size={20} color="var(--text-secondary)" variant="Linear" />
              </span>
              <span className="filter-bar__row-label">{f.rowLabel ?? `${f.title} is`}</span>
              {f.control}
              {f.removable !== false && (
                <span className="filter-bar__row-remove">
                  <CloseButton size={16} ariaLabel={`Remove ${f.title} filter`} onClick={() => onRemove(f.id)} />
                </span>
              )}
            </div>
          ))}

          <div className="filter-bar__actions">
            {renderAddFilter('actions')}
            <Tooltip text="No filters to clear" position="Top" icon={false} disabled={count > 0}>
              <Button variant="text" size="md" className="filter-bar__clear" disabled={count === 0} onClick={onClearAll}>
                Clear All
              </Button>
            </Tooltip>
          </div>
        </div>
      </Collapse>
    </div>
  )
}

export default FilterBar
