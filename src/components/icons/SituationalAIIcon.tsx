import { useId } from 'react'

interface SituationalAIIconProps {
  size?: number
  color?: string
  className?: string
  /** Bold is the selected weight, matching the Iconsax variant pattern. */
  variant?: 'Linear' | 'Bold'
}

/* The badge, identical in both weights — only how it is painted differs. */
const SPARKLE =
  'M17.929 15.4491C18.0742 14.8503 18.9258 14.8503 19.071 15.4491L19.4706 17.0968C19.5224 ' +
  '17.3106 19.6894 17.4776 19.9032 17.5294L21.5509 17.929C22.1497 18.0742 22.1497 18.9258 ' +
  '21.5509 19.071L19.9032 19.4706C19.6894 19.5224 19.5224 19.6894 19.4706 19.9032L19.071 ' +
  '21.5509C18.9258 22.1497 18.0742 22.1497 17.929 21.5509L17.5294 19.9032C17.4776 19.6894 ' +
  '17.3106 19.5224 17.0968 19.4706L15.4491 19.071C14.8503 18.9258 14.8503 18.0742 15.4491 ' +
  '17.929L17.0968 17.5294C17.3106 17.4776 17.4776 17.3106 17.5294 17.0968L17.929 15.4491Z'

/* The companion star, up and right of the badge. Stroked in both weights — its path is
   only ~0.02 units across, so what draws is essentially the 0.75 stroke itself. */
const SPARK =
  'M22.5 14.9912C22.5027 14.994 22.505 14.9972 22.5078 15C22.5052 15.0026 22.5026 15.0052 ' +
  '22.5 15.0078C22.4972 15.005 22.494 15.0027 22.4912 15C22.4942 14.9971 22.4971 14.9942 ' +
  '22.5 14.9912Z'

/**
 * "Create situational tests with AI" — the clipboard with a sparkle badged into its
 * bottom-right corner. Drawn in Figma, so the two weights are separate artwork.
 *
 * Linear needs no clearing: its outline is drawn open, stopping either side of the badge.
 * Bold is a solid shape, so the gap is masked out of it — the source SVG paints that gap
 * in the page colour, but the rail's background moves under this icon on hover and
 * selection, and a painted gap would have to move with it. Everything else takes
 * `currentColor`, so the row's amber reaches the glyph like it reaches its neighbours.
 */
function SituationalAIIcon({
  size = 20,
  color = 'currentColor',
  className,
  variant = 'Linear',
}: SituationalAIIconProps) {
  /* Two of these render at once — the rail and its collapsed twin — and a shared id
     would let one instance's mask clip the other. */
  const gapId = `situational-ai-gap-${useId()}`

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
      {variant === 'Bold' ? (
        <>
          <defs>
            {/* White keeps, black cuts — so the filled clipboard stops short of the badge. */}
            <mask id={gapId}>
              <rect width="24" height="24" fill="#fff" />
              <circle cx="18" cy="18" r="6" fill="#000" />
            </mask>
          </defs>
          <g mask={`url(#${gapId})`} fill={color}>
            <path d="M14.3498 2H9.64977C8.60977 2 7.75977 2.84 7.75977 3.88V4.82C7.75977 5.86 8.59977 6.7 9.63977 6.7H14.3498C15.3898 6.7 16.2298 5.86 16.2298 4.82V3.88C16.2398 2.84 15.3898 2 14.3498 2Z" />
            <path d="M17.24 4.82001C17.24 6.41001 15.94 7.71001 14.35 7.71001H9.65004C8.06004 7.71001 6.76004 6.41001 6.76004 4.82001C6.76004 4.26001 6.16004 3.91001 5.66004 4.17001C4.25004 4.92001 3.29004 6.41001 3.29004 8.12001V17.53C3.29004 19.99 5.30004 22 7.76004 22H16.24C18.7 22 20.71 19.99 20.71 17.53V8.12001C20.71 6.41001 19.75 4.92001 18.34 4.17001C17.84 3.91001 17.24 4.26001 17.24 4.82001ZM10.38 16.95H8.00004C7.59004 16.95 7.25004 16.61 7.25004 16.2C7.25004 15.79 7.59004 15.45 8.00004 15.45H10.38C10.79 15.45 11.13 15.79 11.13 16.2C11.13 16.61 10.79 16.95 10.38 16.95ZM13 12.95H8.00004C7.59004 12.95 7.25004 12.61 7.25004 12.2C7.25004 11.79 7.59004 11.45 8.00004 11.45H13C13.41 11.45 13.75 11.79 13.75 12.2C13.75 12.61 13.41 12.95 13 12.95Z" />
          </g>
          <path
            d={SPARKLE}
            fill={color}
            stroke={color}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d={SPARK} stroke={color} strokeWidth={0.75} />
        </>
      ) : (
        <>
          <g
            stroke={color}
            strokeWidth={1.5}
            strokeMiterlimit={10}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M8 12H14" />
            <path d="M8 16H11" />
            <path d="M10 6H14C16 6 16 5 16 4C16 2 15 2 14 2H10C9 2 8 2 8 4C8 6 9 6 10 6Z" />
            {/* Open on the bottom-right: the outline stops either side of the badge
                rather than running behind it. */}
            <path d="M16 4.01999C19.33 4.19999 21 5.42999 21 9.99999M9 22C4 22 3 20 3 16V9.99999C3 5.43999 4.67 4.19999 8 4.01999" />
          </g>
          <path d={SPARKLE} stroke={color} strokeLinecap="round" strokeLinejoin="round" />
          <path d={SPARK} stroke={color} strokeWidth={0.75} />
        </>
      )}
    </svg>
  )
}

export default SituationalAIIcon
