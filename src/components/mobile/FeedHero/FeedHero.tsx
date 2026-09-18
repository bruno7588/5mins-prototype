import { useEffect, useRef, useState } from 'react'
import { PlayCircle } from 'iconsax-react'
import type { HeroSlide } from '@/pages/for-you/components/FeedHero'
import './FeedHero.css'

/** Seconds a slide dwells before auto-advancing (mirrors the indicator fill). */
const SLIDE_SECONDS = 6

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Mobile "Today's Top Picks" hero (Figma Your Content 6571:52760).
 *
 * No Library component for this one, so it is built from the screen: a 500px
 * full-bleed slide under a bottom-weighted gradient, the play tag notched into
 * the top-left corner, and the caption over the fade. The indicator below is a
 * row of 6px dots where the active slide becomes a 40px track that fills as the
 * slide plays (`6571:52766`) — not the desktop hero's ring of dots.
 */
function MobileFeedHero({ slides, onOpen }: { slides: HeroSlide[]; onOpen?: (index: number) => void }) {
  const [active, setActive] = useState(0)
  const reduced = useRef(prefersReducedMotion())

  useEffect(() => {
    if (reduced.current || slides.length < 2) return
    const id = window.setTimeout(() => setActive((i) => (i + 1) % slides.length), SLIDE_SECONDS * 1000)
    return () => window.clearTimeout(id)
  }, [active, slides.length])

  const slide = slides[active]
  if (!slide) return null

  return (
    <div className="m-fy-hero">
      <article
        className={`m-fy-hero__slide${onOpen ? ' m-fy-hero__slide--interactive' : ''}`}
        role={onOpen ? 'button' : undefined}
        tabIndex={onOpen ? 0 : undefined}
        aria-label={onOpen ? `Open lesson: ${slide.title}` : undefined}
        onClick={onOpen ? () => onOpen(active) : undefined}
        onKeyDown={
          onOpen
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onOpen(active)
                }
              }
            : undefined
        }
      >
        <img className="m-fy-hero__media" src={slide.media} alt="" />
        <span className="m-fy-hero__gradient" />
        <span className="m-fy-hero__tag">
          <PlayCircle size={44} color="var(--text-primary)" variant="Bold" />
        </span>
        <div className="m-fy-hero__caption">
          <h2 className="m-fy-hero__title">{slide.title}</h2>
          <p className="m-fy-hero__skill">{slide.skillName}</p>
        </div>
      </article>

      <div className="m-fy-hero__dots" role="tablist" aria-label="Top picks">
        {slides.map((s, i) => {
          const isActive = i === active
          return (
            <button
              type="button"
              key={i}
              role="tab"
              aria-selected={isActive}
              aria-label={`Slide ${i + 1}: ${s.title}`}
              className={`m-fy-hero__dot${isActive ? ' m-fy-hero__dot--active' : ''}`}
              onClick={() => setActive(i)}
            >
              {isActive && (
                <span
                  key={active}
                  className={`m-fy-hero__dot-fill${reduced.current ? ' m-fy-hero__dot-fill--static' : ''}`}
                  style={{ animationDuration: `${SLIDE_SECONDS}s` }}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default MobileFeedHero
