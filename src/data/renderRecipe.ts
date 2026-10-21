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
import { DITHER_BACK, ditherBackdrop, ditherFront, grainColours, isCanvasPattern, type GradientRecipe } from '@/pages/gradient-lab/recipe'
import { drawPattern, playPattern } from './canvasPatterns'

/* Renders a gradient recipe in a tenant's colours with Paper Shaders (mesh
   or grain gradient, or dithering) or a canvas pattern (canvasPatterns.ts), in the admin's browser: a 512 x 512 JPEG still for the company
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
        u_colorFront: getShaderColorFromString(ditherFront(colours)),
        u_shape: DitheringShapes[recipe.ditherShape],
        u_type: DitheringTypes[recipe.ditherType],
        u_pxSize: recipe.pxSize,
      },
    }
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
  /** Dithering's see-through dots need this gradient painted behind them on every copy. */
  backdrop: [string, string] | null
  dispose: () => void
}

/** Paints a dithering backdrop: the same soft diagonal as ditherBackdropCss. */
export function paintBackdrop(ctx: CanvasRenderingContext2D, [from, to]: [string, string], w: number, h: number) {
  const g = ctx.createLinearGradient(0, 0, w, h)
  g.addColorStop(0, from)
  g.addColorStop(1, to)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
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
      backdrop: null,
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
    backdrop: recipe.shader === 'dither' ? ditherBackdrop(colours) : null,
    dispose: () => {
      mount.dispose()
      box.remove()
    },
  }
}

const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => r()))

let queue: Promise<unknown> = Promise.resolve()

/** The recipe in these colours as a 512 x 512 data URL (JPEG unless asked). Calls run one after another. */
export function renderStill(recipe: GradientRecipe, colours: string[], type: 'image/jpeg' | 'image/png' = 'image/jpeg'): Promise<string> {
  const run = async () => {
    const dpr = Math.max(1, window.devicePixelRatio || 1)
    const { canvas, setFrame, backdrop, dispose } = await hiddenMount(recipe, colours, STILL_PX / dpr, 0)
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
      if (backdrop) paintBackdrop(ctx, backdrop, STILL_PX, STILL_PX)
      ctx.drawImage(canvas, 0, 0, STILL_PX, STILL_PX)
      return out.toDataURL(type, 0.92)
    } finally {
      dispose()
    }
  }
  const result = queue.then(run, run)
  queue = result.catch(() => {})
  return result
}
