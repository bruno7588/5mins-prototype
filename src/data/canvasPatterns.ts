import { patternColours, type GradientRecipe } from '@/pages/gradient-lab/recipe'

/* The recipes drawn in 2D canvas rather than by Paper Shaders, after seven of the
   "40 Motion Backgrounds" sketches (Scenario):
   - Sine stack: stacked sine lines, each a little out of phase with the one above,
     so the stack folds and rolls like cloth; one line is in the second colour.
   - Dot sweep: a radar arm sweeps a dot grid; dots flare in the second colour at
     the arm, then cool to the main colour and shrink.
   - Pixel rain: columns of square pixels falling at different speeds, each trail
     shrinking away behind a head in the second colour.
   - Halftone wave: a 45-degree halftone screen; two travelling waves of tone swell
     the dots until they merge.
   - Isometric cubes: the tumbling-blocks tiling, cubes lifting in a diagonal wave;
     tops in the second colour, faces in the background and main colours.
   - Kaleidoscope: a true three-mirror kaleidoscope; a large disc in the main colour
     and a small one in the second wander the mirror triangle, and the reflections
     tile the frame with six-fold rosettes.
   - Truchet flow: Smith tiles (two quarter arcs) flipping in four waves, so the
     connected paths keep re-routing; loops once the waves have played through.
   Sizes are % of the frame (the sketches' `u`), so a pattern looks the same at
   any size. Time is in seconds. The recipe's scale, rotation and offset frame
   the pattern like they frame the shaders. */

const TAU = Math.PI * 2
const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
const lerp = (a: number, b: number, k: number) => a + (b - a) * k
const mod = (x: number, m: number) => ((x % m) + m) % m
const smoothstep = (a: number, b: number, x: number) => {
  const k = clamp01((x - a) / (b - a))
  return k * k * (3 - 2 * k)
}

/** Lines across [-e, e]; the canvas is already centred on the pattern. */
function drawSine(ctx: CanvasRenderingContext2D, u: number, e: number, t: number, r: GradientRecipe, fg: string, fg2: string) {
  const s = r.sineSpacing * u
  const lam = r.sineWavelength * u
  const phi = r.sinePhase
  // Above this, neighbouring lines would cross.
  const aMax = s / (2 * Math.sin(phi / 2))
  const amp = aMax * r.sineAmplitude
  const highlight = Math.round(((r.sineHighlight - 0.5) * 100 * u) / s)
  const step = Math.max(2, lam / 48)
  const first = Math.floor((-e - amp) / s) - 1
  const last = Math.ceil((e + amp) / s) + 1
  const lines = new Path2D()
  const hot = new Path2D()
  for (let j = first; j <= last; j++) {
    const y0 = j * s + s * 0.5
    const path = j === highlight ? hot : lines
    for (let x = -e - step, start = true; x <= e + step; x += step, start = false) {
      const env = 0.62 + r.sineEnvelope * Math.sin((TAU * x) / (lam * 2.6) + (TAU * t) / 12)
      const th = (TAU * x) / lam - (TAU * t) / 4 + j * phi
      const y = y0 + amp * env * Math.sin(th)
      if (start) path.moveTo(x, y)
      else path.lineTo(x, y)
    }
  }
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.lineWidth = r.sineLineWidth * u
  ctx.strokeStyle = fg
  ctx.stroke(lines)
  ctx.strokeStyle = fg2
  ctx.stroke(hot)
}

/** A dot grid across [-e, e] around the arm's centre at the origin. */
function drawSweep(ctx: CanvasRenderingContext2D, u: number, e: number, t: number, r: GradientRecipe, fg: string, fg2: string) {
  const p = r.sweepSpacing * u
  const rMin = r.sweepDotMin * u
  const rMax = Math.max(rMin, r.sweepDotMax * u)
  const k = (TAU * t) / r.sweepTurn
  // Eased: each turn surges and settles.
  const sweep = k - r.sweepSurge * Math.sin(k)
  const n = Math.ceil(e / p) + 1
  const ink = new Path2D()
  const hot = new Path2D()
  for (let j = -n; j <= n; j++) {
    for (let i = -n; i <= n; i++) {
      if (!i && !j) continue
      const x = i * p
      const y = j * p
      // Angle behind the arm.
      const d = mod(sweep - Math.atan2(y, x), TAU)
      const radius = lerp(rMin, rMax, Math.exp(-d / r.sweepTrail) * smoothstep(0, 0.08, d))
      if (radius <= 0) continue
      // The arm is a band of dots a fixed distance wide, so it reads as one straight edge.
      const band = (d * Math.hypot(x, y)) / p
      const path = band < r.sweepArm && d < 0.6 ? hot : ink
      path.moveTo(x + radius, y)
      path.arc(x, y, radius, 0, TAU)
    }
  }
  ctx.fillStyle = fg
  ctx.fill(ink)
  ctx.fillStyle = fg2
  ctx.fill(hot)
}

