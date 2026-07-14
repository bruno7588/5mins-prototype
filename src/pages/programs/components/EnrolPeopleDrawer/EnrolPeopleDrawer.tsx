import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Add, ArrowDown2, ArrowLeft2, ArrowRight2, Calendar, Sort, UserTick } from 'iconsax-react'
import { useOverlayA11y } from '../../../../hooks/useOverlayA11y'
import CloseButton from '../../../../components/CloseButton/CloseButton'
import Checkbox from '../../../../components/Checkbox/Checkbox'
import Search from '../../../../components/Search/Search'
import Chip from '../../../../components/Chip/Chip'
import Radio from '../../../../components/Radio/Radio'
import MiniCalendar from '../CourseOutline/MiniCalendar'
import bellIllustration from '../../../../assets/programs/bell.svg'
import './EnrolPeopleDrawer.css'

/* Figma: Enrol people drawer — 2383:31093 (All) / 2383:33377 (People) / 2383:33621 (Cohort). */

type Mode = 'all' | 'people' | 'cohort'

const COMPANY = 'Acme Inc.'
/** Total workforce headcount, shown when enrolling everyone ("All"). */
const COMPANY_HEADCOUNT = 132
const PAGE_SIZE = 5

/** "3 people" / "1 person" — pluralised learner count. */
const peopleLabel = (n: number) => `${n} ${n === 1 ? 'person' : 'people'}`

interface PersonRow {
  id: string
  name: string
  email: string
  team: string
  /** Whether the person is already enrolled in this program. */
  enrolled: boolean
}

interface CohortRow {
  id: string
  name: string
  members: number
}

const TEAMS = ['Growth & Revenue', 'Product', 'Engineering', 'Operations', 'People & Culture']
const PERSON_NAMES = [
  'Alice Johnson', 'Marcus Reid', 'Priya Nair', 'Tom Becker', 'Sofia Alvarez',
  'Daniel Wu', 'Hannah Schmidt', 'Omar Haddad', 'Grace Bennett', 'Lucas Moreau',
  'Ingrid Larsson', 'Carlos Mendes', 'Nadia Petrova', 'Ethan Clarke', 'Yuki Tanaka',
  'Fatima Khan', 'Sven Eriksson', 'Maria Costa', 'David Okoro', 'Emily Foster',
  'Raj Patel', 'Chloe Martin', 'Andre Silva',
]
const PEOPLE: PersonRow[] = PERSON_NAMES.map((name, i) => ({
  id: `person-${i + 1}`,
  name,
  email: `${name.toLowerCase().split(' ')[0]}@${COMPANY.toLowerCase().replace(/[^a-z]/g, '')}.com`,
  team: TEAMS[i % TEAMS.length],
  enrolled: i % 4 === 0,
}))

const COHORTS: CohortRow[] = [
  { id: 'cohort-1', name: 'Leadership Group Q1 2026', members: 23 },
  { id: 'cohort-2', name: 'New Joiners 2026', members: 41 },
  { id: 'cohort-3', name: 'Sales Enablement', members: 18 },
  { id: 'cohort-4', name: 'Engineering Guild', members: 35 },
  { id: 'cohort-5', name: 'Customer Success Pod', members: 12 },
  { id: 'cohort-6', name: 'Marketing Collective', members: 27 },
]

