import { Navigate, useNavigate, useLocation, useParams } from 'react-router-dom'
import {
  Add,
  Clock,
  FlashCircle,
  Lock,
  Mobile,
  PlayCircle,
  Routing,
  ShieldSecurity,
} from 'iconsax-react'
import { Logo, learnerSideItems } from '../my-team/MyTeam'
import ProfileMenu from '../../components/ProfileMenu/ProfileMenu'
import Badge from '../../components/Badge/Badge'
import ToastContainer, { useToast } from '../../components/Toast/Toast'
import ProgramCertificate from './components/ProgramCertificate/ProgramCertificate'
import '../my-team/MyTeam.css'
import '../workspace/Workspace.css'
import './ProgramDetails.css'
import { type CourseStatus } from '../workspace/mockItems'
import { getAllPrograms } from './programStore'
import avatar1 from '../../assets/programs/avatar-1.png'
import avatar2 from '../../assets/programs/avatar-2.png'
import avatar3 from '../../assets/programs/avatar-3.png'
import coursesIcon from '../../assets/programs/courses-icon.svg'

const SEGMENTS = 8

/** DS Badge variant + default label for each course status. */
const STATUS_BADGE: Record<CourseStatus, { type: 'success' | 'warning' | 'error' | 'informative'; label: string }> = {
  completed: { type: 'success', label: 'Completed' },
  overdue: { type: 'error', label: 'Overdue' },
  scheduled: { type: 'informative', label: 'Scheduled' },
  due: { type: 'warning', label: 'Due' },
  failed: { type: 'error', label: 'Failed' },
}

