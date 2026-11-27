---
name: 5mins-answer-charts
description: Answer charts, the assessment results charts on the admin Assessments tab and View Answers page; one tall bar per answer (correct Success, wrong Danger, neutral grey) with the % on a badge, image tiles, the correct / incorrect split with the correct answer for match, categorise, sequence and fill in the blanks, answered / not answered for open responses, and a question deck for lesson quizzes and situational tests. Use for any chart of how learners answered an assessment.
---

# Answer charts

Charts of how learners answered an assessment, one shape per question format.

**Code:** `import { OptionBars, ImageTiles, OutcomeBars, BlankSentence, OpenResponse, CorrectSplit, BarRow } from '@/components/AnswerCharts/AnswerCharts'`, `import MultiChart from '@/components/AnswerCharts/MultiChart'`, types from `@/components/AnswerCharts/answerChartTypes`. Import `@/components/AnswerCharts/AnswerCharts.css` once where the charts render.
**Figma:** no Library component. The screens live in the Course details page Admin file `7iHIcoz2GXfQQR2ytfoDKs`, section "Assessments" (`12059:18066`).
**Last verified:** 2026-11-27

## Usage

- **Intent:** show, per question, what share of learners picked each answer and which answer was correct.
- **Use when:** charting assessment results: the course Assessments tab grid cards (`AssessmentGrid`) and the chart at the top of View Answers (`AnswerStats`).
- **Don't use when:**
  - Showing someone's progress through content: use the Progress bar ([progress-bar.md](progress-bar.md)).
  - Showing headline numbers: use the Summary stat ([summary-stat.md](summary-stat.md)).
  - Listing each learner's answer: use the Table ([table.md](table.md)).
- **Do** pick the chart by format (see Variants); the page maps the assessment to it, the chart only draws.
- **Do** pass percentages already rounded (0-100). Shares are out of the learners who answered, or out of those given the question when a question bank draws different questions.
- **Do** sort poll options by share, highest first; keep scored options in the order the learner saw them.
- **Don't** colour anything but the correct (Success) and wrong (Danger) answers; polls and open responses stay neutral.
- **Don't** show a figure per pair, step or blank: scoring is all or nothing, so only the correct / incorrect split carries a number.
- **Canonical spec:** one bar per answer, 8px apart (12px on View Answers), Input-background track with 12px radius, the share filled from the left, label inside on the left, the % on a semibold badge at the right end, tick or cross before the label on scored bars.

## Figma to code

No Library component yet, so there are no Figma properties. The mapping is by question format.

| Question format | Component | Props | Notes |
|---|---|---|---|
| Multiple choice, select all, true or false | `OptionBars` | `rows: OptionRow[]` | `tone` `'correct'` / `'wrong'` per option |
| Poll | `OptionBars` | `rows` with `tone: 'plain'` | neutral bars, sorted by share |
| Image choice | `ImageTiles` | `tiles: { label, pct, correct, src? }[]` | 4:3 image beside each bar; Gallery icon when no `src` |
| Match the pairs, categorise, sequence | `OutcomeBars` | `score`, `answer: CorrectAnswer` | split, then the correct answer once |
| Fill in the blanks | `BlankSentence` | `score`, `parts` | split, then the sentence with each blank's answer |
| Short text, exercise (file) | `OpenResponse` | `q: { kind: 'open', responses, enrolled, ... }` | Answered / Not answered, out of enrolled |
| Lesson quiz, situational test | `MultiChart` | `a: MultiAssessment`, `showTitle`, `onQuestionChange` | one question at a time, `OptionBars` inside |

- **Figma only:** none.
- **Code only:** `BarRow` (the bar every chart is built from) and `CorrectSplit` (the two-bar split used by `OutcomeBars` and `BlankSentence`).

**Production:**
| Design system | `@web/ui` component | Props mapping | Known drift |
|---|---|---|---|
| Answer charts | none known | n/a | check before handoff |

## Anatomy

```
┌────────────────────────────────────────────────────────────┐
│█████████████████████ ✓ Wear gloves (correct answer)   [62%]│  BarRow
└────────────────────────────────────────────────────────────┘
 └ fill, share of width     └ icon + label                └ % badge
```

