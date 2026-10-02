import { useMemo, useRef, useState } from 'react'
import {
  Add,
  ArrowDown,
  ArrowDown2,
  Briefcase,
  Calendar,
  Location,
  People,
  Profile2User,
  Setting4,
  User,
  UserAdd,
  UserEdit,
  UserTick,
} from 'iconsax-react'
import { useOverlayA11y } from '@/hooks/useOverlayA11y'
import Button from '@/components/Button/Button'
import Badge from '@/components/Badge/Badge'
import Checkbox from '@/components/Checkbox/Checkbox'
import Chip from '@/components/Chip/Chip'
import CloseButton from '@/components/CloseButton/CloseButton'
import Collapse from '@/components/Collapse/Collapse'
import Dropdown, { type DropdownOption } from '@/components/Dropdown/Dropdown'
import Search from '@/components/Search/Search'
import Table, { type Column } from '@/components/Table/Table'
import FilterListbox, { type FilterGroup, type FilterItem } from '@/pages/learning-records/components/FilterListbox/FilterListbox'
import FilterMultiSelect from '@/pages/learning-records/components/FilterControls/FilterMultiSelect'
import './EnrolCourseModal.css'

/* Enrol people to a course: full-screen, step rail on the left. Only the
   "Enrol people" step is built; "Set a date" and "Name a sponsor" are shown
   for context but inert (out of scope). */

type Mode = 'all' | 'people' | 'cohorts'

const COMPANY = 'Acme Inc.'
const PAGE_SIZE = 5

const opt = (labels: string[]): DropdownOption[] =>
  labels.map((l) => ({ value: l.toLowerCase().replace(/[^a-z0-9]+/g, '-'), label: l }))

const TEAMS = ['Front Office', 'Food & Beverage', 'Housekeeping', 'Finance', 'Compliance', 'People & Performance']
const REGIONS = ['North America', 'Europe', 'Asia Pacific', 'Middle East']
const JOB_ROLES = ['Receptionist', 'Server', 'Chef', 'Accountant', 'Room Attendant', 'Duty Manager']

interface CohortRow {
  id: string
  name: string
}

const COHORTS: CohortRow[] = [
  { id: 'cohort-1', name: 'New Joiners 2026' },
  { id: 'cohort-2', name: 'Leadership Group Q1 2026' },
  { id: 'cohort-3', name: 'Night Shift Team' },
  { id: 'cohort-4', name: 'Food Safety Champions' },
  { id: 'cohort-5', name: 'Graduate Programme' },
  { id: 'cohort-6', name: 'Regional Managers' },
]

interface PersonRow {
  id: string
  name: string
  email: string
  team: string
  region: string
  jobRole: string
  isManager: boolean
  /** Empty when the person is in no cohort. */
  cohortId: string
  /** Already enrolled in this course; can't be enrolled again. */
  enrolled: boolean
}

const FIRST_NAMES = [
  'Alice', 'Marcus', 'Priya', 'Tom', 'Sofia', 'Daniel', 'Hannah', 'Omar', 'Grace', 'Lucas',
  'Ingrid', 'Carlos', 'Nadia', 'Ethan', 'Yuki', 'Fatima', 'Sven', 'Maria', 'David', 'Emily',
  'Raj', 'Chloe', 'Andre', 'Mei', 'Noah', 'Laura', 'Kenji', 'Julia', 'Ibrahim', 'Fiona',
]
const LAST_NAMES = [
  'Johnson', 'Reid', 'Nair', 'Becker', 'Alvarez', 'Wu', 'Schmidt', 'Haddad', 'Bennett', 'Moreau',
  'Larsson', 'Mendes', 'Petrova', 'Clarke', 'Tanaka', 'Khan', 'Eriksson', 'Costa', 'Okoro', 'Foster',
  'Patel', 'Martin', 'Silva', 'Chen',
]

/** 716 people, 128 of them already enrolled (the course's Enrolments count). */
const HEADCOUNT = 716
const PEOPLE: PersonRow[] = Array.from({ length: HEADCOUNT }, (_, i) => {
  const first = FIRST_NAMES[i % FIRST_NAMES.length]
  const last = LAST_NAMES[Math.floor(i / FIRST_NAMES.length) % LAST_NAMES.length]
  return {
    id: `person-${i + 1}`,
    name: `${first} ${last}`,
    email: `${first}.${last}@acme.com`.toLowerCase(),
    // Vary by surname too, so a name-sorted page mixes teams and regions.
    team: TEAMS[(i + Math.floor(i / FIRST_NAMES.length)) % TEAMS.length],
    region: REGIONS[(i + 2 * Math.floor(i / FIRST_NAMES.length)) % REGIONS.length],
    jobRole: JOB_ROLES[(i * 5) % JOB_ROLES.length],
    isManager: i % 9 === 0,
    cohortId: i % 3 === 0 ? COHORTS[(i / 3) % COHORTS.length].id : '',
    // 37 is coprime with 716, so exactly 128 indices land below 128.
    enrolled: (i * 37) % HEADCOUNT < 128,
  }
})

