# Gradient Lab renderer

`renderer.ts` draws one full-screen triangle (`fullscreen.vert.glsl`) with `gradient.frag.glsl`. Every time-dependent value is computed on the CPU in `render()`, so the shader is stateless and a loop only needs the phase to wrap.

## Uniforms

- Frame: `u_resolution` (buffer px), `u_dpr`, `u_aspectScale` (`(min(1, w/h), min(1, h/w))`: the square base texture covers any frame like `object-fit: cover`, so 1:1 is unchanged), `u_baseTurns` (0-3 clockwise quarter turns of what is sampled, applied after warp and flow so motion is unaffected).
- Palette: `u_count`, `u_oklab[8]` (colours in OKLab, blended there to avoid muddy greys), `u_points[8]` (0-1, y down, wander already applied), `u_weights[8]` (sqrt of share x count), `u_softness` (inverse-distance power).
- Source: `u_mode` (0 palette, 1 photo, 2 mix), `u_mix`, `u_photo` (SRGB8_ALPHA8, mipmapped), `u_lod` (blur x max mip), `u_texel`.
- UV: `u_scale`, `u_rotation` (radians), `u_offset`, `u_swirl` (static plus animated), `u_distortion`, `u_phase` (loop phase in radians), `u_warp`, `u_warpOctaves`, `u_warpCoord` (xy seed offset, zw time point on a circle when looping), `u_flow`, `u_liquid` (0-1, a second-order "warp of a warp" that drags colour into streaks; 0 skips it, so presets saved before it existed render unchanged).
- Grain: `u_noiseType`, `u_noiseSize` (CSS px, divided by dpr in the shader), `u_noiseIntensity`, `u_blend`, `u_noiseColour`, `u_noiseLuma`, `u_grainSeed`.

## Seamless loops

With `motion.loop`, time wraps to `loopSeconds` and the speed is rounded to a whole number of cycles per loop. Point paths, swirl, distortion and flow use sin/cos of integer multiples of the phase, and the warp noise (the plain warp and both layers of the liquid warp) is 4D with its time axes on a circle. Animated grain repeats on a whole number of frames per loop.

## Adding a noise type

1. Add the name to `NoiseType` in `../types.ts`.
2. Give it the next number in `NOISE_TYPES` in `renderer.ts`.
3. Add a branch to `grain()` in `gradient.frag.glsl` that returns zero-centred noise, roughly -0.5 to 0.5, using `seed` (and `shift`) so it follows `u_grainSeed`.
