import { Fragment, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { gsap } from 'gsap'
import { ArrowLeft2, ArrowRight2, Clock, PlayCircle, Routing } from 'iconsax-react'
import Button from '@/components/Button/Button'
import CollectionPlayIcon from '@/components/icons/CollectionPlayIcon'
import CourseIcon from '@/components/icons/CourseIcon'
import { featuredPrograms, minutesLeft } from '@/pages/programs/featuredPrograms'
import type { WorkspaceCourse, WorkspaceProgram } from '@/pages/workspace/mockItems'
import { rgba, useThumbnailAccents } from '@/hooks/thumbnailAccents'
import './WorkspaceBanner.css'

/** The gap CSS sets between slides mid-slide, in px (the track's column-gap token). */
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
 * footer step between them by hand. All are stacked in one grid cell so they
 * share a height and nothing shifts as they advance.
 */
function WorkspaceBanner({
  courses,
  programs,
  onOpenCourse,
  onViewCourses,
  onOpenProgram,
}: Props) {
  const [index, setIndex] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)
  /* Where the last slide came from, and which way the next one travels:
     1 slides in from the right (auto-advance, next), -1 from the left (previous). */
  const shownIndex = useRef(0)
  const direction = useRef(1)

  /* The course they are part-way through — the one worth offering to resume. */
  const course = courses.find((c) => c.progress > 0 && c.progress < 100)
  /* One program per state it can be in: ready, scheduled, mid-course, between. */
  const featured = featuredPrograms(programs)

  /* Each banner as a render function; `hidden` drives its a11y while off screen. */
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

  /* Auto-advance, unless the viewer asked for less motion. Always forwards, so the
     banners keep sliding left, wrapping from the last back to the first. */
  useEffect(() => {
    if (count < 2) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setTimeout(() => {
      direction.current = 1
      setIndex((i) => (i + 1) % count)
    }, SLIDE_MS)
    return () => window.clearTimeout(timer)
  }, [index, count])

  /* The slides are stacked in one cell. The incoming one slides in from the side it
     travels from while the outgoing one slides out the other way, both on the same
     ease, so the 8px between them holds steady. Everything not in view is parked off to the
     side with visibility hidden — the old single track let the previous banner's
     edge peek in during and after each slide; hidden slides can't. Runs before
     paint so the stack never flashes on first render. */
  useLayoutEffect(() => {
    const track = trackRef.current
    const slides = Array.from(track?.children ?? []) as HTMLElement[]
    /* Each slide sits one width plus the gap away from the next, so the pair
       travel with 8px of page between them. */
    const gap = track ? trackGap(track) : 0
    const from = shownIndex.current
    shownIndex.current = index
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!slides[index]) return

    slides.forEach((slide, i) => {
      if (i === index || (i === from && !reduced)) return
      gsap.killTweensOf(slide)
      gsap.set(slide, { xPercent: 100, x: gap, visibility: 'hidden' })
    })

    if (from === index || reduced || !slides[from]) {
      gsap.set(slides[index], { xPercent: 0, x: 0, visibility: 'visible' })
      return
    }

    const dir = direction.current
    gsap.fromTo(
      slides[index],
      { xPercent: 100 * dir, x: gap * dir, visibility: 'visible' },
      { xPercent: 0, x: 0, duration: SLIDE_SECONDS, ease: SLIDE_EASE, overwrite: true },
    )
    gsap.to(slides[from], {
      xPercent: -100 * dir,
      x: -gap * dir,
      duration: SLIDE_SECONDS,
      ease: SLIDE_EASE,
      overwrite: true,
      onComplete: () => gsap.set(slides[from], { visibility: 'hidden' }),
    })
  }, [index, count])

  if (count === 0) return null

  /* Chevrons slide to the neighbour, wrapping around either end: next travels left
     like the auto-advance, previous travels right. */
  const go = (dir: number) => {
    direction.current = dir
    setIndex((i) => (i + dir + count) % count)
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
    <article
      className="wsb__slide"
      style={accented}
      aria-hidden={hidden}
      inert={hidden}
    >
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
