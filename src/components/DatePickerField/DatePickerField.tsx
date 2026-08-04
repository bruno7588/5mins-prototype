import { useEffect, useRef, useState } from 'react'
import { Calendar } from 'iconsax-react'
import MiniCalendar from '@/pages/programs/components/CourseOutline/MiniCalendar'
import './DatePickerField.css'

interface DatePickerFieldProps {
  /** ISO yyyy-mm-dd, or '' when empty. */
  value: string
  onChange: (iso: string) => void
  placeholder?: string
  className?: string
  ariaLabel?: string
}

const formatDisplay = (iso: string) => {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

const todayISO = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/**
 * Date field + DS month-grid popover (MiniCalendar). Replaces the native
 * <input type="date"> browser picker so date entry matches the design system.
 */
function DatePickerField({ value, onChange, placeholder = 'dd/mm/yyyy', className = '', ariaLabel = 'Choose a date' }: DatePickerFieldProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const display = formatDisplay(value)

  return (
    <div className={`dpf ${className}`.trim()} ref={ref}>
      <button
        type="button"
        className={`dpf-field${open ? ' dpf-field--active' : ''}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={`dpf-value${display ? '' : ' dpf-value--placeholder'}`}>{display || placeholder}</span>
        <Calendar size={20} color="var(--text-primary)" variant="Linear" />
      </button>
      {open && (
        <div className="dpf-popover">
          <MiniCalendar
            value={value || todayISO()}
            onSelect={(iso) => {
              onChange(iso)
              setOpen(false)
            }}
          />
        </div>
      )}
    </div>
  )
}

export default DatePickerField
