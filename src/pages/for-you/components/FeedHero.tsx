import { useEffect, useRef, useState } from 'react'
import { VolumeHigh, VolumeSlash } from 'iconsax-react'
import { getSkillIllustrationByName } from '../../../assets/skill-icons'
import './FeedHero.css'

/** Seconds each slide dwells before auto-advancing (mirrors the slide progress bar). */
const SLIDE_SECONDS = 6

export interface HeroSlide {
  title: string
  skillName: string
  /** Image or GIF URL rendered full-bleed. */
  media: string
}

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function FeedHero({ slides, onOpen }: { slides: HeroSlide[]; onOpen?: (index: number) => void }) {
  const [active, setActive] = useState(0)
  const [muted, setMuted] = useState(false)
  const reduced = useRef(prefersReducedMotion())

  // Auto-advance like a playing feed — skipped under reduced-motion.
  useEffect(() => {
    if (reduced.current || slides.length < 2) return
    const id = window.setTimeout(() => {
      setActive((i) => (i + 1) % slides.length)
    }, SLIDE_SECONDS * 1000)
    return () => window.clearTimeout(id)
  }, [active, slides.length])

  return (
    <div className="fy-hero-wrap">
      <div className="fy-hero">
        <div
          className={`fy-hero__track${reduced.current ? ' fy-hero__track--static' : ''}`}
          style={{ transform: `translateX(-${active * 100}%)` }}
        >
          {slides.map((slide, i) => (
            <div
              className={`fy-hero__slide${onOpen ? ' fy-hero__slide--interactive' : ''}`}
              key={i}
              aria-hidden={i !== active}
              role={onOpen && i === active ? 'button' : undefined}
              tabIndex={onOpen && i === active ? 0 : undefined}
              aria-label={onOpen ? `Open lesson: ${slide.title}` : undefined}
              onClick={onOpen ? () => onOpen(i) : undefined}
              onKeyDown={
                onOpen
                  ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onOpen(i)
                      }
                    }
                  : undefined
              }
            >
              <img className="fy-hero__media" src={slide.media} alt="" />
              <div className="fy-hero__gradient" />
              <div className="fy-hero__caption">
                <h2 className="fy-hero__title">{slide.title}</h2>
                <div className="fy-hero__skill">
                  <img
                    className="fy-hero__skill-icon"
                    src={getSkillIllustrationByName(slide.skillName)}
                    alt=""
                    width={24}
                    height={24}
                  />
                  <span className="fy-hero__skill-name">{slide.skillName}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          className="fy-hero__mute"
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? 'Unmute' : 'Mute'}
          aria-pressed={muted}
        >
          {muted ? (
            <VolumeSlash size={24} color="var(--text-primary)" variant="Bold" />
          ) : (
            <VolumeHigh size={24} color="var(--text-primary)" variant="Bold" />
          )}
        </button>
      </div>

      <div className="fy-hero__dots" role="tablist" aria-label="Feed slides">
        {slides.map((slide, i) => {
          const isActive = i === active
          return (
            <button
              type="button"
              key={i}
              role="tab"
              aria-selected={isActive}
              aria-label={`Slide ${i + 1}: ${slide.title}`}
              className={`fy-hero__dot${isActive ? ' fy-hero__dot--active' : ''}`}
              onClick={() => setActive(i)}
            >
              {isActive && (
                <span
                  key={active}
                  className={`fy-hero__dot-fill${reduced.current ? ' fy-hero__dot-fill--static' : ''}`}
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

export default FeedHero
