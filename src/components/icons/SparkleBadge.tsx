import type { ReactNode } from 'react'
import SparkleIcon from './SparkleIcon'
import './SparkleBadge.css'

interface SparkleBadgeProps {
  /** The glyph being marked — whatever the row would show if it weren't an AI route. */
  children: ReactNode
  /** Box size, matching the icon inside it. */
  size?: number
  className?: string
}

/**
 * A glyph marked as an AI route: the icon of the thing being made, with a sparkle
 * badged onto its corner.
 *
 * Collapsed, the Add Content rail is nothing but glyphs, so two rows sharing the plain
 * sparkle were two rows that could only be told apart by hovering both. The thing made
 * is the base and the sparkle is the modifier — the other way round, both rows would
 * still read "sparkle" at a glance, which is the problem.
 *
 * The base is masked where the badge sits rather than the badge being given a halo in
 * the surface colour: the rail's background changes on hover, and a halo would have to
 * follow it.
 */
function SparkleBadge({ children, size = 20, className = '' }: SparkleBadgeProps) {
  /* Proportional to the box, so the same component works wherever the rail's icon size
     is set rather than only at 20. */
  const badge = size * 0.5
  const offset = size * 0.05
  return (
    <span
      className={`sparkle-badge ${className}`.trim()}
      style={{
        width: size,
        height: size,
        /* Where the hole goes, in the box's own coordinates: the badge's centre, in the
           bottom-right corner. Not the top-right, which is where a badge usually goes:
           the assessments glyph carries its question mark up there, and punching a hole
           for the sparkle took away the one mark that says which glyph it is. Both
           bases keep what identifies them — the clipboard its clip, the card stack its
           question mark — down here. */
        ['--sparkle-badge-x' as string]: `${size + offset - badge / 2}px`,
        ['--sparkle-badge-y' as string]: `${size + offset - badge / 2}px`,
        ['--sparkle-badge-size' as string]: `${badge}px`,
        /* Wider than the badge, so the base clears its points rather than touching them. */
        ['--sparkle-badge-hole' as string]: `${badge * 0.62}px`,
      }}
    >
      <span className="sparkle-badge__base">{children}</span>
      {/* Always filled. The base carries the Linear → Bold ladder; at half the box a
          hollow sparkle is a few hairlines and reads as dirt on the glyph. */}
      <SparkleIcon className="sparkle-badge__mark" size={badge} variant="Bold" />
    </span>
  )
}

export default SparkleBadge
