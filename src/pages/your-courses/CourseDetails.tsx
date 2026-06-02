import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Add,
  ArrowDown2,
  ArrowLeft2,
  ArrowRight2,
  Briefcase,
  Clock,
  Danger,
  DocumentDownload,
  InfoCircle,
  Link2,
  MedalStar,
  PlayCircle,
  Sort,
  TickCircle,
} from 'iconsax-react'
import LeftSidebar from '../../components/LeftSidebar/LeftSidebar'
import Search from '../../components/Search/Search'
import Checkbox from '../../components/Checkbox/Checkbox'
import Tooltip from '../../components/Tooltip/Tooltip'
import MoreIcon from '../../components/icons/MoreIcon'
import './CourseDetails.css'

type Tab = 'content' | 'enrolments' | 'assessments' | 'settings' | 'overview'

type LearnerStatus = 'not-started' | 'in-progress' | 'passed' | 'failed'

interface Learner {
  id: number
  name: string
  email: string
  startDate: string
  dueDate: string
  progress: number
  score: number | null
  status: LearnerStatus
  quizAttemptsLeft?: number
  quizAttemptsMax?: number
  completionDate: string | null
  repeat: string
}

const STATUS_LABELS: Record<LearnerStatus, string> = {
  'not-started': 'Not Started',
  'in-progress': 'In Progress',
  passed: 'Passed',
  failed: 'Failed',
}

const COURSE_TITLE = 'Building Company Culture A Guide for HR Teams'
const TOTAL = 128

const learners: Learner[] = [
  { id: 1, name: 'Anthony Wallace', email: 'anthony.wallace@email.com', startDate: 'Aug 27, 2024', dueDate: 'Oct 25, 2025', progress: 100, score: 60, status: 'failed', completionDate: 'Sep 25, 2025', repeat: 'Every 12 months' },
  { id: 2, name: 'Sophia Carter', email: 'sophia.carter@email.com', startDate: 'Aug 27, 2024', dueDate: 'Oct 25, 2025', progress: 100, score: 92, status: 'passed', completionDate: 'Sep 25, 2025', repeat: 'Never' },
  { id: 3, name: 'Oliver Bennett', email: 'oliver.bennett@email.com', startDate: 'Jul 14, 2024', dueDate: 'Oct 25, 2025', progress: 0, score: null, status: 'not-started', completionDate: null, repeat: 'Every 12 months' },
  { id: 4, name: 'Emma Thompson', email: 'emma.thompson@email.com', startDate: 'Aug 27, 2024', dueDate: 'Oct 25, 2025', progress: 100, score: 50, status: 'in-progress', quizAttemptsLeft: 2, quizAttemptsMax: 3, completionDate: null, repeat: 'Every 6 months' },
  { id: 5, name: 'Liam Johnson', email: 'liam.johnson@email.com', startDate: 'Sep 02, 2024', dueDate: 'Nov 30, 2025', progress: 0, score: null, status: 'not-started', completionDate: null, repeat: 'Never' },
  { id: 6, name: 'Ava Martinez', email: 'ava.martinez@email.com', startDate: 'Aug 27, 2024', dueDate: 'Oct 25, 2025', progress: 100, score: 78, status: 'failed', completionDate: 'Oct 01, 2025', repeat: 'Every 12 months' },
  { id: 7, name: 'Noah Davis', email: 'noah.davis@email.com', startDate: 'Aug 27, 2024', dueDate: 'Oct 25, 2025', progress: 50, score: 65, status: 'in-progress', completionDate: null, repeat: 'Every 12 months' },
  { id: 8, name: 'Isabella Lewis', email: 'isabella.lewis@email.com', startDate: 'Jun 18, 2024', dueDate: 'Sep 15, 2025', progress: 100, score: 96, status: 'passed', completionDate: 'Sep 12, 2025', repeat: 'Never' },
  { id: 9, name: 'James Walker', email: 'james.walker@email.com', startDate: 'Aug 27, 2024', dueDate: 'Oct 25, 2025', progress: 100, score: 96, status: 'passed', completionDate: 'Aug 30, 2025', repeat: 'Every 12 months' },
  { id: 10, name: 'Mia Robinson', email: 'mia.robinson@email.com', startDate: 'Aug 27, 2024', dueDate: 'Oct 25, 2025', progress: 88, score: 80, status: 'in-progress', completionDate: null, repeat: 'Every 6 months' },
]

const TABS: { key: Tab; label: string; count?: number }[] = [
  { key: 'content', label: 'Course Content' },
  { key: 'enrolments', label: 'Enrolments', count: TOTAL },
  { key: 'assessments', label: 'Assessments' },
  { key: 'settings', label: 'Settings' },
  { key: 'overview', label: 'Overview' },
]

