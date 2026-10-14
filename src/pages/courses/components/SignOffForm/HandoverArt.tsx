import { Mobile, Monitor } from 'iconsax-react'

/**
 * PLACEHOLDER (DES-335): "pass the device over" art for the sign-off handover step.
 * Two Iconsax devices joined by a dashed arrow, after Amazon Alexa's "Hand your phone
 * to Sam": monitors on web (Figma 17662:24012), phones in the app (17689:28413).
 * Replace with the Library illustration once it exists.
 */
function HandoverArt({ device = 'mobile' }: { device?: 'desktop' | 'mobile' }) {
  const Device = device === 'desktop' ? Monitor : Mobile
  return (
    <span className="pcd-signoff-handover-art" aria-hidden="true">
      <svg className="pcd-signoff-handover-art__arc" width="56" height="24" viewBox="0 0 56 24" fill="none">
        <path d="M3 21C11 5 43 3 51 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3" />
        <path d="M45 15.5L51 16.5L53 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <Device size={40} color="var(--text-secondary)" variant="Linear" />
      <Device size={40} color="var(--primary-button-background)" variant="Linear" />
    </span>
  )
}

export default HandoverArt
