import { useState } from 'react'
import Button from '@/components/Button/Button'
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal'
import Toggle from '@/components/Toggle/Toggle'
import EnrolmentsToolbar from './EnrolmentsToolbar'
import { CERTS_ACTIVE, CERTS_ALL, DEACTIVATED_CERTS, certCount, type VariantProps } from './data'
import './VariantToggle.css'

/* Toggle: the dialog leads with the active-only count; one switch adds the
   deactivated people and the count (and the button) update in place. */
export default function VariantToggle({ onDownload }: VariantProps) {
  const [open, setOpen] = useState(true)
  const [includeDeactivated, setIncludeDeactivated] = useState(false)
  const count = includeDeactivated ? CERTS_ALL : CERTS_ACTIVE
  const close = () => {
    setOpen(false)
    setIncludeDeactivated(false)
  }

  return (
    <>
      <EnrolmentsToolbar onOpen={() => setOpen(true)} />
      <ConfirmModal open={open} onClose={close} ariaLabel="Download certificates">
        <div className="confirm-modal-header">
          <h2 className="confirm-modal-title">Download certificates</h2>
          <p className="confirm-modal-body cd-cert-body">
            {includeDeactivated
              ? `${CERTS_ALL} people completed this course, including ${DEACTIVATED_CERTS} deactivated.`
              : `${CERTS_ACTIVE} people completed this course.`}
          </p>
        </div>
        <div className="dcp-toggle-card">
        <Toggle
          label={
            <span className="dcp-toggle-text">
              <span className="dcp-toggle-title">Include deactivated people</span>
              <span className="dcp-toggle-desc">
                Adds {certCount(DEACTIVATED_CERTS)} from people who no longer have access
              </span>
            </span>
          }
          size="sm"
          checked={includeDeactivated}
          onChange={() => setIncludeDeactivated((v) => !v)}
          className="dcp-toggle-row"
        />
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
