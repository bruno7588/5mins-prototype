import { useMemo, useState } from 'react'
import { Add, ArrowDown2 } from 'iconsax-react'
import CsvIcon from '../../components/icons/CsvIcon'
import Button from '../../components/Button/Button'
import ContentSwitcher from '@/components/ContentSwitcher/ContentSwitcher'
import { Table, type Column } from '@/components/Table/Table'
import Dropdown from '@/components/Dropdown/Dropdown'
import EmptyState from '@/components/EmptyState/EmptyState'
import certificatesIllustration from '@/assets/empty-state-illustrations/certificates.svg'
import ExternalRecordsTable from '@/pages/learning-records/components/ExternalTraining/ExternalRecordsTable'
import { dueRank, dueState, useExternalTraining } from '@/data/externalTraining'
import { teamProfiles } from './MyTeam'
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

/* Expiry filter for the manager's read-only list (PRD 3.6, D22). */
const EXPIRY_FILTER = [
  { value: 'all', label: 'All' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'due-soon', label: 'Due soon' },
]

function LearningRecordsTab() {
  const [activeChip, setActiveChip] = useState<ChipType>('5mins')
  const [expiry, setExpiry] = useState('all')
  const { records } = useExternalTraining()

  /* Read-only for managers (D22): their own team only, overdue and due soon first. */
  const teamRecords = useMemo(
    () =>
      records
        .filter((r) => r.personId in teamProfiles) // the manager's team: everyone on the My Team roster. Read at render, not module load: MyTeam imports this file.
        .filter((r) => expiry === 'all' || dueState(r, records) === expiry)
        .sort(
          (a, b) =>
            dueRank(dueState(a, records)) - dueRank(dueState(b, records)) || b.completionDate.localeCompare(a.completionDate),
        ),
    [records, expiry],
  )

  return (
    <section className="lr" aria-label="Learning Records">
      {/* Actions bar */}
      <div className="lr__actions">
        <ContentSwitcher
          items={[
            { key: '5mins', label: '5Mins Courses' },
            { key: 'external', label: 'External Training' },
          ]}
          activeKey={activeChip}
          onChange={(key) => setActiveChip(key as ChipType)}
          ariaLabel="Learning records type"
        />
        <div className="lr__actions-right">
          {activeChip === 'external' && (
            <Dropdown
              label="Expiry"
              labelPlacement="start"
              options={EXPIRY_FILTER}
              value={expiry}
              onChange={setExpiry}
              className="lr__expiry-filter"
            />
          )}
          {/* Download Report holds the far right edge whatever else shows beside it. */}
          <Button variant="outlined-2" icon={<CsvIcon size={20} color="currentColor" />}>
            Download Report
          </Button>
        </div>
      </div>

      {activeChip === '5mins' ? (
        <>
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
          <Table
            columns={recordColumns}
            rows={mockData}
            getRowKey={(row) => row.id}
            pagination={{ from: 1, to: 10, total: 28 }}
          />
        </>
      ) : teamRecords.length ? (
        // Read-only: no Add, no row actions (D22). Download works.
        <ExternalRecordsTable rows={teamRecords} all={records} showDuration={false} />
      ) : (
        <EmptyState
          illustration={<img src={certificatesIllustration} alt="" width={72} height={72} />}
          title={expiry === 'all' ? 'No external training yet' : 'Nothing to show'}
          description={
            expiry === 'all'
              ? 'Your admin records training done outside 5Mins from the certificate.'
              : 'No one in your team matches this expiry filter.'
          }
        />
      )}
    </section>
  )
}

export default LearningRecordsTab
