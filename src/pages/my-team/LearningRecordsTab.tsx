import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft2, ArrowRight2, Add, ArrowDown2, Danger, DocumentUpload } from 'iconsax-react'
import MoreIcon from '../../components/icons/MoreIcon'
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
          <button type="button" className="lr__download-btn">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <g clipPath="url(#clip_csv)">
                <path fillRule="evenodd" clipRule="evenodd" d="M17.5 5.625V17.5C17.5 18.163 17.2366 18.7989 16.7678 19.2678C16.2989 19.7366 15.663 20 15 20H13.75V18.75H15C15.3315 18.75 15.6495 18.6183 15.8839 18.3839C16.1183 18.1495 16.25 17.8315 16.25 17.5V5.625H13.75C13.2527 5.625 12.7758 5.42746 12.4242 5.07583C12.0725 4.72419 11.875 4.24728 11.875 3.75V1.25H5C4.66848 1.25 4.35054 1.3817 4.11612 1.61612C3.8817 1.85054 3.75 2.16848 3.75 2.5V13.75H2.5V2.5C2.5 1.83696 2.76339 1.20107 3.23223 0.732233C3.70107 0.263392 4.33696 0 5 0L11.875 0L17.5 5.625ZM4.39625 18.5512C4.40341 18.7482 4.4517 18.9415 4.53803 19.1187C4.62435 19.2958 4.7468 19.453 4.8975 19.58C5.06 19.715 5.25917 19.82 5.495 19.895C5.73167 19.9708 6.00875 20.0087 6.32625 20.0087C6.74875 20.0087 7.10667 19.9429 7.4 19.8112C7.695 19.6796 7.91958 19.4963 8.07375 19.2613C8.22958 19.0246 8.3075 18.7513 8.3075 18.4413C8.3075 18.1613 8.25167 17.9279 8.14 17.7412C8.02564 17.5539 7.86397 17.4 7.67125 17.295C7.45006 17.1722 7.21151 17.0837 6.96375 17.0325L6.1875 16.8525C6.0049 16.8176 5.83238 16.7425 5.6825 16.6325C5.62547 16.5885 5.5795 16.5318 5.54825 16.4669C5.517 16.4021 5.50133 16.3308 5.5025 16.2587C5.5025 16.0637 5.57958 15.9038 5.73375 15.7788C5.89042 15.6521 6.10375 15.5887 6.37375 15.5887C6.55208 15.5887 6.70625 15.6171 6.83625 15.6737C6.95655 15.7214 7.06248 15.7993 7.14375 15.9C7.22068 15.9928 7.27235 16.1039 7.29375 16.2225H8.23125C8.21512 15.968 8.12857 15.7231 7.98125 15.515C7.82373 15.2902 7.60755 15.1129 7.35625 15.0025C7.04946 14.8673 6.71635 14.8024 6.38125 14.8125C6.01542 14.8125 5.69208 14.875 5.41125 15C5.13042 15.1242 4.91083 15.2996 4.7525 15.5262C4.59417 15.7537 4.515 16.02 4.515 16.325C4.515 16.5767 4.56583 16.795 4.6675 16.98C4.77083 17.1658 4.9175 17.3188 5.1075 17.4388C5.2975 17.5579 5.52208 17.6467 5.78125 17.705L6.55375 17.885C6.81208 17.9458 7.005 18.0263 7.1325 18.1263C7.19455 18.1739 7.24421 18.2359 7.27728 18.3068C7.31036 18.3777 7.32586 18.4556 7.3225 18.5337C7.32532 18.6626 7.28821 18.7893 7.21625 18.8962C7.13571 19.0059 7.02494 19.0898 6.8975 19.1375C6.75833 19.1958 6.58625 19.225 6.38125 19.225C6.23542 19.225 6.10208 19.2083 5.98125 19.175C5.87043 19.1452 5.76557 19.0966 5.67125 19.0313C5.58813 18.9773 5.51697 18.9068 5.46214 18.8243C5.40732 18.7417 5.37 18.6488 5.3525 18.5512H4.39625ZM1.0075 17.1162C1.0075 16.8054 1.05 16.5417 1.135 16.325C1.20927 16.1254 1.34054 15.9519 1.5125 15.8263C1.68737 15.7079 1.89522 15.648 2.10625 15.655C2.29375 15.655 2.45958 15.6954 2.60375 15.7763C2.74462 15.8515 2.8622 15.9639 2.94375 16.1012C3.03087 16.2458 3.08229 16.4091 3.09375 16.5775H4.05V16.4875C4.04171 16.2572 3.98564 16.0312 3.88537 15.8238C3.78509 15.6164 3.64279 15.432 3.4675 15.2825C3.28871 15.1292 3.0808 15.0135 2.85625 14.9425C2.61255 14.859 2.35633 14.818 2.09875 14.8213C1.65375 14.8213 1.27417 14.9142 0.96 15.1C0.6475 15.285 0.409167 15.5483 0.245 15.89C0.0825 16.2317 0.000833333 16.6396 0 17.1137V17.7363C0 18.2096 0.0804167 18.6162 0.24125 18.9562C0.405417 19.2954 0.64375 19.5563 0.95625 19.7388C1.26875 19.9196 1.64958 20.01 2.09875 20.01C2.46458 20.01 2.79167 19.9417 3.08 19.805C3.36833 19.6683 3.5975 19.4792 3.7675 19.2375C3.93995 18.9893 4.03795 18.697 4.05 18.395V18.3H3.095C3.08316 18.4609 3.03256 18.6166 2.9475 18.7538C2.8642 18.8865 2.74677 18.9944 2.6075 19.0663C2.45102 19.1406 2.27948 19.1778 2.10625 19.175C1.89511 19.1806 1.68709 19.1232 1.50875 19.01C1.33741 18.8883 1.20708 18.7174 1.135 18.52C1.04363 18.2691 1.00038 18.0032 1.0075 17.7363V17.1162ZM11.3063 19.9137H10.115L8.4425 14.915H9.58875L10.7088 18.8375H10.7562L11.8663 14.915H12.965L11.3063 19.9137Z" fill="currentColor"/>
              </g>
              <defs>
                <clipPath id="clip_csv"><rect width="20" height="20" fill="white"/></clipPath>
              </defs>
            </svg>
            <span>Download Report</span>
          </button>
          {activeChip === 'external' && (
            <div className="lr__add-training-wrap" ref={addMenuRef}>
              <button type="button" className="lr__add-training-btn" onClick={() => setAddMenuOpen(o => !o)}>
                <Add size={20} color="currentColor" variant="Linear" />
                <span>Add Training</span>
              </button>
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
                      <button type="button" className="lr__cert-btn ui-disabled" disabled>Download</button>
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
          <button className="confirm-modal-btn confirm-modal-btn--outlined" onClick={closeDeleteConfirm}>Cancel</button>
          <button
            className="confirm-modal-btn confirm-modal-btn--danger"
            disabled={confirmInput !== 'Delete'}
            onClick={handleDeleteTrainings}
          >
            Delete Permanently
          </button>
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
