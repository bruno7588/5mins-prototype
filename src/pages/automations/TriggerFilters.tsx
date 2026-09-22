import { useEffect, useRef, useState } from 'react'
import {
  Add,
  Briefcase,
  Calendar,
  Location,
  People,
  Profile2User,
  Setting4,
  UserEdit,
} from 'iconsax-react'
import Dropdown from '@/components/Dropdown/Dropdown'
import DatePickerField from '@/components/DatePickerField/DatePickerField'
import Tooltip from '@/components/Tooltip/Tooltip'
import CloseButton from '@/components/CloseButton/CloseButton'
import Search from '@/components/Search/Search'
import FilterMultiSelect from '@/pages/learning-records/components/FilterControls/FilterMultiSelect'
import {
  FILTER_ORDER,
  customFilterFields,
  getFilterField,
  isCustomField,
  GATED_REASON,
  OPERATOR_LABELS,
  isFieldAvailable,
  newFilter,
  type BuiltInFilterField,
  type FilterField,
  type TriggerFilter,
} from './triggerCriteria'
import './TriggerFilters.css'

interface TriggerFiltersProps {
  filters: TriggerFilter[]
  onChange: (next: TriggerFilter[]) => void
}

/**
 * The trigger card's criteria builder (DEV-4403): `[field] [operator] [value]`
 * rows combined with AND, an Add Filter menu and Clear all.
 *
 * No filters means the automation applies to everyone, so there is no "all roles"
 * sentinel — an admin who does not want a constraint simply does not add the row.
 * That is also why the legacy "not required" join-date operator is gone.
 *
 * Controls are reused, not rebuilt: FilterMultiSelect is the same searchable
 * multi-select Learning Records uses, and single-select and date fall to the DS
 * Dropdown and DatePickerField.
 */
/* One 20px Iconsax Linear glyph per field, per the listbox item spec. Custom
   fields share the sliders icon because they are the tenant's own, not a named
   5Mins concept. */
const FIELD_ICONS: Record<BuiltInFilterField, typeof Briefcase> = {
  role: Briefcase,
  rights: UserEdit,
  joinDate: Calendar,
  region: Location,
  cohort: People,
  team: Profile2User,
}

const DATE_REQUIRED =
  'Set a join date for this trigger before the automation can be created.'

export const fieldIcon = (field: FilterField) =>
  isCustomField(field) ? Setting4 : FIELD_ICONS[field as BuiltInFilterField]

