interface Props {
  size?: number
  color?: string
}

/** Curly braces { }, the common sign for a merge field. Drawn to match Iconsax Linear
    (24 grid, 1.5 stroke); Iconsax has none. */
function BracesIcon({ size = 20, color = 'currentColor' }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8.5 4h-1A1.5 1.5 0 0 0 6 5.5V10a2 2 0 0 1-2 2 2 2 0 0 1 2 2v4.5A1.5 1.5 0 0 0 7.5 20h1M15.5 4h1A1.5 1.5 0 0 1 18 5.5V10a2 2 0 0 0 2 2 2 2 0 0 0-2 2v4.5a1.5 1.5 0 0 1-1.5 1.5h-1"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default BracesIcon
