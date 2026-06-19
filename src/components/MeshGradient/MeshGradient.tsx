import { useEffect, useMemo, useRef } from 'react'
import gsap from 'gsap'
import { drawFrame, lerpConfig, makeNoiseCanvas, type MeshConfig } from '../../lib/meshGradient'
import './MeshGradient.css'

interface Props {
  /** The target gradient. Changing it morphs the canvas from the current
   *  gradient to this one over `morphDuration` seconds. */
  config: MeshConfig
  /** Morph duration in seconds (default 0.9). */
  morphDuration?: number
  /** Whether the gradient parallaxes toward the cursor (default true).
   *  Auto-disabled on touch / no-hover devices and under reduced motion. */
  interactive?: boolean
  /** Max parallax shift as a fraction of the canvas (default 0.04 = subtle). */
  parallax?: number
  /** Multiplier on the per-shape breathing drift (default 1). Higher values
   *  make the shapes flow more — used on the Screen 6 loading screen. */
  breathe?: number
  /** Multiplier on the breathing speed (default 1). Higher = the shapes cycle
   *  faster, so the motion stays visible over short windows. */
  breatheSpeed?: number
  className?: string
}

/** Cap on the blurred layer's longest side — blur cost scales with this. */
const MESH_QUALITY = 700

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

const hasHover = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(hover: hover)').matches

/**
 * Full-bleed animated mesh gradient. Continuously "breathes" via a rAF loop and
 * smoothly morphs (geometry + colour) whenever `config` changes. Renders the
 * blurred shapes into a small offscreen canvas and upscales — cheap, and
 * indistinguishable under heavy blur.
 */
export default function MeshGradient({
  config,
  morphDuration = 0.9,
  interactive = true,
  parallax = 0.04,
  breathe = 1,
  breatheSpeed = 1,
  className,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const noise = useMemo(() => makeNoiseCanvas(), [])
  const offscreen = useMemo(() => document.createElement('canvas'), [])

  // Animation state read by the rAF loop without re-subscribing.
  const anim = useRef({ from: config, to: config, morph: 1 })
  const startRef = useRef(0)
  const rafRef = useRef(0)
  // Pointer parallax: `target` follows the cursor, `current` eases toward it.
  const pointerTarget = useRef({ x: 0, y: 0 })
  const pointerCurrent = useRef({ x: 0, y: 0 })

  // Track the cursor (anywhere in the window) and ease the parallax target.
  useEffect(() => {
    if (!interactive || prefersReducedMotion() || !hasHover()) return
    const wrap = wrapRef.current!
    const onMove = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) return
      const x = (e.clientX - (r.left + r.width / 2)) / (r.width / 2)
      const y = (e.clientY - (r.top + r.height / 2)) / (r.height / 2)
      pointerTarget.current = {
        x: Math.max(-1, Math.min(1, x)),
        y: Math.max(-1, Math.min(1, y)),
      }
    }
    const onLeave = () => {
      pointerTarget.current = { x: 0, y: 0 }
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('mouseleave', onLeave)
    window.addEventListener('blur', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('mouseleave', onLeave)
      window.removeEventListener('blur', onLeave)
    }
  }, [interactive])

  // Drive the breathing loop for the component's lifetime.
  useEffect(() => {
    const wrap = wrapRef.current!
    const canvas = canvasRef.current!
    const reduced = prefersReducedMotion()
    const parallaxAmount = interactive && !reduced && hasHover() ? parallax : 0

    const paint = (now: number) => {
      if (!startRef.current) startRef.current = now
      const time = reduced ? 0 : (now - startRef.current) / 1000

      const dispW = wrap.clientWidth
      const dispH = wrap.clientHeight
      if (dispW <= 0 || dispH <= 0) {
        rafRef.current = requestAnimationFrame(paint)
        return
      }
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const bw = Math.round(dispW * dpr)
      const bh = Math.round(dispH * dpr)
      if (canvas.width !== bw || canvas.height !== bh) {
        canvas.width = bw
        canvas.height = bh
      }

      // Blurred shapes at reduced resolution (the expensive part).
      const q = Math.min(1, MESH_QUALITY / Math.max(bw, bh))
      const lw = Math.max(1, Math.round(bw * q))
      const lh = Math.max(1, Math.round(bh * q))
      if (offscreen.width !== lw || offscreen.height !== lh) {
        offscreen.width = lw
        offscreen.height = lh
      }
      const octx = offscreen.getContext('2d')!
      octx.setTransform(1, 0, 0, 1, 0, 0)
      const { from, to, morph } = anim.current

      // Ease the parallax offset toward the cursor target (laggy = weighty).
      const pc = pointerCurrent.current
      const pt = pointerTarget.current
      pc.x += (pt.x - pc.x) * 0.06
      pc.y += (pt.y - pc.y) * 0.06

      drawFrame(octx, lw, lh, from, to, morph, time, noise, pc, parallaxAmount, breathe, breatheSpeed)

      // Upscale into the display canvas.
      const ctx = canvas.getContext('2d')!
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, bw, bh)
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(offscreen, 0, 0, lw, lh, 0, 0, bw, bh)

      rafRef.current = requestAnimationFrame(paint)
    }

    rafRef.current = requestAnimationFrame(paint)
    return () => cancelAnimationFrame(rafRef.current)
  }, [noise, offscreen, interactive, parallax, breathe, breatheSpeed])

  // Morph to a new config whenever it changes.
  useEffect(() => {
    const a = anim.current
    // Snapshot the currently-displayed config as the morph origin.
    const current = lerpConfig(a.from, a.to, a.morph)
    a.from = current
    a.to = config
    a.morph = 0

    if (prefersReducedMotion()) {
      a.morph = 1
      return
    }
    const tween = gsap.to(a, {
      morph: 1,
      duration: morphDuration,
      ease: 'power3.out',
    })
    return () => {
      tween.kill()
    }
  }, [config, morphDuration])

  return (
    <div ref={wrapRef} className={`mesh-gradient${className ? ` ${className}` : ''}`}>
      <canvas ref={canvasRef} className="mesh-gradient__canvas" />
    </div>
  )
}
