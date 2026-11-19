import { useState } from 'react'
import Button from '@/components/Button/Button'
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal'
import EnrolmentsToolbar from './EnrolmentsToolbar'
import { CERTS_ACTIVE, CERTS_ALL, DEACTIVATED_CERTS, certCount, type VariantProps } from './data'

type Scope = 'active' | 'all'

/* Choice: the dialog live on the Enrolments tab today. Two option cards with
   "Active people only" selected by default. */
export default function VariantChoice({ onDownload }: VariantProps) {
  const [open, setOpen] = useState(true)
  const [scope, setScope] = useState<Scope>('active')
  const count = scope === 'all' ? CERTS_ALL : CERTS_ACTIVE
  const close = () => {
    setOpen(false)
    setScope('active')
  }

  return (
    <>
      <EnrolmentsToolbar onOpen={() => setOpen(true)} />
      <ConfirmModal open={open} onClose={close} ariaLabel="Download certificates">
        <div className="confirm-modal-header">
          <h2 className="confirm-modal-title">Download certificates</h2>
          <p className="confirm-modal-body cd-cert-body">
            {CERTS_ALL} people completed this course. {DEACTIVATED_CERTS} of them have been deactivated.
          </p>
        </div>
        <div className="confirm-modal-radio-cards cd-cert-cards">
          {([
            ['active', 'Active people only', certCount(CERTS_ACTIVE)],
            ['all', 'Include deactivated people', `${certCount(CERTS_ALL)}, including people who no longer have access`],
          ] as const).map(([value, title, desc]) => (
            <label key={value} className={`confirm-modal-radio-card${scope === value ? ' cd-cert-card--selected' : ''}`}>
              <input type="radio" name="dcp-choice-scope" checked={scope === value} onChange={() => setScope(value)} />
              <span className="confirm-modal-radio-custom" />
              <div className="confirm-modal-radio-card-text cd-cert-card-text">
                <span className="confirm-modal-radio-card-title cd-cert-card-title">{title}</span>
                <span className="confirm-modal-radio-card-desc cd-cert-card-desc">{desc}</span>
              </div>
            </label>
          ))}
        </div>
        <div className="confirm-modal-actions">
          <Button variant="outlined-2" onClick={close}>Cancel</Button>
          <Button
            onClick={() => {
              onDownload(count)
              close()
            }}
          >
            {`Download ${count} Certificates`}
          </Button>
        </div>
      </ConfirmModal>
    </>
  )
}
