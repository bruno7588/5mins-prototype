import { Fragment, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Sort, Add, ArrowDown2, Status, Calendar, Clock, CalendarTick, Chart, Star1 } from 'iconsax-react'
import Collapse from '@/components/Collapse/Collapse'
import Chip from '@/components/Chip/Chip'
import InputInteger from '@/components/InputInteger/InputInteger'
import InputField from '@/components/InputField/InputField'
import FilterMultiSelect from '@/pages/learning-records/components/FilterControls/FilterMultiSelect'
import CourseIcon from '@/components/icons/CourseIcon'
import { type DropdownOption } from '@/components/Dropdown/Dropdown'
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
}

// Iconsax icon at a given size, inheriting color (→ --text-primary in context).
const ix = (El: typeof Sort) => (size: number) => <El size={size} color="currentColor" variant="Linear" />

export const FILTER_DEFS: FilterDef[] = [
  { id: 'course', label: 'Course', renderIcon: (s) => <CourseIcon size={s} />, kind: 'multi' },
  { id: 'status', label: 'Status', renderIcon: ix(Status), kind: 'multi' },
  { id: 'startDate', label: 'Start date', renderIcon: ix(Calendar), kind: 'date' },
  { id: 'dueDate', label: 'Due date', renderIcon: ix(Clock), kind: 'date' },
  { id: 'completionDate', label: 'Completion date', renderIcon: ix(CalendarTick), kind: 'date' },
  { id: 'progress', label: 'Progress', renderIcon: ix(Chart), kind: 'range', suffix: '%' },
  { id: 'score', label: 'Score', renderIcon: ix(Star1), kind: 'range', suffix: '%' },
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
      const val = id === 'progress' ? row.progress : row.score ?? -1
      if (val < v.min || val > v.max) return false
    } else {
      const val = id === 'startDate' ? row.startDate : id === 'dueDate' ? row.dueDate : row.completionDate
      if (!val) return false
      if (v.from && val < v.from) return false
      if (v.to && val > v.to) return false
    }
  }
  return true
}

/* How many pills before collapsing the rest into "+N". */
const MAX_PILLS = 4

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
}

