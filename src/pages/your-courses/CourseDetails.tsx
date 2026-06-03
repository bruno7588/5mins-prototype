import { Fragment, useMemo, useState, type ComponentType } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Add,
  ArrowDown2,
  ArrowLeft2,
  ArrowRight2,
  Briefcase,
  CalendarAdd,
  CalendarEdit,
  Clock,
  Danger,
  DocumentDownload,
  InfoCircle,
  Link2,
  MedalStar,
  PlayCircle,
  Repeat,
  ArrowRotateLeft,
  Sort,
  TaskSquare,
  TickCircle,
  UserMinus,
} from 'iconsax-react'
import LeftSidebar from '../../components/LeftSidebar/LeftSidebar'
import Search from '../../components/Search/Search'
import Checkbox from '../../components/Checkbox/Checkbox'
import Tooltip from '../../components/Tooltip/Tooltip'
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal'
import Alert from '../../components/Alert/Alert'
import MoreIcon from '../../components/icons/MoreIcon'
import CourseSettings from './components/CourseSettings/CourseSettings'
import '../people/People.css'
import './CourseDetails.css'

type Tab = 'content' | 'enrolments' | 'assessments' | 'settings' | 'overview'

type LearnerStatus = 'not-started' | 'in-progress' | 'quizzes-pending' | 'passed' | 'failed'

interface Learner {
  id: number
  name: string
  email: string
  startDate: string
  dueDate: string
  progress: number
  score: number | null
  status: LearnerStatus
  attemptNo: number
  completionDate: string | null
  repeat: string
}

const STATUS_LABELS: Record<LearnerStatus, string> = {
  'not-started': 'Not Started',
  'in-progress': 'In Progress',
  'quizzes-pending': 'Quizzes Pending',
  passed: 'Passed',
  failed: 'Failed',
}

const COURSE_TITLE = 'Building Company Culture A Guide for HR Teams'
const TOTAL = 128

// Course-level attempt policy. In the real app these come from the Settings tab
// (CourseSettings: `autoReset` + `maxAttempts`); mirrored here as constants for the prototype.
// The cap is only enforced while auto-reset is on, so it only frames the manual reset when on.
const AUTO_RESET_ON_FAILURE = true
const MAX_COURSE_ATTEMPTS = 3

const learners: Learner[] = [
  { id: 1, name: 'Anthony Wallace', email: 'anthony.wallace@email.com', startDate: 'Aug 27, 2024', dueDate: 'Oct 25, 2025', progress: 100, score: 60, status: 'failed', attemptNo: 2, completionDate: 'Sep 25, 2025', repeat: 'Every 12 months' },
  { id: 2, name: 'Sophia Carter', email: 'sophia.carter@email.com', startDate: 'Aug 27, 2024', dueDate: 'Oct 25, 2025', progress: 100, score: 92, status: 'passed', attemptNo: 1, completionDate: 'Sep 25, 2025', repeat: 'Never' },
  { id: 3, name: 'Oliver Bennett', email: 'oliver.bennett@email.com', startDate: 'Jul 14, 2024', dueDate: 'Oct 25, 2025', progress: 0, score: null, status: 'not-started', attemptNo: 1, completionDate: null, repeat: 'Every 12 months' },
  { id: 4, name: 'Emma Thompson', email: 'emma.thompson@email.com', startDate: 'Aug 27, 2024', dueDate: 'Oct 25, 2025', progress: 100, score: 50, status: 'quizzes-pending', attemptNo: 2, completionDate: null, repeat: 'Every 6 months' },
  { id: 5, name: 'Liam Johnson', email: 'liam.johnson@email.com', startDate: 'Sep 02, 2024', dueDate: 'Nov 30, 2025', progress: 0, score: null, status: 'not-started', attemptNo: 1, completionDate: null, repeat: 'Never' },
  { id: 6, name: 'Ava Martinez', email: 'ava.martinez@email.com', startDate: 'Aug 27, 2024', dueDate: 'Oct 25, 2025', progress: 100, score: 78, status: 'failed', attemptNo: 3, completionDate: 'Oct 01, 2025', repeat: 'Every 12 months' },
  { id: 7, name: 'Noah Davis', email: 'noah.davis@email.com', startDate: 'Aug 27, 2024', dueDate: 'Oct 25, 2025', progress: 50, score: 65, status: 'in-progress', attemptNo: 2, completionDate: null, repeat: 'Every 12 months' },
  { id: 8, name: 'Isabella Lewis', email: 'isabella.lewis@email.com', startDate: 'Jun 18, 2024', dueDate: 'Sep 15, 2025', progress: 100, score: 96, status: 'passed', attemptNo: 1, completionDate: 'Sep 12, 2025', repeat: 'Never' },
  { id: 9, name: 'James Walker', email: 'james.walker@email.com', startDate: 'Aug 27, 2024', dueDate: 'Oct 25, 2025', progress: 100, score: 96, status: 'passed', attemptNo: 1, completionDate: 'Aug 30, 2025', repeat: 'Every 12 months' },
  { id: 10, name: 'Mia Robinson', email: 'mia.robinson@email.com', startDate: 'Aug 27, 2024', dueDate: 'Oct 25, 2025', progress: 88, score: 80, status: 'in-progress', attemptNo: 2, completionDate: null, repeat: 'Every 6 months' },
]

