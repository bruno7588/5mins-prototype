import { useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowDown2, ArrowLeft, Clock, PlayCircle } from 'iconsax-react'
import { MobileStatusBar } from '@/components/mobile/TopNav/TopNav'
import BottomSheet from '@/components/BottomSheet/BottomSheet'
import CourseOutlineList from '@/components/CourseOutlineList/CourseOutlineList'
import { SituationalBrief } from '@/components/SituationalTestPlayer/SituationalTestPlayer'
import {
  ReviewAnswers,
  scoreOf,
  SituationalResults,
  type QuestionResults,
} from '@/components/SituationalTestPlayer/SituationalResults'
import { ARRIVE, arriveTransition } from '@/components/AIWorkingCard/arrive'
import { getCourseDetail } from '@/pages/courses/mockCourse'
import { feedLessons, type FeedLesson } from '@/pages/for-you/feedItems'
import { FEED_ATTEMPTS, getCourseFeed, isFeedItemUnlocked } from '@/data/courseFeed'
import CourseAssessment from '@/components/CourseAssessment/CourseAssessment'
import LessonQuizResult from '@/components/LessonQuizResult/LessonQuizResult'
import CloseButton from '@/components/CloseButton/CloseButton'
import QuizHeader from '@/pages/quiz-lab/components/QuizHeader'
import { QuizAdvanceContext } from '@/pages/quiz-lab/components/FeedbackFooter'
import ToastContainer, { useToast } from '@/components/Toast/Toast'
import LessonFeedScreen from './LessonFeedScreen'
import { MobileSituationalQuestions } from './SituationalTestScreen'
import './CourseFeedScreen.css'

const SEGMENTS = 8

/**
 * The course feed in the app (Figma "Course Feed V2", mobile block): the course's
 * situational test, then its lessons, swiped vertically. The header's "Course outline"
 * pill opens the outline in a bottom sheet (17024:75125), whose rows jump to an item.
 */
