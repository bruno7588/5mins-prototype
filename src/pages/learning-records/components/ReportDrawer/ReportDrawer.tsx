import { useEffect, useState } from 'react'
import { Add } from 'iconsax-react'
import CloseButton from '../../../../components/CloseButton/CloseButton'
import InputField from '../../../../components/InputField/InputField'
import Dropdown from '../../../../components/Dropdown/Dropdown'
import Toggle from '../../../../components/Toggle/Toggle'
import { FILTER_BY_ID } from '../FilterListbox/FilterListbox'
import {
  REPORT_FREQUENCIES,
  nextReportLabel,
  type FilterEntry,
  type SavedReport,
} from '../../../../utils/lrSavedFilters'
import './ReportDrawer.css'

interface ReportDrawerProps {
  open: boolean
  onClose: () => void
  onSave: (report: SavedReport) => void
  /** Existing report when editing; null/undefined when creating. */
  initial?: SavedReport | null
  /** Snapshot of the page's active filters, used when creating a new report. */
  currentFilters: FilterEntry[]
  /** Renders a human label for a filter entry (id + value). */
  filterLabel: (entry: FilterEntry) => string
}

const FREQ_OPTIONS = REPORT_FREQUENCIES.map((f) => ({ value: f.value, label: f.label }))

function ReportDrawer({ open, onClose, onSave, initial, currentFilters, filterLabel }: ReportDrawerProps) {
  const isEditing = !!initial
  const [closing, setClosing] = useState(false)

  const [name, setName] = useState('')
  const [frequency, setFrequency] = useState('monthly')
  const [automate, setAutomate] = useState(true)
  const [recipients, setRecipients] = useState<string[]>([''])
  const [filters, setFilters] = useState<FilterEntry[]>([])

  useEffect(() => {
    if (!open) return
    if (initial) {
      setName(initial.name)
      setFrequency(initial.frequency)
      setAutomate(initial.automate)
      setRecipients(initial.recipients.length ? initial.recipients : [''])
      setFilters(initial.filters)
    } else {
      setName('')
      setFrequency('monthly')
      setAutomate(true)
      setRecipients([''])
      setFilters(currentFilters)
    }
  }, [open, initial, currentFilters])

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

  const canSave = name.trim().length > 0

  function updateRecipient(i: number, value: string) {
    setRecipients((prev) => prev.map((r, idx) => (idx === i ? value : r)))
  }
  function removeRecipient(i: number) {
    setRecipients((prev) => (prev.length === 1 ? [''] : prev.filter((_, idx) => idx !== i)))
  }
  function addRecipient() {
    setRecipients((prev) => [...prev, ''])
  }

  function handleSave() {
    if (!canSave) return
    const report: SavedReport = {
      id: initial?.id ?? `report-${Date.now()}`,
      name: name.trim(),
      filters,
      recipients: recipients.map((r) => r.trim()).filter(Boolean),
      frequency,
      automate,
      createdAt: initial?.createdAt ?? new Date().toISOString(),
    }
    onSave(report)
  }

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
        aria-labelledby="report-drawer-title"
      >
        <div className="side-drawer__header">
          <div className="side-drawer__headline">
            <div className="rd-header-text">
              <h2 id="report-drawer-title" className="rd-title">
                {isEditing ? 'Edit Scheduled Report' : 'Schedule Report'}
              </h2>
              <p className="rd-subtitle">Receive scheduled email reports for this filter view.</p>
            </div>
            <CloseButton onClick={handleClose} />
          </div>
          <div className="modal__divider" />
        </div>

        <div className="side-drawer__content">
          <div className="rd-form">
            {/* Status banner */}
            <div className="rd-banner">
              <span className="rd-banner-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M9.86133 2.65765C9.86133 1.19243 11.0153 0 12.4332 0C13.8511 0 15.005 1.19243 15.005 2.65765C15.005 4.12288 13.8511 5.31531 12.4332 5.31531C11.0153 5.31531 9.86133 4.12494 9.86133 2.65765ZM11.3572 2.65765C11.3572 3.27144 11.8392 3.76949 12.4332 3.76949C13.0271 3.76949 13.5091 3.27144 13.5091 2.65765C13.5091 2.04387 13.0271 1.54582 12.4332 1.54582C11.8392 1.54582 11.3572 2.04594 11.3572 2.65765Z" fill="#E2A610" />
                  <path d="M14.645 1.3125C14.645 1.3125 14.759 1.78162 14.233 2.03788C13.7071 2.29207 13.3591 2.10401 13.3591 2.10401C13.4531 2.26934 13.5091 2.4574 13.5091 2.66199C13.5091 3.27578 13.0271 3.77383 12.4332 3.77383C11.8392 3.77383 11.3572 3.27578 11.3572 2.66199C11.3572 2.6 11.3712 2.36647 11.4672 2.17221C10.5753 2.61033 9.89733 2.23627 9.89733 2.23627C9.87533 2.37474 9.86133 2.51733 9.86133 2.66199C9.86133 4.12722 11.0153 5.31965 12.4332 5.31965C13.8511 5.31965 15.005 4.12722 15.005 2.65993C15.005 2.16807 14.873 1.70722 14.645 1.3125Z" fill="#9E740B" />
                  <path d="M1.29193 18.9902C2.64584 17.616 3.48978 17.153 3.83376 15.1608C4.17774 13.1686 3.90176 8.97134 5.41766 6.22276C6.80157 3.70563 9.3414 2.66406 11.8192 2.66406C11.8792 2.66406 11.9392 2.6682 11.9992 2.6682C12.0592 2.66613 12.1192 2.66406 12.1792 2.66406C14.6571 2.66406 17.1969 3.70563 18.5808 6.22069C20.0947 8.97134 19.8207 13.1686 20.1647 15.1588C20.5087 17.151 21.3526 17.6139 22.7065 18.9882C23.2905 19.5813 23.9965 20.5257 23.9984 21.1333C24.0005 21.7409 23.7005 21.962 22.9865 22.272C20.9666 23.1503 18.2668 24.0018 11.9992 24.0018C5.73164 24.0018 3.03181 23.1503 1.01194 22.272C0.297991 21.962 -0.00198994 21.743 9.92906e-06 21.1333C0.0020098 20.5278 0.707964 19.5834 1.29193 18.9902Z" fill="#FFCA28" />
                  <path d="M21.9412 21.173C21.9412 20.2575 17.4915 19.5156 12.0019 19.5156C6.51221 19.5156 2.0625 20.2575 2.0625 21.173C2.0625 22.0885 6.51221 23.1818 12.0019 23.1818C17.4915 23.1818 21.9412 22.0885 21.9412 21.173Z" fill="#4E342E" />
                  <path d="M17.9709 8.03009C18.0449 8.32148 18.1069 8.61287 18.1569 8.89806C18.4108 10.3571 18.3648 11.8533 18.4788 13.3309C18.6328 15.3087 18.9728 16.3502 19.7468 17.2802C19.8487 17.4021 19.7448 17.5902 19.5908 17.5654C18.5568 17.4021 17.7269 17.2389 16.7809 16.5941C15.369 15.6331 15.0211 13.8249 15.0111 12.2005C14.9951 9.78257 15.0391 7.44111 14.8531 6.55247C14.5951 5.31457 14.3551 4.65532 13.9631 4.05394C13.3652 3.13637 15.687 4.4094 16.051 4.69252C17.0649 5.48403 17.6469 6.75706 17.9709 8.03009Z" fill="#E2A610" />
                  <path d="M5.37854 11.2375C5.35454 9.67105 5.36654 8.05083 5.9705 6.61247C6.33248 5.75277 6.94644 4.97779 7.73039 4.49627C8.34635 4.11808 9.59827 3.70063 10.0482 4.55827C10.1382 4.7298 10.1742 4.93026 10.1802 5.12658C10.1962 5.81063 9.85225 6.44301 9.51827 7.03406C8.53034 8.78654 8.13636 10.7023 7.6144 12.6449C7.40041 13.4467 7.12843 14.2465 6.66246 14.9244C6.34248 15.3893 4.5606 17.0426 4.96857 15.5485C5.36054 14.1039 5.40054 12.742 5.37854 11.2375Z" fill="#FFF59D" />
                  <path d="M13.8199 20.8489C13.8179 20.4935 13.6319 20.2889 13.2039 20.136C12.316 19.8198 11.2041 19.8776 10.5561 20.2372C9.87616 20.6134 10.3481 22.6986 12.002 22.6986C13.6559 22.6986 13.8219 21.1197 13.8199 20.8489Z" fill="#E2A610" />
                  <path d="M5.85046 17.7383C4.09457 18.0565 2.82266 18.7447 2.27269 19.3027C1.83672 19.7429 1.83672 20.0901 2.60467 19.7284C3.18263 19.4556 5.03451 18.9018 6.6564 18.7344C9.44222 18.445 11.1621 18.4388 11.4481 18.445C12.118 18.4595 12.174 17.9263 10.8201 17.7383C9.46622 17.5523 7.60634 17.4221 5.85046 17.7383Z" fill="#FFF59D" />
                  <path d="M11.2922 22.291C11.5241 22.4564 11.8321 22.537 12.0921 22.4254C12.3521 22.3138 12.5201 21.9728 12.3921 21.7144C12.3421 21.6132 12.2561 21.5367 12.1701 21.4665C11.9321 21.2743 11.6681 21.1172 11.3881 21.0015C11.2782 20.956 11.1622 20.9147 11.0422 20.9229C10.9242 20.9291 10.8002 20.9932 10.7542 21.1069C10.5562 21.5719 10.9522 22.0513 11.2922 22.291Z" fill="#FFF59D" />
                </svg>
              </span>
              <span className="rd-banner-text">
                <span className="rd-banner-label">Next report</span>
                <span className="rd-banner-value">
                  {automate ? nextReportLabel(frequency) : 'Not scheduled'}
                </span>
              </span>
              <span className="rd-banner-toggle">
                <span className={`rd-banner-status${automate ? ' rd-banner-status--on' : ''}`}>
                  Scheduled: {automate ? 'ON' : 'OFF'}
                </span>
                <Toggle checked={automate} onChange={(e) => setAutomate(e.target.checked)} />
              </span>
            </div>

            {/* Name */}
            <InputField
              label="Report name"
              placeholder="e.g. Weekly overdue learners"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            {/* Filter basis */}
            <div className="rd-field">
              <label className="rd-label">Filters</label>
              {filters.length > 0 ? (
                <div className="rd-filter-chips">
                  {filters.map((f) => {
                    const Icon = FILTER_BY_ID[f.id]?.Icon
                    return (
                      <span className="rd-filter-chip" key={f.id}>
                        {Icon && <Icon size={16} color="var(--text-secondary)" variant="Linear" />}
                        {filterLabel(f)}
                      </span>
                    )
                  })}
                </div>
              ) : (
                <div className="rd-filter-chips">
                  <span className="rd-filter-chip rd-filter-chip--empty">
                    All learning records (no filters applied).
                  </span>
                </div>
              )}
            </div>

            {/* Frequency */}
            <Dropdown
              label="How often should we email the report?"
              options={FREQ_OPTIONS}
              value={frequency}
              onChange={setFrequency}
            />

            {/* Recipients */}
            <div className="rd-field">
              <label className="rd-label">Send reports to</label>
              <div className="rd-recipients">
                {recipients.map((email, i) => (
                  <InputField
                    key={i}
                    type="email"
                    placeholder="name@email.com"
                    value={email}
                    onChange={(e) => updateRecipient(i, e.target.value)}
                    iconRight={
                      <button
                        type="button"
                        className="rd-recipient-remove"
                        aria-label="Remove recipient"
                        onClick={() => removeRecipient(i)}
                      >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                          <path d="M14 6L6 14M6 6L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </button>
                    }
                  />
                ))}
              </div>
              <button type="button" className="rd-add-email" onClick={addRecipient}>
                <Add size={20} color="var(--text-primary)" variant="Linear" />
                Add Email
              </button>
            </div>
          </div>
        </div>

        <div className="side-drawer__footer">
          <div className="side-drawer__footer-divider" />
          <div className="side-drawer__buttons">
            <button type="button" className="side-drawer__btn-primary" disabled={!canSave} onClick={handleSave}>
              {isEditing ? 'Update Report' : 'Create Report'}
            </button>
            <button type="button" className="side-drawer__btn-secondary" onClick={handleClose}>
              Cancel
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

export default ReportDrawer