/** Deterministic randoms from the sketch: the same column always falls the same way. */
const hash = (n: number) => {
  const v = Math.sin(n * 127.1 + 311.7) * 43758.5453123
  return v - Math.floor(v)
}
const rand = (i: number, salt: number) => hash(i * 12.9898 + salt * 78.233 + 0.5)
const RAIN_PERIODS = [2, 3, 3, 4, 6]

/** Pixel columns across [-e, e]. */
function drawRain(ctx: CanvasRenderingContext2D, u: number, e: number, t: number, r: GradientRecipe, fg: string, fg2: string) {
  const cell = r.rainCell * u
  const sq = cell * r.rainSquare
  const n = Math.ceil(e / cell)
  const rows = 2 * n
  const top = -n * cell
  const ink = new Path2D()
  const head = new Path2D()
  for (let c = -n; c < n; c++) {
    const id = c + r.rainSeed * 101
    // Some columns stay dry.
    if (rand(id, 1) < r.rainDry) continue
    const per = RAIN_PERIODS[Math.floor(rand(id, 2) * RAIN_PERIODS.length)] * r.rainFall
    const trail = r.rainTrailMin + Math.floor(rand(id, 3) * r.rainTrailRange)
    const travel = rows + trail + 1
    const hp = mod((t + rand(id, 4) * per) / per, 1) * travel
    const hr = Math.floor(hp)
    const x = c * cell + cell / 2
    for (let k = 0; k <= trail; k++) {
      const row = hr - k
      if (row < 0 || row >= rows) continue
      const f = 1 - clamp01((hp - row - 1) / Math.max(1, trail))
      const size = sq * Math.pow(f, 0.7)
      if (size < 0.5 * u) continue
      const y = top + row * cell + cell / 2
      ;(k === 0 ? head : ink).rect(x - size / 2, y - size / 2, size, size)
    }
  }
  ctx.fillStyle = fg
  ctx.fill(ink)
  ctx.fillStyle = fg2
  ctx.fill(head)
}

/** A staggered dot screen across [-e, e], sized by two travelling waves of tone. */
function drawHalftone(ctx: CanvasRenderingContext2D, u: number, e: number, t: number, r: GradientRecipe, fg: string) {
  const p = r.halftoneSpacing * u
  const rowH = p / 2
  const rMax = p * r.halftoneDot
  const rad = Math.PI / 180
  const c1 = Math.cos(r.halftoneAngle * rad)
  const s1 = Math.sin(r.halftoneAngle * rad)
  const c2 = Math.cos(r.halftoneAngle2 * rad)
  const s2 = Math.sin(r.halftoneAngle2 * rad)
  const t1 = (TAU * t) / r.halftoneTime
  const t2 = (TAU * t) / r.halftoneTime2
  const rows = Math.ceil(e / rowH) + 1
  const cols = Math.ceil(e / p) + 1
  const path = new Path2D()
  for (let j = -rows; j <= rows; j++) {
    const y = j * rowH
    for (let i = -cols; i <= cols; i++) {
      const x = i * p + (mod(j, 2) ? p / 2 : 0)
      const X = x / u
      const Y = y / u
      const v1 = Math.sin((TAU * (X * c1 + Y * s1)) / r.halftoneWavelength - t1)
      const v2 = Math.sin((TAU * (X * c2 + Y * s2)) / r.halftoneWavelength2 + t2)
      const mix = r.halftoneMix
      const tone = smoothstep(r.halftoneStart, Math.max(r.halftoneStart + 0.01, r.halftoneEnd), 0.5 + 0.5 * (mix * v1 + (1 - mix) * v2))
      const radius = rMax * Math.pow(tone, 0.75)
      if (radius <= 0.18 * u) continue
      path.moveTo(x + radius, y)
      path.arc(x, y, radius, 0, TAU)
    }
  }
  ctx.fillStyle = fg
  ctx.fill(path)
}

