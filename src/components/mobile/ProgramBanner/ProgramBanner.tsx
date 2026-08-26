import { useRef, useState } from 'react'
import { Clock, Routing } from 'iconsax-react'
import CollectionPlayIcon from '../../icons/CollectionPlayIcon'
import type { WorkspaceProgram } from '@/pages/workspace/mockItems'
import './ProgramBanner.css'

const SEGMENTS = 8
const META_ICON = 'rgba(249, 249, 250, 0.72)'

export interface MobileProgramBannerProps {
  programs: WorkspaceProgram[]
  onOpen?: (program: WorkspaceProgram) => void
}

/**
 * Featured program banner for the mobile home screen (Figma 3716:82890).
 *
 * Swipeable: the banners sit in a scroll-snap row and the pager underneath
 * tracks the resting slide. Unlike the desktop banner this one carries no
 * course subtext — the mobile node is title, progress and the CTA only.
 */
function MobileProgramBanner({ programs, onOpen }: MobileProgramBannerProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)

  if (programs.length === 0) return null

  /* The slides are full-width, so the resting scroll offset gives the index. */
  const handleScroll = () => {
    const el = trackRef.current
    if (!el) return
    const next = Math.round(el.scrollLeft / el.clientWidth)
    setIndex((i) => (i === next ? i : next))
  }

  return (
    <section className="m-program-banner" aria-label="Featured learning programs">
      <div className="m-program-banner__track" ref={trackRef} onScroll={handleScroll}>
        {programs.map((program) => {
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
                    <span>{program.durationLabel}</span>
                  </span>
                </div>

                <div className="m-program-banner__titleblock">
                  <h2 className="m-program-banner__title">{program.title}</h2>
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
                {program.progress > 0 ? 'Resume Program' : 'Start Program'}
              </button>
            </article>
          )
        })}
      </div>

      {programs.length > 1 ? (
        <div className="m-program-banner__pager" aria-hidden="true">
          {programs.map((program, i) =>
            i === index ? (
              <span key={program.id} className="m-program-banner__pill">
                <span className="m-program-banner__pill-fill" />
              </span>
            ) : (
              <span key={program.id} className="m-program-banner__dot" />
            ),
          )}
        </div>
      ) : null}
    </section>
  )
}

export default MobileProgramBanner
