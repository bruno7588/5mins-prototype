import { useEffect, useImperativeHandle, useRef, useState, type PointerEvent, type Ref } from 'react'
import Alert from '@/components/Alert/Alert'
import { createRenderer, type GradientRenderer } from './gl/renderer'
import { ASPECT_VALUES, outputSize, type Flower, type LabState, type RenderInput } from './types'
import './lab-canvas.css'

/* Live preview of the lab. Fills its parent (which must have a definite size)
   and fits the output frame inside it, centred. Owns the WebGL renderer:
   creates it on mount, keeps the drawing buffer at css size x devicePixelRatio,
   destroys it on unmount. Renders on every input change; while motion.playing
   it runs a requestAnimationFrame loop (a still frame under reduced motion).
   Drag pans and the wheel zooms through onPan / onZoom. The ref handle exports
   the current frame at the framing's render size. */

const imageCache = new Map<string, Promise<HTMLImageElement>>()

/** Loads (once) and decodes a flower photo. */
export function loadImage(src: string): Promise<HTMLImageElement> {
  let pending = imageCache.get(src)
  if (!pending) {
    pending = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      // Shared photos are cross-origin on localhost; WebGL and pixel reads need a CORS-clean image.
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error(`Couldn't load ${src}`))
      img.src = src
    })
    pending.catch(() => imageCache.delete(src))
    imageCache.set(src, pending)
  }
  return pending
}

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

export interface LabCanvasHandle {
  /** Renders the current frame at outputSize(lab.framing) and encodes it. */
  /** Renders the current frame. `size` overrides the framing's output size (e.g. a 512 x 512 app image). */
  exportImage(type: 'image/png' | 'image/jpeg', quality?: number, size?: { width: number; height: number }): Promise<Blob>
}

interface Props {
  lab: LabState
  /** Seconds; overrides the clock while motion is paused (timeline scrub). */
  time?: number
  /** Drag on the preview, as a fraction of the frame size (right / down positive). */
  onPan?: (dx: number, dy: number) => void
  /** Wheel on the preview: above 1 zooms in, below 1 zooms out. */
  onZoom?: (factor: number) => void
  ref?: Ref<LabCanvasHandle>
  /** The page's flower list, so a fresh upload reaches the Photo and Mix modes straight away. */
  flowers: Flower[]
}

