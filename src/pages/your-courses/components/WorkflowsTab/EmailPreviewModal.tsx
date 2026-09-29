import { useEffect } from 'react'
import { Profile2User, Book1, Diagram } from 'iconsax-react'
import Avatar from '@/components/Avatar/Avatar'
import CloseButton from '../../../../components/CloseButton/CloseButton'
import '../../../../components/ConfirmModal/ConfirmModal.css'
import './EmailPreviewModal.css'

interface Props {
  open: boolean
  onClose: () => void
}

const SAMPLE_ROWS: { filled: number }[] = [
  { filled: 0 },
  { filled: 1 },
  { filled: 2 },
  { filled: 3 },
  { filled: 4 },
]

const SEGMENTS = 8

function EmailPreviewModal({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="confirm-modal-overlay" onClick={onClose}>
      <div
        className="confirm-modal email-preview-modal"
        role="dialog"
        aria-label="Email preview"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="email-preview-modal__header">
          <div className="email-preview-modal__title">
            <h2 className="email-preview-modal__heading">Email preview</h2>
            <p className="email-preview-modal__sub">
              This is a sample preview. Real data will reflect each manager's team.
            </p>
          </div>
          <CloseButton onClick={onClose} />
        </div>
        <div className="email-preview-modal__divider" />

        <div className="email-preview">
          <div className="email-preview__message">
            <p>Hi &lt;name of manager&gt; 👋</p>
            <p>n team members have courses due this month.</p>
          </div>

          <div className="email-preview__stats">
            <div className="email-preview__stat">
              <Profile2User size={24} color="var(--primary-600)" variant="Linear" />
              <span className="email-preview__stat-label">Team members</span>
              <span className="email-preview__stat-value">X</span>
            </div>
            <div className="email-preview__stat">
              <Book1 size={24} color="var(--primary-600)" variant="Linear" />
              <span className="email-preview__stat-label">Pending courses</span>
              <span className="email-preview__stat-value">X</span>
            </div>
            <div className="email-preview__stat">
              <Diagram size={24} color="var(--primary-600)" variant="Linear" />
              <span className="email-preview__stat-label">Average progress</span>
              <span className="email-preview__stat-value">X%</span>
            </div>
          </div>

          <div className="email-preview__table">
            <div className="email-preview__table-head">
              <span className="email-preview__col email-preview__col--name">Name</span>
              <span className="email-preview__col email-preview__col--due">Due soon</span>
              <span className="email-preview__col email-preview__col--progress">Avg Progress</span>
            </div>
            {SAMPLE_ROWS.map((row, i) => (
              <div key={i} className="email-preview__row">
                <div className="email-preview__col email-preview__col--name">
                  <Avatar size={32} />
                  <div className="email-preview__name-bars">
                    <span className="email-preview__bar email-preview__bar--name" />
                    <span className="email-preview__bar email-preview__bar--role" />
                  </div>
                </div>
                <div className="email-preview__col email-preview__col--due">
                  <span className="email-preview__bar email-preview__bar--due" />
                </div>
                <div className="email-preview__col email-preview__col--progress">
                  <div className="email-preview__progress" aria-label={`${row.filled}/${SEGMENTS} segments filled`}>
                    {Array.from({ length: SEGMENTS }).map((_, s) => (
                      <span
                        key={s}
                        className={`email-preview__segment${s < row.filled ? ' email-preview__segment--filled' : ''}`}
                      />
                    ))}
                  </div>
                  <span className="email-preview__bar email-preview__bar--pct" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmailPreviewModal
