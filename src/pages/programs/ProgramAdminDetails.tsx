import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowDown2, ArrowLeft2, ArrowRight2, Clock, Danger, Edit2, Eye, Link2, More, Profile, TaskSquare, TickCircle, Trash, UserCirlceAdd, UserMinus } from 'iconsax-react'
import LeftSidebar from '../../components/LeftSidebar/LeftSidebar'
import Search from '../../components/Search/Search'
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal'
import Tooltip from '../../components/Tooltip/Tooltip'
import ToastContainer, { useToast } from '../../components/Toast/Toast'
import LearnerProgressDrawer from './components/LearnerProgressDrawer/LearnerProgressDrawer'
import EnrolPeopleDrawer from './components/EnrolPeopleDrawer/EnrolPeopleDrawer'
import LaunchSuccessModal from './components/LaunchSuccessModal/LaunchSuccessModal'
import { deleteProgram, loadDraftForBuilder, programLifecycle, type CourseStep, type ProgramStep } from './programStore'
import ProgramStatusBadge from './components/ProgramStatusBadge/ProgramStatusBadge'
import coursesIcon from '../../assets/programs/courses-icon.svg'
import avatar1 from '../../assets/programs/avatar-1.png'
import avatar2 from '../../assets/programs/avatar-2.png'
import avatar3 from '../../assets/programs/avatar-3.png'
import '../people/People.css' // confirm-modal-* styles
import './ProgramAdminDetails.css'

const TABS = ['Courses', 'Enrolments', 'Settings']
const PAGE_SIZE = 10

/* ── Mock enrolled learners ──────────────────────────────────────────────── */
interface Learner {
  id: string
  name: string
  avatar: string
  role: string
  enrolled: { day: string; year: string }
  progress: number
  score: number
  completed: { day: string; year: string }
}

const ROLES = [
  'Customer Support Specialist',
  'Product Manager',
  'Sales Executive',
  'Marketing Lead',
  'Operations Analyst',
  'Engineering Manager',
]

const LEARNER_AVATARS = [avatar1, avatar2, avatar3]
const LEARNER_NAMES = [
  'Olivia Bennett', 'Liam Carter', 'Emma Davies', 'Noah Evans', 'Ava Foster',
  'William Grant', 'Sophia Hughes', 'James Irwin', 'Isabella Jones', 'Benjamin King',
  'Mia Lewis', 'Lucas Moore', 'Charlotte Nash', 'Henry Owen', 'Amelia Price',
  'Jack Quinn', 'Harper Reed', 'Oscar Shaw', 'Evie Turner', 'George Underwood',
  'Florence Vance', 'Arthur Walsh', 'Poppy Young', 'Theo Adams', 'Lily Brooks',
  'Max Coleman', 'Daisy Ellis', 'Leo Fisher',
]
const ENROL_DATES = [
  { day: 'Feb 17,', year: '2026' },
  { day: 'Mar 03,', year: '2026' },
  { day: 'Jan 22,', year: '2026' },
  { day: 'Apr 11,', year: '2026' },
]
const COMPLETE_DATES = [
  { day: 'Jun 24,', year: '2026' },
  { day: 'Jul 02,', year: '2026' },
  { day: 'May 19,', year: '2026' },
  { day: 'Aug 08,', year: '2026' },
]
const PROGRESS = [0, 25, 50, 75, 100, 60, 100, 0]
const SCORES = [20, 48, 72, 95, 55, 68, 88, 35]

const LEARNERS: Learner[] = LEARNER_NAMES.map((name, i) => ({
  id: `lrn-${i + 1}`,
  name,
  avatar: LEARNER_AVATARS[i % LEARNER_AVATARS.length],
  role: ROLES[i % ROLES.length],
  enrolled: ENROL_DATES[i % ENROL_DATES.length],
  progress: PROGRESS[i % PROGRESS.length],
  score: SCORES[i % SCORES.length],
  completed: COMPLETE_DATES[i % COMPLETE_DATES.length],
}))

