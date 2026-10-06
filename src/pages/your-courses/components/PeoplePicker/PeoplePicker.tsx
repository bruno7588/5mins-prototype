import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Add,
  ArrowDown,
  ArrowDown2,
  Briefcase,
  Location,
  People,
  Profile2User,
  Setting4,
  UserAdd,
  UserEdit,
  UserTick,
} from 'iconsax-react'
import Button from '@/components/Button/Button'
import Badge from '@/components/Badge/Badge'
import Checkbox from '@/components/Checkbox/Checkbox'
import Chip from '@/components/Chip/Chip'
import CloseButton from '@/components/CloseButton/CloseButton'
import Collapse from '@/components/Collapse/Collapse'
import Dropdown, { type DropdownOption } from '@/components/Dropdown/Dropdown'
import Search from '@/components/Search/Search'
import Table, { type Column } from '@/components/Table/Table'
import Tooltip from '@/components/Tooltip/Tooltip'
import FilterListbox, { type FilterGroup, type FilterItem } from '@/pages/learning-records/components/FilterListbox/FilterListbox'
import FilterMultiSelect from '@/pages/learning-records/components/FilterControls/FilterMultiSelect'
import { COHORTS, COMPANY, JOB_ROLES, PEOPLE, REGIONS, TEAMS, type CohortRow, type PersonRow } from '@/data/people'
import { isActivelyEnrolled } from '@/data/enrolments'
import './PeoplePicker.css'

/* People step shared by "Enrol people to your course" (one course) and
   "Assign courses" (several). Picks are a draft until Select People commits
   them (DES-332 D7). Multi-course Status per docs/prd/DES-332-status-research.md. */

export type PickerMode = 'all' | 'people' | 'teams' | 'managers' | 'cohorts'

const MODE_LABELS: Record<PickerMode, string> = {
  all: 'All',
  people: 'People',
  teams: 'Teams',
  managers: 'Managers',
  cohorts: 'Cohorts',
}

const PAGE_SIZE = 5

const opt = (labels: string[]): DropdownOption[] =>
  labels.map((l) => ({ value: l.toLowerCase().replace(/[^a-z0-9]+/g, '-'), label: l }))

const FILTER_GROUPS: FilterGroup[] = [
  {
    section: 'Person',
    items: [
      { id: 'enrolment', title: 'Enrolment', description: 'Filter by whether the learner is already enrolled', Icon: UserAdd },
      { id: 'team', title: 'Team', description: "Filter by the learner's assigned team", Icon: Profile2User },
      { id: 'cohort', title: 'Cohort', description: 'Filter by cohort membership', Icon: People },
      { id: 'region', title: 'Region', description: "Filter by the learner's region", Icon: Location },
      { id: 'job-role', title: 'Job Role', description: "Filter by the learner's job role", Icon: Briefcase },
      { id: 'is-manager', title: 'Is Manager', description: 'Filter by whether a learner is a manager', Icon: UserEdit },
    ],
  },
  {
    section: 'Custom Fields',
    items: [
      { id: 'account-type', title: 'Account Type', Icon: Setting4 },
      { id: 'contract-type', title: 'Contract Type', Icon: Setting4 },
    ],
  },
]

const FILTER_BY_ID: Record<string, FilterItem & { section: string }> = Object.fromEntries(
  FILTER_GROUPS.flatMap((g) => g.items.map((i) => [i.id, { ...i, section: g.section }])),
)

type FilterControl =
  | { kind: 'single'; options: DropdownOption[]; placeholder: string }
  | { kind: 'multi'; options: DropdownOption[]; placeholder: string }

// Enrolment values: "enrolled" means enrolled in every selected course, so the
// single-course "Enrolled" and the multi-course "Enrolled in all" share it.
const ENROLMENT_SINGLE: DropdownOption[] = [
  { value: 'not-enrolled', label: 'Not enrolled' },
  { value: 'enrolled', label: 'Enrolled' },
]
const ENROLMENT_MULTI: DropdownOption[] = [
  { value: 'not-enrolled', label: 'Not enrolled' },
  { value: 'enrolled-in-some', label: 'Enrolled in some' },
  { value: 'enrolled', label: 'Enrolled in all' },
]