const inOutCubic = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2)

/** #rrggbb at an alpha, for the cube edges. */
function withAlpha(hex: string, a: number): string {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`
}

/** The tumbling-blocks tiling across [-e, e]; each cube stands on a column as it lifts. */
function drawCubes(ctx: CanvasRenderingContext2D, u: number, e: number, t: number, r: GradientRecipe, bg: string, fg: string, fg2: string) {
  const s = r.cubeSize * u
  // A quarter of the hexagon's height.
  const q = s * Math.tan(Math.PI / 6)
  const frame = 100 * u
  const rows = Math.ceil(e / (3 * q)) + 2
  const cols = Math.ceil(e / (2 * s)) + 1
  ctx.strokeStyle = withAlpha(fg, 0.5)
  ctx.lineWidth = r.cubeEdge * u
  ctx.lineJoin = 'round'
  const face = (pts: [number, number][], fill: string) => {
    ctx.beginPath()
    pts.forEach(([a, b], n) => (n ? ctx.lineTo(a, b) : ctx.moveTo(a, b)))
    ctx.closePath()
    ctx.fillStyle = fill
    ctx.fill()
    if (r.cubeEdge > 0) ctx.stroke()
  }
  // Back rows first, so each row's columns stand in front of the row above.
  for (let j = -rows; j <= rows; j++) {
    for (let i = -cols; i <= cols; i++) {
      const x = i * 2 * s + (mod(j, 2) ? s : 0)
      const y0 = j * 3 * q
      const k = 0.5 + 0.5 * Math.sin((TAU * t) / r.cubeTime - (x / frame) * r.cubeWaveX - (y0 / frame) * r.cubeWaveY)
      const y = y0 - inOutCubic(k) * r.cubeLift * q
      // Extend the sides down so a lifted cube stands on a column.
      const drop = y0 - y + 2 * q
      face([[x - s, y - q], [x, y], [x, y + 2 * q + drop], [x - s, y + q + drop]], bg)
      face([[x + s, y - q], [x, y], [x, y + 2 * q + drop], [x + s, y + q + drop]], fg)
      face([[x, y - 2 * q], [x + s, y - q], [x, y], [x - s, y - q]], fg2)
    }
  }
}

/** A three-mirror kaleidoscope across [-e, e]: the triangular lattice, each cell a mirrored copy of one triangle. */
function drawKaleido(ctx: CanvasRenderingContext2D, u: number, e: number, t: number, r: GradientRecipe, fg: string, fg2: string) {
  const s = r.kaleidoSize * u
  const h3 = (s * Math.sqrt(3)) / 2
  const F: [number, number][] = [[0, 0], [s, 0], [s / 2, h3]]
  const G: [number, number] = [s / 2, h3 / 3]
  // The discs' route: corner, centre, next corner, centre and so on, one leg at a time.
  const route = [F[0], G, F[1], G, F[2], G]
  const leg = r.kaleidoLeg
  const at = (tt: number): [number, number] => {
    const n = Math.floor(mod(tt, leg * 6) / leg)
    const k = inOutCubic(clamp01((mod(tt, leg) / leg - 0.05) / 0.7))
    const A = route[n]
    const B = route[(n + 1) % 6]
    return [lerp(A[0], B[0], k), lerp(A[1], B[1], k)]
  }
  const pa = at(t)
  // The small disc runs out of step, so one disc is always travelling.
  const pb = at(t + r.kaleidoLag)
  const content = () => {
    ctx.fillStyle = fg
    ctx.beginPath()
    ctx.arc(pa[0], pa[1], s * r.kaleidoDisc, 0, TAU)
    ctx.fill()
    if (r.kaleidoDot <= 0) return
    ctx.fillStyle = fg2
    ctx.beginPath()
    ctx.arc(pb[0], pb[1], s * r.kaleidoDot, 0, TAU)
    ctx.fill()
  }
  const V = (i: number, j: number): [number, number] => [i * s + (j * s) / 2, j * h3]
  const jr = Math.ceil(e / h3) + 1
  const ir = Math.ceil(e / s) + jr + 2
  // A hair of overlap between neighbouring mirrors hides the seams.
  const ins = 1 + (0.6 * Math.sqrt(12)) / s
  for (let j = -jr; j <= jr; j++) {
    for (let i = -ir; i <= ir; i++) {
      const tris: [number, number][][] = [
        [[i, j], [i + 1, j], [i, j + 1]],
        [[i + 1, j], [i + 1, j + 1], [i, j + 1]],
      ]
      for (const tri of tris) {
        const pts = tri.map(([a, b]) => V(a, b))
        const xs = pts.map((p) => p[0])
        const ys = pts.map((p) => p[1])
        if (Math.max(...xs) < -e || Math.min(...xs) > e || Math.max(...ys) < -e || Math.min(...ys) > e) continue
        // The vertex label (i - j) mod 3 decides how the triangle maps in, so neighbours mirror each other.
        const by: [number, number][] = []
        tri.forEach(([a, b], n) => {
          by[mod(a - b, 3)] = pts[n]
        })
        const [P0, P1, P2] = by
        const ax = (P1[0] - P0[0]) / s
        const ay = (P1[1] - P0[1]) / s
        const bx = (P2[0] - P0[0] - (s / 2) * ax) / h3
        const byy = (P2[1] - P0[1] - (s / 2) * ay) / h3
        ctx.save()
        ctx.transform(ax, ay, bx, byy, P0[0], P0[1])
        ctx.beginPath()
        F.forEach(([x, y], n) => {
          const X = G[0] + (x - G[0]) * ins
          const Y = G[1] + (y - G[1]) * ins
          if (n) ctx.lineTo(X, Y)
          else ctx.moveTo(X, Y)
        })
        ctx.closePath()
        ctx.clip()
        content()
        ctx.restore()
      }
    }
  }
}

/** inOutBack: a touch of anticipation, a soft overshoot, then it settles. */
function inOutBack(k: number, back: number) {
  const s = back * 1.525
  return k < 0.5
    ? (Math.pow(2 * k, 2) * ((s + 1) * 2 * k - s)) / 2
    : (Math.pow(2 * k - 2, 2) * ((s + 1) * (k * 2 - 2) + s) + 2) / 2
}
const TRUCHET_WAVES = [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3], [0, 1, 2, 3]]
const TRUCHET_DIRS = [0, 2.2, 3.6, 5.1]

/** Smith tiles across [-e, e]; each tile turns a quarter as each of its waves passes. */
function drawTruchet(ctx: CanvasRenderingContext2D, u: number, e: number, time: number, r: GradientRecipe, fg: string) {
  const frame = 100 * u
  const c = frame / r.truchetTiles
  const hc = c / 2
  // The sketch's 12 s timeline, stretched to the cycle. Every tile turns an even number of quarters, so it loops.
  const k12 = 12 / r.truchetCycle
  const t = mod(time * k12, 12)
  const turnTime = r.truchetTurn * k12
  const cross = r.truchetCross * k12
  const n = Math.ceil(e / c) + 1
  const salt = 2 + r.truchetSeed * 7
  const cellRand = (i: number, j: number) => rand(i * 3 + 0.37, j * 5 + 0.71 + salt) * 911.3
  type Tile = { cx: number; cy: number; q: number; moving: boolean }
  const grid = new Map<string, Tile>()
  for (let j = -n; j <= n; j++) {
    for (let i = -n; i <= n; i++) {
      const sd = cellRand(i, j)
      const cx = i * c
      const cy = j * c
      const flips = TRUCHET_WAVES[Math.floor(rand(sd, 1) * TRUCHET_WAVES.length)]
      let q = Math.floor(rand(sd, 2) * 2)
      for (const wave of flips) {
        const a = TRUCHET_DIRS[wave]
        const reach = ((Math.abs(Math.cos(a)) + Math.abs(Math.sin(a))) * (frame + c)) / 2
        const d = (cx * Math.cos(a) + cy * Math.sin(a)) / reach
        // Each wave crosses the frame in `cross`, so one hands over to the next without a pause.
        const start = wave * 3 + 0.05 + clamp01(d * 0.5 + 0.5) * cross
        q += inOutBack(clamp01((t - start) / turnTime), r.truchetOvershoot)
      }
      grid.set(`${i},${j}`, { cx, cy, q, moving: Math.abs(q - Math.round(q)) > 1e-4 })
    }
  }
  // Settled tiles join butt to butt; turning tiles get round caps, and a settled
  // tile's end gets a round dot wherever its neighbour is mid-turn.
  const lw = c * r.truchetLine
  const still = new Path2D()
  const turning = new Path2D()
  const dots = new Path2D()
  // A hair of overlap so joints never show a seam.
  const ext = 0.012
  const Q = Math.PI / 2
  const isMoving = (i: number, j: number) => grid.get(`${i},${j}`)?.moving ?? false
  for (const [key, tile] of grid) {
    const [i, j] = key.split(',').map(Number)
    const th = tile.q * Q
    const co = Math.cos(th)
    const si = Math.sin(th)
    const path = tile.moving ? turning : still
    const over = tile.moving ? 0 : ext
    for (const side of [1, -1]) {
      const ax = tile.cx + side * (-hc * co + hc * si)
      const ay = tile.cy + side * (-hc * si - hc * co)
      const a0 = th + (side > 0 ? 0 : Math.PI) - over
      path.moveTo(ax + hc * Math.cos(a0), ay + hc * Math.sin(a0))
      path.arc(ax, ay, hc, a0, a0 + Q + 2 * over)
    }
    if (tile.moving) continue
    for (const [dj, di, mx, my] of [[-1, 0, 0, -hc], [1, 0, 0, hc], [0, -1, -hc, 0], [0, 1, hc, 0]]) {
      if (!isMoving(i + di, j + dj)) continue
      dots.moveTo(tile.cx + mx + lw / 2, tile.cy + my)
      dots.arc(tile.cx + mx, tile.cy + my, lw / 2, 0, TAU)
    }
  }
  ctx.strokeStyle = fg
  ctx.lineWidth = lw
  ctx.lineCap = 'butt'
  ctx.stroke(still)
  ctx.lineCap = 'round'
  ctx.stroke(turning)
  ctx.lineCap = 'butt'
  ctx.fillStyle = fg
  ctx.fill(dots)
}

/** One frame of a canvas pattern recipe, filling the canvas (in its own pixels). */
export function drawPattern(ctx: CanvasRenderingContext2D, recipe: GradientRecipe, colours: string[], t: number) {
  const { width: w, height: h } = ctx.canvas
  const size = Math.max(w, h)
  const { bg, fg, fg2 } = patternColours(colours)
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, w, h)
  ctx.translate(w / 2 + recipe.offsetX * size, h / 2 + recipe.offsetY * size)
  ctx.rotate((recipe.rotation * Math.PI) / 180)
  ctx.scale(recipe.scale, recipe.scale)
  // Half the area to cover, in pattern units: the frame's corners wherever framing moved them.
  const e = ((size / 2) * Math.SQRT2 + Math.hypot(recipe.offsetX, recipe.offsetY) * size) / recipe.scale
  const u = size / 100
  if (recipe.shader === 'sweep') drawSweep(ctx, u, e, t, recipe, fg, fg2)
  else if (recipe.shader === 'rain') drawRain(ctx, u, e, t, recipe, fg, fg2)
  else if (recipe.shader === 'halftone') drawHalftone(ctx, u, e, t, recipe, fg)
  else if (recipe.shader === 'cubes') drawCubes(ctx, u, e, t, recipe, bg, fg, fg2)
  else if (recipe.shader === 'kaleido') drawKaleido(ctx, u, e, t, recipe, fg, fg2)
  else if (recipe.shader === 'truchet') drawTruchet(ctx, u, e, t, recipe, fg)
  else drawSine(ctx, u, e, t, recipe, fg, fg2)
  ctx.setTransform(1, 0, 0, 1, 0, 0)
}

/** Seconds of pattern time: the recipe's frame (ms) is where it starts. */
export const patternTime = (recipe: GradientRecipe, elapsedMs: number, speed: number) => (recipe.frame + elapsedMs * speed) / 1000

/**
 * Plays a canvas pattern into `canvas` (sized by the caller) at `speed`, or draws
 * one still frame at speed 0. Returns a stop function.
 */
export function playPattern(canvas: HTMLCanvasElement, recipe: GradientRecipe, colours: string[], speed: number): () => void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return () => {}
  const start = performance.now()
  let raf = 0
  const frame = (now: number) => {
    drawPattern(ctx, recipe, colours, patternTime(recipe, now - start, speed))
    if (speed > 0) raf = requestAnimationFrame(frame)
  }
  frame(start)
  return () => cancelAnimationFrame(raf)
}
