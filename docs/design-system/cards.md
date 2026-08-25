---
name: 5mins-card-components
description: Self-contained build specs for the seven official 5Mins.ai content card components - Lesson, Assessment, Course, Skill, Category, Folder, and Instructor cards (desktop + mobile variants). Use this skill whenever a 5Mins prototype, mockup, or admin/learner UI needs to show a lesson, assessment, course, skill, category, or content folder as a card or tile; whenever the user references content cards, content tiles, library items, or course/lesson lists in the 5Mins admin panel or learner web app; and whenever building or modifying any 5Mins screen that displays these content types. Trigger this even if the word "card" is not used, as long as content items need to be shown visually. Build cards from the specs in this file; do not invent ad-hoc card layouts.
---

# 5Mins Card Components

5Mins.ai has seven official content card components. When a prototype shows a lesson, assessment, course, skill, category, folder, or instructor, build the card from the spec in this file. Do not invent a card layout. Matching the real component keeps prototypes accurate and on-brand, so stakeholders react to the new work and not to layout drift.

This skill is fully self-contained. Every dimension, token, and structure below is the real spec, so no Figma connection is needed to build a card. The Figma source is listed only for anyone who wants to re-verify later (file `EC26cSVe9KNTCWXvYovakw`, "Library" — verified against the light/dark nodes on 2026-07-03: Lesson `11916:9353`/`5144:14181`, Assessment `11916:9875`/`10242:2782`, Course `11916:10292`/`5132:5756`, Skill `11828:5184`/`11802:3704`, Category `10574:3913`/`10176:1806`, Folder `10175:3183`/`10175:3106`, Instructor `9926:2477`/`5149:27386`; Mobile variants verified 2026-07-13 against the dark nodes).

## When to use this skill

Use it before building any card or tile that represents a piece of 5Mins content:

- A screen that lists or grids lessons, assessments, courses, or skills.
- An admin panel page (library, course builder, content picker) showing content items.
- A learner web app screen (home, course page, search results) showing content items.
- Any change to an existing 5Mins screen where these items appear.

For the surrounding admin shell (header, tabs, sidebars, modals), pair this with `5mins-prototype-builder`, which owns the chrome.

## Scope: desktop + mobile (where documented)

Specs below are the desktop variants unless a section is explicitly marked Mobile. The mobile app prototype (phone-frame wrapper, ~390px) uses the Mobile variants — documented for Lesson, Assessment, Course, Category, and Instructor (Figma-verified 2026-07-13). Each has a shared component under `src/components/mobile/` — use those, don't hand-roll. The Skill card has no device split; the Folder card is admin-only and has no mobile variant. **No card has a Mobile hover state** (touch surface) — mobile states are Enabled/Completed/Disabled only.

## Picking the right card

| Content item | Card | Variants to choose from |
|---|---|---|
| A single video micro-lesson | Lesson card | grid tile, admin list row, web app list row, mobile list card |
| A quiz or assessment | Assessment card | admin list row, web app list row, mobile list card |
| A course or playlist (group of lessons) | Course card | desktop card (New / Due date / Hover), mobile card |
| A skill tag | Skill card | one chip, with or without a remove control |
| A category of courses (learner browse) | Category card | desktop card, mobile card; New / Hover (desktop) / Disabled |
| A content folder (admin library grouping) | Folder card | 0/1/2/3+ course stack + "New Folder" creator tile |
| An instructor (photo, bio, skills) | Instructor card | desktop card, mobile card |

For Lesson and Assessment cards, pick the variant by surface: an **admin panel** screen uses the admin list row; a **learner web app** screen uses the web app row; a **grid or library browse** layout uses the Lesson grid tile. When unsure, read the surrounding chrome: dark admin chrome means admin.

## Design tokens

The cards use the standard 5Mins token system. If the prototype already defines these (via `5mins-colors` or the prototype-builder scaffold), reuse them. Otherwise the hex values below apply so this skill works standalone. These are the only theme values; build cards in the light theme.

```css
:root {
  /* Card surfaces */
  --cards-background:        #FFFFFF;  /* card fill (Neutral-0) */
  --cards-background-hover:  #EFF0F2;  /* card fill on hover (Neutral-50) */
  --border:                  #DFE1E6;  /* card border, empty progress (Neutral-100) */
  --border-hover:            #9EA4B3;  /* border on hover (Neutral-300) */

  /* Text */
  --text-primary:    #20222A;  /* titles (Neutral-800) */
  --text-secondary:  #454C5E;  /* metadata, captions (Neutral-500) */
  --text-disabled:   #9EA4B3;  /* disabled card text (Neutral-300, light mode) */

  /* Accents */
  --primary-600:   #00AFC4;  /* lesson progress fill */
  --success-500:   #18A957;  /* completed progress + completed state */
  --selected:      #EDA30D;  /* course progress fill (Secondary-600 in light mode) */
  --text-warning:  #E88206;  /* course due-date text (Warning-600 in light mode) */
  --badge-new:     #E95C7B;  /* "New" badge fill (--danger-400) */
  --type-badge-bg: rgba(69, 76, 94, 0.16);  /* content-type pill background (--input-background) */
}
```

