import { useEffect, useState } from 'react'
import { Calendar, Edit2, Trash } from 'iconsax-react'
import CloseButton from '../../../../components/CloseButton/CloseButton'
import { frequencyLabel, type SavedReport } from '../../../../utils/lrSavedFilters'
import './ReportsListDrawer.css'

interface ReportsListDrawerProps {
  open: boolean
  onClose: () => void
  reports: SavedReport[]
  /** Apply a report's filters to the table. */
  onApply: (r: SavedReport) => void
  /** Open the Save Report drawer in edit mode. */
  onEdit: (r: SavedReport) => void
  onDelete: (id: string) => void
}

function descLine(r: SavedReport): string {
  if (r.scheduled) {
    const n = r.recipients.length
    return `${frequencyLabel(r.frequency)} · ${n} recipient${n === 1 ? '' : 's'}`
  }
  const n = r.filters.length
  return `${n} filter${n === 1 ? '' : 's'}`
}

function ReportsListDrawer({ open, onClose, reports, onApply, onEdit, onDelete }: ReportsListDrawerProps) {
  const [closing, setClosing] = useState(false)

  const handleClose = () => {
    setClosing(true)
    setTimeout(() => {
      setClosing(false)
      onClose()
    }, 300)
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  if (!open) return null

  return (
    <>
      <div
        className={`overlay-backdrop${closing ? ' overlay-backdrop--closing' : ''}`}
        onClick={handleClose}
        aria-hidden="true"
      />
      <aside
        className={`side-drawer${closing ? ' side-drawer--closing' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reports-list-title"
      >
        <div className="side-drawer__header">
          <div className="side-drawer__headline">
            <div className="rl-header-text">
              <h2 id="reports-list-title" className="rl-title">Reports</h2>
              <p className="rl-subtitle">Apply a saved report to the table, or edit its schedule.</p>
            </div>
            <CloseButton onClick={handleClose} />
          </div>
          <div className="modal__divider" />
        </div>

        <div className="side-drawer__content">
          {reports.length === 0 ? (
            <p className="rl-empty">No saved reports yet. Build a filter view and choose “Save Report”.</p>
          ) : (
            <div className="rl-list">
              {reports.map((r) => (
                <div className="rl-item" key={r.id}>
                  <button
                    type="button"
                    className="rl-item-main"
                    onClick={() => {
                      onApply(r)
                      handleClose()
                    }}
                  >
                    <span className="rl-item-titlerow">
                      <span className="rl-item-title">{r.name}</span>
                      {r.scheduled && (
                        <span className="rl-badge">
                          <Calendar size={12} color="var(--text-secondary)" variant="Linear" />
                          Scheduled
                        </span>
                      )}
                    </span>
                    <span className="rl-item-desc">{descLine(r)}</span>
                  </button>
                  <div className="rl-item-actions">
                    <button
                      type="button"
                      className="rl-icon-btn"
                      aria-label={`Edit ${r.name}`}
                      onClick={() => onEdit(r)}
                    >
                      <Edit2 size={18} color="var(--text-secondary)" variant="Linear" />
                    </button>
                    <button
                      type="button"
                      className="rl-icon-btn rl-icon-btn--danger"
                      aria-label={`Delete ${r.name}`}
                      onClick={() => onDelete(r.id)}
                    >
                      <Trash size={18} color="var(--text-error)" variant="Linear" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  )
}

export default ReportsListDrawer
