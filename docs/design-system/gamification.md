---
name: 5mins-gamification
description: Gamification asset libraries for 5Mins.ai - skill-level shield/medal illustrations (levels 1-5, Advanced/Expert/Master, enabled + disabled, 56/72px), the ten assessment/quiz-type illustrations (56px mobile / 80px desktop), and the skill-category illustration library. Use whenever a prototype shows learner progression - skill levels, learning paths, badges, level-up states, assessment or quiz cards - on skill pages, profile screens, cards, course outlines, or leaderboards.
---

# Gamification elements

Asset libraries for learner progression UI. All are exact Figma exports: never redraw, recolour, or substitute them.

**Code:** no shared React component; typed asset indexes in `src/assets/` (`level-illustrations`, `progress-illustrations`, `assessment-illustrations`, `certificate-illustrations`, `gamification-illustrations`, `skill-icons`), rendered with `<img>`.
**Figma:** Library `EC26cSVe9KNTCWXvYovakw`, Gamification page. Learning path levels `9120:9437`; Progress `10157:9081`; Assessments dark `9120:8850` / light `12154:10371`; Certificate `9120:9301`; Gamification heroes `11196:7607`.
**Last verified:** 2026-08-17

## Usage

**Intent:** show learner progression (levels, stats, assessment types, certificates) with the exact Library artwork.

**Use when**
- A screen shows skill levels, learning paths, level-up states, progress stats, assessment or quiz cards, certificates, or a feature intro.

**Don't use when**
- Showing a status → badges ([doc](badges.md)); status badges are NOT gamification elements, don't mix the two.
- Showing a generic status icon → badges; the quiz-outcome trio is only for quiz/assessment results.

**Do**
- Pick the variant by size or device and render at native size.
- Use the disabled level variant for locked/not-yet-reached levels.
- Keep every artwork on a transparent background.

**Don't**
- Don't redraw, recolour, or substitute the artwork.
- Don't resize small into large, mobile into desktop, or one certificate size into another; they are different artwork, not scaled copies. The one sanctioned exception is the 48px admin outline row, which draws the desktop assessment variant down.
- Don't put a tinted tile, card, or coloured square behind an artwork.
- Don't use the Gamification raw palette (`colors.md`) to recolour these assets; it exists for surrounding UI accents.

## Figma to code

| Figma set | Figma property | Figma values | Code | Code values | Notes |
|---|---|---|---|---|---|
| Illustrations/ Learning path | Level | 1 / 2 / 3 / 4 / 5 / Advanced / Expert / Master | `getLevelIllustration(level)` | `SkillLevel`: `1 \| 2 \| 3 \| 4 \| 5 \| 'advanced' \| 'expert' \| 'master'` | |
| | Size | small / large | `options.size` | `'small'` (default) / `'large'` | 56px / 72px |
| | Disabled | false / true | `options.disabled` | `false` (default) / `true` | grayscale |
| Illustrations/ Progress | Type | Streak / Points / Jewels / Certificates / Passed / Nearly there / Not passed | `getProgressIllustration(type)` | `'streak'` / `'points'` / `'jewels'` / `'certificates'` / `'passed'` / `'nearly-there'` / `'not-passed'` | 40px |
| Illustrations/ Assessments | Type | see the assessment table below | `getAssessmentIllustration(type, device)` | `AssessmentType` keys | Figma has 11 Type values; code and this doc have 10 |
| | Device | Mobile / Desktop | `device` | `'mobile'` / `'desktop'` | 56px / 80px |
| Illustrations/Certificate | Size | XL / L / M / S | `getCertificateIllustration(size)` | `'xl'` / `'l'` / `'m'` / `'s'` | 240 / 80 / 56 / 20px |
| Illustrations/Gamification | Type | Progress / Certificate / Quiz / Learning Path | `getGamificationIllustration(type)` | `'progress'` / `'certificate'` / `'quiz'` / `'learning-path'` | 96px |

- **Figma only:** Learning path (`5514:8463`), Certificate instances (`5514:2390`), Ranking, leaderboard (`2613:26421`), Quiz/Options (`5504:24966`), Progress bar (`7046:25097`), Thumbnail type (`9537:7400`) have no code component; the 11th Assessments Type value has no code key. Their component properties: Learning path `Description` and `Progress` (text); Quiz/Options `Label` and `Explanation` (text) plus `State=Focus` (desktop, before submitting; `:focus-visible` when built).
- **Code only:** `assessmentTypeFromLabel(label)` bridges an outline card's display label to an `AssessmentType` key.

**Production:**

| Design system | `@web/ui` component | Props mapping | Known drift |
|---|---|---|---|
| Gamification assets | _to be mapped by engineering_ | | |

## Variants

### Skill level illustrations

Assets in `src/assets/level-illustrations/` with a typed index. Two families:

- **Numbered shields, levels 1-5:** coloured shield with the level number. Level colours: 1 pink, 2 green, 3 cyan, 4 purple, 5 amber.
- **Tier medals: Advanced, Expert, Master:** circular star medals (Advanced/Master amber, Expert silver-purple).

