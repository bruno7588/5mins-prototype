import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** Overlay accessibility per overlays.md: moves focus into the panel on open,
 *  traps Tab inside it, restores focus to the trigger on close, locks body
 *  scroll while open, and (optionally) closes on Escape.
 *
 *  Usage: attach the ref to the overlay panel element (give it `tabIndex={-1}`
 *  so it can receive focus when it has no focusable children). */
export function useOverlayA11y(
  ref: RefObject<HTMLElement | null>,
  open: boolean,
  opts: { onEscape?: () => void } = {},
) {
  const onEscapeRef = useRef(opts.onEscape)
  onEscapeRef.current = opts.onEscape

  useEffect(() => {
    if (!open) return
    const panel = ref.current
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null

    const focusables = () => Array.from(panel?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])
    ;(focusables()[0] ?? panel)?.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onEscapeRef.current?.()
        return
      }
      if (e.key !== 'Tab' || !panel) return
      const items = focusables()
      if (items.length === 0) {
        e.preventDefault()
        return
      }
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement
      const inside = active instanceof HTMLElement && panel.contains(active)
      if (e.shiftKey && (active === first || !inside)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && (active === last || !inside)) {
        e.preventDefault()
        first.focus()
      }
    }

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
      trigger?.focus()
    }
  }, [open, ref])
}