const TABS: { key: Tab; label: string; count?: number }[] = [
  { key: 'content', label: 'Course Content' },
  { key: 'enrolments', label: 'Enrolments', count: TOTAL },
  { key: 'assessments', label: 'Assessments' },
  { key: 'settings', label: 'Settings' },
  { key: 'overview', label: 'Overview' },
]

type IconComponent = ComponentType<{ size?: number; color?: string; variant?: 'Linear' | 'Bold' }>

// Recurring/repeat-rules glyph (partial arc + dashed arc).
function RepeatRules({ size = 20, color = 'currentColor' }: { size?: number; color?: string; variant?: 'Linear' | 'Bold' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M12.1243 18.0557C15.6993 17.1141 18.3327 13.8641 18.3327 9.9974C18.3327 5.3974 14.6327 1.66406 9.99935 1.66406C4.44102 1.66406 1.66602 6.2974 1.66602 6.2974M5.36602 6.2974H3.34102H1.66602V2.4974" stroke={color} strokeWidth="1.04167" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M1.66602 10C1.66602 14.6 5.39935 18.3333 9.99935 18.3333" stroke={color} strokeWidth="1.04167" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2.5 2.5" />
    </svg>
  )
}

interface RowMenuAction {
  key: string
  label: string
  description: string
  Icon: IconComponent
  variant?: 'Linear' | 'Bold'
  danger?: boolean
  /** Render a divider above this item. */
  dividerBefore?: boolean
}

const ROW_MENU: RowMenuAction[] = [
  { key: 'view', label: 'View progress', description: "See learner's lesson and quiz progress", Icon: TaskSquare },
  { key: 'extend', label: 'Extend due date', description: 'Give more time to complete the course', Icon: CalendarAdd },
  { key: 'editStart', label: 'Edit start date', description: 'Change when the enrolment begins', Icon: CalendarEdit },
  { key: 'editRepeat', label: 'Edit repeat rules', description: 'How often this course repeats', Icon: RepeatRules },
  { key: 'restart', label: 'Restart enrolment', description: 'Start a new enrolment with new dates', Icon: Repeat, variant: 'Bold' },
  { key: 'reset', label: 'Give another attempt', description: 'Archive this attempt and start over', Icon: ArrowRotateLeft },
  { key: 'unenrol', label: 'Unenrol', description: 'Remove this learner from the course', Icon: UserMinus, danger: true, dividerBefore: true },
]

// Info icon (circle-i) used for column/stat hints.
function InfoMark({ size = 16, color = 'var(--text-secondary)' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M7.75 2C4.57469 2 2 4.57469 2 7.75C2 10.9253 4.57469 13.5 7.75 13.5C10.9253 13.5 13.5 10.9253 13.5 7.75C13.5 4.57469 10.9253 2 7.75 2Z" stroke={color} strokeMiterlimit="10" />
      <path d="M6.875 6.875H7.875V10.5" stroke={color} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.5 10.625H9.25" stroke={color} strokeMiterlimit="10" strokeLinecap="round" />
      <path d="M7.75 4.0625C7.5893 4.0625 7.43221 4.11015 7.2986 4.19943C7.16498 4.28871 7.06084 4.4156 6.99935 4.56407C6.93785 4.71253 6.92176 4.8759 6.95311 5.03351C6.98446 5.19112 7.06185 5.33589 7.17548 5.44952C7.28911 5.56315 7.43388 5.64054 7.59149 5.67189C7.7491 5.70324 7.91247 5.68715 8.06093 5.62565C8.2094 5.56416 8.33629 5.46002 8.42557 5.3264C8.51485 5.19279 8.5625 5.0357 8.5625 4.875C8.5625 4.65951 8.4769 4.45285 8.32452 4.30048C8.17215 4.1481 7.96549 4.0625 7.75 4.0625Z" fill={color} />
    </svg>
  )
}