Shared values used by every card:

- **Font:** Poppins. Title = Bold 700. Metadata = Regular 400. Pills = Medium 500.
- **Type scale:** H4 = 16px / line-height 1.5. H5 = 14px / 1.5. Paragraph M = 14px / 1.5. Paragraph S = 12px / 1.2.
- **Radius:** cards use 12px. Inner thumbnails use 8px.
- **Card shadow (Shadow S):** `box-shadow: var(--shadow-s);` — see `layout.md` for the shadow scale.
- **Spacing tokens:** XS 4px, S 8px, SM 12px, M 16px, L 24px, ML 20px, XXL 40px.

---

## Lesson card

A single video micro-lesson. Three desktop variants plus a mobile list card. Source: `Card/Lessons`, node `11608:3985`.

### Lesson grid tile (170 x 230)

Use in grid or library browse layouts.

Anatomy, top to bottom:

- **Thumbnail area** fills the top, flexible height. A content-type tag sits flush in the top-left corner: a square tag, `--border` background, 4px padding, a 20px play-circle icon, bottom-right corner rounded 8px. A duration badge sits in the top-right at 6px inset: `rgba(15,16,20,0.5)` background, 6px / 4px padding, radius 4px, white text Poppins Regular 10px (for example `3m 45s`).
- **Progress bar** sits flush at the bottom of the thumbnail: 2px tall, full width, 8 equal segments, radius 20px on the ends. Filled segments use `--primary-600`; empty use `--border`. A completed lesson uses `--success-500` for all segments.
- **Info block** below the thumbnail: 16px padding, 12px gap, column. Title is Poppins Bold 14px, `--text-primary`, clamped to 3 lines (height 63px). Instructor line is Poppins Regular 12px, `--text-secondary`.

```html
<article class="lesson-grid">
  <div class="lesson-grid__thumb" style="background-image:url(...)">
    <span class="content-tag"><!-- 20px play-circle icon --></span>
    <span class="duration-badge">3m 45s</span>
    <div class="progress-bar progress-bar--8">
      <i class="on"></i><i class="on"></i><i class="on"></i><i class="on"></i>
      <i></i><i></i><i></i><i></i>
    </div>
  </div>
  <div class="lesson-grid__info">
    <h3 class="card-title">The importance of Authentic Stories and How to Tell</h3>
    <p class="card-meta">Instructor name</p>
  </div>
</article>
```

```css
.lesson-grid {
  width: 170px; height: 230px;
  display: flex; flex-direction: column;
  background: var(--cards-background);
  border-radius: 12px; overflow: hidden;
  box-shadow: var(--shadow-s);
}
.lesson-grid:hover { background: var(--cards-background-hover); }
.lesson-grid__thumb {
  position: relative; flex: 1 0 0;
  background-size: cover; background-position: center;
}
.content-tag {
  position: absolute; top: 0; left: 0;
  display: flex; padding: 4px;
  background: var(--border); border-bottom-right-radius: 8px;
}
.duration-badge {
  position: absolute; top: 6px; right: 6px;
  padding: 4px 6px; border-radius: 4px;
  background: rgba(15,16,20,0.5);
  font: 400 10px/1 Poppins; color: #fff;
}
.progress-bar {
  position: absolute; left: 0; bottom: 0;
  display: flex; width: 100%; height: 2px;
  border-radius: 20px; overflow: hidden;
}
.progress-bar i { flex: 1 0 0; background: var(--border); }
.progress-bar i.on { background: var(--primary-600); }
.lesson-grid__info { display: flex; flex-direction: column; gap: 12px; padding: 16px; }
.card-title {
  margin: 0; font: 700 14px/1.5 Poppins; color: var(--text-primary);
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
}
.card-meta { margin: 0; font: 400 12px/1.2 Poppins; color: var(--text-secondary); }
```

### Lesson admin list row (900 x 74)

Use in admin panel lists. Source variant nodes: `11608:4100` (default), `11608:4107` (hover).

Layout is a horizontal row: 12px padding, 12px gap, radius 12px, card background and shadow.

- **Thumbnail** 48 x 48, radius 8px, with the same corner play-circle tag.
- **Info** fills the row, 4px gap, column. Title Poppins Bold 16px `--text-primary`, single line, ellipsis. Metadata Poppins Regular 14px `--text-secondary`, format `Lesson - Instructor name - 4min`.
- **Content-type pill** on the right: `--type-badge-bg` background, 8px / 4px padding, radius 40px, label `Lesson` Poppins Medium 12px `--text-secondary`.

