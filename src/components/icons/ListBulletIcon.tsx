interface Props {
  size?: number
  color?: string
}

/** Bulleted list, drawn to match Iconsax Linear (24 grid, 1.5 stroke); Iconsax has none. */
function ListBulletIcon({ size = 20, color = 'currentColor' }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 6h12M9 12h12M9 18h12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="4" cy="6" r="1.25" fill={color} />
      <circle cx="4" cy="12" r="1.25" fill={color} />
      <circle cx="4" cy="18" r="1.25" fill={color} />
    </svg>
  )
}

export default ListBulletIcon
