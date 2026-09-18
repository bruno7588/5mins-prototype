import './DashedBorder.css'

interface Props {
  /** Corner radius in px — match the host's --radius-* token value. */
  radius?: number
  /** Dash length in px. */
  dash?: number
  /** Gap between dashes in px. Defaults to the dash length. */
  gap?: number
  /** Stroke width in px. Centred on the element edge, so the outer half clips
      and half this value is what you see. */
  thickness?: number
  /** Extra class for the stroke colour or state reactions (see the CSS). */
  className?: string
}

/**
 * Crisp dashed border drawn as a real inline SVG.
 *
 * CSS `border: dashed` can't set a dash length or the space between dashes, and
 * an SVG mask/background image rasterises blurry. An inline SVG renders as a
 * vector at native resolution, so the dash stays sharp at any size, and the
 * stroke colour comes from CSS — it stays theme-aware and can react to the
 * host's hover/active state.
 *
 * Absolutely positioned over its host, which therefore needs `position: relative`.
 */
function DashedBorder({ radius = 12, dash = 4, gap, thickness = 3, className }: Props) {
  return (
    <svg className={`dashed-border${className ? ` ${className}` : ''}`} width="100%" height="100%" aria-hidden="true">
      <rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        rx={radius}
        ry={radius}
        fill="none"
        strokeWidth={thickness}
        strokeDasharray={`${dash} ${gap ?? dash}`}
      />
    </svg>
  )
}

export default DashedBorder
