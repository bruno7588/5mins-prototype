import { Fragment, useState } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import {
  Add,
  ArchiveAdd,
  ArrowUp2,
  CalendarAdd,
  Clock,
  FlashCircle,
  InfoCircle,
  Lock,
  Mobile,
  PlayCircle,
  Share,
  ShieldSecurity,
} from 'iconsax-react'
import { Logo, learnerSideItems } from '../my-team/MyTeam'
import ProfileMenu from '../../components/ProfileMenu/ProfileMenu'
import Badge from '../../components/Badge/Badge'
import Collapse from '../../components/Collapse/Collapse'
import '../my-team/MyTeam.css'
import '../workspace/Workspace.css'
import './ProgramCourseDetails.css'
import { getCourseDetail, type CourseLesson } from './mockCourse'
import jewelsIllustration from '../../assets/programs/jewels.svg'
import certificateIllustration from '../../assets/programs/certificate.svg'

const SEGMENTS = 8

function LessonCard({ lesson }: { lesson: CourseLesson }) {
  const isLocked = lesson.state === 'locked'
  const filled = Math.max(0, Math.min(SEGMENTS, Math.round(((lesson.progress ?? 0) / 100) * SEGMENTS)))
  return (
    <article className={`cd-lesson${isLocked ? ' cd-lesson--locked' : ''}`}>
      {lesson.state === 'active' ? (
        <button type="button" className="cd-tooltip">
          Start Here!
        </button>
      ) : null}
      <div className="cd-lesson__thumb">
        <img src={lesson.thumbnail} alt="" />
        <span className="cd-lesson__tag">
          <PlayCircle size={20} color="var(--text-primary)" variant="Bold" />
        </span>
      </div>
      <div className="cd-lesson__info">
        <h4 className="cd-lesson__title">{lesson.title}</h4>
        <div className="cd-lesson__meta">
          <span className="cd-lesson__metatext">{lesson.meta}</span>
          {isLocked ? (
            <Lock size={24} color="var(--text-disabled)" variant="Bold" />
          ) : (
            <span className="cd-lesson__track">
              {Array.from({ length: SEGMENTS }).map((_, i) => (
                <span key={i} className={`cd-seg${i < filled ? ' cd-seg--filled' : ''}`} />
              ))}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}

function ProgramCourseDetails() {
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams<{ id: string }>()
  const course = getCourseDetail(id)

  const [tab, setTab] = useState<'course' | 'about' | 'resources'>('course')
  const [open, setOpen] = useState<Record<string, boolean>>(
    () => Object.fromEntries(course.sections.map((s) => [s.id, true])),
  )
  const toggle = (sid: string) => setOpen((o) => ({ ...o, [sid]: !o[sid] }))

  return (
    <div className="mt-app">
      <header className="mt-topnav">
        <button type="button" className="mt-topnav__logo" aria-label="Home" onClick={() => navigate('/workspace')}>
          <Logo size={22} />
        </button>
        <div className="mt-topnav__right">
          <button type="button" className="mt-topnav__textbtn">
            <span>Get App</span>
            <Mobile size={20} color="var(--text-secondary)" variant="Linear" />
          </button>
          <button type="button" className="mt-topnav__outlinebtn">
            <span>Create</span>
            <Add size={20} color="var(--text-primary)" variant="Linear" />
          </button>
          <div className="mt-topnav__icons">
            <button type="button" className="mt-topnav__iconbtn" aria-label="Notifications">
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
                  <Icon size={24} color={isActive ? 'var(--secondary-500)' : 'var(--text-secondary)'} variant="Bold" />
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

        <section className="mt-body cd-body">
          <div className="cd-cover" aria-hidden style={{ backgroundImage: `url(${course.thumbnail})` }} />

          <div className="cd-content">
            {/* Header */}
            <header className="cd-header">
              <div className="cd-header__top">
                <div className="cd-header__info">
                  <span className="cd-meta__item">
                    <PlayCircle size={16} color="var(--text-tertiary)" variant="Linear" />
                    <span>{course.lessonCount} lessons</span>
                  </span>
                  <span className="cd-meta__item">
                    <Clock size={16} color="var(--text-tertiary)" variant="Linear" />
                    <span>{course.durationLabel}</span>
                  </span>
                  <Badge type="warning" icon label={course.statusLabel} />
                </div>
                <div className="cd-header__actions">
                  <button type="button" className="cd-iconbtn" aria-label="Save">
                    <ArchiveAdd size={24} color="var(--text-primary)" variant="Linear" />
                  </button>
                  <button type="button" className="cd-iconbtn" aria-label="Share">
                    <Share size={24} color="var(--text-primary)" variant="Linear" />
                  </button>
                  <button type="button" className="cd-iconbtn" aria-label="Add to calendar">
                    <CalendarAdd size={24} color="var(--text-primary)" variant="Linear" />
                  </button>
                </div>
              </div>

              <div className="cd-header__title">
                <h1 className="cd-title">{course.title}</h1>
                <div className="cd-helper">
                  <span className="cd-helper__item">
                    <img className="cd-helper__icon" src={jewelsIllustration} alt="" />
                    <span>Earn {course.jewels} jewels</span>
                  </span>
                  <span className="cd-helper__item">
                    <img className="cd-helper__icon" src={certificateIllustration} alt="" />
                    <span>Certificate of completion</span>
                  </span>
                  <span className="cd-helper__item">
                    <InfoCircle size={18} color="var(--text-tertiary)" variant="Linear" />
                    <span>Pass Score: {course.passScore}%</span>
                  </span>
                </div>
              </div>

              <div className="cd-progress">
                <div
                  className="cd-progress__track"
                  role="progressbar"
                  aria-valuenow={course.progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div className="cd-progress__fill" style={{ width: `${course.progress}%` }} />
                </div>
                <span className="cd-progress__pct">{course.progress}%</span>
              </div>
            </header>

            {/* Tabs */}
            <nav className="cd-tabs">
              <button
                type="button"
                className={`cd-tab${tab === 'course' ? ' cd-tab--active' : ''}`}
                onClick={() => setTab('course')}
              >
                Course
              </button>
              <button
                type="button"
                className={`cd-tab${tab === 'about' ? ' cd-tab--active' : ''}`}
                onClick={() => setTab('about')}
              >
                About
              </button>
              <button
                type="button"
                className={`cd-tab${tab === 'resources' ? ' cd-tab--active' : ''}`}
                onClick={() => setTab('resources')}
              >
                Resources
                <span className="cd-tab__count">3</span>
              </button>
            </nav>

            {/* Course outline */}
            {tab === 'course' ? (
              <div className="cd-outline">
                {course.sections.map((section, idx) => (
                  <Fragment key={section.id}>
                    <div className="cd-section">
                      <button
                        type="button"
                        className="cd-section__header"
                        onClick={() => toggle(section.id)}
                        aria-expanded={open[section.id]}
                      >
                        <span className="cd-section__headline">
                          <span className="cd-section__name">{section.name}</span>
                          <span className="cd-section__summary">{section.summary}</span>
                        </span>
                        <span className={`cd-section__chevron${open[section.id] ? '' : ' cd-section__chevron--closed'}`}>
                          <ArrowUp2 size={20} color="var(--text-secondary)" variant="Linear" />
                        </span>
                      </button>
                      <Collapse open={open[section.id]}>
                        <div className="cd-section__lessons">
                          {section.lessons.map((lesson) => (
                            <LessonCard key={lesson.id} lesson={lesson} />
                          ))}
                        </div>
                      </Collapse>
                    </div>
                    {idx < course.sections.length - 1 ? <div className="cd-divider" /> : null}
                  </Fragment>
                ))}
              </div>
            ) : (
              <div className="cd-empty">Nothing here yet.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export default ProgramCourseDetails
