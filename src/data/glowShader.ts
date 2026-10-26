import { getShaderColorFromString } from '@paper-design/shaders'
import { GLOW_FORMS, type GradientRecipe } from '@/pages/gradient-lab/recipe'
import { fromLch, NEUTRAL_CHROMA, toLch } from './brandPalette'
import { DEFAULT_THEME } from './brandTheme'

/* Light form: a soft form lit from one side, after the iridescent "light through
   glass" backgrounds (shaders.com Pro). How the references are made:
   - One shape (a stroked arch, a comet, an orb, a dome, crossing curves, a wave
     ribbon, a prism or a gem) as a signed distance field.
   - A heat value per pixel, mapped through one colour ramp (a gradient map):
     deep inside the shape it is near black, then the body colour, rising
     steeply to a hot rim right at the edge; outside it drops away fast.
   - The rim is only hot where the edge faces the light (the field's normal
     against a light direction), so one side burns and the other side stays dim.
   - A thin band just outside the lit rim takes a cooler colour: the chromatic
     fringe (green in the references).
   - A faint haze lifts the background on the lit side.
   The ramp is built from the three theme colours (glowRamp): darker and lighter
   values of each, and one step through the hue between the navigation items and
   the selected item. Runs in Paper's ShaderMount like the other shaders. */

const RAMP_STOPS = 6