// Multi-colour bell used in the over-cap warning alert (matches Figma).
function BellIcon() {
  return (
    <svg className="alert__icon" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M8.2207 2.21493C8.2207 0.993788 9.1824 0 10.3641 0C11.5458 0 12.5075 0.993788 12.5075 2.21493C12.5075 3.43606 11.5458 4.42985 10.3641 4.42985C9.1824 4.42985 8.2207 3.43778 8.2207 2.21493ZM9.46741 2.21493C9.46741 2.72646 9.86909 3.14154 10.3641 3.14154C10.8591 3.14154 11.2608 2.72646 11.2608 2.21493C11.2608 1.70339 10.8591 1.28831 10.3641 1.28831C9.86909 1.28831 9.46741 1.70511 9.46741 2.21493Z" fill="#E2A610" />
      <path d="M12.2075 1.09375C12.2075 1.09375 12.3025 1.48472 11.8642 1.69829C11.4258 1.91014 11.1358 1.75341 11.1358 1.75341C11.2141 1.89119 11.2608 2.04792 11.2608 2.21844C11.2608 2.72997 10.8591 3.14505 10.3641 3.14505C9.86909 3.14505 9.46741 2.72997 9.46741 2.21844C9.46741 2.16677 9.47908 1.97214 9.55908 1.81024C8.81572 2.17538 8.2507 1.86363 8.2507 1.86363C8.23237 1.97903 8.2207 2.09787 8.2207 2.21844C8.2207 3.43957 9.1824 4.43336 10.3641 4.43336C11.5458 4.43336 12.5075 3.43957 12.5075 2.21671C12.5075 1.8068 12.3975 1.42272 12.2075 1.09375Z" fill="#9E740B" />
      <path d="M1.07671 15.8252C2.20508 14.6799 2.90843 14.2941 3.19511 12.6337C3.48178 10.9734 3.25178 7.47532 4.51515 5.18462C5.66852 3.08681 7.78525 2.21875 9.85032 2.21875C9.90032 2.21875 9.95032 2.22219 10.0003 2.22219C10.0503 2.22047 10.1003 2.21875 10.1503 2.21875C12.2154 2.21875 14.3321 3.08681 15.4855 5.18289C16.7472 7.47532 16.5189 10.9734 16.8055 12.632C17.0922 14.2923 17.7956 14.6781 18.9239 15.8235C19.4106 16.3178 19.999 17.1049 20.0006 17.6113C20.0023 18.1176 19.7523 18.3019 19.1573 18.5603C17.4739 19.2923 15.2238 20.0019 10.0003 20.0019C4.77682 20.0019 2.52675 19.2923 0.843368 18.5603C0.248349 18.3019 -0.00165844 18.1194 8.27502e-06 17.6113C0.00167499 17.1066 0.590027 16.3195 1.07671 15.8252Z" fill="#FFCA28" />
      <path d="M18.284 17.6469C18.284 16.8839 14.5755 16.2656 10.0004 16.2656C5.42525 16.2656 1.7168 16.8839 1.7168 17.6469C1.7168 18.4099 5.42525 19.3211 10.0004 19.3211C14.5755 19.3211 18.284 18.4099 18.284 17.6469Z" fill="#4E342E" />
      <path d="M14.9744 6.69599C15.0361 6.93884 15.0878 7.18169 15.1294 7.41937C15.3411 8.63534 15.3028 9.88232 15.3978 11.1138C15.5261 12.7621 15.8095 13.6301 16.4545 14.4052C16.5395 14.5068 16.4528 14.6635 16.3245 14.6429C15.4628 14.5068 14.7711 14.3707 13.9827 13.8334C12.806 13.0325 12.516 11.5254 12.5077 10.1717C12.4944 8.15653 12.531 6.20513 12.376 5.46452C12.161 4.43284 11.961 3.88342 11.6343 3.38222C11.136 2.6175 13.071 3.67846 13.3744 3.91442C14.2194 4.57407 14.7044 5.63503 14.9744 6.69599Z" fill="#E2A610" />
      <path d="M4.48183 9.3691C4.46183 8.06357 4.47183 6.71325 4.97518 5.51451C5.27686 4.79801 5.78854 4.15214 6.44189 3.75083C6.95524 3.43565 7.99861 3.08773 8.37362 3.8025C8.44862 3.94546 8.47862 4.11252 8.48362 4.27615C8.49696 4.84624 8.21028 5.37327 7.93194 5.86586C7.10858 7.3264 6.78024 8.92301 6.34522 10.542C6.16688 11.2103 5.94021 11.8768 5.55186 12.4417C5.28519 12.8293 3.80014 14.2071 4.14015 12.9619C4.46683 11.758 4.50016 10.623 4.48183 9.3691Z" fill="#FFF59D" />
      <path d="M11.5152 17.3755C11.5136 17.0793 11.3586 16.9087 11.0019 16.7813C10.2619 16.5178 9.33518 16.566 8.79516 16.8657C8.22847 17.1792 8.62182 18.917 10.0002 18.917C11.3786 18.917 11.5169 17.6011 11.5152 17.3755Z" fill="#E2A610" />
      <path d="M4.87537 14.7923C3.41199 15.0576 2.35195 15.6311 1.89361 16.0961C1.53026 16.463 1.53026 16.7523 2.17028 16.4509C2.65196 16.2236 4.19535 15.762 5.54705 15.6225C7.86879 15.3814 9.30217 15.3762 9.54051 15.3814C10.0989 15.3934 10.1455 14.949 9.01716 14.7923C7.88879 14.6373 6.33875 14.5288 4.87537 14.7923Z" fill="#FFF59D" />
      <path d="M9.4105 18.5786C9.60384 18.7164 9.86051 18.7835 10.0772 18.6905C10.2939 18.5975 10.4339 18.3133 10.3272 18.098C10.2855 18.0136 10.2139 17.9499 10.1422 17.8914C9.94385 17.7312 9.72384 17.6003 9.4905 17.5038C9.39883 17.4659 9.30216 17.4315 9.20216 17.4384C9.10382 17.4436 9.00049 17.4969 8.96215 17.5917C8.79715 17.9792 9.12716 18.3788 9.4105 18.5786Z" fill="#FFF59D" />
    </svg>
  )
}

