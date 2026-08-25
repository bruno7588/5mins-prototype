import { Fragment, useState } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import {
  Add,
  ArchiveAdd,
  ArrowLeft2,
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
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb'
import Collapse from '../../components/Collapse/Collapse'
import '../my-team/MyTeam.css'
import '../workspace/Workspace.css'
import './ProgramCourseDetails.css'
import { getCourseDetail, findProgramForCourse, type CourseLesson } from './mockCourse'
import PhoneFrame from '../../components/mobile/PhoneFrame/PhoneFrame'
import QuizHeader from '../quiz-lab/components/QuizHeader'
import MatchPairsPartial from '../quiz-lab/formats/MatchPairsPartial'
import FillBlank from '../quiz-lab/formats/FillBlank'
import Categorization from '../quiz-lab/formats/Categorization'
import SequencingDnd from '../quiz-lab/formats/SequencingDnd'
import { TYPE_CONFIG } from '../../data/interactiveQuestions'
import type { CoursePreviewPayload } from '../your-courses/previewCourse'
import '../quiz-lab/quiz-lab.css'
import jewelsIllustration from '../../assets/programs/jewels.svg'
import certificateIllustration from '../../assets/programs/certificate.svg'

const SEGMENTS = 8

function LessonCard({ lesson, onOpen }: { lesson: CourseLesson; onOpen?: () => void }) {
  const isLocked = lesson.state === 'locked'
  const filled = Math.max(0, Math.min(SEGMENTS, Math.round(((lesson.progress ?? 0) / 100) * SEGMENTS)))
  return (
    <article
      className={`pcd-lesson${isLocked ? ' pcd-lesson--locked' : ''}${onOpen ? ' pcd-lesson--openable' : ''}`}
      role={onOpen ? 'button' : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onClick={onOpen}
      onKeyDown={
        onOpen
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onOpen()
              }
            }
          : undefined
      }
    >
      {lesson.state === 'active' ? (
        <button type="button" className="pcd-tooltip">
          Start Here!
        </button>
      ) : null}
      <div className="pcd-lesson__thumb">
        <img src={lesson.thumbnail} alt="" />
        <span className="pcd-lesson__tag">
          <PlayCircle size={20} color="var(--text-primary)" variant="Bold" />
        </span>
      </div>
      <div className="pcd-lesson__info">
        <h4 className="pcd-lesson__title">{lesson.title}</h4>
        <div className="pcd-lesson__meta">
          <span className="pcd-lesson__metatext">{lesson.meta}</span>
          {isLocked ? (
            <Lock size={24} color="var(--text-disabled)" variant="Bold" />
          ) : (
            <span className="pcd-lesson__track">
              {Array.from({ length: SEGMENTS }).map((_, i) => (
                <span key={i} className={`pcd-seg${i < filled ? ' pcd-seg--filled' : ''}`} />
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

  /* The course builder's Preview hands the draft over in router state rather
     than saving it — the admin may be previewing a course that doesn't exist
     yet. Everything below renders the same either way. */
  const preview = (location.state as { preview?: CoursePreviewPayload } | null)?.preview ?? null
  const course = preview?.course ?? getCourseDetail(id)
  const program = preview ? undefined : findProgramForCourse(id)

  const [openQuizId, setOpenQuizId] = useState<number | null>(null)
  const openQuiz = openQuizId === null ? null : preview?.questions[openQuizId] ?? null

  const [tab, setTab] = useState<'course' | 'about' | 'resources'>('course')
  const [open, setOpen] = useState<Record<string, boolean>>(
    () => Object.fromEntries(course.sections.map((s) => [s.id, true])),
  )
  const toggle = (sid: string) => setOpen((o) => ({ ...o, [sid]: !o[sid] }))

  return (
    <div className="mt-app">
      {/* Preview mode needs its own way out — the learner chrome has no route
          back to the builder the admin came from. */}
      {preview && (
        <div className="pcd-previewbar">
          <span className="pcd-previewbar__label">
            <Badge type="informative" label="Preview" />
            <span>This is how learners will see the course</span>
          </span>
          <button type="button" className="pcd-previewbar__back" onClick={() => navigate(-1)}>
            <ArrowLeft2 size={16} color="currentColor" variant="Linear" />
            Back to Editing
          </button>
        </div>
      )}
      {openQuiz && (
        <div className="pcd-quizstage" role="dialog" aria-modal="true" aria-label="Assessment preview">
          <PhoneFrame>
            <div className="ql-quizview">
              <QuizHeader
                label={TYPE_CONFIG[openQuiz.type].label}
                used={1}
                total={3}
                onClose={() => setOpenQuizId(null)}
              />
              {openQuiz.type === 'match-pairs' ? (
                <MatchPairsPartial question={openQuiz} />
              ) : openQuiz.type === 'fill-blank' ? (
                <FillBlank question={openQuiz} formatKey="fill-blank" />
              ) : openQuiz.type === 'categorization' ? (
                <Categorization question={openQuiz} formatKey="categorization" />
              ) : (
                <SequencingDnd question={openQuiz} />
              )}
            </div>
          </PhoneFrame>
        </div>
      )}
      <header className="mt-topnav">
        <button type="button" className="mt-topnav__logo" aria-label="Home" onClick={() => navigate('/workspace')}>
          <Logo size={22} />
        </button>
        <div className="mt-topnav__right">
          <button type="button" className="mt-topnav__textbtn">
            <Mobile size={20} color="var(--text-secondary)" variant="Linear" />
            <span>Get App</span>
          </button>
          <button type="button" className="mt-topnav__outlinebtn">
            <Add size={20} color="currentColor" variant="Linear" />
            <span>Create</span>
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

        <section className="mt-body pcd-body">
          <div className="pcd-cover" aria-hidden style={{ backgroundImage: `url(${course.thumbnail})` }} />

          <div className="pcd-content">
            {/* Header */}
            <header className="pcd-header">
              {program && (
                <Breadcrumb
                  items={[
                    { label: program.title, onClick: () => navigate(`/programs/${program.id}`) },
                    { label: course.title },
                  ]}
                />
              )}
              <div className="pcd-header__top">
                <div className="pcd-header__info">
                  <span className="pcd-meta__item">
                    <PlayCircle size={16} color="var(--text-tertiary)" variant="Linear" />
                    <span>{course.lessonCount} lessons</span>
                  </span>
                  <span className="pcd-meta__item">
                    <Clock size={16} color="var(--text-tertiary)" variant="Linear" />
                    <span>{course.durationLabel}</span>
                  </span>
                  <Badge type="warning" icon label={course.statusLabel} />
                </div>
                <div className="pcd-header__actions">
                  <button type="button" className="pcd-iconbtn" aria-label="Save">
                    <ArchiveAdd size={24} color="var(--text-primary)" variant="Linear" />
                  </button>
                  <button type="button" className="pcd-iconbtn" aria-label="Share">
                    <Share size={24} color="var(--text-primary)" variant="Linear" />
                  </button>
                  <button type="button" className="pcd-iconbtn" aria-label="Add to calendar">
                    <CalendarAdd size={24} color="var(--text-primary)" variant="Linear" />
                  </button>
                </div>
              </div>

              <div className="pcd-header__title">
                <h1 className="pcd-title">{course.title}</h1>
                <div className="pcd-helper">
                  <span className="pcd-helper__item">
                    <img className="pcd-helper__icon" src={jewelsIllustration} alt="" />
                    <span>Earn {course.jewels} jewels</span>
                  </span>
                  <span className="pcd-helper__item">
                    <img className="pcd-helper__icon" src={certificateIllustration} alt="" />
                    <span>Certificate of completion</span>
                  </span>
                  <span className="pcd-helper__item">
                    <InfoCircle size={20} color="var(--text-tertiary)" variant="Linear" />
                    <span>Pass Score: {course.passScore}%</span>
                  </span>
                </div>
              </div>

              <div className="pcd-progress">
                <div
                  className="pcd-progress__track"
                  role="progressbar"
                  aria-valuenow={course.progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div className="pcd-progress__fill" style={{ width: `${course.progress}%` }} />
                </div>
                <span className="pcd-progress__pct">{course.progress}%</span>
              </div>
            </header>

            {/* Tabs */}
            <nav className="pcd-tabs">
              <button
                type="button"
                className={`pcd-tab${tab === 'course' ? ' pcd-tab--active' : ''}`}
                onClick={() => setTab('course')}
              >
                Course
              </button>
              <button
                type="button"
                className={`pcd-tab${tab === 'about' ? ' pcd-tab--active' : ''}`}
                onClick={() => setTab('about')}
              >
                About
              </button>
              <button
                type="button"
                className={`pcd-tab${tab === 'resources' ? ' pcd-tab--active' : ''}`}
                onClick={() => setTab('resources')}
              >
                Resources
                <span className="pcd-tab__count">3</span>
              </button>
            </nav>

            {/* Course outline */}
            {tab === 'course' ? (
              <div className="pcd-outline">
                {course.sections.map((section, idx) => (
                  <Fragment key={section.id}>
                    <div className="pcd-section">
                      <button
                        type="button"
                        className="pcd-section__header"
                        onClick={() => toggle(section.id)}
                        aria-expanded={open[section.id]}
                      >
                        <span className="pcd-section__headline">
                          <span className="pcd-section__name">{section.name}</span>
                          <span className="pcd-section__summary">{section.summary}</span>
                        </span>
                        <span className={`pcd-section__chevron${open[section.id] ? '' : ' pcd-section__chevron--closed'}`}>
                          <ArrowUp2 size={20} color="var(--text-secondary)" variant="Linear" />
                        </span>
                      </button>
                      <Collapse open={open[section.id]}>
                        <div className="pcd-section__lessons">
                          {section.lessons.map((lesson) => (
                            <LessonCard
                              key={lesson.id}
                              lesson={lesson}
                              onOpen={
                                lesson.questionId !== undefined
                                  ? () => setOpenQuizId(lesson.questionId!)
                                  : undefined
                              }
                            />
                          ))}
                        </div>
                      </Collapse>
                    </div>
                    {idx < course.sections.length - 1 ? <div className="pcd-divider" /> : null}
                  </Fragment>
                ))}
              </div>
            ) : (
              <div className="pcd-empty">Nothing here yet.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export default ProgramCourseDetails
