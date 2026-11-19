import { useState } from 'react'
import { ImportCurve } from 'iconsax-react'
import Button from '@/components/Button/Button'
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal'
import EnrolmentsFrame from './EnrolmentsFrame'
import { CERTS_ACTIVE, CERTS_ALL, DEACTIVATED_COMPLETED, LEARNERS, certCount, type OnDownload } from './data'
import '@/pages/people/People.css'

type Choice = 'active' | 'all'

/* Dialog: a forced decision. Nothing is preselected, so the admin cannot
   download without consciously choosing whether deactivated people are in. */
export default function VariantDialog({ onDownload }: { onDownload: OnDownload }) {
  const [open, setOpen] = useState(false)
  const [choice, setChoice] = useState<Choice | null>(null)
  const count = choice === 'all' ? CERTS_ALL : CERTS_ACTIVE

  const close = () => {
    setOpen(false)
    setChoice(null)
  }

  const card = (value: Choice, title: string, desc: string) => (
    <label className={`confirm-modal-radio-card${choice === value ? ' confirm-modal-radio-card--warning' : ''}`}>
      <input type="radio" name="dcp-cert-scope" checked={choice === value} onChange={() => setChoice(value)} />
      <span className="confirm-modal-radio-custom" />
      <div className="confirm-modal-radio-card-text">
        <span className="confirm-modal-radio-card-title">{title}</span>
        <span className="confirm-modal-radio-card-desc">{desc}</span>
      </div>
    </label>
  )

  return (
    <>
      <EnrolmentsFrame
        rows={LEARNERS}
        actions={
          <Button
            variant="outlined-2"
            icon={<ImportCurve size={20} color="currentColor" variant="Linear" />}
            onClick={() => setOpen(true)}
          >
            Download Certificates
          </Button>
        }
      />
      <ConfirmModal open={open} onClose={close} ariaLabel="Download certificates">
        <div className="confirm-modal-header">
          <h2 className="confirm-modal-title">Download certificates</h2>
          <p className="confirm-modal-body">
            {CERTS_ALL} people completed this course. {DEACTIVATED_COMPLETED} of them have been deactivated.
          </p>
        </div>
        <div className="confirm-modal-radio-cards">
          {card('active', 'Active people only', certCount(CERTS_ACTIVE))}
          {card('all', 'Include deactivated people', `${certCount(CERTS_ALL)}, including people who no longer have access`)}
        </div>
        <div className="confirm-modal-actions">
          <Button variant="outlined-2" onClick={close}>Cancel</Button>
          <Button
            disabled={choice === null}
            onClick={() => {
              onDownload(count)
              close()
            }}
          >
            {choice === null ? 'Download' : `Download ${count} Certificates`}
          </Button>
        </div>
      </ConfirmModal>
    </>
  )
}
