import { getShaderColorFromString } from '@paper-design/shaders'
import type { GradientRecipe } from '@/pages/gradient-lab/recipe'
import { shade, toLch } from './brandPalette'

/* Offsets: a soft flowing gradient cut into a grid of blocks, each block showing the
   gradient from a slightly shifted place, after the "Offsets" presets (shaders.com Pro,
   `npx shaders install offsets-1`). How the reference is made:
   - A flowing gradient: soft colour pools drifting over the frame (FlowingGradient).
   - A grid distortion: the frame split into blocks (6 across), each sampling the
     gradient at its own offset, so hard edges appear where neighbours disagree; the
     offsets ease from one place to the next over time (GridDistortion).
   - Bars: horizontal strips nudged sideways a little (BarShift, 15%).
   - Fine grain laid over at 25% in overlay (BlueNoise).
   The colours are shades of the header bar alone (offsetsPools), so the gradient
   reads as the header's own surface; the other theme colours are left for the icon.
   Runs in Paper's ShaderMount like the light form. */

export const offsetsFragmentShader = `#version 300 es
precision highp float;

uniform float u_time;
uniform vec4 u_colors[5];
uniform float u_colorsCount;
uniform float u_grid;
uniform float u_shift;
uniform float u_bars;
uniform float u_barShift;
uniform float u_flow;
uniform float u_grain;

in vec2 v_objectUV;
out vec4 fragColor;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

vec2 hash2(vec2 p) {
  return vec2(hash(p), hash(p + 17.31)) * 2. - 1.;
}

// Soft pools of each colour drifting on slow loops, each fading out from its centre.
vec3 flow(vec2 uv, float t) {
  uv += u_flow * .18 * vec2(sin(uv.y * 3.1 + t * .7), cos(uv.x * 2.7 - t * .55));
  vec3 sum = vec3(0.);
  float total = 0.;
  for (int i = 0; i < 5; i++) {
    if (float(i) >= u_colorsCount) break;
    float k = float(i);
    vec2 centre = .5 + .5 * vec2(sin(t * (.21 + .07 * k) + k * 1.9), cos(t * (.17 + .05 * k) + k * 2.6));
    float d = length(uv - centre);
    float w = exp(-d * d * 22.) + .0002;
    sum += u_colors[i].rgb * w;
    total += w;
  }
  return sum / total;
}

// One block's offset: it eases from one random place to the next, each block on its own clock.
vec2 blockOffset(vec2 id, float t) {
  float clock = t * .35 + hash(id + 3.7) * 7.;
  float step = floor(clock);
  float ease = smoothstep(.55, 1., fract(clock));
  vec2 a = hash2(id + step * 1.37);
  vec2 b = hash2(id + (step + 1.) * 1.37);
  // Most blocks move a little, a few a lot, so the cut reads as uneven rectangles.
  float reach = mix(.25, 1., pow(hash(id + 9.1), 2.));
  return mix(a, b, ease) * reach;
}

void main() {
  float t = u_time;
  vec2 uv = v_objectUV + .5;

  // Columns are one block wide; down a column, blocks are one or two rows tall.
  vec2 cell = uv * u_grid;
  float col = floor(cell.x);
  float tall = 1. + step(.55, hash(vec2(col, 2.3)));
  vec2 id = vec2(col, floor((cell.y + hash(vec2(col, 5.1)) * tall) / tall));
  vec2 sampleUV = uv + blockOffset(id, t) * .14 * u_shift;

  // Bars across the frame, each nudged sideways.
  float bar = floor(uv.y * u_bars);
  float barStep = floor(t * .25 + hash(vec2(bar, 1.1)) * 4.);
  sampleUV.x += hash2(vec2(bar, barStep)).x * .2 * u_barShift;

  vec3 col3 = flow(sampleUV, t);

  // Grain in overlay blend.
  float n = .5 + (hash(gl_FragCoord.xy) - .5) * .6;
  vec3 over = mix(2. * col3 * n, 1. - 2. * (1. - col3) * (1. - n), step(.5, col3));
  col3 = mix(col3, over, u_grain);

  fragColor = vec4(col3, 1.);
}
`

/** Five pools in shades of the header bar: itself twice, then steps away from it, darker on a
    light header and lighter on a dark one, so the blocks always show. */
const SHADE_STEPS = [0, 0.05, 0, 0.1, 0.16]
const offsetsPools = ([header]: string[]) => {
  const towards = toLch(header).l > 0.5 ? -1 : 1
  return SHADE_STEPS.map((step) => shade(header, towards * step))
}

/** The uniforms for a recipe and its three theme colours. */
export function offsetsUniforms(recipe: GradientRecipe, colours: string[]) {
  const pools = offsetsPools(colours)
  return {
    u_colors: pools.map(getShaderColorFromString),
    u_colorsCount: pools.length,
    u_grid: recipe.offsetsGrid,
    u_shift: recipe.offsetsShift,
    u_bars: recipe.offsetsBars,
    u_barShift: recipe.offsetsBarShift,
    u_flow: recipe.offsetsFlow,
    u_grain: recipe.offsetsGrain,
  }
}
