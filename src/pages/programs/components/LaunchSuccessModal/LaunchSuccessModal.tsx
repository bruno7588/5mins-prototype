import CloseButton from '../../../../components/CloseButton/CloseButton'
import './LaunchSuccessModal.css'

function SuccessTick() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M35.959 69.7246C54.5986 69.7246 69.709 54.6142 69.709 35.9746C69.709 17.335 54.5986 2.22461 35.959 2.22461C17.3194 2.22461 2.20898 17.335 2.20898 35.9746C2.20898 54.6142 17.3194 69.7246 35.959 69.7246Z" fill="#11763D"/>
      <path d="M33.7652 67.0246C51.1933 67.0246 65.3215 52.8964 65.3215 35.4684C65.3215 18.0403 51.1933 3.91211 33.7652 3.91211C16.3372 3.91211 2.20898 18.0403 2.20898 35.4684C2.20898 52.8964 16.3372 67.0246 33.7652 67.0246Z" fill="#18A957"/>
      <path d="M13.48 16.7094C16.0112 12.7156 21.4112 9.39687 27.0362 8.38437C28.4425 8.15937 29.8487 8.04688 31.03 8.49688C31.93 8.83438 32.6612 9.67812 32.155 10.6344C31.7612 11.4219 30.6925 11.7594 29.8487 12.0406C24.5725 13.7844 20.0219 17.2212 16.9112 21.8281C15.7862 23.5156 14.0987 28.1844 12.0175 27.0031C9.82374 25.7094 10.2737 21.6594 13.48 16.7094Z" fill="#A3DDBC"/>
      <path d="M23.25 36.0056L31.74 44.4956L48.75 27.5156" stroke="#F9F9FA" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

/* Full-screen launch success (Figma 2423:13169). */

const COLORS = ['#FFBB38', '#00CEE6', '#DF1642', '#18A957', '#8158EC', '#FF7A45']

// Pseudo-random but deterministic spread (no Math.random so it's stable per render).
const rand = (n: number) => {
  const x = Math.sin(n * 999.13) * 43758.5453
  return x - Math.floor(x)
}
const CONFETTI = Array.from({ length: 60 }, (_, i) => ({
  left: rand(i) * 100, // scattered anywhere across the width
  delay: rand(i + 7) * 0.7, // tighter, more random stagger
  duration: 1.2 + rand(i + 13) * 1.1, // 1.2–2.3s — faster fall
  color: COLORS[i % COLORS.length],
  // Multiple turns, random direction + amount.
  rot: (rand(i + 3) < 0.5 ? -1 : 1) * (360 + Math.round(rand(i + 5) * 720)),
  drift: Math.round((rand(i + 11) - 0.5) * 160), // -80 … 80px horizontal drift
  round: rand(i + 17) < 0.34,
}))

interface Props {
  open: boolean
  onClose: () => void
  onTrackProgress: () => void
}

function LaunchSuccessModal({ open, onClose, onTrackProgress }: Props) {
  if (!open) return null

  return (
    <div className="lsm-overlay" role="dialog" aria-modal="true" aria-label="Program launched">
      <div className="lsm-confetti" aria-hidden="true">
        {CONFETTI.map((c, i) => (
          <span
            key={i}
            className={`lsm-confetti__piece${c.round ? ' lsm-confetti__piece--round' : ''}`}
            style={{
              left: `${c.left}%`,
              background: c.color,
              animationDelay: `${c.delay}s`,
              animationDuration: `${c.duration}s`,
              ['--lsm-rot' as string]: `${c.rot}deg`,
              ['--lsm-drift' as string]: `${c.drift}px`,
            }}
          />
        ))}
      </div>

      <CloseButton onClick={onClose} className="lsm-close" />

      <div className="lsm-content">
        <SuccessTick />
        <div className="lsm-info">
          <h2 className="lsm-title">Success!</h2>
          <p className="lsm-sub">Your program is now live.</p>
        </div>
        <button type="button" className="lsm-btn" onClick={onTrackProgress}>
          Track Progress
        </button>
      </div>
    </div>
  )
}

export default LaunchSuccessModal
