import { patternColours, type GradientRecipe } from '@/pages/gradient-lab/recipe'

/* The recipes drawn in 2D canvas rather than by Paper Shaders, after thirteen of the
   "40 Motion Backgrounds" sketches (Scenario):
   - Sine stack: stacked sine lines, each a little out of phase with the one above,
     so the stack folds and rolls like cloth; one line is in the second colour.
   - Dot sweep: a radar arm sweeps a dot grid; dots flare in the second colour at
     the arm, then cool to the main colour and shrink.
   - Pixel rain: columns of square pixels falling at different speeds, each trail
     shrinking away behind a head in the second colour.
   - Halftone wave: a 45-degree halftone screen; two travelling waves of tone swell
     the dots until they merge, the fullest in the second colour.
   - Isometric cubes: the tumbling-blocks tiling, cubes lifting in a diagonal wave;
     tops in the second colour, faces in the background and main colours.
   - Kaleidoscope: a true three-mirror kaleidoscope; a large disc in the main colour
     and a small one in the second wander the mirror triangle, and the reflections
     tile the frame with six-fold rosettes.
   - Truchet flow: Smith tiles (two quarter arcs) flipping in four waves, so the
     connected paths keep re-routing, the turning tiles in the second colour; loops
     once the waves have played through.
   - Dot tunnel: rings of dots spiralling toward the camera, fading in from the far
     end; every few rings in the second colour.
   - Contours: topographic lines of a slowly morphing terrain, rising out of the
     peaks; minor lines in the main colour half blended into the background, index
     lines in the second colour.
   - Halftone bloom: a halftone glow at the centre that flares and sends rings
     outward; glow dots in the main colour, ring dots in the second.
   - Confetti: flat paper pieces tumbling down in a far and a near layer, each
     flipping in 3D; pieces in the main colour or the second (its back a shade darker).
   - Scan bars: a stack of thick bars cut by a scan line sweeping back and forth in
     a chevron; bars behind the cut in the second colour, ahead of it in the main.
   - Dot ripple: drops in the second colour land on a still dot grid and send
     damped ripples through it; the dots on a ripple's crest take the second colour too.
   Colours (patternColours): the background, the main colour and the second colour
   are the tenant's header bar, navigation items and selected item.
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
function drawHalftone(ctx: CanvasRenderingContext2D, u: number, e: number, t: number, r: GradientRecipe, fg: string, fg2: string) {
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
  // The fullest dots, where the waves crest, in the second colour.
  const crest = new Path2D()
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
      const target = tone > 0.7 ? crest : path
      target.moveTo(x + radius, y)
      target.arc(x, y, radius, 0, TAU)
    }
  }
  ctx.fillStyle = fg
  ctx.fill(path)
  ctx.fillStyle = fg2
  ctx.fill(crest)
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
function drawTruchet(ctx: CanvasRenderingContext2D, u: number, e: number, time: number, r: GradientRecipe, fg: string, fg2: string) {
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
  ctx.fillStyle = fg
  ctx.fill(dots)
  ctx.strokeStyle = fg2
  ctx.lineCap = 'round'
  ctx.stroke(turning)
  ctx.lineCap = 'butt'
}

/** Rings of dots in perspective around the origin, nearest drawn last. */
function drawTunnel(ctx: CanvasRenderingContext2D, u: number, t: number, r: GradientRecipe, fg: string, fg2: string) {
  // Focal length: the sketch's half frame height.
  const f = 50 * u
  const n = r.tunnelDots
  const near = 0.35
  const far = r.tunnelDepth
  const steps = t / r.tunnelRingTime
  const p = mod(steps, 1)
  const spin = (TAU / n) * (t / 12) * r.tunnelSpin
  const items: [x: number, y: number, size: number, z: number, hot: boolean][] = []
  for (let k = 0; k < Math.ceil(far / r.tunnelGap) + 2; k++) {
    const z = (k + 1 - p) * r.tunnelGap
    if (z < near || z > far) continue
    // A ring keeps its colour as it travels: count it from the start of time.
    const ring = k + Math.floor(steps)
    const hot = r.tunnelHighlight > 0 && mod(ring, r.tunnelHighlight) === 0
    const twist = z * r.tunnelTwist
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU + twist + spin
      items.push([(f * Math.cos(a) * r.tunnelRadius) / z, (-f * Math.sin(a) * r.tunnelRadius) / z, f / z, z, hot])
    }
  }
  items.sort((A, B) => B[3] - A[3])
  for (const [x, y, size, z, hot] of items) {
    const alpha = (1 - smoothstep(far * 0.4, far, z)) * smoothstep(near, 1.1, z)
    if (alpha <= 0) continue
    ctx.fillStyle = withAlpha(hot ? fg2 : fg, alpha)
    ctx.beginPath()
    ctx.arc(x, y, r.tunnelDot * size, 0, TAU)
    ctx.fill()
  }
}

