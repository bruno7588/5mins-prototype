import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Avatar from '@/components/Avatar/Avatar'
import Badge from '@/components/Badge/Badge'
import CloseButton from '@/components/CloseButton/CloseButton'
import ContentSwitcher from '@/components/ContentSwitcher/ContentSwitcher'
import Table, { type Column } from '@/components/Table/Table'
import { useOverlayA11y } from '@/hooks/useOverlayA11y'
import { PEOPLE } from '@/data/people'
import type { EnrolmentStatus } from '@/data/enrolments'
import type { AffectedRow } from './ReviewStep'

/* "View People" on Review: everyone who already has one of the selected courses, one row
   per person and course, split by a Content Switcher: currently enrolled or completed. DS Side Drawer
   (overlays.md) with the shell classes from CoursesDrawer.css, name cell as in My Team's
   ReminderDrawer, status badges as in Course details Enrolments. */

const BY_ID = new Map(PEOPLE.map((p) => [p.id, p]))
const PAGE = 10

const STATUS: Partial<Record<EnrolmentStatus, { type: 'informative' | 'in-progress' | 'error'; label: string }>> = {
  'not-started': { type: 'informative', label: 'Not started' },
  'in-progress': { type: 'in-progress', label: 'In progress' },
  overdue: { type: 'error', label: 'Overdue' },
}

const nameColumn: Column<AffectedRow> = {
  key: 'name',
  header: 'Name',
  render: (r) => (
    <span className="tbl-media">
      <Avatar size={40} />
      <span className="tbl-stack">
        <span className="primary">{r.name}</span>
        <span className="supporting">{BY_ID.get(r.personId)?.team}</span>
      </span>
    </span>
  ),
}
const courseColumn: Column<AffectedRow> = { key: 'course', header: 'Course', render: (r) => r.courseName }
const statusColumn: Column<AffectedRow> = {
  key: 'status',
  header: 'Status',
  width: '0 0 140px',
  render: (r) => {
    const s = STATUS[r.status]
    return s ? <Badge type={s.type} label={s.label} /> : null
  },
}

/** One tab's list with its own pagination. Completed rows need no status column. */
function AffectedTable({ rows, columns }: { rows: AffectedRow[]; columns: Column<AffectedRow>[] }) {
  const [page, setPage] = useState(0)
  return (
    <Table
        columns={columns}
        rows={rows.slice(page * PAGE, (page + 1) * PAGE)}
        getRowKey={(r) => `${r.personId}|${r.courseId}`}
        pagination={{
          from: page * PAGE + 1,
          to: Math.min(rows.length, (page + 1) * PAGE),
          total: rows.length,
          onPrev: () => setPage((p) => Math.max(0, p - 1)),
          onNext: () => setPage((p) => p + 1),
        }}
      />
  )
}

interface Props {
  open: boolean
  rows: AffectedRow[]
  onClose: () => void
}

function AffectedPeopleDrawer({ open, rows, onClose }: Props) {
  const panelRef = useRef<HTMLElement>(null)
  const [closing, setClosing] = useState(false)
  const [tab, setTab] = useState<'current' | 'completed'>('current')

  const handleClose = () => {
    setClosing(true)
    setTimeout(() => {
      setClosing(false)
      onClose()
    }, 300)
  }

  useOverlayA11y(panelRef, open && !closing)

  useEffect(() => {
    if (open) setTab('current')
  }, [open])

  /* The wizard behind traps Tab and treats Escape as "discard". Catch both first, on
     window capture, so they only ever act on this drawer. */
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' && e.key !== 'Tab') return
      e.stopPropagation()
      if (e.key === 'Escape') return handleClose()
      const items = Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])') ?? [],
      )
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      const inside = panelRef.current?.contains(document.activeElement)
      if (e.shiftKey && (document.activeElement === first || !inside)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && (document.activeElement === last || !inside)) {
        e.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  if (!open) return null

  const current = rows.filter((r) => r.status !== 'completed')
  const completed = rows.filter((r) => r.status === 'completed')
  const tabs = [
    { id: 'current' as const, label: 'Currently enrolled', rows: current, columns: [nameColumn, courseColumn, statusColumn] },
    { id: 'completed' as const, label: 'Completed', rows: completed, columns: [nameColumn, courseColumn] },
  ].filter((t) => t.rows.length > 0)
  const active = tabs.find((t) => t.id === tab) ?? tabs[0]

  return createPortal(
    <>
      <div
        className={`overlay-backdrop${closing ? ' overlay-backdrop--closing' : ''}`}
        onClick={handleClose}
        aria-hidden="true"
      />
      <aside
        ref={panelRef}
        tabIndex={-1}
        className={`side-drawer${closing ? ' side-drawer--closing' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="acw-affected-title"
      >
        <div className="side-drawer__header">
          <div className="side-drawer__headline">
            <h2 id="acw-affected-title" className="acw-affected__title">
              People who already have these courses
            </h2>
            <CloseButton onClick={handleClose} />
          </div>
          <div className="modal__divider" />
        </div>

        <div className="side-drawer__content acw-affected__content">
          <ContentSwitcher
            className="acw-affected__switcher"
            items={tabs.map((t) => ({ key: t.id, label: `${t.label} (${t.rows.length})` }))}
            activeKey={active?.id ?? 'current'}
            onChange={(key) => setTab(key as 'current' | 'completed')}
            ariaLabel="People who already have these courses"
          />
          {active && (
            /* Switching swaps the list instantly; only the switcher pill moves. */
            <div key={active.id} role="tabpanel">
              <AffectedTable rows={active.rows} columns={active.columns} />
            </div>
          )}
        </div>
      </aside>
    </>,
    document.body,
  )
}

export default AffectedPeopleDrawer