/* ── Filters ── */

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

const CONTROLS: Record<string, FilterControl> = {
  enrolment: { kind: 'single', options: opt(['Not Enrolled', 'Enrolled']), placeholder: 'Select enrolment' },
  team: { kind: 'multi', options: opt(TEAMS), placeholder: 'Select teams' },
  cohort: { kind: 'multi', options: COHORTS.map((c) => ({ value: c.id, label: c.name })), placeholder: 'Select cohorts' },
  region: { kind: 'multi', options: opt(REGIONS), placeholder: 'Select regions' },
  'job-role': { kind: 'multi', options: opt(JOB_ROLES), placeholder: 'Select job roles' },
  'is-manager': { kind: 'single', options: opt(['Yes', 'No']), placeholder: 'Select' },
  'account-type': { kind: 'single', options: opt(['Standard', 'Manager', 'Administrator']), placeholder: 'Select account type' },
  'contract-type': { kind: 'single', options: opt(['Full-time', 'Part-time', 'Contractor', 'Seasonal']), placeholder: 'Select contract type' },
}

/** Filter id → the person's value it is matched against. Custom fields have no
    mock data, so they don't narrow the list. */
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-')
const FIELD: Record<string, (p: PersonRow) => string> = {
  enrolment: (p) => (p.enrolled ? 'enrolled' : 'not-enrolled'),
  team: (p) => slug(p.team),
  cohort: (p) => p.cohortId,
  region: (p) => slug(p.region),
  'job-role': (p) => slug(p.jobRole),
  'is-manager': (p) => (p.isManager ? 'yes' : 'no'),
}

type FilterValue = string | string[]

const matches = (p: PersonRow, filters: Record<string, FilterValue>) =>
  Object.entries(filters).every(([id, v]) => {
    const field = FIELD[id]
    if (!field) return true
    if (Array.isArray(v)) return v.length === 0 || v.includes(field(p))
    return !v || field(p) === v
  })

