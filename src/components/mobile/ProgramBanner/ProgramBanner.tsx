import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { Clock, Routing } from 'iconsax-react'
import CollectionPlayIcon from '../../icons/CollectionPlayIcon'
import { currentCourse, minutesLeft, upNextCourse } from '@/pages/programs/featuredPrograms'
import type { WorkspaceProgram } from '@/pages/workspace/mockItems'
import './ProgramBanner.css'

const SEGMENTS = 8
const META_ICON = 'rgba(249, 249, 250, 0.72)'
/** Dwell time per banner. The pager fill is animated over the same span. */
const SLIDE_MS = 3000

export interface MobileProgramBannerProps {
  programs: WorkspaceProgram[]
  onOpen?: (program: WorkspaceProgram) => void
}

/**
 * Featured program banner for the mobile home screen (Figma 3716:82890 fresh,
 * 3716:82924 enrolled).
 *
 * The banners advance on their own every 3s and can also be swiped; either way
 * the scroll position is the source of truth for which one is showing. The
 * pager underneath mirrors it — the resting dot widens into a track whose amber
 * fill runs down the dwell time, and collapses back to a dot as the next one
 * takes over.
 */
function MobileProgramBanner({ programs, onOpen }: MobileProgramBannerProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const sliding = useRef(false)
  const [index, setIndex] = useState(0)

  /* Auto-advance, unless the viewer asked for less motion. */
  useEffect(() => {
    if (programs.length < 2) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const timer = window.setTimeout(() => {
      const el = trackRef.current
      if (!el) return
      const next = (index + 1) % programs.length

      /* Move the pager with the slide, and ignore the scroll events the tween
         itself fires — otherwise each frame would restart the dwell timer. */
      sliding.current = true
      setIndex(next)

      /* Mandatory snapping clamps every position the tween writes, so the
         slide teleports between snap points. Suspend it while animating and
         restore it afterwards, which keeps swiping snappy. */
      el.style.scrollSnapType = 'none'
      gsap.to(el, {
        scrollLeft: next * el.clientWidth,
        duration: 0.6,
        ease: 'power2.inOut',
        onComplete: () => {
          el.style.scrollSnapType = ''
          sliding.current = false
        },
      })
    }, SLIDE_MS)

    return () => window.clearTimeout(timer)
  }, [index, programs.length])

  if (programs.length === 0) return null

  /* A swipe wins: the resting scroll offset gives the index, since slides are
     full-width. Skipped while the auto-advance tween is driving the scroll. */
  const handleScroll = () => {
    const el = trackRef.current
    if (!el || sliding.current) return
    const next = Math.round(el.scrollLeft / el.clientWidth)
    setIndex((i) => (i === next ? i : next))
  }

  return (
    <section className="m-program-banner" aria-label="Featured learning programs">
      <div className="m-program-banner__track" ref={trackRef} onScroll={handleScroll}>
        {programs.map((program) => {
          const enrolled = program.progress > 0
          const current = currentCourse(program)
          const resumeCourse = current ?? upNextCourse(program)
          const filled = Math.max(
            0,
            Math.min(SEGMENTS, Math.round((program.progress / 100) * SEGMENTS)),
          )
          return (
            <article
              key={program.id}
              className="m-program-banner__slide"
              style={{
                backgroundImage: program.image
                  ? `url(${program.image})`
                  : program.thumbnailGradient,
              }}
            >
              <div className="m-program-banner__header">
                <div className="m-program-banner__meta">
                  <span className="m-program-banner__metaitem">
                    <Routing size={14} color={META_ICON} variant="Bold" />
                    <span>Program</span>
                  </span>
                  <span className="m-program-banner__metaitem">
                    <CollectionPlayIcon size={14} color={META_ICON} />
                    <span>{program.courseCount} courses</span>
                  </span>
                  <span className="m-program-banner__metaitem">
                    <Clock size={14} color={META_ICON} variant="Linear" />
                    <span>
                      {enrolled ? `${minutesLeft(program)} min left` : program.durationLabel}
                    </span>
                  </span>
                </div>

                <div className="m-program-banner__titleblock">
                  <h2 className="m-program-banner__title">{program.title}</h2>
                  {enrolled && resumeCourse ? (
                    <p className="m-program-banner__course">
                      <span className="m-program-banner__course-label">
                        {current ? 'Current course:' : 'Next course:'}
                      </span>{' '}
                      <span className="m-program-banner__course-title">{resumeCourse.title}</span>
                    </p>
                  ) : null}
                  <div className="m-program-banner__progress">
                    <span
                      className="m-program-banner__bar"
                      role="progressbar"
                      aria-label="Program completion"
                      aria-valuenow={program.progress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      {Array.from({ length: SEGMENTS }).map((_, i) => (
                        <span
                          key={i}
                          className={`m-program-banner__seg${
                            i < filled ? ' m-program-banner__seg--filled' : ''
                          }`}
                        />
                      ))}
                    </span>
                    <span className="m-program-banner__pct">{program.progress}%</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="m-program-banner__cta"
                onClick={() => onOpen?.(program)}
              >
                {enrolled ? 'Resume Program' : 'Start Program'}
              </button>
            </article>
          )
        })}
      </div>

      {programs.length > 1 ? (
        <div className="m-program-banner__pager" aria-hidden="true">
          {programs.map((program, i) => (
            <span
              key={program.id}
              className={`m-program-banner__tick${
                i === index ? ' m-program-banner__tick--active' : ''
              }`}
            >
              {/* Keyed on the index so the fill restarts with each slide. */}
              {i === index ? <span key={index} className="m-program-banner__tick-fill" /> : null}
            </span>
          ))}
        </div>
      ) : null}
    </section>
  )
}

export default MobileProgramBanner
