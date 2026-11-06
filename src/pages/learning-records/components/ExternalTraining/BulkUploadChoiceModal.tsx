import type { ReactNode } from 'react'
import { ArrowRight } from 'iconsax-react'
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal'
import CsvIcon from '@/components/icons/CsvIcon'
import ZipIcon from '@/components/icons/ZipIcon'
import '@/pages/add-content/components/CreateFlashcardsModal.css'

/* Bulk upload: pick CSV (records only) or ZIP (the CSV plus certificate files),
   the same two-card choice as Create Flashcards. Each opens its own drawer. */

export type BulkUploadKind = 'csv' | 'zip'

interface Props {
  open: boolean
  onClose: () => void
  onChoose: (kind: BulkUploadKind) => void
}

const OPTIONS: { kind: BulkUploadKind; title: string; desc: string; icon: ReactNode; variant: string }[] = [
  {
    kind: 'csv',
    title: 'Upload a CSV file',
    desc: 'Add training records from a spreadsheet, without certificates',
    icon: <CsvIcon size={32} color="var(--secondary-600)" />,
    variant: 'cfm-option--empty',
  },
  {
    kind: 'zip',
    title: 'Upload a ZIP file',
    desc: 'Add training records and their certificates in one zip file',
    icon: <ZipIcon size={32} color="url(#bulk-zip-gradient)" />,
    variant: 'cfm-option--ai',
  },
]

function BulkUploadChoiceModal({ open, onClose, onChoose }: Props) {
  return (
    <ConfirmModal open={open} onClose={onClose} className="cfm-modal" closable ariaLabel="Bulk upload">
      <div className="cfm-header">
        <h2 className="cfm-title">What would you like to upload?</h2>
      </div>
      {/* The AI gradient Create Flashcards uses on its sparkle, for the ZIP icon. */}
      <svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="bulk-zip-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#00AFC4" />
            <stop offset="1" stopColor="#8158EC" />
          </linearGradient>
        </defs>
      </svg>
      <div className="cfm-options">
        {OPTIONS.map((o) => (
          <button key={o.kind} type="button" className={`cfm-option ${o.variant}`} onClick={() => onChoose(o.kind)}>
            <div className="cfm-option-body">
              <div className="cfm-option-icon">{o.icon}</div>
              <div className="cfm-option-info">
                <h3 className="cfm-option-title">{o.title}</h3>
                <p className="cfm-option-desc">{o.desc}</p>
              </div>
            </div>
            <span className="cfm-option-arrow" aria-hidden="true">
              <ArrowRight size={20} color="var(--text-secondary)" variant="Linear" />
            </span>
          </button>
        ))}
      </div>
    </ConfirmModal>
  )
}

export default BulkUploadChoiceModal
