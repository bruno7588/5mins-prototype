import { useEffect, useRef } from 'react'
import lottie, { type AnimationItem } from 'lottie-web'
import splashData from './splash.json'
import './SplashScreen.css'

/** Minimum time the splash stays on screen, even on fast machines / reduced
 *  motion — long enough for the "Setting things up" beat to register. */
const MIN_VISIBLE_MS = 2600

const reducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

interface SplashScreenProps {
  /** Called once the Hugo animation has played and the splash has faded out. */
  onDone: () => void
}

/**
 * Post-onboarding loading splash: the Hugo bird drops in (Lottie) over the
 * brand-dark background while "Setting things up" trails up beneath it, then
 * the whole thing fades out and hands off to the Workspace. Inspired by
 * Brilliant.org's setup loader.
 */
export default function SplashScreen({ onDone }: SplashScreenProps) {
  const animBoxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const start = performance.now()
    let anim: AnimationItem | undefined
    let fadeTimer: number | undefined

    const finish = () => {
      const elapsed = performance.now() - start
      const wait = Math.max(0, MIN_VISIBLE_MS - elapsed)
      fadeTimer = window.setTimeout(onDone, wait)
    }

    if (reducedMotion() || !animBoxRef.current) {
      finish()
    } else {
      anim = lottie.loadAnimation({
        container: animBoxRef.current,
        renderer: 'svg',
        loop: false,
        autoplay: true,
        animationData: splashData,
        rendererSettings: { preserveAspectRatio: 'xMidYMid meet' },
      })
      anim.addEventListener('complete', finish)
    }

    return () => {
      if (fadeTimer) window.clearTimeout(fadeTimer)
      anim?.destroy()
    }
  }, [onDone])

  return (
    <div className="splash" role="status" aria-live="polite">
      <div className="splash__stage">
        <div className="splash__anim" ref={animBoxRef} aria-hidden="true" />
        <p className="splash__label">
          Setting things up
          <span className="splash__dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </p>
      </div>
    </div>
  )
}
