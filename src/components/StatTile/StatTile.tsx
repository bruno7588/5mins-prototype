import type { ReactNode } from 'react'
import Tooltip from '@/components/Tooltip/Tooltip'
import './StatTile.css'

interface StatTileProps {
  /** `stacked`: label above a large value. `inline`: value then label on one line. */
  layout?: 'stacked' | 'inline'
  /** `mobile` (Library Device=Mobile): for the mobile app. Always stacked, with a
      Paragraph S label and an H3 value, so two tiles fit side by side on a phone. */
  device?: 'desktop' | 'mobile'
  /** An Iconsax Linear glyph coloured by meaning; the tile sizes it (32px stacked, 24px inline). */
  icon?: ReactNode
  label: ReactNode
  /** Quieter text after the label, e.g. "(Nov)". */
  labelMeta?: ReactNode
  value: ReactNode
  /** Small text after the value, e.g. "of 40" or "+12 this month". */
  sub?: ReactNode
  /** `success` colours `sub` as a positive change. */
  subTone?: 'neutral' | 'success'
  /** Shows the info icon after the label; the text opens in a DS Tooltip. */
  tooltip?: ReactNode
  /** Which side the tooltip opens on. Use Bottom for a tall tooltip near the top of the page. */
  tooltipPosition?: 'Top' | 'Bottom'
  /** Sits at the far end of the tile, e.g. the arrow on a clickable tile. */
  trailing?: ReactNode
  className?: string
}

/* Summary stat tile - Figma Library "Summary stat" (Layout=Stacked / Inline, Device=
   Desktop / Mobile). A
   bordered tile on the page ground with one headline number. Pages lay tiles out in
   their own row or grid. */
function StatTile({
  layout: layoutProp = 'stacked',
  device = 'desktop',
  icon,
  label,
  labelMeta,
  value,
  sub,
  subTone = 'neutral',
  tooltip,
  tooltipPosition = 'Top',
  trailing,
  className,
}: StatTileProps) {
  // The mobile tile exists in the stacked layout only.
  const layout = device === 'mobile' ? 'stacked' : layoutProp
  const labelEl = (
    <span className="ds-stat__label">
      {label}
      {labelMeta && <span className="ds-stat__meta">{labelMeta}</span>}
      {tooltip && (
        <Tooltip
          text={<span className="ds-stat__tooltip-text">{tooltip}</span>}
          position={tooltipPosition}
          alignment="Center"
          iconSize={16}
        />
      )}
    </span>
  )
  const subEl = sub && <span className={`ds-stat__sub${subTone === 'success' ? ' ds-stat__sub--success' : ''}`}>{sub}</span>

  return (
    <div className={['ds-stat', `ds-stat--${layout}`, device === 'mobile' && 'ds-stat--mobile', className].filter(Boolean).join(' ')}>
      {icon && <span className="ds-stat__icon">{icon}</span>}
      {layout === 'inline' ? (
        <>
          <span className="ds-stat__value">{value}</span>
          {subEl}
          {labelEl}
        </>
      ) : (
        <div className="ds-stat__body">
          {labelEl}
          <span className="ds-stat__valuerow">
            <span className="ds-stat__value">{value}</span>
            {subEl}
          </span>
        </div>
      )}
      {trailing}
    </div>
  )
}

export default StatTile
