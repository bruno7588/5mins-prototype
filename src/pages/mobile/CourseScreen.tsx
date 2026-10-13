import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArchiveAdd, ArrowLeft, Clock, Lock, PlayCircle, Send2, TickCircle } from 'iconsax-react'
import { MobileStatusBar } from '@/components/mobile/TopNav/TopNav'
import MobileLessonCard from '@/components/mobile/LessonCard/LessonCard'
import MobileAssessmentCard from '@/components/mobile/AssessmentCard/AssessmentCard'
import ResourceCard from '@/components/ResourceCard/ResourceCard'
import Button from '@/components/Button/Button'
import { ARRIVE, arriveTransition } from '@/components/AIWorkingCard/arrive'
import { getCourseDetail } from '@/pages/courses/mockCourse'
import {
  courseProgressWithSignOff,
  signOffState,
  useSignOff,
} from '@/data/trainerSignOff'
import jewelsIllustration from '@/assets/programs/jewels.svg'
import certificateIllustration from '@/assets/programs/certificate.svg'
import penNib from '@/assets/sign-off/pen-nib.svg'
import courseMedallion from '@/assets/sign-off/certificate-medallion.svg'
import './CourseScreen.css'

const SEGMENTS = 8

/** "Lesson · Dr. Amara Okafor · 6 min" → ["Lesson", "Dr. Amara Okafor", "6 min"] */
const metaParts = (meta: string) => meta.split(' · ')

interface CourseScreenProps {
  courseId: string
  onBack: () => void
  onStartSignOff: () => void
  /** Opens the certificate view once the course is complete. */
  onGetCertificate: () => void
}

/**
 * Mobile course details (DES-335, D7), from Figma 13760:212196. The header with
 * its two-tone progress bar has no DS component, so it is built here from the
 * Figma with tokens (D13); the rest uses the mobile DS cards. Dark mode only.
 */
