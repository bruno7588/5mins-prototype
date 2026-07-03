---
name: 5mins-card-components
description: Self-contained build specs for the four official 5Mins.ai content card components - Lesson, Assessment, Course, and Skill cards. Use this skill whenever a 5Mins prototype, mockup, or admin/learner UI needs to show a lesson, assessment, course, or skill as a card or tile; whenever the user references content cards, content tiles, library items, or course/lesson lists in the 5Mins admin panel or learner web app; and whenever building or modifying any 5Mins screen that displays courses, lessons, assessments, or skills. Trigger this even if the word "card" is not used, as long as content items need to be shown visually. Build cards from the specs in this file; do not invent ad-hoc card layouts.
---

# 5Mins Card Components

5Mins.ai has four official content card components. When a prototype shows a lesson, assessment, course, or skill, build the card from the spec in this file. Do not invent a card layout. Matching the real component keeps prototypes accurate and on-brand, so stakeholders react to the new work and not to layout drift.

This skill is fully self-contained. Every dimension, token, and structure below is the real spec, so no Figma connection is needed to build a card. The Figma source is listed only for anyone who wants to re-verify later (file `EC26cSVe9KNTCWXvYovakw`, "Library").

## When to use this skill

Use it before building any card or tile that represents a piece of 5Mins content:

- A screen that lists or grids lessons, assessments, courses, or skills.
- An admin panel page (library, course builder, content picker) showing content items.
- A learner web app screen (home, course page, search results) showing content items.
- Any change to an existing 5Mins screen where these items appear.

For the surrounding admin shell (header, tabs, sidebars, modals), pair this with `5mins-prototype-builder`, which owns the chrome.

## Scope: desktop only

We only prototype the desktop experience. Every spec below is the desktop variant. The real components also contain Mobile variants; ignore them. The Skill card has no device split, so this does not apply to it.

## Picking the right card

| Content item | Card | Variants to choose from |
|---|---|---|
| A single video micro-lesson | Lesson card | grid tile, admin list row, web app list row |
| A quiz or assessment | Assessment card | admin list row, web app list row |
| A course or playlist (group of lessons) | Course card | one desktop card |
| A skill tag | Skill card | one chip, with or without a remove control |

For Lesson and Assessment cards, pick the variant by surface: an **admin panel** screen uses the admin list row; a **learner web app** screen uses the web app row; a **grid or library browse** layout uses the Lesson grid tile. When unsure, read the surrounding chrome: dark admin chrome means admin.

## Design tokens

The cards use the standard 5Mins token system. If the prototype already defines these (via `5mins-brand-colors`, `5mins-surface-colors`, or the prototype-builder scaffold), reuse them. Otherwise the hex values below apply so this skill works standalone. These are the only theme values; build cards in the light theme.

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
  --text-disabled:   #656B7C;  /* disabled card text (Neutral-400) */

  /* Accents */
  --primary-600:   #00AFC4;  /* lesson progress fill */
  --success-500:   #18A957;  /* completed progress + completed state */
  --selected:      #FFBB38;  /* course progress fill (Secondary-500) */
  --text-warning:  #FFA538;  /* course due-date text (Warning-500) */
  --badge-new:     #E95C7B;  /* course "New" badge fill */
  --type-badge-bg: rgba(69, 76, 94, 0.16);  /* content-type pill background */
}
```

Shared values used by every card:

- **Font:** Poppins. Title = Bold 700. Metadata = Regular 400. Pills = Medium 500.
- **Type scale:** H4 = 16px / line-height 1.5. H5 = 14px / 1.5. Paragraph M = 14px / 1.5. Paragraph S = 12px / 1.2.
- **Radius:** cards use 12px. Inner thumbnails use 8px.
- **Card shadow (Shadow S):** two stacked drop shadows, both color `rgba(32,34,42,0.04)`, blur 4px, offsets `1px 1px` and `-1px -1px`.
  `box-shadow: 1px 1px 4px rgba(32,34,42,0.04), -1px -1px 4px rgba(32,34,42,0.04);`
- **Spacing tokens:** XS 4px, S 8px, SM 12px, M 16px, L 24px, ML 20px, XXL 40px.

---

## Lesson card

A single video micro-lesson. Three desktop variants. Source: `Card/Lessons`, node `11608:3985`.

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
  box-shadow: 1px 1px 4px rgba(32,34,42,0.04), -1px -1px 4px rgba(32,34,42,0.04);
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
- A **completed** lesson swaps the progress bar for a 20px success tick icon. A lesson with an attached quiz adds a `Take Quiz` or `Retake Quiz` button on the right (warning-outlined when pending, see the `buttons` skill).

### Lesson states

- **Hover:** card background switches to `--cards-background-hover`; in list rows the title shifts to the link-hover cyan.
- **Disabled:** thumbnail desaturated (`filter: grayscale(1)` or `mix-blend-mode: luminosity`); all text uses `--text-disabled`; a lock icon may replace interactive affordances.
- **Completed:** progress fill uses `--success-500`.

---

## Assessment card

A quiz or assessment item. Two desktop variants. Source: `Card/Assessments`, node `11604:5305`.

Assessment cards use a built-in illustration in place of a thumbnail (the "multiple choice" illustration is a layered SVG). In a prototype, use the real illustration asset if available; otherwise a simple framed quiz icon at the same size is an acceptable stand-in. Keep the size and placement exact.

### Assessment admin list row (900 x 73)

Use in admin panel lists. Source variant nodes: `11604:5327` (default), `11604:5335` (hover).

Horizontal row: 12px left / 16px right / 12px vertical padding, 12px gap, items at top, radius 12px, card background and shadow.

- **Illustration** 48 x 48 on the left.
- **Info** fills the row, 4px gap, column. Title Poppins Bold 16px `--text-primary`, single line, ellipsis. Metadata row, 8px gap: `Assessment - Type of assessment` in Poppins Regular 14px `--text-secondary`, followed by a 16px edit icon.
- **Content-type pill** on the right: `--type-badge-bg` background, 8px / 4px padding, radius 40px, label `Assessment` Poppins Medium 12px `--text-secondary`.

```html
<article class="assessment-row assessment-row--admin">
  <div class="assessment-illustration"><!-- 48px assessment illustration --></div>
  <div class="card-info">
    <h3 class="card-title card-title--1line">50 free Tools and resources that everyone should know</h3>
    <div class="card-meta-row">
      <span class="card-meta">Assessment &middot; Type of assessment</span>
      <i class="icon-edit"><!-- 16px edit icon --></i>
    </div>
  </div>
  <span class="type-pill">Assessment</span>
