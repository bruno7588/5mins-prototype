import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import { useOverlayA11y } from '../../../../hooks/useOverlayA11y'
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

/** New pieces spawn for this long; in-flight ones then finish their fall. */
const RAIN_S = 3

// Pseudo-random but deterministic spread (no Math.random so it's stable per render).
const rand = (n: number) => {
  const x = Math.sin(n * 999.13) * 43758.5453
  return x - Math.floor(x)
}

/* Depth tiers — far pieces are smaller, slower and dimmer; near ones bigger
   and faster. Gives the flat rain a parallax feel. */
const TIERS = [
  { scale: 0.65, opacity: 0.75, durMin: 2.2, durSpan: 0.9 }, // far
  { scale: 0.85, opacity: 0.9, durMin: 1.7, durSpan: 0.8 }, // mid
  { scale: 1.1, opacity: 1, durMin: 1.2, durSpan: 0.7 }, // near
]

const CONFETTI = Array.from({ length: 60 }, (_, i) => {
  const tier = TIERS[Math.floor(rand(i + 23) * TIERS.length)]
  const delay = rand(i + 7) * 0.7
  const duration = tier.durMin + rand(i + 13) * tier.durSpan
  // Falls started before the 3s mark complete; nothing respawns after it.
  const plays = Math.max(1, Math.ceil((RAIN_S - delay) / duration))
  return {
    left: rand(i) * 100, // scattered anywhere across the width
    delay,
    duration,
    plays,
    color: COLORS[i % COLORS.length],
    round: rand(i + 17) < 0.34,
    scale: tier.scale,
    opacity: tier.opacity,
    // 2D spin: multiple turns, random direction + amount.
    rot: (rand(i + 3) < 0.5 ? -1 : 1) * (360 + Math.round(rand(i + 5) * 720)),
    // Flutter: horizontal sway + 3D tumble.
    swayAmp: (rand(i + 43) < 0.5 ? -1 : 1) * (16 + rand(i + 29) * 44), // ±16–60px
    swayDur: 0.6 + rand(i + 31) * 0.7, // 0.6–1.3s per half swing
    tumbleX: 180 + Math.round(rand(i + 37) * 540),
    tumbleY: 180 + Math.round(rand(i + 41) * 540),
  }
})

/** When the very last in-flight piece lands. */
const LAST_LANDING_MS = Math.max(...CONFETTI.map((c) => c.delay + c.plays * c.duration)) * 1000

/* Confetti rain — GSAP drives each piece (fall, sway, 3D tumble, edge fades);
   Framer Motion fades the layer out when it leaves the tree. */
function ConfettiLayer() {
  const layerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const pieces = layerRef.current?.querySelectorAll<HTMLElement>('.lsm-confetti__piece') ?? []
      pieces.forEach((el, i) => {
        const c = CONFETTI[i]
        gsap.set(el, { scale: c.scale, transformPerspective: 600, autoAlpha: 0 })
        // Fall: restarts per play until the rain window closes, then runs out.
        gsap.to(el, {
          keyframes: {
            '0%': { y: '-10vh', autoAlpha: 0 },
            '8%': { autoAlpha: c.opacity },
            '90%': { autoAlpha: c.opacity },
            '100%': { y: '110vh', autoAlpha: 0 },
            easeEach: 'none',
          },
          duration: c.duration,
          delay: c.delay,
          repeat: c.plays - 1,
          ease: 'none',
        })
        // Spin + 3D tumble, synced to each fall.
        gsap.to(el, {
          rotation: c.rot,
          rotationX: c.tumbleX,
          rotationY: c.tumbleY,
          duration: c.duration,
          delay: c.delay,
          repeat: c.plays - 1,
          ease: 'none',
        })
        // Sway drifts side-to-side continuously, unsynced for variety.
        gsap.to(el, {
          x: c.swayAmp,
          duration: c.swayDur,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        })
      })
    }, layerRef)
    return () => ctx.revert()
  }, [])

  return (
    <motion.div
      ref={layerRef}
      className="lsm-confetti"
      aria-hidden="true"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {CONFETTI.map((c, i) => (
        <span
          key={i}
          className={`lsm-confetti__piece${c.round ? ' lsm-confetti__piece--round' : ''}`}
          style={{ left: `${c.left}%`, background: c.color }}
        />
      ))}
    </motion.div>
  )
}

interface Props {
  open: boolean
  onClose: () => void
  onTrackProgress: () => void
}

function LaunchSuccessModal({ open, onClose, onTrackProgress }: Props) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [raining, setRaining] = useState(true)
  useOverlayA11y(panelRef, open, { onEscape: onClose })

  // Keep the layer mounted until the last in-flight piece has landed.
  useEffect(() => {
    if (!open) return
    setRaining(true)
    const t = setTimeout(() => setRaining(false), LAST_LANDING_MS + 100)
    return () => clearTimeout(t)
  }, [open])

  if (!open) return null

  return (
    <div
      ref={panelRef}
      className="lsm-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Program launched"
      tabIndex={-1}
    >
      <MotionConfig reducedMotion="user">
        <AnimatePresence>{raining && <ConfettiLayer />}</AnimatePresence>

        <CloseButton onClick={onClose} className="lsm-close" />

        <div className="lsm-content">
          {/* Choreographed entrance: tick pops, text and CTA follow. */}
          <motion.div
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
          >
            <SuccessTick />
          </motion.div>
          <motion.div
            className="lsm-info"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.35, ease: 'easeOut' }}
          >
            <h2 className="lsm-title">Success!</h2>
            <p className="lsm-sub">Your program is now live.</p>
          </motion.div>
          <motion.button
            type="button"
            className="lsm-btn"
            onClick={onTrackProgress}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.35, ease: 'easeOut' }}
          >
            Track Progress
          </motion.button>
        </div>
      </MotionConfig>
    </div>
  )
}

export default LaunchSuccessModal
