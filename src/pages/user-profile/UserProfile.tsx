import { useMemo, useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowDown, TaskSquare, NotificationBing, CalendarAdd, CalendarEdit, RotateLeft, Refresh, Repeat, UserMinus } from 'iconsax-react'
import LeftSidebar from '../../components/LeftSidebar/LeftSidebar'
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb'
import Badge from '../../components/Badge/Badge'
import Button from '../../components/Button/Button'
import Tooltip from '../../components/Tooltip/Tooltip'
import Table, { type Column } from '../../components/Table/Table'
import ToastContainer, { useToast } from '../../components/Toast/Toast'
import BulkActionBar from '../../components/BulkActionBar/BulkActionBar'
import RowActionsMenu, { type RowMenuItem } from './components/RowActionsMenu/RowActionsMenu'
import CourseFilters, { matchesCourse, defaultValueFor, FILTER_DEFS, type FilterId, type FilterValue } from './components/CourseFilters/CourseFilters'
import ExtendDueDateModal, { type ExtendDueDate } from './components/ExtendDueDateModal/ExtendDueDateModal'
import EditStartDateModal, { type StartDateChange } from './components/EditStartDateModal/EditStartDateModal'
import GiveAnotherAttemptModal from './components/GiveAnotherAttemptModal/GiveAnotherAttemptModal'
import { COURSE_STATUS_CARDS, type CourseStatusCard } from '@/data/courseStatusCards'
import noResultsIllustration from '@/assets/empty-state-illustrations/no-results.svg'
import avatarAnthonny from '../../assets/avatars/avatar-1.jpg'
import avatarBrenda from '../../assets/avatars/avatar-2.jpg'
import avatarDiana from '../../assets/avatars/avatar-3.jpg'
import avatarCarlos from '../../assets/avatars/avatar-4.jpg'
import thumb1 from '../../assets/programs/course-thumbs/course-thumb-1.jpg'
import thumb2 from '../../assets/programs/course-thumbs/course-thumb-2.jpg'
import thumb3 from '../../assets/programs/course-thumbs/course-thumb-3.jpg'
import thumb4 from '../../assets/programs/course-thumbs/course-thumb-4.jpg'
import thumb5 from '../../assets/programs/course-thumbs/course-thumb-5.jpg'
import thumb6 from '../../assets/programs/course-thumbs/course-thumb-6.jpg'
import thumb7 from '../../assets/programs/course-thumbs/course-thumb-7.jpg'
import thumb8 from '../../assets/programs/course-thumbs/course-thumb-8.jpg'
import thumb9 from '../../assets/programs/course-thumbs/course-thumb-9.jpg'
import './UserProfile.css'

/* ─── Header lookup ─── Mirrors the active People rows (src/pages/people/People.tsx)
   so a profile resolves from its route id. Kept minimal on purpose — a prototype
   header, not a second source of truth for the whole person record. */
interface ProfilePerson {
  name: string
  role: string
  email: string
  avatar: string
  avatarImg?: string
}

const PEOPLE: Record<string, ProfilePerson> = {
  '1': { name: 'Anthonny Wallace', role: 'Customer Support Specialist', email: 'anthonny@example.com', avatar: 'AW', avatarImg: avatarAnthonny },
  '2': { name: 'Brenda Kwasaki', role: 'Operations Manager', email: 'brenda@email.com', avatar: 'BK', avatarImg: avatarBrenda },
  '3': { name: 'Carlos Mendes', role: 'Software Engineer', email: 'carlos@example.com', avatar: 'CM', avatarImg: avatarCarlos },
  '4': { name: 'Diana Ross', role: 'Marketing Lead', email: 'diana.ross@company.com', avatar: 'DR', avatarImg: avatarDiana },
  '5': { name: 'Erik Johansson', role: 'Data Analyst', email: 'erik.j@email.com', avatar: 'EJ' },
}

const TABS = ['Engagement', 'Skills', 'Course Progress', 'Certificates'] as const
type Tab = (typeof TABS)[number]

