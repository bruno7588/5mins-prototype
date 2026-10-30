interface Props {
  size?: number
  color?: string
}

/** Numbered list, drawn to match Iconsax Linear (24 grid, 1.5 stroke); Iconsax has none. */
function ListNumberIcon({ size = 20, color = 'currentColor' }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M10 6h11M10 12h11M10 18h11M3.5 4.5 5 3.75V9M3.25 14.5c.3-.6.9-1 1.6-1 .9 0 1.6.6 1.6 1.4 0 1.4-3.2 2.2-3.2 4.1h3.3"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default ListNumberIcon