function CourseFilters({ courses, active, values, expanded, onAdd, onRemove, onSetValue, onClear, onToggleExpanded }: CourseFiltersProps) {
  const [addOpen, setAddOpen] = useState(false)
  const addRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!addOpen) return
    const onDown = (e: MouseEvent) => {
      if (addRef.current && !addRef.current.contains(e.target as Node)) setAddOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [addOpen])

  // Options for the multi-select filters, derived from the data.
  const optionsById = useMemo(() => {
    const uniq = (arr: string[]) => [...new Set(arr)]
    const toOpts = (arr: string[]): DropdownOption[] => arr.map((v) => ({ value: v, label: v }))
    return {
      course: toOpts(uniq(courses.map((c) => c.course))),
      status: toOpts(uniq(courses.map((c) => c.status))),
    } as Record<string, DropdownOption[]>
  }, [courses])

  const available = FILTER_DEFS.filter((d) => !active.includes(d.id))

  const addFilter = (id: FilterId) => {
    onAdd(id)
    setAddOpen(false)
  }

  // Short label for a collapsed pill: the chosen value(s) if any, else the filter name.
  const pillLabel = (id: FilterId): string => {
    const def = DEF_BY_ID[id]
    const v = values[id]
    if (v?.kind === 'multi' && v.values.length) return v.values.length === 1 ? v.values[0] : `${def.label} · ${v.values.length}`
    if (v?.kind === 'range' && (v.min > 0 || v.max < 100)) return `${def.label} ${v.min}–${v.max}${def.suffix ?? ''}`
    if (v?.kind === 'date' && (v.from || v.to)) return `${def.label} ${v.from || '…'} → ${v.to || '…'}`
    return def.label
  }

  const visiblePills = active.slice(0, MAX_PILLS)
  const overflow = active.length - visiblePills.length

  const renderControl = (def: FilterDef) => {
    const v = values[def.id] ?? defaultValueFor(def.kind)
    if (v.kind === 'multi') {
      return (
        <FilterMultiSelect
          options={optionsById[def.id] ?? []}
          value={v.values}
          placeholder={`Select ${def.label.toLowerCase()}`}
          onChange={(arr) => onSetValue(def.id, { kind: 'multi', values: arr })}
        />
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
    const calIcon = <Calendar size={20} color="var(--text-tertiary)" variant="Linear" />
    return (
      <div className="up-filter-control-inline">
        <span className="up-filter-connector">between</span>
        <InputField type="date" className="up-filter-date" placeholder="dd/mm/yyyy" value={v.from} iconRight={calIcon} onChange={(e) => onSetValue(def.id, { kind: 'date', from: e.target.value, to: v.to })} />
        <span className="up-filter-connector">and</span>
        <InputField type="date" className="up-filter-date" placeholder="dd/mm/yyyy" value={v.to} iconRight={calIcon} onChange={(e) => onSetValue(def.id, { kind: 'date', from: v.from, to: e.target.value })} />
      </div>
    )
  }

  const addButton = (
    <div className="up-filter-add-wrap" ref={addRef}>
      <button type="button" className="up-filter-add" aria-haspopup="listbox" aria-expanded={addOpen} onClick={() => setAddOpen((o) => !o)}>
        Add Filter
        <Add size={20} color="var(--primary-600)" variant="Linear" />
      </button>
      {addOpen && (
        <div className="up-filter-add-menu" role="listbox">
          {available.length === 0 ? (
            <div className="up-filter-add-empty">All filters added</div>
          ) : (
            available.map((d) => (
              <button key={d.id} type="button" role="option" className="up-filter-add-item" onClick={() => addFilter(d.id)}>
                <span className="up-filter-add-icon">{d.renderIcon(20)}</span>
                {d.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )

  return (
    <div className="up-filters">
      <div className="up-filters-head">
        <button type="button" className="up-filters-toggle" aria-expanded={expanded} onClick={onToggleExpanded}>
          <span className="up-filters-icon"><Sort size={20} color="var(--text-primary)" variant="Linear" /></span>
          <span className="up-filters-label">Filters</span>
          <span className="up-filters-badge">{active.length}</span>
        </button>

        <div className={`up-filters-collapsed${expanded ? ' up-filters-collapsed--hidden' : ''}`}>
          {active.length === 0 ? (
            addButton
          ) : (
            <div className="up-filters-pills">
              {visiblePills.map((id) => (
                <Chip
                  key={id}
                  label={pillLabel(id)}
                  customIconLeft={<span className="up-pill-chip-icon">{DEF_BY_ID[id].renderIcon(16)}</span>}
                  iconRight
                  onDismiss={() => onRemove(id)}
                />
              ))}
              {overflow > 0 && <Chip label={`+${overflow}`} onClick={onToggleExpanded} />}
            </div>
          )}
        </div>

        <div className="up-filters-trailing">
          <button type="button" className="up-filters-chevron-btn" aria-label={expanded ? 'Collapse filters' : 'Expand filters'} aria-expanded={expanded} onClick={onToggleExpanded}>
            <span className={`up-filters-chevron${expanded ? ' up-filters-chevron--open' : ''}`}>
              <ArrowDown2 size={16} color="var(--text-tertiary)" variant="Linear" />
            </span>
          </button>
        </div>
      </div>

      <Collapse open={expanded}>
        <div className="up-filters-body">
          {active.map((id) => {
            const def = DEF_BY_ID[id]
            return (
              <Fragment key={id}>
                <div className="up-filter-row">
                  <span className="up-filter-row-icon">{def.renderIcon(20)}</span>
                  <span className="up-filter-row-label">{def.label} is</span>
                  {renderControl(def)}
                  <button type="button" className="up-filter-row-remove" aria-label={`Remove ${def.label} filter`} onClick={() => onRemove(id)}>
                    <Add size={16} color="currentColor" style={{ transform: 'rotate(45deg)' }} />
                  </button>
                </div>
              </Fragment>
            )
          })}
          <div className="up-filters-actions">
            {addButton}
            <button type="button" className="up-filters-clear" disabled={active.length === 0} onClick={onClear}>
              Clear All
            </button>
          </div>
        </div>
      </Collapse>
    </div>
  )
}

export default CourseFilters
