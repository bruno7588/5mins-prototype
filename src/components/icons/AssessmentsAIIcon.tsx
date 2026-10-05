interface AssessmentsAIIconProps {
  size?: number
  color?: string
  className?: string
  /** Bold is the selected weight, matching the Iconsax variant pattern. */
  variant?: 'Linear' | 'Bold'
}

/* The card stack. Identical in both weights; only the sparkle changes (Figma, 2026-10-05). */
const CARDS =
  'M4 6V20H18C19 20 19 22 18 22H4C2.9 22 2 21.1 2 20V6C2 5 4 5 4 6ZM8 2V3C8 3.5 8 3.5 8 4V16H20' +
  'C20.5 16 20.2183 16.0052 20.5 16C20.5 16 20.5 16 21 16C20.1562 16 22.4142 16 21 16C21 16 22 16 ' +
  '21.687 16.0045C21 16 21 16 21 16C21 16 21.8049 16.0115 22 16C22 17.1 21.1 18 20 18H8C6.9 18 6 ' +
  '17.1 6 16V4C6 2.9 6.9 2 8 2Z'

const SPARKLE =
  'M14.6809 5.17994C14.8468 4.49556 15.8202 4.49556 15.9861 5.17994L16.4427 7.06304C16.502 ' +
  '7.30738 16.6928 7.49816 16.9371 7.55741L18.8202 8.01404C19.5046 8.17999 19.5046 9.15333 ' +
  '18.8202 9.31928L16.9371 9.7759C16.6928 9.83515 16.502 10.0259 16.4427 10.2703L15.9861 ' +
  '12.1534C15.8202 12.8378 14.8468 12.8378 14.6809 12.1534L14.2243 10.2703C14.165 10.0259 ' +
  '13.9742 9.83515 13.7299 9.7759L11.8468 9.31928C11.1624 9.15333 11.1624 8.17999 11.8468 ' +
  '8.01404L13.7299 7.55741C13.9742 7.49816 14.165 7.30738 14.2243 7.06304L14.6809 5.17994Z'

/* The companion star, up and right of the sparkle. Its path is only ~0.02 units across, so
   what draws is essentially the stroke itself. */
const SPARK =
  'M20.6665 3.98926C20.6699 3.9927 20.6728 3.9966 20.6763 4C20.673 4.00324 20.6697 4.00649 ' +
  '20.6665 4.00977C20.6631 4.00633 20.6592 4.0034 20.6558 4C20.6594 3.99644 20.6629 3.99286 ' +
  '20.6665 3.98926Z'

/**
 * "Create assessments with AI": the card stack with a sparkle in it, drawn in Figma.
 * Linear outlines the sparkle; Bold fills it. `currentColor` throughout, so the menu
 * row's colour reaches the glyph like it reaches its neighbours.
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
      <path d={SPARK} stroke={color} />
    </svg>
  )
}

export default AssessmentsAIIcon
