import { useEffect, useRef, useState } from 'react'
import { Add, CloseCircle } from 'iconsax-react'
import Dropdown from '@/components/Dropdown/Dropdown'
import DatePickerField from '@/components/DatePickerField/DatePickerField'
import Tooltip from '@/components/Tooltip/Tooltip'
import FilterMultiSelect from '@/pages/learning-records/components/FilterControls/FilterMultiSelect'
import {
  FILTER_FIELDS,
  FILTER_ORDER,
  GATED_REASON,
  OPERATOR_LABELS,
  isFieldAvailable,
  newFilter,
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
function TriggerFilters({ filters, onChange }: TriggerFiltersProps) {
  const [menuOpen, setMenuOpen] = useState(false)
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
    onChange([...filters, newFilter(field)])
  }

  return (
    <div className="trigger-filters">
      {filters.map((filter) => {
        const def = FILTER_FIELDS[filter.field]
        return (
          <div className="trigger-filters__row" key={filter.id}>
            <span className="trigger-filters__field">{def.label}</span>

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
                <DatePickerField
                  value={filter.date ?? ''}
                  onChange={(date) => patch(filter.id, { date })}
                  ariaLabel="Join date"
                />
              )}
            </div>

            <Tooltip text="Remove filter" position="Top" alignment="End" icon={false}>
              <button
                type="button"
                className="trigger-filters__remove"
                aria-label={`Remove ${def.label} filter`}
                onClick={() => onChange(filters.filter((f) => f.id !== filter.id))}
              >
                <CloseCircle size={20} color="currentColor" variant="Linear" />
              </button>
            </Tooltip>
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
          {menuOpen && (
            <div className="trigger-filters__menu" role="listbox">
              {FILTER_ORDER.filter((field) => !used.has(field)).map((field) => {
                const def = FILTER_FIELDS[field]
                const available = isFieldAvailable(field)
                const item = (
                  <button
                    type="button"
                    role="option"
                    aria-selected={false}
                    aria-disabled={!available || undefined}
                    className={`trigger-filters__menu-item${available ? '' : ' trigger-filters__menu-item--gated'}`}
                    onClick={available ? () => add(field) : undefined}
                  >
                    <span className="trigger-filters__menu-label">{def.label}</span>
                    {def.hint && <span className="trigger-filters__menu-hint">{def.hint}</span>}
                  </button>
                )
                return available ? (
                  <div key={field}>{item}</div>
                ) : (
                  /* Gated fields stay listed so the admin can see what exists and
                     why they cannot have it yet. */
                  <Tooltip key={field} text={GATED_REASON} position="Right" icon={false}>
                    {item}
                  </Tooltip>
                )
              })}
              {FILTER_ORDER.every((field) => used.has(field)) && (
                <div className="trigger-filters__menu-empty">Every filter is already added</div>
              )}
            </div>
          )}
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