- **Bar (`.cl-barrow`):** flex row, padding 8px 12px, radius `--radius-sm`, track `--input-background`, content gap 12px, about 41px tall.
- **Fill:** absolute, width = share, same radius; grows from the left on arrival.
- **Icon:** `TickCircle` (correct) or `CloseCircle` (wrong), 20px Linear, `currentColor`. None on neutral bars.
- **Label:** Poppins Medium 14/1.5, `--text-primary`, truncates within the bar.
- **Value:** shared `Badge` with class `cl-pct`, padding 4px 8px, SemiBold, tabular numbers, `--page-background` fill; figures `--text-success` on a correct bar, `--text-secondary` otherwise.
- **Image tile (`.cl-tile`):** 4:3 image as tall as its bar, radius `--radius-s`, 12px before the bar; the correct image has a 2px inset `--success-500` ring.
- **Correct answer (`.cl-answer`):** 20px below the split. Pairs, category chips, steps and the sentence are bordered cards (`--border`, radius `--radius-sm`, padding 8px 12px) with a Bold `TickCircle` in `--success-500`; steps carry a numbered Success badge.
- **Question deck (`.cl-deck`):** "Question N of M" (`--text-tertiary`), the question as H4 (unless `showTitle` is off), the option bars; 32px round chevrons outside the bars (inside a 36px gutter under 1160px); numbered pages below, active page `--selected-tint` with `--secondary-600` text.

## Variants

| Bar | Fill (light) | Fill (dark) | Icon |
|---|---|---|---|
| Correct | `--success-300` | `--success-500`, label and icon `--neutral-25` | tick |
| Wrong | `--danger-200` | `--danger-400` | cross |
| Neutral (poll, open response) | `--border-elevated` | `--border-elevated` | none |

## States

| State | Light | Dark |
|---|---|---|
| Rest | fills above | fills above |
| Hover, correct | `--success-400` | `--success-600` |
| Hover, wrong | `--danger-300` | `--danger-500` |
| Hover, neutral | `--neutral-200` | `--neutral-500` |
| Arrival | fills grow from the left, 520ms on the house curve, 45ms apart per row (up to 270ms) | same |
| Deck chevron hover / disabled | `--cards-background-hover` / `--text-disabled` | same tokens |
| Deck page hover / active | `--input-background` / `--selected-tint` | same tokens |
| Focus-visible (chevrons, pages) | 2px `--focus-ring` outline, 2px offset | same |

The bars are not interactive; hover only lifts the fill one step. Reduced motion removes the arrival animation and every transition.

## Tokens

`var(--input-background)`, `var(--border)`, `var(--border-elevated)`, `var(--page-background)`, `var(--text-primary)`, `var(--text-secondary)`, `var(--text-tertiary)`, `var(--text-success)`, `var(--text-disabled)`, `var(--cards-background-hover)`, `var(--selected-tint)`, `var(--focus-ring)`, `var(--radius-sm)`, `var(--radius-s)`, `var(--radius-full)`, spacing `--space-xs` to `--space-xl`.

Raw palette, on purpose (each with a stylelint-disable reason): `--success-300/400/500/600`, `--danger-200/300/400/500`, `--neutral-200/500` (hover), `--neutral-25` (dark correct label), `--secondary-600` (active deck page). The fills step per mode, which no semantic token covers.

## Accessibility

- Every chart is a list (`ol`), one item per answer, so screen readers announce the count.
- Colour is never the only signal: scored bars carry a tick or cross, and the correct one adds visually hidden text "(correct answer)".
- The fill is `aria-hidden`; the % badge is the readable value.
- The correct answer block is a `section` labelled "Correct answer".
- Deck: `aria-roledescription="carousel"`, each card a "slide" labelled "Question N of M"; hidden cards are `inert`. Left and Right arrow keys step through questions; chevrons are labelled "Previous question" / "Next question"; the active page has `aria-current="step"`.

## Content

- Shares read "NN%", no space, whole numbers.
- Split labels: "Correct", "Incorrect". Open response labels: "Answered", "Not answered".
- Deck count: "Question 2 of 4", plus " · Answered by 18 learners" when a question bank gives each learner different questions.
- Option labels come verbatim from the question; image tiles without a label read "Image N".

## Examples

```tsx
import { OptionBars, OutcomeBars, OpenResponse } from '@/components/AnswerCharts/AnswerCharts'
import MultiChart from '@/components/AnswerCharts/MultiChart'
import '@/components/AnswerCharts/AnswerCharts.css'

// Multiple choice
<OptionBars rows={[
  { label: 'Wear gloves', pct: 62, tone: 'correct' },
  { label: 'Wash hands after', pct: 38, tone: 'wrong' },
]} />

// Sequence: split, then the right order
<OutcomeBars score={74} answer={{ kind: 'steps', steps: ['Stop', 'Assess', 'Report'] }} />

// Short text
<OpenResponse q={{ id: 'q9', kind: 'open', type: 'Short text', title: 'Why?', responses: 40, enrolled: 52 }} />

// Lesson quiz: the page titles itself with the question on show
<MultiChart a={quiz} showTitle={false} onQuestionChange={setQuestion} />
```

## Related

[progress-bar.md](progress-bar.md), [summary-stat.md](summary-stat.md), [table.md](table.md), [badges.md](badges.md), [motion.md](motion.md).