function enrolText(step: ProgramStep): { title: string; sub?: string } {
  if (step.release.kind === 'after-days') {
    const unit = step.release.days === 1 ? 'day' : 'days'
    return { title: 'After delay', sub: `${step.release.days} ${unit} after previous course enrolment` }
  }
  if (step.release.kind === 'on-date') {
    const [y, m, d] = step.release.date.split('-')
    return { title: 'On specific date', sub: d && m && y ? `${d}/${m}/${y}` : step.release.date }
  }
  return { title: 'On program start' }
}

function dueText(step: ProgramStep): string {
  if (step.dueDays == null) return 'No due date'
  const unit = step.dueDays === 1 ? 'day' : 'days'
  return `${step.dueDays} ${unit} after start date`
}

/** Continuous progress bar. */
function ProgressBar({ value }: { value: number }) {
  return (
    <span className="pad-progress" aria-hidden="true">
      <span className="pad-progress__fill" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </span>
  )
}

/** Right-aligned "start-end of total" + prev/next; hidden when total ≤ one page. */
function TablePagination({
  page,
  total,
  onPage,
}: {
  page: number
  total: number
  onPage: (p: number) => void
}) {
  if (total <= PAGE_SIZE) return null
  const pageCount = Math.ceil(total / PAGE_SIZE)
  return (
    <div className="pad-pagination">
      <span className="pad-pagination__label">
        {page * PAGE_SIZE + 1}-{Math.min(total, (page + 1) * PAGE_SIZE)} of {total}
      </span>
      <button
        type="button"
        className="pad-pagination__btn"
        aria-label="Previous page"
        disabled={page === 0}
        onClick={() => onPage(Math.max(0, page - 1))}
      >
        <ArrowLeft2 size={16} color="currentColor" variant="Linear" />
      </button>
      <button
        type="button"
        className="pad-pagination__btn"
        aria-label="Next page"
        disabled={page >= pageCount - 1}
        onClick={() => onPage(Math.min(pageCount - 1, page + 1))}
      >
        <ArrowRight2 size={16} color="currentColor" variant="Linear" />
      </button>
    </div>
  )
}

