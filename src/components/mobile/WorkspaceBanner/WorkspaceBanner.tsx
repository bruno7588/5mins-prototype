import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { gsap } from 'gsap'
import { Clock, PlayCircle, Routing, TickCircle } from 'iconsax-react'
import Badge from '@/components/Badge/Badge'
import Button from '@/components/Button/Button'
import CollectionPlayIcon from '@/components/icons/CollectionPlayIcon'
import CourseIcon from '@/components/icons/CourseIcon'
import { rgba, useThumbnailAccents } from '@/hooks/thumbnailAccents'
import { currentCourse, featuredPrograms, minutesLeft, upNextCourse } from '@/pages/programs/featuredPrograms'
import type { ProgramCourse, WorkspaceCourse, WorkspaceProgram } from '@/pages/workspace/mockItems'
import './WorkspaceBanner.css'

const SEGMENTS = 8
const META_ICON = 'var(--text-secondary)'
/** Dwell per banner. The pager fill is animated over the same span. */
const SLIDE_MS = 5000
const SLIDE_EASE = 'power3.inOut'
const SLIDE_SECONDS = 1.4

interface Props {
  courses: WorkspaceCourse[]
  programs: WorkspaceProgram[]
  /** "View My Courses" — the enrolled-courses shelf further down the screen. */
  onViewCourses?: () => void
  /** Program not started yet — open its overview. */
  onStartProgram?: (program: WorkspaceProgram) => void
  /** Enrolled — open the program so they can pick the course back up. */
  onResumeProgram?: (program: WorkspaceProgram, course?: ProgramCourse) => void
}

/**
 * The pair of hero banners on the mobile workspace: the course the learner is
 * part-way through and the program they can pick back up — the phone cut of the
 * desktop pair (Figma 3733:61924 / 3733:62030), thumbnail stacked on top.
 *
 * They advance on their own every 4s and can also be swiped; either way the
 * scroll position is the source of truth for which one is showing. The pager
 * underneath mirrors it — the resting dot widens into a track whose amber fill
 * runs down the dwell time.
 */
function MobileWorkspaceBanner({
  courses,
  programs,
  onViewCourses,
  onStartProgram,
  onResumeProgram,
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const sliding = useRef(false)
  const [index, setIndex] = useState(0)

  /* The course they are part-way through — the one worth offering to resume. */
  const course = courses.find((c) => c.progress > 0 && c.progress < 100)
  /* Featured programs are ordered fresh → enrolled; lead with one they've begun. */
  const featured = featuredPrograms(programs)
  const program = featured.find((p) => p.progress > 0) ?? featured[0]

  const slides = [course ? 'course' : null, program ? 'program' : null].filter(Boolean)
  const count = slides.length

  /* Auto-advance, unless the viewer asked for less motion. */
  useEffect(() => {
    if (count < 2) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const timer = window.setTimeout(() => {
      const el = trackRef.current
      if (!el) return
      const next = (index + 1) % count

      /* Move the pager with the slide, and ignore the scroll events the tween
         itself fires — otherwise each frame would restart the dwell timer. */
      sliding.current = true
      setIndex(next)

      /* Mandatory snapping clamps every position the tween writes, so the slide
         teleports between snap points. Suspend it while animating and restore it
         afterwards, which keeps swiping snappy. */
      el.style.scrollSnapType = 'none'
      gsap.to(el, {
        scrollLeft: next * el.clientWidth,
        duration: SLIDE_SECONDS,
        ease: SLIDE_EASE,
        onComplete: () => {
          el.style.scrollSnapType = ''
          sliding.current = false
        },
      })
    }, SLIDE_MS)

    return () => window.clearTimeout(timer)
  }, [index, count])

  if (count === 0) return null

  /* A swipe wins: the resting scroll offset gives the index, since slides are
     full-width. Skipped while the auto-advance tween is driving the scroll. */
  const handleScroll = () => {
    const el = trackRef.current
    if (!el || sliding.current) return
    const next = Math.round(el.scrollLeft / el.clientWidth)
    setIndex((i) => (i === next ? i : next))
  }

  return (
    <section
      className="m-wsb"
      aria-roledescription="carousel"
      aria-label="Continue learning"
      style={{ '--m-wsb-dwell': `${SLIDE_MS}ms` } as CSSProperties}
    >
      <div className="m-wsb__track" ref={trackRef} onScroll={handleScroll}>
        {course ? <CourseSlide course={course} onViewCourses={onViewCourses} /> : null}
        {program ? (
          <ProgramSlide
            program={program}
            onOpen={() =>
              program.progress > 0
                ? onResumeProgram?.(program, currentCourse(program) ?? upNextCourse(program))
                : onStartProgram?.(program)
            }
          />
        ) : null}
      </div>

      {count > 1 ? (
        <div className="m-wsb__pager" aria-hidden="true">
          {slides.map((slide, i) => (
            <span key={slide} className={`m-wsb__tick${i === index ? ' m-wsb__tick--active' : ''}`}>
              {/* Keyed on the index so the fill restarts with each slide. */}
              {i === index ? <span key={index} className="m-wsb__tick-fill" /> : null}
            </span>
          ))}
        </div>
      ) : null}
    </section>
  )
}

/** Shared shell: thumbnail with the content-type tag, then the body beneath. */
function Shell({
  image,
  gradient,
  tag,
  children,
}: {
  image?: string
  gradient: string
  tag: ReactNode
  children: ReactNode
}) {
  /* The banner wears its thumbnail's own colours: the dominant one draws the
     hairline round the image and opens the wash, the runner-up closes it. */
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
    <article className="m-wsb__slide" style={accented}>
      <div className="m-wsb__thumb">
        <div
          className="m-wsb__image"
          style={image ? { backgroundImage: `url(${image})` } : { background: gradient }}
        />
        <span className="m-wsb__tag">{tag}</span>
      </div>
      <div className="m-wsb__body">{children}</div>
    </article>
  )
}

