import type { BlendMode, NoiseType, PalettePoint, RenderInput, SourceMode } from '../types'
import { mulberry32 } from '../palette'
import fragSource from './gradient.frag.glsl?raw'
import vertSource from './fullscreen.vert.glsl?raw'

/* WebGL2 gradient renderer: one full-screen triangle, one fragment shader
   (gradient.frag.glsl). Anything that depends on time is worked out here on the
   CPU and sent as uniforms, so the shader stays stateless and a seamless loop
   only needs the phase to wrap. See README.md for the uniform list. */

export interface GradientRenderer {
  /** Draws one frame. Cheap enough to call every animation frame. */
  render(input: RenderInput): void
  /** Sets the drawing-buffer size: round(css x devicePixelRatio) on each axis. */
  resize(cssWidth: number, cssHeight: number, dpr: number): void
  /** A short hash of the current pixels (tests: loop seams, noise types). */
  hashPixels(): string
  destroy(): void
}

const MAX_POINTS = 8
const TAU = Math.PI * 2
/* Radius of the circle the warp noise walks in its time dimensions. */
const NOISE_RADIUS = 0.8

const SOURCE_MODES: Record<SourceMode, number> = { palette: 0, photo: 1, mix: 2 }
const NOISE_TYPES: Record<NoiseType, number> = { white: 0, blue: 1, value: 2, simplex: 3, fbm: 4, worley: 5 }
const BLEND_MODES: Record<BlendMode, number> = { 'soft-light': 0, overlay: 1, add: 2, multiply: 3 }

const UNIFORMS = [
  'u_resolution', 'u_dpr', 'u_aspectScale', 'u_baseTurns', 'u_count', 'u_oklab', 'u_points', 'u_weights', 'u_softness',
  'u_mode', 'u_mix', 'u_photo', 'u_lod', 'u_texel',
  'u_scale', 'u_rotation', 'u_offset', 'u_swirl', 'u_distortion', 'u_phase',
  'u_warp', 'u_warpOctaves', 'u_warpCoord', 'u_flow',
  'u_noiseType', 'u_noiseSize', 'u_noiseIntensity', 'u_blend', 'u_noiseColour', 'u_noiseLuma', 'u_grainSeed',
] as const
type UniformName = (typeof UNIFORMS)[number]

function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

/* #rrggbb to OKLab. The blend happens in OKLab so two complementary colours
   meet through a clean midtone instead of a muddy grey. */
function hexToOklab(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', '').slice(0, 6), 16) || 0
  const r = srgbToLinear(((n >> 16) & 255) / 255)
  const g = srgbToLinear(((n >> 8) & 255) / 255)
  const b = srgbToLinear((n & 255) / 255)
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ]
}

function compile(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type)!
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader)
    gl.deleteShader(shader)
    throw new Error(`Gradient Lab shader failed to compile: ${log}`)
  }
  return shader
}

