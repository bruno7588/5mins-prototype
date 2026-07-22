# Quiz Lab — Motion & Sound

Engineer reference for every animation and sound in the quiz formats.
Sources of truth: **sounds** → `quizSound.ts`; **animations** → `quiz-lab.css`.

## Sounds

Synthesised live by [cuelume](https://www.npmjs.com/package/cuelume) — no audio
files. Silent until the first user gesture (browser resumes the AudioContext).
Action→sound map is in `quizSound.ts` (`CUE_SOUND`); call site is `cue(name)`.

| Cue         | Sound   | Fires when                                                       |
| ----------- | ------- | --------------------------------------------------------------- |
| `select`    | tick    | Tap an item to highlight it (Categorize, Match Pairs)           |
| `place`     | toggle  | Commit an item into a gap / bucket / pair / slot                |
| `remove`    | droplet | Return a placed item to the bank/pool                           |
| `correct`   | success | **Check** → every item correct                                  |
| `incorrect` | error   | **Check** → one or more items wrong                             |
| `continue`  | page    | **Continue** → reset for the next attempt                       |

`correct`/`incorrect` is one cue for the whole check (based on *all* items),
not per item.

## Animations

All CSS, in `quiz-lab.css`. No JS animation libraries are used in quiz-lab.

| Name              | Trigger                                   | Motion                                              | Timing               |
| ----------------- | ----------------------------------------- | --------------------------------------------------- | -------------------- |
| Tap sink          | `:active` on any token/chip               | Sinks `translateY(3px)`, bottom lip flattens        | 120ms transition     |
| Placement nudge   | Categorize: **first** item selected¹      | `ArrowDown` centered on **each** bucket, bobs ±3px  | `ql-nudge` 1s, loop  |
| Wrong shake       | Item graded **incorrect**                 | Horizontal shake, decaying ±6→2px                   | `ql-shake` 0.45s, 1× |
| Right bounce      | Item graded **correct**                   | Vertical bounce up to −8px                          | `ql-bounce` 0.5s, 1× |
| State transitions | Hover / select / place / return           | Cross-fade of background, border, box-shadow, color | 120–150ms ease       |

**Scope**
- Shake/bounce apply to all graded item types: `.ql-token`, `.ql-pair`,
  `.ql-blank` (their `--correct` / `--incorrect` modifiers).
- Placement nudge is **Categorize only**.

¹ One-time teaching cue: shows until the first item is dropped, then stays
hidden for the rest of the attempt (resets on Continue).

**Reduced motion** — under `prefers-reduced-motion: reduce`, every keyframe
animation and transition above is disabled. The nudge arrow still renders,
centered and static.

## How feedback pairs up on Check

- **All correct** → `success` sound + each item bounces.
- **Any wrong** → `error` sound + wrong items shake (correct ones still bounce).