/** The sketch's five moving hills (centre x and y, sway x and y, spread, height, phase), in frame units 0-1. */
const CONTOUR_BUMPS = [
  [0.3, 0.42, 0.1, 0.12, 0.34, 1.0, 0],
  [0.72, 0.6, 0.12, 0.1, 0.3, 0.9, 1.7],
  [0.52, 0.18, 0.14, 0.08, 0.26, -0.8, 3.1],
  [0.12, 0.85, 0.08, 0.1, 0.28, -0.7, 4.2],
  [0.9, 0.2, 0.08, 0.12, 0.24, 0.7, 5.0],
]

/** #rrggbb halfway to another, for the minor contour lines. */
function mixHex(a: string, b: string, k: number): string {
  const x = parseInt(a.slice(1), 16)
  const y = parseInt(b.slice(1), 16)
  const ch = (shift: number) => Math.round(lerp((x >> shift) & 255, (y >> shift) & 255, k))
  return `rgb(${ch(16)},${ch(8)},${ch(0)})`
}

/** Contour lines of a height field across [-e, e] (marching squares, smoothed through segment midpoints). */
function drawContours(ctx: CanvasRenderingContext2D, u: number, e: number, t: number, r: GradientRecipe, bg: string, fg: string, fg2: string) {
  const cs = 2.6 * u
  const frame = 100 * u
  const cols = Math.ceil((2 * e) / cs) + 1
  const rows = cols
  const T = (TAU * t) / r.contourMorph
  const W1 = cols + 1
  const field = new Float32Array(W1 * (rows + 1))
  for (let j = 0; j <= rows; j++) {
    for (let i = 0; i <= cols; i++) {
      // Frame units: 0-1 across the visible square.
      const X = (-e + i * cs) / frame + 0.5
      const Y = (-e + j * cs) / frame + 0.5
      let v = 0.18 * Math.sin(X * 2.3 + Y * 1.4 + T) + 0.12 * Math.sin(-X * 1.6 + Y * 3.1 + 2 * T + 1)
      for (const [bx, by, rx, ry, sg, amp, ph] of CONTOUR_BUMPS) {
        const px = bx + rx * Math.sin(T + ph)
        const py = by + ry * Math.sin(2 * T + ph * 1.3)
        const d2 = (X - px) * (X - px) + (Y - py) * (Y - py)
        v += amp * Math.exp(-d2 / (sg * sg))
      }
      field[j * W1 + i] = v
    }
  }
  const step = r.contourStep
  // Whole levels per morph cycle, so index lines stay index lines when it loops.
  const shift = (t / r.contourMorph) * r.contourDrift * step
  let vmin = Infinity
  let vmax = -Infinity
  for (const v of field) {
    if (v < vmin) vmin = v
    if (v > vmax) vmax = v
  }
  const nEdges = 2 * W1 * (rows + 1)
  const ex = new Float32Array(nEdges)
  const ey = new Float32Array(nEdges)
  const nb = new Int32Array(nEdges * 2)
  const seen = new Uint8Array(nEdges)
  const minor = new Path2D()
  const major = new Path2D()
  const k0 = Math.ceil((vmin - shift) / step)
  const k1 = Math.floor((vmax - shift) / step)
  for (let k = k0; k <= k1; k++) {
    const lv = k * step + shift
    nb.fill(-1)
    seen.fill(0)
    const used: number[] = []
    const pt = (edge: number) => {
      const q = edge >> 1
      const i0 = q % W1
      const j0 = (q / W1) | 0
      const i1 = edge & 1 ? i0 : i0 + 1
      const j1 = edge & 1 ? j0 + 1 : j0
      const a = field[j0 * W1 + i0]
      const b = field[j1 * W1 + i1]
      const f = (lv - a) / (b - a)
      ex[edge] = -e + lerp(i0, i1, f) * cs
      ey[edge] = -e + lerp(j0, j1, f) * cs
    }
    const link = (e1: number, e2: number) => {
      if (nb[e1 * 2] < 0) {
        pt(e1)
        nb[e1 * 2] = e2
        used.push(e1)
      } else nb[e1 * 2 + 1] = e2
      if (nb[e2 * 2] < 0) {
        pt(e2)
        nb[e2 * 2] = e1
        used.push(e2)
      } else nb[e2 * 2 + 1] = e1
    }
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const a = field[j * W1 + i]
        const b = field[j * W1 + i + 1]
        const c = field[(j + 1) * W1 + i + 1]
        const d = field[(j + 1) * W1 + i]
        const idx = (a > lv ? 8 : 0) | (b > lv ? 4 : 0) | (c > lv ? 2 : 0) | (d > lv ? 1 : 0)
        if (idx === 0 || idx === 15) continue
        const eT = (j * W1 + i) * 2
        const eB = ((j + 1) * W1 + i) * 2
        const eL = (j * W1 + i) * 2 + 1
        const eR = (j * W1 + i + 1) * 2 + 1
        switch (idx) {
          case 1:
          case 14:
            link(eL, eB)
            break
          case 2:
          case 13:
            link(eB, eR)
            break
          case 3:
          case 12:
            link(eL, eR)
            break
          case 4:
          case 11:
            link(eT, eR)
            break
          case 6:
          case 9:
            link(eT, eB)
            break
          case 7:
          case 8:
            link(eL, eT)
            break
          case 5:
          case 10: {
            const centre = (a + b + c + d) / 4 > lv
            if ((idx === 5) === centre) {
              link(eL, eT)
              link(eB, eR)
            } else {
              link(eL, eB)
              link(eT, eR)
            }
            break
          }
        }
      }
    }
    const path = r.contourIndex > 0 && mod(k, r.contourIndex) === 0 ? major : minor
    const walk = (start: number) => {
      const pts = [start]
      seen[start] = 1
      let cur = start
      for (;;) {
        const n0 = nb[cur * 2]
        const n1 = nb[cur * 2 + 1]
        const nx = n0 >= 0 && !seen[n0] ? n0 : n1 >= 0 && !seen[n1] ? n1 : -1
        if (nx < 0) break
        seen[nx] = 1
        pts.push(nx)
        cur = nx
      }
      return pts
    }
    const trace = (pts: number[], closed: boolean) => {
      const n = pts.length
      if (n < 2) return
      const X = (q: number) => ex[pts[q]]
      const Y = (q: number) => ey[pts[q]]
      if (closed && n > 2) {
        path.moveTo((X(n - 1) + X(0)) / 2, (Y(n - 1) + Y(0)) / 2)
        for (let q = 0; q < n; q++) {
          const nq = (q + 1) % n
          path.quadraticCurveTo(X(q), Y(q), (X(q) + X(nq)) / 2, (Y(q) + Y(nq)) / 2)
        }
      } else {
        path.moveTo(X(0), Y(0))
        for (let q = 1; q < n - 1; q++) path.quadraticCurveTo(X(q), Y(q), (X(q) + X(q + 1)) / 2, (Y(q) + Y(q + 1)) / 2)
        path.lineTo(X(n - 1), Y(n - 1))
      }
    }
    // Open chains start at their loose ends; whatever is left is closed loops.
    for (const edge of used) if (!seen[edge] && nb[edge * 2 + 1] < 0) trace(walk(edge), false)
    for (const edge of used) if (!seen[edge]) trace(walk(edge), true)
  }
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.strokeStyle = mixHex(bg, fg, 0.5)
  ctx.lineWidth = r.contourMinor * u
  ctx.stroke(minor)
  ctx.strokeStyle = fg2
  ctx.lineWidth = r.contourMajor * u
  ctx.stroke(major)
}