function LabCanvas({ lab, time, onPan, onZoom, ref, flowers }: Props) {
  const stageRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rendererRef = useRef<GradientRenderer | null>(null)
  /** The frame's css size, kept for export (grain scale) and pan fractions. */
  const frameRef = useRef({ width: 0, height: 0 })
  /** Why the preview can't render, or null while it can. */
  const [failure, setFailure] = useState<string | null>(null)
  const reduced = usePrefersReducedMotion()

  // Abstraction below 1 shows the photo itself, whatever the source mode.
  const needsPhoto = lab.gradient.sourceMode !== 'palette' || lab.gradient.abstraction < 1
  const photoSrc = needsPhoto ? flowers.find((f) => f.id === lab.flowerId)?.src : undefined
  const [photo, setPhoto] = useState<HTMLImageElement | null>(null)

  useEffect(() => {
    if (!photoSrc) {
      setPhoto(null)
      return
    }
    let live = true
    loadImage(photoSrc)
      .then((img) => live && setPhoto(img))
      .catch(() => live && setPhoto(null))
    return () => {
      live = false
    }
  }, [photoSrc])

  // Clock: seconds of animation played so far (pausing keeps the position).
  const clockRef = useRef(0)
  const input: Omit<RenderInput, 'time'> = {
    palette: lab.palette,
    photo,
    gradient: lab.gradient,
    noise: lab.noise,
    motion: lab.motion,
    rotate: lab.framing.rotate,
  }
  const inputRef = useRef(input)
  inputRef.current = input
  const timeRef = useRef(time)
  timeRef.current = time
  const framingRef = useRef(lab.framing)
  framingRef.current = lab.framing
  const onPanRef = useRef(onPan)
  onPanRef.current = onPan
  const onZoomRef = useRef(onZoom)
  onZoomRef.current = onZoom

  const draw = () => {
    // A scrubbed time also moves the clock, so play resumes from there.
    if (!inputRef.current.motion.playing && timeRef.current !== undefined) clockRef.current = timeRef.current
    rendererRef.current?.render({ ...inputRef.current, time: clockRef.current })
  }
  const drawRef = useRef(draw)
  drawRef.current = draw

  /* Contain the frame in the stage: as large as fits, never past either edge. */
  const fit = () => {
    const stage = stageRef.current
    const canvas = canvasRef.current
    const renderer = rendererRef.current
    if (!stage || !canvas || !renderer) return
    const ratio = ASPECT_VALUES[framingRef.current.aspect]
    const boxW = stage.clientWidth
    const boxH = stage.clientHeight
    const width = Math.max(1, Math.floor(Math.min(boxW, boxH * ratio)))
    const height = Math.max(1, Math.floor(width / ratio))
    frameRef.current = { width, height }
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    renderer.resize(width, height, window.devicePixelRatio || 1)
    drawRef.current()
  }
  const fitRef = useRef(fit)
  fitRef.current = fit

  // Renderer lifecycle + drawing-buffer size.
  useEffect(() => {
    const canvas = canvasRef.current
    const stage = stageRef.current
    if (!canvas || !stage) return
    let renderer: GradientRenderer | null
    try {
      renderer = createRenderer(canvas)
    } catch (e) {
      console.error(e)
      setFailure(`The preview couldn't start: ${(e as Error).message}`)
      return
    }
    if (!renderer) {
      setFailure("WebGL2 isn't available in this browser.")
      return
    }
    rendererRef.current = renderer
    try {
      fitRef.current()
    } catch (e) {
      console.error(e)
    }
    const observer = new ResizeObserver(() => fitRef.current())
    observer.observe(stage)
    return () => {
      observer.disconnect()
      renderer.destroy()
      rendererRef.current = null
    }
  }, [])

  // A new aspect ratio re-fits the frame.
  useEffect(() => {
    fitRef.current()
  }, [lab.framing.aspect])

  const looping = lab.motion.playing && !reduced

  // Still frame on every input change while not looping.
  useEffect(() => {
    if (!looping) drawRef.current()
  })

  // Animation loop.
  useEffect(() => {
    if (!looping) return
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      clockRef.current += (now - last) / 1000
      last = now
      drawRef.current()
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [looping])

  // Wheel zoom. Native and non-passive so the page doesn't scroll under the canvas.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const onWheel = (e: WheelEvent) => {
      if (!onZoomRef.current) return
      e.preventDefault()
      onZoomRef.current(Math.exp(-e.deltaY * 0.0015))
    }
    canvas.addEventListener('wheel', onWheel, { passive: false })
    return () => canvas.removeEventListener('wheel', onWheel)
  }, [])

  // Drag to pan.
  const dragRef = useRef<{ id: number; x: number; y: number } | null>(null)
  const onPointerDown = (e: PointerEvent<HTMLCanvasElement>) => {
    if (!onPanRef.current || e.button !== 0) return
    e.currentTarget.setPointerCapture(e.pointerId)
    e.currentTarget.dataset.dragging = ''
    dragRef.current = { id: e.pointerId, x: e.clientX, y: e.clientY }
  }
  const onPointerMove = (e: PointerEvent<HTMLCanvasElement>) => {
    const drag = dragRef.current
    if (!drag || drag.id !== e.pointerId) return
    const { width, height } = frameRef.current
    const dx = e.clientX - drag.x
    const dy = e.clientY - drag.y
    drag.x = e.clientX
    drag.y = e.clientY
    if ((dx || dy) && width > 0 && height > 0) onPanRef.current?.(dx / width, dy / height)
  }
  const endDrag = (e: PointerEvent<HTMLCanvasElement>) => {
    if (dragRef.current?.id !== e.pointerId) return
    dragRef.current = null
    delete e.currentTarget.dataset.dragging
  }

  useImperativeHandle(ref, () => ({
    async exportImage(type, quality, size) {
      const { width, height } = size ?? outputSize(framingRef.current)
      const offscreen = document.createElement('canvas')
      const renderer = createRenderer(offscreen)
      if (!renderer) throw new Error("WebGL2 isn't available in this browser, so the image can't be exported.")
      try {
        /* Same frame, more pixels: dpr is output px per preview css px, so the
           grain (sized in css px) looks the same as in the preview. */
        const preview = frameRef.current
        const previewLong = Math.max(preview.width, preview.height)
        const outLong = Math.max(width, height)
        const dpr = previewLong > 0 ? outLong / previewLong : 1
        renderer.resize(width / dpr, height / dpr, dpr)
        renderer.render({ ...inputRef.current, time: clockRef.current })
        return await new Promise<Blob>((resolve, reject) => {
          offscreen.toBlob(
            (blob) => (blob ? resolve(blob) : reject(new Error("The image couldn't be encoded."))),
            type,
            quality,
          )
        })
      } finally {
        // The offscreen canvas never joins the page, so destroy also loses its context.
        renderer.destroy()
      }
    },
  }), [])

  return (
    <div ref={stageRef} className="gl-cv">
      <canvas
        ref={canvasRef}
        className={`gl-cv__surface${onPan ? ' gl-cv__surface--pannable' : ''}`}
        hidden={failure !== null}
        role="img"
        aria-label="Gradient preview"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      />
      {failure && <Alert type="Alert" icon message={failure} />}
    </div>
  )
}

export default LabCanvas