function StackedDate({ value }: { value: string | null }) {
  if (!value) return <span className="cd-cell-muted">—</span>
  const year = value.match(/\d{4}$/)?.[0] ?? ''
  const label = value.replace(/,?\s*\d{4}$/, ',')
  return (
    <div className="cd-date">
      <span>{label}</span>
      <span className="cd-date-year">{year}</span>
    </div>
  )
}

// Heart matching the learner-side "attempts remaining" lives indicator.
function AttemptHeart({ filled, size = 12 }: { filled: boolean; size?: number }) {
  const [base, shade, shine] = filled
    ? ['#F44336', '#CC3333', '#FF8A80']
    : ['#454C5E', '#383D4C', '#9EA4B3']
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M8.81172 0.839844C6.75766 0.839844 6.00297 2.93891 6.00297 2.93891C6.00297 2.93891 5.2586 0.839844 3.19047 0.839844C1.6361 0.839844 -0.135777 2.07172 0.518598 4.87203C1.17297 7.67234 6.0086 11.1608 6.0086 11.1608C6.0086 11.1608 10.8264 7.67234 11.4817 4.87203C12.1361 2.07172 10.4917 0.839844 8.81172 0.839844Z" fill={base} />
      <path d="M2.87361 1.04891C4.48611 1.04891 5.28674 2.78234 5.54549 3.48453C5.58205 3.58484 5.72174 3.58766 5.76393 3.49016L6.00018 2.93797C5.66736 1.87484 4.75236 0.839844 3.19049 0.839844C2.54361 0.839844 1.86018 1.05359 1.32861 1.50453C1.7983 1.19609 2.34861 1.04891 2.87361 1.04891Z" fill={shade} />
      <path d="M8.81094 0.839844C8.315 0.839844 7.86313 0.947656 7.51063 1.16516C7.75813 1.06953 8.06469 1.04891 8.36844 1.04891C9.88813 1.04891 11.2484 2.20109 10.6344 4.86453C10.1075 7.15109 7.02875 9.92516 6.08844 10.9836C6.02844 11.0511 6.00781 11.1598 6.00781 11.1598C6.00781 11.1598 10.8256 7.67141 11.4809 4.87109C12.1353 2.07172 10.4938 0.839844 8.81094 0.839844Z" fill={shade} />
      <path d="M1.5981 2.32987C1.94967 1.89112 2.57779 1.52831 3.11029 1.94644C3.3981 2.17237 3.27248 2.6355 3.01467 2.8305C2.63967 3.1155 2.31342 3.28706 2.08467 3.73331C1.94779 4.00144 1.86529 4.29487 1.8231 4.59394C1.80623 4.71206 1.65154 4.74112 1.59342 4.63706C1.19779 3.93581 1.08529 2.97019 1.5981 2.32987Z" fill={shine} />
      <path d="M7.23385 3.24555C7.06885 3.24555 6.9526 3.08618 7.0126 2.93243C7.12416 2.6493 7.26853 2.37555 7.44197 2.1318C7.69885 1.7718 8.18728 1.5618 8.49666 1.78024C8.81353 2.00336 8.77228 2.44961 8.5501 2.66524C8.07291 3.12743 7.47103 3.24555 7.23385 3.24555Z" fill={shine} />
    </svg>
  )
}

function EnrolmentStatus({ status, progress, quizAttemptsLeft, quizAttemptsMax }: Learner) {
  const showHearts =
    status === 'in-progress' && progress === 100 && quizAttemptsLeft != null && quizAttemptsMax != null

  const badge = (
    <span className={`cd-status cd-status--${status}`}>
      {STATUS_LABELS[status]}
      {showHearts && (
        <span className="cd-status-attempts">
          <AttemptHeart filled size={16} />
          {quizAttemptsLeft}
        </span>
      )}
    </span>
  )

  if (!showHearts) return badge

  return (
    <Tooltip
      icon={false}
      position="Top"
      text={`Content completed. ${quizAttemptsLeft} quiz attempt${quizAttemptsLeft === 1 ? '' : 's'} left to reach the pass score.`}
      className="cd-status-tooltip"
    >
      {badge}
    </Tooltip>
  )
}

