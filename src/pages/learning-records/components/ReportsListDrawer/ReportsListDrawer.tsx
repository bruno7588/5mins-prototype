import { useEffect, useState } from 'react'
import { Calendar, Clock, ArrowRight } from 'iconsax-react'
import CloseButton from '../../../../components/CloseButton/CloseButton'
import ConfirmModal from '../../../../components/ConfirmModal/ConfirmModal'
import Tooltip from '../../../../components/Tooltip/Tooltip'
import Avatar from '@/components/Avatar/Avatar'
import AvatarGroup from '@/components/AvatarGroup/AvatarGroup'
import CsvIcon from '../../../../components/icons/CsvIcon'
import { cadenceRecurrence, cadenceTime, type SavedReport } from '../../../../utils/lrSavedFilters'
import { orgUserByEmail } from '@/data/orgUsers'
import './ReportsListDrawer.css'

const MAX_AVATARS = 3

/** A single 24px avatar: the recipient's photo, or the fallback smiley. */
function AvatarCircle({ email }: { email: string }) {
  return <Avatar src={orgUserByEmail(email)?.avatar} size={24} />
}

/**
 * Overlapping recipient avatars. Each shows the email on hover; a "+N" button
 * (when there are more than MAX_AVATARS) opens the full recipients modal. The
 * button is page-local because AvatarGroup's own "+N" bubble isn't clickable.
 */
function RecipientAvatars({ emails, onMore }: { emails: string[]; onMore?: () => void }) {
  const shown = emails.slice(0, MAX_AVATARS)
  const overflow = emails.length - shown.length
  return (
    <div className="rl-recipients" aria-label={`${emails.length} recipient${emails.length === 1 ? '' : 's'}`}>
      <AvatarGroup size={24} className="rl-avatars">
        {shown.map((email) => (
          <Tooltip key={email} text={email} position="Bottom" alignment="Start" icon={false} className="rl-avatar-tip">
            <AvatarCircle email={email} />
          </Tooltip>
        ))}
      </AvatarGroup>
      {overflow > 0 && (
        <button
          type="button"
          className="rl-avatar-more"
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
  /** Download the report now. */
  onDownload: (r: SavedReport) => void
}

function ReportsListDrawer({
  open,
  onClose,
  reports,
  onEdit,
  onDownload,
}: ReportsListDrawerProps) {
  const [closing, setClosing] = useState(false)
  // Report whose full recipient list is shown in the "Recipients" modal.
  const [recipientsReport, setRecipientsReport] = useState<SavedReport | null>(null)

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
                        <span className="rl-no-schedule">
                          <Calendar size={16} color="currentColor" variant="Linear" />
                          No schedule
                        </span>
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
              <h2 className="recipients-modal-title">Recipients</h2>
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