function CourseScreen({ courseId, onBack, onStartSignOff, onGetCertificate }: CourseScreenProps) {
  const reduce = useReducedMotion()
  const course = getCourseDetail(courseId)
  const signOff = useSignOff(course.id)
  const needsSignOff = !!course.requiresSignOff
  const [tab, setTab] = useState<'course' | 'about' | 'resources'>('course')

  const items = course.sections.flatMap((s) => s.lessons)
  const lessons = items.filter((l) => !l.meta.startsWith('Assessment'))
  const assessments = items.filter((l) => l.meta.startsWith('Assessment'))
  const resources = course.resources ?? []

  const progress = needsSignOff
    ? courseProgressWithSignOff(course.progress, items.length, !!signOff)
    : course.progress
  /* Two tones (Figma "Progress bar" 13760:212226): amber for steps completed,
     primary for the part still in progress, the rest the empty track. */
  const filled = Math.round((progress / 100) * SEGMENTS)
  const doneSteps = items.filter((l) => l.state === 'done').length + (signOff ? 1 : 0)
  const totalSteps = items.length + (needsSignOff ? 1 : 0)
  const done = Math.min(filled, Math.round((doneSteps / totalSteps) * SEGMENTS))

  const state = signOffState(course.progress, signOff)
  const certUnlocked = needsSignOff ? !!signOff : course.progress >= 100

  return (
    <motion.div className="m-course" {...ARRIVE(reduce)} transition={arriveTransition(reduce)}>
      <header className="m-course__hero" style={{ backgroundImage: `url(${course.thumbnail})` }}>
        <MobileStatusBar transparent />
        <div className="m-course__hero-actions">
          <button type="button" className="m-course__iconbtn" aria-label="Back" onClick={onBack}>
            <ArrowLeft size={20} color="var(--neutral-25)" variant="Linear" />
          </button>
          {/* Save and share are not part of this prototype: shown inert, not as decoys. */}
          <span className="m-course__hero-cta">
            <button type="button" className="m-course__iconbtn ui-disabled" aria-label="Save" tabIndex={-1} aria-disabled>
              <ArchiveAdd size={20} color="var(--neutral-25)" variant="Bold" />
            </button>
            <button type="button" className="m-course__iconbtn ui-disabled" aria-label="Share" tabIndex={-1} aria-disabled>
              <Send2 size={20} color="var(--neutral-25)" variant="Bold" />
            </button>
          </span>
        </div>

        <div className="m-course__card">
          <div className="m-course__meta">
            <span className="m-course__metaitem">
              <PlayCircle size={16} color="var(--text-secondary)" variant="Linear" />
              {course.lessonCount} lessons
            </span>
            <span className="m-course__metaitem">
              <Clock size={16} color="var(--text-secondary)" variant="Linear" />
              {course.durationLabel}
            </span>
          </div>
          <h1 className="m-course__title">{course.title}</h1>
          <div className="m-course__helper">
            <span className="m-course__helperitem">
              <img src={jewelsIllustration} alt="" width={20} height={20} />
              {course.jewels} jewels
            </span>
            <span className="m-course__helperitem">
              <img src={certificateIllustration} alt="" width={16} height={16} />
              Certificate
            </span>
            <span className="m-course__helperitem">Pass score: {course.passScore}%</span>
          </div>
          <div className="m-course__progress">
            <span
              className="m-course__track"
              role="progressbar"
              aria-label="Course completion"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              {Array.from({ length: SEGMENTS }).map((_, i) => (
                <span
                  key={i}
                  className={`m-course__seg${i < done ? ' m-course__seg--done' : i < filled ? ' m-course__seg--active' : ''}`}
                />
              ))}
            </span>
            <span className="m-course__pct">{progress}%</span>
          </div>
        </div>
      </header>

      <nav className="m-course__tabs" role="tablist" aria-label="Course sections">
        {(
          [
            { key: 'course', label: 'Course' },
            { key: 'about', label: 'About' },
            { key: 'resources', label: 'Resources', count: resources.length },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            className={`m-course__tab${tab === t.key ? ' m-course__tab--active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            <span className="m-course__tabrow">
              {t.label}
              {'count' in t && t.count > 0 ? <span className="m-course__tabcount">{t.count}</span> : null}
            </span>
          </button>
        ))}
      </nav>

      {tab === 'course' ? (
        <div className="m-course__body">
          <section className="m-course__section">
            <h2 className="m-course__sectiontitle">Lessons</h2>
            {lessons.map((l) => {
              const [type, instructor, duration] = metaParts(l.meta)
              return (
                <MobileLessonCard
                  key={l.id}
                  title={l.title}
                  typeLabel={type}
                  instructor={instructor ?? ''}
                  durationLabel={duration ?? ''}
                  image={l.thumbnail}
                  progress={l.progress ?? 0}
                  completed={l.state === 'done'}
                  disabled={l.state === 'locked'}
                />
              )
            })}
          </section>

          {assessments.length > 0 ? (
            <section className="m-course__section">
              <h2 className="m-course__sectiontitle">Assessments</h2>
              {assessments.map((a) => (
                <MobileAssessmentCard
                  key={a.id}
                  title={a.title}
                  assessmentType={metaParts(a.meta)[1] ?? 'Assessment'}
                  /* Not marked completed: its Review action has no screen in this prototype. */
                  disabled={a.state === 'locked'}
                />
              ))}
            </section>
          ) : null}

          {needsSignOff ? (
            <section className="m-course__section">
              <h2 className="m-course__sectiontitle">Sign-off</h2>
              <AnimatePresence initial={false} mode="wait">
                {/* Laid out as the DS mobile Assessment card (cards.md): 56px art, info column,
                    the button stacked under the text, a 20px lock when locked. */}
                <motion.div
                  key={state}
                  className={`m-course__signoff m-course__signoff--${state}`}
                  {...ARRIVE(reduce)}
                  exit={{ opacity: 0 }}
                  transition={arriveTransition(reduce)}
                >
                  <img className="m-course__signoff-art" src={penNib} alt="" width={56} height={56} />
                  <div className="m-course__signoff-info">
                    {state === 'completed' && signOff ? (
                      <p className="m-course__signoff-title m-course__signoff-title--done">
                        Signed off
                        <TickCircle size={16} color="var(--success-500)" variant="Bold" aria-hidden="true" />
                      </p>
                    ) : (
                      <>
                        <p className="m-course__signoff-title">Licence holder sign-off</p>
                        <p className="m-course__signoff-body">
                          {state === 'locked'
                            ? 'Complete the course first. Then your personal licence holder signs off your training here.'
                            : 'Find your personal licence holder and hand them your device. They fill in their licence details.'}
                        </p>
                      </>
                    )}
                    {state === 'ready' ? (
                      <Button variant="filled" size="sm" onClick={onStartSignOff} className="m-course__signoff-cta">
                        Sign-Off
                      </Button>
                    ) : null}
                  </div>
                  {state === 'locked' ? <Lock size={20} color="var(--text-disabled)" variant="Bold" aria-label="Locked" /> : null}
                </motion.div>
              </AnimatePresence>
            </section>
          ) : null}

          <section className="m-course__section">
            <h2 className="m-course__sectiontitle">Certification</h2>
            {/* Production's certificate row, the Sign-off card's sibling; once unlocked, Get Certificate
                sits under the text as the Assessment card places its button. */}
            <div className={`m-course__signoff${certUnlocked ? ' m-course__signoff--action' : ''}`}>
              <img
                className={`m-course__signoff-art${certUnlocked ? '' : ' m-course__cert-art--locked'}`}
                src={courseMedallion}
                alt=""
                width={56}
                height={56}
              />
              <div className="m-course__signoff-info">
                <p className="m-course__signoff-title">Certificate of completion</p>
                <p className="m-course__signoff-body">
                  {certUnlocked
                    ? 'Your certificate is ready.'
                    : needsSignOff
                      ? 'Complete all lessons and the sign-off to unlock your certificate.'
                      : 'Complete all lessons to unlock your certificate.'}
                </p>
                {certUnlocked ? (
                  <Button variant="filled" size="sm" onClick={onGetCertificate} className="m-course__signoff-cta">
                    Get Certificate
                  </Button>
                ) : null}
              </div>
              {certUnlocked ? null : <Lock size={20} color="var(--text-tertiary)" variant="Bold" aria-label="Locked" />}
            </div>
          </section>
        </div>
      ) : tab === 'resources' && resources.length > 0 ? (
        <div className="m-course__body">
          {resources.map((r) => (
            <ResourceCard key={r.id} type={r.type} title={r.title} size={r.size} device="mobile" />
          ))}
        </div>
      ) : (
        <p className="m-course__empty">Nothing here yet.</p>
      )}
    </motion.div>
  )
}

export default CourseScreen
