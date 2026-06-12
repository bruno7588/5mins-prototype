import { useEffect, useRef, useState } from 'react'
import { Calendar, Clock, ArrowRight, Copy, Eye, Danger, Trash } from 'iconsax-react'
import CloseButton from '../../../../components/CloseButton/CloseButton'
import ConfirmModal from '../../../../components/ConfirmModal/ConfirmModal'
import MoreIcon from '../../../../components/icons/MoreIcon'
import Tooltip from '../../../../components/Tooltip/Tooltip'
import CsvIcon from '../../../../components/icons/CsvIcon'
import { cadenceRecurrence, cadenceTime, type SavedReport } from '../../../../utils/lrSavedFilters'
import { orgUserByEmail } from '../../../../utils/orgUsers'
import './ReportsListDrawer.css'

const MAX_AVATARS = 3

/** Two-letter initials from an email's local part (e.g. lewis-ferrari → LF). */
function emailInitials(email: string): string {
  const local = email.split('@')[0] ?? email
  const parts = local.split(/[.\-_]+/).filter(Boolean)
  const letters = parts.length >= 2 ? parts[0][0] + parts[1][0] : local.slice(0, 2)
  return letters.toUpperCase()
}

/** A single 24px avatar — the recipient's photo, or their initials. */
function AvatarCircle({ email }: { email: string }) {
  const user = orgUserByEmail(email)
  if (user?.avatar) return <img className="rl-avatar rl-avatar--photo" src={user.avatar} alt="" />
  return <span className="rl-avatar">{user ? user.initials : emailInitials(email)}</span>
}

/**
 * Overlapping recipient avatars. Each shows the email on hover; a "+N" chip
 * (when there are more than MAX_AVATARS) opens the full recipients modal.
 */
function RecipientAvatars({ emails, onMore }: { emails: string[]; onMore?: () => void }) {
  const shown = emails.slice(0, MAX_AVATARS)
  const overflow = emails.length - shown.length
  return (
    <div className="rl-recipients" aria-label={`${emails.length} recipient${emails.length === 1 ? '' : 's'}`}>
      {shown.map((email) => (
        <Tooltip key={email} text={email} position="Bottom" alignment="Start" icon={false} className="rl-avatar-tip">
          <AvatarCircle email={email} />
        </Tooltip>
      ))}
      {overflow > 0 && (
        <button
          type="button"
          className="rl-avatar rl-avatar--more"
          onClick={onMore}
          aria-label={`Show all ${emails.length} recipients`}
        >
          +{overflow}
        </button>
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
  /** Open the edit flow on a fresh copy of the report. */
  onDuplicate: (r: SavedReport) => void
  /** Open the edit drawer with scheduling pre-enabled. */
  onSchedule: (r: SavedReport) => void
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
  onDuplicate,
  onSchedule,
  onApply,
  onDelete,
  onDownload,
}: ReportsListDrawerProps) {
  const [closing, setClosing] = useState(false)
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<SavedReport | null>(null)
  // Report whose full recipient list is shown in the "Report sent to" modal.
  const [recipientsReport, setRecipientsReport] = useState<SavedReport | null>(null)
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
              <p className="rl-subtitle">Saved views you can export as CSV or email on a schedule.</p>
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
                        r.recipients.length > 0 && (
                          <RecipientAvatars emails={r.recipients} onMore={() => setRecipientsReport(r)} />
                        )
                      ) : (
                        <button
                          type="button"
                          className="rl-add-schedule"
                          onClick={() => onSchedule(r)}
                        >
                          <Calendar size={16} color="currentColor" variant="Linear" />
                          Add a schedule
                        </button>
                      )}
                    </div>

                    <div className="rl-item-actions">
                      <Tooltip text="Download report" position="Top" icon={false}>
                        <button
                          type="button"
                          className="rl-icon-btn"
                          aria-label={`Download ${r.name}`}
                          onClick={() => onDownload(r)}
                        >
                          <CsvIcon size={20} color="var(--text-secondary)" />
                        </button>
                      </Tooltip>

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
                                onDuplicate(r)
                              }}
                            >
                              <Copy size={18} color="var(--text-secondary)" variant="Linear" />
                              Duplicate
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

                      <Tooltip text="Edit report" position="Top" alignment="End" icon={false}>
                        <button
                          type="button"
                          className="rl-open-btn"
                          aria-label={`Edit ${r.name}`}
                          onClick={() => onEdit(r)}
                        >
                          <ArrowRight size={16} color="var(--text-secondary)" variant="Linear" />
                        </button>
                      </Tooltip>
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

      {/* Full recipient list — opened from the "+N" avatar (Figma 11643:136449). */}
      <ConfirmModal
        open={!!recipientsReport}
        onClose={() => setRecipientsReport(null)}
        className="recipients-modal"
      >
        {recipientsReport && (
          <>
            <div className="recipients-modal-close">
              <CloseButton onClick={() => setRecipientsReport(null)} />
            </div>
            <div className="recipients-modal-header">
              <h2 className="recipients-modal-title">Report sent to</h2>
              <div className="recipients-modal-divider" />
            </div>
            <div className="recipients-modal-list">
              {recipientsReport.recipients.map((email) => (
                <div className="recipients-modal-item" key={email}>
                  <AvatarCircle email={email} />
                  <span className="recipients-modal-email">{email}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </ConfirmModal>
    </>
  )
}

export default ReportsListDrawer
