import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { gsap } from 'gsap'
import { ArrowLeft2, ArrowRight2, Clock, PlayCircle, Routing } from 'iconsax-react'
import Button from '@/components/Button/Button'
import CollectionPlayIcon from '@/components/icons/CollectionPlayIcon'
import CourseIcon from '@/components/icons/CourseIcon'
import {
  currentCourse,
  featuredPrograms,
  minutesLeft,
  upNextCourse,
} from '@/pages/programs/featuredPrograms'
import type { ProgramCourse, WorkspaceCourse, WorkspaceProgram } from '@/pages/workspace/mockItems'
import { rgba, useThumbnailAccents } from '@/hooks/thumbnailAccents'
import './WorkspaceBanner.css'

const SEGMENTS = 8
const META_ICON = 'var(--text-secondary)'
/** Dwell time per banner before it slides on to the next. */
const SLIDE_MS = 5000
/* Slower off the mark and slower into the stop than power2 — the banner eases
   out of rest rather than snapping into the slide. */
const SLIDE_EASE = 'power3.inOut'
const SLIDE_SECONDS = 1.4

interface Props {
  courses: WorkspaceCourse[]
  programs: WorkspaceProgram[]
  /** Open the course the learner is part-way through. */
  onOpenCourse?: (course: WorkspaceCourse) => void
  /** "View My Courses" — the enrolled-courses shelf further down the page. */
  onViewCourses?: () => void
  /** Program not started yet — open its overview. */
  onStartProgram?: (program: WorkspaceProgram) => void
  /** Enrolled — jump straight into the course they left off on. */
  onResumeProgram?: (program: WorkspaceProgram, course: ProgramCourse) => void
}

/**
 * The hero banners at the top of the Workspace: the course the learner is
 * part-way through (Figma 3733:61924), then one program banner per state a
 * program can be in — ready, scheduled, mid-course, between (Figma 3733:62030).
 *
 * They slide left every 5s on an ease-in-out ramp, and the chevrons in the
 * footer step between them by hand. All sit on one track so they share a
 * height and nothing shifts as they advance.
 */
function WorkspaceBanner({
  courses,
  programs,
  onOpenCourse,
  onViewCourses,
  onStartProgram,
  onResumeProgram,
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)

  /* The course they are part-way through — the one worth offering to resume. */
  const course = courses.find((c) => c.progress > 0 && c.progress < 100)
  /* One program per state it can be in: ready, scheduled, mid-course, between. */
  const featured = featuredPrograms(programs)

  const keys = [course ? 'course' : null, ...featured.map((p) => p.id)].filter(Boolean)
  const count = keys.length

  /* Auto-advance, unless the viewer asked for less motion. */
  useEffect(() => {
    if (count < 2) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setTimeout(() => setIndex((i) => (i + 1) % count), SLIDE_MS)
    return () => window.clearTimeout(timer)
  }, [index, count])

  /* One slide width per step. The track is as wide as the frame — the slides
     overflow it — so a percentage of its own width is exactly one banner. */
  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    gsap.to(el, {
      xPercent: -100 * index,
      duration: reduced ? 0 : SLIDE_SECONDS,
      ease: SLIDE_EASE,
      overwrite: true,
    })
  }, [index])

  if (count === 0) return null

  const go = (dir: number) => setIndex((i) => (i + dir + count) % count)

  const nav =
    count > 1 ? (
      <div className="wsb__nav">
        <button type="button" className="wsb__navbtn" aria-label="Previous banner" onClick={() => go(-1)}>
          <ArrowLeft2 size={16} color="var(--text-secondary)" variant="Linear" />
        </button>
        <button type="button" className="wsb__navbtn" aria-label="Next banner" onClick={() => go(1)}>
          <ArrowRight2 size={16} color="var(--text-secondary)" variant="Linear" />
        </button>
      </div>
    ) : null

  return (
    <section className="wsb" aria-roledescription="carousel" aria-label="Continue learning">
      <div className="wsb__track" ref={trackRef}>
        {course ? (
          <CourseSlide
            course={course}
            hidden={keys.indexOf('course') !== index}
            nav={nav}
            onOpen={() => onOpenCourse?.(course)}
            onViewCourses={onViewCourses}
          />
        ) : null}
        {featured.map((program) => (
          <ProgramSlide
            key={program.id}
            program={program}
            hidden={keys.indexOf(program.id) !== index}
            nav={nav}
            onStart={() => onStartProgram?.(program)}
            onResume={(next) => onResumeProgram?.(program, next)}
          />
        ))}
      </div>
    </section>
  )
}

