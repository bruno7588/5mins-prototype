import { Fragment, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { gsap } from 'gsap'
import { Clock, PlayCircle, Routing } from 'iconsax-react'
import Button from '@/components/Button/Button'
import CollectionPlayIcon from '@/components/icons/CollectionPlayIcon'
import CourseIcon from '@/components/icons/CourseIcon'
import { rgba, useThumbnailAccents } from '@/hooks/thumbnailAccents'
import { featuredPrograms, minutesLeft } from '@/pages/programs/featuredPrograms'
import type { WorkspaceCourse, WorkspaceProgram } from '@/pages/workspace/mockItems'
import './WorkspaceBanner.css'

/** The gap CSS puts between slides, in px — one step is a slide plus this. */
function trackGap(el: HTMLElement) {
  return parseFloat(getComputedStyle(el).columnGap) || 0
}

const SEGMENTS = 8
const META_ICON = 'var(--text-secondary)'
/** Dwell per banner. The pager fill is animated over the same span. */
const SLIDE_MS = 5000
const SLIDE_EASE = 'power3.inOut'
const SLIDE_SECONDS = 1.4
/** The wash runs almost horizontally on the phone (Figma 3747:66818). */
const TINT_ANGLE = '93.68deg'

interface Props {
  courses: WorkspaceCourse[]
  programs: WorkspaceProgram[]
  /** Every program CTA lands on the program screen; there is no course player yet. */
  onOpenProgram?: (program: WorkspaceProgram) => void
}

/**
 * The pair of hero banners on the mobile workspace: the course the learner is
 * part-way through (Figma 2522:41618) and the program they can pick back up
 * (3747:66562 scheduled, 66969 ready, 67237 live-current, 67520 live-next).
 *
 * They advance on their own every 5s and can also be swiped; either way the
 * scroll position is the source of truth for which one is showing. The pager
 * underneath mirrors it — the resting dot widens into a track whose amber fill
 * runs down the dwell time.
 */
function MobileWorkspaceBanner({ courses, programs, onOpenProgram }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const sliding = useRef(false)
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
    ...(course ? [{ key: 'course', render: () => <CourseSlide course={course} /> }] : []),
    ...featured.map((program) => ({
      key: program.id,
      render: () => <ProgramSlide program={program} onOpen={() => onOpenProgram?.(program)} />,
    })),
  ]
  const count = items.length

  /* Auto-advance, unless the viewer asked for less motion. */
  useEffect(() => {
    if (count < 2) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const dwell = justWrapped.current ? SLIDE_MS - SLIDE_SECONDS * 1000 : SLIDE_MS
    justWrapped.current = false

    const timer = window.setTimeout(() => {
      const el = trackRef.current
      if (!el) return
      /* Past the last banner comes the copy, not a rewind to the first. */
      const next = index + 1

      /* Move the pager with the slide, and ignore the scroll events the tween
         itself fires — otherwise each frame would restart the dwell timer. */
      sliding.current = true
      setIndex(next)

      /* Mandatory snapping clamps every position the tween writes, so the slide
         teleports between snap points. Suspend it while animating and restore it
         afterwards, which keeps swiping snappy. */
      el.style.scrollSnapType = 'none'
      gsap.to(el, {
        scrollLeft: next * (el.clientWidth + trackGap(el)),
        duration: SLIDE_SECONDS,
        ease: SLIDE_EASE,
        onComplete: () => {
          /* Landed on the copy: jump back onto the real first banner, which looks
             the same, so the next step slides left again instead of rewinding. */
          if (next === count) {
            el.scrollLeft = 0
            justWrapped.current = true
            setIndex(0)
          }
          el.style.scrollSnapType = ''
          sliding.current = false
        },
      })
    }, dwell)

    return () => window.clearTimeout(timer)
  }, [index, count])

  if (count === 0) return null

  /* A swipe wins: the resting scroll offset gives the index, since every slide
     is one frame plus one gap along. Skipped while the auto-advance tween is
     driving the scroll. */
  const handleScroll = () => {
    const el = trackRef.current
    if (!el || sliding.current) return
    const step = el.clientWidth + trackGap(el)
    const next = Math.round(el.scrollLeft / step)
    /* Swiped onto the copy and settled there — hop back onto the real first
       banner underneath it, so the next swipe has somewhere to go. */
    if (next === count && Math.abs(el.scrollLeft - count * step) < 2) {
      el.style.scrollSnapType = 'none'
      el.scrollLeft = 0
      el.style.scrollSnapType = ''
      setIndex(0)
      return
    }
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
        {items.map((item) => (
          <Fragment key={item.key}>{item.render()}</Fragment>
        ))}
        {count > 1 ? <Fragment key="wrap">{items[0].render()}</Fragment> : null}
      </div>

      {count > 1 ? (
        <div className="m-wsb__pager" aria-hidden="true">
          {items.map((item, i) => (
            <span key={item.key} className={`m-wsb__tick${i === index % count ? ' m-wsb__tick--active' : ''}`}>
              {/* Keyed on the index so the fill restarts with each slide. */}
              {i === index % count ? <span key={index} className="m-wsb__tick-fill" /> : null}
            </span>
          ))}
        </div>
      ) : null}
    </section>
  )
}