function CourseDetails() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('enrolments')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<number>>(new Set())

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return learners
    return learners.filter((l) => l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q))
  }, [search])

  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id))

  function toggleRow(id: number) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(rows.map((r) => r.id)))
  }

  return (
    <div className="cd-layout">
      <LeftSidebar />
      <main className="cd-main">
        <nav className="cd-breadcrumb" aria-label="Breadcrumb">
          <button type="button" className="cd-breadcrumb-link" onClick={() => navigate('/your-courses')}>
            Your Courses
          </button>
          <ArrowRight2 size={16} color="var(--text-tertiary)" variant="Linear" />
          <span className="cd-breadcrumb-current">{COURSE_TITLE}</span>
        </nav>

        {/* Page header */}
        <header className="cd-header">
          <div className="cd-header-top">
            <div className="cd-metadata">
              <span className="cd-meta-item">
                <Briefcase size={16} color="var(--text-secondary)" variant="Linear" />
                Course
              </span>
              <span className="cd-meta-item">
                <PlayCircle size={16} color="var(--text-secondary)" variant="Linear" />
                17 lessons
              </span>
              <span className="cd-meta-item">
                <Clock size={16} color="var(--text-secondary)" variant="Linear" />
                20 min
              </span>
            </div>
            <div className="cd-header-ctas">
              <button className="cd-icon-btn" aria-label="Copy course link">
                <Link2 size={20} color="var(--text-secondary)" variant="Linear" className="cd-link-icon" />
              </button>
              <button className="cd-icon-btn" aria-label="More options">
                <MoreIcon size={20} color="var(--text-secondary)" />
              </button>
              <button className="btn-primary">Enrol People</button>
            </div>
          </div>

          <div className="cd-headline-block">
            <h1 className="cd-title">{COURSE_TITLE}</h1>
            <div className="cd-helper">
              <span className="cd-helper-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6.5 3h11l3.5 5.2L12 21.5 1.5 8.2 6.5 3Z" fill="#00CEE6" stroke="#00AFC4" strokeWidth="1.2" strokeLinejoin="round" />
                  <path d="M6.5 3 12 8.2 17.5 3M1.5 8.2h21" stroke="#00AFC4" strokeWidth="1.2" strokeLinejoin="round" />
                </svg>
                Earn 100 jewels
              </span>
              <span className="cd-helper-item">
                <MedalStar size={18} color="var(--warning-500)" variant="Bold" />
                Certificate of completion
              </span>
              <span className="cd-helper-item">
                <InfoCircle size={18} color="var(--text-tertiary)" variant="Linear" />
                Pass score: 80%
              </span>
            </div>
          </div>

          <div className="cd-divider" />

          <div className="cd-tabs" role="tablist">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                role="tab"
                aria-selected={activeTab === tab.key}
                className={`cd-tab${activeTab === tab.key ? ' cd-tab--active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                <span className="cd-tab-label">
                  {tab.label}
                  {tab.count != null && <span className="cd-tab-count">{tab.count}</span>}
                </span>
              </button>
            ))}
          </div>
        </header>

        {activeTab === 'enrolments' ? (
          <section className="cd-enrolments">
            {/* Stats */}
            <div className="cd-stats">
              <div className="cd-stat">
                <div className="cd-stat-label">
                  <TickCircle size={18} color="var(--success-500)" variant="Linear" />
                  <span>Completed</span>
                  <InfoCircle size={16} color="var(--text-tertiary)" variant="Linear" />
                </div>
                <div className="cd-stat-value">
                  <span className="cd-stat-pct">48%</span>
                  <span className="cd-stat-sub">30 learners</span>
                </div>
              </div>
              <div className="cd-stat">
                <div className="cd-stat-label">
                  <Clock size={18} color="var(--primary-600)" variant="Linear" />
                  <span>In progress</span>
                </div>
                <div className="cd-stat-value">
                  <span className="cd-stat-pct">21%</span>
                  <span className="cd-stat-sub">19 learners</span>
                </div>
              </div>
              <div className="cd-stat">
                <div className="cd-stat-label">
                  <InfoCircle size={18} color="var(--warning-500)" variant="Linear" />
                  <span>At risk!</span>
                  <InfoCircle size={16} color="var(--text-tertiary)" variant="Linear" />
                </div>
                <div className="cd-stat-value">
                  <span className="cd-stat-pct">11%</span>
                  <span className="cd-stat-sub">14 Not Started/22 Failed</span>
                </div>
              </div>
              <div className="cd-stat">
                <div className="cd-stat-label">
                  <Danger size={18} color="var(--danger-500)" variant="Linear" />
                  <span>Overdue</span>
                </div>
                <div className="cd-stat-value">
                  <span className="cd-stat-pct">20%</span>
                  <span className="cd-stat-sub">17 learners</span>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="cd-filters">
              <div className="cd-filters-headline">
                <Sort size={20} color="var(--text-secondary)" variant="Linear" />
                <span className="cd-filters-label">Filters</span>
                <span className="cd-filters-count">0</span>
                <button className="cd-filters-add">
                  Add
                  <Add size={18} color="var(--primary-600)" />
                </button>
              </div>
              <button className="cd-icon-btn cd-icon-btn--sm" aria-label="Collapse filters">
                <ArrowDown2 size={16} color="var(--text-secondary)" variant="Linear" />
              </button>
            </div>

            {/* Actions */}
            <div className="cd-actions">
              <div className="cd-select-info">
                <span className="cd-select-count">{selected.size}/{TOTAL} selected</span>
                <span className="cd-select-divider" />
                <button
                  className="cd-link-btn"
                  disabled={selected.size === 0}
                  onClick={() => setSelected(new Set())}
                >
                  Clear All ({selected.size})
                </button>
                <span className="cd-select-divider" />
                <button className="cd-link-btn cd-link-btn--primary" onClick={() => setSelected(new Set(rows.map((r) => r.id)))}>
                  Select All ({TOTAL})
                </button>
              </div>
              <Search
                size="M"
                value={search}
                onChange={setSearch}
                placeholder="Search for people"
                ariaLabel="Search for people"
                className="cd-search"
              />
              <button className="cd-download-btn">
                Download Report
                <DocumentDownload size={20} color="var(--text-primary)" variant="Linear" />
              </button>
            </div>

            {/* Table */}
            <div className="cd-table">
              <div className="cd-row cd-row--head">
                <div className="cd-cell cd-cell--name">
                  <Checkbox checked={allSelected} onChange={toggleAll} />
                  <span>Name</span>
                </div>
                <div className="cd-cell cd-cell--start">Start date</div>
                <div className="cd-cell cd-cell--due">Due date</div>
                <div className="cd-cell cd-cell--progress">Progress</div>
                <div className="cd-cell cd-cell--score">
                  Score
                  <InfoCircle size={16} color="var(--text-tertiary)" variant="Linear" />
                </div>
                <div className="cd-cell cd-cell--status">Status</div>
                <div className="cd-cell cd-cell--completion">Completion date</div>
                <div className="cd-cell cd-cell--repeat">Repeat</div>
                <div className="cd-cell cd-cell--actions" aria-hidden="true" />
              </div>

              {rows.map((row) => (
                <div className="cd-row" key={row.id}>
                  <div className="cd-cell cd-cell--name">
                    <Checkbox checked={selected.has(row.id)} onChange={() => toggleRow(row.id)} />
                    <div className="cd-learner">
                      <span className="cd-learner-name">{row.name}</span>
                      <span className="cd-learner-email">{row.email}</span>
                    </div>
                  </div>
                  <div className="cd-cell cd-cell--start">
                    <StackedDate value={row.startDate} />
                  </div>
                  <div className="cd-cell cd-cell--due">
                    <StackedDate value={row.dueDate} />
                  </div>
                  <div className="cd-cell cd-cell--progress">
                    <div className="cd-progress">
                      <div className="cd-progress-fill" style={{ width: `${row.progress}%` }} />
                    </div>
                    <span className="cd-progress-pct">{row.progress}%</span>
                  </div>
                  <div className="cd-cell cd-cell--score">
                    {row.score != null ? `${row.score}%` : <span className="cd-cell-muted">—</span>}
                  </div>
                  <div className="cd-cell cd-cell--status">
                    <EnrolmentStatus {...row} />
                  </div>
                  <div className="cd-cell cd-cell--completion">
                    <StackedDate value={row.completionDate} />
                  </div>
                  <div className="cd-cell cd-cell--repeat">{row.repeat}</div>
                  <div className="cd-cell cd-cell--actions">
                    <button className="cd-icon-btn cd-icon-btn--sm" aria-label={`Actions for ${row.name}`}>
                      <MoreIcon size={20} color="var(--text-secondary)" />
                    </button>
                  </div>
                </div>
              ))}

              {rows.length === 0 && <div className="cd-empty">No people match your search.</div>}

              <div className="cd-pagination">
                <span className="cd-pagination-text">1-{rows.length} of {TOTAL}</span>
                <button className="cd-pagination-btn cd-pagination-btn--disabled" aria-label="Previous page">
                  <ArrowLeft2 size={16} color="var(--neutral-400)" />
                </button>
                <button className="cd-pagination-btn" aria-label="Next page">
                  <ArrowRight2 size={16} color="var(--neutral-500)" />
                </button>
              </div>
            </div>
          </section>
        ) : (
          <section className="cd-placeholder">This tab isn’t part of this prototype yet.</section>
        )}
      </main>
    </div>
  )
}

export default CourseDetails