### Lesson web app list row (900 x 112)

Use in learner web app lists. Source variant nodes: `11608:4148` (default), `11608:4156` (hover), plus Quiz Pending and Completed variants from `11608:4164` onward.

Horizontal row: 16px padding, 16px gap, items centered, radius 12px, card background and shadow.

- **Thumbnail** 80 x 80, radius 8px, corner play-circle tag.
- **Info** fills the row, 8px gap, column. Title Poppins Bold 16px `--text-primary`, up to 2 lines. Metadata row with 24px gap: the `Lesson - Instructor name - 4min` line in Poppins Regular 14px `--text-secondary`, followed by a 96 x 4px progress bar (same segmented style as the grid tile, radius 20px).
- A **completed** lesson swaps the progress bar for a 20px success tick icon. A lesson with an attached quiz adds a small-outlined button on the right (12px Bold label, 8px/16px padding, radius 8px): `Take Quiz` — border+text `--button-warning-background` with a 16px danger icon; `Retake Quiz` — border+text `--primary-button-background` (quiz pending) or `--text-disabled` (already passed).

### Lesson mobile list card (343 x auto)

Use in the mobile app prototype (phone-frame). Figma-verified 2026-07-13 against the Mobile list variants of `Card/Lessons` in dark node `5144:14181` (base `5908:21918`, quiz pending `11306:6798`, completed `11608:3841`, completed + retake `11608:3863`, quiz completed `9126:28239`, disabled `9122:7860`). There is **no mobile grid tile** — mobile always uses this list card. Mobile has **no hover state** (touch surface); the only states are Enabled, Completed, and Disabled.

Implemented as the shared component `src/components/mobile/LessonCard` — use it, don't hand-roll.

