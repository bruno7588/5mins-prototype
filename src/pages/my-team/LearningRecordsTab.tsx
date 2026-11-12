import { useMemo, useRef, useState, type ReactNode } from 'react'
import { Book1, Buildings2, Calendar, Category, DocumentDownload, Global, People, Profile, TickCircle } from 'iconsax-react'
import Tooltip from '@/components/Tooltip/Tooltip'
import CsvIcon from '../../components/icons/CsvIcon'
import Button from '../../components/Button/Button'
import ContentSwitcher from '@/components/ContentSwitcher/ContentSwitcher'
import { Table, type Column } from '@/components/Table/Table'
import EmptyState from '@/components/EmptyState/EmptyState'
import Search from '@/components/Search/Search'
import FilterBar, { FilterBarAddButton, type FilterBarFilter } from '@/components/FilterBar/FilterBar'
import certificatesIllustration from '@/assets/empty-state-illustrations/certificates.svg'
import noResults from '@/assets/empty-state-illustrations/no-results.svg'
import FilterListbox, { type FilterGroup } from '@/pages/learning-records/components/FilterListbox/FilterListbox'
import FilterMultiSelect from '@/pages/learning-records/components/FilterControls/FilterMultiSelect'
import ExternalRecordsTable from '@/pages/learning-records/components/ExternalTraining/ExternalRecordsTable'
import {
  dueRank,
  dueState,
  personById,
  recordProviderName,
  recordTrainingName,
  useExternalTraining,
  type ExternalRecord,
} from '@/data/externalTraining'
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

/* ── Filter bar (DS FilterBar, the same set-up as the admin Learning Records page) ── */

type FilterMeta = Record<string, { title: string; description: string; Icon: typeof Calendar }>
type Option = { value: string; label: string }

/* Options come from the rows, so every option finds at least one. */
const uniqueOptions = (list: Option[]) =>
  [...new Map(list.filter((o) => o.value).map((o) => [o.value, o])).values()].sort((a, b) => a.label.localeCompare(b.label))

/* One Filter bar's state: which filters are on, their values, and the bar itself. */
function useFilterBar<T>(
  meta: FilterMeta,
  groups: FilterGroup[],
  optionsFor: (id: string) => Option[],
  valueOf: (id: string, row: T) => string,
): { bar: ReactNode; match: (row: T) => boolean; hasFilters: boolean } {
  const [active, setActive] = useState<string[]>([])
  const [values, setValues] = useState<Record<string, string[]>>({})
  const [expanded, setExpanded] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const headerAddRef = useRef<HTMLDivElement>(null)
  const bottomAddRef = useRef<HTMLDivElement>(null)

  const addFilter = (id: string) => {
    setActive((prev) => (prev.includes(id) ? prev : [...prev, id]))
    setMenuOpen(false)
    setExpanded(true)
  }
  const removeFilter = (id: string) => {
    setActive((prev) => prev.filter((f) => f !== id))
    setValues((prev) => ({ ...prev, [id]: [] }))
  }
  const pillLabel = (id: string) => {
    const v = values[id] ?? []
    if (v.length !== 1) return meta[id].title
    return optionsFor(id).find((o) => o.value === v[0])?.label ?? meta[id].title
  }

  const filters: FilterBarFilter[] = active.map((id) => ({
    id,
    title: meta[id].title,
    Icon: meta[id].Icon,
    pillLabel: pillLabel(id),
    control: (
      <FilterMultiSelect
        options={optionsFor(id)}
        value={values[id] ?? []}
        placeholder={`Select ${meta[id].title.toLowerCase()}`}
        onChange={(v) => setValues((prev) => ({ ...prev, [id]: v }))}
      />
    ),
  }))

  const bar = (
    <FilterBar
      filters={filters}
      expanded={expanded}
      onToggleExpanded={() => {
        setExpanded((e) => !e)
        setMenuOpen(false)
      }}
      onRemove={removeFilter}
      onClearAll={() => {
        setActive([])
        setValues({})
      }}
      renderAddFilter={(placement) => {
        // Only the live instance gets an open listbox so their click-outside handlers don't clash.
        const ref = placement === 'header' ? headerAddRef : bottomAddRef
        const open = menuOpen && (placement === 'header' ? !expanded : expanded)
        return (
          <FilterBarAddButton ref={ref} open={open} onClick={() => setMenuOpen((o) => !o)}>
            <FilterListbox open={open} onClose={() => setMenuOpen(false)} onSelect={addFilter} anchorRef={ref} groups={groups} />
          </FilterBarAddButton>
        )
      }}
    />
  )

  const match = (row: T) => active.every((id) => !values[id]?.length || values[id].includes(valueOf(id, row)))
  return { bar, match, hasFilters: active.some((id) => values[id]?.length) }
}

