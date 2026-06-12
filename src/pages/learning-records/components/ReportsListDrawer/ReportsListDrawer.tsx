import { useEffect, useRef, useState } from 'react'
import { Calendar, Clock, ArrowRight, Edit2, Eye, Danger, Trash } from 'iconsax-react'
import CloseButton from '../../../../components/CloseButton/CloseButton'
import ConfirmModal from '../../../../components/ConfirmModal/ConfirmModal'
import MoreIcon from '../../../../components/icons/MoreIcon'
import CsvIcon from '../../../../components/icons/CsvIcon'
import { cadenceRecurrence, cadenceTime, type SavedReport } from '../../../../utils/lrSavedFilters'
import { orgUserByEmail } from '../../../../utils/orgUsers'
import './ReportsListDrawer.css'

const MAX_AVATARS = 4

/** Two-letter initials from an email's local part (e.g. lewis-ferrari → LF). */
function emailInitials(email: string): string {
  const local = email.split('@')[0] ?? email
  const parts = local.split(/[.\-_]+/).filter(Boolean)
  const letters = parts.length >= 2 ? parts[0][0] + parts[1][0] : local.slice(0, 2)
  return letters.toUpperCase()
}

/** Overlapping recipient avatars (photo or initials), with a +N overflow chip. */
function RecipientAvatars({ emails }: { emails: string[] }) {
  const shown = emails.slice(0, MAX_AVATARS)
  const overflow = emails.length - shown.length
  return (
    <div className="rl-recipients" aria-label={`${emails.length} recipient${emails.length === 1 ? '' : 's'}`}>
      {shown.map((email) => {
        const user = orgUserByEmail(email)
        if (user?.avatar) {
          return <img key={email} className="rl-avatar rl-avatar--photo" src={user.avatar} alt="" title={email} />
        }
        return (
          <span key={email} className="rl-avatar" title={email}>
            {user ? user.initials : emailInitials(email)}
          </span>
        )
      })}
      {overflow > 0 && (
        <span className="rl-avatar rl-avatar--more" title={emails.slice(MAX_AVATARS).join(', ')}>
          +{overflow}
        </span>
      )}
    </div>
  )
}

interface ReportsListDrawerProps {
  open: boolean
  onClose: () => void
  reports: SavedReport[]
  /** Open the Save Report drawer in edit mode. */
  onEdit: (r: SavedReport) => void
  /** Apply the report's filters to the table (and close the drawer). */
  onApply: (r: SavedReport) => void
  onDelete: (id: string) => void
  /** Download the report now. */
  onDownload: (r: SavedReport) => void
}

function ReportsListDrawer({
  open,
  onClose,
  reports,
  onEdit,
  onApply,
  onDelete,
  onDownload,
}: ReportsListDrawerProps) {
  const [closing, setClosing] = useState(false)
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<SavedReport | null>(null)
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
              <p className="rl-subtitle">Reports are saved from the current filtered table view.</p>
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
                  <div className="rl-item-header">
                    <button
                      type="button"
                      className="rl-item-title"
                      onClick={() => onEdit(r)}
                    >
                      {r.name}
                    </button>

                    {r.scheduled && (
                      <div className="rl-item-meta">
                        <span className="rl-meta">
                          <Calendar size={16} color="var(--text-secondary)" variant="Linear" />
                          {cadenceRecurrence(r)}
                        </span>
                        <span className="rl-meta">
                          <Clock size={16} color="var(--text-secondary)" variant="Linear" />
                          {cadenceTime(r)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="rl-item-info">
                    <div className="rl-item-badges">
                      {r.scheduled ? (
                        r.recipients.length > 0 && <RecipientAvatars emails={r.recipients} />
                      ) : (
                        <span className="rl-meta rl-meta--muted">No schedule</span>
                      )}
                    </div>

                    <div className="rl-item-actions">
                      <button
                        type="button"
                        className="rl-icon-btn"
                        aria-label={`Download ${r.name}`}
                        onClick={() => onDownload(r)}
                      >
                        <CsvIcon size={20} color="var(--text-secondary)" />
                      </button>

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
                              Edit Report
                            </button>
                            <button
                              type="button"
                              role="menuitem"
                              className="rl-menu-item"
                              onClick={() => {
                                setMenuOpenId(null)
                                onApply(r)
                                handleClose()
                              }}
                            >
                              <Eye size={18} color="var(--text-secondary)" variant="Linear" />
                              View in Table
                            </button>
                            <button
                              type="button"
                              role="menuitem"
                              className="rl-menu-item rl-menu-item--danger"
                              onClick={() => {
                                setMenuOpenId(null)
                                setConfirmDelete(r)
                              }}
                            >
                              <Trash size={18} color="var(--danger-500)" variant="Linear" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        className="rl-open-btn"
                        aria-label={`Open ${r.name}`}
                        onClick={() => onEdit(r)}
                      >
                        <ArrowRight size={16} color="var(--text-secondary)" variant="Linear" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      <ConfirmModal open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
        {confirmDelete && (
          <>
            <div className="confirm-modal-header confirm-modal-header--center">
              <div className="confirm-modal-icon">
                <Danger size={72} color="var(--danger-500)" variant="Linear" />
              </div>
              <h2 className="confirm-modal-title">Delete report</h2>
              <p className="confirm-modal-body">
                “{confirmDelete.name}” will be removed{confirmDelete.scheduled ? ', and its scheduled emails will stop' : ''}. This can’t be undone.
              </p>
            </div>
            <div className="confirm-modal-actions">
              <button
                className="confirm-modal-btn confirm-modal-btn--outlined"
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </button>
              <button
                className="confirm-modal-btn confirm-modal-btn--danger"
                onClick={() => {
                  onDelete(confirmDelete.id)
                  setConfirmDelete(null)
                }}
              >
                Delete Report
              </button>
            </div>
          </>
        )}
      </ConfirmModal>
    </>
  )
}

export default ReportsListDrawer