/** Shared shell: thumbnail with the corner strip, then the body beneath. */
function Shell({
  image,
  gradient,
  type,
  children,
}: {
  image?: string
  gradient: string
  /** Content-type tag — icon plus "Course" / "Program". */
  type: ReactNode
  children: ReactNode
}) {
  /* The banner wears its thumbnail's own colours: the dominant one draws the
     hairline round the image and opens the wash, the runner-up closes it. */
  const accents = useThumbnailAccents(image)
  const accented = accents
    ? ({
        '--wsb-accent': rgba(accents.primary, 1),
        '--wsb-tint': `linear-gradient(${TINT_ANGLE}, ${rgba(accents.primary, 0.24)} 0%, ${rgba(
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
        <div className="m-wsb__tag">
          <span className="m-wsb__tag-type">{type}</span>
        </div>
      </div>
      <div className="m-wsb__body">{children}</div>
    </article>
  )
}

function CourseSlide({ course }: { course: WorkspaceCourse }) {
  /* Whole minutes of runtime still ahead of them. */
  const left = Math.max(1, Math.round(course.durationMinutes * (1 - course.progress / 100)))

  return (
    <Shell
      image={course.image}
      gradient={course.thumbnailGradient}
      type={
        <>
          <CourseIcon size={16} color="var(--text-primary)" variant="Bold" />
          <span>Course</span>
        </>
      }
    >
      <div className="m-wsb__header">
        <div className="m-wsb__meta">
          <span className="m-wsb__metaitem">
            <PlayCircle size={16} color={META_ICON} variant="Linear" />
            <span>{course.lessonCount} lessons</span>
          </span>
          <span className="m-wsb__metaitem">
            <Clock size={16} color={META_ICON} variant="Linear" />
            <span>{course.progress > 0 ? `${left} min left` : `${course.durationMinutes} min`}</span>
          </span>
        </div>

        <div className="m-wsb__titleblock">
          <h2 className="m-wsb__title">{course.title}</h2>
        </div>

      </div>

      <Progress value={course.progress} label="Course completion" />

      <div className="m-wsb__footer">
        {/* No mobile course player yet, so the CTA is shown inert rather than as
            a decoy. `.ui-disabled` dims it and blocks the pointer; tabIndex keeps
            it off the keyboard path without repainting it in the disabled palette. */}
        <Button className="m-wsb__cta ui-disabled" tabIndex={-1} aria-disabled>
          Continue Course
        </Button>
      </div>
    </Shell>
  )
}

function ProgramSlide({ program, onOpen }: { program: WorkspaceProgram; onOpen: () => void }) {
  const enrolled = program.progress > 0
  const cta = enrolled ? 'Continue Program' : 'Start Program'

  return (
    <Shell
      image={program.image}
      gradient={program.thumbnailGradient}
      type={
        <>
          <Routing size={16} color="var(--text-primary)" variant="Bold" />
          <span>Program</span>
        </>
      }
    >
      <div className="m-wsb__header">
        <div className="m-wsb__meta">
          <span className="m-wsb__metaitem">
            <CollectionPlayIcon size={16} color={META_ICON} />
            <span>{program.courseCount} courses</span>
          </span>
          <span className="m-wsb__metaitem">
            <Clock size={16} color={META_ICON} variant="Linear" />
            <span>{enrolled ? `${minutesLeft(program)} min left` : program.durationLabel}</span>
          </span>
        </div>

        <div className="m-wsb__titleblock">
          <h2 className="m-wsb__title">{program.title}</h2>
        </div>

      </div>

      <Progress value={program.progress} label="Program completion" />

      <div className="m-wsb__footer">
        <Button className="m-wsb__cta" onClick={onOpen}>
          {cta}
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
