import {
  defaultObjectSizing,
  getShaderColorFromString,
  meshGradientFragmentShader,
  ShaderFitOptions,
  ShaderMount,
} from '@paper-design/shaders'
import type { GradientRecipe } from '@/pages/gradient-lab/recipe'

/* Renders a gradient recipe in a tenant's colours with Paper Shaders' mesh
   gradient, in the admin's browser: a 512 x 512 JPEG still for the company
   image, or a live hidden mount that companyShader.ts copies into cards. Each
   mount is one WebGL context, so stills render one at a time. */

export const STILL_PX = 512

/** The uniforms Paper's React MeshGradient would pass for these props. */
export function meshUniforms(recipe: GradientRecipe, colours: string[]) {
  return {
    u_colors: colours.map(getShaderColorFromString),
    u_colorsCount: colours.length,
    u_distortion: recipe.distortion,
    u_swirl: recipe.swirl,
    u_grainMixer: recipe.grainMixer,
    u_grainOverlay: recipe.grainOverlay,
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
}

export interface HiddenMount {
  mount: ShaderMount
  canvas: HTMLCanvasElement
  dispose: () => void
}

/**
 * A mount in an invisible fixed box inside the viewport (Paper pauses mounts it
 * thinks are off-screen). The drawing buffer is kept so it can be copied or encoded.
 */
export function hiddenMount(recipe: GradientRecipe, colours: string[], cssPx: number, speed: number): HiddenMount {
  const box = document.createElement('div')
  box.setAttribute('aria-hidden', 'true')
  box.style.cssText = `position:fixed;left:0;top:0;width:${cssPx}px;height:${cssPx}px;opacity:0;pointer-events:none;z-index:-1;`
  document.body.appendChild(box)
  // minPixelRatio 1: the box is sized in device pixels' worth already for stills.
  const mount = new ShaderMount(box, meshGradientFragmentShader, meshUniforms(recipe, colours), { preserveDrawingBuffer: true }, speed, recipe.frame, 1)
  return {
    mount,
    canvas: mount.canvasElement,
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
    const { canvas, mount, dispose } = hiddenMount(recipe, colours, STILL_PX / dpr, 0)
    try {
      // Paper sizes the canvas on its first resize callback, then draws.
      for (let i = 0; i < 3 && canvas.width === 0; i++) await nextFrame()
      mount.setFrame(recipe.frame)
      await nextFrame()
      const out = document.createElement('canvas')
      out.width = STILL_PX
      out.height = STILL_PX
      out.getContext('2d')!.drawImage(canvas, 0, 0, STILL_PX, STILL_PX)
      return out.toDataURL(type, 0.92)
    } finally {
      dispose()
    }
  }
  const result = queue.then(run, run)
  queue = result.catch(() => {})
  return result
}
