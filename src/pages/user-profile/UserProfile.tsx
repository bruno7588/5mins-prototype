import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowDown, ArrowDown2, TaskSquare, Calendar, CalendarEdit, RotateLeft, Refresh, Repeat, ProfileRemove } from 'iconsax-react'
import LeftSidebar from '../../components/LeftSidebar/LeftSidebar'
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb'
import Badge from '../../components/Badge/Badge'
import Button from '../../components/Button/Button'
import Search from '../../components/Search/Search'
import Tooltip from '../../components/Tooltip/Tooltip'
import Table, { type Column } from '../../components/Table/Table'
import ToastContainer, { useToast } from '../../components/Toast/Toast'
import BulkActionBar from '../../components/BulkActionBar/BulkActionBar'
import RowActionsMenu, { type RowMenuItem } from './components/RowActionsMenu/RowActionsMenu'
import CourseFilters, { matchesCourse, defaultValueFor, FILTER_DEFS, type FilterId, type FilterValue } from './components/CourseFilters/CourseFilters'
import CsvIcon from '../../components/icons/CsvIcon'
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

type Status = 'Completed' | 'Not Started' | 'In Progress' | 'Overdue'

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

const COURSES: CourseProgress[] = [
  { id: '1', course: 'Anti Money Laundering and Terrorist Financing', thumb: thumb1, startDate: '2025-01-13', dueDate: '2025-01-13', progress: 100, score: 80, status: 'Completed', completionDate: '2025-01-13' },
  { id: '2', course: 'Fraud Prevention and Risk Assessment', thumb: thumb2, startDate: '2025-01-13', dueDate: '2025-01-13', progress: 50, score: 80, status: 'Completed', completionDate: '2025-01-13' },
  { id: '3', course: 'Compliance Strategies for Financial Institutions', thumb: thumb3, startDate: '2025-01-13', dueDate: '2025-01-13', progress: 50, score: 80, status: 'Completed', completionDate: '2025-01-13' },
  { id: '4', course: 'Counteracting Financial Crimes and Corruption', thumb: thumb4, startDate: '2025-01-13', dueDate: '2025-01-13', progress: 50, score: 80, status: 'Completed', completionDate: '2025-01-13' },
  { id: '5', course: 'Regulatory Frameworks for Money Laundering Prevention', thumb: thumb5, startDate: '2025-01-13', dueDate: '2025-01-13', progress: 50, score: 80, status: 'Completed', completionDate: '2025-01-13' },
  { id: '6', course: 'Financial Integrity and Security Management', thumb: thumb6, startDate: '2025-01-13', dueDate: '2025-01-13', progress: 0, score: 0, status: 'Not Started', completionDate: null },
  { id: '7', course: 'Terrorism Financing and Economic Stability', thumb: thumb7, startDate: '2025-01-13', dueDate: '2025-01-13', progress: 50, score: 20, status: 'Overdue', completionDate: '2025-01-13' },
  { id: '8', course: 'Sanctions Screening and Reporting Obligations', thumb: thumb8, startDate: '2025-02-01', dueDate: '2025-03-01', progress: 65, score: null, status: 'In Progress', completionDate: null },
]

const STATUS_BADGE: Record<Status, 'success' | 'informative' | 'in-progress' | 'error'> = {
  Completed: 'success',
  'Not Started': 'informative',
  'In Progress': 'in-progress',
  Overdue: 'error',
}

type SortKey = 'startDate' | 'dueDate' | 'progress' | 'score' | 'status' | 'completionDate'

const STATUS_ORDER: Record<Status, number> = {
  'Not Started': 0,
  'In Progress': 1,
  Overdue: 2,
  Completed: 3,
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
  { key: 'view-progress', label: 'View progress', supporting: "See learner's lesson and quiz progress", icon: <TaskSquare size={20} color="currentColor" variant="Linear" /> },
  { key: 'extend-due-date', label: 'Extend due date', supporting: 'Give more time to complete the course', icon: <Calendar size={20} color="currentColor" variant="Linear" /> },
  { key: 'edit-start-date', label: 'Edit start date', supporting: 'Change when the enrolment begins', icon: <CalendarEdit size={20} color="currentColor" variant="Linear" /> },
  { key: 'edit-repeat-rules', label: 'Edit repeat rules', supporting: 'How often this course repeats', icon: <RotateLeft size={20} color="currentColor" variant="Linear" /> },
  { key: 'give-another-attempt', label: 'Give another attempt', supporting: 'Reset progress and start a new attempt', icon: <Refresh size={20} color="currentColor" variant="Linear" /> },
  { key: 'restart-enrolment', label: 'Restart enrolment', supporting: 'Start a new enrolment with new dates', icon: <Repeat size={20} color="currentColor" variant="Linear" /> },
  { key: 'unenrol', label: 'Unenrol', supporting: 'Remove this learner from the course', icon: <ProfileRemove size={20} color="currentColor" variant="Linear" />, danger: true, dividerBefore: true },
]