/* 5Mins Courses: the course records of the manager's team. */
const COURSE_META: FilterMeta = {
  learner: { title: 'Learner', description: 'Filter by the person on the course', Icon: Profile },
  team: { title: 'Team', description: 'Filter by team', Icon: People },
  region: { title: 'Region', description: 'Filter by region', Icon: Global },
  course: { title: 'Course', description: 'Filter by course', Icon: Book1 },
  category: { title: 'Category', description: 'Filter by course category', Icon: Category },
  status: { title: 'Status', description: 'Completed or failed', Icon: TickCircle },
}
const COURSE_GROUPS: FilterGroup[] = [
  { section: 'Person', items: ['learner', 'team', 'region'].map((id) => ({ id, ...COURSE_META[id] })) },
  { section: 'Course', items: ['course', 'category'].map((id) => ({ id, ...COURSE_META[id] })) },
  { section: 'Status', items: [{ id: 'status', ...COURSE_META.status }] },
]
const courseValue = (id: string, r: LearningRecord): string =>
  id === 'learner' ? r.name : (r[id as 'team' | 'region' | 'course' | 'category' | 'status'] as string)

/* External Training: read-only for managers (D22), their own team only. */
const EXTERNAL_META: FilterMeta = {
  learner: { title: 'Learner', description: 'Filter by the person the training belongs to', Icon: Profile },
  course: { title: 'Course', description: 'Filter by approved course', Icon: Book1 },
  provider: { title: 'Provider', description: 'Filter by training provider', Icon: Buildings2 },
  retraining: { title: 'Expiry', description: 'Overdue, due soon, valid or no expiry', Icon: Calendar },
  result: { title: 'Result', description: 'Passed or not passed', Icon: TickCircle },
}
const EXTERNAL_GROUPS: FilterGroup[] = [
  { section: 'Person', items: [{ id: 'learner', ...EXTERNAL_META.learner }] },
  { section: 'Training', items: ['course', 'provider'].map((id) => ({ id, ...EXTERNAL_META[id] })) },
  { section: 'Status', items: ['retraining', 'result'].map((id) => ({ id, ...EXTERNAL_META[id] })) },
]
const RETRAINING_OPTIONS: Option[] = [
  { value: 'overdue', label: 'Overdue' },
  { value: 'due-soon', label: 'Due soon' },
  { value: 'upcoming', label: 'Valid' },
  { value: 'none', label: 'No expiry' },
]
const RESULT_OPTIONS: Option[] = [
  { value: 'Passed', label: 'Passed' },
  { value: 'Not Passed', label: 'Not Passed' },
]