/* Enrolment lifecycle. Scheduled = start date still ahead, so the learner
   can't open it yet; Failed = attempt finished below the pass mark. */
type Status = 'Scheduled' | 'Not Started' | 'In Progress' | 'Overdue' | 'Failed' | 'Completed'

interface CourseProgress {
  id: string
  course: string
  thumb: string
  startDate: string
  dueDate: string
  progress: number
  score: number | null
  status: Status
  completionDate: string | null
}

/* Covers every status so each row action has a row to act on. Rules the data
   holds to (today is Aug 2026): only Completed carries a completion date and
   100% progress; Failed finished its attempt but scored under the pass mark;
   Scheduled starts in the future, so progress is 0 and nothing is late. */
const COURSES: CourseProgress[] = [
  { id: '1', course: 'Anti Money Laundering and Terrorist Financing', thumb: thumb1, startDate: '2026-01-12', dueDate: '2026-02-13', progress: 100, score: 80, status: 'Completed', completionDate: '2026-02-02' },
  { id: '2', course: 'Fraud Prevention and Risk Assessment', thumb: thumb2, startDate: '2026-02-02', dueDate: '2026-03-06', progress: 100, score: 92, status: 'Completed', completionDate: '2026-02-27' },
  { id: '3', course: 'Compliance Strategies for Financial Institutions', thumb: thumb3, startDate: '2026-03-09', dueDate: '2026-04-10', progress: 100, score: 75, status: 'Completed', completionDate: '2026-04-01' },
  { id: '4', course: 'Counteracting Financial Crimes and Corruption', thumb: thumb4, startDate: '2026-06-01', dueDate: '2026-07-03', progress: 100, score: 41, status: 'Failed', completionDate: null },
  { id: '5', course: 'Regulatory Frameworks for Money Laundering Prevention', thumb: thumb5, startDate: '2026-06-15', dueDate: '2026-07-17', progress: 100, score: 38, status: 'Failed', completionDate: null },
  { id: '6', course: 'Financial Integrity and Security Management', thumb: thumb6, startDate: '2026-05-18', dueDate: '2026-06-19', progress: 45, score: null, status: 'Overdue', completionDate: null },
  { id: '7', course: 'Terrorism Financing and Economic Stability', thumb: thumb7, startDate: '2026-06-22', dueDate: '2026-07-24', progress: 0, score: null, status: 'Overdue', completionDate: null },
  { id: '8', course: 'Sanctions Screening and Reporting Obligations', thumb: thumb8, startDate: '2026-07-20', dueDate: '2026-08-21', progress: 65, score: null, status: 'In Progress', completionDate: null },
  { id: '9', course: 'Know Your Customer Due Diligence', thumb: thumb9, startDate: '2026-07-27', dueDate: '2026-08-28', progress: 20, score: null, status: 'In Progress', completionDate: null },
  { id: '10', course: 'Bribery and Corruption Awareness', thumb: thumb1, startDate: '2026-08-03', dueDate: '2026-09-04', progress: 0, score: null, status: 'Not Started', completionDate: null },
  { id: '11', course: 'Data Protection for Financial Services', thumb: thumb2, startDate: '2026-09-07', dueDate: '2026-10-09', progress: 0, score: null, status: 'Scheduled', completionDate: null },
  { id: '12', course: 'Whistleblowing and Speak-Up Culture', thumb: thumb3, startDate: '2026-10-05', dueDate: '2026-11-06', progress: 0, score: null, status: 'Scheduled', completionDate: null },
]

/* Standing for the whole course list — deliberately NOT derived from the
   filtered rows, so the summary stays a fixed reference point while the search
   and filters narrow the table below. "At risk" is Not Started, per the Figma.
   Plain rounding means the four can total 102% on a short list; that beats the
   alternative, where two buckets of 1 course read 13% and 12%. */
