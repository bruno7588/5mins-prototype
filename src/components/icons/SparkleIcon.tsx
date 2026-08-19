import { useId } from 'react'

interface SparkleIconProps {
  size?: number
  color?: string
  className?: string
  gradient?: boolean
  /**
   * Matches the Iconsax pair the rest of the icon set uses: Linear draws the sparkle
   * hollow in `color`, Bold fills it. Defaults to Bold, which is how the AI buttons
   * and the working card have always drawn it.
   */
  variant?: 'Linear' | 'Bold'
}

function SparkleIcon({
  size = 20,
  color = 'currentColor',
  className,
  gradient = false,
  variant = 'Bold',
}: SparkleIconProps) {
  const reactId = useId()
  const gradId = `sparkle-grad-${reactId}`
  const paint = gradient ? `url(#${gradId})` : color
  const linear = variant === 'Linear'
  /* Stroking a shape path traces its outline, which is the hollow sparkle Linear
     wants — so the same two paths serve both variants, painted differently. The
     third path is Bold-only: it's a ring around the small sparkle, and a ring plus
     a stroke would draw the same edge twice at two different weights. */
  const fill = linear ? 'none' : paint
  const strokeProps = linear
    ? { stroke: paint, strokeWidth: 1.5, strokeLinejoin: 'round' as const }
    : {}
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {gradient && (
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="20" y2="20" gradientUnits="userSpaceOnUse">
            <stop offset="0" style={{ stopColor: 'var(--text-button-outlined)' }} />
            <stop offset="1" style={{ stopColor: 'var(--blaze-quiz)' }} />
          </linearGradient>
        </defs>
      )}
      <path
        d="M7.24547 4.35449C7.52205 3.21387 9.14428 3.21387 9.42087 4.35449L10.1819 7.493C10.2807 7.90024 10.5986 8.2182 11.0059 8.31695L14.1444 9.07799C15.285 9.35458 15.285 10.9768 14.1444 11.2534L11.0059 12.0144C10.5986 12.1132 10.2807 12.4311 10.1819 12.8384L9.42087 15.9769C9.14428 17.1175 7.52205 17.1175 7.24547 15.9769L6.48443 12.8384C6.38568 12.4311 6.06772 12.1132 5.66048 12.0144L2.52197 11.2534C1.38135 10.9768 1.38135 9.35458 2.52197 9.07799L5.66048 8.31695C6.06772 8.2182 6.38568 7.90024 6.48443 7.493L7.24547 4.35449Z"
        fill={fill}
        {...strokeProps}
      />
      <path
        d="M15.3086 2.26019C15.3994 1.88593 15.9317 1.88593 16.0224 2.26019L16.2721 3.29002C16.3045 3.42364 16.4089 3.52797 16.5425 3.56037L17.5723 3.81009C17.9466 3.90085 17.9466 4.43314 17.5723 4.52389L16.5425 4.77361C16.4089 4.80601 16.3045 4.91034 16.2721 5.04397L16.0224 6.07379C15.9317 6.44806 15.3994 6.44806 15.3086 6.07379L15.0589 5.04397C15.0265 4.91034 14.9222 4.80601 14.7886 4.77361L13.7587 4.52389C13.3845 4.43314 13.3845 3.90085 13.7587 3.81009L14.7886 3.56037C14.9222 3.52797 15.0265 3.42364 15.0589 3.29002L15.3086 2.26019Z"
        fill={fill}
        {...strokeProps}
      />
      {!linear && (
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15.6655 2.4429L15.4617 3.28342C15.3802 3.61939 15.1179 3.88171 14.782 3.96318L13.9414 4.16699L14.782 4.37081C15.1179 4.45227 15.3802 4.71459 15.4617 5.05056L15.6655 5.89108L15.8693 5.05056C15.9508 4.71459 16.2131 4.45227 16.5491 4.37081L17.3896 4.16699L16.5491 3.96318C16.2131 3.88171 15.9508 3.61939 15.8693 3.28342L15.6655 2.4429ZM16.0734 1.98779C15.9697 1.56006 15.3614 1.56006 15.2576 1.98779L14.9722 3.16473C14.9352 3.31745 14.816 3.43668 14.6633 3.47371L13.4863 3.7591C13.0586 3.86282 13.0586 4.47116 13.4863 4.57488L14.6633 4.86027C14.816 4.8973 14.9352 5.01654 14.9722 5.16925L15.2576 6.34619C15.3614 6.77393 15.9697 6.77393 16.0734 6.34619L16.3588 5.16925C16.3958 5.01654 16.5151 4.8973 16.6678 4.86027L17.8447 4.57488C18.2725 4.47116 18.2725 3.86282 17.8447 3.7591L16.6678 3.47371C16.5151 3.43668 16.3958 3.31745 16.3588 3.16473L16.0734 1.98779Z"
        fill={fill}
      />
      )}
    </svg>
  )
}

export default SparkleIcon
