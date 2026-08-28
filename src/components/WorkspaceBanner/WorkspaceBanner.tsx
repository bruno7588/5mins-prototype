import { Fragment, useEffect, useRef, useState, type CSSProperties } from 'react'
import { gsap } from 'gsap'
import { ArrowLeft2, ArrowRight2, Clock, PlayCircle, Routing } from 'iconsax-react'
import Button from '@/components/Button/Button'
import CollectionPlayIcon from '@/components/icons/CollectionPlayIcon'
import CourseIcon from '@/components/icons/CourseIcon'
import { featuredPrograms, minutesLeft } from '@/pages/programs/featuredPrograms'
import type { WorkspaceCourse, WorkspaceProgram } from '@/pages/workspace/mockItems'
import { rgba, useThumbnailAccents } from '@/hooks/thumbnailAccents'
import './WorkspaceBanner.css'

/** The gap CSS puts between slides, in px — one step is a slide plus this. */
function trackGap(el: HTMLElement) {
  return parseFloat(getComputedStyle(el).columnGap) || 0
}

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
  /** Both program CTAs — Start and Continue alike — open the program page. */
  onOpenProgram?: (program: WorkspaceProgram) => void
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
  onOpenProgram,
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  /* Set when the track has just jumped off the wrap copy: the banner it lands on
     has already been on screen for the slide, so it keeps only the rest of the
     dwell and every banner gets the same time. */
  const justWrapped = useRef(false)
  const [index, setIndex] = useState(0)

  /* The course they are part-way through — the one worth offering to resume. */
  const course = courses.find((c) => c.progress > 0 && c.progress < 100)
  /* One program per state it can be in: ready, scheduled, mid-course, between. */
  const featured = featuredPrograms(programs)

  /* Each banner as a render function, so the wrap copy at the end of the track
     can draw the first one a second time. */
  const items = [
    ...(course
      ? [
          {
            key: 'course',
            render: (hidden: boolean) => (
              <CourseSlide
                course={course}
                hidden={hidden}
                nav={nav}
                onOpen={() => onOpenCourse?.(course)}
                onViewCourses={onViewCourses}
              />
            ),
          },
        ]
      : []),
    ...featured.map((program) => ({
      key: program.id,
      render: (hidden: boolean) => (
        <ProgramSlide
          program={program}
          hidden={hidden}
          nav={nav}
          onOpen={() => onOpenProgram?.(program)}
        />
      ),
    })),
  ]
  const count = items.length
  /* Index `count` is the wrap copy: the first banner again, tacked on the end. */
  const wrapped = index === count

  /* Auto-advance, unless the viewer asked for less motion. Nothing is scheduled
     while the wrap copy is showing — the jump back to the real first banner is
     what ends that step, and it carries the rest of the dwell with it. */
  useEffect(() => {
    if (count < 2 || wrapped) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const dwell = justWrapped.current ? SLIDE_MS - SLIDE_SECONDS * 1000 : SLIDE_MS
    justWrapped.current = false
    const timer = window.setTimeout(() => setIndex((i) => i + 1), dwell)
    return () => window.clearTimeout(timer)
  }, [index, count, wrapped])

  /* One slide width per step. The track is as wide as the frame — the slides
     overflow it — so a percentage of its own width is exactly one banner. The
     gap between them rides along as a fixed pixel offset, which is why one step
     is 100% plus one gap. */
  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    gsap.to(el, {
      xPercent: -100 * index,
      x: -trackGap(el) * index,
      duration: reduced ? 0 : SLIDE_SECONDS,
      ease: SLIDE_EASE,
      overwrite: true,
      onComplete: () => {
        /* The copy and the real first banner look the same, so resetting the
           track under it is invisible — and the next step slides left again
           rather than rewinding across everything. */
        if (!wrapped) return
        gsap.set(el, { xPercent: 0, x: 0 })
        justWrapped.current = true
        setIndex(0)
      },
    })
  }, [index, wrapped])

  if (count === 0) return null

  /* The chevrons travel the same way the auto-advance does — forwards runs onto the
     wrap copy rather than rewinding, and backwards off the first banner hops to the
     copy first so it travels right onto the last one. */
  const go = (dir: number) => {
    const el = trackRef.current
    if (!el) return
    const end = { xPercent: -100 * count, x: -trackGap(el) * count }
    if (index === count) {
      /* Standing on the copy. Forwards drops back onto the real first banner and
         carries on; backwards is already in the right place to travel right. */
      if (dir > 0) {
        gsap.set(el, { xPercent: 0, x: 0 })
        setIndex(1)
        return
      }
      setIndex(count - 1)
      return
    }
    if (dir < 0 && index === 0) {
      gsap.set(el, end)
      setIndex(count - 1)
      return
    }
    setIndex(index + dir)
  }

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
        {items.map((item, i) => (
          <Fragment key={item.key}>{item.render(i !== index)}</Fragment>
        ))}
        {count > 1 ? <Fragment key="wrap">{items[0].render(!wrapped)}</Fragment> : null}
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
  onOpen,
}: {
  program: WorkspaceProgram
  hidden: boolean
  nav: React.ReactNode
  onOpen: () => void
}) {
  const enrolled = program.progress > 0

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
        <Button onClick={onOpen}>
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
