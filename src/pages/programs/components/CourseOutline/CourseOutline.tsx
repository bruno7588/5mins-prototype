import { useRef, useState } from 'react'
import { Add, ArrowDown2, Trash } from 'iconsax-react'
import type { CourseStep, ProgramStep, ReleaseRule } from '../../programStore'
import Tooltip from '../../../../components/Tooltip/Tooltip'
import ReleasePopover from './ReleasePopover'
import DueDatePopover from '../../../automations/DueDatePopover'
import type { DueDateConfig } from '../../../automations/Automations'
import './CourseOutline.css'

interface Props {
  steps: ProgramStep[]
  onReorder: (from: number, to: number) => void
  onRemove: (stepId: string) => void
  onPatch: (stepId: string, patch: Partial<ProgramStep>) => void
  onAddCourse: () => void
}

/* ── Display helpers ─────────────────────────────────────────────────────── */

const dueToConfig = (dueDays?: number): DueDateConfig =>
  dueDays != null ? { kind: 'relative', daysAfterStart: dueDays } : { kind: 'none' }

const configToDue = (c: DueDateConfig): number | undefined =>
  c.kind === 'relative' ? c.daysAfterStart : undefined

const fmtDate = (iso: string): string => {
  const [y, m, d] = iso.split('-')
  return d && m && y ? `${d}/${m}/${y}` : iso
}

const enrolDisplay = (r: ReleaseRule): { title: string; desc?: string } => {
  if (r.kind === 'after-days') {
    const unit = r.days === 1 ? 'day' : 'days'
    return { title: 'After delay', desc: `${r.days} ${unit} after previous course` }
  }
  if (r.kind === 'on-date') return { title: 'On specific date', desc: fmtDate(r.date) }
  return { title: 'Program start' }
}

const dueDisplay = (c: DueDateConfig): { title: string; desc?: string } => {
  if (c.kind === 'none') return { title: 'No due date' }
  const unit = c.daysAfterStart === 1 ? 'day' : 'days'
  return { title: `${c.daysAfterStart} ${unit} after start date` }
}

function DragGrip() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      {[6, 10, 14].map((y) =>
        [7, 13].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.4" fill="var(--text-tertiary)" />),
      )}
    </svg>
  )
}

function EnrolmentCell({ release, onChange }: { release: ReleaseRule; onChange: (r: ReleaseRule) => void }) {
  const ref = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const [closing, setClosing] = useState(false)
  const close = () => {
    setClosing(true)
    setTimeout(() => {
      setOpen(false)
      setClosing(false)
    }, 150)
  }
  const d = enrolDisplay(release)
  return (
    <div className="co-cell">
      <button
        ref={ref}
        type="button"
        className={`co-cell__trigger${open ? ' co-cell__trigger--open' : ''}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => (open ? close() : setOpen(true))}
      >
        <span className="co-cell__body">
          <span className="co-cell__title">{d.title}</span>
          {d.desc && <span className="co-cell__sub">{d.desc}</span>}
        </span>
        <ArrowDown2 size={18} color="var(--text-tertiary)" variant="Linear" />
      </button>
      {open && (
        <ReleasePopover
          value={release}
          onChange={onChange}
          onClose={close}
          closing={closing}
          anchorRef={ref}
        />
      )}
    </div>
  )
}

function DueCell({ dueDays, onChange }: { dueDays?: number; onChange: (dueDays?: number) => void }) {
  const ref = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const value = dueToConfig(dueDays)
  const d = dueDisplay(value)
  return (
    <div className="co-cell">
      <button
        ref={ref}
        type="button"
        className={`co-cell__trigger${open ? ' co-cell__trigger--open' : ''}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="co-cell__body">
          <span className="co-cell__title">{d.title}</span>
          {d.desc && <span className="co-cell__sub">{d.desc}</span>}
        </span>
        <ArrowDown2 size={18} color="var(--text-tertiary)" variant="Linear" />
      </button>
      {open && (
        <DueDatePopover
          value={value}
          onChange={(next) => onChange(configToDue(next))}
          onClose={() => setOpen(false)}
          anchorRef={ref}
        />
      )}
    </div>
  )
}

function CourseOutline({ steps, onReorder, onRemove, onPatch, onAddCourse }: Props) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)

  return (
    <div className="co-outline">
      <div className="co-table">
        <div className="co-head">
          <span className="co-head__course">Course</span>
          <span className="co-head__col">Enrolment</span>
          <span className="co-head__col">Due date</span>
        </div>

        {steps.map((step, i) => {
          const course = step as CourseStep
          return (
            <div
              key={step.id}
              className={`co-row${overIndex === i && dragIndex !== null && dragIndex !== i ? ' co-row--drop' : ''}${dragIndex === i ? ' co-row--dragging' : ''}`}
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragOver={(e) => {
                e.preventDefault()
                setOverIndex(i)
              }}
              onDrop={() => {
                if (dragIndex !== null) onReorder(dragIndex, i)
                setDragIndex(null)
                setOverIndex(null)
              }}
              onDragEnd={() => {
                setDragIndex(null)
                setOverIndex(null)
              }}
            >
              <span className="co-grip" aria-hidden="true">
                <DragGrip />
              </span>

              <div className="co-card">
                <div className="co-card__course">
                  <span className="co-counter">{i + 1}</span>
                  <span
                    className="co-thumb"
                    style={{ backgroundImage: course.thumbnail ? `url(${course.thumbnail})` : undefined }}
                  />
                  <span className="co-title">{step.title}</span>
                </div>
                <div className="co-card__col">
                  <EnrolmentCell release={step.release} onChange={(r) => onPatch(step.id, { release: r })} />
                </div>
                <div className="co-card__col">
                  <DueCell dueDays={step.dueDays} onChange={(dd) => onPatch(step.id, { dueDays: dd })} />
                </div>
              </div>

              <Tooltip text="Remove" position="Top" icon={false}>
                <button type="button" className="co-remove" aria-label="Remove course" onClick={() => onRemove(step.id)}>
                  <Trash size={16} color="currentColor" variant="Linear" />
                </button>
              </Tooltip>
            </div>
          )
        })}
      </div>

      <div className="co-actions">
        <button type="button" className="co-add" onClick={onAddCourse}>
          <Add size={20} color="var(--text-primary)" variant="Linear" />
          Add Course
        </button>
      </div>
    </div>
  )
}

export default CourseOutline