/** A staggered dot screen across [-e, e]: a glow at the centre and rings of light leaving it. */
function drawBloom(ctx: CanvasRenderingContext2D, u: number, e: number, t: number, r: GradientRecipe, fg: string, fg2: string) {
  const p = r.bloomSpacing * u
  const rowH = p * 0.866
  const rMax = p * r.bloomDot
  const reach = e + 12 * u
  const per = r.bloomPeriod
  const n = r.bloomRings
  const outCubic = (k: number) => 1 - Math.pow(1 - k, 3)
  const rings: [radius: number, width: number, amp: number][] = []
  let flash = 0
  for (let k = 0; k < n; k++) {
    const q = mod((t - (k * per) / n) / per, 1)
    rings.push([lerp(6 * u, reach, outCubic(q)), lerp(r.bloomRingStart, r.bloomRingEnd, q) * u, Math.pow(1 - q, 1.3)])
    flash = Math.max(flash, 1 - outCubic(clamp01(q / 0.4)))
  }
  const g = (r.bloomGlow + r.bloomFlare * flash) * u
  const glow = new Path2D()
  const ring = new Path2D()
  const rows = Math.ceil(e / rowH) + 1
  const cols = Math.ceil(e / p) + 1
  for (let j = -rows; j <= rows; j++) {
    const y = j * rowH
    for (let i = -cols - 1; i <= cols; i++) {
      const x = i * p + (mod(j, 2) ? p / 2 : 0)
      const d = Math.hypot(x, y)
      const vg = Math.exp(-(d * d) / (g * g))
      let vr = 0
      for (const [rr, bw, amp] of rings) {
        const z = (d - rr) / bw
        vr += amp * r.bloomStrength * Math.exp(-z * z)
      }
      const radius = rMax * Math.pow(clamp01(vg + vr), 0.7)
      if (radius <= 0.2 * u) continue
      // Dots lit mostly by a ring take the second colour.
      const path = vr > vg ? ring : glow
      path.moveTo(x + radius, y)
      path.arc(x, y, radius, 0, TAU)
    }
  }
  ctx.fillStyle = fg
  ctx.fill(glow)
  ctx.fillStyle = fg2
  ctx.fill(ring)
}

