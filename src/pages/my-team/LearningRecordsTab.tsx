import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft2, ArrowRight2, Add, ArrowDown2, Danger, DocumentUpload } from 'iconsax-react'
import MoreIcon from '../../components/icons/MoreIcon'
import CsvIcon from '../../components/icons/CsvIcon'
import Button from '../../components/Button/Button'
import Checkbox from '../../components/Checkbox/Checkbox'
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal'
import ToastContainer, { useToast } from '../../components/Toast/Toast'
import AddTrainingDrawer from './AddTrainingDrawer'
import './LearningRecordsTab.css'

type ChipType = '5mins' | 'external'
type EnrollmentHistory = 'Current' | 'Archived'
type Status = 'Completed' | 'Failed'

interface LearningRecord {
  id: string
  name: string
  email: string
  team: string
  region: string
  course: string
  category: string
  enrollmentHistory: EnrollmentHistory
  startDate: string
  dueDate: string
  completionDate: string | null
  duration: string
  progress: number
  status: Status
}

const mockData: LearningRecord[] = [
  {
    id: '1',
    name: 'Michael Thompson',
    email: 'michael.t@company.com',
    team: 'Operations',
    region: 'North America',
    course: 'Compliance & Ethics 101',
    category: 'Compliance',
    enrollmentHistory: 'Current',
    startDate: '2026-04-01',
    dueDate: '2026-05-01',
    completionDate: '2026-04-13',
    duration: '30 min',
    progress: 100,
    status: 'Completed',
  },
  {
    id: '2',
    name: 'Jessica Hart',
    email: 'jessica.h@company.com',
    team: 'Compliance',
    region: 'Europe',
    course: 'Food Safety Essentials',
    category: 'Safety',
    enrollmentHistory: 'Current',
    startDate: '2026-03-20',
    dueDate: '2026-04-20',
    completionDate: null,
    duration: '45 min',
    progress: 65,
    status: 'Failed',
  },
  {
    id: '3',
    name: 'David Johnson',
    email: 'david.j@company.com',
    team: 'Finance',
    region: 'Asia Pacific',
    course: 'Data Protection (GDPR)',
    category: 'Compliance',
    enrollmentHistory: 'Current',
    startDate: '2026-03-15',
    dueDate: '2026-04-10',
    completionDate: '2026-04-08',
    duration: '60 min',
    progress: 100,
    status: 'Completed',
  },
  {
    id: '4',
    name: 'Noah Williams',
    email: 'noah.w@company.com',
    team: 'Hospitality',
    region: 'North America',
    course: 'Customer Service Fundamentals',
    category: 'Soft Skills',
    enrollmentHistory: 'Archived',
    startDate: '2026-01-10',
    dueDate: '2026-02-10',
    completionDate: null,
    duration: '25 min',
    progress: 40,
    status: 'Failed',
  },
  {
    id: '5',
    name: 'Mei Tanaka',
    email: 'mei.t@company.com',
    team: 'Operations',
    region: 'Asia Pacific',
    course: 'Harassment Prevention',
    category: 'Compliance',
    enrollmentHistory: 'Current',
    startDate: '2026-04-05',
    dueDate: '2026-05-05',
    completionDate: null,
    duration: '35 min',
    progress: 20,
    status: 'Failed',
  },
  {
    id: '6',
    name: 'Ethan Brooks',
    email: 'ethan.b@company.com',
    team: 'Food & Beverage',
    region: 'Europe',
    course: 'Allergen Awareness',
    category: 'Safety',
    enrollmentHistory: 'Current',
    startDate: '2026-03-28',
    dueDate: '2026-04-28',
    completionDate: '2026-04-12',
    duration: '20 min',
    progress: 100,
    status: 'Completed',
  },
  {
    id: '7',
    name: 'Priya Shah',
    email: 'priya.s@company.com',
    team: 'Shift Operations',
    region: 'Middle East',
    course: 'Conflict Resolution',
    category: 'Soft Skills',
    enrollmentHistory: 'Archived',
    startDate: '2025-12-01',
    dueDate: '2026-01-15',
    completionDate: null,
    duration: '40 min',
    progress: 55,
    status: 'Failed',
  },
  {
    id: '8',
    name: 'Samantha Rivers',
    email: 'samantha.r@company.com',
    team: 'Finance',
    region: 'North America',
    course: 'Cash Handling',
    category: 'Operations',
    enrollmentHistory: 'Current',
    startDate: '2026-04-10',
    dueDate: '2026-05-10',
    completionDate: null,
    duration: '15 min',
    progress: 10,
    status: 'Completed',
  },
  {
    id: '9',
    name: 'Laura Chen',
    email: 'laura.c@company.com',
    team: 'Compliance',
    region: 'Asia Pacific',
    course: 'Fire Safety',
    category: 'Safety',
    enrollmentHistory: 'Current',
    startDate: '2026-03-01',
    dueDate: '2026-04-01',
    completionDate: '2026-03-28',
    duration: '30 min',
    progress: 100,
    status: 'Completed',
  },
  {
    id: '10',
    name: 'Marcus Reid',
    email: 'marcus.r@company.com',
    team: 'Compliance',
    region: 'Europe',
    course: 'POS System Training',
    category: 'Operations',
    enrollmentHistory: 'Archived',
    startDate: '2026-02-15',
    dueDate: '2026-03-15',
    completionDate: '2026-03-10',
    duration: '50 min',
    progress: 100,
    status: 'Completed',
  },
]