/** Shared shell: 300px thumbnail with the content-type tag, then the body. */
function Shell({
  image,
  gradient,
  tag,
  hidden,
  children,
}: {
  image?: string
  gradient: string
  tag: React.ReactNode
  hidden: boolean
  children: React.ReactNode
}) {
  /* The banner wears its thumbnail's own colours: the dominant one draws the
     hairline round the image and opens the wash, the runner-up closes it, and
     the corner tag repeats the wash. Neutral until the image has decoded. */
  const accents = useThumbnailAccents(image)
  const accented = accents
    ? ({
        '--wsb-accent': rgba(accents.primary, 1),
        '--wsb-tint': `linear-gradient(112.73deg, ${rgba(accents.primary, 0.24)} 0%, ${rgba(
          accents.secondary,
          0.24,
        )} 100%)`,
      } as CSSProperties)
    : undefined

  return (
    <article className="wsb__slide" style={accented} aria-hidden={hidden} inert={hidden}>
      <div className="wsb__thumb">
        <div
          className="wsb__image"
          style={image ? { backgroundImage: `url(${image})` } : { background: gradient }}
        />
        <span className="wsb__tag">{tag}</span>
      </div>
      <div className="wsb__body">{children}</div>
    </article>
  )
}

function CourseSlide({
  course,
  hidden,
  nav,
  onOpen,
  onViewCourses,
}: {
  course: WorkspaceCourse
  hidden: boolean
  nav: React.ReactNode
  onOpen: () => void
  onViewCourses?: () => void
}) {
  /* Whole minutes of runtime still ahead of them. */
  const left = Math.max(1, Math.round(course.durationMinutes * (1 - course.progress / 100)))

  return (
    <Shell
      image={course.image}
      gradient={course.thumbnailGradient}
      hidden={hidden}
      tag={
        <>
          <CourseIcon size={16} color="var(--text-primary)" variant="Bold" />
          <span>Course</span>
        </>
      }
    >
      <div className="wsb__header">
        <div className="wsb__meta">
          <span className="wsb__metaitem">
            <PlayCircle size={16} color={META_ICON} variant="Linear" />
            <span>{course.lessonCount} lessons</span>
          </span>
          <span className="wsb__metaitem">
            <Clock size={16} color={META_ICON} variant="Linear" />
            <span>{course.progress > 0 ? `${left} min left` : `${course.durationMinutes} min`}</span>
          </span>
        </div>

        <h2 className="wsb__title">{course.title}</h2>

        <Progress value={course.progress} label="Course completion" />
      </div>

      <div className="wsb__footer">
        <Button variant="outlined-2" onClick={onViewCourses}>
          View My Courses
        </Button>
        <Button onClick={onOpen}>Start Course</Button>
        {nav}
      </div>
    </Shell>
  )
}

function ProgramSlide({
  program,
  hidden,
  nav,
  onStart,
  onResume,
}: {
  program: WorkspaceProgram
  hidden: boolean
  nav: React.ReactNode
  onStart: () => void
  onResume: (course: ProgramCourse) => void
}) {
  const enrolled = program.progress > 0
  const current = currentCourse(program)
  /* Continue opens the course in progress; failing that, the next one they can
     start. A program with neither — nothing released yet — falls back to its
     overview, which is what onStart opens. */
  const resumeCourse = current ?? upNextCourse(program)

  return (
    <Shell
      image={program.image}
      gradient={program.thumbnailGradient}
      hidden={hidden}
      tag={
        <>
          <Routing size={16} color="var(--text-primary)" variant="Bold" />
          <span>Program</span>
        </>
      }
    >
      <div className="wsb__header">
        <div className="wsb__meta">
          <span className="wsb__metaitem">
            <CollectionPlayIcon size={16} color={META_ICON} />
            <span>{program.courseCount} courses</span>
          </span>
          <span className="wsb__metaitem">
            <Clock size={16} color={META_ICON} variant="Linear" />
            <span>{enrolled ? `${minutesLeft(program)} min left` : program.durationLabel}</span>
          </span>
        </div>

        <h2 className="wsb__title">{program.title}</h2>

        <Progress value={program.progress} label="Program completion" />
      </div>

      <div className="wsb__footer">
        <Button onClick={() => (resumeCourse ? onResume(resumeCourse) : onStart())}>
          {enrolled ? 'Continue Program' : 'Start Program'}
        </Button>
        {nav}
      </div>
    </Shell>
  )
}

/** Segmented completion bar with the percentage beside it. */
function Progress({ value, label }: { value: number; label: string }) {
  const filled = Math.max(0, Math.min(SEGMENTS, Math.round((value / 100) * SEGMENTS)))
  return (
    <div className="wsb__progress">
      <span
        className="wsb__bar"
        role="progressbar"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {Array.from({ length: SEGMENTS }).map((_, i) => (
          <span key={i} className={`wsb__seg${i < filled ? ' wsb__seg--filled' : ''}`} />
        ))}
      </span>
      <span className="wsb__pct">{value}%</span>
    </div>
  )
}

export default WorkspaceBanner
