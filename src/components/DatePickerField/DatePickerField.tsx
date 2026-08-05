import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Calendar } from 'iconsax-react'
import MiniCalendar from '@/pages/programs/components/CourseOutline/MiniCalendar'
import './DatePickerField.css'

const GAP = 6
const EDGE = 8

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
  const popRef = useRef<HTMLDivElement>(null)
  const [rect, setRect] = useState<DOMRect | null>(null)
  const [size, setSize] = useState<{ w: number; h: number } | null>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node
      // The popover is portalled out, so it isn't inside `ref` — check it too,
      // otherwise every click on a day would close the picker before it lands.
      const inField = ref.current?.contains(t)
      const inPopover = popRef.current?.contains(t)
      if (!inField && !inPopover) setOpen(false)
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

  // Anchor to the field's viewport rect, and keep it glued while open.
  useLayoutEffect(() => {
    if (!open) {
      setSize(null)
      return
    }
    const measure = () => {
      if (ref.current) setRect(ref.current.getBoundingClientRect())
    }
    measure()
    window.addEventListener('scroll', measure, true)
    window.addEventListener('resize', measure)
    return () => {
      window.removeEventListener('scroll', measure, true)
      window.removeEventListener('resize', measure)
    }
  }, [open])

  // Measure the popover so it can flip above the field when it would spill.
  useLayoutEffect(() => {
    if (!open || !popRef.current) return
    const { offsetWidth: w, offsetHeight: h } = popRef.current
    setSize((prev) => (prev?.w === w && prev?.h === h ? prev : { w, h }))
  }, [open, rect])

  const display = formatDisplay(value)

  const placement = (): React.CSSProperties => {
    if (!rect) return {}
    if (!size) return { top: rect.bottom + GAP, left: rect.left, visibility: 'hidden' }
    const room = window.innerHeight - rect.bottom - GAP
    const flip = room < size.h && rect.top - GAP - size.h > 0
    const top = flip ? rect.top - GAP - size.h : rect.bottom + GAP
    return {
      // Clamp both axes: on a viewport too short for either side, overlapping
      // the field beats rendering the grid off-screen where it can't be used.
      top: Math.max(EDGE, Math.min(top, window.innerHeight - size.h - EDGE)),
      left: Math.max(EDGE, Math.min(rect.left, window.innerWidth - size.w - EDGE)),
    }
  }

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
      {open && rect &&
        createPortal(
          <div ref={popRef} className="dpf-popover" style={placement()}>
            <MiniCalendar
              value={value || todayISO()}
              onSelect={(iso) => {
                onChange(iso)
                setOpen(false)
              }}
            />
          </div>,
          document.body,
        )}
    </div>
  )
}

export default DatePickerField