/* ── External Training data ── */

type ExternalResult = 'Passed' | 'Not Passed'

interface ExternalTraining {
  id: string
  email: string
  training: string
  provider: string
  startDate: string
  completionDate: string | null
  expiration: string | null
  duration: string
  score: string | null
  result: ExternalResult
  hasCertificate: boolean
}

const externalData: ExternalTraining[] = [
  { id: 'e1', email: 'michael.t@company.com', training: 'Project Management Fundamentals', provider: 'Leadership Academy', startDate: '2026-04-13', completionDate: '2026-04-25', expiration: '2026-05-10', duration: '2 days', score: '100%', result: 'Passed', hasCertificate: true },
  { id: 'e2', email: 'jessica.h@company.com', training: 'Advanced Excel for Finance', provider: 'SkillBridge Online', startDate: '2026-03-20', completionDate: '2026-04-02', expiration: null, duration: '3 days', score: null, result: 'Not Passed', hasCertificate: false },
  { id: 'e3', email: 'david.j@company.com', training: 'Data Analytics Bootcamp', provider: 'TechForward Institute', startDate: '2026-04-01', completionDate: '2026-04-15', expiration: '2027-04-15', duration: '5 days', score: '92%', result: 'Passed', hasCertificate: true },
  { id: 'e4', email: 'noah.w@company.com', training: 'Customer Experience Design', provider: 'CX Academy', startDate: '2026-03-10', completionDate: '2026-03-22', expiration: '2026-09-22', duration: '2 days', score: '100%', result: 'Passed', hasCertificate: true },
  { id: 'e5', email: 'mei.t@company.com', training: 'First Aid & CPR Certification', provider: 'Red Cross Training', startDate: '2026-02-15', completionDate: '2026-02-16', expiration: null, duration: '1 day', score: null, result: 'Not Passed', hasCertificate: false },
  { id: 'e6', email: 'ethan.b@company.com', training: 'Barista Mastery Program', provider: 'Coffee Institute', startDate: '2026-04-05', completionDate: '2026-04-12', expiration: '2027-04-12', duration: '2 days', score: '100%', result: 'Passed', hasCertificate: true },
  { id: 'e7', email: 'priya.s@company.com', training: 'Leadership & Team Management', provider: 'Leadership Academy', startDate: '2026-03-25', completionDate: '2026-04-08', expiration: null, duration: '3 days', score: null, result: 'Not Passed', hasCertificate: false },
  { id: 'e8', email: 'samantha.r@company.com', training: 'Financial Modelling Workshop', provider: 'FinanceHub', startDate: '2026-04-10', completionDate: '2026-04-18', expiration: '2027-04-18', duration: '2 days', score: '95%', result: 'Passed', hasCertificate: true },
  { id: 'e9', email: 'laura.c@company.com', training: 'ISO 27001 Auditor Training', provider: 'CompliancePro', startDate: '2026-03-01', completionDate: '2026-03-15', expiration: '2027-03-15', duration: '5 days', score: '88%', result: 'Passed', hasCertificate: true },
  { id: 'e10', email: 'marcus.r@company.com', training: 'Workplace Safety Advanced', provider: 'SafeWork Training', startDate: '2026-02-20', completionDate: '2026-03-05', expiration: '2026-09-05', duration: '2 days', score: '100%', result: 'Passed', hasCertificate: true },
]

function formatDate(dateStr: string): { line1: string; line2: string } {
  const d = new Date(dateStr + 'T00:00:00')
  const month = d.toLocaleString('en-US', { month: 'short' })
  const day = d.getDate()
  const year = d.getFullYear()
  return { line1: `${month} ${day},`, line2: `${year}` }
}