export const glowFragmentShader = `#version 300 es
precision highp float;

uniform float u_time;
uniform vec4 u_ramp[${RAMP_STOPS}];
uniform vec4 u_fringe;
uniform float u_form;
uniform float u_thickness;
uniform float u_rim;
uniform float u_glow;
uniform float u_depth;
uniform float u_fringeAmount;
uniform float u_haze;
uniform float u_light;

in vec2 v_objectUV;
out vec4 fragColor;

float T;

float sdSegment(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0., 1.);
  return length(pa - ba * h);
}

// Inigo Quilez's 2D uneven capsule, polygon and triangle.
float sdUnevenCapsule(vec2 p, vec2 pa, vec2 pb, float ra, float rb) {
  p -= pa; pb -= pa;
  float h = dot(pb, pb);
  vec2 q = vec2(dot(p, vec2(pb.y, -pb.x)), dot(p, pb)) / h;
  q.x = abs(q.x);
  float b = ra - rb;
  vec2 c = vec2(sqrt(h - b * b), b);
  float k = c.x * q.y - c.y * q.x;
  float m = dot(c, q);
  float n = dot(q, q);
  if (k < 0.) return sqrt(h * n) - ra;
  if (k > c.x) return sqrt(h * (n + 1. - 2. * q.y)) - rb;
  return m - ra;
}

float sdPolygon(vec2 p, vec2 v[5]) {
  float d = dot(p - v[0], p - v[0]);
  float s = 1.;
  for (int i = 0, j = 4; i < 5; j = i, i++) {
    vec2 e = v[j] - v[i];
    vec2 w = p - v[i];
    vec2 b = w - e * clamp(dot(w, e) / dot(e, e), 0., 1.);
    d = min(d, dot(b, b));
    bvec3 c = bvec3(p.y >= v[i].y, p.y < v[j].y, e.x * w.y > e.y * w.x);
    if (all(c) || all(not(c))) s *= -1.;
  }
  return s * sqrt(d);
}

float sdTriangle(vec2 p, vec2 p0, vec2 p1, vec2 p2) {
  vec2 e0 = p1 - p0, e1 = p2 - p1, e2 = p0 - p2;
  vec2 v0 = p - p0, v1 = p - p1, v2 = p - p2;
  vec2 pq0 = v0 - e0 * clamp(dot(v0, e0) / dot(e0, e0), 0., 1.);
  vec2 pq1 = v1 - e1 * clamp(dot(v1, e1) / dot(e1, e1), 0., 1.);
  vec2 pq2 = v2 - e2 * clamp(dot(v2, e2) / dot(e2, e2), 0., 1.);
  float s = sign(e0.x * e2.y - e0.y * e2.x);
  vec2 d = min(min(vec2(dot(pq0, pq0), s * (v0.x * e0.y - v0.y * e0.x)),
                   vec2(dot(pq1, pq1), s * (v1.x * e1.y - v1.y * e1.x))),
                   vec2(dot(pq2, pq2), s * (v2.x * e2.y - v2.y * e2.x)));
  return -sqrt(d.x) * sign(d.y);
}

// The form's signed distance, negative inside. p spans -1 to 1, y up.
float form(vec2 p) {
  float grow = (u_thickness - .5) * .4 * (1. + .08 * sin(T * .7));
  if (u_form < .5) {
    // Arch: an upside-down U, the right leg leaning out and leaving the arc on its tangent.
    vec2 c = vec2(-.15, -.25);
    float R = .72;
    float lean = .45;
    vec2 q = p - c;
    float a = atan(q.y, q.x);
    float arc = (a >= lean && a <= 3.14159265) ? abs(length(q) - R) : 1e3;
    float left = sdSegment(p, c + vec2(-R, 0.), c + vec2(-R, -3.));
    vec2 join = c + R * vec2(cos(lean), sin(lean));
    float right = sdSegment(p, join, join + 3. * vec2(sin(lean), -cos(lean)));
    return min(arc, min(left, right)) - (.33 + grow * .6);
  }
  if (u_form < 1.5) {
    // Comet: a round head trailing a wide tail off the frame.
    return sdUnevenCapsule(p, vec2(-1.9, -.75), vec2(.22, .22), .95, .62) - grow;
  }
  if (u_form < 2.5) {
    // Orb: a large sphere coming in from the right.
    return length(p - vec2(.78, -.42)) - 1.25 - grow;
  }
  if (u_form < 3.5) {
    // Dome: a planet's horizon arching across the top.
    return length(p - vec2(.05, -1.55)) - 2.45 - grow;
  }
  if (u_form < 4.5) {
    // Crossing: curves above and below a wandering centre line meet in X crossings.
    float k = 4.5;
    float centre = .18 * sin(1.3 * p.x + .2 * T) - .1;
    float s = sin(k * p.x + .15 * T);
    float f = abs(p.y - centre) - 1.05 * abs(s);
    return f / sqrt(1. + pow(1.05 * k * cos(k * p.x + .15 * T), 2.)) - grow * .3;
  }
  if (u_form < 5.5) {
    // Wave: a ribbon between a tall wave above and a shallow one below.
    float top = .5 + .32 * sin(1.7 * p.x + .6 + .2 * T);
    float bottom = -.38 + .12 * sin(2.3 * p.x - .4 + .14 * T);
    float dTop = (p.y - top) / sqrt(1. + pow(.32 * 1.7 * cos(1.7 * p.x + .6 + .2 * T), 2.));
    float dBottom = (bottom - p.y) / sqrt(1. + pow(.12 * 2.3 * cos(2.3 * p.x - .4 + .14 * T), 2.));
    return max(dTop, dBottom) - grow * .5;
  }
  if (u_form < 6.5) {
    // Prism: a tall triangle, apex near the top.
    return sdTriangle(p, vec2(-.05, .78), vec2(-1.45, -1.9), vec2(1.3, -1.9)) - .03 - grow;
  }
  // Gem: a wide faceted polygon, its ridge rising to a peak right of centre.
  vec2 gem[5] = vec2[](vec2(-.92, -1.4), vec2(-.92, -.12), vec2(.3, .6), vec2(.95, -.28), vec2(.95, -1.4));
  return sdPolygon(p, gem) - .02 - grow;
}

vec3 ramp(float t) {
  t = clamp(t, 0., 1.);
  float stops[${RAMP_STOPS}] = float[](0., .25, .45, .64, .82, 1.);
  vec3 col = u_ramp[0].rgb;
  for (int i = 1; i < ${RAMP_STOPS}; i++) {
    col = mix(col, u_ramp[i].rgb, smoothstep(stops[i - 1], stops[i], t));
  }
  return col;
}

void main() {
  vec2 p = v_objectUV * 2.;
  T = u_time;

  float angle = radians(u_light) + .35 * sin(T * .25);
  vec2 L = vec2(cos(angle), sin(angle));
  float rimLength = mix(.04, .3, u_rim);
  float depthLength = mix(.15, 1.2, u_depth);
  float glow = .55 + .7 * u_glow;
  float soft = .012 + .05 * u_rim;

  // A soft mask of the form, and the same mask moved towards the light: where the
  // form is but its moved copy isn't, the edge faces the light (an emboss).
  // The moved copies are blurred, so the lit band fades inwards rather than stopping.
  float d = form(p);
  float mask = smoothstep(soft, -soft, d);
  float nearRim = mask - smoothstep(rimLength * .9, -rimLength * .9, form(p + L * rimLength));
  float wideRim = smoothstep(soft * 4., -soft * 4., d) - smoothstep(rimLength * 2.5, -rimLength * 2.5, form(p + L * rimLength * 3.));
  // A narrow core right on the edge gives the white-hot line.
  float core = mask - smoothstep(rimLength * .2, -rimLength * .2, form(p + L * rimLength * .25));
  float body = mask * (.03 + .19 * exp(-max(-d, 0.) / depthLength));
  // The gem's facets: soft vertical bands of light through its body.
  if (u_form > 6.5) body *= .45 + 1.3 * pow(.5 + .5 * sin(p.x * 5.2 + .9), 2.);
  float haze = (1. - mask) * u_haze * (.05 + .22 * smoothstep(-1.6, 1.6, dot(p, L)));
  float t = body + haze + glow * (.8 * max(nearRim, 0.) + .35 * max(wideRim, 0.) + 1.2 * max(core, 0.));
  // Rolls the peaks off instead of clipping them to a flat band.
  vec3 col = ramp(1. - exp(-1.9 * t));

  // The chromatic fringe: just outside the lit rim, where a copy moved away from the light still covers.
  float band = rimLength * .45 + .015;
  float fringe = max(smoothstep(band * .6, -band * .6, form(p - L * band)) - smoothstep(soft * 2., -soft * 2., d), 0.);
  col = mix(col, u_fringe.rgb, clamp(fringe * u_fringeAmount * 1.4, 0., .85));

  col += 1. / 256. * (fract(sin(dot(.014 * gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453123) - .5);
  fragColor = vec4(col, 1.);
}
`