function CourseSlide({
  course,
  onViewCourses,
}: {
  course: WorkspaceCourse
  onViewCourses?: () => void
}) {
  /* Whole minutes of runtime still ahead of them. */
  const left = Math.max(1, Math.round(course.durationMinutes * (1 - course.progress / 100)))

  return (
    <Shell
      image={course.image}
      gradient={course.thumbnailGradient}
      tag={
        <>
          <CourseIcon size={16} color="var(--text-primary)" variant="Bold" />
          <span>Course</span>
        </>
      }
    >
      <div className="m-wsb__header">
        <div className="m-wsb__meta">
          <span className="m-wsb__metaitem">
            <PlayCircle size={14} color={META_ICON} variant="Linear" />
            <span>{course.lessonCount} lessons</span>
          </span>
          <span className="m-wsb__metaitem">
            <Clock size={14} color={META_ICON} variant="Linear" />
            <span>{course.progress > 0 ? `${left} min left` : `${course.durationMinutes} min`}</span>
          </span>
          {course.dueLabel ? <Badge type="warning" icon label={course.dueLabel} /> : null}
        </div>

        <div className="m-wsb__titleblock">
          <h2 className="m-wsb__title">{course.title}</h2>
        </div>
      </div>

      <Progress value={course.progress} label="Course completion" />

      <div className="m-wsb__footer">
        <Button variant="outlined-2" size="sm" onClick={onViewCourses}>
          View My Courses
        </Button>
        {/* No mobile course player yet, so the CTA is shown inert rather than as
            a decoy. `.ui-disabled` dims it and blocks the pointer; tabIndex keeps
            it off the keyboard path without repainting it in the disabled palette. */}
        <Button size="sm" className="ui-disabled" tabIndex={-1} aria-disabled>
          Start Course
        </Button>
      </div>
    </Shell>
  )
}

function ProgramSlide({ program, onOpen }: { program: WorkspaceProgram; onOpen: () => void }) {
  const enrolled = program.progress > 0
  const current = currentCourse(program)
  /* Resume points at the course in progress; failing that, the next one. */
  const resumeCourse = current ?? upNextCourse(program)

  return (
    <Shell
      image={program.image}
      gradient={program.thumbnailGradient}
      tag={
        <>
          <Routing size={16} color="var(--text-primary)" variant="Bold" />
          <span>Program</span>
        </>
      }
    >
      <div className="m-wsb__header">
        <div className="m-wsb__meta">
          <span className="m-wsb__metaitem">
            <CollectionPlayIcon size={14} color={META_ICON} />
            <span>{program.courseCount} courses</span>
          </span>
          <span className="m-wsb__metaitem">
            <Clock size={14} color={META_ICON} variant="Linear" />
            <span>{enrolled ? `${minutesLeft(program)} min left` : program.durationLabel}</span>
          </span>
          {/* Same two states the program screen shows (Figma 3716:83128 / 3716:83261). */}
          {enrolled ? (
            <Badge type="success" label="Live" customIcon={<span className="m-wsb__livedot" />} />
          ) : (
            <Badge
              type="in-progress"
              label="Ready to Start"
              customIcon={<TickCircle size={16} color="currentColor" variant="Linear" />}
            />
          )}
        </div>

        <div className="m-wsb__titleblock">
          <h2 className="m-wsb__title">{program.title}</h2>
          {enrolled && resumeCourse ? (
            <p className="m-wsb__upnext">
              <span className="m-wsb__upnext-label">{current ? 'Current course:' : 'Next course:'}</span>{' '}
              <span className="m-wsb__upnext-title">{resumeCourse.title}</span>
            </p>
          ) : null}
        </div>
      </div>

      <Progress value={program.progress} label="Program completion" />

      <div className="m-wsb__footer">
        <Button size="sm" onClick={onOpen}>
          {enrolled ? 'Resume Program' : 'Start Program'}
        </Button>
      </div>
    </Shell>
  )
}

/** Segmented completion bar with the percentage beside it. */
function Progress({ value, label }: { value: number; label: string }) {
  const filled = Math.max(0, Math.min(SEGMENTS, Math.round((value / 100) * SEGMENTS)))
  return (
    <div className="m-wsb__progress">
      <span
        className="m-wsb__bar"
        role="progressbar"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {Array.from({ length: SEGMENTS }).map((_, i) => (
          <span key={i} className={`m-wsb__seg${i < filled ? ' m-wsb__seg--filled' : ''}`} />
        ))}
      </span>
      <span className="m-wsb__pct">{value}%</span>
    </div>
  )
}

export default MobileWorkspaceBanner
