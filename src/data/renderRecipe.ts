import {
  defaultObjectSizing,
  ditheringFragmentShader,
  DitheringShapes,
  DitheringTypes,
  getShaderColorFromString,
  getShaderNoiseTexture,
  grainGradientFragmentShader,
  GrainGradientShapes,
  meshGradientFragmentShader,
  ShaderFitOptions,
  ShaderMount,
} from '@paper-design/shaders'
import { DITHER_BACK, DITHER_DOTS, grainColours, isCanvasPattern, type GradientRecipe } from '@/pages/gradient-lab/recipe'
import { fromLch, toLch } from './brandPalette'
import { drawPattern, playPattern } from './canvasPatterns'
import { glowFragmentShader, glowUniforms } from './glowShader'
import { applyPixelFinish } from './pixelFinish'
import { applySoftFinish, paintNoise } from './softFinish'

/* Renders a gradient recipe in a tenant's colours with Paper Shaders (mesh
   or grain gradient, or dithering), the light form (glowShader.ts, on Paper's mount) or a canvas pattern (canvasPatterns.ts), in the admin's browser: a 512 x 512 JPEG still for the company
   image, or a live hidden mount that companyShader.ts copies into cards. Each
   mount is one WebGL context, so stills render one at a time. */

export const STILL_PX = 512

/** The grain gradient samples a noise image; it must be loaded before a mount uses it. */
let noiseImage: Promise<HTMLImageElement> | null = null
function loadNoise(): Promise<HTMLImageElement> {
  noiseImage ??= new Promise((resolve, reject) => {
    const img = getShaderNoiseTexture()!
    if (img.complete && img.naturalWidth) resolve(img)
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error("The grain texture couldn't load."))
  })
  return noiseImage
}

/** The fragment shader and uniforms Paper's React MeshGradient or GrainGradient would pass. */
async function shaderFor(recipe: GradientRecipe, colours: string[]) {
  const sizing = {
    u_fit: ShaderFitOptions[defaultObjectSizing.fit],
    u_rotation: recipe.rotation,
    u_scale: recipe.scale,
    u_offsetX: recipe.offsetX,
    u_offsetY: recipe.offsetY,
    u_originX: defaultObjectSizing.originX,
    u_originY: defaultObjectSizing.originY,
    u_worldWidth: defaultObjectSizing.worldWidth,
    u_worldHeight: defaultObjectSizing.worldHeight,
  }
  if (recipe.shader === 'dither') {
    return {
      fragment: ditheringFragmentShader,
      uniforms: {
        ...sizing,
        u_colorBack: getShaderColorFromString(DITHER_BACK),
        u_colorFront: getShaderColorFromString(DITHER_DOTS),
        u_shape: DitheringShapes[recipe.ditherShape],
        u_type: DitheringTypes[recipe.ditherType],
        u_pxSize: recipe.pxSize,
      },
    }
  }
  if (recipe.shader === 'glow') {
    return { fragment: glowFragmentShader, uniforms: { ...sizing, ...glowUniforms(recipe, colours) } }
  }
  if (recipe.shader === 'grain') {
    const [back, colors] = grainColours(colours)
    return {
      fragment: grainGradientFragmentShader,
      uniforms: {
        ...sizing,
        u_colorBack: getShaderColorFromString(back),
        u_colors: colors.map(getShaderColorFromString),
        u_colorsCount: colors.length,
        u_softness: recipe.softness,
        u_intensity: recipe.intensity,
        u_noise: recipe.noise,
        u_shape: GrainGradientShapes[recipe.shape],
        u_noiseTexture: await loadNoise(),
      },
    }
  }
  return {
    fragment: meshGradientFragmentShader,
    uniforms: {
      ...sizing,
      u_colors: colours.map(getShaderColorFromString),
      u_colorsCount: colours.length,
      u_distortion: recipe.distortion,
      u_swirl: recipe.swirl,
      u_grainMixer: recipe.grainMixer,
      u_grainOverlay: recipe.grainOverlay,
    },
  }
}

export interface HiddenMount {
  /** Shows the frame at this many ms of animation time. */
  setFrame: (ms: number) => void
  canvas: HTMLCanvasElement
  /** Dithering only: the three theme colours drawDither paints the backdrop and dots in, on every copy. */
  dither: string[] | null
  dispose: () => void
}

/** How far the backdrop's noise moves each pixel either side of mid grey (soft-light). */
const BACKDROP_NOISE = 18
/** How far (OKLCH lightness) the dots move away from the backdrop: darker on a light one, lighter on a dark one. */
const DOT_CONTRAST = 0.25

/** The colour pushed away from the backdrop's lightness, for the dots to stand out. */
function contrastDot(colour: string, lightBackdrop: boolean) {
  const c = toLch(colour)
  return fromLch({ ...c, l: Math.min(0.98, Math.max(0.05, c.l + (lightBackdrop ? -DOT_CONTRAST : DOT_CONTRAST))) })
}

let dotLayer: HTMLCanvasElement | null = null

/**
 * Draws a dithering frame: a backdrop of one soft blob per theme colour, centred where the
 * recipe puts them (`blobs`, 0-1 of the frame), with a little noise, then
 * the shader's white dots coloured by the three colours the other way round (selected item
 * top left through navigation to header bar bottom right). `crop` is the part of the
 * square shader frame to use, for surfaces that cover a different shape.
 */