Container: 343px wide in Figma (375 viewport − 16px side margins; in code, fill the parent's width), column layout, `--cards-background`, radius **8px** (smaller than the desktop 12px), overflow hidden, Shadow S.

Anatomy, top to bottom:

- **Content row**: 12px padding, 12px gap, items top-aligned.
  - **Thumbnail** 56 x 56, radius 4px. Content-type tag flush top-left: `--border` background, 4px padding, bottom-right corner rounded 8px, **14px** play-circle icon (Bold).
  - **Info column** fills the row, 4px gap. Title Poppins Bold 14px/1.5 `--text-primary`, wraps freely (no clamp in Figma). Metadata Poppins Regular 12px/1.2 `--text-secondary`, single line with ellipsis, format `Lesson · Instructor name · 4min`.
- **Progress bar** flush at the very bottom of the card: 2px tall, full width, 8 equal segments, radius 20px ends. Filled `--primary-600`, empty `--border`; completed lesson uses `--success-500` for all segments.

Quiz variants (info column gap grows to 12px: header block keeps its 4px gap, then the button below):

- **Take Quiz** (quiz pending, lesson not completed): small outlined button — 1px border + text `--button-warning-background`, Poppins Bold 12px/1.4, 8px/16px padding, radius 8px, 4px gap, trailing 16px danger icon (Linear, warning color).
- **Retake Quiz** (lesson completed, quiz pending): same button, border + text `--primary-button-background`, no icon.
- **Retake Quiz** (lesson completed, quiz already passed): same button, border + text `--text-disabled`, no icon.
- **No quiz attached**: no button — plain title + metadata (with the success progress bar when completed).

Disabled: thumbnail desaturated (`mix-blend-mode: luminosity`), all text `--text-disabled`, a 20px lock icon (Bold) right-aligned in the content row, **no progress bar**.

### Lesson states

- **Hover:** card background switches to `--cards-background-hover`; in list rows the title shifts to `--text-button-hover` (cyan).
- **Disabled:** thumbnail desaturated (`filter: grayscale(1)` or `mix-blend-mode: luminosity`); all text uses `--text-disabled`; a lock icon may replace interactive affordances.
- **Completed:** progress fill uses `--success-500`.

---

## Assessment card

A quiz or assessment item. Three devices — admin, web app, mobile — each with its own row height. Source: `Card/Assessments`, node `10242:2782` (Library file `EC26cSVe9KNTCWXvYovakw`), re-verified 2026-08-18.

The variant matrix is `Device × Disabled × State × Completed`, and it is deliberately sparse: admin has enabled and hover only, web app carries all six (enabled / hover, each × disabled and × completed), mobile has no hover and no disabled+completed combination.

Assessment cards use a built-in illustration in place of a thumbnail. The official illustrations are in `src/assets/assessment-illustrations/` (Figma `Illustrations/ Assessments` `9120:8850`): ten types — Multiple choice, Short text, Exercise, Situational test, Fast Track, Poll, Fill in the blank, Sequence, Categorize, Match the pairs — each as distinct Mobile (56px) and Desktop (80px) artwork. Use `getAssessmentIllustration(type, device)`; scale the desktop one down for the 48px admin row. Keep the size and placement exact. Full set and node refs: `gamification.md` → Assessment illustrations.

### Assessment admin list row (900 x 73)

Use in admin panel lists. Source variant nodes: `10867:5413` (enabled), `11054:9903` (hover).

Horizontal row: **12px padding all round**, 12px gap, items at top, radius 12px, card background and shadow.

- **Illustration** 48 x 48 on the left.
- **Info** fills the row, 4px gap, column. Title Poppins Bold 16px/1.5 `--text-primary`, single line, ellipsis. Under it the assessment type on its own line: `Type of assessment`, Poppins Regular 14px/1.5 `--text-secondary`. **Not prefixed with "Assessment ·"** — the pill on the right already says that.
- **Edit + badge cluster** on the right, top-aligned with the illustration, 8px gap:
  - 16px edit icon (`vuesax/linear/edit-2`) centred in a 22 x 22 hit box, `--text-secondary`.
  - Content-type pill: `--type-badge-bg` background, 8px / 4px padding, radius 40px, label `Assessment` Poppins Medium 12px `--text-secondary`.

```html
<article class="assessment-row assessment-row--admin">
  <div class="assessment-illustration"><!-- 48px assessment illustration --></div>
  <div class="card-info">
    <h3 class="card-title card-title--1line">50 free Tools and resources that everyone should know</h3>
    <span class="card-meta">Type of assessment</span>
  </div>
  <div class="assessment-row__actions">
    <button class="icon-edit" type="button" aria-label="Edit assessment">
      <!-- 16px edit-2 icon -->
    </button>
    <span class="type-pill">Assessment</span>
  </div>
</article>
```

```css
.assessment-row {
  display: flex; width: 900px; align-items: flex-start;
  background: var(--cards-background); border-radius: 12px; overflow: hidden;
  box-shadow: var(--shadow-s);
}
.assessment-row--admin { gap: 12px; padding: 12px; }
.assessment-illustration { flex: none; width: 48px; height: 48px; }
.card-info { display: flex; flex: 1 0 0; flex-direction: column; gap: 4px; min-width: 0; }
.card-title--1line { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.assessment-row__actions { display: flex; flex: none; align-items: center; gap: 8px; }
.icon-edit {
  display: flex; align-items: center; justify-content: center;
  width: 22px; height: 22px; padding: 0; border: none; background: transparent;
  border-radius: var(--radius-full); color: var(--text-secondary); cursor: pointer;
}
.type-pill {
  flex: none; padding: 4px 8px; border-radius: 40px;
  background: var(--type-badge-bg);
  font: 500 12px/1.2 Poppins; color: var(--text-secondary);
}
```

### Assessment web app list row (900 x 112)

Use in learner web app lists. Source variant nodes: `11052:9148` (enabled), `10242:3208` (hover), `10242:3246` (disabled), `10242:3289` (disabled + hover), `10242:3407` (completed), `10242:3469` (completed + hover).

Horizontal row: **16px padding all round**, 16px gap, items centred, radius 12px, card background and shadow.

- **Illustration** 80 x 80 on the left.
- **Info** fills the row, 8px gap, column. Title Poppins Bold 16px/1.5 `--text-primary`. Under it `Type of assessment`, Poppins Regular 14px/1.5 `--text-secondary` — the type alone, same as the admin row.
- No content-type pill on the web app variant.
- **Right slot**, one element at a time, vertically centred:
  - **Disabled** → 24px lock (`vuesax/bold/lock`) `--text-disabled`, 24px in from the right edge.
  - **Completed** → a **Review** button, 84 x 37, 16px in from the right edge.
  - **Enabled** → nothing; the info column takes the width.

**Completed** also adds a 20px success tick (`vuesax/bold/tick-circle`, `--success-500`) after the type, on an 8px gap — the metadata becomes a row rather than a lone line.

**Disabled** desaturates the illustration (`mix-blend-mode: luminosity`) and drops both title and type to `--text-disabled`. It combines with hover: the disabled row still lightens, since the card stays clickable enough to explain itself.

The Review button is outlined with no fill — 1px border and label both `--primary-button-background`, going to `--text-button-hover` on the row's hover variant. Its box is 8px / 16px padding with a **14px/1.5 Bold** label, which lands at 37px tall: between the DS Small (33px) and Medium (41px) rungs in `buttons.md`. Figma is the source of truth here, so build it at 37px, but flag it if the button ladder is ever reconciled. (The mobile card's Review button is a true DS Small — 12px/1.4 label, 33px.)