/** Returns null when WebGL2 is unavailable. */
export function createRenderer(canvas: HTMLCanvasElement): GradientRenderer | null {
  const context = canvas.getContext('webgl2', {
    preserveDrawingBuffer: true,
    premultipliedAlpha: false,
    antialias: false,
  })
  if (!context || context.isContextLost()) return null
  const gl: WebGL2RenderingContext = context

  const vert = compile(gl, gl.VERTEX_SHADER, vertSource)
  const frag = compile(gl, gl.FRAGMENT_SHADER, fragSource)
  const program = gl.createProgram()!
  gl.attachShader(program, vert)
  gl.attachShader(program, frag)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(`Gradient Lab shader failed to link: ${gl.getProgramInfoLog(program)}`)
  }
  const loc = {} as Record<UniformName, WebGLUniformLocation | null>
  for (const name of UNIFORMS) loc[name] = gl.getUniformLocation(program, name)

  /* WebGL2 can draw with no attributes, but some drivers want a VAO bound. */
  const vao = gl.createVertexArray()

  /* Photo texture: sRGB internal format so filtering and mips happen in linear light. */
  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.SRGB8_ALPHA8, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([128, 128, 128, 255]))
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.generateMipmap(gl.TEXTURE_2D)
  let uploaded: { image: HTMLImageElement; src: string } | null = null
  let maxLod = 0
  let photoSize = 1

  let dpr = 1
  const oklab = new Float32Array(MAX_POINTS * 3)
  const points = new Float32Array(MAX_POINTS * 2)
  const weights = new Float32Array(MAX_POINTS)

  /* Upload once per image; re-upload only when the element or its src changes. */
  function syncPhoto(image: HTMLImageElement | null): boolean {
    if (!image || !image.complete || image.naturalWidth === 0) return false
    if (uploaded && uploaded.image === image && uploaded.src === image.currentSrc) return true
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.SRGB8_ALPHA8, gl.RGBA, gl.UNSIGNED_BYTE, image)
    gl.generateMipmap(gl.TEXTURE_2D)
    photoSize = Math.max(image.naturalWidth, image.naturalHeight)
    maxLod = Math.floor(Math.log2(photoSize))
    uploaded = { image, src: image.currentSrc }
    return true
  }

  /* Each point wanders on its own closed sin/cos path. Integer frequencies keep
     every path periodic in the loop phase; phases come from gradient.seed. */
  function wanderedPoints(palette: PalettePoint[], seed: number, phase: number, randomness: number) {
    const count = Math.min(MAX_POINTS, palette.length)
    const rand = mulberry32(Math.floor(seed) * 7919 + 13)
    for (let i = 0; i < MAX_POINTS; i++) {
      const fx = 1 + Math.floor(rand() * 2)
      const fy = 1 + Math.floor(rand() * 2)
      const px = rand() * TAU
      const py = rand() * TAU
      if (i >= count) continue
      const p = palette[i]
      const amp = randomness * 0.22
      points[i * 2] = p.x + amp * Math.sin(fx * phase + px)
      points[i * 2 + 1] = p.y + amp * Math.cos(fy * phase + py)
      const [l, a, b] = hexToOklab(p.color)
      oklab.set([l, a, b], i * 3)
      /* Square root so a 5% accent still shows as a blob next to a 50% colour. */
      weights[i] = Math.sqrt(Math.max(p.weight, 0.001) * count)
    }
    return count
  }

  return {
    resize(cssWidth, cssHeight, nextDpr) {
      dpr = nextDpr > 0 ? nextDpr : 1
      const width = Math.max(1, Math.round(cssWidth * dpr))
      const height = Math.max(1, Math.round(cssHeight * dpr))
      canvas.width = width
      canvas.height = height
      gl.viewport(0, 0, width, height)
    },

    render(input) {
      const { gradient: g, noise: n, motion: m } = input
      const w = canvas.width
      const h = canvas.height

      /* Phase. Looping: wrap time to loopSeconds and run a whole number of cycles
         per loop (speed rounded), so t = 0 and t = loopSeconds give identical
         uniforms. Free-running: the phase just grows with speed. */
      const period = Math.max(0.001, m.loopSeconds)
      let phase: number
      let noiseTime: [number, number]
      if (m.loop) {
        const cycles = m.speed <= 0 ? 0 : Math.max(1, Math.round(m.speed))
        const local = ((input.time % period) + period) % period
        phase = (TAU * cycles * local) / period
        noiseTime = [NOISE_RADIUS * Math.cos(phase), NOISE_RADIUS * Math.sin(phase)]
      } else {
        phase = (TAU * input.time * m.speed) / period
        noiseTime = [NOISE_RADIUS * phase, 0]
      }

      const seedRand = mulberry32(Math.floor(g.seed) * 104729 + 1)
      const warpSeed: [number, number] = [seedRand() * 100, seedRand() * 100]
      const swirlPhase = seedRand() * TAU

      const count = wanderedPoints(input.palette, g.seed, phase, m.randomness)

      /* Flow drift travels a closed ellipse along flowAngle, so it wraps with the loop. */
      const angle = (m.flowAngle * Math.PI) / 180
      const dir = [Math.cos(angle), Math.sin(angle)]
      const amp = m.flowStrength * 0.25
      const flow: [number, number] = [
        amp * (dir[0] * Math.sin(phase) - dir[1] * 0.35 * (1 - Math.cos(phase))),
        amp * (dir[1] * Math.sin(phase) + dir[0] * 0.35 * (1 - Math.cos(phase))),
      ]

      /* Grain seed: fixed unless animated; animated grain steps at grainFps and,
         when looping, repeats on a whole number of frames per loop. */
      let grainSeed = g.seed
      if (m.grainAnimated) {
        let frame = Math.floor(input.time * m.grainFps + 1e-6)
        if (m.loop) {
          const frames = Math.max(1, Math.round(period * m.grainFps))
          frame = ((frame % frames) + frames) % frames
        }
        grainSeed = g.seed + (frame % 4096) + 1
      }

      const hasPhoto = syncPhoto(input.photo)
      const mode = count === 0 && hasPhoto ? 1 : hasPhoto ? SOURCE_MODES[g.sourceMode] : 0

      gl.useProgram(program)
      gl.bindVertexArray(vao)
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, texture)

      gl.uniform2f(loc.u_resolution, w, h)
      gl.uniform1f(loc.u_dpr, dpr)
      /* Cover: the square base texture fills the frame and the long axis sees
         all of it, so 1:1 is (1, 1) and matches the square preview exactly. */
      const ratio = w / h
      gl.uniform2f(loc.u_aspectScale, Math.min(1, ratio), Math.min(1, 1 / ratio))
      gl.uniform1i(loc.u_baseTurns, ((Math.round((input.rotate ?? 0) / 90) % 4) + 4) % 4)
      gl.uniform1i(loc.u_count, count)
      gl.uniform3fv(loc.u_oklab, oklab)
      gl.uniform2fv(loc.u_points, points)
      gl.uniform1fv(loc.u_weights, weights)
      gl.uniform1f(loc.u_softness, g.softness)

      gl.uniform1i(loc.u_mode, mode)
      gl.uniform1f(loc.u_mix, g.mix)
      gl.uniform1i(loc.u_photo, 0)
      gl.uniform1f(loc.u_lod, g.blur * maxLod)
      gl.uniform1f(loc.u_texel, 1 / photoSize)

      gl.uniform1f(loc.u_scale, Math.max(0.01, g.scale))
      gl.uniform1f(loc.u_rotation, (g.rotation * Math.PI) / 180)
      gl.uniform2f(loc.u_offset, g.offsetX, g.offsetY)
      gl.uniform1f(loc.u_swirl, g.swirl + m.swirlMotion * Math.sin(phase + swirlPhase))
      gl.uniform1f(loc.u_distortion, g.distortion)
      gl.uniform1f(loc.u_phase, phase)
      gl.uniform1f(loc.u_warp, m.warp)
      gl.uniform1i(loc.u_warpOctaves, Math.min(5, Math.max(1, Math.round(m.warpOctaves))))
      gl.uniform4f(loc.u_warpCoord, warpSeed[0], warpSeed[1], noiseTime[0], noiseTime[1])
      gl.uniform2f(loc.u_flow, flow[0], flow[1])

      gl.uniform1i(loc.u_noiseType, NOISE_TYPES[n.type] ?? 0)
      gl.uniform1f(loc.u_noiseSize, n.size)
      gl.uniform1f(loc.u_noiseIntensity, n.intensity)
      gl.uniform1i(loc.u_blend, BLEND_MODES[n.blend] ?? 0)
      gl.uniform1f(loc.u_noiseColour, n.colour)
      gl.uniform1f(loc.u_noiseLuma, n.luma)
      gl.uniform1f(loc.u_grainSeed, grainSeed)

      gl.drawArrays(gl.TRIANGLES, 0, 3)
    },

    hashPixels() {
      const w = canvas.width
      const h = canvas.height
      const px = new Uint8Array(w * h * 4)
      gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, px)
      /* FNV-1a, 32-bit. */
      let hash = 0x811c9dc5
      for (let i = 0; i < px.length; i++) {
        hash ^= px[i]
        hash = Math.imul(hash, 0x01000193)
      }
      return (hash >>> 0).toString(16).padStart(8, '0')
    },

    destroy() {
      gl.deleteTexture(texture)
      gl.deleteVertexArray(vao)
      gl.deleteProgram(program)
      gl.deleteShader(vert)
      gl.deleteShader(frag)
      /* Lose the context only once the canvas has left the page. React StrictMode
         destroys and recreates the renderer on the same canvas, and getContext
         would then hand back the lost context. */
      setTimeout(() => {
        if (!canvas.isConnected) gl.getExtension('WEBGL_lose_context')?.loseContext()
      }, 0)
    },
  }
}
