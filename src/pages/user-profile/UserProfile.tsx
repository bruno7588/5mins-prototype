import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowDown2 } from 'iconsax-react'
import LeftSidebar from '../../components/LeftSidebar/LeftSidebar'
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb'
import Badge from '../../components/Badge/Badge'
import Button from '../../components/Button/Button'
import Search from '../../components/Search/Search'
import Tooltip from '../../components/Tooltip/Tooltip'
import Table, { type Column } from '../../components/Table/Table'
import MoreIcon from '../../components/icons/MoreIcon'
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

const SEGMENTS = 8

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
  const [sortDesc, setSortDesc] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const rows = useMemo(() => {
    const filtered = COURSES.filter((c) => c.course.toLowerCase().includes(query.trim().toLowerCase()))
    const sorted = [...filtered].sort((a, b) => a.startDate.localeCompare(b.startDate))
    return sortDesc ? sorted.reverse() : sorted
  }, [query, sortDesc])

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
      width: '2 1 220px',
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
      header: (
        <span className="up-th-sort">
          Start Date
          <ArrowDown2 size={16} color="currentColor" variant="Linear" className={`up-sort${sortDesc ? ' up-sort--desc' : ''}`} />
        </span>
      ),
      sortable: true,
      width: '0 0 108px',
      render: (row) => <DateCell value={row.startDate} />,
    },
    { key: 'dueDate', header: 'Due Date', width: '0 0 108px', render: (row) => <DateCell value={row.dueDate} /> },
    {
      key: 'progress',
      header: <span className="up-th">Progress<Tooltip position="Top" text="Share of the course the learner has completed." /></span>,
      width: '0 0 150px',
      render: (row) => <ProgressCell value={row.progress} />,
    },
    {
      key: 'score',
      header: <span className="up-th">Score<Tooltip position="Top" text="Latest quiz or assessment score for this course." /></span>,
      width: '0 0 84px',
      render: (row) => (row.score != null ? `${row.score}%` : <span className="up-muted">–</span>),
    },
    {
      key: 'status',
      header: 'Status',
      width: '0 0 140px',
      render: (row) => <Badge type={STATUS_BADGE[row.status]} label={row.status} icon={false} />,
    },
    { key: 'completionDate', header: 'Completion Date', width: '0 0 120px', render: (row) => <DateCell value={row.completionDate} /> },
    {
      key: 'actions',
      header: '',
      width: '0 0 52px',
      align: 'center',
      render: () => (
        <span className="tbl-action is-disabled">
          <span className="icon-btn">
            <MoreIcon size={20} color="var(--text-tertiary)" />
          </span>
        </span>
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
            onSort={() => setSortDesc((s) => !s)}
            pagination={{ from: rows.length ? 1 : 0, to: rows.length, total: rows.length }}
          />
        </div>
      </main>
    </div>
  )
}

export default UserProfile