### Assessment mobile list card (344 x auto)

Use in the mobile app prototype. Figma-verified 2026-08-18 against the Mobile app variants of `Card/Assessments` in dark node `10242:2782` (enabled `10242:2877`, disabled `10867:5445`, completed `10867:5489`). No hover state; no disabled+completed combo. Implemented as the shared component `src/components/mobile/AssessmentCard`.

Container: 344px in Figma (fill the parent in code), `--cards-background`, radius 12px, **12px padding**, horizontal row with **8px gap**, items vertically centered (top-aligned in the completed variant).

- **Illustration** 56 x 56 (desktop admin row uses 48, web app 80) — the mobile-device artwork from `src/assets/assessment-illustrations/`, picked by assessment type (the component's `illustrationType` prop; defaults to multiple choice).
- **Info column** fills the row, 4px gap. Title Poppins Bold 14px/1.5 `--text-primary`, wraps freely (two lines in the completed variant). Below it `Type of assessment`, Poppins Regular 12px/1.2 `--text-secondary`, single line, nowrap — the type alone, as on the other two devices.
- **Disabled**: illustration desaturated (`mix-blend-mode: luminosity`), all text `--text-disabled`, trailing **20px** lock icon (Bold; web app uses 24px).
- **Completed** (card grows to 131px): info column gap becomes 12px — header (title + metadata, 4px gap) with a **16px** success tick (`vuesax/bold/tick-circle`, `--success-500`) appended to the metadata row on an 8px gap, then a **Review** button below: 77 x 33, outlined with no fill, 1px border and label both `--primary-button-background`, Poppins Bold 12px/1.4, 8px/16px padding, radius 8px — a true DS Small.

### Assessment states

- **Hover:** card background switches to `--cards-background-hover`. Admin and web app only — mobile has no hover variant. It combines with every other state: a disabled row still lightens, and a completed row lightens *and* takes its Review button to `--text-button-hover`.
- **Disabled:** illustration desaturated (`mix-blend-mode: luminosity`), title and type both `--text-disabled`, and a bold lock in the trailing slot — 24px on web app, 20px on mobile. Admin has no disabled variant.
- **Completed:** a bold success tick in `--success-500` after the type — 20px on web app, 16px on mobile — plus a **Review** button. Web app puts it in the trailing slot; mobile stacks it under the metadata, which is why that card is the only one that changes height. Admin has no completed variant: the row is a management view, not a learner's.
- **Metadata is the type alone** on all three devices — `Type of assessment`, never `Assessment · Type of assessment`. Only the admin row names the content type, and it does so in the pill.

---

## Course card

A course or playlist, that is a group of lessons. One desktop card, 300px wide, roughly 297px tall. Source: `Card/Courses`, node `11312:3479`. Variant nodes: `11312:3534` (base), `11312:3576` (new + due date), `11312:3592` (hover).

Anatomy, top to bottom:

- **Image area** 300 x 140, top corners rounded 12px. A 2px segmented progress bar sits flush at the bottom of the image (8 segments, radius 20px ends). Course progress fill is `--selected` (gold), not cyan; empty segments are `--border`.
- **Body** 24px padding, 16px gap, column, bottom corners rounded 12px. Title Poppins Bold 16px `--text-primary`, clamped to 3 lines (height 72px). Below it a duration row, 8px gap: a 16px play-circle icon plus `17 lessons`, then a 16px clock icon plus `20 min`, both in Poppins Regular 14px `--text-secondary`.

```html
<article class="course-card">
  <div class="course-card__image" style="background-image:url(...)">
    <span class="badge-new">New</span>            <!-- only when New -->
    <span class="badge-due">Due on Aug 20</span>  <!-- only when Due date -->
    <div class="progress-bar progress-bar--8 progress-bar--course">
      <i class="on"></i><i class="on"></i><i class="on"></i>
      <i></i><i></i><i></i><i></i><i></i>
    </div>
  </div>
  <div class="course-card__body">
    <h3 class="card-title card-title--3line">Inside the Product-led Playbook of Winning Brands</h3>
    <div class="course-card__duration">
      <span class="meta-item"><i class="icon-play"></i>17 lessons</span>
      <span class="meta-item"><i class="icon-clock"></i>20 min</span>
    </div>
  </div>
</article>
```

```css
.course-card {
  width: 300px; display: flex; flex-direction: column;
  background: var(--cards-background); border-radius: 12px;
  box-shadow: var(--shadow-s);
}
.course-card:hover { background: var(--cards-background-hover); }
.course-card__image {
  position: relative; width: 300px; height: 140px;
  border-radius: 12px 12px 0 0; background-size: cover; background-position: center;
}
.progress-bar--course i.on { background: var(--selected); }   /* gold, not cyan */
.badge-new {
  position: absolute; top: 10px; left: 10px;
  padding: 4px 8px; border-radius: 20px;
  background: var(--badge-new);
  font: 500 12px/1.2 Poppins; color: #fff;
}
.badge-due {
  position: absolute; top: 10px; right: 10px;
  padding: 6px 12px; border-radius: 40px;
  background: var(--cards-background);
  font: 500 14px/1.2 Poppins; color: var(--text-warning);
}
.course-card__body {
  display: flex; flex-direction: column; gap: 16px; padding: 24px;
  border-radius: 0 0 12px 12px;
}
.card-title--3line {
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
}
.course-card__duration { display: flex; gap: 8px; align-items: center; }
.meta-item {
  display: flex; gap: 4px; align-items: center;
  font: 400 14px/1.5 Poppins; color: var(--text-secondary);
}
.meta-item i { width: 16px; height: 16px; }
```

### Course variants

- **New:** adds the rose `New` pill in the top-left of the image. Use for recently added courses.
- **Due date:** adds the white due-date pill in the top-right, text in `--text-warning`. Use when a course has a compliance deadline.
- New and Due date can both appear at once.
- **Hover:** card background switches to `--cards-background-hover`.

### Course mobile card (272 x 248)

Use in the mobile app prototype. Figma-verified 2026-07-13 against the Mobile variants of `Card/Courses` in dark node `5132:5756` (base `5132:5757`, due `10276:13190`, new+due `10276:13220`, new `10276:13316`). Mobile has State=Default only — no hover, no completed/disabled variants. Implemented as the shared component `src/components/mobile/CourseCard`.

Same anatomy as desktop, scaled down. Container: **272px** wide (fixed — mobile course cards sit in horizontal scrollers), column, `--cards-background`, radius 12px.

- **Image area** 272 x **120** (desktop 300 x 140), top corners rounded 12px, with the 2px 8-segment progress bar flush at the bottom (fill `--selected` gold, empty `--border`). `New` badge top-left at 10px inset (same tokens as desktop: `--badge-new` fill, 4px/8px padding, radius 20px, Medium 12px/1.2 white). Due-date pill top-right at 10px inset: `--cards-background` fill, 6px/12px padding, radius 40px — text drops to Poppins **Regular 12px/1.2** `--text-warning` (desktop uses Medium 14px).
- **Body** **16px padding, 12px gap** (desktop 24px/16px). Title Poppins Bold **14px**/1.5 `--text-primary`, clamped to 3 lines (height 63px). Duration row 8px gap, items 4px icon gap: **14px** play-circle icon + `17 lessons`, 14px clock icon + `20 min`, Poppins Regular **12px/1.2** `--text-secondary`.

---

## Skill card

A skill tag, shown as a compact chip. One component, no device split, roughly 40px tall. Source: `Card/skill`, node `9577:3697`.

Anatomy, left to right: a 1px `--border` outline, transparent fill, 12px horizontal / 8px vertical padding, 8px gap, radius 12px, items centered.

- **Illustration** 20 x 20 on the left.
- **Label** the skill name, Poppins Regular 14px `--text-secondary`.
- **Remove control** a 20px close icon (Ionicons `IoCloseOutline`) on the right, present only in the removable variant.

```html
<span class="skill-chip">
  <i class="skill-chip__icon"><!-- 24px skill illustration --></i>
  <span class="skill-chip__label">Pricing Strategy Automation</span>
  <button class="skill-chip__remove" aria-label="Remove skill"><!-- 20px close icon --></button>
</span>
```

```css
.skill-chip {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 8px 12px; border: 1px solid var(--border); border-radius: 12px;
  background: transparent;
}
.skill-chip:hover { border-color: var(--border-hover); background: var(--page-background-hover); }
.skill-chip__icon { width: 20px; height: 20px; flex: none; }
.skill-chip__label { font: 400 14px/1.5 Poppins; color: var(--text-secondary); }
.skill-chip__remove { display: inline-flex; width: 20px; height: 20px; border: 0; background: 0; cursor: pointer; }
.skill-chip[aria-disabled="true"] .skill-chip__label { color: var(--text-disabled); }
.skill-chip[aria-disabled="true"] .skill-chip__icon  { mix-blend-mode: luminosity; }
```

### Skill variants

- **Remove:** set the variant with the close icon when the chip appears in an editable context, for example a skill picker or a tag editor. Omit the close icon in read-only contexts.
- **Hover:** border switches to `--border-hover` **and** the chip fills with `--page-background-hover`.
- **Disabled:** label in `--text-disabled`, illustration desaturated (`mix-blend-mode: luminosity`), non-interactive, no remove control.

Source variant nodes (light): `11828:5185` (enabled), `11828:5188` (hover), `11828:5191` (removable), `11828:5199` (disabled).

---

## Category card

A category of courses in the learner browse experience. Desktop card 300px wide, ~273px tall; mobile card 272px wide (see below). Source: `Card/ Category`, light `10574:3913`, dark `10176:1806`.

Anatomy, top to bottom (16px gap between thumbnail area and info):

- **Thumbnail stack:** a blurred "glow" copy of the category image fills the full 300 x 204 area (`filter: blur(16px)`, 32% opacity, radius 12px) with the sharp 240 x 140 image (radius 12px) centered on top — the card has **no surface fill**; the glow is the card.
- **Info** below: 8px gap. Title Poppins Bold 16px `--text-primary`, single line, ellipsis. Metadata row, 16px gap, two items in Poppins Regular 14px `--text-secondary`, each with a 4px icon gap: a 20px collection-play icon + `12 courses`, and a 16px play-circle icon + `24 lessons`.
- **"New Courses" badge** (New variant): overlaps the card's top edge — absolute, top −11px, left 30px; `--badge-new` (`--danger-400`) fill, 6px / 8px padding, radius 40px, label Poppins Medium 12px `--neutral-25`.

```html
<article class="category-card">
  <div class="category-card__thumb">
    <img class="category-card__glow"  src="..." alt="" />
    <img class="category-card__image" src="..." alt="" />
    <span class="badge-new badge-new--category">New Courses</span> <!-- New only -->
  </div>
  <div class="category-card__info">
    <h3 class="card-title card-title--1line">Category name</h3>
    <div class="category-card__meta">
      <span class="meta-item"><i class="icon-collection"></i>12 courses</span>
      <span class="meta-item"><i class="icon-play"></i>24 lessons</span>
    </div>
  </div>
</article>
```

```css
.category-card { position: relative; width: 300px; display: flex; flex-direction: column; gap: 16px; }
.category-card__thumb { position: relative; height: 204px; display: grid; place-items: center; }
.category-card__glow {
  position: absolute; inset: 0; width: 100%; height: 100%;
  object-fit: cover; border-radius: 12px;
  filter: blur(16px); opacity: 0.32;
}
.category-card__image { position: relative; width: 240px; height: 140px; object-fit: cover; border-radius: 12px; }
.category-card__info { display: flex; flex-direction: column; gap: 8px; }
.category-card__meta { display: flex; gap: 16px; }
.badge-new--category { position: absolute; top: -11px; left: 30px; }
```

### Category mobile card (272 x 238)

Use in the mobile app prototype. Figma-verified 2026-07-13 against the Mobile variants of `Card/ Category` in dark node `10176:1806` (default `10176:1807`, new `10301:4930`, disabled `10301:3233`). Mobile has State=Default only — no hover (and disabled shows no tooltip on mobile). No disabled+new combo. Implemented as the shared component `src/components/mobile/CategoryCard`.

Same glow-stack anatomy as desktop, scaled down. Container: **272px** wide (fixed), column, centered, **12px gap** (desktop 16px), no surface fill.

- **Thumbnail stack** 272 x **180** (desktop 300 x 204), 32px padding: blurred glow copy fills the area (`blur(16px)`, 32% opacity, radius 12px) with the sharp **208 x 116** image (radius 12px) centered on top.
- **Info**: **4px gap** (desktop 8px). Title Poppins Bold **14px**/1.5 `--text-primary`, single line, ellipsis. Metadata row **8px gap** (desktop 16px), items 4px icon gap: **18px** collection-play icon + `12 courses`, 16px play-circle icon + `24 lessons`, Poppins Regular **12px/1.2** `--text-secondary`.
- **"New Courses" badge**: identical to desktop — absolute, top −11px, left 30px, `--badge-new` fill, 6px/8px padding, radius 40px, Poppins Medium 12px/1.2 `--neutral-25`.
- **Disabled**: thumbnail stack desaturated (`mix-blend-mode: luminosity`), sharp image at 50% opacity with a centered **40px lock icon** (Bold) overlay, all text `--text-disabled`.

### Category states

- **Hover:** the sharp foreground image scales up toward the card edges over the glow.
- **Disabled:** image desaturated, all text `--text-disabled`; hovering shows a tooltip — "Category not available in your plan. Please contact **Customer Success**" (standard tooltip, link in primary).
- **New:** adds the overlapping "New Courses" badge.

---

## Folder card

An admin library grouping ("folder") that previews its courses as a stacked deck. 308px wide; card area 308 x 272, info below. The stack depth mirrors the course count (variant axis: 0, 1, 2, 3+). Source: `Card/category` (named "category" in Figma but it is the **Folder** card — the creator tile inside it is labelled "New Folder"), light `10175:3183`, dark `10175:3106`.

Anatomy (16px gap between card and info):

- **Card surface:** `--cards-background`, radius 12px, 24px padding, Shadow S.
- **Thumb stack** centered (240 x 164 area), all layers radius 8px, bottom-anchored front image:
  - Back layer (3+ only): 208 x 118, `--cards-background-hover` fill, offset up 23px
  - Middle layer (2 and 3+): 224 x 132, `--border` fill, offset up 4px
  - Front: the folder's cover image, 240 x 140
  - **0 courses:** a gray video-player glyph placeholder instead of the stack
- **Info** below, 4px gap: folder name Poppins Bold 16px `--text-primary`; count Poppins Regular 14px `--text-secondary` (`3+ courses`, `1 course`, `0 courses`).

```css
.folder-card { width: 308px; display: flex; flex-direction: column; gap: 16px; }
.folder-card__surface {
  height: 272px; display: grid; place-items: center; padding: 24px;
  background: var(--cards-background); border-radius: 12px;
  box-shadow: var(--shadow-s);
}
.folder-card__surface:hover { background: var(--cards-background-hover); }
.folder-card__stack { position: relative; width: 240px; height: 164px; }
.folder-card__stack .back   { position: absolute; left: 50%; transform: translateX(-50%); top: 0;    width: 208px; height: 118px; background: var(--cards-background-hover); border-radius: 8px; }
.folder-card__stack .middle { position: absolute; left: 50%; transform: translateX(-50%); top: 15px; width: 224px; height: 132px; background: var(--border); border-radius: 8px; }
.folder-card__stack .front  { position: absolute; left: 50%; transform: translateX(-50%); bottom: 0; width: 240px; height: 140px; object-fit: cover; border-radius: 8px; }
.folder-card__info { display: flex; flex-direction: column; gap: 4px; }
```

### "New Folder" creator tile

The last tile in a folder grid is the creator affordance: 308 x 272, transparent fill, **1.5px dashed `--border`** border, radius 12px, centered column in `--text-secondary` — a 48px `+` over a 16px Regular "New Folder" label. Hover fills with `--cards-background-hover`.

```css
.folder-card--new {
  height: 272px; display: flex; flex-direction: column; align-items: center; justify-content: center;
  border: 1.5px dashed var(--border); border-radius: 12px;
  color: var(--text-secondary); text-align: center; cursor: pointer;
}
.folder-card--new .plus  { font: 400 48px/1.5 Poppins; }
.folder-card--new .label { font: 400 16px/1.5 Poppins; }
.folder-card--new:hover  { background: var(--cards-background-hover); }
```

### Folder states

- **Hover:** card surface (or creator tile) fills with `--cards-background-hover`.
- **Stack depth:** render only as many layers as the folder has courses, capped at 3.

---

## Instructor card

An instructor presented as a compact horizontal card — photo, name, short bio, and a list of skill rows. Figma-verified 2026-07-13: `Card/Instructor`, dark `5149:27386`, light `9926:2477`. Variants: Desktop Default `6124:3237`/`9926:2491`, Desktop Hover `9590:2718`/`9926:2504`, Mobile Default `5149:27385`/`9926:2478`. No mobile hover, no disabled/selected states. The mobile variant is implemented as the shared component `src/components/mobile/InstructorCard`.

| | Desktop | Mobile |
|---|---|---|
| Card | 404 x 160 | 340 x 137 |
| Info padding / gap | 16px / 12px | 12px / 16px |
| Name | Poppins Bold 16px/1.5 | Poppins Bold 14px/1.5 |
| Bio | Poppins Regular 14px/1.5 | Poppins Regular 12px/1.2 |

Shared anatomy, left to right (horizontal flex, items centered, radius 12px, `overflow: hidden` so the card radius clips the photo, `--cards-background`, Shadow S):

- **Photo** 120px wide, full card height, `object-fit: cover`, no own radius.
- **Info column** fills the rest:
  - **Instructor block**, 8px gap: name in `--text-primary`; bio in `--text-secondary` (clamp to fit — desktop shows ~2 lines, mobile 1–2).
  - **Skills block**, 8px gap, up to 2 rows. Each row: 4px gap, items centered, radius 8px — a **16px skill-category icon** (the multi-color skill icons from `src/assets/skill-icons/`) + label Poppins Regular 12px/1.2 `--text-tertiary`, single line, ellipsis.

States: **Hover (desktop only)** — background switches to `--cards-background-hover`, nothing else changes.

---

## Related skills

- `5mins-prototype-builder` - the admin platform chrome the cards sit inside.
- `5mins-colors` - the colour token system these card tokens belong to.
- `5mins-typography`, `5mins-iconography` - the Poppins type scale and the icon set (play-circle, clock, edit, close, lock, tick).
- `buttons` - the quiz buttons used on the Lesson web app row.