function ProgramAdminDetails() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [tab, setTab] = useState('Courses')
  const [page, setPage] = useState(0)
  const [learnerQuery, setLearnerQuery] = useState('')
  const [learners, setLearners] = useState(LEARNERS)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [progressLearner, setProgressLearner] = useState<Learner | null>(null)
  const [unenrolTarget, setUnenrolTarget] = useState<Learner | null>(null)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [enrolled, setEnrolled] = useState(false)
  const [programStart, setProgramStart] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)
  const { toasts, show: showToast } = useToast()
  const menuRef = useRef<HTMLDivElement>(null)

  const draft = useMemo(() => loadDraftForBuilder(id), [id])
  const courseSteps = draft.steps.filter((s): s is CourseStep => s.type === 'course')
  const visibleSteps = courseSteps.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)
  const totalMins = courseSteps.reduce((sum, s) => sum + s.durationMinutes, 0)
  const title = draft.title || 'Untitled program'

  const q = learnerQuery.trim().toLowerCase()
  const filteredLearners = q ? learners.filter((l) => l.name.toLowerCase().includes(q)) : learners
  const visibleLearners = filteredLearners.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)

  const learnerCount = learners.length
  const completedPct = learnerCount ? Math.round((learners.filter((l) => l.progress >= 100).length / learnerCount) * 100) : 0
  const notStartedPct = learnerCount ? Math.round((learners.filter((l) => l.progress <= 0).length / learnerCount) * 100) : 0
  const inProgressPct = Math.max(0, 100 - completedPct - notStartedPct)

  // Close the row action menu on outside click / Escape.
  useEffect(() => {
    if (!openMenuId) return
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenuId(null)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenMenuId(null)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [openMenuId])

  const confirmUnenrol = () => {
    if (!unenrolTarget) return
    const { id: removedId, name } = unenrolTarget
    setLearners((ls) => ls.filter((l) => l.id !== removedId))
    setUnenrolTarget(null)
    showToast('success', `${name} has been unenrolled from this program`)
  }

  const confirmDelete = () => {
    deleteProgram(draft.id)
    setConfirmDeleteOpen(false)
    navigate('/programs', { state: { toast: `“${title}” has been deleted` } })
  }

  const copyLink = () => {
    const url = `${window.location.origin}/programs/${draft.id}`
    navigator.clipboard?.writeText(url).catch(() => {})
    showToast('success', 'Link copied to clipboard')
  }

  const downloadReport = (label: string) => {
    setOpenMenuId(null)
    showToast('success', `Downloading ${label} (CSV)`)
  }

  const handleEnrol = (summary: string, startDate: string) => {
    const launching = !enrolled
    setEnrolled(true)
    setProgramStart(startDate)
    setLearners(LEARNERS)
    setPage(0)
    setDrawerOpen(false)
    if (launching) {
      setSuccessOpen(true)
    } else {
      showToast('success', `${summary} enrolled in this program`)
    }
  }

  // No enrolments until the program is launched, regardless of the seeded table.
  const enrolledCount = enrolled ? learnerCount : 0
  // Ready to Launch until launched; once launched, Scheduled while the start date
  // is in the future, Live once it has arrived.
  const lifecycle = programLifecycle({
    learnerCount: enrolledCount,
    startsAt: programStart ?? undefined,
  })

  const changeTab = (t: string) => {
    setTab(t)
    setPage(0)
  }

  return (
    <div className="programs-layout">
      <LeftSidebar />
      <main className="pad-main">
        <div className="pad">
      {/* Breadcrumb */}
      <nav className="pad-crumb" aria-label="Breadcrumb">
        <button type="button" className="pad-crumb__link" onClick={() => navigate('/programs')}>
          Programs
        </button>
        <ArrowRight2 size={16} color="var(--text-tertiary)" variant="Linear" />
        <span className="pad-crumb__current">{title}</span>
      </nav>

      {/* Header */}
      <header className="pad-header">
        <div className="pad-headline">
          <h1 className="pad-headline__title">{title}</h1>
          {draft.description && <p className="pad-headline__desc">{draft.description}</p>}
          <div className="pad-meta">
            <span className="pad-meta__item">
              <img src={coursesIcon} alt="" width={16} height={16} />
              {courseSteps.length} {courseSteps.length === 1 ? 'course' : 'courses'}
            </span>
            <span className="pad-meta__item">
              <Clock size={16} color="var(--text-tertiary)" variant="Linear" />
              {totalMins} {totalMins === 1 ? 'min' : 'mins'}
            </span>
            {enrolledCount > 0 && (
              <span className="pad-avatars" aria-hidden="true">
                {[avatar1, avatar2, avatar3].slice(0, enrolledCount).map((src, i) => (
                  <img key={i} className="pad-avatars__img" src={src} alt="" />
                ))}
                {enrolledCount > 3 && <span className="pad-avatars__more">+{enrolledCount - 3}</span>}
              </span>
            )}
            <span className="pad-meta__item">
              {enrolledCount} {enrolledCount === 1 ? 'learner' : 'learners'}
            </span>
            <ProgramStatusBadge status={lifecycle} />
          </div>
        </div>

        <div className="pad-cta">
          <Tooltip text="Copy link" position="Top" icon={false}>
            <button type="button" className="pad-icon-btn" aria-label="Copy program link" onClick={copyLink}>
              <Link2 size={24} color="var(--text-secondary)" variant="Linear" />
            </button>
          </Tooltip>
          {/* Program actions — Figma 2464:14871 / 2469:51780 */}
          <div className="pad-menu" ref={openMenuId === 'header-more' ? menuRef : undefined}>
            <button
              type="button"
              className="pad-icon-btn"
              aria-label="Program actions"
              aria-haspopup="menu"
              aria-expanded={openMenuId === 'header-more'}
              onClick={() => setOpenMenuId((cur) => (cur === 'header-more' ? null : 'header-more'))}
            >
              <More size={24} color="var(--text-secondary)" variant="Linear" />
            </button>
            {openMenuId === 'header-more' && (
              <div className="pad-menu__list" role="menu">
                <button
                  type="button"
                  className="pad-menu__item"
                  role="menuitem"
                  onClick={() => navigate(`/programs/builder/${draft.id}`)}
                >
                  <Edit2 size={20} color="var(--text-primary)" variant="Linear" />
                  Edit
                </button>
                <button
                  type="button"
                  className="pad-menu__item pad-menu__item--danger"
                  role="menuitem"
                  onClick={() => {
                    setConfirmDeleteOpen(true)
                    setOpenMenuId(null)
                  }}
                >
                  <Trash size={20} color="var(--text-error)" variant="Linear" />
                  Delete
                </button>
              </div>
            )}
          </div>
          <button type="button" className="pad-btn pad-btn--text" onClick={() => navigate(`/programs/${draft.id}`)}>
            Preview
            <Eye size={20} color="currentColor" variant="Linear" />
          </button>
          <button type="button" className="pad-btn pad-btn--filled" onClick={() => setDrawerOpen(true)}>
            Enrol People
          </button>
        </div>
      </header>

      <div className="pad-divider" />

      {/* Tabs */}
      <nav className="pad-tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            className={`pad-tab${tab === t ? ' pad-tab--active' : ''}`}
            onClick={() => changeTab(t)}
          >
            {t}
          </button>
        ))}
      </nav>

      {/* ── Courses ── */}
      {tab === 'Courses' &&
        (courseSteps.length === 0 ? (
          <div className="pad-empty">No courses in this program yet.</div>
        ) : (
          <div className="pad-table">
            <div className="pad-thead">
              <span className="pad-thead__course">Course</span>
              <span className="pad-thead__col">Enrolment</span>
              <span className="pad-thead__col">Due date</span>
            </div>
            {visibleSteps.map((step, i) => {
              const enrol = enrolText(step)
              return (
                <div key={step.id} className="pad-row">
                  <div className="pad-row__course">
                    <span className="pad-counter">{page * PAGE_SIZE + i + 1}</span>
                    <span
                      className="pad-thumb"
                      style={{ backgroundImage: step.thumbnail ? `url(${step.thumbnail})` : undefined }}
                    />
                    <span className="pad-row__title">{step.title}</span>
                  </div>
                  <div className="pad-row__col">
                    <span className="pad-cell__title">{enrol.title}</span>
                    {enrol.sub && <span className="pad-cell__sub">{enrol.sub}</span>}
                  </div>
                  <div className="pad-row__col">
                    <span className="pad-cell__title">{dueText(step)}</span>
                  </div>
                </div>
              )
            })}
            <TablePagination page={page} total={courseSteps.length} onPage={setPage} />
          </div>
        ))}

      {/* ── Enrolments ── */}
      {tab === 'Enrolments' && (!enrolled ? (
        <div className="pad-empty-state">
          <UserCirlceAdd size={72} variant="Bold" color="var(--text-tertiary)" className="pad-empty-state__icon" />
          <div className="pad-empty-state__info">
            <h3 className="pad-empty-state__title">You haven’t enrolled any learners yet!</h3>
            <p className="pad-empty-state__sub">Enrol people to your program</p>
          </div>
          <button type="button" className="pad-btn pad-btn--outline" onClick={() => setDrawerOpen(true)}>
            Enrol People
          </button>
        </div>
      ) : (
        <>
          <div className="pad-stats">
            <div className="pad-stat">
              <Profile size={32} color="var(--primary-600)" variant="Linear" />
              <div className="pad-stat__body">
                <span className="pad-stat__label">Total people enrolled</span>
                <span className="pad-stat__valuerow">
                  <span className="pad-stat__value">{learnerCount}</span>
                  <span className="pad-stat__delta">+12 this month</span>
                </span>
              </div>
            </div>
            <div className="pad-stat">
              <TickCircle size={32} color="var(--success-500)" variant="Linear" />
              <div className="pad-stat__body">
                <span className="pad-stat__label">Completed</span>
                <span className="pad-stat__value">{completedPct}%</span>
              </div>
            </div>
            <div className="pad-stat">
              <Clock size={32} color="var(--warning-500)" variant="Linear" />
              <div className="pad-stat__body">
                <span className="pad-stat__label">In progress</span>
                <span className="pad-stat__value">{inProgressPct}%</span>
              </div>
            </div>
            <div className="pad-stat">
              <Danger size={32} color="var(--danger-500)" variant="Linear" />
              <div className="pad-stat__body">
                <span className="pad-stat__label">Not started</span>
                <span className="pad-stat__value">{notStartedPct}%</span>
              </div>
            </div>
          </div>

          <div className="pad-enrol-bar">
            <Search
              size="M"
              value={learnerQuery}
              placeholder="Search for learners"
              onChange={(v) => {
                setLearnerQuery(v)
                setPage(0)
              }}
              className="pad-enrol-search"
            />
            <div className="pad-enrol-actions">
              {/* Download Report dropdown — Figma 2422:10883 / listbox 2422:11594 */}
              <div className="pad-menu" ref={openMenuId === 'dl-report' ? menuRef : undefined}>
                <button
                  type="button"
                  className="pad-btn pad-btn--outlined-2"
                  aria-haspopup="menu"
                  aria-expanded={openMenuId === 'dl-report'}
                  onClick={() => setOpenMenuId((cur) => (cur === 'dl-report' ? null : 'dl-report'))}
                >
                  Download Report
                  <ArrowDown2 size={20} color="currentColor" variant="Linear" />
                </button>
                {openMenuId === 'dl-report' && (
                  <div className="pad-menu__list pad-menu__list--reports" role="menu">
                    <button
                      type="button"
                      className="pad-menu__item pad-menu__item--rich"
                      role="menuitem"
                      onClick={() => downloadReport('Snapshot')}
                    >
                      <span className="pad-menu__item-title">Download Snapshot</span>
                      <span className="pad-menu__item-supporting">Overall progress, scores, summary data</span>
                    </button>
                    <button
                      type="button"
                      className="pad-menu__item pad-menu__item--rich"
                      role="menuitem"
                      onClick={() => downloadReport('Progress Report')}
                    >
                      <span className="pad-menu__item-title">Download Progress Report</span>
                      <span className="pad-menu__item-supporting">Detailed per-learner breakdown of all courses</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pad-table">
            <div className="pad-thead">
              <span className="pad-thead__name">Name</span>
              <span className="pad-thead__enrol">Enrolment</span>
              <span className="pad-thead__progress">Progress</span>
              <span className="pad-thead__score">
                Score
                <Tooltip text="Average score across completed courses" position="Top" iconColor="var(--text-tertiary)" />
              </span>
              <span className="pad-thead__completion">Completion date</span>
              <span className="pad-thead__more" aria-hidden="true" />
            </div>
            {visibleLearners.length === 0 ? (
              <div className="pad-empty">No learners match “{learnerQuery.trim()}”.</div>
            ) : (
              visibleLearners.map((l) => (
                <div key={l.id} className="pad-row">
                  <div className="pad-row__name">
                    <img className="pad-lavatar" src={l.avatar} alt="" />
                    <span className="pad-row__title">{l.name}</span>
                  </div>
                  <div className="pad-row__date">
                    <span className="pad-date__day">{l.enrolled.day}</span>
                    <span className="pad-date__year">{l.enrolled.year}</span>
                  </div>
                  <div className="pad-row__progress">
                    <ProgressBar value={l.progress} />
                    <span className="pad-progress__pct">{l.progress}%</span>
                  </div>
                  <div className="pad-row__score">{l.score}%</div>
                  <div className="pad-row__date pad-row__date--completion">
                    <span className="pad-date__day">{l.completed.day}</span>
                    <span className="pad-date__year">{l.completed.year}</span>
                  </div>
                  <div className="pad-menu" ref={openMenuId === l.id ? menuRef : undefined}>
                    <button
                      type="button"
                      className="pad-row__more"
                      aria-label="Learner actions"
                      aria-haspopup="menu"
                      aria-expanded={openMenuId === l.id}
                      onClick={() => setOpenMenuId((cur) => (cur === l.id ? null : l.id))}
                    >
                      <More size={20} color="var(--text-secondary)" variant="Linear" />
                    </button>
                    {openMenuId === l.id && (
                      <div className="pad-menu__list" role="menu">
                        <button
                          type="button"
                          className="pad-menu__item"
                          role="menuitem"
                          onClick={() => {
                            setProgressLearner(l)
                            setOpenMenuId(null)
                          }}
                        >
                          <TaskSquare size={20} color="var(--text-primary)" variant="Linear" />
                          View progress
                        </button>
                        <button
                          type="button"
                          className="pad-menu__item pad-menu__item--danger"
                          role="menuitem"
                          onClick={() => {
                            setUnenrolTarget(l)
                            setOpenMenuId(null)
                          }}
                        >
                          <UserMinus size={20} color="var(--text-error)" variant="Linear" />
                          Unenrol
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            <TablePagination page={page} total={filteredLearners.length} onPage={setPage} />
          </div>
        </>
      ))}

      {/* ── Settings ── */}
      {tab === 'Settings' && <div className="pad-empty">{tab} coming soon.</div>}
        </div>
      </main>

      {progressLearner && (
        <LearnerProgressDrawer
          learner={progressLearner}
          courses={courseSteps}
          onClose={() => setProgressLearner(null)}
        />
      )}

      <ConfirmModal open={!!unenrolTarget} onClose={() => setUnenrolTarget(null)}>
        {unenrolTarget && (
          <>
            <div className="confirm-modal-header confirm-modal-header--center">
              <div className="confirm-modal-icon">
                <UserMinus size={72} color="var(--danger-500)" variant="Linear" />
              </div>
              <h2 className="confirm-modal-title">Unenrol learner</h2>
              <p className="confirm-modal-body">
                This will remove the learner from this program and all its courses
              </p>
            </div>
            <div className="confirm-modal-actions">
              <button
                type="button"
                className="confirm-modal-btn confirm-modal-btn--outlined"
                onClick={() => setUnenrolTarget(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="confirm-modal-btn confirm-modal-btn--danger"
                onClick={confirmUnenrol}
              >
                Unenrol Learner
              </button>
            </div>
          </>
        )}
      </ConfirmModal>

      {/* Delete program — Figma 2469:52244 */}
      <ConfirmModal open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
        <div className="confirm-modal-header">
          <h2 className="confirm-modal-title">Delete program</h2>
          <p className="confirm-modal-body">
            Delete <strong>{title}</strong>? This removes it from the list and the learner experience. This
            can’t be undone.
          </p>
        </div>
        <div className="confirm-modal-actions">
          <button
            type="button"
            className="confirm-modal-btn confirm-modal-btn--outlined-neutral"
            onClick={() => setConfirmDeleteOpen(false)}
          >
            Cancel
          </button>
          <button type="button" className="confirm-modal-btn confirm-modal-btn--danger" onClick={confirmDelete}>
            Delete Program
          </button>
        </div>
      </ConfirmModal>

      <EnrolPeopleDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        launched={enrolled}
        onEnrol={handleEnrol}
      />

      <LaunchSuccessModal
        open={successOpen}
        onClose={() => setSuccessOpen(false)}
        onTrackProgress={() => {
          setTab('Enrolments')
          setSuccessOpen(false)
        }}
      />

      <ToastContainer toasts={toasts} />
    </div>
  )
}

export default ProgramAdminDetails
