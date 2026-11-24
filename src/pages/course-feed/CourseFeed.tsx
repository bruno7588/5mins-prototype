import { useRef, useState, type MutableRefObject } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowDown2, ArrowUp2, SidebarLeft, SidebarRight } from 'iconsax-react'
import CloseButton from '@/components/CloseButton/CloseButton'
import Tooltip from '@/components/Tooltip/Tooltip'
import QuizHeader from '@/pages/quiz-lab/components/QuizHeader'
import {
  QuizAdvanceContext,
  QuizFooterLayoutContext,
  QuizResultContext,
} from '@/pages/quiz-lab/components/FeedbackFooter'
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal'
import SideDrawer from '@/components/SideDrawer/SideDrawer'
import Button from '@/components/Button/Button'
import {
  LEAVE_BODY,
  LEAVE_TITLE,
  leaveIllustration,
  ReviewAnswers,
  scoreOf,
  SituationalResults,
  type QuestionResults,
} from '@/components/SituationalTestPlayer/SituationalResults'
import {
  SituationalBrief,
  SituationalQuestionScreen,
} from '@/components/SituationalTestPlayer/SituationalTestPlayer'
import { Bar, ExpandIcon, MoreIcon } from '@/pages/for-you/components/LessonFeed'
import { getCourseDetail } from '@/pages/courses/mockCourse'
import CourseOutlineList from '@/components/CourseOutlineList/CourseOutlineList'
import Collapse from '@/components/Collapse/Collapse'
import CourseAssessment from '@/components/CourseAssessment/CourseAssessment'
import ScenarioMedia from '@/components/ScenarioMedia/ScenarioMedia'
import LessonQuizResult from '@/components/LessonQuizResult/LessonQuizResult'
import ToastContainer, { useToast } from '@/components/Toast/Toast'
import {
  ASSESSMENT_TYPE_LABEL,
  FEED_ATTEMPTS,
  getCourseFeed,
  isFeedItemUnlocked,
  lockedReason,
  type CourseFeedItem,
} from '@/data/courseFeed'
import '@/pages/for-you/components/LessonFeed.css'
import './CourseFeed.css'

const RING = 40
const STROKE = 3
const RADIUS = (RING - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/** Course progress ring from the feed's top bar (Figma 17024:82013). */
function ProgressRing({ value }: { value: number }) {
  return (
    <span className="cf-ring" role="img" aria-label={`Course progress ${value}%`}>
      <svg width={RING} height={RING} viewBox={`0 0 ${RING} ${RING}`} aria-hidden="true">
        <circle className="cf-ring__track" cx={RING / 2} cy={RING / 2} r={RADIUS} strokeWidth={STROKE} />
        <circle
          className="cf-ring__value"
          cx={RING / 2}
          cy={RING / 2}
          r={RADIUS}
          strokeWidth={STROKE}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - value / 100)}
        />
      </svg>
      <span className="cf-ring__label" aria-hidden="true">
        {value}%
      </span>
    </span>
  )
}

/** What the details panel says about the item on screen (Figma 17024:82055, 17024:82609). */
function PanelDetails({
  item,
  inQuestions,
  mediaPosition,
}: {
  item: CourseFeedItem
  inQuestions: boolean
  mediaPosition: MutableRefObject<number>
}) {
  if (item.kind === 'situational-test') {
    /* While answering, the scenario stays beside the question: title, media where it
       was left, then the brief (DES-371). */
    return inQuestions ? (
      <div className="cf-panel__details cf-panel__details--brief">
        <p className="cf-panel__title">{item.test.title}</p>
        {item.test.media ? <ScenarioMedia media={item.test.media} position={mediaPosition} /> : null}
        <p className="cf-panel__text">{item.test.brief}</p>
      </div>
    ) : (
      <div className="cf-panel__details">
        <p className="cf-panel__title">Assessment</p>
        <p className="cf-panel__text">Situational test</p>
      </div>
    )
  }
  if (item.kind === 'assessment') {
    return (
      <div className="cf-panel__details">
        <p className="cf-panel__title">Assessment</p>
        <p className="cf-panel__text">{ASSESSMENT_TYPE_LABEL[item.assessment.type]}</p>
      </div>
    )
  }
  return (
    <div className="cf-panel__details">
      <p className="cf-panel__title">{item.title}</p>
      <p className="cf-panel__text">{item.meta}</p>
    </div>
  )
}