const ROW_ACTION_LABEL: Record<string, string> = {
  'view-progress': 'View progress',
  'extend-due-date': 'Extend due date',
  'edit-start-date': 'Edit start date',
  'edit-repeat-rules': 'Edit repeat rules',
  'give-another-attempt': 'Give another attempt',
  'restart-enrolment': 'Restart enrolment',
  unenrol: 'Unenrol',
}

/* Bulk menu = the enrolment actions that apply to many rows at once
   (no "View progress" / "Edit repeat rules" — those are single-row). */
const BULK_KEYS = ['extend-due-date', 'edit-start-date', 'give-another-attempt', 'restart-enrolment', 'unenrol']
// Bulk menu items are single-line (no supporting text), per the Figma.
const BULK_MENU_ITEMS = ROW_MENU_ITEMS.filter((i) => BULK_KEYS.includes(i.key)).map((i) => ({ ...i, supporting: undefined }))

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
  const [query, setQuery] = useState('')
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
    if (key === 'unenrol') {
      showToast('warning', `${person.name} would be unenrolled from “${row.course}”`)
      return
    }
    showToast('info', `${ROW_ACTION_LABEL[key] ?? 'Action'} — coming soon`)
  }

  const handleBulkAction = (key: string) => {
    const n = selected.size
    if (key === 'unenrol') {
      showToast('warning', `${n} ${n === 1 ? 'enrolment' : 'enrolments'} would be unenrolled`)
      return
    }
    showToast('info', `${ROW_ACTION_LABEL[key] ?? 'Action'} — ${n} selected — coming soon`)
  }

  const sendReminder = () => {
    const n = selected.size
    showToast('success', `Reminder sent for ${n} ${n === 1 ? 'course' : 'courses'}`)
  }

  const rows = useMemo(() => {
    const filtered = COURSES.filter(
      (c) => c.course.toLowerCase().includes(query.trim().toLowerCase()) && matchesCourse(c, filterActive, filterValues),
    )
    const sorted = [...filtered].sort((a, b) => compareCourses(a, b, sortKey))
    return sortDesc ? sorted.reverse() : sorted
  }, [query, sortKey, sortDesc, filterActive, filterValues])

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
          items={ROW_MENU_ITEMS}
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

          {/* Toolbar */}
          <div className="up-actions">
            <Search size="M" className="up-search" value={query} placeholder="Search for courses" onChange={setQuery} />
            <Button variant="outlined-2" className="ui-disabled" disabled icon={<CsvIcon size={20} color="currentColor" />}>
              Download List
            </Button>
          </div>

          {/* Smart filters */}
          <CourseFilters
            courses={COURSES}
            active={filterActive}
            values={filterValues}
            expanded={filtersExpanded}
            onAdd={addFilter}
            onRemove={removeFilter}
            onSetValue={setFilterValue}
            onClear={clearFilters}
            onToggleExpanded={() => setFiltersExpanded((e) => !e)}
          />

          {/* Course Progress table */}
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
        </div>
      </main>

      {selected.size > 0 && (
        <BulkActionBar count={selected.size} onClear={() => setSelected(new Set())}>
          <button type="button" className="bulk-bar-btn bulk-bar-btn--primary" onClick={sendReminder}>
            Send Reminder
          </button>
          <RowActionsMenu
            items={BULK_MENU_ITEMS}
            onSelect={handleBulkAction}
            placement="top"
            caret={false}
            ariaLabel="Bulk actions"
            triggerClassName="bulk-bar-btn bulk-bar-btn--outlined"
            triggerContent={<>Actions<ArrowDown2 size={16} color="currentColor" variant="Linear" className="bulk-bar-chevron" /></>}
          />
        </BulkActionBar>
      )}

      <ToastContainer toasts={toasts} />
    </div>
  )
}

export default UserProfile