/* Which statuses each card counts. "At risk" is Not Started plus Failed, the
   breakdown the Figma spells out. Scheduled belongs to no card and is left out
   of the denominator too — those enrolments haven't opened, so they can't yet
   speak to how the learner is doing, and excluding them keeps the four cards
   summing to the active population instead of falling short of 100%. */
const STAT_GROUPS: Record<CourseStatusCard['key'], Status[]> = {
  completed: ['Completed'],
  'in-progress': ['In Progress'],
  'at-risk': ['Not Started', 'Failed'],
  overdue: ['Overdue'],
}

const ACTIVE_COURSES = COURSES.filter((c) => c.status !== 'Scheduled')

const shareOf = (statuses: Status[]) => {
  const count = ACTIVE_COURSES.filter((c) => statuses.includes(c.status)).length
  return ACTIVE_COURSES.length ? Math.round((count / ACTIVE_COURSES.length) * 100) : 0
}

/* Overdue and Failed intentionally share the red error pill — colour carries
   severity, the label carries which. Matches how Failed reads on My Team. */
const STATUS_BADGE: Record<Status, 'success' | 'informative' | 'in-progress' | 'error' | 'scheduled'> = {
  Scheduled: 'scheduled',
  'Not Started': 'informative',
  'In Progress': 'in-progress',
  Overdue: 'error',
  Failed: 'error',
  Completed: 'success',
}

type SortKey = 'startDate' | 'dueDate' | 'progress' | 'score' | 'status' | 'completionDate'

// Lifecycle order: not yet open → in flight → gone wrong → done.
const STATUS_ORDER: Record<Status, number> = {
  Scheduled: 0,
  'Not Started': 1,
  'In Progress': 2,
  Overdue: 3,
  Failed: 4,
  Completed: 5,
}

function compareCourses(a: CourseProgress, b: CourseProgress, key: SortKey): number {
  switch (key) {
    case 'progress':
      return a.progress - b.progress
    case 'score':
      return (a.score ?? -1) - (b.score ?? -1)
    case 'status':
      return STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
    default:
      // date columns — ISO strings sort lexicographically; nulls sort first
      return (a[key] ?? '').localeCompare(b[key] ?? '')
  }
}

const SEGMENTS = 8

const FILTER_KIND = Object.fromEntries(FILTER_DEFS.map((d) => [d.id, d.kind])) as Record<FilterId, FilterValue['kind']>

/* Enrolment-level row actions — same set as the course enrolments page; each
   Course Progress row is an enrolment (this learner × this course). */
const ROW_MENU_ITEMS: RowMenuItem[] = [
  { key: 'view-progress', label: 'View progress', icon: <TaskSquare size={20} color="currentColor" variant="Linear" /> },
  /* Reminders are automated per course (see Workflows); this is the manual nudge
     for the exceptional case, so it stays single-row — never a bulk action. */
  { key: 'send-reminder', label: 'Send reminder', icon: <NotificationBing size={20} color="currentColor" variant="Linear" /> },
  { key: 'extend-due-date', label: 'Extend due date', icon: <CalendarAdd size={20} color="currentColor" variant="Linear" /> },
  { key: 'edit-start-date', label: 'Edit start date', icon: <CalendarEdit size={20} color="currentColor" variant="Linear" /> },
  /* Refresh, not RotateLeft — the bar uses RotateLeft for "give another
     attempt", so recurrence keeps its own glyph to stay unambiguous. */
  { key: 'edit-repeat-rules', label: 'Edit repeat rules', icon: <Refresh size={20} color="currentColor" variant="Linear" /> },
  { key: 'give-another-attempt', label: 'Give another attempt', icon: <RotateLeft size={20} color="currentColor" variant="Linear" /> },
  { key: 'restart-enrolment', label: 'Restart enrolment', icon: <Repeat size={20} color="currentColor" variant="Linear" /> },
  { key: 'unenrol', label: 'Unenrol', icon: <UserMinus size={20} color="currentColor" variant="Linear" />, danger: true, dividerBefore: true },
]