const CONFETTI_FLIPS = [1.5, 2, 3]

/** Paper pieces falling across [-e, e], far layer first. */
function drawConfetti(ctx: CanvasRenderingContext2D, u: number, e: number, t: number, r: GradientRecipe, fg: string, fg2: string) {
  const frame = 100 * u
  const n = Math.max(1, Math.round((r.confettiCount * 2 * e) / frame))
  // The back of a piece in the second colour, a shade towards the main colour.
  const back = mixHex(fg2, fg, 0.2)
  const span = 2 * e + 26 * u
  const salt = r.confettiSeed * 101
  for (let pass = 0; pass < 2; pass++) {
    for (let i = 0; i < n; i++) {
      const id = i + salt
      const near = rand(id, 1) < r.confettiNear
      if (near !== (pass === 1)) continue
      const size = (near ? lerp(8.5, 10.5, rand(id, 2)) : lerp(5.2, 6.4, rand(id, 2))) * u * r.confettiSize
      const wraps = near ? 2 : 1
      const y = mod(rand(id, 3) * span + (wraps * span * t) / r.confettiFall, span) - e - 13 * u
      const sway = Math.sin(TAU * (t / 3) * (rand(id, 4) < 0.5 ? 1 : 2) + rand(id, 5) * TAU) * r.confettiSway * u
      const x = ((i + 0.15 + rand(id, 6) * 0.7) / n) * (2 * e + 8 * u) - e - 4 * u + sway
      const flipTime = CONFETTI_FLIPS[Math.floor(rand(id, 7) * 3)]
      const flip = Math.cos(TAU * (t / flipTime) + rand(id, 8) * TAU)
      const tilt = rand(id, 9) * TAU + Math.sin(TAU * (t / 6) + rand(id, 10) * TAU) * 0.6
      const second = rand(id, 11) < r.confettiMix
      ctx.fillStyle = second ? (flip >= 0 ? fg2 : back) : fg
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(tilt)
      ctx.scale(Math.max(0.1, Math.abs(flip)), 1)
      ctx.beginPath()
      if (rand(id, 12) < r.confettiRects) ctx.rect(-size * 0.4, -size * 0.8, size * 0.8, size * 1.6)
      else ctx.arc(0, 0, size * 0.62, 0, TAU)
      ctx.fill()
      ctx.restore()
    }
  }
}