Each exists in **4 variants**:

| Variant | Size | Artwork |
|---|---|---|
| small | 56px | number-only shield / plain medal |
| large | 72px | shield with "LEVEL n" banner / medal with ribbon |
| small + disabled | 56px | grayscale |
| large + disabled | 72px | grayscale |

Small and large are **different artwork**, not scaled copies; always pick by variant, never resize one into the other. Render at the native 56/72px.

### Progress illustrations

Assets in `src/assets/progress-illustrations/`. Seven **40×40** stat icons for "My progress" surfaces (profile stats, progress summaries, quiz results): `streak`, `points`, `jewels`, `certificates`, plus the quiz-outcome trio `passed`, `nearly-there`, `not-passed`. Render at native 40px.

**Export them transparent.** Figma's SVG export carries the artboard out with the artwork: a 40×40 `#F5F5F5` rect, the full-bleed `#20222A` "Dark mode" section rect, and the purple dashed component-set marker. Clipped by the viewBox they read as a solid square behind the illustration. Strip all three after any re-export; the icons must sit on whatever surface hosts them.

### Assessment illustrations

Assets in `src/assets/assessment-illustrations/` with a typed index. **Ten** assessment/quiz types, one artwork each, in two device variants: Mobile **56px** and Desktop **80px**.

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

Mobile and Desktop are **different artwork**, not scaled copies; pick by device, never resize one into the other. The one sanctioned exception is the 48px admin outline row, which draws the desktop variant down.

| Surface | Variant | Rendered size |
|---|---|---|
| Mobile assessment list card | mobile | 56 |
| Web app course row | desktop | 80 |
| Admin outline row (Create/Edit Course) | desktop | 48 |

Every artwork sits on transparent; never put a tinted tile, card, or coloured square behind it.

### Certificate illustrations

Assets in `src/assets/certificate-illustrations/`. One certificate artwork in **four distinct sizes**; pick by context, render at native size, never scale one into another:

| Size | px | Context |
|---|---|---|
| xl | 240 | hero / certificate-earned celebration |
| l | 80 | desktop cards and rows |
| m | 56 | mobile rows |
| s | 20 | inline next to text |

### Gamification hero illustrations

Assets in `src/assets/gamification-illustrations/`. Four **96×96** feature illustrations, `progress`, `certificate`, `quiz`, `learning-path`, for feature intros, onboarding moments, and celebration states. `getGamificationIllustration(type)`.

### Skill-category illustrations

The 100-skill multi-colour illustration library (+ 8 "Skill Hugo" alternates) used on skill pages, skill/instructor cards, and role panels lives in `src/assets/skill-icons/`; see the "Skill Illustrations (gamification)" section of `iconography.md` for the lookup API (`getSkillIllustrationByName`).

## States

| State | Applies to | Artwork |
|---|---|---|
| Enabled | skill levels | full colour |
| Disabled | skill levels (locked / not-yet-reached) | grayscale variant via `{ disabled: true }` |

The other libraries are static artwork with no states and no focus treatment; they are never interactive on their own.

## Accessibility

- Skill levels: pair with an accessible label when the level is meaningful (`alt="Level 3"`), `alt=""` when purely decorative next to a text label.
- Assessment illustrations: when the assessment type is already named in adjacent text (as it is on every card), the image is decorative: `alt=""`.

## Examples

```tsx
import { getLevelIllustration } from '@/assets/level-illustrations'

<img src={getLevelIllustration(3)} alt="Level 3" width={56} height={56} />
<img src={getLevelIllustration('master', { size: 'large' })} alt="Master level" width={72} height={72} />
<img src={getLevelIllustration(5, { disabled: true })} alt="" width={56} height={56} />
```

```tsx
import { getProgressIllustration } from '@/assets/progress-illustrations'

<img src={getProgressIllustration('streak')} alt="" width={40} height={40} />
```

```tsx
import { getAssessmentIllustration, assessmentTypeFromLabel } from '@/assets/assessment-illustrations'

<img src={getAssessmentIllustration('sequence', 'desktop')} alt="" width={48} height={48} />

// Outline cards carry a display label, not a key; bridge it first.
// Labels may carry a summary after a middot ("Sequence · 3 steps").
const type = assessmentTypeFromLabel(item.metadata) // 'sequence' | … | null
```

```tsx
import { getCertificateIllustration } from '@/assets/certificate-illustrations'

<img src={getCertificateIllustration('xl')} alt="Certificate" width={240} height={240} />
```

## Related

- `calendar.md` - the streak illustration in the calendar day cells.
- `colors.md` - Gamification raw palette (do not use it to recolour these assets; it exists for surrounding UI accents).
- `badges.md` - status badges are NOT gamification elements; don't mix the two.
- `iconography.md` - skill-category illustrations lookup.
- `program-certificate.md` - the program certificate card that uses the certificate medallion.