function CourseFeedScreen({ courseId, onExit }: { courseId: string; onExit: () => void }) {
  const reduce = useReducedMotion()
  const course = getCourseDetail(courseId)
  const items = getCourseFeed(courseId)

  const [index, setIndex] = useState(0)
  const [reached, setReached] = useState(0)
  const [done, setDone] = useState<Set<string>>(new Set())
  const [inQuestions, setInQuestions] = useState(false)
  /* The situational test: how the attempt in progress went, the attempts spent, and
     whether its results are showing in place of the brief. */
  const [results, setResults] = useState<QuestionResults>([])
  /* Attempts are counted per test: a course can have several. */
  const [testAttempts, setTestAttempts] = useState<Record<string, number>>({})
  const [showResults, setShowResults] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)
  /* A lesson quiz in progress: the lesson it follows, how it is going, and whether its
     result is showing. Attempts are counted per lesson. */
  const [quizFor, setQuizFor] = useState<number | null>(null)
  const [quizResults, setQuizResults] = useState<QuestionResults>([])
  const [quizDone, setQuizDone] = useState(false)
  const [quizAttempts, setQuizAttempts] = useState<Record<string, number>>({})
  const { toasts, show: showToast } = useToast()
  /* Where the scenario media was left: the brief card and the View Brief sheet share it. */
  const mediaPosition = useRef(0)
  const [outlineOpen, setOutlineOpen] = useState(false)
  /* Bumped when the outline jumps to a lesson, so the lesson feed remounts there. */
  const [jump, setJump] = useState(0)

  const item = items[index]
  const attemptsUsed = testAttempts[item.id] ?? 0
  /* The lesson feed plays FeedLesson; the For You lessons stand in for the videos. */
  const lessons: FeedLesson[] = items
    .filter((it) => it.kind === 'lesson')
    .map((it, i) => ({ ...feedLessons[i % feedLessons.length], title: it.title }))
  const firstLesson = items.findIndex((it) => it.kind === 'lesson')

  const open = (to: number) => {
    /* Each test's media starts from the beginning. */
    if (to !== index) mediaPosition.current = 0
    setReached((r) => Math.max(r, to))
    setIndex(to)
    setJump((j) => j + 1)
  }

  /* Swiping on leaves the lessons above complete, except one whose quiz is still to do:
     that quiz opens first (Figma callout 17024:84954). */
  const onLessonChange = (lessonIndex: number) => {
    const to = firstLesson + lessonIndex
    if (to === index) return
    const hasPendingQuiz = (i: number) => {
      const it = items[i]
      return it.kind === 'lesson' && !!it.quiz && !done.has(it.id)
    }
    setDone((prev) => {
      const next = new Set(prev)
      items.slice(firstLesson, to).forEach((it, i) => {
        if (!hasPendingQuiz(firstLesson + i)) next.add(it.id)
      })
      return next
    })
    if (to > index) {
      for (let i = index; i < to; i++) {
        if (hasPendingQuiz(i)) {
          setQuizResults([])
          setQuizDone(false)
          setQuizFor(i)
          break
        }
      }
    }
    setReached((r) => Math.max(r, to))
    setIndex(to)
  }

  const quizLesson = quizFor === null ? null : items[quizFor]
  const quizItem = quizLesson && quizLesson.kind === 'lesson' ? quizLesson : null

  const progress = Math.round(course.progress + (100 - course.progress) * (done.size / items.length))
  const filled = Math.round((progress / 100) * SEGMENTS)

  const startAttempt = () => {
    setResults([])
    setInQuestions(true)
  }

  const header = (overlay: boolean) => (
    <div className={`m-cfeed__top${overlay ? ' m-cfeed__top--overlay' : ''}`}>
      <MobileStatusBar transparent={overlay} />
      <div className="m-cfeed__header">
        <button type="button" className="m-cfeed__back" aria-label="Back" onClick={onExit}>
          <ArrowLeft size={24} color="var(--text-primary)" variant="Linear" />
        </button>
        <button type="button" className="m-cfeed__pill" aria-haspopup="dialog" onClick={() => setOutlineOpen(true)}>
          Course outline
          <ArrowDown2 size={20} color="var(--text-secondary)" variant="Linear" />
        </button>
        <span className="m-cfeed__slot" aria-hidden="true" />
      </div>
    </div>
  )

  return (
    <div className="m-cfeed">
      <AnimatePresence mode="wait" initial={false}>
        {item.kind === 'situational-test' ? (
          <motion.div
            key={showResults ? `${item.id}-results-${attemptsUsed}` : `${item.id}-test`}
            className="m-cfeed__screen"
            {...ARRIVE(reduce)}
            exit={{ opacity: 0 }}
            transition={arriveTransition(reduce)}
          >
            {header(false)}
            {showResults ? (
              <SituationalResults
                variant="mobile"
                score={scoreOf(results)}
                attemptsLeft={FEED_ATTEMPTS - attemptsUsed}
                onReview={() => setReviewOpen(true)}
                /* A retake starts the media from the beginning. */
                onRetake={() => {
                  mediaPosition.current = 0
                  startAttempt()
                }}
                onContinue={() => {
                  setShowResults(false)
                  if (index + 1 < items.length) open(index + 1)
                  else onExit()
                }}
              />
            ) : (
              <div className="m-cfeed__body">
                <SituationalBrief
                  variant="mobile"
                  title={item.test.title}
                  brief={item.test.brief}
                  media={item.test.media}
                  mediaPosition={mediaPosition}
                  onStart={startAttempt}
                />
              </div>
            )}
          </motion.div>
        ) : item.kind === 'assessment' ? (
          /* A course assessment keeps the feed's header and the tab bar (17024:75667). */
          <motion.div
            key={item.id}
            className="m-cfeed__screen m-cfeed__screen--quiz"
            {...ARRIVE(reduce)}
            exit={{ opacity: 0 }}
            transition={arriveTransition(reduce)}
          >
            {header(false)}
            <QuizAdvanceContext.Provider
              value={() => {
                setDone((prev) => new Set(prev).add(item.id))
                if (index + 1 < items.length) open(index + 1)
                else onExit()
              }}
            >
              <div className="ql-quizview m-cfeed__quiz">
                <QuizHeader
                  label={`Question ${item.position}/${item.count}`}
                  used={0}
                  total={FEED_ATTEMPTS}
                  showAttempts={false}
                  showHearts={item.assessment.type === 'multiple-choice'}
                  heartCount
                />
                <CourseAssessment
                  variant="mobile"
                  assessment={item.assessment}
                  onSubmitted={(message) => showToast('success', message)}
                />
              </div>
            </QuizAdvanceContext.Provider>
          </motion.div>
        ) : (
          <motion.div
            key={`lessons-${jump}`}
            className="m-cfeed__screen m-cfeed__screen--lessons"
            {...ARRIVE(reduce)}
            exit={{ opacity: 0 }}
            transition={arriveTransition(reduce)}
          >
            {header(true)}
            <LessonFeedScreen
              lessons={lessons}
              startIndex={index - firstLesson}
              sheetIndex={outlineOpen ? index - firstLesson : null}
              onMore={() => {}}
              onIndexChange={onLessonChange}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {inQuestions ? (
          <MobileSituationalQuestions
            key="questions"
            questions={item.kind === 'situational-test' ? item.test.questions : []}
            label={(n, total) => `Question ${n}/${total}`}
            brief={
              item.kind === 'situational-test'
                ? { title: item.test.title, text: item.test.brief, media: item.test.media, mediaPosition }
                : undefined
            }
            attemptsUsed={attemptsUsed}
            onResult={(i, correct) =>
              setResults((prev) => {
                const next = [...prev]
                next[i] = correct
                return next
              })
            }
            onClose={() => setInQuestions(false)}
            onComplete={() => {
              setInQuestions(false)
              setTestAttempts((prev) => ({ ...prev, [item.id]: (prev[item.id] ?? 0) + 1 }))
              setDone((prev) => new Set(prev).add(item.id))
              setShowResults(true)
            }}
          />
        ) : null}
        {quizItem && !quizDone ? (
          <MobileSituationalQuestions
            key={`quiz-${quizAttempts[quizItem.id] ?? 0}`}
            questions={quizItem.quiz ?? []}
            label={(n, total) => `Lesson Quiz (${n}/${total})`}
            ariaLabel="Lesson quiz"
            attemptsUsed={quizAttempts[quizItem.id] ?? 0}
            onResult={(i, correct) =>
              setQuizResults((prev) => {
                const next = [...prev]
                next[i] = correct
                return next
              })
            }
            onClose={() => setQuizFor(null)}
            onComplete={() => {
              setQuizAttempts((prev) => ({ ...prev, [quizItem.id]: (prev[quizItem.id] ?? 0) + 1 }))
              setDone((prev) => new Set(prev).add(quizItem.id))
              setQuizDone(true)
            }}
          />
        ) : null}
        {quizItem && quizDone ? (
          <motion.div
            key="quiz-result"
            className="m-cfeed-review"
            role="dialog"
            aria-modal="true"
            aria-label="Lesson quiz result"
            {...ARRIVE(reduce)}
            exit={{ opacity: 0 }}
            transition={arriveTransition(reduce)}
          >
            <MobileStatusBar />
            <div className="m-cfeed-quizresult__close">
              <CloseButton size={32} ariaLabel="Close" onClick={() => setQuizFor(null)} />
            </div>
            <LessonQuizResult
              variant="mobile"
              results={quizResults}
              points={quizItem.quizPoints ?? 0}
              attemptsLeft={FEED_ATTEMPTS - (quizAttempts[quizItem.id] ?? 0)}
              onRetake={() => {
                setQuizResults([])
                setQuizDone(false)
              }}
              onContinue={() => setQuizFor(null)}
            />
          </motion.div>
        ) : null}
        {reviewOpen && item.kind === 'situational-test' ? (
          <motion.div
            key="review"
            className="m-cfeed-review"
            role="dialog"
            aria-modal="true"
            aria-label="Review answers"
            {...ARRIVE(reduce)}
            exit={{ opacity: 0 }}
            transition={arriveTransition(reduce)}
          >
            <MobileStatusBar />
            <div className="m-cfeed__header m-cfeed-review__header">
              <button type="button" className="m-cfeed__back" aria-label="Back" onClick={() => setReviewOpen(false)}>
                <ArrowLeft size={24} color="var(--text-primary)" variant="Linear" />
              </button>
              <h2 className="m-cfeed-review__title">Review answers</h2>
              <span className="m-cfeed__slot" aria-hidden="true" />
            </div>
            <div className="m-cfeed-review__body">
              <ReviewAnswers variant="mobile" questions={item.test.questions} results={results} />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <ToastContainer toasts={toasts} />

      {outlineOpen ? (
        <BottomSheet ariaLabel="Course outline" onClose={() => setOutlineOpen(false)} className="m-cfeed-sheet">
          <div className="bottom-sheet__content m-cfeed-sheet__content">
            <div className="m-cfeed-sheet__head">
              <h2 className="m-cfeed-sheet__title">{course.title}</h2>
              <div className="m-cfeed-sheet__meta">
                <span>
                  <PlayCircle size={16} color="var(--text-tertiary)" variant="Linear" />
                  {course.lessonCount} lessons
                </span>
                <span>
                  <Clock size={16} color="var(--text-tertiary)" variant="Linear" />
                  {course.durationLabel}
                </span>
              </div>
              <div className="m-cfeed-sheet__progress">
                <span
                  className="m-cfeed-sheet__track"
                  role="progressbar"
                  aria-label="Course progress"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  {Array.from({ length: SEGMENTS }).map((_, i) => (
                    <span key={i} className={`m-cfeed-sheet__seg${i < filled ? ' m-cfeed-sheet__seg--filled' : ''}`} />
                  ))}
                </span>
                <span className="m-cfeed-sheet__pct">{progress}%</span>
              </div>
            </div>
            <CourseOutlineList
              items={items}
              index={index}
              done={done}
              isUnlocked={(i) => isFeedItemUnlocked(items, i, reached, done)}
              onSelect={(i) => {
                setOutlineOpen(false)
                open(i)
              }}
            />
          </div>
        </BottomSheet>
      ) : null}
    </div>
  )
}

export default CourseFeedScreen
