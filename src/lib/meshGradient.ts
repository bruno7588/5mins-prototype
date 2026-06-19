/**
 * Mesh-gradient renderer.
 *
 * Ported from the "Mesh Gradient Studio" tool (the same generator that produced
 * the onboarding gradient JSON files) so the output matches the design exactly.
 * Extended here with colour/shape interpolation helpers so a gradient can be
 * tweened ("morphed") from one screen's config to the next, and with a small
 * per-shape drift so the background gently breathes over time.
 */

export type ShapeType = 'circle' | 'square'

export interface Shape {
  id: string
  type: ShapeType
  /** centre x, normalized 0..1 of canvas width */
  x: number
  /** centre y, normalized 0..1 of canvas height */
  y: number
  /** size as a fraction of the canvas min dimension */
  size: number
  color: string
  /** rotation in degrees (visible on squares) */
  rotation: number
  /** corner roundness for squares, 0 (sharp) .. 1 (fully rounded) */
  radius: number
  /** 0..1 */
  opacity: number
  /** per-shape animation phase so they drift out of sync */
  phase: number
}

export interface Settings {
  aspect: 'wide' | 'portrait'
  background: string
  /** 0..100, mapped to a fraction of the min dimension */
  blur: number
  /** grain opacity, 0..1 */
  grain: number
  /** grain magnification, 1..6 */
  grainScale: number
  /** color tint laid over the shapes */
  overlayColor: string
  /** overlay opacity, 0..1 (0 = no overlay) */
  overlayOpacity: number
}

export interface MeshConfig {
  settings: Settings
  shapes: Shape[]
}

/* ------------------------------------------------------------------ colour */

interface Rgb {
  r: number
  g: number
  b: number
}

function hexToRgb(hex: string): Rgb {
  let h = hex.replace('#', '')
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  }
}

export function hexToRgba(hex: string, alpha = 1): string {
  const { r, g, b } = hexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/** Interpolate between two hex colours in RGB space, returning `rgba(...)`. */
function lerpColorRgba(from: string, to: string, t: number, alpha: number): string {
  const a = hexToRgb(from)
  const b = hexToRgb(to)
  const r = Math.round(lerp(a.r, b.r, t))
  const g = Math.round(lerp(a.g, b.g, t))
  const bl = Math.round(lerp(a.b, b.b, t))
  return `rgba(${r}, ${g}, ${bl}, ${alpha})`
}

/* ----------------------------------------------------------------- noise */

/** A small tile of per-pixel grayscale noise, tiled at render time. */
export function makeNoiseCanvas(size = 180): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')!
  const img = ctx.createImageData(size, size)
  for (let i = 0; i < img.data.length; i += 4) {
    const v = (Math.random() * 255) | 0
    img.data[i] = v
    img.data[i + 1] = v
    img.data[i + 2] = v
    img.data[i + 3] = 255
  }
  ctx.putImageData(img, 0, 0)
  return c
}

/* -------------------------------------------------------------- morphing */

/**
 * A single shape interpolated from `from` toward `to` at progress `t` (0..1).
 * All shape arrays in the onboarding set are the same length, so we morph
 * index-by-index. Type (circle/square) is snapped at the midpoint — under the
 * heavy blur the swap is invisible.
 */
function lerpShape(from: Shape, to: Shape, t: number): Shape {
  return {
    id: from.id,
    type: t < 0.5 ? from.type : to.type,
    x: lerp(from.x, to.x, t),
    y: lerp(from.y, to.y, t),
    size: lerp(from.size, to.size, t),
    rotation: lerp(from.rotation, to.rotation, t),
    radius: lerp(from.radius, to.radius, t),
    opacity: lerp(from.opacity, to.opacity, t),
    phase: lerp(from.phase, to.phase, t),
    // colour cross-fades during draw via lerpColorRgba (from -> to), so keep
    // the source colour here and let drawFrame supply the target.
    color: from.color,
  }
}

const lerpSettings = (from: Settings, to: Settings, t: number): Settings => ({
  aspect: to.aspect,
  background: t < 0.5 ? from.background : to.background,
  blur: lerp(from.blur, to.blur, t),
  grain: lerp(from.grain, to.grain, t),
  grainScale: lerp(from.grainScale, to.grainScale, t),
  overlayColor: t < 0.5 ? from.overlayColor : to.overlayColor,
  overlayOpacity: lerp(from.overlayOpacity, to.overlayOpacity, t),
})

/** Interpolate a whole config from `from` to `to`. Falls back to `to` if the
 *  shape counts ever differ (they don't in the onboarding set). */
export function lerpConfig(from: MeshConfig, to: MeshConfig, t: number): MeshConfig {
  if (t <= 0) return from
  if (t >= 1 || from.shapes.length !== to.shapes.length) return to
  return {
    settings: lerpSettings(from.settings, to.settings, t),
    shapes: from.shapes.map((s, i) => lerpShape(s, to.shapes[i], t)),
  }
}

/* ------------------------------------------------------------- breathing */

/**
 * Apply a gentle, looping drift to each shape based on elapsed `time` (seconds)
 * and its `phase` seed, so the gradient slowly breathes. Amplitudes are kept
 * small — the heavy blur turns this into softly flowing colour rather than
 * visibly moving blobs.
 */
