import { useEffect, useRef, useState } from 'react'
import { DocumentDownload, Edit2, Trash } from 'iconsax-react'
import CloseButton from '../../../../components/CloseButton/CloseButton'
import Toggle from '../../../../components/Toggle/Toggle'
import MoreIcon from '../../../../components/icons/MoreIcon'
import { cadenceSummary, type SavedReport } from '../../../../utils/lrSavedFilters'
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
  /** Pause/resume a scheduled report. */
  onToggle: (r: SavedReport, enabled: boolean) => void
  /** Download the report now. */
  onDownload: (r: SavedReport) => void
}

function ReportsListDrawer({
  open,
  onClose,
  reports,
  onApply,
  onEdit,
  onDelete,
  onToggle,
  onDownload,
}: ReportsListDrawerProps) {
  const [closing, setClosing] = useState(false)
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

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

  // Close the kebab menu on outside click.
  useEffect(() => {
    if (menuOpenId === null) return
    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpenId(null)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [menuOpenId])

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
              {reports.map((r) => {
                const enabled = r.enabled !== false
                return (
                  <div className={`rl-item${r.scheduled && !enabled ? ' rl-item--off' : ''}`} key={r.id}>
                    <button
                      type="button"
                      className="rl-item-main"
                      onClick={() => {
                        onApply(r)
                        handleClose()
                      }}
                    >
                      <span className="rl-item-title">{r.name}</span>
                      <span className="rl-item-desc">{cadenceSummary(r)}</span>
                    </button>

                    <div className="rl-item-actions">
                      <button
                        type="button"
                        className="rl-icon-btn"
                        aria-label={`Download ${r.name}`}
                        onClick={() => onDownload(r)}
                      >
                        <DocumentDownload size={18} color="var(--text-secondary)" variant="Linear" />
                      </button>

                      {r.scheduled && (
                        <Toggle
                          checked={enabled}
                          size="sm"
                          aria-label={`${enabled ? 'Pause' : 'Resume'} ${r.name}`}
                          onChange={(e) => onToggle(r, e.target.checked)}
                        />
                      )}

                      <div
                        className="rl-more-wrapper"
                        ref={menuOpenId === r.id ? menuRef : undefined}
                      >
                        <button
                          type="button"
                          className="rl-icon-btn"
                          aria-label={`More options for ${r.name}`}
                          aria-haspopup="menu"
                          aria-expanded={menuOpenId === r.id}
                          onClick={() => setMenuOpenId(menuOpenId === r.id ? null : r.id)}
                        >
                          <MoreIcon size={20} color="var(--text-secondary)" />
                        </button>
                        {menuOpenId === r.id && (
                          <div className="rl-menu" role="menu">
                            <button
                              type="button"
                              role="menuitem"
                              className="rl-menu-item"
                              onClick={() => {
                                setMenuOpenId(null)
                                onEdit(r)
                              }}
                            >
                              <Edit2 size={18} color="var(--text-secondary)" variant="Linear" />
                              Edit
                            </button>
                            <button
                              type="button"
                              role="menuitem"
                              className="rl-menu-item rl-menu-item--danger"
                              onClick={() => {
                                setMenuOpenId(null)
                                onDelete(r.id)
                              }}
                            >
                              <Trash size={18} color="var(--danger-500)" variant="Linear" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </aside>
    </>
  )
}

export default ReportsListDrawer