interface Lch {
  l: number
  c: number
  h: number
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))
const hueTurn = (a: number, b: number) => ((b - a + 540) % 360) - 180

/** The ramp, deep to hot, and the fringe colour, from the three theme colours
    (header bar, navigation items, selected item). Every stop is a darker or lighter
    value of one of them, plus one step through the hue between navigation and selected. */
export function glowRamp(colours: string[]): { ramp: string[]; fringe: string } {
  const [header, nav, selected] = colours.map(toLch)
  // A grey selected item falls back to the 5Mins amber; a grey navigation colour leans off the selected hue.
  const s = selected.c < NEUTRAL_CHROMA ? toLch(DEFAULT_THEME.light.selected) : selected
  const n: Lch = nav.c < NEUTRAL_CHROMA ? { l: nav.l, c: 0.12, h: (s.h + 320) % 360 } : nav
  // Light headers (light-mode themes) still give a near-black ground, in the header's hue when it has one.
  const deep: Lch = { l: 0.13, c: clamp(header.c, 0.02, 0.05), h: header.c < NEUTRAL_CHROMA ? n.h : header.h }
  const body: Lch = { l: 0.33, c: Math.max(n.c, 0.1), h: n.h }
  const mid: Lch = { l: clamp(n.l, 0.55, 0.68), c: Math.max(n.c, 0.12), h: n.h }
  const warm: Lch = { l: clamp(s.l, 0.72, 0.84), c: Math.max(s.c, 0.12), h: s.h }
  const blend: Lch = { l: (mid.l + warm.l) / 2, c: Math.max(mid.c, warm.c), h: (mid.h + hueTurn(mid.h, warm.h) / 2 + 360) % 360 }
  const hot: Lch = { l: 0.95, c: s.c * 0.35, h: s.h }
  const fringe: Lch = { l: 0.76, c: Math.max(n.c, 0.13), h: n.h }
  return { ramp: [deep, body, mid, blend, warm, hot].map(fromLch), fringe: fromLch(fringe) }
}

/** The uniforms for a recipe and its three theme colours. */
export function glowUniforms(recipe: GradientRecipe, colours: string[]) {
  const { ramp, fringe } = glowRamp(colours)
  return {
    u_ramp: ramp.map(getShaderColorFromString),
    u_fringe: getShaderColorFromString(fringe),
    u_form: GLOW_FORMS.indexOf(recipe.glowForm),
    u_thickness: recipe.glowThickness,
    u_rim: recipe.glowRim,
    u_glow: recipe.glowStrength,
    u_depth: recipe.glowDepth,
    u_fringeAmount: recipe.glowFringe,
    u_haze: recipe.glowHaze,
    u_light: recipe.glowLight,
  }
}
