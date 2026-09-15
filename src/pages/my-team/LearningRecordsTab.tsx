import { useEffect, useRef, useState } from 'react'
import { Add, ArrowDown2, Danger, DocumentUpload } from 'iconsax-react'
import MoreIcon from '../../components/icons/MoreIcon'
import CsvIcon from '../../components/icons/CsvIcon'
import Button from '../../components/Button/Button'
import { Table, type Column } from '@/components/Table/Table'
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

function DateCell({ value }: { value: string | null }) {
  if (!value) return <span className="lr__date-dash">—</span>
  const { line1, line2 } = formatDate(value)
  return (
    <div className="lr__date-cell">
      <span className="lr__date-line1">{line1}</span>
      <span className="lr__date-line2">{line2}</span>
    </div>
  )
}

const recordColumns: Column<LearningRecord>[] = [
  {
    key: 'name',
    header: 'Name',
    width: '1 0 260px',
    render: (row) => (
      <span className="tbl-stack">
        <span className="primary">{row.name}</span>
        <span className="supporting">{row.email}</span>
      </span>
    ),
  },
  { key: 'team', header: 'Team', width: '0 0 140px', render: (row) => row.team },
  { key: 'region', header: 'Region', width: '0 0 140px', render: (row) => row.region },
  { key: 'course', header: 'Course', width: '0 0 160px', render: (row) => row.course },
  { key: 'category', header: 'Category', width: '0 0 140px', render: (row) => row.category },
  {
    key: 'enrollment',
    header: 'Enrolment history',
    width: '0 0 160px',
    render: (row) => (
      <span className={`lr__badge ${row.enrollmentHistory === 'Current' ? 'lr__badge--current' : 'lr__badge--archived'}`}>
        {row.enrollmentHistory}
      </span>
    ),
  },
  { key: 'startDate', header: 'Start date', width: '0 0 104px', render: (row) => <DateCell value={row.startDate} /> },
  { key: 'dueDate', header: 'Due date', width: '0 0 104px', render: (row) => <DateCell value={row.dueDate} /> },
  { key: 'completionDate', header: 'Completion date', width: '0 0 144px', render: (row) => <DateCell value={row.completionDate} /> },
  { key: 'duration', header: 'Duration', width: '0 0 84px', render: (row) => row.duration },
  { key: 'progress', header: 'Progress', width: '0 0 88px', render: (row) => `${row.progress}%` },
  {
    key: 'status',
    header: 'Status',
    width: '0 0 128px',
    render: (row) => (
      <span className={`lr__badge ${row.status === 'Completed' ? 'lr__badge--completed' : 'lr__badge--failed'}`}>
        {row.status}
      </span>
    ),
  },
]

const externalColumns: Column<ExternalTraining>[] = [
  { key: 'email', header: 'Email', width: '1 0 240px', render: (row) => row.email },
  { key: 'training', header: 'Training', width: '0 0 200px', render: (row) => row.training },
  { key: 'provider', header: 'Training provider', width: '0 0 200px', render: (row) => row.provider },
  { key: 'startDate', header: 'Start date', width: '0 0 104px', render: (row) => <DateCell value={row.startDate} /> },
  { key: 'completionDate', header: 'Completion date', width: '0 0 144px', render: (row) => <DateCell value={row.completionDate} /> },
  { key: 'expiration', header: 'Expiration', width: '0 0 104px', render: (row) => <DateCell value={row.expiration} /> },
  { key: 'duration', header: 'Duration', width: '0 0 84px', render: (row) => row.duration },
  { key: 'score', header: 'Score', width: '0 0 72px', render: (row) => row.score ?? '—' },
  {
    key: 'result',
    header: 'Result',
    width: '0 0 128px',
    render: (row) => (
      <span className={`lr__badge ${row.result === 'Passed' ? 'lr__badge--completed' : 'lr__badge--not-passed'}`}>
        {row.result}
      </span>
    ),
  },
  {
    key: 'certificate',
    header: 'Certificate',
    width: '0 0 140px',
    render: (row) => row.hasCertificate
      ? <Button size="sm" variant="outlined" className="ui-disabled" disabled>Download</Button>
      : <span className="lr__date-dash">—</span>,
  },
  {
    key: 'more',
    header: '',
    width: '0 0 56px',
    align: 'center',
    render: () => (
      <span className="ui-disabled">
        <MoreIcon size={24} color="var(--text-tertiary)" />
      </span>
    ),
  },
]

function LearningRecordsTab() {
  const [activeChip, setActiveChip] = useState<ChipType>('5mins')
  const [selectedExtIds, setSelectedExtIds] = useState<Set<string>>(new Set())
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [confirmInput, setConfirmInput] = useState('')
  const [addMenuOpen, setAddMenuOpen] = useState(false)
  const [addDrawerOpen, setAddDrawerOpen] = useState(false)
  const addMenuRef = useRef<HTMLDivElement>(null)

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

      {/* Data table — the pagination is a static mock, same as before. */}
      {activeChip === '5mins' ? (
        <Table
          columns={recordColumns}
          rows={mockData}
          getRowKey={(row) => row.id}
          pagination={{ from: 1, to: 10, total: 28 }}
        />
      ) : (
        <Table
          columns={externalColumns}
          rows={externalData}
          getRowKey={(row) => row.id}
          selectable
          isSelected={(row) => selectedExtIds.has(row.id)}
          onToggleRow={(row) => toggleExtRow(row.id)}
          onToggleAll={toggleAllExt}
          allSelected={allExtSelected}
          pagination={{ from: 1, to: 10, total: 28 }}
        />
      )}

      {/* Floating bulk action bar */}
      {selectedExtIds.size > 0 && activeChip === 'external' && (
        <div className="lr__bulk-bar">
          <button
            className="lr__bulk-bar-close"
            aria-label="Clear selection"
            onClick={() => setSelectedExtIds(new Set())}
          >
            <Add size={20} color="currentColor" style={{ transform: 'rotate(45deg)' }} />
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
