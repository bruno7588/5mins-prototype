---
name: 5mins-progress-bar
description: Progress bar, a thin 8-segment track that shows how much of a lesson, course, program or skill is done; Primary or Selected (amber) fill, success green when complete, Page/Card/Media track, 2/4/6/8px heights, optional percentage. Use for content progress on cards, table cells, headers and the mobile app.
---

# Progress bar

A thin 8-segment track showing how much of a lesson, course, program or skill is done.

**Code:** `import ProgressBar from '@/components/ProgressBar/ProgressBar'`
**Figma:** Library `EC26cSVe9KNTCWXvYovakw`, `7046:25097`, page "Slider / Progress bar" (one component set; light and dark come from the variable modes on the parent frame)
**Last verified:** 2026-11-27

## Usage

- **Intent:** at a glance, how far someone is through a piece of learning.
- **Use when:** a lesson, course, program or skill has a percent complete: on a card thumbnail, in a table cell, in a page or sheet header, on a banner.
- **Don't use when:**
  - Something is loading or generating with no real percent: use the AI working card ([ai-working-card.md](ai-working-card.md)) or a button Loading state ([buttons.md](buttons.md)).
  - A file is uploading: the File uploader has its own circular progress ([file-uploader.md](file-uploader.md)).
  - Showing steps of a wizard: use the Stepper ([stepper.md](stepper.md)).
  - Showing video playback: the scenario player has its own 2px playback line (`ScenarioMedia`).
- **Do** pass the real percent; the bar snaps it to the nearest eighth.
- **Do** pass `complete` when completion is a state (lesson completed, course passed), not only a number.
- **Do** give it a `label` when no visible text names it.
- **Don't** build segments by hand or restyle the fill; add a prop to the component if a new case appears.
- **Don't** use the Selected (amber) tone outside course progress.
- **Canonical spec:** 8 equal segments, no gap, full radius on the whole bar, empty segments `--border`, filled `--primary-600`, all segments `--success-500` when complete.

## Figma to code

| Figma property | Figma values | React prop | Prop values | Notes |
|---|---|---|---|---|
| Progress | 0% / 25% / 50% / 75% / 100% | `value` | `0`-`100` | Figma shows quarter steps (0, 2, 4, 6, 8 segments); code takes any percent and fills the nearest of 8 segments. Pick the nearest step in Figma |
| Progress | 100% | `complete` | `true` | defaults to `value >= 100`; every segment success green, whatever the Tone |
| Tone | Primary / Selected | `tone` | `'primary'` (default) / `'selected'` | Selected is amber, for course progress on course cards only |
| Surface | Page / Card / Media | `surface` | `'page'` (default) / `'card'` / `'media'` | the empty-track colour, by what the bar sits on |
| Show value | false / true | `showValue` | `false` (default) / `true` | "NN%" beside the bar |
| Value (text) | "25%" | n/a | | code writes the percent itself |
| Instance height | 2 / 4 / 6 / 8 | `height` | `2` / `4` / `6` / `8` (default) | resize the instance; segments fill the height |
| Instance width | any | `width` | px number, or omit to fill | 72 in table cells |

- **Figma only:** none.
- **Code only:** `doneValue` (two-tone course bar on the mobile Course screen: finished steps drawn `--selected` before the primary in-progress fill; Figma `13760:212226`), `label` (accessible name), `className`.

**Production:**
| Design system | `@web/ui` component | Props mapping | Known drift |
|---|---|---|---|
| Progress bar | none known | n/a | production draws its own bars; check before handoff |

## Anatomy

```
[seg][seg][seg][seg][seg][seg][seg][seg]  25%
 └── 8 equal segments, no gap ──┘       └ value (optional), 8px gap
```

- **Track:** flex row, `border-radius: var(--radius-full)`, `overflow: hidden`, height from `height`.
- **Segment:** `flex: 1`, full height. Filled segments are the first `round(value / 100 * 8)`.
- **Value:** Poppins Regular 14/1.5 `--text-primary`, tabular numbers, min width 33px so a column of bars lines up.

## Variants

| Tone | Fill | Use |
|---|---|---|
| Primary (default) | `--primary-600` | lessons, skills, programs, people, tables, headers |
| Selected | `--selected` | course progress on course cards (desktop and mobile) |

| Surface | Empty segments | Use |
|---|---|---|
| Page (default) | `--border` | page ground, drawers, modals, table rows, thumbnail edges |
| Card | `--border-elevated` | inside a card or bottom sheet (`--border` matches the card fill in dark mode) |
| Media | `--neutral-25` at 50% | over a photo or banner image |

## Sizes

| Height | Where |
|---|---|
| 2px | flush along the bottom edge of a card thumbnail or mobile card |
| 4px | compact list rows (program outline, lesson rows) |
| 6px | banners and mobile program header |
| 8px (default) | table cells, page and sheet headers, skill cards |

Width: fills its row by default. Table cells use a fixed 72px (`width={72}`); My Team uses 96px; program outline rows 120px.

## States

| State | Segments | Tokens (same in light and dark) |
|---|---|---|
| Empty (0%) | all empty | `--border` / `--border-elevated` / media track |
| In progress | first n filled | `--primary-600` or `--selected` |
| Two-tone (code only) | done, then in progress, then empty | `--selected`, `--primary-600` |
| Complete (100%) | all filled | `--success-500` |

Static: no hover, focus or disabled state. Where content is locked, hide the bar rather than greying it.

## Tokens

`var(--border)`, `var(--border-elevated)`, `var(--neutral-25)` (media track), `var(--primary-600)`, `var(--selected)`, `var(--success-500)`, `var(--radius-full)`, `var(--space-s)`, `var(--text-primary)`, `var(--font-size-md)`.

## Accessibility

- Renders `role="progressbar"` with `aria-valuenow` (0-100), `aria-valuemin="0"`, `aria-valuemax="100"`.
- Pass `label` ("Course progress", "<Skill> points") unless visible text right beside it names it. Screen readers get the exact percent, not the rounded eighth.
- Not focusable. Colour is never the only signal for complete: pair it with the percentage or a status (badge, tick) where completion matters.

## Content

- The value reads "NN%" with no space. Other labels ("3/5 steps", "120/200 pts") are page text placed beside the bar, not part of the component.

## Examples

```tsx
import ProgressBar from '@/components/ProgressBar/ProgressBar'

// Table cell: 72px, percent beside it
<ProgressBar value={row.progress} width={72} showValue label={`${row.name} progress`} />

// Course card thumbnail: 2px along the bottom edge, amber
<ProgressBar value={course.progress} tone="selected" height={2} className="ws-course-card__progress" />

// Mobile lesson card inside a sheet, completion as a state
<ProgressBar value={lesson.progress} complete={lesson.completed} surface="card" height={2} />

// Banner over an image
<ProgressBar value={42} surface="media" height={6} label="Weekly goal" />
```

## Related

[cards.md](cards.md) (where bars sit on cards), [table.md](table.md) (progress cell), [stepper.md](stepper.md), [ai-working-card.md](ai-working-card.md), [file-uploader.md](file-uploader.md), [gamification.md](gamification.md).