/* Floating-bar actions — icon-only until hovered, when each expands into the DS
   Outlined button hover state (Figma 9180:54019 rest / 9180:54170 hover).
   Glyphs follow that Figma and differ from the row menu's for three of these. */
const BULK_ACTIONS: { key: string; label: string; icon: ReactNode; destructive?: boolean }[] = [
  { key: 'extend-due-date', label: 'Extend Due Date', icon: <CalendarAdd size={20} color="currentColor" variant="Linear" /> },
  { key: 'edit-start-date', label: 'Edit Start Date', icon: <CalendarEdit size={20} color="currentColor" variant="Linear" /> },
  { key: 'give-another-attempt', label: 'Give Another Attempt', icon: <RotateLeft size={20} color="currentColor" variant="Linear" /> },
  { key: 'restart-enrolment', label: 'Restart Enrolment', icon: <Repeat size={20} color="currentColor" variant="Linear" /> },
  { key: 'unenrol', label: 'Unenrol', icon: <UserMinus size={20} color="currentColor" variant="Linear" />, destructive: true },
]

/* Which statuses an action can act on. The test is whether the action still has
   something ahead of the learner to change: dates only matter while the course
   is unfinished, retries only once an attempt has concluded. Actions absent
   here — view progress, edit repeat rules, unenrol — are always valid, being
   read-only or configuration that is independent of progress. */
const ACTION_RULES: Record<string, { statuses: Status[]; reason: string }> = {
  'edit-start-date': {
    statuses: ['Scheduled'],
    reason: 'Only before the enrolment begins',
  },
  'extend-due-date': {
    statuses: ['Scheduled', 'Not Started', 'In Progress', 'Overdue'],
    reason: 'Only while there is still something to complete',
  },
  'send-reminder': {
    statuses: ['Not Started', 'In Progress', 'Overdue'],
    reason: 'Only while the course is open to the learner',
  },
  'give-another-attempt': {
    statuses: ['Failed', 'Completed'],
    reason: 'Only after an attempt has finished',
  },
  'restart-enrolment': {
    statuses: ['In Progress', 'Overdue', 'Failed', 'Completed'],
    reason: 'Nothing has happened yet — edit the dates instead',
  },
}

const allows = (key: string, status: Status) => {
  const rule = ACTION_RULES[key]
  return !rule || rule.statuses.includes(status)
}

/* Short by default; only grows when part of the selection was left out, so the
   numbers appear exactly when they carry information. */
const outcomeToast = (base: string, applied: number, skipped: number) =>
  skipped === 0
    ? base
    : `${base} on ${applied} ${applied === 1 ? 'course' : 'courses'} · ${skipped} skipped`

const ROW_ACTION_LABEL: Record<string, string> = {
  'view-progress': 'View progress',
  'send-reminder': 'Send reminder',
  'extend-due-date': 'Extend due date',
  'edit-start-date': 'Edit start date',
  'edit-repeat-rules': 'Edit repeat rules',
  'give-another-attempt': 'Give another attempt',
  'restart-enrolment': 'Restart enrolment',
  unenrol: 'Unenrol',
}

function DateCell({ value }: { value: string | null }) {
  if (!value) return <span className="up-muted">–</span>
  const d = new Date(value + 'T00:00:00')
  return (
    <span className="tbl-date">
      <span className="day">{d.toLocaleString('en-US', { month: 'short' })} {d.getDate()},</span>
      <span className="year">{d.getFullYear()}</span>
    </span>
  )
}

/* Single-line stat (Figma 9193:44018): icon, share, label + info anchor. */
function StatCard({ icon, label, tooltip, share }: {
  icon: ReactNode
  label: string
  tooltip?: string
  share: number
}) {
  return (
    <div className="up-stat">
      <span className="up-stat-icon">{icon}</span>
      <span className="up-stat-value">{share}%</span>
      <span className="up-stat-label">
        {label}
        {tooltip && <Tooltip position="Top" text={tooltip} iconSize={16} />}
      </span>
    </div>
  )
}

