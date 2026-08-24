interface AssessmentsAIIconProps {
  size?: number
  color?: string
  className?: string
  /** Bold is the selected weight, matching the Iconsax variant pattern. */
  variant?: 'Linear' | 'Bold'
}

/* The card stack. Identical in both weights — it is drawn as an outline-shaped fill, so
   there is no second weight of it; the badge is what changes. */
const CARDS =
  'M4 6H2V20C2 21.1 2.9 22 4 22H18V20H4V6ZM20 2H8C6.9 2 6 2.9 6 4V16C6 17.1 6.9 18 8 18H20' +
  'C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H8V4H20V16Z'

const SPARKLE =
  'M12.929 7.44912C13.0742 6.85029 13.9258 6.85029 14.071 7.44912L14.4706 9.09684C14.5224 ' +
  '9.31064 14.6894 9.47757 14.9032 9.52941L16.5509 9.92896C17.1497 10.0742 17.1497 10.9258 ' +
  '16.5509 11.071L14.9032 11.4706C14.6894 11.5224 14.5224 11.6894 14.4706 11.9032L14.071 ' +
  '13.5509C13.9258 14.1497 13.0742 14.1497 12.929 13.5509L12.5294 11.9032C12.4776 11.6894 ' +
  '12.3106 11.5224 12.0968 11.4706L10.4491 11.071C9.85029 10.9258 9.85029 10.0742 10.4491 ' +
  '9.92896L12.0968 9.52941C12.3106 9.47757 12.4776 9.31064 12.5294 9.09684L12.929 7.44912Z'

/* The companion star, up and right of the badge. Its path is only ~0.02 units across, so
   what draws is essentially the 0.75 stroke itself. */
const SPARK =
  'M17.5 6.99121C17.5027 6.994 17.505 6.99725 17.5078 7C17.5052 7.00259 17.5026 7.00519 ' +
  '17.5 7.00781C17.4972 7.00503 17.494 7.00275 17.4912 7C17.4942 6.99709 17.4971 6.99416 ' +
  '17.5 6.99121Z'

/**
 * "Create assessments with AI" — the card stack with a sparkle in it. Drawn in Figma.
 *
 * The source SVG paints a disc of the page colour behind the badge, but that disc is
 * inscribed exactly in the card's empty interior: it touches the border at four points
 * and covers nothing. Dropped rather than masked — masking on a tangent is how you get a
 * one-pixel nick in each edge, and it buys nothing here. `currentColor` throughout, so
 * the row's amber reaches the glyph like it reaches its neighbours.
 */
function AssessmentsAIIcon({
  size = 20,
  color = 'currentColor',
  className,
  variant = 'Linear',
}: AssessmentsAIIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path d={CARDS} fill={color} />
      <path
        d={SPARKLE}
        fill={variant === 'Bold' ? color : 'none'}
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d={SPARK} stroke={color} strokeWidth={0.75} />
    </svg>
  )
}

export default AssessmentsAIIcon
