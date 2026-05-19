import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ArrowLeft2, ArrowRight2 } from 'iconsax-react'
import './Carousel.css'

interface CarouselProps {
  children: ReactNode
  /** Extra class on the scrolling track — use it to set per-section spacing/snap rules. */
  trackClassName?: string
  ariaLabel?: string
}

function Carousel({ children, trackClassName = '', ariaLabel }: CarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [canScroll, setCanScroll] = useState({ left: false, right: false })

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const update = () => {
      setCanScroll({
        left: el.scrollLeft > 1,
        right: el.scrollLeft + el.clientWidth < el.scrollWidth - 1,
      })
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      ro.disconnect()
    }
  }, [])

  const scrollByViewport = (dir: -1 | 1) => {
    const el = trackRef.current
    if (!el) return
    el.scrollBy({ left: el.clientWidth * dir, behavior: 'smooth' })
  }

  return (
    <div className="carousel">
      <button
        type="button"
        className="carousel__chevron carousel__chevron--left"
        onClick={() => scrollByViewport(-1)}
        disabled={!canScroll.left}
        aria-label="Scroll left"
      >
        <ArrowLeft2 size={16} color="var(--text-primary)" variant="Linear" />
      </button>
      <div
        className={`carousel__track ${trackClassName}`.trim()}
        ref={trackRef}
        role="region"
        aria-label={ariaLabel}
      >
        {children}
      </div>
      <button
        type="button"
        className="carousel__chevron carousel__chevron--right"
        onClick={() => scrollByViewport(1)}
        disabled={!canScroll.right}
        aria-label="Scroll right"
      >
        <ArrowRight2 size={16} color="var(--text-primary)" variant="Linear" />
      </button>
    </div>
  )
}

export default Carousel