function breathe(shapes: Shape[], time: number, amount = 1, speed = 1): Shape[] {
  const t = time * speed
  return shapes.map((s) => {
    const p = s.phase
    return {
      ...s,
      x: s.x + 0.035 * amount * Math.sin(t * 0.18 + p),
      y: s.y + 0.045 * amount * Math.cos(t * 0.15 + p * 1.3),
      size: s.size * (1 + 0.06 * amount * Math.sin(t * 0.12 + p * 0.7)),
      rotation: s.rotation + 8 * amount * Math.sin(t * 0.1 + p),
    }
  })
}

/* ------------------------------------------------------------- rendering */

/** Background + blurred shapes. `colorMix` optionally blends each shape's
 *  colour toward the corresponding shape in `colorTo` (used during a morph so
 *  colours cross-fade in RGB space rather than snapping). */
export function drawShapes(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  shapes: Shape[],
  settings: Settings,
  colorTo?: { shapes: Shape[]; t: number },
) {
  const minDim = Math.min(W, H)

  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = settings.background
  ctx.fillRect(0, 0, W, H)

  const blurPx = (settings.blur / 100) * 0.32 * minDim
  ctx.save()
  ctx.filter = blurPx > 0.2 ? `blur(${blurPx}px)` : 'none'
  shapes.forEach((s, i) => {
    const cx = s.x * W
    const cy = s.y * H
    const r = s.size * minDim * 0.6

    const solid =
      colorTo && colorTo.shapes[i]
        ? lerpColorRgba(s.color, colorTo.shapes[i].color, colorTo.t, s.opacity)
        : hexToRgba(s.color, s.opacity)

    if (s.type === 'circle') {
      const edge =
        colorTo && colorTo.shapes[i]
          ? lerpColorRgba(s.color, colorTo.shapes[i].color, colorTo.t, 0)
          : hexToRgba(s.color, 0)
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
      g.addColorStop(0, solid)
      g.addColorStop(1, edge)
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.fill()
    } else {
      const side = r * 1.6
      const corner = Math.min(s.radius ?? 0, 1) * (side / 2)
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate((s.rotation * Math.PI) / 180)
      ctx.fillStyle = solid
      ctx.beginPath()
      if (corner > 0.5 && typeof ctx.roundRect === 'function') {
        ctx.roundRect(-side / 2, -side / 2, side, side, corner)
      } else {
        ctx.rect(-side / 2, -side / 2, side, side)
      }
      ctx.fill()
      ctx.restore()
    }
  })
  ctx.restore()
}

/** Flat colour tint laid over the shapes (below the grain). */
export function drawOverlay(ctx: CanvasRenderingContext2D, W: number, H: number, settings: Settings) {
  if (settings.overlayOpacity <= 0) return
  ctx.save()
  ctx.globalAlpha = settings.overlayOpacity
  ctx.fillStyle = settings.overlayColor
  ctx.fillRect(0, 0, W, H)
  ctx.restore()
}

/** Grain overlay, drawn unblurred over the composited mesh. */
export function drawGrain(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  settings: Settings,
  noise: HTMLCanvasElement,
) {
  if (settings.grain <= 0) return
  ctx.save()
  ctx.globalAlpha = settings.grain
  ctx.globalCompositeOperation = 'overlay'
  const scale = settings.grainScale * (Math.max(W, H) / 1500)
  ctx.scale(scale, scale)
  const pattern = ctx.createPattern(noise, 'repeat')
  if (pattern) {
    ctx.fillStyle = pattern
    ctx.fillRect(0, 0, W / scale, H / scale)
  }
  ctx.restore()
}

/** Pointer-driven parallax. `pointer` is the eased cursor offset from centre,
 *  each axis roughly -1..1; `amount` is the max shift as a fraction of the
 *  canvas. Bigger shapes shift more, so the blobs separate with depth. */
function applyParallax(shapes: Shape[], pointer: { x: number; y: number }, amount: number): Shape[] {
  if (amount <= 0 || (pointer.x === 0 && pointer.y === 0)) return shapes
  return shapes.map((s) => {
    const depth = 0.6 + s.size // ~1.2..1.5 — larger blobs feel closer
    return {
      ...s,
      x: s.x + pointer.x * amount * depth,
      y: s.y + pointer.y * amount * depth,
    }
  })
}

/**
 * Draw one animated frame of a (possibly morphing) config into `ctx`.
 *
 * `from`/`to` + `morph` (0..1) define the geometry tween between two screens;
 * `time` drives the breathing drift; `pointer` + `parallax` add cursor-driven
 * parallax. Colours cross-fade in RGB during a morph.
 */
export function drawFrame(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  from: MeshConfig,
  to: MeshConfig,
  morph: number,
  time: number,
  noise: HTMLCanvasElement,
  pointer: { x: number; y: number } = { x: 0, y: 0 },
  parallax = 0,
  breatheAmount = 1,
  breatheSpeed = 1,
) {
  const geom = lerpConfig(from, to, morph)
  const animated = applyParallax(breathe(geom.shapes, time, breatheAmount, breatheSpeed), pointer, parallax)
  const colorTo =
    morph > 0 && morph < 1 && from.shapes.length === to.shapes.length
      ? { shapes: to.shapes, t: morph }
      : undefined

  drawShapes(ctx, W, H, animated, geom.settings, colorTo)
  drawOverlay(ctx, W, H, geom.settings)
  drawGrain(ctx, W, H, geom.settings, noise)
}