const inOutQuad = (k: number) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2)

/** Pill bars down [-e, e], each split by the sweeping cut. */
function drawScan(ctx: CanvasRenderingContext2D, u: number, e: number, t: number, r: GradientRecipe, fg: string, fg2: string) {
  const frame = 100 * u
  const n = r.scanBars
  const pitch = frame / n
  const thick = pitch * r.scanThickness
  const rad = thick / 2
  const pass = r.scanPass
  const mid = (n - 1) / 2
  const pill = (x0: number, x1: number, y: number, fill: string) => {
    if (x1 <= x0) return
    ctx.fillStyle = fill
    ctx.beginPath()
    ctx.roundRect(x0, y - rad, x1 - x0, thick, Math.min(rad, (x1 - x0) / 2))
    ctx.fill()
  }
  // Bars counted from the frame's top bar, so the chevron is centred on the frame.
  const first = Math.floor((-e + frame / 2) / pitch) - 1
  const last = Math.ceil((e + frame / 2) / pitch)
  for (let i = first; i <= last; i++) {
    const y = -frame / 2 + (i + 0.5) * pitch
    const lag = r.scanChevron * (Math.abs(i - mid) / Math.max(1, mid)) + 0.05 * (i / Math.max(1, n - 1))
    const p = mod((t - lag * pass) / (pass * 2), 1)
    const forward = p < 0.5
    const k = forward ? p * 2 : p * 2 - 1
    const kk = clamp01(k / r.scanSweep)
    const ease = inOutQuad(kk)
    // The cut opens as it speeds up and closes as it settles.
    const gap = lerp(r.scanGapMin, r.scanGapMax, Math.sin(Math.PI * kk)) * u
    const left = -e - gap / 2 - rad
    const right = e + gap / 2 + rad
    const g = forward ? lerp(left, right, ease) : lerp(right, left, ease)
    pill(-e - 2 * rad, g - gap / 2, y, fg2)
    pill(g + gap / 2, e + 2 * rad, y, fg)
  }
}

const RIPPLE_DROPS = 8