// 1 → "1st", 2 → "2nd", 4 → "4th", 11 → "11th".
function ordinal(n: number) {
  const rem100 = n % 100
  if (rem100 >= 11 && rem100 <= 13) return `${n}th`
  switch (n % 10) {
    case 1:
      return `${n}st`
    case 2:
      return `${n}nd`
    case 3:
      return `${n}rd`
    default:
      return `${n}th`
  }
}

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

function EnrolmentStatus({ status }: Learner) {
  // "Quizzes Pending" = content is 100% done but one or more quizzes haven't hit the pass score.
  if (status !== 'quizzes-pending') {
    return <span className={`cd-status cd-status--${status}`}>{STATUS_LABELS[status]}</span>
  }

  const badge = (
    <span className={`cd-status cd-status--${status}`}>
      {STATUS_LABELS[status]}
      <InfoMark size={16} color="currentColor" />
    </span>
  )

  return (
    <Tooltip
      icon={false}
      position="Top"
      text="Course content is complete, but one or more quizzes haven't reached the pass score yet. The learner can retake quizzes within this attempt."
      className="cd-status-tooltip"
    >
      {badge}
    </Tooltip>
  )
}

function CourseDetails() {
  const navigate = useNavigate()
  const location = useLocation()
  // Course name passed from the list (Your Courses / Active Enrolments); falls back to the default.
  const courseTitle = (location.state as { courseTitle?: string } | null)?.courseTitle ?? COURSE_TITLE
  const [activeTab, setActiveTab] = useState<Tab>('enrolments')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [learnerList, setLearnerList] = useState<Learner[]>(learners)
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)
  const [resetTarget, setResetTarget] = useState<Learner | null>(null)

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return learnerList
    return learnerList.filter((l) => l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q))
  }, [search, learnerList])

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

  function confirmReset(id: number) {
    setLearnerList((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              attemptNo: l.attemptNo + 1,
              status: 'in-progress',
              progress: 0,
              score: null,
              completionDate: null,
            }
          : l,
      ),
    )
    setResetTarget(null)
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
          <span className="cd-breadcrumb-current">{courseTitle}</span>
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
            <h1 className="cd-title">{courseTitle}</h1>
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
                <InfoMark size={18} />
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
                  <InfoMark />
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
                  <InfoMark />
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
                  <InfoMark />
                </div>
                <div className="cd-cell cd-cell--status">Status</div>
                <div className="cd-cell cd-cell--attempt">
                  Attempt no
                  <Tooltip
                    icon={false}
                    position="Top"
                    text="Course attempts (current / maximum allowed)"
                    className="cd-attempt-info"
                  >
                    <InfoMark />
                  </Tooltip>
                </div>
                <div className="cd-cell cd-cell--completion">Completion date</div>
                <div className="cd-cell cd-cell--repeat">Repeat</div>
                <div className="cd-cell cd-cell--actions" aria-hidden="true" />
              </div>

              {rows.map((row) => (
                <div className={`cd-row${selected.has(row.id) ? ' cd-row--selected' : ''}`} key={row.id}>
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
                  <div className="cd-cell cd-cell--attempt">
                    {AUTO_RESET_ON_FAILURE ? (
                      <span className="cd-attempt">
                        {row.attemptNo}
                        <span className="cd-attempt-max">/{MAX_COURSE_ATTEMPTS}</span>
                      </span>
                    ) : (
                      row.attemptNo
                    )}
                  </div>
                  <div className="cd-cell cd-cell--completion">
                    <StackedDate value={row.completionDate} />
                  </div>
                  <div className="cd-cell cd-cell--repeat">{row.repeat}</div>
                  <div className="cd-cell cd-cell--actions">
                    <button
                      className="cd-icon-btn cd-icon-btn--sm"
                      aria-label={`Actions for ${row.name}`}
                      aria-haspopup="menu"
                      aria-expanded={openMenuId === row.id}
                      onClick={() => setOpenMenuId(openMenuId === row.id ? null : row.id)}
                    >
                      <MoreIcon size={20} color="var(--text-secondary)" />
                    </button>
                    {openMenuId === row.id && (
                      <div className="cd-row-menu" role="menu">
                        {ROW_MENU.map(({ key, label, description, Icon, variant, danger, dividerBefore }) => (
                          <Fragment key={key}>
                            {dividerBefore && <div className="cd-row-menu-divider" role="separator" />}
                            <button
                              type="button"
                              role="menuitem"
                              className={`cd-row-menu-item${danger ? ' cd-row-menu-item--danger' : ''}`}
                              onClick={() => {
                                setOpenMenuId(null)
                                if (key === 'reset') setResetTarget(row)
                              }}
                            >
                              <Icon
                                size={20}
                                color={danger ? 'var(--text-error)' : 'var(--text-primary)'}
                                variant={variant ?? 'Linear'}
                              />
                              <span className="cd-row-menu-text">
                                <span className="cd-row-menu-title">{label}</span>
                                <span className="cd-row-menu-desc">{description}</span>
                              </span>
                            </button>
                          </Fragment>
                        ))}
                      </div>
                    )}
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
        ) : activeTab === 'settings' ? (
          <CourseSettings />
        ) : (
          <section className="cd-placeholder">This tab isn’t part of this prototype yet.</section>
        )}

        {openMenuId !== null && <div className="cd-menu-backdrop" onClick={() => setOpenMenuId(null)} />}

        <ConfirmModal open={!!resetTarget} onClose={() => setResetTarget(null)} className="cd-reset-modal">
          {(() => {
            if (!resetTarget) return null
            const nextAttempt = resetTarget.attemptNo + 1
            const exceedsCap = AUTO_RESET_ON_FAILURE && nextAttempt > MAX_COURSE_ATTEMPTS
            return (
            <>
              <div className="confirm-modal-header confirm-modal-header--center">
                <div className="confirm-modal-icon">
                  <ArrowRotateLeft size={72} color="var(--warning-500)" variant="Linear" />
                </div>
                <h2 className="confirm-modal-title">Give another attempt at this course</h2>
                <p className="confirm-modal-body">
                  Reset {resetTarget.name}&apos;s progress and start over
                </p>
              </div>
              <Alert
                type="Callout"
                title="What happens:"
                bullets={[
                  'Their current attempt is archived and a new attempt begins in the same enrolment',
                  'Their start date and recurrence stay the same',
                ]}
              />
              {exceedsCap && (
                <Alert
                  type="Alert"
                  customIcon={<BellIcon />}
                  className="cd-reset-cap-alert"
                  message={`${resetTarget.name} has used all ${MAX_COURSE_ATTEMPTS} attempts allowed by auto-reset. Resetting adds one beyond that limit - this will be their ${ordinal(nextAttempt)} attempt`}
                />
              )}
              <div className="confirm-modal-actions">
                <button className="confirm-modal-btn confirm-modal-btn--outlined" onClick={() => setResetTarget(null)}>
                  Cancel
                </button>
                <button className="confirm-modal-btn confirm-modal-btn--warning" onClick={() => confirmReset(resetTarget.id)}>
                  Give Another Attempt
                </button>
              </div>
            </>
            )
          })()}
        </ConfirmModal>
      </main>
    </div>
  )
}

export default CourseDetails
