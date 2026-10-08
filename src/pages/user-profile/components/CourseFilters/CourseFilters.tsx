import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Sort, Status, Calendar, Clock, CalendarTick, StatusUp, Star1 } from 'iconsax-react'
import Chip from '@/components/Chip/Chip'
import CloseButton from '@/components/CloseButton/CloseButton'
import Tooltip from '@/components/Tooltip/Tooltip'
import FilterBar, { FilterBarAddButton, type FilterBarFilter } from '@/components/FilterBar/FilterBar'
import InputInteger from '@/components/InputInteger/InputInteger'
import DatePickerField from '@/components/DatePickerField/DatePickerField'
import FilterMultiSelect from '@/pages/learning-records/components/FilterControls/FilterMultiSelect'
import CourseIcon from '@/components/icons/CourseIcon'
import Dropdown, { type DropdownOption } from '@/components/Dropdown/Dropdown'
import './CourseFilters.css'

/* ─── Model ─── the 7 filters mirror the Course Progress columns. */
export type FilterId = 'course' | 'status' | 'startDate' | 'dueDate' | 'completionDate' | 'progress' | 'score'

export type FilterValue =
  | { kind: 'multi'; values: string[] }
  | { kind: 'range'; min: number; max: number }
  | { kind: 'date'; from: string; to: string }

export interface FilterRow {
  course: string
  status: string
  startDate: string
  dueDate: string
  completionDate: string | null
  progress: number
  score: number | null
}

type Kind = FilterValue['kind']

interface FilterDef {
  id: FilterId
  label: string
  renderIcon: (size: number) => ReactNode
  kind: Kind
  suffix?: string
  /** Multi filters over a long list get the search field; short, fixed sets get
      a dropdown of checkboxes, where typing to narrow six options is a cost. */
  searchable?: boolean
}

// Iconsax icon at a given size, inheriting color (→ --text-primary in context).
const ix = (El: typeof Sort) => (size: number) => <El size={size} color="currentColor" variant="Linear" />

/* Grouped by type so the menu scans as state → dates → course, with the
   most-reached-for filter leading each group: Status heads the progress
   signals, Due date heads the dates (start dates are near-never filtered on).
   Course sits last since search already narrows by course name. */
export const FILTER_DEFS: FilterDef[] = [
  { id: 'status', label: 'Status', renderIcon: ix(Status), kind: 'multi' },
  { id: 'progress', label: 'Progress', renderIcon: ix(StatusUp), kind: 'range', suffix: '%' },
  { id: 'score', label: 'Score', renderIcon: ix(Star1), kind: 'range', suffix: '%' },
  { id: 'dueDate', label: 'Due date', renderIcon: ix(Clock), kind: 'date' },
  { id: 'startDate', label: 'Start date', renderIcon: ix(Calendar), kind: 'date' },
  { id: 'completionDate', label: 'Completion date', renderIcon: ix(CalendarTick), kind: 'date' },
  { id: 'course', label: 'Course', renderIcon: (s) => <CourseIcon size={s} />, kind: 'multi', searchable: true },
]

const DEF_BY_ID = Object.fromEntries(FILTER_DEFS.map((d) => [d.id, d])) as Record<FilterId, FilterDef>

export const defaultValueFor = (kind: Kind): FilterValue =>
  kind === 'multi' ? { kind: 'multi', values: [] } : kind === 'range' ? { kind: 'range', min: 0, max: 100 } : { kind: 'date', from: '', to: '' }

/* ─── Matching ─── pure predicate reused by the page's row memo. */
export function matchesCourse(row: FilterRow, active: FilterId[], values: Record<string, FilterValue>): boolean {
  for (const id of active) {
    const v = values[id]
    if (!v) continue
    if (v.kind === 'multi') {
      if (!v.values.length) continue
      const field = id === 'course' ? row.course : row.status
      if (!v.values.includes(field)) return false
    } else if (v.kind === 'range') {
      if (v.min <= 0 && v.max >= 100) continue // full range — nothing set yet
      const val = id === 'progress' ? row.progress : row.score ?? -1
      if (val < v.min || val > v.max) return false
    } else {
      if (!v.from && !v.to) continue // no bounds set yet
      const val = id === 'startDate' ? row.startDate : id === 'dueDate' ? row.dueDate : row.completionDate
      if (!val) return false
      if (v.from && val < v.from) return false
      if (v.to && val > v.to) return false
    }
  }
  return true
}

