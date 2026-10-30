interface Props {
  size?: number
  color?: string
}

/** Microsoft Teams mark, single colour to sit beside Iconsax's Slack icon; Iconsax has no Teams icon. */
function TeamsIcon({ size = 20, color = 'currentColor' }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2.75" y="6.75" width="11" height="11" rx="2" stroke={color} strokeWidth="1.5" />
      <path d="M5.75 10h5M8.25 10v5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="17.5" cy="6" r="2.25" stroke={color} strokeWidth="1.5" />
      <path
        d="M13.75 10.25h6a1.5 1.5 0 0 1 1.5 1.5v3.5a3.75 3.75 0 0 1-6.6 2.45"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default TeamsIcon