const BASE_CONTROLS: Record<string, FilterControl> = {
  team: { kind: 'multi', options: opt(TEAMS), placeholder: 'Select teams' },
  cohort: { kind: 'multi', options: COHORTS.map((c) => ({ value: c.id, label: c.name })), placeholder: 'Select cohorts' },
  region: { kind: 'multi', options: opt(REGIONS), placeholder: 'Select regions' },
  'job-role': { kind: 'multi', options: opt(JOB_ROLES), placeholder: 'Select job roles' },
  'is-manager': { kind: 'single', options: opt(['Yes', 'No']), placeholder: 'Select' },
  'account-type': { kind: 'single', options: opt(['Standard', 'Manager', 'Administrator']), placeholder: 'Select account type' },
  'contract-type': { kind: 'single', options: opt(['Full-time', 'Part-time', 'Contractor', 'Seasonal']), placeholder: 'Select contract type' },
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-')

export type FilterValue = string | string[]

interface TeamRow {
  id: string
  name: string
}

const TEAM_ROWS: TeamRow[] = TEAMS.map((t) => ({ id: slug(t), name: t }))

interface Props {
  /** The courses being enrolled into; Status and selectability follow them. */
  courseIds: string[]
  courseNames: Record<string, string>
  modes: PickerMode[]
  initialFilters?: Record<string, FilterValue>
  committedIds: string[]
  /** `leftOut`: people a group pick reached who are already enrolled in every course (D18). */
  onCommit: (ids: string[], leftOut: number) => void
  /** Reports how many people the draft picks would enrol, as they change. */
  onDraftChange?: (count: number) => void
  /** Limited Admins only see people inside their scope (D8). */
  inScope?: (p: PersonRow) => boolean
}

function PeoplePicker({ courseIds, courseNames, modes, initialFilters = {}, committedIds, onCommit, onDraftChange, inScope }: Props) {
  const [mode, setMode] = useState<PickerMode>(modes[0])

  const [filters, setFilters] = useState<Record<string, FilterValue>>(initialFilters)
  const [filtersExpanded, setFiltersExpanded] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const headerAddRef = useRef<HTMLDivElement>(null)
  const bottomAddRef = useRef<HTMLDivElement>(null)

  const [allSelected, setAllSelected] = useState(false)
  const [selectedPeople, setSelectedPeople] = useState<Set<string>>(new Set())
  const [selectedTeams, setSelectedTeams] = useState<Set<string>>(new Set())
  const [selectedCohorts, setSelectedCohorts] = useState<Set<string>>(new Set())

  const [query, setQuery] = useState('')
  const [page, setPage] = useState(0)
  const [sortDesc, setSortDesc] = useState(false)

  const single = courseIds.length === 1
  const courseKey = courseIds.join('|')

  // How many of the selected courses each person is actively enrolled in.
  const enrolledIn = useMemo(() => {
    const map = new Map<string, string[]>()
    PEOPLE.forEach((p) => map.set(p.id, courseIds.filter((c) => isActivelyEnrolled(p, c))))
    return map
    // courseKey stands in for the courseIds array identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseKey])

  const isFull = (p: PersonRow) => courseIds.length > 0 && enrolledIn.get(p.id)!.length === courseIds.length
  const selectable = (p: PersonRow) => !isFull(p)

  const enrolmentField = (p: PersonRow) => {
    const n = enrolledIn.get(p.id)!.length
    return n === 0 ? 'not-enrolled' : n === courseIds.length ? 'enrolled' : 'enrolled-in-some'
  }

  const FIELD: Record<string, (p: PersonRow) => string> = {
    enrolment: enrolmentField,
    team: (p) => slug(p.team),
    cohort: (p) => p.cohortId,
    region: (p) => slug(p.region),
    'job-role': (p) => slug(p.jobRole),
    'is-manager': (p) => (p.isManager ? 'yes' : 'no'),
  }

  const controls: Record<string, FilterControl> = {
    ...BASE_CONTROLS,
    enrolment: { kind: 'single', options: single ? ENROLMENT_SINGLE : ENROLMENT_MULTI, placeholder: 'Select enrolment' },
  }

  const matches = (p: PersonRow) =>
    Object.entries(filters).every(([id, v]) => {
      const field = FIELD[id]
      if (!field) return true
      if (Array.isArray(v)) return v.length === 0 || v.includes(field(p))
      return !v || field(p) === v
    })

  const pool = useMemo(() => (inScope ? PEOPLE.filter(inScope) : PEOPLE), [inScope])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const filteredPeople = useMemo(() => pool.filter(matches), [pool, filters, enrolledIn])

  const activeIds = Object.keys(filters)
  const availableGroups = useMemo(
    () =>
      FILTER_GROUPS.map((g) => ({ ...g, items: g.items.filter((i) => !(i.id in filters)) })).filter(
        (g) => g.items.length > 0,
      ),
    [filters],
  )

  // Members a team or cohort would enrol: in scope and not enrolled in everything.
  const teamMembers = (id: string) => pool.filter((p) => slug(p.team) === id && selectable(p))
  const cohortMembers = (id: string) => pool.filter((p) => p.cohortId === id && selectable(p))

  // Everyone the draft would enrol, counted once across every route (AC 8),
  // plus the fully enrolled people those group routes reached and left out.
  const { draftIds, leftOut } = useMemo(() => {
    const ids = new Set<string>(selectedPeople)
    const out = new Set<string>()
    const reach = (p: PersonRow) => (selectable(p) ? ids.add(p.id) : out.add(p.id))
    if (allSelected) filteredPeople.forEach(reach)
    selectedTeams.forEach((t) => pool.filter((p) => slug(p.team) === t).forEach(reach))
    selectedCohorts.forEach((c) => pool.filter((p) => p.cohortId === c).forEach(reach))
    return { draftIds: ids, leftOut: out.size }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allSelected, filteredPeople, selectedPeople, selectedTeams, selectedCohorts, enrolledIn])

  useEffect(() => {
    onDraftChange?.(draftIds.size)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftIds.size])

  const committed = useMemo(() => new Set(committedIds), [committedIds])
  const draftMatchesCommitted = draftIds.size === committed.size && [...draftIds].every((id) => committed.has(id))

  const resetPage = () => setPage(0)
  const switchMode = (m: PickerMode) => {
    setMode(m)
    setQuery('')
    resetPage()
  }

  const addFilter = (id: string) => {
    setFilters((prev) => ({ ...prev, [id]: controls[id]?.kind === 'multi' ? [] : '' }))
    setAddOpen(false)
    setFiltersExpanded(true)
    resetPage()
  }
  const setFilter = (id: string, value: FilterValue) => {
    setFilters((prev) => ({ ...prev, [id]: value }))
    resetPage()
  }
  const removeFilter = (id: string) => {
    setFilters((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    resetPage()
  }

  const toggleIn = (setter: typeof setSelectedPeople, id: string) =>
    setter((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  /* ── Lists per mode ── */
  const q = query.trim().toLowerCase()
  const byName = (a: { name: string }, b: { name: string }) =>
    sortDesc ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name)

  const listedPeople = useMemo(() => {
    const base = mode === 'managers' ? filteredPeople.filter((p) => p.isManager) : filteredPeople
    const rows = q ? base.filter((p) => p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q)) : base
    return [...rows].sort(byName)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredPeople, mode, q, sortDesc])

  const listedTeams = q ? TEAM_ROWS.filter((t) => t.name.toLowerCase().includes(q)) : TEAM_ROWS
  const listedCohorts = q ? COHORTS.filter((c) => c.name.toLowerCase().includes(q)) : COHORTS

  const slice = <T,>(rows: T[]) => rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const visiblePeople = slice(listedPeople)
  const visibleTeams = slice(listedTeams)
  const visibleCohorts = slice(listedCohorts)

  const selectableVisible = visiblePeople.filter(selectable)
  const pageAllChecked = selectableVisible.length > 0 && selectableVisible.every((p) => selectedPeople.has(p.id))
  const pageSomeChecked = selectableVisible.some((p) => selectedPeople.has(p.id))
  const togglePage = () =>
    setSelectedPeople((prev) => {
      const next = new Set(prev)
      selectableVisible.forEach((p) => (pageAllChecked ? next.delete(p.id) : next.add(p.id)))
      return next
    })

  const groupPage = <T extends { id: string }>(rows: T[], set: Set<string>, setter: typeof setSelectedTeams) => ({
    all: rows.length > 0 && rows.every((r) => set.has(r.id)),
    some: rows.some((r) => set.has(r.id)),
    toggle: () =>
      setter((prev) => {
        const next = new Set(prev)
        const all = rows.every((r) => prev.has(r.id))
        rows.forEach((r) => (all ? next.delete(r.id) : next.add(r.id)))
        return next
      }),
  })
  const teamsPage = groupPage(visibleTeams, selectedTeams, setSelectedTeams)
  const cohortsPage = groupPage(visibleCohorts, selectedCohorts, setSelectedCohorts)

  /* ── Rendering helpers ── */
  const renderAddButton = (ref: typeof bottomAddRef, isOpen: boolean) => (
    <div className="ppk-filter-add-wrap" ref={ref}>
      <Button
        variant="text"
        size="md"
        icon={<Add size={20} color="currentColor" variant="Linear" />}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={availableGroups.length === 0}
        onClick={() => setAddOpen((o) => !o)}
      >
        Add Filter
      </Button>
      <FilterListbox
        open={isOpen}
        onClose={() => setAddOpen(false)}
        onSelect={addFilter}
        anchorRef={ref}
        groups={availableGroups}
      />
    </div>
  )

  const removeButton = (id: string) => (
    <CloseButton size={16} ariaLabel={`Remove ${FILTER_BY_ID[id].title} filter`} onClick={() => removeFilter(id)} />
  )

  const renderControl = (id: string) => {
    const ctrl = controls[id]
    const value = filters[id]
    if (ctrl.kind === 'multi') {
      // The � rides in the field row, 8px after the input; .fms keeps a 260px
      // minimum width that would otherwise leave a gap before it.
      return (
        <FilterMultiSelect
          options={ctrl.options}
          value={Array.isArray(value) ? value : []}
          placeholder={ctrl.placeholder}
          onChange={(v) => setFilter(id, v)}
          trailing={removeButton(id)}
        />
      )
    }
    return (
      <Dropdown
        size="sm"
        className="ppk-filter-dropdown"
        options={ctrl.options}
        value={typeof value === 'string' && value ? value : undefined}
        placeholder={ctrl.placeholder}
        onChange={(v) => setFilter(id, v)}
      />
    )
  }

  const statusBadge = (p: PersonRow) => {
    const inCourses = enrolledIn.get(p.id)!
    const n = courseIds.length
    if (inCourses.length === 0) {
      return <Badge type="informative" label="Not enrolled" customIcon={<UserAdd size={16} color="currentColor" variant="Linear" />} />
    }
    if (inCourses.length === n) {
      return (
        <Badge
          type="success"
          label={single ? 'Enrolled' : 'Enrolled in all'}
          customIcon={<UserTick size={16} color="currentColor" variant="Linear" />}
        />
      )
    }
    const names = (ids: string[]) => ids.map((id) => courseNames[id] ?? id).join(', ')
    const missing = courseIds.filter((c) => !inCourses.includes(c))
    const sentence = `Enrolled in ${names(inCourses)}. Not yet in ${names(missing)}.`
    return (
      <Tooltip text={sentence} position="Top" icon={false}>
        <span className="ppk-status-partial" tabIndex={0} aria-label={sentence}>
          <Badge type="informative" label={`Enrolled in ${inCourses.length} of ${n}`} />
        </span>
      </Tooltip>
    )
  }

  const peopleColumns: Column<PersonRow>[] = [
    {
      key: 'name',
      header: (
        <span className="ppk-th-sort">
          Name
          <ArrowDown
            size={16}
            color="currentColor"
            variant="Linear"
            className={`ppk-sort${sortDesc ? ' ppk-sort--desc' : ''}`}
          />
        </span>
      ),
      sortable: true,
      width: '1 0 240px',
      render: (p) => (
        <span className="tbl-stack">
          <span className="primary">{p.name}</span>
          <span className="supporting">{p.email}</span>
        </span>
      ),
    },
    { key: 'team', header: 'Team', width: '0 0 200px', render: (p) => p.team },
    { key: 'status', header: 'Status', width: '0 0 180px', align: 'right', render: statusBadge },
  ]

  // With one course the count reads as "not enrolled"; with several, as people
  // who can still be enrolled in at least one course.
  const countHeader = single ? 'Not enrolled' : 'People'
  const groupColumns = <T extends { id: string; name: string }>(
    label: string,
    members: (id: string) => PersonRow[],
  ): Column<T>[] => [
    { key: 'name', header: label, width: '1 0 240px', render: (r) => r.name },
    { key: 'members', header: countHeader, width: '0 0 160px', align: 'right', render: (r) => members(r.id).length },
  ]

  const pagination = (total: number) => ({
    from: total === 0 ? 0 : page * PAGE_SIZE + 1,
    to: Math.min(total, (page + 1) * PAGE_SIZE),
    total,
    onPrev: () => setPage(page - 1),
    onNext: () => setPage(page + 1),
  })

  const searchFor = (placeholder: string) => (
    <Search
      size="M"
      value={query}
      placeholder={placeholder}
      ariaLabel={placeholder}
      onChange={(v) => {
        setQuery(v)
        resetPage()
      }}
    />
  )

  // Commits the draft; only committed people count towards the enrolment. Under a
  // table it sits on the pagination line (footerStart); otherwise on its own.
  const stepActions = (
    <Button variant="outlined" size="md" disabled={draftMatchesCommitted} onClick={() => onCommit([...draftIds], leftOut)}>
      {draftIds.size === 0 ? 'Select People' : `Select ${draftIds.size} ${draftIds.size === 1 ? 'Person' : 'People'}`}
    </Button>
  )
  const tableShown =
    ((mode === 'people' || mode === 'managers') && visiblePeople.length > 0) ||
    (mode === 'teams' && visibleTeams.length > 0) ||
    (mode === 'cohorts' && visibleCohorts.length > 0)

  const peopleTable = (
    <Table
      columns={peopleColumns}
      rows={visiblePeople}
      getRowKey={(p) => p.id}
      selectable
      isSelected={(p) => selectedPeople.has(p.id) || (allSelected && selectable(p))}
      isRowSelectable={(p) => selectable(p) && !allSelected}
      getRowState={(p) => (selectable(p) ? 'enabled' : 'disabled')}
      onRowClick={(p) => selectable(p) && !allSelected && toggleIn(setSelectedPeople, p.id)}
      onToggleRow={(p) => toggleIn(setSelectedPeople, p.id)}
      allSelected={allSelected || pageAllChecked}
      selectAllIndeterminate={!allSelected && !pageAllChecked && pageSomeChecked}
      selectAllDisabled={allSelected || selectableVisible.length === 0}
      onToggleAll={togglePage}
      onSort={() => setSortDesc((d) => !d)}
      pagination={pagination(listedPeople.length)}
      footerStart={stepActions}
    />
  )

  return (
    <div className="ppk">
      {/* Filters */}
      <div className="ppk-filters">
        <div className="ppk-filters-head">
          <button
            type="button"
            className="ppk-filters-toggle"
            aria-expanded={filtersExpanded}
            onClick={() => {
              setFiltersExpanded((e) => !e)
              setAddOpen(false)
            }}
          >
            <span className="ppk-filters-label">Filters</span>
            <span className="ppk-filters-badge">{activeIds.length}</span>
          </button>

          <div className={`ppk-filters-collapsed${filtersExpanded ? ' ppk-filters-collapsed--hidden' : ''}`}>
            {activeIds.length === 0 ? (
              renderAddButton(headerAddRef, addOpen && !filtersExpanded)
            ) : (
              <div className="ppk-pills">
                {activeIds.map((id) => {
                  const meta = FILTER_BY_ID[id]
                  return (
                    <Chip
                      key={id}
                      label={meta.title}
                      customIconLeft={<meta.Icon size={16} color="currentColor" variant="Linear" />}
                      iconRight
                      onClick={() => setFiltersExpanded(true)}
                      onDismiss={() => removeFilter(id)}
                    />
                  )
                })}
              </div>
            )}
          </div>

          <button
            type="button"
            className="ppk-filters-chevron-btn"
            aria-label={filtersExpanded ? 'Collapse filters' : 'Expand filters'}
            aria-expanded={filtersExpanded}
            onClick={() => {
              setFiltersExpanded((e) => !e)
              setAddOpen(false)
            }}
          >
            <span className={`ppk-filters-chevron${filtersExpanded ? ' ppk-filters-chevron--open' : ''}`}>
              <ArrowDown2 size={16} color="var(--text-tertiary)" variant="Linear" />
            </span>
          </button>
        </div>

        <Collapse open={filtersExpanded}>
          <div className="ppk-filters-body">
            {activeIds.map((id) => {
              const meta = FILTER_BY_ID[id]
              const label = meta.section === 'Custom Fields' ? meta.title : `${meta.title} is`
              return (
                <div className="ppk-filter-row" key={id}>
                  <span className="ppk-filter-icon">
                    <meta.Icon size={20} color="var(--text-secondary)" variant="Linear" />
                  </span>
                  <span className="ppk-filter-label">{label}</span>
                  {renderControl(id)}
                  {controls[id].kind !== 'multi' && <span className="ppk-filter-remove-slot">{removeButton(id)}</span>}
                </div>
              )
            })}

            <div className="ppk-filter-actions">
              {renderAddButton(bottomAddRef, addOpen && filtersExpanded)}
              <Button
                variant="text"
                size="md"
                className="ppk-filter-clear"
                disabled={activeIds.length === 0}
                onClick={() => {
                  setFilters({})
                  resetPage()
                }}
              >
                Clear All
              </Button>
            </div>
          </div>
        </Collapse>
      </div>

      <div className="ppk-chips">
        {modes.map((m) => (
          <Chip key={m} label={MODE_LABELS[m]} selected={mode === m} onClick={() => switchMode(m)} />
        ))}
      </div>

      {mode === 'all' && (
        /* A single DS table row (table.md), so padding, hover and selected
           states match the tables. */
        <div
          className={`tbl-row is-clickable${allSelected ? ' is-selected' : ''}`}
          onClick={() => setAllSelected((v) => !v)}
        >
          <div className="tbl-cell ppk-all-check" onClick={(e) => e.stopPropagation()}>
            <Checkbox checked={allSelected} onChange={() => setAllSelected((v) => !v)} />
          </div>
          <div className="tbl-cell">
            All {COMPANY} people ({filteredPeople.filter(selectable).length})
          </div>
        </div>
      )}

      {(mode === 'people' || mode === 'managers') && (
        <>
          {searchFor(mode === 'managers' ? 'Search for managers' : 'Search for people')}
          {visiblePeople.length === 0 ? <p className="ppk-empty">No people match these filters.</p> : peopleTable}
        </>
      )}

      {mode === 'teams' && (
        <>
          {searchFor('Search for teams')}
          {visibleTeams.length === 0 ? (
            <p className="ppk-empty">No teams match “{query.trim()}”.</p>
          ) : (
            <Table
              columns={groupColumns<TeamRow>('Team', teamMembers)}
              rows={visibleTeams}
              getRowKey={(t) => t.id}
              selectable
              isSelected={(t) => selectedTeams.has(t.id)}
              onRowClick={(t) => toggleIn(setSelectedTeams, t.id)}
              onToggleRow={(t) => toggleIn(setSelectedTeams, t.id)}
              allSelected={teamsPage.all}
              selectAllIndeterminate={!teamsPage.all && teamsPage.some}
              onToggleAll={teamsPage.toggle}
              pagination={pagination(listedTeams.length)}
              footerStart={stepActions}
            />
          )}
        </>
      )}

      {mode === 'cohorts' && (
        <>
          {searchFor('Search for cohorts')}
          {visibleCohorts.length === 0 ? (
            <p className="ppk-empty">No cohorts match “{query.trim()}”.</p>
          ) : (
            <Table
              columns={groupColumns<CohortRow>('Cohort', cohortMembers)}
              rows={visibleCohorts}
              getRowKey={(c) => c.id}
              selectable
              isSelected={(c) => selectedCohorts.has(c.id)}
              onRowClick={(c) => toggleIn(setSelectedCohorts, c.id)}
              onToggleRow={(c) => toggleIn(setSelectedCohorts, c.id)}
              allSelected={cohortsPage.all}
              selectAllIndeterminate={!cohortsPage.all && cohortsPage.some}
              onToggleAll={cohortsPage.toggle}
              pagination={pagination(listedCohorts.length)}
              footerStart={stepActions}
            />
          )}
        </>
      )}

      {!tableShown && <div className="ppk-step-actions">{stepActions}</div>}
    </div>
  )
}

export default PeoplePicker