function TriggerFilters({ filters, onChange }: TriggerFiltersProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuQuery, setMenuQuery] = useState('')
  const addRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    function onMouseDown(e: MouseEvent) {
      if (addRef.current && !addRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [menuOpen])

  const used = new Set(filters.map((f) => f.field))

  const patch = (id: string, next: Partial<TriggerFilter>) =>
    onChange(filters.map((f) => (f.id === id ? { ...f, ...next } : f)))

  const add = (field: FilterField) => {
    setMenuOpen(false)
    setMenuQuery('')
    onChange([...filters, newFilter(field)])
  }

  return (
    <div className="trigger-filters">
      {filters.map((filter) => {
        const def = getFilterField(filter.field)
        const FieldIcon = fieldIcon(filter.field)
        const dateMissing = def.control === 'date' && !filter.date
        return (
          <div className="trigger-filters__row-group" key={filter.id}>
          <div className="trigger-filters__row">
            {/* The row names its field the same way the menu offered it. */}
            <span className="trigger-filters__field">
              <FieldIcon size={20} color="currentColor" variant="Linear" />
              {def.label}
            </span>

            {def.operators.length > 1 ? (
              <Dropdown
                size="md"
                className="trigger-filters__operator"
                options={def.operators.map((o) => ({ value: o, label: OPERATOR_LABELS[o] }))}
                value={filter.operator}
                onChange={(value) => patch(filter.id, { operator: value as TriggerFilter['operator'] })}
              />
            ) : (
              /* One operator is not a choice, so it reads as the sentence it is. */
              <span className="trigger-filters__operator-static">{OPERATOR_LABELS[filter.operator]}</span>
            )}

            <div className="trigger-filters__value">
              {def.control === 'multi' && (
                <FilterMultiSelect
                  options={def.options.map((o) => ({ value: o.value, label: o.label }))}
                  value={filter.values}
                  placeholder={def.placeholder ?? 'Select'}
                  onChange={(values) => patch(filter.id, { values })}
                />
              )}
              {def.control === 'single' && (
                <Dropdown
                  size="md"
                  options={def.options.map((o) => ({ value: o.value, label: o.label }))}
                  value={filter.values[0] ?? ''}
                  placeholder={def.placeholder ?? 'Select'}
                  onChange={(value) => patch(filter.id, { values: [value] })}
                />
              )}
              {def.control === 'date' && (
                /* An unset date is what blocks the save, so the row says so
                   where the date is missing rather than only on the button
                   (DEV-4767). DatePickerField draws the DS Error state. */
                <DatePickerField
                  value={filter.date ?? ''}
                  onChange={(date) => patch(filter.id, { date })}
                  ariaLabel={def.label}
                  error={dateMissing ? DATE_REQUIRED : undefined}
                />
              )}
            </div>

            <Tooltip text="Remove filter" position="Top" alignment="End" icon={false}>
              <CloseButton
                size={20}
                className="trigger-filters__remove"
                ariaLabel={`Remove ${def.label} filter`}
                onClick={() => onChange(filters.filter((f) => f.id !== filter.id))}
              />
            </Tooltip>
          </div>
          {/* The message belongs to the row, so it reads from the row's left
              edge rather than from under the field. DatePickerField still owns
              the accessible description; this copy is decoration for the eye. */}
          {dateMissing && (
            <p className="trigger-filters__row-error" aria-hidden="true">
              {DATE_REQUIRED}
            </p>
          )}
          </div>
        )
      })}

      <div className="trigger-filters__actions">
        <div className="trigger-filters__add-wrap" ref={addRef}>
          <button
            type="button"
            className="trigger-filters__add"
            aria-haspopup="listbox"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <Add size={20} color="currentColor" variant="Linear" />
            Add Filter
          </button>
          {menuOpen && (() => {
            /* Listed vs addable are different things (DEV-4403): a field whose
               tenant flag is off is simply not offered, while Join date stays
               listed and disabled so the admin can see HRIS would unlock it. */
            const q = menuQuery.trim().toLowerCase()
            const matches = (label: string) => !q || label.toLowerCase().includes(q)

            const builtIns = FILTER_ORDER.filter(
              (field) =>
                !used.has(field) &&
                (field === 'joinDate' || isFieldAvailable(field)) &&
                matches(getFilterField(field).label),
            )
            const customs = customFilterFields().filter(
              ({ field, def }) => !used.has(field) && matches(def.label),
            )

            return (
              <div className="trigger-filters__menu" role="listbox">
                <Search
                  size="M"
                  value={menuQuery}
                  placeholder="Search filters"
                  onChange={setMenuQuery}
                  ariaLabel="Search filters"
                />

                {builtIns.map((field) => {
                  const def = getFilterField(field)
                  const available = isFieldAvailable(field)
                  const Icon = fieldIcon(field)
                  const item = (
                    <button
                      type="button"
                      role="option"
                      aria-selected={false}
                      aria-disabled={!available || undefined}
                      className={`trigger-filters__menu-item${available ? '' : ' trigger-filters__menu-item--gated'}`}
                      onClick={available ? () => add(field) : undefined}
                    >
                      <Icon size={20} color="currentColor" variant="Linear" />
                      <span className="trigger-filters__menu-label">{def.label}</span>
                    </button>
                  )
                  return available ? (
                    <div key={field}>{item}</div>
                  ) : (
                    /* Listed but closed, so the admin can see what exists and why. */
                    <Tooltip key={field} text={GATED_REASON} position="Right" icon={false}>
                      {item}
                    </Tooltip>
                  )
                })}

                {customs.length > 0 && (
                  <>
                    <div className="trigger-filters__menu-divider" />
                    <div className="trigger-filters__menu-group">Custom Fields</div>
                    {customs.map(({ field, def }) => (
                      <button
                        key={field}
                        type="button"
                        role="option"
                        aria-selected={false}
                        className="trigger-filters__menu-item"
                        onClick={() => add(field)}
                      >
                        <Setting4 size={20} color="currentColor" variant="Linear" />
                        <span className="trigger-filters__menu-label">{def.label}</span>
                      </button>
                    ))}
                  </>
                )}

                {builtIns.length === 0 && customs.length === 0 && (
                  <div className="trigger-filters__menu-empty">
                    {q ? 'No filters match that' : 'Every filter is already added'}
                  </div>
                )}
              </div>
            )
          })()}
        </div>

        {filters.length > 0 && (
          <button type="button" className="trigger-filters__clear" onClick={() => onChange([])}>
            Clear all
          </button>
        )}
      </div>
    </div>
  )
}

export default TriggerFilters