/** "Oct 2 to Oct 16, 2026": the default window shown on the (unbuilt) date step. */
function defaultDateRange() {
  const start = new Date()
  const end = new Date(start)
  end.setDate(end.getDate() + 14)
  const md = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${md(start)} to ${md(end)}, ${end.getFullYear()}`
}

interface Props {
  open: boolean
  onClose: () => void
  /** Called on Review & Launch with the number of people enrolled. */
  onEnrol: (count: number) => void
}

function EnrolCourseModal({ open, onClose, onEnrol }: Props) {
  const panelRef = useRef<HTMLDivElement>(null)
  useOverlayA11y(panelRef, open, { onEscape: onClose })

  const [mode, setMode] = useState<Mode>('all')

  // Production opens with "Enrolment is Not Enrolled" already applied.
  const [filters, setFilters] = useState<Record<string, FilterValue>>({ enrolment: 'not-enrolled' })
  const [filtersExpanded, setFiltersExpanded] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const headerAddRef = useRef<HTMLDivElement>(null)
  const bottomAddRef = useRef<HTMLDivElement>(null)

  const [allSelected, setAllSelected] = useState(false)
  const [selectedPeople, setSelectedPeople] = useState<Set<string>>(new Set())
  const [selectedCohorts, setSelectedCohorts] = useState<Set<string>>(new Set())

  const [peopleQuery, setPeopleQuery] = useState('')
  const [cohortQuery, setCohortQuery] = useState('')
  const [peoplePage, setPeoplePage] = useState(0)
  const [cohortPage, setCohortPage] = useState(0)
  const [sortDesc, setSortDesc] = useState(false)
  // Table picks are a draft; only Select People commits them to the enrolment.
  const [confirmedCount, setConfirmedCount] = useState(0)

  const activeIds = Object.keys(filters)
  // Offer only filters that aren't already added.
  const availableGroups = useMemo(
    () =>
      FILTER_GROUPS.map((g) => ({ ...g, items: g.items.filter((i) => !(i.id in filters)) })).filter(
        (g) => g.items.length > 0,
      ),
    [filters],
  )

  const filteredPeople = useMemo(() => PEOPLE.filter((p) => matches(p, filters)), [filters])

  const listedPeople = useMemo(() => {
    const q = peopleQuery.trim().toLowerCase()
    const rows = q
      ? filteredPeople.filter((p) => p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q))
      : filteredPeople
    return [...rows].sort((a, b) => (sortDesc ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name)))
  }, [filteredPeople, peopleQuery, sortDesc])
  const visiblePeople = listedPeople.slice(peoplePage * PAGE_SIZE, (peoplePage + 1) * PAGE_SIZE)

  const listedCohorts = useMemo(() => {
    const q = cohortQuery.trim().toLowerCase()
    return q ? COHORTS.filter((c) => c.name.toLowerCase().includes(q)) : COHORTS
  }, [cohortQuery])
  const visibleCohorts = listedCohorts.slice(cohortPage * PAGE_SIZE, (cohortPage + 1) * PAGE_SIZE)

  // Members a cohort would enrol: its people who aren't enrolled yet.
  const cohortMembers = (id: string) => PEOPLE.filter((p) => p.cohortId === id && !p.enrolled)

  // Everyone the current selection would enrol, de-duplicated across All,
  // hand-picked people and cohorts.
  const selectedCount = useMemo(() => {
    const ids = new Set<string>(selectedPeople)
    if (allSelected) filteredPeople.forEach((p) => !p.enrolled && ids.add(p.id))
    selectedCohorts.forEach((c) => cohortMembers(c).forEach((p) => ids.add(p.id)))
    return ids.size
  }, [allSelected, filteredPeople, selectedPeople, selectedCohorts])

  const resetPages = () => {
    setPeoplePage(0)
    setCohortPage(0)
  }

  const addFilter = (id: string) => {
    setFilters((prev) => ({ ...prev, [id]: CONTROLS[id]?.kind === 'multi' ? [] : '' }))
    setAddOpen(false)
    setFiltersExpanded(true)
    resetPages()
  }
  const setFilter = (id: string, value: FilterValue) => {
    setFilters((prev) => ({ ...prev, [id]: value }))
    resetPages()
  }
  const removeFilter = (id: string) => {
    setFilters((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    resetPages()
  }

  const toggleIn = (setter: typeof setSelectedPeople, id: string) =>
    setter((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const selectableVisible = visiblePeople.filter((p) => !p.enrolled)
  const pageAllChecked = selectableVisible.length > 0 && selectableVisible.every((p) => selectedPeople.has(p.id))
  const pageSomeChecked = selectableVisible.some((p) => selectedPeople.has(p.id))
  const togglePage = () =>
    setSelectedPeople((prev) => {
      const next = new Set(prev)
      selectableVisible.forEach((p) => (pageAllChecked ? next.delete(p.id) : next.add(p.id)))
      return next
    })

  const cohortPageChecked = visibleCohorts.length > 0 && visibleCohorts.every((c) => selectedCohorts.has(c.id))
  const toggleCohortPage = () =>
    setSelectedCohorts((prev) => {
      const next = new Set(prev)
      visibleCohorts.forEach((c) => (cohortPageChecked ? next.delete(c.id) : next.add(c.id)))
      return next
    })

  if (!open) return null

  const renderAddButton = (ref: typeof bottomAddRef, isOpen: boolean) => (
    <div className="ecm-filter-add-wrap" ref={ref}>
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

  const renderControl = (id: string) => {
    const ctrl = CONTROLS[id]
    const value = filters[id]
    if (ctrl.kind === 'multi') {
      return (
        <FilterMultiSelect
          options={ctrl.options}
          value={Array.isArray(value) ? value : []}
          placeholder={ctrl.placeholder}
          onChange={(v) => setFilter(id, v)}
        />
      )
    }
    return (
      <Dropdown
        size="sm"
        className="ecm-filter-dropdown"
        options={ctrl.options}
        value={typeof value === 'string' && value ? value : undefined}
        placeholder={ctrl.placeholder}
        onChange={(v) => setFilter(id, v)}
      />
    )
  }

  const peopleColumns: Column<PersonRow>[] = [
    {
      key: 'name',
      header: (
        <span className="ecm-th-sort">
          Name
          <ArrowDown
            size={16}
            color="currentColor"
            variant="Linear"
            className={`ecm-sort${sortDesc ? ' ecm-sort--desc' : ''}`}
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
    {
      key: 'status',
      header: 'Status',
      width: '0 0 160px',
      align: 'right',
      render: (p) =>
        p.enrolled ? (
          <Badge type="success" label="Enrolled" customIcon={<UserTick size={16} color="currentColor" variant="Linear" />} />
        ) : (
          <Badge type="informative" label="Not Enrolled" customIcon={<UserAdd size={16} color="currentColor" variant="Linear" />} />
        ),
    },
  ]

  const cohortColumns: Column<CohortRow>[] = [
    { key: 'name', header: 'Cohort', width: '1 0 240px', render: (c) => <span className="ecm-strong">{c.name}</span> },
    {
      key: 'members',
      header: 'Not enrolled',
      width: '0 0 160px',
      align: 'right',
      render: (c) => cohortMembers(c.id).length,
    },
  ]

  const pagination = (page: number, total: number, setPage: (p: number) => void) => ({
    from: total === 0 ? 0 : page * PAGE_SIZE + 1,
    to: Math.min(total, (page + 1) * PAGE_SIZE),
    total,
    onPrev: () => setPage(page - 1),
    onNext: () => setPage(page + 1),
  })

  const filterPills = (
    <div className="ecm-pills">
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
  )

  return (
    <div
      ref={panelRef}
      className="ecm-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Enrol people to your course"
      tabIndex={-1}
    >
      <CloseButton variant="fullscreen" onClick={onClose} className="ecm-close" ariaLabel="Close enrolment" />

      <div className="ecm-shell">
        <header className="ecm-header">
          <h2 className="ecm-title">Enrol people to your course</h2>
          <Button size="lg" disabled={confirmedCount === 0} onClick={() => onEnrol(confirmedCount)}>
            Review &amp; Launch
          </Button>
        </header>

        <div className="ecm-body">
          {/* Step rail */}
          <nav className="ecm-steps" aria-label="Enrolment steps">
            <div className="ecm-step ecm-step--active" aria-current="step">
              <UserAdd size={32} color="var(--text-selected)" variant="Bold" />
              <span className="ecm-step-text">
                <span className="ecm-step-title">Enrol people</span>
                <span className="ecm-step-sub">{confirmedCount} selected</span>
              </span>
            </div>
            <div className="ecm-step ui-disabled" aria-disabled="true">
              <Calendar size={32} color="var(--text-primary)" variant="Linear" />
              <span className="ecm-step-text">
                <span className="ecm-step-title">Set a date</span>
                <span className="ecm-step-sub">{defaultDateRange()}</span>
              </span>
            </div>
            <div className="ecm-step ui-disabled" aria-disabled="true">
              <User size={32} color="var(--text-primary)" variant="Linear" />
              <span className="ecm-step-text">
                <span className="ecm-step-title">Name a sponsor</span>
                <span className="ecm-step-sub">Name a sponsor</span>
              </span>
            </div>
          </nav>

          <section className="ecm-main">
            <h3 className="ecm-section-title">Select people to enrol</h3>

            {/* Filters */}
            <div className="ecm-filters">
              <div className="ecm-filters-head">
                <button
                  type="button"
                  className="ecm-filters-toggle"
                  aria-expanded={filtersExpanded}
                  onClick={() => {
                    setFiltersExpanded((e) => !e)
                    setAddOpen(false)
                  }}
                >
                  <span className="ecm-filters-label">Filters</span>
                  <span className="ecm-filters-badge">{activeIds.length}</span>
                </button>

                <div className={`ecm-filters-collapsed${filtersExpanded ? ' ecm-filters-collapsed--hidden' : ''}`}>
                  {activeIds.length === 0
                    ? renderAddButton(headerAddRef, addOpen && !filtersExpanded)
                    : filterPills}
                </div>

                <button
                  type="button"
                  className="ecm-filters-chevron-btn"
                  aria-label={filtersExpanded ? 'Collapse filters' : 'Expand filters'}
                  aria-expanded={filtersExpanded}
                  onClick={() => {
                    setFiltersExpanded((e) => !e)
                    setAddOpen(false)
                  }}
                >
                  <span className={`ecm-filters-chevron${filtersExpanded ? ' ecm-filters-chevron--open' : ''}`}>
                    <ArrowDown2 size={16} color="var(--text-tertiary)" variant="Linear" />
                  </span>
                </button>
              </div>

              <Collapse open={filtersExpanded}>
                <div className="ecm-filters-body">
                  {activeIds.map((id) => {
                    const meta = FILTER_BY_ID[id]
                    const label = meta.section === 'Custom Fields' ? meta.title : `${meta.title} is`
                    return (
                      <div className="ecm-filter-row" key={id}>
                        <span className="ecm-filter-icon">
                          <meta.Icon size={20} color="var(--text-secondary)" variant="Linear" />
                        </span>
                        <span className="ecm-filter-label">{label}</span>
                        {renderControl(id)}
                        <span className="ecm-filter-remove-slot">
                          <CloseButton size={16} ariaLabel={`Remove ${meta.title} filter`} onClick={() => removeFilter(id)} />
                        </span>
                      </div>
                    )
                  })}

                  <div className="ecm-filter-actions">
                    {renderAddButton(bottomAddRef, addOpen && filtersExpanded)}
                    <Button
                      variant="text"
                      size="md"
                      className="ecm-filter-clear"
                      disabled={activeIds.length === 0}
                      onClick={() => {
                        setFilters({})
                        resetPages()
                      }}
                    >
                      Clear All
                    </Button>
                  </div>
                </div>
              </Collapse>
            </div>

            <div className="ecm-chips">
              <Chip label="All" selected={mode === 'all'} onClick={() => setMode('all')} />
              <Chip label="People" selected={mode === 'people'} onClick={() => setMode('people')} />
              <Chip label="Cohorts" selected={mode === 'cohorts'} onClick={() => setMode('cohorts')} />
            </div>

            {mode === 'all' && (
              /* A single DS table row (table.md), so padding, hover and selected
                 states match the People and Cohorts tables. */
              <div
                className={`tbl-row is-clickable${allSelected ? ' is-selected' : ''}`}
                onClick={() => setAllSelected((v) => !v)}
              >
                <div className="tbl-cell ecm-all-check" onClick={(e) => e.stopPropagation()}>
                  <Checkbox checked={allSelected} onChange={() => setAllSelected((v) => !v)} />
                </div>
                <div className="tbl-cell">
                  All {COMPANY} people ({filteredPeople.filter((p) => !p.enrolled).length})
                </div>
              </div>
            )}

            {mode === 'people' && (
              <>
                <Search
                  size="M"
                  value={peopleQuery}
                  placeholder="Search for people"
                  ariaLabel="Search for people"
                  onChange={(v) => {
                    setPeopleQuery(v)
                    setPeoplePage(0)
                  }}
                />
                {visiblePeople.length === 0 ? (
                  <p className="ecm-empty">No people match these filters.</p>
                ) : (
                  <Table
                    columns={peopleColumns}
                    rows={visiblePeople}
                    getRowKey={(p) => p.id}
                    selectable
                    isSelected={(p) => selectedPeople.has(p.id) || (allSelected && !p.enrolled)}
                    isRowSelectable={(p) => !p.enrolled && !allSelected}
                    getRowState={(p) => (p.enrolled ? 'disabled' : 'enabled')}
                    onRowClick={(p) => !p.enrolled && !allSelected && toggleIn(setSelectedPeople, p.id)}
                    onToggleRow={(p) => toggleIn(setSelectedPeople, p.id)}
                    allSelected={allSelected || pageAllChecked}
                    selectAllIndeterminate={!allSelected && !pageAllChecked && pageSomeChecked}
                    selectAllDisabled={allSelected || selectableVisible.length === 0}
                    onToggleAll={togglePage}
                    onSort={() => setSortDesc((d) => !d)}
                    pagination={pagination(peoplePage, listedPeople.length, setPeoplePage)}
                  />
                )}
              </>
            )}

            {mode === 'cohorts' && (
              <>
                <Search
                  size="M"
                  value={cohortQuery}
                  placeholder="Search for cohorts"
                  ariaLabel="Search for cohorts"
                  onChange={(v) => {
                    setCohortQuery(v)
                    setCohortPage(0)
                  }}
                />
                {visibleCohorts.length === 0 ? (
                  <p className="ecm-empty">No cohorts match “{cohortQuery.trim()}”.</p>
                ) : (
                  <Table
                    columns={cohortColumns}
                    rows={visibleCohorts}
                    getRowKey={(c) => c.id}
                    selectable
                    isSelected={(c) => selectedCohorts.has(c.id)}
                    onRowClick={(c) => toggleIn(setSelectedCohorts, c.id)}
                    onToggleRow={(c) => toggleIn(setSelectedCohorts, c.id)}
                    allSelected={cohortPageChecked}
                    selectAllIndeterminate={!cohortPageChecked && visibleCohorts.some((c) => selectedCohorts.has(c.id))}
                    onToggleAll={toggleCohortPage}
                    pagination={pagination(cohortPage, listedCohorts.length, setCohortPage)}
                  />
                )}
              </>
            )}

            {/* Commits the draft selection; the step count shows only committed people.
                The next step ("Set a date") is out of scope, so nothing else moves. */}
            <div className="ecm-step-actions">
              <Button
                variant="outlined"
                size="lg"
                disabled={selectedCount === confirmedCount}
                onClick={() => setConfirmedCount(selectedCount)}
              >
                Select People
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default EnrolCourseModal
