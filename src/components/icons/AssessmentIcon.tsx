import { useId } from 'react'

interface AssessmentIconProps {
  size?: number
  color?: string
  className?: string
  /** Bold is the selected/expanded weight, matching the Iconsax variant pattern. */
  variant?: 'Linear' | 'Bold'
}

/**
 * Assessments glyph — a card stack with a question mark. Ported by hand because
 * it comes from Material (`md/MdQuiz`), not Iconsax, so it can't take the usual
 * `variant` prop from the icon library; the two weights are drawn separately
 * below and differ in viewBox (20 vs 24), hence the switch rather than one path.
 */
function AssessmentIcon({
  size = 20,
  color = 'currentColor',
  className,
  variant = 'Linear',
}: AssessmentIconProps) {
  /* The Bold artwork is clipped; a shared id would let one instance clip another
     once two render on the same screen (rail + outline card). */
  const clipId = `assessment-icon-clip-${useId()}`
  const isBold = variant === 'Bold'

  return (
    <svg
      width={size}
      height={size}
      viewBox={isBold ? '0 0 24 24' : '0 0 20 20'}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {isBold ? (
        <g clipPath={`url(#${clipId})`}>
          <path d="M4 6H2V20C2 21.1 2.9 22 4 22H18V20H4V6Z" fill={color} />
          <path
            d="M20 2H8C6.9 2 6 2.9 6 4V16C6 17.1 6.9 18 8 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM14.01 15C13.42 15 12.96 14.53 12.96 13.95C12.96 13.36 13.43 12.91 14.01 12.91C14.6 12.91 15.05 13.36 15.05 13.95C15.04 14.53 14.6 15 14.01 15ZM16.51 8.83C15.88 9.76 15.28 10.04 14.95 10.64C14.82 10.88 14.77 11.04 14.77 11.82H13.25C13.25 11.41 13.19 10.74 13.51 10.17C13.92 9.44 14.69 9.01 15.14 8.37C15.62 7.69 15.35 6.43 14 6.43C13.12 6.43 12.68 7.1 12.5 7.66L11.13 7.09C11.51 5.96 12.52 5 13.99 5C15.22 5 16.07 5.56 16.5 6.26C16.87 6.87 17.08 7.99 16.51 8.83Z"
            fill={color}
          />
        </g>
      ) : (
        <g>
          <path
            d="M3.33334 5.0013H1.66667V16.668C1.66667 17.5846 2.41667 18.3346 3.33334 18.3346H15V16.668H3.33334V5.0013ZM16.6667 1.66797H6.66667C5.75 1.66797 5.00001 2.41797 5.00001 3.33464V13.3346C5.00001 14.2513 5.75 15.0013 6.66667 15.0013H16.6667C17.5833 15.0013 18.3333 14.2513 18.3333 13.3346V3.33464C18.3333 2.41797 17.5833 1.66797 16.6667 1.66797ZM16.6667 13.3346H6.66667V3.33464H16.6667V13.3346ZM11.2583 8.46797C11.6 7.85964 12.2417 7.5013 12.6167 6.96797C13.0167 6.4013 12.7917 5.3513 11.6667 5.3513C10.9333 5.3513 10.5667 5.90964 10.4167 6.3763L9.27501 5.9013C9.59167 4.96797 10.4333 4.16797 11.6583 4.16797C12.6833 4.16797 13.3917 4.63464 13.75 5.21797C14.0583 5.71797 14.2333 6.65964 13.7583 7.35964C13.2333 8.13464 12.7333 8.36797 12.4583 8.86797C12.35 9.06797 12.3083 9.2013 12.3083 9.8513H11.0417C11.05 9.50963 10.9917 8.9513 11.2583 8.46797ZM10.7917 11.6263C10.7917 11.1346 11.1833 10.7596 11.6667 10.7596C12.1583 10.7596 12.5333 11.1346 12.5333 11.6263C12.5333 12.1096 12.1667 12.5013 11.6667 12.5013C11.1833 12.5013 10.7917 12.1096 10.7917 11.6263Z"
            fill={color}
          />
        </g>
      )}
      {isBold && (
        <defs>
          <clipPath id={clipId}>
            <rect width="24" height="24" fill="white" />
          </clipPath>
        </defs>
      )}
    </svg>
  )
}

export default AssessmentIcon
