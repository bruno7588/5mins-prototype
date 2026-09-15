interface ImpersonateIconProps {
  size?: number
  color?: string
  className?: string
}

/**
 * Venetian mask — the impersonation mark (bar + People row menu). Iconsax has no
 * "acting as someone else" glyph, so this is Lucide's "venetian-mask" (ISC licence)
 * redrawn at Iconsax's 1.5px Linear stroke to sit at the same weight.
 */
function ImpersonateIcon({ size = 24, color = 'currentColor', className }: ImpersonateIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path d="M18 11c-1.5 0-2.5.5-3 2" />
      <path d="M4 6a2 2 0 0 0-2 2v4a5 5 0 0 0 5 5 8 8 0 0 1 5 2 8 8 0 0 1 5-2 5 5 0 0 0 5-5V8a2 2 0 0 0-2-2h-3a8 8 0 0 0-5 2 8 8 0 0 0-5-2z" />
      <path d="M6 11c1.5 0 2.5.5 3 2" />
    </svg>
  )
}

export default ImpersonateIcon