function ProgressCell({ value }: { value: number }) {
  const filled = Math.round((value / 100) * SEGMENTS)
  return (
    <span className="tbl-progress up-progress">
      <span className="bar">
        {Array.from({ length: SEGMENTS }, (_, i) => (
          <span key={i} className={`seg${i < filled ? ' fill' : ''}`} />
        ))}
      </span>
      <span className="pct">{value}%</span>
    </span>
  )
}

function UserProfile() {
  const navigate = useNavigate()
  const { id = '1' } = useParams<{ id: string }>()
  const person = PEOPLE[id] ?? PEOPLE['1']

  const [activeTab, setActiveTab] = useState<Tab>('Course Progress')
  // Due dates are editable via the bulk actions, so the list is state, not the const.
  const [courses, setCourses] = useState<CourseProgress[]>(COURSES)
  /* Which enrolments the Extend-due-date modal is acting on: the whole
     selection ('bulk') or the single row its menu was opened from. */
  const [extendTarget, setExtendTarget] = useState<'bulk' | CourseProgress | null>(null)
  const [startDateTarget, setStartDateTarget] = useState<'bulk' | CourseProgress | null>(null)
  const [attemptTarget, setAttemptTarget] = useState<'bulk' | CourseProgress | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>('startDate')
  const [sortDesc, setSortDesc] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [filterActive, setFilterActive] = useState<FilterId[]>([])
  const [filterValues, setFilterValues] = useState<Record<string, FilterValue>>({})
  const [filtersExpanded, setFiltersExpanded] = useState(false)
  const { toasts, show: showToast } = useToast()

  const addFilter = (id: FilterId) => {
    setFilterActive((prev) => (prev.includes(id) ? prev : [...prev, id]))
    setFilterValues((prev) => ({ ...prev, [id]: prev[id] ?? defaultValueFor(FILTER_KIND[id]) }))
    setFiltersExpanded(true)
  }
  const removeFilter = (id: FilterId) => {
    setFilterActive((prev) => prev.filter((f) => f !== id))
    setFilterValues((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }
  const setFilterValue = (id: FilterId, value: FilterValue) => setFilterValues((prev) => ({ ...prev, [id]: value }))
  const clearFilters = () => {
    setFilterActive([])
    setFilterValues({})
  }

  const handleRowAction = (key: string, row: CourseProgress) => {
    if (key === 'extend-due-date') {
      setExtendTarget(row)
      return
    }
    if (key === 'edit-start-date') {
      setStartDateTarget(row)
      return
    }
    if (key === 'give-another-attempt') {
      setAttemptTarget(row)
      return
    }
    if (key === 'send-reminder') {
      showToast('success', `Reminder sent to ${person.name} for “${row.course}”`)
      return
    }
    if (key === 'unenrol') {
      showToast('warning', `${person.name} would be unenrolled from “${row.course}”`)
      return
    }
    showToast('info', `${ROW_ACTION_LABEL[key] ?? 'Action'} — coming soon`)
  }

  /* Rows in the selection an action can actually touch. A mixed selection runs
     on the eligible subset rather than blocking outright — with 40 rows picked,
     a greyed-out button never says which row poisoned it. */
  const eligible = (key: string) => courses.filter((c) => selected.has(c.id) && allows(key, c.status))

  const handleBulkAction = (key: string) => {
    const n = selected.size
    if (key === 'extend-due-date') {
      setExtendTarget('bulk')
      return
    }
    if (key === 'edit-start-date') {
      setStartDateTarget('bulk')
      return
    }
    if (key === 'give-another-attempt') {
      setAttemptTarget('bulk')
      return
    }
    if (key === 'unenrol') {
      showToast('warning', `${n} ${n === 1 ? 'enrolment' : 'enrolments'} would be unenrolled`)
      return
    }
    showToast('info', `${ROW_ACTION_LABEL[key] ?? 'Action'} — ${n} selected — coming soon`)
  }

  /* Apply the new due date to every selected enrolment. A specific date lands on
     all of them; a day offset shifts each row from its own current due date. */
  const applyExtension = (value: ExtendDueDate) => {
    const isBulk = extendTarget === 'bulk'
    const ids = isBulk
      ? new Set(eligible('extend-due-date').map((c) => c.id))
      : new Set(extendTarget ? [extendTarget.id] : [])
    const skipped = isBulk ? selected.size - ids.size : 0
    setCourses((prev) =>
      prev.map((c) => {
        if (!ids.has(c.id)) return c
        if (value.mode === 'date') return { ...c, dueDate: value.date }
        const d = new Date(`${c.dueDate}T00:00:00`)
        d.setDate(d.getDate() + value.days)
        return { ...c, dueDate: d.toISOString().slice(0, 10) }
      }),
    )
    showToast('success', outcomeToast('Due date extended', ids.size, skipped))
    setExtendTarget(null)
    // A row action shouldn't disturb a selection the admin is still building.
    if (isBulk) setSelected(new Set())
  }

  /* Set the enrolment start date on the targeted rows. The timezone is
     collected per the design but has nowhere to live on an enrolment yet, so
     it only surfaces in the confirmation. */
  const applyStartDate = ({ date }: StartDateChange) => {
    const isBulk = startDateTarget === 'bulk'
    const ids = isBulk
      ? new Set(eligible('edit-start-date').map((c) => c.id))
      : new Set(startDateTarget ? [startDateTarget.id] : [])
    const skipped = isBulk ? selected.size - ids.size : 0
    setCourses((prev) => prev.map((c) => (ids.has(c.id) ? { ...c, startDate: date } : c)))
    showToast('success', outcomeToast('Start date updated', ids.size, skipped))
    setStartDateTarget(null)
    if (isBulk) setSelected(new Set())
  }

  /* A fresh attempt in the same enrolment: progress and score wipe, the row
     goes back to In Progress, and any completion date is cleared. Start date
     and due date are untouched — the modal promises they stay put. */
  const applyAnotherAttempt = () => {
    const isBulk = attemptTarget === 'bulk'
    const ids = isBulk
      ? new Set(eligible('give-another-attempt').map((c) => c.id))
      : new Set(attemptTarget ? [attemptTarget.id] : [])
    const skipped = isBulk ? selected.size - ids.size : 0
    setCourses((prev) =>
      prev.map((c) =>
        ids.has(c.id)
          ? { ...c, progress: 0, score: null, status: 'In Progress' as Status, completionDate: null }
          : c,
      ),
    )
    showToast('success', outcomeToast(`New attempt started for ${person.name}`, ids.size, skipped))
    setAttemptTarget(null)
    if (isBulk) setSelected(new Set())
  }

  const rows = useMemo(() => {
    const filtered = courses.filter((c) => matchesCourse(c, filterActive, filterValues))
    const sorted = [...filtered].sort((a, b) => compareCourses(a, b, sortKey))
    return sortDesc ? sorted.reverse() : sorted
  }, [courses, sortKey, sortDesc, filterActive, filterValues])

  // Click a sortable header: same column flips direction, a new column starts ascending.
  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortDesc((s) => !s)
    else {
      setSortKey(key)
      setSortDesc(false)
    }
  }

  // Sort arrow: always shown on the active column (rotates for direction),
  // revealed on hover for the other sortable columns (see .up-sort in the CSS).
  const sortArrow = (key: SortKey) => (
    <ArrowDown
      size={16}
      color="currentColor"
      variant="Linear"
      className={`up-sort${sortKey === key ? ' up-sort--active' : ''}${sortKey === key && sortDesc ? ' up-sort--desc' : ''}`}
    />
  )

  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id))

  const toggleAll = () =>
    setSelected((prev) => {
      if (rows.every((r) => prev.has(r.id))) {
        const next = new Set(prev)
        rows.forEach((r) => next.delete(r.id))
        return next
      }
      return new Set([...prev, ...rows.map((r) => r.id)])
    })

  const toggleRow = (row: CourseProgress) =>
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(row.id) ? next.delete(row.id) : next.add(row.id)
      return next
    })

  const columns: Column<CourseProgress>[] = [
    {
      key: 'course',
      header: 'Course',
      width: '2 0 240px',
      render: (row) => (
        <span className="up-course">
          <img className="tbl-thumb" src={row.thumb} alt="" />
          <span className="tbl-stack">
            <span className="primary">{row.course}</span>
          </span>
        </span>
      ),
    },
    {
      key: 'startDate',
      header: <span className="up-th-sort">Start Date{sortArrow('startDate')}</span>,
      sortable: true,
      width: '0 0 108px',
      render: (row) => <DateCell value={row.startDate} />,
    },
    {
      key: 'dueDate',
      header: <span className="up-th-sort">Due Date{sortArrow('dueDate')}</span>,
      sortable: true,
      width: '0 0 108px',
      render: (row) => <DateCell value={row.dueDate} />,
    },
    {
      key: 'progress',
      header: (
        <span className="up-th-sort">
          Progress
          <Tooltip position="Top" text="Share of the course the learner has completed." />
          {sortArrow('progress')}
        </span>
      ),
      sortable: true,
      width: '0 0 156px',
      render: (row) => <ProgressCell value={row.progress} />,
    },
    {
      key: 'score',
      header: (
        <span className="up-th-sort">
          Score
          <Tooltip position="Top" text="Latest quiz or assessment score for this course." />
          {sortArrow('score')}
        </span>
      ),
      sortable: true,
      width: '0 0 100px',
      render: (row) => (row.score != null ? `${row.score}%` : <span className="up-muted">–</span>),
    },
    {
      key: 'status',
      header: <span className="up-th-sort">Status{sortArrow('status')}</span>,
      sortable: true,
      width: '0 0 140px',
      render: (row) => <Badge type={STATUS_BADGE[row.status]} label={row.status} icon={false} />,
    },
    {
      key: 'completionDate',
      header: <span className="up-th-sort">Completion Date{sortArrow('completionDate')}</span>,
      sortable: true,
      width: '0 0 150px',
      render: (row) => <DateCell value={row.completionDate} />,
    },
    {
      key: 'actions',
      header: '',
      width: '0 0 52px',
      align: 'center',
      render: (row) => (
        <RowActionsMenu
          items={ROW_MENU_ITEMS.map((item) =>
            allows(item.key, row.status) ? item : { ...item, disabled: true },
          )}
          onSelect={(key) => handleRowAction(key, row)}
          ariaLabel={`Actions for ${row.course}`}
        />
      ),
    },
  ]

  return (
    <div className="up-layout">
      <LeftSidebar />
      <main className="up-main">
        <div className="up-page">
          <Breadcrumb
            className="up-breadcrumb"
            items={[
              { label: 'People', onClick: () => navigate('/people') },
              { label: person.name },
            ]}
          />

          {/* Profile header — divider sits between the headline and the tabs (per headers.md) */}
          <header className="up-header">
            <div className="up-headline">
              <div className="up-avatar">
                {person.avatarImg ? <img src={person.avatarImg} alt="" /> : person.avatar}
              </div>
              <div className="up-title-group">
                <h1 className="up-name">{person.name}</h1>
                <p className="up-meta">{person.role} · {person.email}</p>
              </div>
              <Button variant="filled" className="up-edit ui-disabled" disabled>
                Edit Profile
              </Button>
            </div>

            <div className="up-divider" />

            <div className="up-tabs" role="tablist">
              {TABS.map((tab) => {
                const isReady = tab === 'Course Progress'
                return (
                  <button
                    key={tab}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tab}
                    disabled={!isReady}
                    className={`up-tab${activeTab === tab ? ' up-tab--active' : ''}${isReady ? '' : ' ui-disabled'}`}
                    onClick={() => isReady && setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                )
              })}
            </div>
          </header>

          {/* Standing at a glance, before the rows (Figma People 9192:42911).
              Always the learner's full course list — search and filters below
              narrow the table, never this. */}
          <div className="up-stats">
            {COURSE_STATUS_CARDS.map((c) => (
              <StatCard
                key={c.key}
                icon={c.icon}
                label={c.label}
                tooltip={c.tooltip}
                share={shareOf(STAT_GROUPS[c.key])}
              />
            ))}
          </div>

          {/* Smart filters */}
          <CourseFilters
            courses={courses}
            active={filterActive}
            values={filterValues}
            expanded={filtersExpanded}
            onAdd={addFilter}
            onRemove={removeFilter}
            onSetValue={setFilterValue}
            onClear={clearFilters}
            onToggleExpanded={() => setFiltersExpanded((e) => !e)}
          />

          {/* Course Progress table — or a no-results empty state when the
              filters exclude everything (DS empty-state.md). */}
          {rows.length === 0 ? (
            <div className="up-empty" role="status">
              <img className="up-empty-illustration" src={noResultsIllustration} alt="" width={72} height={72} />
              <div className="up-empty-info">
                <p className="up-empty-title">No results</p>
                <p className="up-empty-desc">No courses match your filters.</p>
                <button type="button" className="up-empty-cta" onClick={clearFilters}>
                  Clear Filters
                </button>
              </div>
            </div>
          ) : (
            <Table
              columns={columns}
              rows={rows}
              getRowKey={(row) => row.id}
              selectable
              isSelected={(row) => selected.has(row.id)}
              allSelected={allSelected}
              onToggleRow={toggleRow}
              onToggleAll={toggleAll}
              onSort={(key) => handleSort(key as SortKey)}
              pagination={{ from: rows.length ? 1 : 0, to: rows.length, total: rows.length }}
            />
          )}
        </div>
      </main>

      {/* Always mounted — the bar shows/hides itself off `count` so it can animate out. */}
      <BulkActionBar count={selected.size} onClear={() => setSelected(new Set())}>
        {BULK_ACTIONS.map((action) => {
          // Disabled only when the action can touch nothing in the selection.
          const none = eligible(action.key).length === 0
          return (
          <button
            key={action.key}
            type="button"
            className={`bulk-bar-btn bulk-bar-btn--icon${action.destructive ? ' bulk-bar-btn--destructive' : ''}`}
            disabled={none}
            title={none ? ACTION_RULES[action.key]?.reason : undefined}
            onClick={() => handleBulkAction(action.key)}
          >
            {action.icon}
            {/* Label stays in the DOM while collapsed so it is always announced. */}
            <span className="bulk-bar-btn-label"><span>{action.label}</span></span>
          </button>
          )
        })}
      </BulkActionBar>

      {extendTarget && (
        <ExtendDueDateModal
          count={extendTarget === 'bulk' ? eligible('extend-due-date').length : 1}
          courseName={extendTarget === 'bulk' ? undefined : extendTarget.course}
          onClose={() => setExtendTarget(null)}
          onApply={applyExtension}
        />
      )}

      {startDateTarget && (
        <EditStartDateModal
          count={startDateTarget === 'bulk' ? eligible('edit-start-date').length : 1}
          courseName={startDateTarget === 'bulk' ? undefined : startDateTarget.course}
          startDate={startDateTarget === 'bulk' ? undefined : startDateTarget.startDate}
          onClose={() => setStartDateTarget(null)}
          onApply={applyStartDate}
        />
      )}

      {attemptTarget && (
        <GiveAnotherAttemptModal
          count={attemptTarget === 'bulk' ? eligible('give-another-attempt').length : 1}
          courseName={attemptTarget === 'bulk' ? undefined : attemptTarget.course}
          learnerName={person.name}
          onClose={() => setAttemptTarget(null)}
          onApply={applyAnotherAttempt}
        />
      )}

      <ToastContainer toasts={toasts} />
    </div>
  )
}

export default UserProfile