/* How many pills before collapsing the rest into "+N". Three keeps the row on
   one line at the narrowest supported width, even with the longest labels
   ("Completion date"). */
const MAX_PILLS = 3

/* FilterBar takes an icon component; wrap each def's renderIcon once, at module
   level, so the bar can set size and colour without remounting the icon. */
const ICON_BY_ID = Object.fromEntries(
  FILTER_DEFS.map((d) => [
    d.id,
    ({ size = 20, color = 'currentColor' }: { size?: number | string; color?: string }) => (
      <span style={{ display: 'inline-flex', color }}>{d.renderIcon(Number(size))}</span>
    ),
  ]),
) as Record<FilterId, FilterBarFilter['Icon']>

interface CourseFiltersProps {
  courses: FilterRow[]
  active: FilterId[]
  values: Record<string, FilterValue>
  expanded: boolean
  onAdd: (id: FilterId) => void
  onRemove: (id: FilterId) => void
  onSetValue: (id: FilterId, value: FilterValue) => void
  onClear: () => void
  onToggleExpanded: () => void
  /** Which filters the Add Filter menu offers. Defaults to all of them; Course details
      leaves out Course, since the page is one course. */
  filterIds?: FilterId[]
}

/* Self-contained Add-Filter picker. It owns its open state + ref so it can be
   rendered in more than one place (collapsed header and expanded body) without
   the instances sharing a ref — sharing one broke click-to-add. */
