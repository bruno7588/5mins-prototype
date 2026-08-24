import { useId } from 'react'

interface SituationalAIIconProps {
  size?: number
  color?: string
  className?: string
  /** Bold is the selected weight, matching the Iconsax variant pattern. */
  variant?: 'Linear' | 'Bold'
}

/**
 * "Create situational tests with AI" — the clipboard with a sparkle badged into its
 * bottom-right corner. Drawn in Figma rather than composed in code, so the two weights
 * are separate artwork.
 *
 * The source SVGs paint the gap around the badge in the page colour. Here it is masked
 * out instead: the rail's background moves under this icon on hover and selection, and a
 * painted gap would have to move with it. Everything else is `currentColor`, so the row's
 * amber reaches the glyph the same way it reaches its neighbours.
 */
function SituationalAIIcon({
  size = 20,
  color = 'currentColor',
  className,
  variant = 'Linear',
}: SituationalAIIconProps) {
  /* Two of these render at once — the rail and its collapsed twin — and a shared id
     would let one instance's mask clip the other. */
  const uid = useId()
  const gapId = `situational-ai-gap-${uid}`
  const badgeId = `situational-ai-badge-${uid}`

  /* The badge's own artwork, identical in both weights: r=6 of clear space, and the
     sparkle centred in it. */
  const sparkle =
    'M17.5105 15.385C17.635 14.8717 18.365 14.8717 18.4895 15.385L18.8319 16.7973C18.8764 ' +
    '16.9805 19.0195 17.1236 19.2027 17.1681L20.615 17.5105C21.1283 17.635 21.1283 18.365 ' +
    '20.615 18.4895L19.2027 18.8319C19.0195 18.8764 18.8764 19.0195 18.8319 19.2027L18.4895 ' +
    '20.615C18.365 21.1283 17.635 21.1283 17.5105 20.615L17.1681 19.2027C17.1236 19.0195 ' +
    '16.9805 18.8764 16.7973 18.8319L15.385 18.4895C14.8717 18.365 14.8717 17.635 15.385 ' +
    '17.5105L16.7973 17.1681C16.9805 17.1236 17.1236 16.9805 17.1681 16.7973L17.5105 15.385Z'

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
      <defs>
        {/* White keeps, black cuts — so the clipboard stops short of the badge. */}
        <mask id={gapId}>
          <rect width="24" height="24" fill="#fff" />
          <circle cx="18" cy="18" r="6" fill="#000" />
        </mask>
        {variant === 'Bold' && (
          /* Bold's badge is a filled disc with the sparkle taken out of it, rather than
             a sparkle drawn on top. */
          <mask id={badgeId}>
            <circle cx="18" cy="18" r="5.25" fill="#fff" />
            <path d={sparkle} fill="#000" />
          </mask>
        )}
      </defs>

      {variant === 'Bold' ? (
        <>
          <g mask={`url(#${gapId})`}>
            <path
              d="M14.3498 2H9.64977C8.60977 2 7.75977 2.84 7.75977 3.88V4.82C7.75977 5.86 8.59977 6.7 9.63977 6.7H14.3498C15.3898 6.7 16.2298 5.86 16.2298 4.82V3.88C16.2398 2.84 15.3898 2 14.3498 2Z"
              fill={color}
            />
            <path
              d="M17.24 4.82001C17.24 6.41001 15.94 7.71001 14.35 7.71001H9.65004C8.06004 7.71001 6.76004 6.41001 6.76004 4.82001C6.76004 4.26001 6.16004 3.91001 5.66004 4.17001C4.25004 4.92001 3.29004 6.41001 3.29004 8.12001V17.53C3.29004 19.99 5.30004 22 7.76004 22H16.24C18.7 22 20.71 19.99 20.71 17.53V8.12001C20.71 6.41001 19.75 4.92001 18.34 4.17001C17.84 3.91001 17.24 4.26001 17.24 4.82001ZM10.38 16.95H8.00004C7.59004 16.95 7.25004 16.61 7.25004 16.2C7.25004 15.79 7.59004 15.45 8.00004 15.45H10.38C10.79 15.45 11.13 15.79 11.13 16.2C11.13 16.61 10.79 16.95 10.38 16.95ZM13 12.95H8.00004C7.59004 12.95 7.25004 12.61 7.25004 12.2C7.25004 11.79 7.59004 11.45 8.00004 11.45H13C13.41 11.45 13.75 11.79 13.75 12.2C13.75 12.61 13.41 12.95 13 12.95Z"
              fill={color}
            />
          </g>
          <circle cx="18" cy="18" r="5.25" fill={color} mask={`url(#${badgeId})`} />
        </>
      ) : (
        <>
          <g
            mask={`url(#${gapId})`}
            stroke={color}
            strokeWidth={1.5}
            strokeMiterlimit={10}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M8 12H14" />
            <path d="M8 16H11" />
            <path d="M10 6H14C16 6 16 5 16 4C16 2 15 2 14 2H10C9 2 8 2 8 4C8 6 9 6 10 6Z" />
            <path d="M16 4.01999C19.33 4.19999 21 5.42999 21 9.99999V16C21 20 20 22 15 22H9C4 22 3 20 3 16V9.99999C3 5.43999 4.67 4.19999 8 4.01999" />
          </g>
          <path
            d={sparkle}
            stroke={color}
            strokeWidth={0.857143}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
    </svg>
  )
}

export default SituationalAIIcon
