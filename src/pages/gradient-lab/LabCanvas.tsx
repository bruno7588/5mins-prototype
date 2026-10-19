import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { MeshGradient } from '@paper-design/shaders-react'
import { meshProps, type GradientRecipe } from './recipe'
import './lab-canvas.css'

/* Live preview of a recipe in a set of colours (Paper Shaders' MeshGradient):
   the largest square that fits its parent (which must have a definite size),
   centred. Plays while `playing` (a still frame under reduced motion). Drag
   pans and the wheel zooms through onPan / onZoom. */

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

interface Props {
  recipe: GradientRecipe
  colours: string[]
  playing: boolean
  /** Drag on the preview, as a fraction of the frame size (right / down positive). */
  onPan?: (dx: number, dy: number) => void
  /** Wheel on the preview: above 1 zooms in, below 1 zooms out. */
  onZoom?: (factor: number) => void
}

function LabCanvas({ recipe, colours, playing, onPan, onZoom }: Props) {
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

  const props = meshProps(recipe, colours)
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
        <MeshGradient {...props} speed={playing && !reduced ? recipe.speed : 0} style={{ width: '100%', height: '100%' }} />
      </div>
    </div>
  )
}

export default LabCanvas
