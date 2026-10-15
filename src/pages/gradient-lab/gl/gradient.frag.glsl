#version 300 es
precision highp float;
precision highp int;

/* Gradient Lab fragment shader. Pipeline: UV transforms -> source colour
   (palette blend in OKLab, blurred photo, or both) -> sRGB -> grain -> dither.
   All time-dependent values arrive as uniforms already made periodic on the
   CPU (see renderer.ts), so a looping frame at t = 0 and t = T is identical. */

uniform vec2 u_resolution;   // drawing-buffer pixels
uniform float u_dpr;
uniform vec2 u_aspectScale;  // (min(1, w/h), min(1, h/w)): the square texture covers the frame
uniform int u_baseTurns;     // clockwise quarter turns of the base texture, 0-3

// Palette: colours in OKLab, positions in 0-1 (y down), already wandered.
uniform int u_count;
uniform vec3 u_oklab[8];
uniform vec2 u_points[8];
uniform float u_weights[8];
uniform float u_softness;

// Source
uniform int u_mode;          // 0 palette, 1 photo, 2 mix
uniform float u_mix;
uniform sampler2D u_photo;   // SRGB8_ALPHA8, so samples come back linear
uniform float u_lod;
uniform float u_texel;       // 1 / photo size
uniform float u_abstract;    // 0 = the photo as it is, 1 = the full gradient
uniform float u_maxLod;      // top mip level of the photo

// UV pipeline
uniform float u_scale;
uniform float u_rotation;    // radians
uniform vec2 u_offset;
uniform float u_swirl;       // static swirl + animated swirl, combined
uniform float u_distortion;
uniform float u_phase;       // loop phase in radians
uniform float u_warp;
uniform int u_warpOctaves;
uniform vec4 u_warpCoord;    // xy: seed offset, zw: time coordinate (a circle when looping)
uniform vec2 u_flow;

// Grain
uniform int u_noiseType;     // 0 white, 1 blue, 2 value, 3 simplex, 4 fbm, 5 worley, 6 paper, 7 dither, 8 halftone
uniform float u_noiseSize;
uniform float u_noiseIntensity;
uniform int u_blend;         // 0 soft-light, 1 overlay, 2 add, 3 multiply
uniform float u_noiseColour;
uniform float u_noiseLuma;
uniform float u_grainSeed;
uniform float u_grainDistort; // 0-1: grain roughens the edges between colours

out vec4 outColor;

/* ---------- hashing ---------- */

uvec3 pcg3d(uvec3 v) {
  v = v * 1664525u + 1013904223u;
  v.x += v.y * v.z; v.y += v.z * v.x; v.z += v.x * v.y;
  v ^= v >> 16u;
  v.x += v.y * v.z; v.y += v.z * v.x; v.z += v.x * v.y;
  return v;
}

vec3 hash33(vec3 p) {
  return vec3(pcg3d(uvec3(ivec3(floor(p))))) * (1.0 / 4294967295.0);
}

/* ---------- simplex noise (Ashima Arts / Stefan Gustavson, MIT) ---------- */

vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
float mod289(float x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 10.0) * x); }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 10.0) * x); }
float permute(float x) { return mod289(((x * 34.0) + 10.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float taylorInvSqrt(float r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

vec4 grad4(float j, vec4 ip) {
  const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);
  vec4 p, s;
  p.xyz = floor(fract(vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;
  p.w = 1.5 - dot(abs(p.xyz), ones.xyz);
  s = vec4(lessThan(p, vec4(0.0)));
  p.xyz = p.xyz + (s.xyz * 2.0 - 1.0) * s.www;
  return p;
}

float snoise(vec4 v) {
  const vec4 C = vec4(0.138196601125011, 0.276393202250021, 0.414589803375032, -0.447213595499958);
  vec4 i = floor(v + dot(v, vec4(0.309016994374947451)));
  vec4 x0 = v - i + dot(i, C.xxxx);
  vec4 i0;
  vec3 isX = step(x0.yzw, x0.xxx);
  vec3 isYZ = step(x0.zww, x0.yyz);
  i0.x = isX.x + isX.y + isX.z;
  i0.yzw = 1.0 - isX;
  i0.y += isYZ.x + isYZ.y;
  i0.zw += 1.0 - isYZ.xy;
  i0.z += isYZ.z;
  i0.w += 1.0 - isYZ.z;
  vec4 i3 = clamp(i0, 0.0, 1.0);
  vec4 i2 = clamp(i0 - 1.0, 0.0, 1.0);
  vec4 i1 = clamp(i0 - 2.0, 0.0, 1.0);
  vec4 x1 = x0 - i1 + C.xxxx;
  vec4 x2 = x0 - i2 + C.yyyy;
  vec4 x3 = x0 - i3 + C.zzzz;
  vec4 x4 = x0 + C.wwww;
  i = mod289(i);
  float j0 = permute(permute(permute(permute(i.w) + i.z) + i.y) + i.x);
  vec4 j1 = permute(permute(permute(permute(
      i.w + vec4(i1.w, i2.w, i3.w, 1.0))
    + i.z + vec4(i1.z, i2.z, i3.z, 1.0))
    + i.y + vec4(i1.y, i2.y, i3.y, 1.0))
    + i.x + vec4(i1.x, i2.x, i3.x, 1.0));
  vec4 ip = vec4(1.0 / 294.0, 1.0 / 49.0, 1.0 / 7.0, 0.0);
  vec4 p0 = grad4(j0, ip);
  vec4 p1 = grad4(j1.x, ip);
  vec4 p2 = grad4(j1.y, ip);
  vec4 p3 = grad4(j1.z, ip);
  vec4 p4 = grad4(j1.w, ip);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  p4 *= taylorInvSqrt(dot(p4, p4));
  vec3 m0 = max(0.6 - vec3(dot(x0, x0), dot(x1, x1), dot(x2, x2)), 0.0);
  vec2 m1 = max(0.6 - vec2(dot(x3, x3), dot(x4, x4)), 0.0);
  m0 = m0 * m0;
  m1 = m1 * m1;
  return 49.0 * (dot(m0 * m0, vec3(dot(p0, x0), dot(p1, x1), dot(p2, x2)))
    + dot(m1 * m1, vec2(dot(p3, x3), dot(p4, x4))));
}

/* 4D fbm for the domain warp: xy is space, zw is the time circle. Octave
   count is a uniform but the loop bound is a constant, so it stays cheap. */
float fbm4(vec4 p) {
  float sum = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 5; i++) {
    if (i >= u_warpOctaves) break;
    sum += amp * snoise(p);
    p.xy = p.xy * 2.03 + 17.0;
    amp *= 0.5;
  }
  return sum;
}

/* ---------- colour ---------- */

vec3 oklabToLinear(vec3 c) {
  float l = c.x + 0.3963377774 * c.y + 0.2158037573 * c.z;
  float m = c.x - 0.1055613458 * c.y - 0.0638541728 * c.z;
  float s = c.x - 0.0894841775 * c.y - 1.2914855480 * c.z;
  l = l * l * l; m = m * m * m; s = s * s * s;
  return vec3(
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s);
}

vec3 linearToSrgb(vec3 c) {
  c = clamp(c, 0.0, 1.0);
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
}

vec3 paletteColour(vec2 p) {
  vec3 lab = vec3(0.0);
  float total = 0.0;
  for (int i = 0; i < 8; i++) {
    if (i >= u_count) break;
    vec2 d = p - (u_points[i] - 0.5);
    float w = u_weights[i] / pow(dot(d, d) + 1e-4, u_softness * 0.5);
    lab += w * u_oklab[i];
    total += w;
  }
  return oklabToLinear(lab / max(total, 1e-20));
}

/* Mip sample plus four offset taps a mip-texel apart: hides the blocky look of
   high mip levels without a real multi-pass blur. */
vec3 photoColour(vec2 p) {
  vec2 uv = p + 0.5;
  float r = exp2(u_lod) * u_texel * 0.6;
  vec3 c = textureLod(u_photo, uv, u_lod).rgb * 0.36;
  c += textureLod(u_photo, uv + vec2(r, 0.35 * r), u_lod).rgb * 0.16;
  c += textureLod(u_photo, uv + vec2(-0.35 * r, r), u_lod).rgb * 0.16;
  c += textureLod(u_photo, uv + vec2(-r, -0.35 * r), u_lod).rgb * 0.16;
  c += textureLod(u_photo, uv + vec2(0.35 * r, -r), u_lod).rgb * 0.16;
  return c;
}

/* ---------- grain ---------- */

float valueNoise(vec2 q, float seed) {
  vec2 i = floor(q);
  vec2 f = q - i;
  f = f * f * (3.0 - 2.0 * f);
  float a = hash33(vec3(i, seed)).x;
  float b = hash33(vec3(i + vec2(1.0, 0.0), seed)).x;
  float c = hash33(vec3(i + vec2(0.0, 1.0), seed)).x;
  float d = hash33(vec3(i + vec2(1.0, 1.0), seed)).x;
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float worley(vec2 q, float seed) {
  vec2 i = floor(q);
  vec2 f = q - i;
  float best = 8.0;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 o = vec2(float(x), float(y));
      vec2 pt = o + hash33(vec3(i + o, seed)).xy;
      best = min(best, dot(pt - f, pt - f));
    }
  }
  return sqrt(best);
}

/* Paper: fine roughness flecks plus curly fibres. Adapted from Paper Shaders'
   paper-texture (Apache-2.0, github.com/paper-design/shaders), on hashed
   value noise instead of its noise texture. */
float paperGrain(vec2 q, float seed) {
  // Roughness: two stretched multi-octave fields; their squared difference makes sharp flecks.
  vec2 u = q / vec2(2.0, 4.0);
  vec2 r = vec2(0.0);
  float amp = 0.5, norm = 0.0, f = 1.0;
  for (int i = 0; i < 4; i++) {
    float s = seed + float(i) * 2.0;
    r += amp * vec2(valueNoise(u * f, s), valueNoise(u * f + 17.0, s + 1.0));
    norm += amp;
    amp *= 0.8;
    f *= 2.1;
  }
  r /= norm;
  float dx = 0.5 + r.x - r.y;
  float rough = 3.0 * dx * dx - 0.7;

  // Fibre: the gradient length of rotated octaves traces thin, curly threads.
  vec2 grad = vec2(0.0);
  float sc = 1.0;
  amp = 1.0;
  f = 0.12;
  for (int i = 0; i < 5; i++) {
    float an = float(i) * 0.8;
    float rc = cos(an), rs = sin(an);
    vec2 v = mat2(rc, rs, -rs, rc) * q * f;
    float s = seed + 20.0 + float(i);
    float n0 = valueNoise(v, s);
    vec2 d = vec2(valueNoise(v + vec2(0.05, 0.0), s) - n0, valueNoise(v + vec2(0.0, 0.05), s) - n0) / 0.05;
    grad += amp * sc * d;
    sc *= 1.7;
    amp *= 0.5;
    f *= 1.7;
  }
  float fibre = clamp(0.333 * length(grad), 0.0, 1.0);
  return rough * 0.45 + (fibre - 0.35) * 0.6;
}

/* One zero-centred grain channel, roughly in -0.5..0.5. `ch` decorrelates channels. */
float grain(vec2 q, float ch) {
  float seed = u_grainSeed * 3.0 + ch;
  vec2 shift = hash33(vec3(seed, 7.0, 3.0)).xy * 512.0;
  if (u_noiseType == 0) return hash33(vec3(floor(q), seed)).x - 0.5;
  if (u_noiseType == 1) {
    // Interleaved gradient noise: cheap and blue-noise-like (no low-frequency clumps).
    vec2 c = floor(q) + shift;
    return fract(52.9829189 * fract(dot(c, vec2(0.06711056, 0.00583715)))) - 0.5;
  }
  if (u_noiseType == 2) return (valueNoise(q, seed) - 0.5) * 1.6;
  if (u_noiseType == 3) return snoise(q + shift) * 0.6;
  if (u_noiseType == 4) {
    vec2 s = q + shift;
    float n = snoise(s) * 0.5 + snoise(s * 2.0 + 11.0) * 0.25 + snoise(s * 4.0 + 23.0) * 0.125;
    return n * 0.7;
  }
  if (u_noiseType == 6) return paperGrain(q + shift, seed);
  return (worley(q, seed) - 0.42) * 1.4;
}

/* Bayer thresholds, static per pixel so they never flicker. */
float bayer2(vec2 a) { a = floor(a); return fract(a.x / 2.0 + a.y * a.y * 0.75); }
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
float bayer8(vec2 a) { return bayer4(0.5 * a) * 0.25 + bayer2(a); }

/* Dither: ordered 8x8 Bayer down to a few levels per channel; more intensity,
   fewer levels. After Paper Shaders' image-dithering (Apache-2.0). */
vec3 ditherColour(vec3 c, vec2 q) {
  float levels = floor(mix(12.0, 2.0, u_noiseIntensity)) - 1.0;
  vec2 shift = floor(hash33(vec3(u_grainSeed, 5.0, 1.0)).xy * 8.0);
  return floor(c * levels + bayer8(q + shift)) / levels;
}

/* Halftone: a 45-degree dot screen; dot area follows darkness, ink and paper
   keep the colour. After Paper Shaders' halftone-dots (Apache-2.0). */
vec3 halftoneColour(vec3 c) {
  vec2 h = mat2(0.7071, 0.7071, -0.7071, 0.7071) * gl_FragCoord.xy / max(u_noiseSize * u_dpr * 6.0, 1e-3);
  float d = length(fract(h) - 0.5);
  float luma = dot(c, vec3(0.2126, 0.7152, 0.0722));
  float r = sqrt(clamp(1.0 - luma, 0.0, 1.0)) * 0.72;
  float aa = max(fwidth(d), 1e-4);
  float ink = 1.0 - smoothstep(r - aa, r + aa, d);
  vec3 paper = min(c * 1.3 + 0.08, 1.0);
  return mix(c, mix(paper, c * 0.45, ink), u_noiseIntensity);
}

vec3 applyGrain(vec3 c) {
  if (u_noiseIntensity <= 0.0) return c;
  vec2 q = gl_FragCoord.xy / max(u_noiseSize * u_dpr, 1e-3);
  // Whole-pixel cells, or uneven 1- and 2-pixel cells show up as stripes.
  if (u_noiseType == 7) return ditherColour(c, floor(gl_FragCoord.xy / max(floor(u_noiseSize * u_dpr + 0.5), 1.0)));
  if (u_noiseType == 8) return halftoneColour(c);
  float mono = grain(q, 0.0);
  vec3 g = vec3(mono);
  if (u_noiseColour > 0.001) {
    g = mix(g, vec3(mono, grain(q, 1.0), grain(q, 2.0)), u_noiseColour);
  }
  float luma = dot(c, vec3(0.2126, 0.7152, 0.0722));
  float k = u_noiseIntensity * mix(1.0, 4.0 * luma * (1.0 - luma), u_noiseLuma);
  vec3 b = clamp(0.5 + g * k * 2.0, 0.0, 1.0);
  if (u_blend == 0) return (1.0 - 2.0 * b) * c * c + 2.0 * b * c;             // soft light (Pegtop)
  if (u_blend == 1) return mix(2.0 * c * b, 1.0 - 2.0 * (1.0 - c) * (1.0 - b), step(0.5, c)); // overlay
  if (u_blend == 2) return c + g * k;                                         // add
  return c * (1.0 + g * k * 2.0);                                             // multiply
}

/* Clockwise quarter turns of what is sampled. y is down, so sampling at
   (y, -x) shows the texture turned clockwise. */
vec2 turn(vec2 p) {
  if (u_baseTurns == 1) return vec2(p.y, -p.x);
  if (u_baseTurns == 2) return -p;
  if (u_baseTurns == 3) return vec2(-p.y, p.x);
  return p;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  uv.y = 1.0 - uv.y;
  vec2 p = (uv - 0.5) * u_aspectScale / u_scale;

  float cr = cos(u_rotation), sr = sin(u_rotation);
  p = mat2(cr, sr, -sr, cr) * p;
  p -= u_offset * 0.5;

  /* The photo as it is: framed (zoom, rotation, focal point, quarter turns) but
     not swirled, warped or moved. It softens as abstraction rises. */
  vec2 framed = turn(p);
  vec3 raw = textureLod(u_photo, framed + 0.5, u_abstract * u_maxLod * 0.7).rgb;

  float a = u_swirl * length(p) * 6.0;
  float ca = cos(a), sa = sin(a);
  p = mat2(ca, sa, -sa, ca) * p;

  p += u_distortion * 0.07 * vec2(sin(p.y * 8.0 + u_phase), cos(p.x * 7.0 - u_phase));

  if (u_warp > 0.0) {
    vec2 w = vec2(
      fbm4(vec4(p * 1.6 + u_warpCoord.xy, u_warpCoord.zw)),
      fbm4(vec4(p * 1.6 + u_warpCoord.xy + vec2(5.2, 1.3), u_warpCoord.zw + vec2(3.7, 9.1))));
    p += u_warp * 0.35 * w;
  }

  p -= u_flow;

  /* Turn what is sampled (palette points and photo), not the motion: the warp
     and flow above look the same whichever way the texture faces. y is down,
     so sampling at (y, -x) shows the texture turned clockwise. */
  p = turn(p);

  /* Grain distortion: a per-grain jitter of where the gradient is sampled, so
     the edges between colours turn sandy (Paper Shaders' grain mixer, Apache-2.0). */
  if (u_grainDistort > 0.0) {
    vec2 gq = gl_FragCoord.xy / max(u_noiseSize * u_dpr, 1e-3);
    p += (hash33(vec3(floor(gq), u_grainSeed * 3.0 + 11.0)).xy - 0.5) * u_grainDistort * 0.35;
  }

  vec3 col;
  if (u_mode == 0) col = paletteColour(p);
  else if (u_mode == 1) col = photoColour(p);
  else col = mix(paletteColour(p), photoColour(p), u_mix);

  /* Abstraction: the photo melts into the gradient (u_abstract is 1 without a photo). */
  col = mix(raw, col, smoothstep(0.0, 1.0, u_abstract));

  vec3 srgb = applyGrain(linearToSrgb(col));
  srgb += (bayer4(gl_FragCoord.xy) - 0.5) / 255.0;
  outColor = vec4(clamp(srgb, 0.0, 1.0), 1.0);
}
