import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import Chip from '../../components/Chip/Chip'

interface Props {
  items: string[]
  selected: string[]
  onToggle: (item: string) => void
  isDisabled?: (item: string) => boolean
  /** Rows shown when collapsed (default 2). */
  rows?: number
}

const GAP = 12

/** Number of rows a set of chip widths wraps into at container width W. */
function rowsNeeded(widths: number[], W: number): number {
  let rows = 1
  let x = 0
  for (const w of widths) {
    const need = (x > 0 ? GAP : 0) + w
    if (x + need <= W) x += need
    else {
      rows++
      x = w
    }
  }
  return rows
}

/** How many chips fit in `maxRows` rows while leaving room for the toggle chip
 *  at the end of the last row (so "+N" always sits inline on row `maxRows`). */
function fitWithToggle(widths: number[], W: number, toggleW: number, maxRows: number): number {
  let row = 1
  let x = 0
  let count = 0
  for (const w of widths) {
    const need = (x > 0 ? GAP : 0) + w
    if (x + need > W) {
      if (row >= maxRows) break
      row++
      x = 0
    }
    const placeNeed = (x > 0 ? GAP : 0) + w
    if (row === maxRows && x + placeNeed + GAP + toggleW > W) break
    x += placeNeed
    count++
  }
  return count
}

/**
 * Renders a chip group clamped to `rows` rows. When the chips overflow, the
 * last slot becomes a "+N" chip; expanding shows all chips with a "View less"
 * chip. Widths are measured off-screen so packing matches the real flex-wrap.
 */
export default function CollapsibleChips({ items, selected, onToggle, isDisabled, rows = 2 }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [visibleCount, setVisibleCount] = useState(items.length)
  const [overflowing, setOverflowing] = useState(false)

  const wrapRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLDivElement>(null)
  // Height captured the instant before a toggle, so we can tween from it to the
  // post-render natural height.
  const prevHeightRef = useRef<number | null>(null)
  const didToggle = useRef(false)

  const measure = useCallback(() => {
    const wrap = wrapRef.current
    const measureEl = measureRef.current
    if (!wrap || !measureEl) return
    const W = wrap.clientWidth
    if (W <= 0) return
    const chips = Array.from(measureEl.querySelectorAll<HTMLElement>('.chip'))
    if (chips.length < items.length + 1) return
    const widths = chips.slice(0, items.length).map((el) => el.offsetWidth)
    const toggleW = chips[chips.length - 1].offsetWidth

    if (rowsNeeded(widths, W) <= rows) {
      setOverflowing(false)
      setVisibleCount(items.length)
      return
    }
    setOverflowing(true)
    setVisibleCount(fitWithToggle(widths, W, toggleW, rows))
  }, [items.length, rows])

  useLayoutEffect(() => {
    measure()
    const wrap = wrapRef.current
    if (!wrap) return
    const ro = new ResizeObserver(() => measure())
    ro.observe(wrap)
    return () => ro.disconnect()
    // re-measure when selection changes (selected chips are bold → wider)
  }, [measure, selected])

  // Smoothly slide the chip row open/closed when expanding/collapsing. The new
  // chip set is already in the DOM by the time this layout effect runs, so we
  // read the target height, snap back to the pre-toggle height, then tween up
  // (or down) with the project's ease-in-ease-out curve (see Collapse).
  useLayoutEffect(() => {
    if (!didToggle.current) return
    didToggle.current = false
    const el = wrapRef.current
    const prev = prevHeightRef.current
    if (!el || prev == null) return

    el.style.height = 'auto'
    const target = el.offsetHeight
    gsap.killTweensOf(el)
    gsap.set(el, { height: prev, overflow: 'hidden' })
    gsap.to(el, {
      height: target,
      duration: 0.3,
      ease: 'power2.inOut',
      onComplete: () => {
        el.style.height = ''
        el.style.overflow = ''
      },
    })
  }, [expanded])

  const toggleExpanded = useCallback(() => {
    prevHeightRef.current = wrapRef.current?.offsetHeight ?? null
    didToggle.current = true
    setExpanded((e) => !e)
  }, [])

  const hiddenCount = items.length - visibleCount
  const shown = expanded || !overflowing ? items : items.slice(0, visibleCount)

  return (
    <div className="onboarding__chip-group">
      <div className="onboarding__chips" ref={wrapRef}>
        {shown.map((item) => (
          <Chip
            key={item}
            label={item}
            selected={selected.includes(item)}
            disabled={isDisabled?.(item) ?? false}
            onClick={() => onToggle(item)}
          />
        ))}
        {overflowing && (
          <Chip
            label={expanded ? 'View less' : `+${hiddenCount}`}
            className="onboarding__chip-toggle"
            onClick={toggleExpanded}
          />
        )}
      </div>

      {/* Off-screen measurement copy — always holds every chip + a toggle sample */}
      <div className="onboarding__chips onboarding__chips--measure" ref={measureRef} aria-hidden>
        {items.map((item) => (
          <Chip key={item} label={item} selected={selected.includes(item)} />
        ))}
        <Chip label={`+${items.length}`} />
      </div>
    </div>
  )
}