const todayISO = () => {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const fmtDate = (iso: string) => {
  const [y, m, d] = iso.split('-')
  return d && m && y ? `${d}/${m}/${y}` : iso
}

interface Props {
  open: boolean
  onClose: () => void
  /** Whether the program already has enrolments. Drives the confirm label: the
   *  first enrolment "launches" the program; afterwards admins just "enrol people". */
  launched: boolean
  /** Called when the admin confirms. `summary` describes who was enrolled (for the
   *  toast); `startDate` is the chosen program start date (ISO yyyy-mm-dd). */
  onEnrol: (summary: string, startDate: string) => void
}

/** Right-aligned pagination matching the program tables. */
function DrawerPagination({ page, total, onPage }: { page: number; total: number; onPage: (p: number) => void }) {
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))
  return (
    <div className="epd-pagination">
      <span className="epd-pagination__label">
        {total === 0 ? '0' : page * PAGE_SIZE + 1}-{Math.min(total, (page + 1) * PAGE_SIZE)} of {total}
      </span>
      <button
        type="button"
        className="epd-pagination__btn"
        aria-label="Previous page"
        disabled={page === 0}
        onClick={() => onPage(Math.max(0, page - 1))}
      >
        <ArrowLeft2 size={16} color="currentColor" variant="Linear" />
      </button>
      <button
        type="button"
        className="epd-pagination__btn"
        aria-label="Next page"
        disabled={page >= pageCount - 1}
        onClick={() => onPage(Math.min(pageCount - 1, page + 1))}
      >
        <ArrowRight2 size={16} color="currentColor" variant="Linear" />
      </button>
    </div>
  )
}