</article>
```

```css
.assessment-row {
  display: flex; width: 900px; align-items: flex-start;
  background: var(--cards-background); border-radius: 12px; overflow: hidden;
  box-shadow: 1px 1px 4px rgba(32,34,42,0.04), -1px -1px 4px rgba(32,34,42,0.04);
}
.assessment-row--admin { gap: 12px; padding: 12px 16px 12px 12px; }
.assessment-illustration { flex: none; width: 48px; height: 48px; }
.card-info { display: flex; flex: 1 0 0; flex-direction: column; gap: 4px; min-width: 0; }
.card-title--1line { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.card-meta-row { display: flex; align-items: center; gap: 8px; }
.type-pill {
  flex: none; padding: 4px 8px; border-radius: 40px;
  background: var(--type-badge-bg);
  font: 500 12px/1.2 Poppins; color: var(--text-secondary);
}
```

### Assessment web app list row (900 x 112)

Use in learner web app lists. Source variant nodes: `11604:5343` (default), `11604:5349` (hover), `11604:5355` (disabled), `11604:5367` (completed).

Horizontal row: 16px left / 24px right / 16px vertical padding, 16px gap, items centered, radius 12px, card background and shadow.

- **Illustration** 80 x 80 on the left.
- **Info** fills the row, 8px gap, column. Title Poppins Bold 16px `--text-primary`. Subtitle `Assessment - Type of assessment` Poppins Regular 14px `--text-secondary`.
- No content-type pill on the web app variant.

### Assessment states

- **Hover:** card background switches to `--cards-background-hover`.
- **Disabled:** illustration desaturated; text uses `--text-disabled`.
- **Completed:** carries a completed treatment (success tick / colour); follow the completed lesson pattern.

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
  box-shadow: 1px 1px 4px rgba(32,34,42,0.04), -1px -1px 4px rgba(32,34,42,0.04);
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
  font: 500 12px/1.5 Poppins; color: #fff;
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

---

## Skill card

A skill tag, shown as a compact chip. One component, no device split, roughly 40px tall. Source: `Card/skill`, node `9577:3697`.

Anatomy, left to right: a 1px `--border` outline, transparent fill, 12px horizontal / 8px vertical padding, 8px gap, radius 12px, items centered.

- **Illustration** roughly 24 x 24 on the left.
- **Label** the skill name, Poppins Regular 14px `--text-secondary`.
- **Remove control** a 20px close icon on the right, present only in the removable variant.

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
.skill-chip:hover { border-color: var(--border-hover); }
.skill-chip__icon { width: 24px; height: 24px; flex: none; }
.skill-chip__label { font: 400 14px/1.5 Poppins; color: var(--text-secondary); }
.skill-chip__remove { display: inline-flex; width: 20px; height: 20px; border: 0; background: 0; cursor: pointer; }
.skill-chip[aria-disabled="true"] { opacity: .5; }
```

### Skill variants

- **Remove:** set the variant with the close icon when the chip appears in an editable context, for example a skill picker or a tag editor. Omit the close icon in read-only contexts.
- **Hover:** border switches to `--border-hover`.
- **Disabled:** reduced opacity, non-interactive, no remove control.

Source variant nodes: `9577:3698` (enabled), `9577:3701` (hover), `9577:3704` (removable), `9577:3712` (disabled).

---

## Related skills

- `5mins-prototype-builder` - the admin platform chrome the cards sit inside.
- `5mins-brand-colors`, `5mins-surface-colors` - the colour token system these card tokens belong to.
- `5mins-typography`, `5mins-iconography` - the Poppins type scale and the icon set (play-circle, clock, edit, close, lock, tick).
- `buttons` - the quiz buttons used on the Lesson web app row.
