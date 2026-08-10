import { useEffect, useRef, type ReactNode } from 'react'
import gsap from 'gsap'

interface CollapseProps {
  /** When true the content is expanded; when false it collapses to height 0. */
  open: boolean
  children: ReactNode
  /** Animation length in seconds. Defaults to the project's 0.3s. */
  duration?: number
  className?: string
}

/**
 * Animated expand/collapse container.
 *
 * Smoothly tweens height + opacity with GSAP using an ease-in-ease-out curve
 * (`power2.inOut`), matching the project convention (see CurriculumSection).
 * Content stays mounted so the height can be measured; it's clipped with
 * `overflow: hidden` while collapsed.
 */
function Collapse({ open, children, duration = 0.3, className }: CollapseProps) {
  const ref = useRef<HTMLDivElement>(null)
  const initialMount = useRef(true)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // First render: jump straight to the correct state, no animation.
    if (initialMount.current) {
      gsap.set(
        el,
        open
          ? { height: 'auto', opacity: 1 }
          : { height: 0, opacity: 0, overflow: 'hidden' },
      )
      initialMount.current = false
      return
    }

    gsap.killTweensOf(el)
    const ease = 'power2.inOut'

    if (open) {
      gsap.to(el, {
        height: 'auto',
        opacity: 1,
        duration,
        ease,
        overflow: 'hidden',
        // Clear the inline overflow once expanded so nested focus rings/menus aren't clipped.
        onComplete: () => {
          if (ref.current) ref.current.style.overflow = ''
        },
      })
    } else {
      gsap.to(el, { height: 0, opacity: 0, duration, ease, overflow: 'hidden' })
    }
  }, [open, duration])

  // `inert` alongside aria-hidden: the content stays mounted while collapsed, so
  // without it any buttons/inputs inside would still take keyboard focus.
  return (
    <div ref={ref} className={className} aria-hidden={!open} inert={!open}>
      {children}
    </div>
  )
}

export default Collapse