/** A dot grid across [-e, e], pushed and swollen by ripples from drops scattered over the frame. */
function drawRipple(ctx: CanvasRenderingContext2D, u: number, e: number, t: number, r: GradientRecipe, fg: string, fg2: string) {
  const frame = 100 * u
  const p = r.rippleSpacing * u
  const r0 = r.rippleDot * u
  const loop = RIPPLE_DROPS * r.rippleInterval
  const salt = r.rippleSeed * 13
  const drops = Array.from({ length: RIPPLE_DROPS }, (_, i) => ({
    start: i * r.rippleInterval + rand(i + salt, 9) * 0.2 * r.rippleInterval,
    x: (lerp(0.1, 0.9, mod(0.15 + i * 0.382 + rand(i + salt, 7) * 0.12, 1)) - 0.5) * frame,
    y: (lerp(0.2, 0.8, rand(i + salt, 8)) - 0.5) * frame,
  }))
  const speed = r.rippleSpeed * u
  const lam = r.rippleWavelength * u
  const bw = r.rippleWidth * u
  // A ripple lives until it has faded to nothing.
  const life = r.rippleFade * 3.2
  const live = drops.map((d) => ({ ...d, age: mod(t - d.start, loop) })).filter((d) => d.age < life)
  const dots = new Path2D()
  const crest = new Path2D()
  const n = Math.ceil(e / p) + 1
  for (let j = -n; j <= n; j++) {
    for (let i = -n; i <= n; i++) {
      const x = i * p
      const y = j * p
      let dx = 0
      let dy = 0
      let grow = 0
      for (const d of live) {
        const vx = x - d.x
        const vy = y - d.y
        const dist = Math.hypot(vx, vy) + 1e-6
        const xr = dist - speed * d.age
        if (xr > bw * 2.5 || xr < -bw * 3) continue
        const env =
          (Math.exp(-(xr * xr) / (bw * bw)) * Math.exp(-d.age / r.rippleFade) * smoothstep(0, 0.3, d.age) * smoothstep(0, 1.6 * p, dist)) /
          (1 + dist / (60 * u))
        const ph = (TAU * xr) / lam
        dx += (vx / dist) * Math.sin(ph) * env * r.ripplePush * u
        dy += (vy / dist) * Math.sin(ph) * env * r.ripplePush * u
        grow += Math.cos(ph) * env
      }
      const radius = r0 * (1 + r.rippleSwell * grow)
      if (radius <= 0.2 * u) continue
      const path = grow > 0.35 ? crest : dots
      path.moveTo(x + dx + radius, y + dy)
      path.arc(x + dx, y + dy, radius, 0, TAU)
    }
  }
  ctx.fillStyle = fg
  ctx.fill(dots)
  ctx.fillStyle = fg2
  ctx.fill(crest)
  // The drop itself falls onto the surface just before its ripple.
  for (const d of drops) {
    const k = mod(t - (d.start - 0.45), loop)
    if (k > 1.05) continue
    const size = k < 0.45 ? lerp(4.8, 1.8, Math.pow(k / 0.45, 3)) : lerp(1.8, 0, inOutCubic((k - 0.45) / 0.6))
    ctx.beginPath()
    ctx.arc(d.x, d.y, Math.max(0, size * u), 0, TAU)
    ctx.fill()
  }
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
  else if (recipe.shader === 'halftone') drawHalftone(ctx, u, e, t, recipe, fg, fg2)
  else if (recipe.shader === 'cubes') drawCubes(ctx, u, e, t, recipe, bg, fg, fg2)
  else if (recipe.shader === 'kaleido') drawKaleido(ctx, u, e, t, recipe, fg, fg2)
  else if (recipe.shader === 'truchet') drawTruchet(ctx, u, e, t, recipe, fg, fg2)
  else if (recipe.shader === 'tunnel') drawTunnel(ctx, u, t, recipe, fg, fg2)
  else if (recipe.shader === 'contours') drawContours(ctx, u, e, t, recipe, bg, fg, fg2)
  else if (recipe.shader === 'bloom') drawBloom(ctx, u, e, t, recipe, fg, fg2)
  else if (recipe.shader === 'confetti') drawConfetti(ctx, u, e, t, recipe, fg, fg2)
  else if (recipe.shader === 'scan') drawScan(ctx, u, e, t, recipe, fg, fg2)
  else if (recipe.shader === 'ripple') drawRipple(ctx, u, e, t, recipe, fg, fg2)
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
