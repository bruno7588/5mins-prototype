---
name: 5mins-gamification
description: Gamification asset libraries for 5Mins.ai — skill-level shield/medal illustrations (levels 1–5, Advanced/Expert/Master, enabled + disabled, 56/72px), the ten assessment/quiz-type illustrations (56px mobile / 80px desktop), and the skill-category illustration library. Use whenever a prototype shows learner progression - skill levels, learning paths, badges, level-up states, assessment or quiz cards - on skill pages, profile screens, cards, course outlines, or leaderboards.
---

# 5Mins.ai Gamification Elements

Asset libraries for learner progression UI. All are exact Figma exports — never redraw, recolor, or substitute them.

## Skill level illustrations

Source: Figma `Illustrations/ Learning path`, frame `9120:9437` (downloaded 2026-07-13). Assets in `src/assets/level-illustrations/` with a typed index.

Two families:

- **Numbered shields, levels 1–5** — colored shield with the level number. Level colors: 1 pink, 2 green, 3 cyan, 4 purple, 5 amber.
- **Tier medals: Advanced, Expert, Master** — circular star medals (Advanced/Master amber, Expert silver-purple).

Each exists in **4 variants**:

| Variant | Size | Artwork |
|---|---|---|
| small | 56px | number-only shield / plain medal |
| large | 72px | shield with "LEVEL n" banner / medal with ribbon |
| small + disabled | 56px | grayscale |
| large + disabled | 72px | grayscale |

Small and large are **different artwork**, not scaled copies — always pick by variant, never resize one into the other. Render at the native 56/72px.

```tsx
import { getLevelIllustration } from '@/assets/level-illustrations'

<img src={getLevelIllustration(3)} alt="Level 3" width={56} height={56} />
<img src={getLevelIllustration('master', { size: 'large' })} alt="Master level" width={72} height={72} />
<img src={getLevelIllustration(5, { disabled: true })} alt="" width={56} height={56} />
```

`SkillLevel` type: `1 | 2 | 3 | 4 | 5 | 'advanced' | 'expert' | 'master'`. Use the disabled variant for locked/not-yet-reached levels; pair with an accessible label when the level is meaningful, `alt=""` when purely decorative next to a text label.

## Progress illustrations

Source: Figma `Illustrations/ Progress`, frame `10157:9081` (downloaded 2026-07-13). Assets in `src/assets/progress-illustrations/`. Seven **40×40** stat icons for "My progress" surfaces (profile stats, progress summaries, quiz results): `streak`, `points`, `jewels`, `certificates`, plus the quiz-outcome trio `passed`, `nearly-there`, `not-passed`.

```tsx
import { getProgressIllustration } from '@/assets/progress-illustrations'

<img src={getProgressIllustration('streak')} alt="" width={40} height={40} />
```

Render at native 40px. Use the outcome trio only for quiz/assessment results, not as generic status icons (status uses badges — see `badges.md`).

## Assessment illustrations

Source: Figma `Illustrations/ Assessments`, frame `9120:8850` (classic six downloaded 2026-07-13, interactive four 2026-08-17). Assets in `src/assets/assessment-illustrations/` with a typed index. **Ten** assessment/quiz types, one artwork each, in two device variants — Mobile **56px** and Desktop **80px**.

| Key | Figma variant | Mobile / Desktop node | Artwork |
|---|---|---|---|
| `multiple-choice` | Multiple choice | `9120:8851` / `10978:11975` | amber lightbulb |
| `short-text` | Short text | `9120:8885` / `10978:12003` | pen on a scroll |
| `exercise` | Exercise | `10247:7546` / `10978:12375` | folder of documents |
| `situational-test` | Situational test | `9120:8879` / `10978:12393` | teal question mark |
| `fast-track` | Fast Track | `9120:9256` / `10978:12400` | rocket |
| `poll` | Poll | `9120:9290` / `10978:12427` | amber lightning bolt |
| `fill-blank` | Fill in the blank | `12086:6607` / `12086:7219` | red lines with blue gaps |
| `sequence` | Sequence | `12087:8357` / `12090:7286` | stacked purple bars |
| `categorize` | Categorize | `12090:6607` / `12090:7313` | blue shapes in two groups |
| `match-pairs` | Match the pairs | `12092:8499` / `12092:8573` | green and red arrows |

Mobile and Desktop are **different artwork**, not scaled copies — pick by device, never resize one into the other. The one sanctioned exception is the 48px admin outline row, which draws the desktop variant down.

| Surface | Variant | Rendered size |
|---|---|---|
| Mobile assessment list card | mobile | 56 |
| Web app course row | desktop | 80 |
| Admin outline row (Create/Edit Course) | desktop | 48 |

```tsx
import { getAssessmentIllustration, assessmentTypeFromLabel } from '@/assets/assessment-illustrations'

<img src={getAssessmentIllustration('sequence', 'desktop')} alt="" width={48} height={48} />

// Outline cards carry a display label, not a key — bridge it first.
// Labels may carry a summary after a middot ("Sequence · 3 steps").
const type = assessmentTypeFromLabel(item.metadata) // 'sequence' | … | null
```

Every artwork sits on transparent — never put a tinted tile, card, or colored square behind it. When the assessment type is already named in adjacent text (as it is on every card), the image is decorative: `alt=""`.

## Certificate illustrations

Source: Figma `Illustrations/Certificate`, frame `9120:9301` (downloaded 2026-07-13). Assets in `src/assets/certificate-illustrations/`. One certificate artwork in **four distinct sizes** — pick by context, render at native size, never scale one into another:

| Size | px | Context |
|---|---|---|
| xl | 240 | hero / certificate-earned celebration |
| l | 80 | desktop cards and rows |
| m | 56 | mobile rows |
| s | 20 | inline next to text |

```tsx
import { getCertificateIllustration } from '@/assets/certificate-illustrations'

<img src={getCertificateIllustration('xl')} alt="Certificate" width={240} height={240} />
```

## Gamification hero illustrations

Source: Figma `Illustrations/Gamification`, frame `11196:7607` (downloaded 2026-07-13). Assets in `src/assets/gamification-illustrations/`. Four **96×96** feature illustrations — `progress`, `certificate`, `quiz`, `learning-path` — for feature intros, onboarding moments, and celebration states. `getGamificationIllustration(type)`.

## Skill-category illustrations

The 100-skill multi-color illustration library (+ 8 "Skill Hugo" alternates) used on skill pages, skill/instructor cards, and role panels lives in `src/assets/skill-icons/` — see the "Skill Illustrations (gamification)" section of `iconography.md` for the lookup API (`getSkillIllustrationByName`).

## Related

- `calendar.md` — the streak illustration in the calendar day cells.
- `colors.md` — Gamification raw palette (do not use it to recolor these assets; it exists for surrounding UI accents).
- `badges.md` — status badges are NOT gamification elements; don't mix the two.
