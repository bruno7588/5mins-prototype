import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { GrainGradient, MeshGradient } from '@paper-design/shaders-react'
import { drawPattern, patternTime } from '@/data/canvasPatterns'
import { applyPixelFinish } from '@/data/pixelFinish'
import { applySoftFinish } from '@/data/softFinish'
import { drawDither, hiddenMount, type HiddenMount } from '@/data/renderRecipe'
import { grainProps, isCanvasPattern, meshProps, type GradientRecipe } from './recipe'
import './lab-canvas.css'

/* Live preview of a recipe in a set of colours (Paper Shaders' MeshGradient, GrainGradient or Dithering,
   or a canvas pattern):
   the largest square that fits its parent (which must have a definite size),
   centred. Plays while `playing` (a still frame under reduced motion). Drag
   pans and the wheel zooms through onPan / onZoom. With the pixel finish on,
   it is applied over every frame in the three theme colours (`finishColours`). */

function usePrefersReducedMotion(): boolean {
  const query = '(prefers-reduced-motion: reduce)'
  const [reduced, setReduced] = useState(() => window.matchMedia?.(query).matches ?? false)
  useEffect(() => {
    const mq = window.matchMedia?.(query)
    if (!mq) return
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduced
}

/** A canvas pattern, drawn at the screen's pixel density into a canvas filling its frame.
    One clock runs for the life of the preview, so editing a control never restarts the motion. */
interface CanvasProps {
  recipe: GradientRecipe
  colours: string[]
  finishColours: string[]
  speed: number
  size: number
}

function PatternCanvas({ recipe, colours, finishColours, speed, size }: CanvasProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  const latest = useRef({ recipe, colours, finishColours, speed })
  latest.current = { recipe, colours, finishColours, speed }
  const dirty = useRef(true)
  dirty.current = true
  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    canvas.width = canvas.height = Math.round(size * Math.max(1, window.devicePixelRatio || 1))
    dirty.current = true
    let elapsed = 0
    let last = performance.now()
    let raf = 0
    const frame = (now: number) => {
      const { recipe: r, colours: c, finishColours: f, speed: v } = latest.current
      elapsed += (now - last) * v
      last = now
      if (v > 0 || dirty.current) {
        drawPattern(ctx, r, c, patternTime(r, elapsed, 1))
        applySoftFinish(ctx, r)
        applyPixelFinish(ctx, r, f)
      }
      dirty.current = false
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [size])
  return <canvas ref={ref} style={{ width: '100%', height: '100%', display: 'block' }} />
}

/** A Paper shader with the pixel finish, or the light form (no React component): the shader plays in a hidden mount and each
    frame is copied here and finished. The mount is rebuilt after edits settle, so a
    slider drag doesn't churn WebGL contexts; the old one shows until the new is ready. */
function FinishedShaderCanvas({ recipe, colours, finishColours, speed, size }: CanvasProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  const mountRef = useRef<HiddenMount | null>(null)
  const latest = useRef({ recipe, finishColours })
  latest.current = { recipe, finishColours }
  const key = JSON.stringify([recipe, colours, speed, size])
  useEffect(() => {
    let cancelled = false
    const timer = window.setTimeout(() => {
      hiddenMount(recipe, colours, size, speed)
        .then((m) => {
          if (cancelled) return m.dispose()
          mountRef.current?.dispose()
          mountRef.current = m
        })
        .catch(() => {})
    }, mountRef.current ? 150 : 0)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  useEffect(() => () => mountRef.current?.dispose(), [])
  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    canvas.width = canvas.height = Math.round(size * Math.max(1, window.devicePixelRatio || 1))
    let raf = 0
    const frame = () => {
      const m = mountRef.current
      if (m && m.canvas.width > 0) {
        if (m.dither) drawDither(ctx, m.canvas, m.dither, latest.current.recipe.blobs, canvas.width, canvas.height)
        else ctx.drawImage(m.canvas, 0, 0, canvas.width, canvas.height)
        applySoftFinish(ctx, latest.current.recipe)
        applyPixelFinish(ctx, latest.current.recipe, latest.current.finishColours)
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [size])
  return <canvas ref={ref} style={{ width: '100%', height: '100%', display: 'block' }} />
}

interface Props {
  recipe: GradientRecipe
  colours: string[]
  /** The three theme colours, for the pixel finish. */
  finishColours: string[]
  playing: boolean
  /** Drag on the preview, as a fraction of the frame size (right / down positive). */
  onPan?: (dx: number, dy: number) => void
  /** Wheel on the preview: above 1 zooms in, below 1 zooms out. */
  onZoom?: (factor: number) => void
}

function LabCanvas({ recipe, colours, finishColours, playing, onPan, onZoom }: Props) {
  const stageRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState(0)
  const reduced = usePrefersReducedMotion()
  const onPanRef = useRef(onPan)
  onPanRef.current = onPan
  const onZoomRef = useRef(onZoom)
  onZoomRef.current = onZoom

  // Contain a square in the stage: as large as fits, never past either edge.
  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const fit = () => setSize(Math.max(1, Math.floor(Math.min(stage.clientWidth, stage.clientHeight))))
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(stage)
    return () => observer.disconnect()
  }, [])

  // Wheel zoom. Native and non-passive so the page doesn't scroll under the preview.
  useEffect(() => {
    const frame = frameRef.current
    if (!frame) return
    const onWheel = (e: WheelEvent) => {
      if (!onZoomRef.current) return
      e.preventDefault()
      onZoomRef.current(Math.exp(-e.deltaY * 0.0015))
    }
    frame.addEventListener('wheel', onWheel, { passive: false })
    return () => frame.removeEventListener('wheel', onWheel)
  }, [])

  // Drag to pan.
  const dragRef = useRef<{ id: number; x: number; y: number } | null>(null)
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!onPanRef.current || e.button !== 0) return
    e.currentTarget.setPointerCapture(e.pointerId)
    e.currentTarget.dataset.dragging = ''
    dragRef.current = { id: e.pointerId, x: e.clientX, y: e.clientY }
  }
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag || drag.id !== e.pointerId || size === 0) return
    const dx = e.clientX - drag.x
    const dy = e.clientY - drag.y
    drag.x = e.clientX
    drag.y = e.clientY
    if (dx || dy) onPanRef.current?.(dx / size, dy / size)
  }
  const endDrag = (e: PointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.id !== e.pointerId) return
    dragRef.current = null
    delete e.currentTarget.dataset.dragging
  }

  const speed = playing && !reduced ? recipe.speed : 0
  const fill = { width: '100%', height: '100%' }
  return (
    <div ref={stageRef} className="gl-cv">
      <div
        ref={frameRef}
        className={`gl-cv__surface${onPan ? ' gl-cv__surface--pannable' : ''}`}
        style={{ width: size, height: size }}
        role="img"
        aria-label="Gradient preview"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {isCanvasPattern(recipe.shader) ? (
          <PatternCanvas recipe={recipe} colours={colours} finishColours={finishColours} speed={speed} size={size} />
        ) : recipe.finish !== 'off' || recipe.shader === 'glow' || recipe.shader === 'dither' || recipe.blur > 0 ? (
          <FinishedShaderCanvas recipe={recipe} colours={colours} finishColours={finishColours} speed={speed} size={size} />
        ) : recipe.shader === 'grain' ? (
          <GrainGradient {...grainProps(recipe, colours)} speed={speed} style={fill} />
        ) : (
          <MeshGradient {...meshProps(recipe, colours)} speed={speed} style={fill} />
        )}
      </div>
    </div>
  )
}

export default LabCanvas