function LearningRecordsTab() {
  const [activeChip, setActiveChip] = useState<ChipType>('5mins')
  const [isScrolled, setIsScrolled] = useState(false)
  const [selectedExtIds, setSelectedExtIds] = useState<Set<string>>(new Set())
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [confirmInput, setConfirmInput] = useState('')
  const [addMenuOpen, setAddMenuOpen] = useState(false)
  const [addDrawerOpen, setAddDrawerOpen] = useState(false)
  const addMenuRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!addMenuOpen) return
    const handler = (e: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node)) setAddMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [addMenuOpen])
  const toast = useToast()

  const toggleExtRow = (id: string) => {
    setSelectedExtIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const allExtSelected = externalData.length > 0 && externalData.every(r => selectedExtIds.has(r.id))

  const toggleAllExt = () => {
    if (allExtSelected) setSelectedExtIds(new Set())
    else setSelectedExtIds(new Set(externalData.map(r => r.id)))
  }

  const handleDeleteTrainings = () => {
    const count = selectedExtIds.size
    setSelectedExtIds(new Set())
    setShowDeleteConfirm(false)
    setConfirmInput('')
    toast.show('success', `${count} training${count === 1 ? '' : 's'} deleted`)
  }

  const closeDeleteConfirm = () => {
    setShowDeleteConfirm(false)
    setConfirmInput('')
  }

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      setIsScrolled(scrollRef.current.scrollLeft > 0)
    }
  }, [])

  return (
    <section className="lr" aria-label="Learning Records">
      {/* Actions bar */}
      <div className="lr__actions">
        <div className="lr__chips">
          <button
            type="button"
            className={`lr__chip${activeChip === '5mins' ? ' lr__chip--active' : ''}`}
            onClick={() => { setActiveChip('5mins'); setSelectedExtIds(new Set()) }}
          >
            5Mins Courses
          </button>
          <button
            type="button"
            className={`lr__chip${activeChip === 'external' ? ' lr__chip--active' : ''}`}
            onClick={() => setActiveChip('external')}
          >
            External Training
          </button>
        </div>
        <div className="lr__actions-right">
          <Button variant="outlined-2" icon={<CsvIcon size={20} color="currentColor" />}>
            Download Report
          </Button>
          {activeChip === 'external' && (
            <div className="lr__add-training-wrap" ref={addMenuRef}>
              <Button variant="outlined" icon={<Add size={20} color="currentColor" variant="Linear" />} onClick={() => setAddMenuOpen(o => !o)}>
                Add Training
              </Button>
              {addMenuOpen && (
                <ul className="lr__add-menu" role="menu">
                  <li>
                    <button type="button" className="lr__add-menu-item" role="menuitem" onClick={() => { setAddMenuOpen(false); setAddDrawerOpen(true) }}>
                      <Add size={20} color="var(--text-primary)" variant="Linear" />
                      <span>Add training</span>
                    </button>
                  </li>
                  <li>
                    <button type="button" className="lr__add-menu-item ui-disabled" role="menuitem" disabled>
                      <DocumentUpload size={20} color="var(--text-primary)" variant="Linear" />
                      <span>Bulk upload CSV</span>
                    </button>
                  </li>
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Filters bar — not built on this tab yet (the standalone Learning Records
          page has the working version); shown disabled instead of as a decoy. */}
      <div className="lr__filters ui-disabled" aria-disabled="true">
        <span className="lr__filters-icon">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </span>
        <span className="lr__filters-label">Filters</span>
        <span className="lr__filters-badge">0</span>
        <button type="button" className="lr__filters-add" disabled>
          <Add size={20} color="currentColor" variant="Linear" />
          Add
        </button>
        <span className="lr__filters-spacer" />
        <span className="lr__filters-chevron">
          <ArrowDown2 size={16} color="var(--text-tertiary)" variant="Linear" />
        </span>
      </div>

      {/* Data table */}
      <div
        className={`lr__table-wrap${isScrolled ? ' lr__table-wrap--scrolled' : ''}`}
        ref={scrollRef}
        onScroll={handleScroll}
      >
        {activeChip === '5mins' ? (
          <div className="lr__table">
            <div className="lr__header">
              <div className="lr__cell lr__cell--name">Name</div>
              <div className="lr__cell lr__cell--team">Team</div>
              <div className="lr__cell lr__cell--region">Region</div>
              <div className="lr__cell lr__cell--course">Course</div>
              <div className="lr__cell lr__cell--category">Category</div>
              <div className="lr__cell lr__cell--enrollment">Enrolment history</div>
              <div className="lr__cell lr__cell--start-date">Start date</div>
              <div className="lr__cell lr__cell--due-date">Due date</div>
              <div className="lr__cell lr__cell--completion-date">Completion date</div>
              <div className="lr__cell lr__cell--duration">Duration</div>
              <div className="lr__cell lr__cell--progress">Progress</div>
              <div className="lr__cell lr__cell--status">Status</div>
            </div>

            {mockData.map((row) => {
              const start = formatDate(row.startDate)
              const due = formatDate(row.dueDate)
              const completion = row.completionDate ? formatDate(row.completionDate) : null
              const enrollmentClass = row.enrollmentHistory === 'Current' ? 'lr__badge--current' : 'lr__badge--archived'
              const statusClass = row.status === 'Completed' ? 'lr__badge--completed' : 'lr__badge--failed'

              return (
                <div className="lr__row" key={row.id}>
                  <div className="lr__cell lr__cell--name">
                    <span className="lr__name">{row.name}</span>
                    <span className="lr__email">{row.email}</span>
                  </div>
                  <div className="lr__cell lr__cell--team">{row.team}</div>
                  <div className="lr__cell lr__cell--region">{row.region}</div>
                  <div className="lr__cell lr__cell--course">{row.course}</div>
                  <div className="lr__cell lr__cell--category">{row.category}</div>
                  <div className="lr__cell lr__cell--enrollment">
                    <span className={`lr__badge ${enrollmentClass}`}>{row.enrollmentHistory}</span>
                  </div>
                  <div className="lr__cell lr__cell--start-date">
                    <div className="lr__date-cell">
                      <span className="lr__date-line1">{start.line1}</span>
                      <span className="lr__date-line2">{start.line2}</span>
                    </div>
                  </div>
                  <div className="lr__cell lr__cell--due-date">
                    <div className="lr__date-cell">
                      <span className="lr__date-line1">{due.line1}</span>
                      <span className="lr__date-line2">{due.line2}</span>
                    </div>
                  </div>
                  <div className="lr__cell lr__cell--completion-date">
                    {completion ? (
                      <div className="lr__date-cell">
                        <span className="lr__date-line1">{completion.line1}</span>
                        <span className="lr__date-line2">{completion.line2}</span>
                      </div>
                    ) : (
                      <span className="lr__date-dash">—</span>
                    )}
                  </div>
                  <div className="lr__cell lr__cell--duration">{row.duration}</div>
                  <div className="lr__cell lr__cell--progress">{row.progress}%</div>
                  <div className="lr__cell lr__cell--status">
                    <span className={`lr__badge ${statusClass}`}>{row.status}</span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="lr__table lr__table--external">
            <div className="lr__header">
              <div className="lr__cell lr__cell--ext-email">
                <Checkbox checked={allExtSelected} onChange={toggleAllExt} />
                <span>Email</span>
              </div>
              <div className="lr__cell lr__cell--ext-training">Training</div>
              <div className="lr__cell lr__cell--ext-provider">Training provider</div>
              <div className="lr__cell lr__cell--start-date">Start date</div>
              <div className="lr__cell lr__cell--completion-date">Completion date</div>
              <div className="lr__cell lr__cell--ext-expiration">Expiration</div>
              <div className="lr__cell lr__cell--duration">Duration</div>
              <div className="lr__cell lr__cell--ext-score">Score</div>
              <div className="lr__cell lr__cell--ext-result">Result</div>
              <div className="lr__cell lr__cell--ext-cert">Certificate</div>
              <div className="lr__cell lr__cell--ext-more" />
            </div>

            {externalData.map((row) => {
              const start = formatDate(row.startDate)
              const completion = row.completionDate ? formatDate(row.completionDate) : null
              const expiration = row.expiration ? formatDate(row.expiration) : null
              const resultClass = row.result === 'Passed' ? 'lr__badge--completed' : 'lr__badge--not-passed'

              return (
                <div className={`lr__row${selectedExtIds.has(row.id) ? ' lr__row--selected' : ''}`} key={row.id}>
                  <div className="lr__cell lr__cell--ext-email">
                    <Checkbox checked={selectedExtIds.has(row.id)} onChange={() => toggleExtRow(row.id)} />
                    <span>{row.email}</span>
                  </div>
                  <div className="lr__cell lr__cell--ext-training">{row.training}</div>
                  <div className="lr__cell lr__cell--ext-provider">{row.provider}</div>
                  <div className="lr__cell lr__cell--start-date">
                    <div className="lr__date-cell">
                      <span className="lr__date-line1">{start.line1}</span>
                      <span className="lr__date-line2">{start.line2}</span>
                    </div>
                  </div>
                  <div className="lr__cell lr__cell--completion-date">
                    {completion ? (
                      <div className="lr__date-cell">
                        <span className="lr__date-line1">{completion.line1}</span>
                        <span className="lr__date-line2">{completion.line2}</span>
                      </div>
                    ) : (
                      <span className="lr__date-dash">—</span>
                    )}
                  </div>
                  <div className="lr__cell lr__cell--ext-expiration">
                    {expiration ? (
                      <div className="lr__date-cell">
                        <span className="lr__date-line1">{expiration.line1}</span>
                        <span className="lr__date-line2">{expiration.line2}</span>
                      </div>
                    ) : (
                      <span className="lr__date-dash">—</span>
                    )}
                  </div>
                  <div className="lr__cell lr__cell--duration">{row.duration}</div>
                  <div className="lr__cell lr__cell--ext-score">{row.score ?? '—'}</div>
                  <div className="lr__cell lr__cell--ext-result">
                    <span className={`lr__badge ${resultClass}`}>{row.result}</span>
                  </div>
                  <div className="lr__cell lr__cell--ext-cert">
                    {row.hasCertificate ? (
                      <Button size="sm" variant="outlined" className="ui-disabled" disabled>Download</Button>
                    ) : (
                      <span className="lr__date-dash">—</span>
                    )}
                  </div>
                  <div className="lr__cell lr__cell--ext-more">
                    <span className="ui-disabled">
                      <MoreIcon size={24} color="var(--text-tertiary)" />
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="lr__pagination">
        <span className="lr__pagination-label">1-10 of 28</span>
        <button type="button" className="lr__pagination-btn" aria-label="Previous page" disabled>
          <ArrowLeft2 size={16} color="var(--text-secondary)" variant="Linear" />
        </button>
        <button type="button" className="lr__pagination-btn" aria-label="Next page">
          <ArrowRight2 size={16} color="var(--text-secondary)" variant="Linear" />
        </button>
      </div>

      {/* Floating bulk action bar */}
      {selectedExtIds.size > 0 && activeChip === 'external' && (
        <div className="lr__bulk-bar">
          <button
            className="lr__bulk-bar-close"
            aria-label="Clear selection"
            onClick={() => setSelectedExtIds(new Set())}
          >
            <Add size={18} color="currentColor" style={{ transform: 'rotate(45deg)' }} />
          </button>
          <span className="lr__bulk-bar-count">{selectedExtIds.size} selected</span>
          <div className="lr__bulk-bar-divider" />
          <button className="lr__bulk-bar-btn" onClick={() => setShowDeleteConfirm(true)}>
            Delete {selectedExtIds.size} {selectedExtIds.size === 1 ? 'Training' : 'Trainings'}
          </button>
        </div>
      )}

      <ConfirmModal open={showDeleteConfirm} onClose={closeDeleteConfirm}>
        <div className="confirm-modal-header confirm-modal-header--center">
          <div className="confirm-modal-icon">
            <Danger size={72} color="var(--danger-500)" variant="Linear" />
          </div>
          <h2 className="confirm-modal-title">
            Delete {selectedExtIds.size} {selectedExtIds.size === 1 ? 'training' : 'trainings'}
          </h2>
          <p className="confirm-modal-body">
            This action cannot be undone. The selected training records will be permanently removed.
          </p>
        </div>
        <div className="confirm-modal-input-group">
          <label className="confirm-modal-label">
            Type <span className="confirm-modal-label-danger">'Delete'</span> below, to confirm
          </label>
          <input
            className="confirm-modal-input"
            type="text"
            value={confirmInput}
            onChange={e => setConfirmInput(e.target.value)}
            placeholder="Delete"
          />
        </div>
        <div className="confirm-modal-actions">
          <Button variant="outlined-2" onClick={closeDeleteConfirm}>Cancel</Button>
          <Button semantic="danger"
            disabled={confirmInput !== 'Delete'}
            onClick={handleDeleteTrainings}
          >
            Delete Permanently
          </Button>
        </div>
      </ConfirmModal>

      <AddTrainingDrawer
        open={addDrawerOpen}
        onClose={() => setAddDrawerOpen(false)}
        onAdd={() => {
          setAddDrawerOpen(false)
          toast.show('success', 'Training added successfully')
        }}
      />

      <ToastContainer toasts={toast.toasts} />
    </section>
  )
}

export default LearningRecordsTab
