import type { CSSProperties } from 'react'
import './ProgressBar.css'

/** The bar is always 8 equal segments (Library "Progress bar", 7046:25097). */
export const PROGRESS_SEGMENTS = 8

export interface ProgressBarProps {
  /** Percent complete, 0 to 100. Clamped; the fill snaps to the nearest eighth.
      Figma: Progress=0% ... 100% (nearest step). */
  value: number
  /** Fill colour while in progress. `primary` (default) for lessons, skills and
      everything else; `selected` (amber) for course progress on course cards.
      Figma: Tone=Primary / Selected. */
  tone?: 'primary' | 'selected'
  /** What the bar sits on, which sets the empty-track colour (same rule as borders).
      `page` (default): page ground, drawers, modals, table rows -> --border.
      `card`: inside a card or sheet -> --border-elevated (--border vanishes on dark cards).
      `media`: over a photo or banner image -> translucent light track.
      Figma: Surface=Page / Card / Media. */
  surface?: 'page' | 'card' | 'media'
  /** Bar height in px: 2 on a thumbnail edge, 4 in a compact list row, 6 in a
      banner or mobile header, 8 (default) in tables and headers.
      Figma: resize the instance height. */
  height?: 2 | 4 | 6 | 8
  /** Fixed bar width in px (72 in table cells). Omit to fill the container. */
  width?: number
  /** Marks the bar complete: every segment turns success green. Defaults to
      `value >= 100`; pass it when completion is a state (lesson completed, course
      passed) rather than a number. Figma: Progress=100%. */
  complete?: boolean
  /** Two-tone course bar (mobile Course screen): percent of finished steps, drawn
      amber (--selected) before the primary in-progress fill. Must be <= value. */
  doneValue?: number
  /** Shows "NN%" beside the bar (Regular 14, --text-primary). Figma: Show value. */
  showValue?: boolean
  /** Accessible name, e.g. "Course progress". Required when no visible text names the bar. */
  label?: string
  className?: string
}

const filledCount = (v: number) =>
  Math.round((Math.max(0, Math.min(100, v)) / 100) * PROGRESS_SEGMENTS)

/* Progress bar: a thin 8-segment track showing how much of a lesson, course,
   program or skill is done. Not for loading, video playback or wizard steps
   (see docs/design-system/progress-bar.md). */
function ProgressBar({
  value,
  tone = 'primary',
  surface = 'page',
  height = 8,
  width,
  complete,
  doneValue,
  showValue = false,
  label,
  className,
}: ProgressBarProps) {
  const pct = Math.round(Math.max(0, Math.min(100, value)))
  const isComplete = complete ?? pct >= 100
  const filled = isComplete ? PROGRESS_SEGMENTS : filledCount(pct)
  const done = doneValue === undefined || isComplete ? 0 : Math.min(filled, filledCount(doneValue))

  const style = { '--pb-height': `${height}px`, ...(width ? { width } : {}) } as CSSProperties

  const bar = (
    <div
      className={[
        'ds-progress',
        `ds-progress--${surface}`,
        `ds-progress--${tone}`,
        isComplete && 'ds-progress--complete',
        width ? 'ds-progress--fixed' : '',
        !showValue && className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
      role="progressbar"
      aria-valuenow={isComplete ? 100 : pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      {Array.from({ length: PROGRESS_SEGMENTS }, (_, i) => (
        <span
          key={i}
          className={`ds-progress__seg${i < done ? ' ds-progress__seg--done' : i < filled ? ' ds-progress__seg--filled' : ''}`}
        />
      ))}
    </div>
  )

  if (!showValue) return bar
  return (
    <span className={['ds-progress-row', className].filter(Boolean).join(' ')}>
      {bar}
      <span className="ds-progress__value">{isComplete ? 100 : pct}%</span>
    </span>
  )
}

export default ProgressBar