function AddFilterMenu({ available, onSelect }: { available: FilterDef[]; onSelect: (id: FilterId) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  return (
    <FilterBarAddButton ref={ref} open={open} onClick={() => setOpen((o) => !o)}>
      {open && (
        <div className="up-filter-add-menu" role="listbox">
          {available.length === 0 ? (
            <div className="up-filter-add-empty">All filters added</div>
          ) : (
            available.map((d) => (
              <button
                key={d.id}
                type="button"
                role="option"
                className="up-filter-add-item"
                onClick={() => {
                  onSelect(d.id)
                  setOpen(false)
                }}
              >
                <span className="up-filter-add-icon">{d.renderIcon(20)}</span>
                {d.label}
              </button>
            ))
          )}
        </div>
      )}
    </FilterBarAddButton>
  )
}

function CourseFilters({ courses, active, values, expanded, onAdd, onRemove, onSetValue, onClear, onToggleExpanded, filterIds }: CourseFiltersProps) {
  // Options for the multi-select filters, derived from the data.
  const optionsById = useMemo(() => {
    const uniq = (arr: string[]) => [...new Set(arr)]
    const toOpts = (arr: string[]): DropdownOption[] => arr.map((v) => ({ value: v, label: v }))
    return {
      course: toOpts(uniq(courses.map((c) => c.course))),
      status: toOpts(uniq(courses.map((c) => c.status))),
    } as Record<string, DropdownOption[]>
  }, [courses])

  const available = FILTER_DEFS.filter((d) => (!filterIds || filterIds.includes(d.id)) && !active.includes(d.id))

  const renderControl = (def: FilterDef, trailing?: ReactNode) => {
    const v = values[def.id] ?? defaultValueFor(def.kind)
    if (v.kind === 'multi') {
      const opts = optionsById[def.id] ?? []
      const setValues = (values: string[]) => onSetValue(def.id, { kind: 'multi', values })

      // Long lists keep the search field; a fixed handful gets a checkbox menu.
      if (def.searchable) {
        return (
          <FilterMultiSelect
            options={opts}
            value={v.values}
            placeholder={`Select ${def.label.toLowerCase()}`}
            onChange={setValues}
            trailing={trailing}
          />
        )
      }

      const chosen = opts.filter((o) => v.values.includes(o.value))
      return (
        <div className="up-filter-multi">
          <div className="up-filter-multi-row">
            <Dropdown
              className="up-filter-dropdown"
              options={opts}
              multiple
              values={v.values}
              placeholder={`Select ${def.label.toLowerCase()}`}
              onChangeValues={setValues}
            />
            {trailing}
          </div>
          {chosen.length > 0 && (
            <div className="up-filter-chips">
              {chosen.map((o) => (
                <Chip
                  key={o.value}
                  className="up-filter-chip"
                  label={o.label}
                  iconRight
                  onDismiss={() => setValues(v.values.filter((x) => x !== o.value))}
                />
              ))}
            </div>
          )}
        </div>
      )
    }
    if (v.kind === 'range') {
      return (
        <div className="up-filter-control-inline">
          <span className="up-filter-connector">between</span>
          <InputInteger value={v.min} min={0} max={100} suffix={def.suffix} ariaLabel={`${def.label} from`} onChange={(n) => onSetValue(def.id, { kind: 'range', min: n, max: v.max })} />
          <span className="up-filter-connector">and</span>
          <InputInteger value={v.max} min={0} max={100} suffix={def.suffix} ariaLabel={`${def.label} to`} onChange={(n) => onSetValue(def.id, { kind: 'range', min: v.min, max: n })} />
        </div>
      )
    }
    // DS month-grid popover (MiniCalendar) instead of the native browser picker.
    return (
      <div className="up-filter-control-inline">
        <span className="up-filter-connector">between</span>
        <DatePickerField value={v.from} ariaLabel={`${def.label} from`} onChange={(iso) => onSetValue(def.id, { kind: 'date', from: iso, to: v.to })} />
        <span className="up-filter-connector">and</span>
        <DatePickerField value={v.to} ariaLabel={`${def.label} to`} onChange={(iso) => onSetValue(def.id, { kind: 'date', from: v.from, to: iso })} />
      </div>
    )
  }

  // Short label for a collapsed pill: the chosen value(s) if any, else the filter name.
  const pillLabel = (id: FilterId): string => {
    const def = DEF_BY_ID[id]
    const v = values[id]
    if (v?.kind === 'multi' && v.values.length) return v.values.length === 1 ? v.values[0] : `${def.label}: ${v.values.length}`
    if (v?.kind === 'range' && (v.min > 0 || v.max < 100)) return `${def.label} ${v.min}–${v.max}${def.suffix ?? ''}`
    if (v?.kind === 'date' && (v.from || v.to)) return `${def.label} ${v.from || '…'} → ${v.to || '…'}`
    return def.label
  }

  const filters: FilterBarFilter[] = active.map((id) => {
    const def = DEF_BY_ID[id]
    // Multi-select renders the × on the field's line (via trailing) so it
    // sits next to the 400px search bar while chips flow full-width below.
    const trailing =
      def.kind === 'multi' ? (
        <Tooltip text={`Remove ${def.label} filter`} position="Top" icon={false}>
          <CloseButton size={16} ariaLabel={`Remove ${def.label} filter`} onClick={() => onRemove(id)} />
        </Tooltip>
      ) : undefined
    return {
      id,
      title: def.label,
      pillLabel: pillLabel(id),
      Icon: ICON_BY_ID[id],
      control: renderControl(def, trailing),
      removable: def.kind !== 'multi',
    }
  })

  return (
    <FilterBar
      className="up-filters"
      filters={filters}
      expanded={expanded}
      onToggleExpanded={onToggleExpanded}
      onRemove={(id) => onRemove(id as FilterId)}
      onClearAll={onClear}
      maxPills={MAX_PILLS}
      renderAddFilter={() => <AddFilterMenu available={available} onSelect={onAdd} />}
    />
  )
}

export default CourseFilters