function LearningRecordsTab({ showToast }: { showToast: (type: 'success', message: string) => void }) {
  const [activeChip, setActiveChip] = useState<ChipType>('5mins')
  const [query, setQuery] = useState('')
  const { records } = useExternalTraining()

  /* The manager's team: everyone on the My Team roster. Read at render, not module
     load: MyTeam imports this file. */
  const teamAll = useMemo(() => records.filter((r) => r.personId in teamProfiles), [records])

  const courseFilters = useFilterBar<LearningRecord>(
    COURSE_META,
    COURSE_GROUPS,
    (id) => uniqueOptions(mockData.map((r) => ({ value: courseValue(id, r), label: courseValue(id, r) }))),
    courseValue,
  )
  const externalValue = (id: string, r: ExternalRecord): string =>
    id === 'learner'
      ? r.personId
      : id === 'course'
        ? recordTrainingName(r)
        : id === 'provider'
          ? recordProviderName(r)
          : id === 'retraining'
            ? dueState(r, records) ?? 'none'
            : r.result
  const externalFilters = useFilterBar<ExternalRecord>(
    EXTERNAL_META,
    EXTERNAL_GROUPS,
    (id) =>
      id === 'retraining'
        ? RETRAINING_OPTIONS
        : id === 'result'
          ? RESULT_OPTIONS
          : uniqueOptions(
              teamAll.map((r) => ({
                value: externalValue(id, r),
                label: id === 'learner' ? personById(r.personId)?.name ?? r.personId : externalValue(id, r),
              })),
            ),
    externalValue,
  )

  /* Search narrows by person or course name, on top of the filters. */
  const q = query.trim().toLowerCase()
  const hit = (...text: (string | undefined)[]) => !q || text.some((t) => t?.toLowerCase().includes(q))
  const courseRows = mockData.filter((r) => courseFilters.match(r) && hit(r.name, r.email, r.course))
  /* Overdue and due soon first. */
  const teamRecords = teamAll
    .filter((r) => externalFilters.match(r) && hit(personById(r.personId)?.name, recordTrainingName(r)))
    .sort(
      (a, b) =>
        dueRank(dueState(a, records)) - dueRank(dueState(b, records)) || b.completionDate.localeCompare(a.completionDate),
    )

  const withCertificate = teamRecords.filter((r) => r.certificate).length

  const noResultsState = (
    <EmptyState
      illustration={<img src={noResults} alt="" width={72} height={72} />}
      title="No records found"
      description="Try removing a filter."
    />
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
          <Search
            value={query}
            onChange={setQuery}
            placeholder={activeChip === '5mins' ? 'Search learners or courses' : 'Search learners or training'}
            ariaLabel="Search learning records"
            className="lr__search"
          />
          <Button variant="outlined-2" icon={<CsvIcon size={20} color="currentColor" />}>
            Download Report
          </Button>
          {activeChip === 'external' && (
            /* Every certificate the table lists, as one ZIP. The prototype stores no files, so it confirms with a toast. */
            <Tooltip text="No certificates to download" icon={false} disabled={withCertificate > 0}>
              <Button
                variant="outlined-2"
                icon={<DocumentDownload size={20} color="currentColor" variant="Linear" />}
                disabled={!withCertificate}
                onClick={() => showToast('success', `Downloading ${withCertificate} certificate${withCertificate === 1 ? '' : 's'}`)}
              >
                Download Certificates
              </Button>
            </Tooltip>
          )}
        </div>
      </div>

      {activeChip === '5mins' ? (
        <>
          {courseFilters.bar}
          {courseRows.length ? (
            /* The pagination stays a static mock until filters narrow the rows. */
            <Table
              columns={recordColumns}
              rows={courseRows}
              getRowKey={(row) => row.id}
              pagination={
                (courseFilters.hasFilters || q)
                  ? { from: 1, to: courseRows.length, total: courseRows.length }
                  : { from: 1, to: 10, total: 28 }
              }
            />
          ) : (
            noResultsState
          )}
        </>
      ) : teamAll.length ? (
        <>
          {externalFilters.bar}
          {teamRecords.length ? (
            // Read-only: no Add, no row actions (D22). Download works.
            <ExternalRecordsTable
              rows={teamRecords}
              all={records}
              showDuration={false}
              learnerHref={(id) => `/my-team/people/${id}?tab=external-training`}
            />
          ) : (
            noResultsState
          )}
        </>
      ) : (
        <EmptyState
          illustration={<img src={certificatesIllustration} alt="" width={72} height={72} />}
          title="No external training yet"
          description="Your admin records training done outside 5Mins from the certificate."
        />
      )}
    </section>
  )
}

export default LearningRecordsTab