export function drawDither(
  ctx: CanvasRenderingContext2D,
  source: HTMLCanvasElement,
  [header, nav, selected]: string[],
  blobs: [number, number][],
  w: number,
  h: number,
  crop: [number, number, number, number] = [0, 0, source.width, source.height],
) {
  const s = Math.max(w, h)
  ctx.save()
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.fillStyle = header
  ctx.fillRect(0, 0, w, h)
  // Header bar last and smaller, so its corner stays clear of the other two.
  const layers: [string, [number, number], number][] = [
    [nav, blobs[1], 0.8],
    [selected, blobs[2], 0.8],
    [header, blobs[0], 0.5],
  ]
  for (const [c, [x, y], r] of layers) {
    const g = ctx.createRadialGradient(x * w, y * h, 0, x * w, y * h, r * s)
    g.addColorStop(0, c)
    g.addColorStop(1, `${c}00`)
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
  }
  ctx.restore()
  paintNoise(ctx, BACKDROP_NOISE)

  dotLayer ??= document.createElement('canvas')
  if (dotLayer.width !== w || dotLayer.height !== h) {
    dotLayer.width = w
    dotLayer.height = h
  }
  const d = dotLayer.getContext('2d')
  if (!d) return
  d.globalCompositeOperation = 'source-over'
  d.clearRect(0, 0, w, h)
  d.drawImage(source, ...crop, 0, 0, w, h)
  d.globalCompositeOperation = 'source-in'
  // The header bar fills the backdrop: on a light one (light mode) the dots go darker, on a dark one lighter.
  const lightBackdrop = toLch(header).l > 0.5
  const g = d.createLinearGradient(0, 0, w, h)
  g.addColorStop(0, contrastDot(selected, lightBackdrop))
  g.addColorStop(0.5, contrastDot(nav, lightBackdrop))
  g.addColorStop(1, contrastDot(header, lightBackdrop))
  d.fillStyle = g
  d.fillRect(0, 0, w, h)
  ctx.drawImage(dotLayer, 0, 0)
}

/**
 * A mount in an invisible fixed box inside the viewport (Paper pauses mounts it
 * thinks are off-screen). The drawing buffer is kept so it can be copied or encoded.
 */
export async function hiddenMount(recipe: GradientRecipe, colours: string[], cssPx: number, speed: number): Promise<HiddenMount> {
  // A canvas pattern needs no GPU context: a detached 2D canvas, played or held still.
  if (isCanvasPattern(recipe.shader)) {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = Math.round(cssPx * Math.max(1, window.devicePixelRatio || 1))
    const stop = playPattern(canvas, recipe, colours, speed)
    return {
      canvas,
      dither: null,
      setFrame: (ms) => {
        stop()
        drawPattern(canvas.getContext('2d')!, recipe, colours, ms / 1000)
      },
      dispose: stop,
    }
  }
  const { fragment, uniforms } = await shaderFor(recipe, colours)
  const box = document.createElement('div')
  box.setAttribute('aria-hidden', 'true')
  box.style.cssText = `position:fixed;left:0;top:0;width:${cssPx}px;height:${cssPx}px;opacity:0;pointer-events:none;z-index:-1;`
  document.body.appendChild(box)
  // minPixelRatio 1: the box is sized in device pixels' worth already for stills.
  const mount = new ShaderMount(box, fragment, uniforms, { preserveDrawingBuffer: true }, speed, recipe.frame, 1)
  return {
    setFrame: (ms) => mount.setFrame(ms),
    canvas: mount.canvasElement,
    dither: recipe.shader === 'dither' ? colours : null,
    dispose: () => {
      mount.dispose()
      box.remove()
    },
  }
}

const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => r()))

let queue: Promise<unknown> = Promise.resolve()

/** The recipe in these colours as a 512 x 512 data URL (JPEG unless asked), with its pixel finish
    in the three theme colours (`finishColours`). Calls run one after another. */
export function renderStill(
  recipe: GradientRecipe,
  colours: string[],
  type: 'image/jpeg' | 'image/png' = 'image/jpeg',
  finishColours?: string[],
): Promise<string> {
  const run = async () => {
    const dpr = Math.max(1, window.devicePixelRatio || 1)
    const { canvas, setFrame, dither, dispose } = await hiddenMount(recipe, colours, STILL_PX / dpr, 0)
    try {
      // Paper sizes the canvas on its first resize callback, then draws. A new
      // canvas is 300 x 150, so wait until it matches the square box.
      for (let i = 0; i < 10 && canvas.width !== canvas.height; i++) await nextFrame()
      setFrame(recipe.frame)
      await nextFrame()
      const out = document.createElement('canvas')
      out.width = STILL_PX
      out.height = STILL_PX
      const ctx = out.getContext('2d')!
      if (dither) drawDither(ctx, canvas, dither, recipe.blobs, STILL_PX, STILL_PX)
      else ctx.drawImage(canvas, 0, 0, STILL_PX, STILL_PX)
      applySoftFinish(ctx, recipe)
      applyPixelFinish(ctx, recipe, finishColours)
      return out.toDataURL(type, 0.92)
    } finally {
      dispose()
    }
  }
  const result = queue.then(run, run)
  queue = result.catch(() => {})
  return result
}