function ProgramDetails() {
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams<{ id: string }>()
  const { toasts, show: showToast } = useToast()

  const programs = getAllPrograms()
  const program = programs.find((p) => p.id === id)
  if (!program) return <Navigate to="/workspace" replace />
  const outline = program.outline

  // The primary next-up course gets the filled "Start Course" CTA; any other
  // available (jump-here) courses use the outlined secondary variant.
  const primaryStartIdx = outline.findIndex((c) => c.state === 'jump-here')

  // Certificate unlocks only when every course is complete AND passed. A single
  // failed (or still-incomplete) course keeps it locked.
  const certificateUnlocked =
    outline.length > 0 && outline.every((c) => c.status === 'completed')

  const filled = Math.max(0, Math.min(SEGMENTS, Math.round((program.progress / 100) * SEGMENTS)))

  const stackAvatars = [avatar1, avatar2, avatar3].slice(0, Math.max(0, program.learnerCount))
  const stackOverflow = program.learnerCount - stackAvatars.length

  return (
    <div className="mt-app">
      <header className="mt-topnav">
        <button type="button" className="mt-topnav__logo" aria-label="Home" onClick={() => navigate('/workspace')}>
          <Logo size={22} />
        </button>
        <div className="mt-topnav__right">
          <button type="button" className="mt-topnav__textbtn ui-disabled" disabled>
            <Mobile size={20} color="var(--text-secondary)" variant="Linear" />
            <span>Get App</span>
          </button>
          <button type="button" className="mt-topnav__outlinebtn ui-disabled" disabled>
            <Add size={20} color="var(--text-primary)" variant="Linear" />
            <span>Create</span>
          </button>
          <div className="mt-topnav__icons">
            <button type="button" className="mt-topnav__iconbtn ui-disabled" aria-label="Notifications (coming soon)" disabled>
              <FlashCircle size={24} color="var(--text-primary)" variant="Linear" />
            </button>
          </div>
        </div>
      </header>

      <div className="mt-main">
        <aside className="mt-side">
          <nav className="mt-side__menu">
            {learnerSideItems.map(({ label, icon: Icon, path }) => {
              const isActive = !!path && location.pathname === path
              return (
                <button
                  key={label}
                  type="button"
                  className={`mt-side__item${isActive ? ' mt-side__item--active' : ''}`}
                  onClick={path ? () => navigate(path) : undefined}
                >
                  <Icon size={24} color={isActive ? 'var(--selected)' : 'var(--text-secondary)'} variant="Bold" />
                  <span>{label}</span>
                </button>
              )
            })}
            <button type="button" className="mt-side__item" onClick={() => navigate('/content-library')}>
              <ShieldSecurity size={24} color="var(--text-secondary)" variant="Bold" />
              <span>Admin</span>
            </button>
          </nav>

          <ProfileMenu />

          <div className="mt-side__powered">
            <span>Powered by</span>
            <Logo size={12} />
          </div>
        </aside>

        <section className="mt-body pd-body">
          {/* Program header */}
          <header className="pd-banner">
            <div className="pd-banner__title">
              <span className="pd-banner__label">
                <Routing size={16} color="var(--text-tertiary)" variant="Bold" />
                <span>Program</span>
              </span>
              <h1 className="pd-banner__heading">{program.title}</h1>
              <p className="pd-banner__desc">{program.description}</p>
            </div>

            <div className="pd-banner__meta">
              <span className="pd-meta__item">
                <img className="pd-meta__icon" src={coursesIcon} alt="" />
                <span>{program.courseCount} {program.courseCount === 1 ? 'course' : 'courses'}</span>
              </span>
              <span className="pd-meta__item">
                <Clock size={16} color="var(--text-tertiary)" variant="Linear" />
                <span>{program.durationLabel}</span>
              </span>
              <span className="pd-learners">
                {stackAvatars.length > 0 && (
                  <span className="pd-avatars">
                    {stackAvatars.map((src, i) => (
                      <img key={i} className="pd-avatar" src={src} alt="" />
                    ))}
                    {stackOverflow > 0 && <span className="pd-avatar pd-avatar--count">+{stackOverflow}</span>}
                  </span>
                )}
                <span className="pd-learners__label">
                  {program.learnerCount} {program.learnerCount === 1 ? 'learner' : 'learners'}
                </span>
              </span>
            </div>

            <div className="pd-progress">
              <div
                className="pd-progress__track"
                role="progressbar"
                aria-valuenow={program.progress}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                {Array.from({ length: SEGMENTS }).map((_, i) => (
                  <span key={i} className={`pd-progress__seg${i < filled ? ' pd-progress__seg--primary' : ''}`} />
                ))}
              </div>
              <span className="pd-progress__pct">{program.progress}%</span>
            </div>
          </header>

          {/* Program outline */}
          <section className="pd-section">
            <h2 className="pd-section__title">Program outline</h2>
            <div className="pd-outline">
              {outline.map((course, index) => {
                const courseFilled = Math.max(
                  0,
                  Math.min(SEGMENTS, Math.round(((course.progress ?? 0) / 100) * SEGMENTS)),
                )
                const isLocked = course.state === 'locked'
                const metaIconColor = isLocked ? 'var(--text-disabled)' : 'var(--text-tertiary)'
                return (
                  <article key={course.id} className={`pd-course${isLocked ? ' pd-course--locked' : ''}`}>
                    <div className="pd-course__thumb" style={{ backgroundImage: `url(${course.thumbnail})` }} />
                    <div className="pd-course__main">
                      <div className="pd-course__head">
                        <h3 className="pd-course__title">
                          {isLocked ? (
                            course.title
                          ) : (
                            <button
                              type="button"
                              className="pd-course__titlelink"
                              onClick={() => navigate(`/courses/${course.id}`)}
                            >
                              {course.title}
                            </button>
                          )}
                        </h3>
                        <div className="pd-course__info">
                          <span className="pd-meta__item">
                            <PlayCircle size={16} color={metaIconColor} variant="Linear" />
                            <span>{course.lessonCount} lessons</span>
                          </span>
                          <span className="pd-meta__item">
                            <Clock size={16} color={metaIconColor} variant="Linear" />
                            <span>{course.durationMinutes} min</span>
                          </span>
                          {course.state === 'continue' ? (
                            <span className="pd-course__track">
                              {Array.from({ length: SEGMENTS }).map((_, i) => (
                                <span
                                  key={i}
                                  className={`pd-progress__seg${i < courseFilled ? ' pd-progress__seg--primary' : ''}`}
                                />
                              ))}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      {course.status ? (
                        <Badge
                          type={STATUS_BADGE[course.status].type}
                          label={course.statusLabel ?? STATUS_BADGE[course.status].label}
                        />
                      ) : null}
                    </div>
                    {course.state === 'review' ? (
                      <button
                        type="button"
                        className="pd-course__cta pd-course__cta--review"
                        onClick={() => navigate(`/courses/${course.id}`)}
                      >
                        Review
                      </button>
                    ) : course.state === 'continue' ? (
                      <button
                        type="button"
                        className={`pd-course__cta${course.status === 'overdue' ? '' : ' pd-course__cta--outline'}`}
                        onClick={() => navigate(`/courses/${course.id}`)}
                      >
                        Continue
                      </button>
                    ) : course.state === 'jump-here' ? (
                      <button
                        type="button"
                        className={`pd-course__cta${index === primaryStartIdx ? '' : ' pd-course__cta--outline'}`}
                        onClick={() => navigate(`/courses/${course.id}`)}
                      >
                        Start Course
                      </button>
                    ) : course.state === 'retake' ? (
                      <button
                        type="button"
                        className="pd-course__cta pd-course__cta--retake"
                        onClick={() => navigate(`/courses/${course.id}`)}
                      >
                        Retake
                      </button>
                    ) : isLocked ? (
                      <span className="pd-course__lock" aria-label="Locked">
                        <Lock size={24} color="var(--text-secondary)" variant="Bold" />
                      </span>
                    ) : null}
                  </article>
                )
              })}
            </div>
          </section>

          {/* Certification */}
          <section className="pd-section">
            <h2 className="pd-section__title">Certification</h2>
            <ProgramCertificate
              unlocked={certificateUnlocked}
              onGetCertificate={() => showToast('success', 'Certificate downloaded')}
            />
          </section>
        </section>
      </div>

      <ToastContainer toasts={toasts} />
    </div>
  )
}

export default ProgramDetails