function EnrolPeopleDrawer({ open, onClose, launched, onEnrol }: Props) {
  const [closing, setClosing] = useState(false)
  const panelRef = useRef<HTMLElement>(null)
  const [mode, setMode] = useState<Mode>('all')
  const [startMode, setStartMode] = useState<'immediately' | 'on-date'>('immediately')
  const [startDate, setStartDate] = useState(todayISO())
  const [startCalOpen, setStartCalOpen] = useState(false)
  const startTriggerRef = useRef<HTMLButtonElement>(null)
  const startPopRef = useRef<HTMLDivElement>(null)
  const [calPos, setCalPos] = useState<{ right: number; bottom: number } | null>(null)

  // Selection state, kept independent per mode.
  const [allSelected, setAllSelected] = useState(false)
  const [selectedPeople, setSelectedPeople] = useState<Set<string>>(new Set())
  const [selectedCohorts, setSelectedCohorts] = useState<Set<string>>(new Set())

  const [peopleQuery, setPeopleQuery] = useState('')
  const [cohortQuery, setCohortQuery] = useState('')
  const [peoplePage, setPeoplePage] = useState(0)
  const [cohortPage, setCohortPage] = useState(0)

  const handleClose = () => {
    setClosing(true)
    setTimeout(() => {
      setClosing(false)
      onClose()
    }, 300)
  }

  useOverlayA11y(panelRef, open && !closing, { onEscape: handleClose })

  // The start-date calendar is portaled to <body> so the drawer's scrollable
  // form (overflow: auto) can't clip it. Anchor it above-right of the trigger,
  // keep it glued on scroll/resize, and close it on outside click / Escape.
  useLayoutEffect(() => {
    if (!startCalOpen) return
    const place = () => {
      const t = startTriggerRef.current
      if (!t) return
      const r = t.getBoundingClientRect()
      setCalPos({
        right: window.innerWidth - r.right,
        bottom: window.innerHeight - r.top + 8,
      })
    }
    place()
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node
      if (startPopRef.current?.contains(target) || startTriggerRef.current?.contains(target)) return
      setStartCalOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      // Close the calendar without also closing the drawer.
      e.stopPropagation()
      e.preventDefault()
      setStartCalOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown, true)
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown, true)
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
    }
  }, [startCalOpen])

  const filteredPeople = useMemo(() => {
    const q = peopleQuery.trim().toLowerCase()
    return q ? PEOPLE.filter((p) => p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q)) : PEOPLE
  }, [peopleQuery])
  const visiblePeople = filteredPeople.slice(peoplePage * PAGE_SIZE, peoplePage * PAGE_SIZE + PAGE_SIZE)

  const filteredCohorts = useMemo(() => {
    const q = cohortQuery.trim().toLowerCase()
    return q ? COHORTS.filter((c) => c.name.toLowerCase().includes(q)) : COHORTS
  }, [cohortQuery])
  const visibleCohorts = filteredCohorts.slice(cohortPage * PAGE_SIZE, cohortPage * PAGE_SIZE + PAGE_SIZE)

  // Already-enrolled people can't be re-enrolled — exclude them from selection.
  const selectableVisiblePeople = visiblePeople.filter((p) => !p.enrolled)
  const peopleHeaderChecked =
    selectableVisiblePeople.length > 0 && selectableVisiblePeople.every((p) => selectedPeople.has(p.id))
  const cohortHeaderChecked = visibleCohorts.length > 0 && visibleCohorts.every((c) => selectedCohorts.has(c.id))

  const togglePerson = (id: string) =>
    setSelectedPeople((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  const toggleCohort = (id: string) =>
    setSelectedCohorts((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  const togglePeopleHeader = () =>
    setSelectedPeople((prev) => {
      const next = new Set(prev)
      if (peopleHeaderChecked) selectableVisiblePeople.forEach((p) => next.delete(p.id))
      else selectableVisiblePeople.forEach((p) => next.add(p.id))
      return next
    })
  const toggleCohortHeader = () =>
    setSelectedCohorts((prev) => {
      const next = new Set(prev)
      if (cohortHeaderChecked) visibleCohorts.forEach((c) => next.delete(c.id))
      else visibleCohorts.forEach((c) => next.add(c.id))
      return next
    })

  const canEnrol =
    mode === 'all' ? allSelected : mode === 'people' ? selectedPeople.size > 0 : selectedCohorts.size > 0

  // Learners this selection would enrol — the number the admin actually commits to.
  // Cohorts expand to their member counts, so N cohorts ≠ N enrolments.
  const selectedCohortMembers = COHORTS.filter((c) => selectedCohorts.has(c.id)).reduce(
    (sum, c) => sum + c.members,
    0,
  )
  const selectedCount =
    mode === 'all'
      ? allSelected
        ? COMPANY_HEADCOUNT
        : 0
      : mode === 'people'
        ? selectedPeople.size
        : selectedCohortMembers

  // Live consequence summary beside the CTA — just the headcount; the "when"
  // is carried by the CTA verb (Launch / Schedule) and the date field above.
  let summaryText: string
  if (selectedCount === 0) {
    summaryText = 'No one selected yet'
  } else if (mode === 'all') {
    summaryText = `Everyone at ${COMPANY} (${COMPANY_HEADCOUNT})`
  } else if (mode === 'people') {
    summaryText = `${peopleLabel(selectedCount)} selected`
  } else {
    const nc = selectedCohorts.size
    summaryText = `${peopleLabel(selectedCount)} · ${nc} ${nc === 1 ? 'cohort' : 'cohorts'}`
  }

  // First enrolment launches (or schedules) the program; later ones just enrol.
  const launchLabel = startMode === 'on-date' ? 'Schedule Program' : 'Launch Program'
  const ctaLabel = !canEnrol
    ? launched
      ? 'Enrol People'
      : launchLabel
    : launched
      ? `Enrol ${selectedCount} ${selectedCount === 1 ? 'Person' : 'People'}`
      : launchLabel

  const handleEnrol = () => {
    if (!canEnrol) return
    let summary: string
    if (mode === 'all') {
      summary = `All ${COMPANY_HEADCOUNT} people at ${COMPANY}`
    } else if (mode === 'people') {
      summary = peopleLabel(selectedPeople.size)
    } else {
      const nc = selectedCohorts.size
      summary = `${peopleLabel(selectedCohortMembers)} from ${nc} ${nc === 1 ? 'cohort' : 'cohorts'}`
    }
    onEnrol(summary, startMode === 'on-date' ? startDate : todayISO())
  }

  if (!open) return null

  return (
    <div
      className={`epd-overlay${closing ? ' epd-overlay--closing' : ''}`}
      onMouseDown={handleClose}
    >
      <aside
        ref={panelRef}
        className={`epd-panel${closing ? ' epd-panel--closing' : ''}`}
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Enrol people"
        tabIndex={-1}
      >
        {/* Header */}
        <header className="epd-header">
          <div className="epd-header__top">
            <h2 className="epd-title">Enrol people</h2>
            <CloseButton onClick={handleClose} />
          </div>
          <div className="epd-divider" />
        </header>

        {/* Scrollable form */}
        <div className="epd-form">
          <div className="epd-chips">
            <Chip label="All" selected={mode === 'all'} onClick={() => setMode('all')} />
            <Chip label="People" selected={mode === 'people'} onClick={() => setMode('people')} />
            <Chip label="Cohort" selected={mode === 'cohort'} onClick={() => setMode('cohort')} />
          </div>

          {/* ── All ── */}
          {mode === 'all' && (
            <div
              role="button"
              tabIndex={0}
              className={`epd-all-row${allSelected ? ' epd-all-row--selected' : ''}`}
              onClick={() => setAllSelected((v) => !v)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setAllSelected((v) => !v)
                }
              }}
            >
              <Checkbox checked={allSelected} />
              <span className="epd-all-row__label">All people from {COMPANY}</span>
              <span className="epd-all-row__count">{COMPANY_HEADCOUNT}</span>
            </div>
          )}

          {/* ── People ── */}
          {mode === 'people' && (
            <div className="epd-section">
              {/* Filters — not built yet; shown disabled instead of as a decoy. */}
              <div className="epd-filters ui-disabled" aria-disabled="true">
                <span className="epd-filters__count">
                  <Sort size={20} color="var(--text-primary)" variant="Linear" />
                  <span className="epd-filters__label">Filters</span>
                  <span className="epd-filters__badge">0</span>
                </span>
                <button type="button" className="epd-filters__add" disabled>
                  Add Filter
                  <Add size={20} color="var(--primary-button-background)" variant="Linear" />
                </button>
                <ArrowDown2 size={16} color="var(--text-secondary)" variant="Linear" />
              </div>

              <Search
                size="M"
                value={peopleQuery}
                placeholder="Search for people"
                ariaLabel="Search for people"
                onChange={(v) => {
                  setPeopleQuery(v)
                  setPeoplePage(0)
                }}
                className="epd-search"
              />

              <div className="epd-table">
                <div className="epd-thead epd-thead--people">
                  <span className="epd-th epd-th--name">
                    <Checkbox checked={peopleHeaderChecked} onChange={togglePeopleHeader} />
                    Name
                  </span>
                  <span className="epd-th epd-th--team">Team</span>
                  <span className="epd-th epd-th--status">Status</span>
                </div>
                {visiblePeople.length === 0 ? (
                  <div className="epd-empty">No people match “{peopleQuery.trim()}”.</div>
                ) : (
                  visiblePeople.map((p) => {
                    const checked = selectedPeople.has(p.id)
                    return (
                      <div
                        key={p.id}
                        className={`epd-row epd-row--people${checked ? ' epd-row--selected' : ''}${p.enrolled ? ' epd-row--enrolled' : ''}`}
                        onClick={() => {
                          if (!p.enrolled) togglePerson(p.id)
                        }}
                      >
                        <div className="epd-cell epd-cell--name">
                          <Checkbox checked={checked} disabled={p.enrolled} />
                          <span className="epd-person">
                            <span className="epd-person__name">{p.name}</span>
                            <span className="epd-person__email">{p.email}</span>
                          </span>
                        </div>
                        <div className="epd-cell epd-cell--team">{p.team}</div>
                        <div className="epd-cell epd-cell--status">
                          {p.enrolled ? (
                            <span className="epd-enrolled-badge">
                              <UserTick size={16} color="currentColor" variant="Linear" />
                              Enrolled
                            </span>
                          ) : (
                            <span className="epd-status-empty">–</span>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
                <DrawerPagination page={peoplePage} total={filteredPeople.length} onPage={setPeoplePage} />
              </div>
            </div>
          )}

          {/* ── Cohort ── */}
          {mode === 'cohort' && (
            <div className="epd-section">
              <div className="epd-cohort-alert">
                <img src={bellIllustration} alt="" width={20} height={20} className="epd-cohort-alert__bell" />
                <span className="epd-cohort-alert__text">
                  Create a cohort with members from diverse teams for content delivery
                </span>
                <button type="button" className="epd-cohort-alert__link ui-disabled" disabled>
                  New Cohort
                </button>
              </div>

              <Search
                size="M"
                value={cohortQuery}
                placeholder="Search for cohorts"
                ariaLabel="Search for cohorts"
                onChange={(v) => {
                  setCohortQuery(v)
                  setCohortPage(0)
                }}
                className="epd-search"
              />

              <div className="epd-table">
                <div className="epd-thead epd-thead--cohort">
                  <span className="epd-th epd-th--cohort">
                    <Checkbox checked={cohortHeaderChecked} onChange={toggleCohortHeader} />
                    Cohort
                  </span>
                  <span className="epd-th epd-th--members">Members</span>
                  <span className="epd-th epd-th--view" />
                </div>
                {visibleCohorts.length === 0 ? (
                  <div className="epd-empty">No cohorts match “{cohortQuery.trim()}”.</div>
                ) : (
                  visibleCohorts.map((c) => {
                    const checked = selectedCohorts.has(c.id)
                    return (
                      <div
                        key={c.id}
                        className={`epd-row epd-row--cohort${checked ? ' epd-row--selected' : ''}`}
                        onClick={() => toggleCohort(c.id)}
                      >
                        <div className="epd-cell epd-cell--cohort">
                          <Checkbox checked={checked} />
                          <span className="epd-cohort__name">{c.name}</span>
                        </div>
                        <div className="epd-cell epd-cell--members">{c.members}</div>
                        <div className="epd-cell epd-cell--view">
                          <button
                            type="button"
                            className="epd-view-btn ui-disabled"
                            disabled
                            onClick={(e) => e.stopPropagation()}
                          >
                            View
                          </button>
                        </div>
                      </div>
                    )
                  })
                )}
                <DrawerPagination page={cohortPage} total={filteredCohorts.length} onPage={setCohortPage} />
              </div>
            </div>
          )}

          {/* Program start date — shared across all modes */}
          <div className="epd-date">
            <div className="epd-date__header">
              <span className="epd-date__title">Program start date</span>
              <span className="epd-date__sub">Choose when enrolment should start</span>
            </div>
            <div className="epd-date__options">
              <button
                type="button"
                className={`epd-date__opt${startMode === 'immediately' ? ' epd-date__opt--selected' : ''}`}
                onClick={() => setStartMode('immediately')}
              >
                <Radio checked={startMode === 'immediately'} readOnly tabIndex={-1} />
                <span>Immediately</span>
              </button>

              <div className={`epd-date__opt${startMode === 'on-date' ? ' epd-date__opt--selected' : ''}`}>
                <button
                  type="button"
                  className="epd-date__opt-radio"
                  onClick={() => setStartMode('on-date')}
                >
                  <Radio checked={startMode === 'on-date'} readOnly tabIndex={-1} />
                  <span>On specific date</span>
                </button>
                <div className="epd-date__cal">
                  <button
                    ref={startTriggerRef}
                    type="button"
                    className={`epd-date__cal-trigger${startMode === 'on-date' ? '' : ' epd-date__cal-trigger--disabled'}${startCalOpen ? ' epd-date__cal-trigger--active' : ''}`}
                    disabled={startMode !== 'on-date'}
                    onClick={() => setStartCalOpen((o) => !o)}
                  >
                    <span>{fmtDate(startDate)}</span>
                    <Calendar size={20} color="currentColor" variant="Linear" />
                  </button>
                  {startCalOpen && startMode === 'on-date' && calPos &&
                    createPortal(
                      <div
                        ref={startPopRef}
                        className="epd-date__cal-pop"
                        style={{ right: calPos.right, bottom: calPos.bottom }}
                      >
                        <MiniCalendar
                          value={startDate}
                          onSelect={(iso) => {
                            setStartDate(iso)
                            setStartCalOpen(false)
                          }}
                        />
                      </div>,
                      document.body,
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="epd-footer">
          <div className="epd-divider" />
          <div className="epd-footer__row">
            <button
              type="button"
              className="epd-launch"
              disabled={!canEnrol}
              onClick={handleEnrol}
            >
              {ctaLabel}
            </button>
            <span
              className={`epd-summary${selectedCount === 0 ? ' epd-summary--empty' : ''}`}
              aria-live="polite"
            >
              {summaryText}
            </span>
          </div>
        </div>
      </aside>
    </div>
  )
}

export default EnrolPeopleDrawer