/**
 * Web course feed (Figma "Course Feed V2", 17024:73838): everything a course holds,
 * one item at a time, opened from course details. The arrows move between items, which
 * slide up and down; the details panel on the right follows the item on screen.
 */
function CourseFeed() {
  const navigate = useNavigate()
  const reduce = useReducedMotion()
  const { id } = useParams<{ id: string }>()
  const course = getCourseDetail(id)
  const items = getCourseFeed(id)

  const [index, setIndex] = useState(0)
  /* Inside a situational test: 0 is the brief, 1..n the questions, n + 1 the results. */
  const [screen, setScreen] = useState(0)
  /* How each question went on the attempt in progress, and the attempts spent. */
  const [results, setResults] = useState<QuestionResults>([])
  /* Attempts spent, per item: the test and each lesson quiz count their own. */
  const [attempts, setAttempts] = useState<Record<string, number>>({})
  const [reviewOpen, setReviewOpen] = useState(false)
  const [leaveOpen, setLeaveOpen] = useState(false)
  const { toasts, show: showToast } = useToast()
  /* Where the scenario media was left, in seconds: the brief card and the details
     panel share it, so the clip picks up where the learner stopped. */
  const mediaPosition = useRef(0)
  /* 1 = moving on (the next item rises from below), -1 = going back. */
  const [dir, setDir] = useState(1)
  const [done, setDone] = useState<Set<string>>(new Set())
  const [panelOpen, setPanelOpen] = useState(true)
  /* The furthest item the learner has got to; it decides what the outline unlocks. */
  const [reached, setReached] = useState(0)
  const [outlineOpen, setOutlineOpen] = useState(false)

  const item = items[index]
  const attemptsUsed = attempts[item.id] ?? 0
  /* The questions the item runs through: a situational test's, or a lesson's quiz. */
  const runQuestions =
    item.kind === 'situational-test' ? item.test.questions : item.kind === 'lesson' ? (item.quiz ?? []) : []
  const questionCount = runQuestions.length
  const question = screen > 0 && screen <= questionCount ? runQuestions[screen - 1] : null
  const onResults = questionCount > 0 && screen > questionCount
  /* A lesson's quiz is still to do: Next leads into it rather than past it. */
  const pendingQuiz = item.kind === 'lesson' && !!item.quiz && !done.has(item.id)
  const atFirst = index === 0
  const atLast = index === items.length - 1
  const backToCourse = () => navigate(`/courses/${id}`)

  const go = (to: number, complete: boolean) => {
    if (complete) setDone((prev) => new Set(prev).add(item.id))
    if (to >= items.length) return backToCourse()
    setReached((r) => Math.max(r, to))
    setDir(to > index ? 1 : -1)
    setScreen(0)
    setIndex(to)
  }

  /* Continue on a question: the next question, or the results once the last is answered,
     which spends an attempt and completes the test. */
  const advance = () => {
    if (questionCount === 0) return
    setDir(1)
    if (screen === questionCount) {
      setAttempts((prev) => ({ ...prev, [item.id]: (prev[item.id] ?? 0) + 1 }))
      setDone((prev) => new Set(prev).add(item.id))
    }
    setScreen((s) => s + 1)
  }

  const startAttempt = () => {
    setResults([])
    setDir(1)
    setScreen(1)
  }

  const unlocked = (i: number) => isFeedItemUnlocked(items, i, reached, done)
  const nextLocked = !atLast && !unlocked(index + 1)

  /* The ring starts from the course's own progress and fills as items are completed here. */
  const progress = Math.round(course.progress + (100 - course.progress) * (done.size / items.length))

  const slide = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0 } }
    : {
        initial: { opacity: 0, y: dir * 16 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: dir * -16 },
        transition: { duration: 0.3, ease: 'easeOut' as const },
      }

  return (
    <div className="cf">
      <header className="cf-topbar">
        {/* The same close the Programs builder's header uses (PageHeader). Leaving
            mid-test asks first (Figma 17024:82612). */}
        <Tooltip text="Close" position="Bottom" alignment="Start" icon={false}>
          <CloseButton
            variant="fullscreen"
            ariaLabel="Close"
            onClick={question ? () => setLeaveOpen(true) : backToCourse}
          />
        </Tooltip>
        <h1 className="cf-topbar__title">{course.title}</h1>
        <div className="cf-topbar__progress">
          <span className="cf-topbar__progresslabel">Course Progress</span>
          <ProgressRing value={progress} />
        </div>
      </header>

      <div className="cf-body">
        <main className="cf-main">
          <AnimatePresence mode="wait" initial={false} custom={dir}>
            <motion.div key={`${item.id}-${screen}-${attemptsUsed}`} className="cf-stage" {...slide}>
              {item.kind === 'lesson' && screen === 0 ? (
                <div className="cf-lesson">
                  <div className="lf-stage">
                    <div className="lf-video-wrap">
                      <div className="lf-video" role="img" aria-label={item.title}>
                        <img className="lf-video__media" src={item.media} alt="" />
                        <div className="lf-video__gradient" />
                        <div className="lf-video__progress">
                          <div className="lf-video__bars">
                            <Bar
                              progress={item.progress}
                              tone={item.progress >= 1 ? 'success' : 'primary'}
                              height={2}
                            />
                          </div>
                          <span className="lf-video__time">{item.duration}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : item.kind === 'assessment' ? (
                <QuizFooterLayoutContext.Provider value="hug">
                  <QuizAdvanceContext.Provider value={() => go(index + 1, true)}>
                    <div className="ql-quizview cf-quiz">
                      <QuizHeader
                        label={`Question ${item.position}/${item.count}`}
                        used={0}
                        total={FEED_ATTEMPTS}
                        showAttempts={false}
                        showHearts={item.assessment.type === 'multiple-choice'}
                      />
                      <CourseAssessment
                        variant="web"
                        assessment={item.assessment}
                        onSubmitted={(message) => showToast('success', message)}
                      />
                    </div>
                  </QuizAdvanceContext.Provider>
                </QuizFooterLayoutContext.Provider>
              ) : question ? (
                <QuizFooterLayoutContext.Provider value="hug">
                  <QuizAdvanceContext.Provider value={advance}>
                    <QuizResultContext.Provider
                      value={(correct) =>
                        setResults((prev) => {
                          const next = [...prev]
                          next[screen - 1] = correct
                          return next
                        })
                      }
                    >
                      <div className="ql-quizview cf-quiz">
                        <QuizHeader
                          label={
                            item.kind === 'lesson'
                              ? `Lesson Quiz (${screen}/${questionCount})`
                              : `Question ${screen}/${questionCount}`
                          }
                          used={attemptsUsed}
                          total={FEED_ATTEMPTS}
                          showAttempts={false}
                        />
                        <SituationalQuestionScreen question={question} />
                      </div>
                    </QuizResultContext.Provider>
                  </QuizAdvanceContext.Provider>
                </QuizFooterLayoutContext.Provider>
              ) : onResults && item.kind === 'lesson' ? (
                <div className="cf-results">
                  <LessonQuizResult
                    variant="web"
                    results={results}
                    points={item.quizPoints ?? 0}
                    attemptsLeft={FEED_ATTEMPTS - attemptsUsed}
                    onRetake={startAttempt}
                    onContinue={() => go(index + 1, true)}
                  />
                </div>
              ) : onResults ? (
                <div className="cf-results">
                  <SituationalResults
                    variant="web"
                    score={scoreOf(results)}
                    attemptsLeft={FEED_ATTEMPTS - attemptsUsed}
                    onReview={() => setReviewOpen(true)}
                    /* A retake starts the media from the beginning. */
                    onRetake={() => {
                      mediaPosition.current = 0
                      startAttempt()
                    }}
                    onContinue={() => go(index + 1, true)}
                  />
                </div>
              ) : item.kind === 'situational-test' ? (
                <div className="cf-brief">
                  <SituationalBrief
                    variant="web"
                    title={item.test.title}
                    brief={item.test.brief}
                    media={item.test.media}
                    mediaPosition={mediaPosition}
                    onStart={startAttempt}
                  />
                </div>
              ) : null}
            </motion.div>
          </AnimatePresence>

          {/* Action rail (Figma 17024:83182): details toggle, item arrows, lesson controls.
              Mid-test only the toggle shows: the way on is the question's own Continue. */}
          <div className="cf-rail">
            <Tooltip text={panelOpen ? 'Close details' : 'Open details'} position="Left" icon={false}>
              <button
                type="button"
                className="cf-rail__toggle"
                aria-label={panelOpen ? 'Close details' : 'Open details'}
                aria-expanded={panelOpen}
                onClick={() => setPanelOpen((open) => !open)}
              >
                {panelOpen ? (
                  <SidebarRight size={24} color="var(--text-primary)" variant="Linear" />
                ) : (
                  <SidebarLeft size={24} color="var(--text-primary)" variant="Linear" />
                )}
              </button>
            </Tooltip>
            {!question ? (
              <div className="lf-actions__arrows">
                <Tooltip text="Previous" position="Left" icon={false} disabled={atFirst}>
                  <button
                    type="button"
                    className="lf-icon-btn"
                    aria-label="Previous"
                    disabled={atFirst}
                    onClick={() => go(index - 1, false)}
                  >
                    <ArrowUp2 size={20} color="currentColor" variant="Linear" />
                  </button>
                </Tooltip>
                <Tooltip
                  text={!pendingQuiz && nextLocked ? lockedReason(item) : 'Next'}
                  position="Left"
                  icon={false}
                  disabled={!pendingQuiz && atLast}
                >
                  <button
                    type="button"
                    className="lf-icon-btn"
                    aria-label="Next"
                    disabled={!pendingQuiz && (atLast || nextLocked)}
                    /* A lesson with a quiz moves on into it (Figma callout 17024:84954). */
                    onClick={() => (pendingQuiz ? startAttempt() : go(index + 1, item.kind === 'lesson'))}
                  >
                    <ArrowDown2 size={20} color="currentColor" variant="Linear" />
                  </button>
                </Tooltip>
              </div>
            ) : null}
            {item.kind === 'lesson' && screen === 0 ? (
              <>
                <button type="button" className="lf-icon-btn ui-disabled" disabled aria-label="Full screen (coming soon)">
                  <ExpandIcon />
                </button>
                <button type="button" className="lf-icon-btn ui-disabled" disabled aria-label="More (coming soon)">
                  <MoreIcon />
                </button>
              </>
            ) : null}
          </div>
        </main>

        <AnimatePresence initial={false}>
          {panelOpen ? (
            <motion.aside
              className="cf-panel"
              aria-label="Details"
              initial={reduce ? { opacity: 0 } : { opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, x: 16 }}
              transition={{ duration: reduce ? 0 : 0.3, ease: 'easeOut' }}
            >
              <button
                type="button"
                className="cf-panel__outline"
                aria-expanded={outlineOpen}
                onClick={() => setOutlineOpen((open) => !open)}
              >
                <span className="cf-panel__outlinetitle">Course outline</span>
                <span className={`cf-panel__chevron${outlineOpen ? ' cf-panel__chevron--open' : ''}`}>
                  <ArrowDown2 size={20} color="var(--text-secondary)" variant="Linear" />
                </span>
              </button>
              {/* As in production: the outline opens with a height animation and the
                  item's details fold away as it does; both stay mounted. */}
              <div className="cf-panel__content">
                <Collapse open={outlineOpen}>
                  <div className="cf-panel__list">
                    <CourseOutlineList
                      items={items}
                      index={index}
                      done={done}
                      isUnlocked={unlocked}
                      onSelect={(i) => go(i, false)}
                    />
                  </div>
                </Collapse>
                <Collapse open={!outlineOpen}>
                  <PanelDetails item={item} inQuestions={!!question} mediaPosition={mediaPosition} />
                </Collapse>
              </div>
            </motion.aside>
          ) : null}
        </AnimatePresence>
      </div>

      {item.kind === 'situational-test' ? (
        <SideDrawer
          open={reviewOpen}
          onClose={() => setReviewOpen(false)}
          title="Situational test"
          subtitle="Review your answers"
        >
          <ReviewAnswers variant="web" questions={item.test.questions} results={results} />
        </SideDrawer>
      ) : null}

      <ToastContainer toasts={toasts} />

      <ConfirmModal open={leaveOpen} onClose={() => setLeaveOpen(false)} ariaLabel={LEAVE_TITLE}>
        <div className="confirm-modal-header confirm-modal-header--center">
          <div className="confirm-modal-icon">
            <img src={leaveIllustration} width={72} height={72} alt="" />
          </div>
          <h2 className="confirm-modal-title">{LEAVE_TITLE}</h2>
          <p className="confirm-modal-body">{LEAVE_BODY}</p>
        </div>
        <div className="confirm-modal-actions confirm-modal-actions--center">
          <Button variant="outlined" onClick={backToCourse}>
            {item.kind === 'lesson' ? 'Exit Course' : 'Exit'}
          </Button>
          <Button onClick={() => setLeaveOpen(false)}>{item.kind === 'lesson' ? 'Resume Quiz' : 'Resume'}</Button>
        </div>
      </ConfirmModal>
    </div>
  )
}

export default CourseFeed
