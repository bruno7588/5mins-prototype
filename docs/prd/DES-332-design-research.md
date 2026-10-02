# DES-332 Assign courses: design research for the five undocumented pieces (B5)

> **PM amendments (2026-10-02, PRD D20-D22):** show resulting dates in cells and on Review (yes); reorder is drag and drop only, no Move up / Move down buttons, keyboard drag on the grip instead; the success screen plays the confetti animation. Where this doc says otherwise, the PRD wins.

Companion to `DES-332-assign-courses.md`. Covers blocker B5: (a) step rail, (b) reorderable course list, (c) per-course scheduling popovers, (d) Review summary cards, (e) full-screen success screen. Researched 2026-10-02.

**Assumption:** this doc follows the brief's timing model, where course N enrols "Immediate" or "x days after the previous course", so order changes dates. The PRD's B3 recommended "x days from today" instead. The PM has since settled this as "after the previous course" (PRD D16).

**Sources and what they gave**

- **Mobbin:** good. Six searches, cited below.
- **Build For Mars:** principles only. There was no close match for step rails or reorder affordances.
- **Sana:** the help centre had useful scheduling detail (staggered assignments, relative due dates). sanalabs.com had nothing new beyond the changelog the PRD already cites.
- **Dribbble:** search and shot pages render empty to fetch. Rows marked "search summary" rely on the search-result summary only.
- **Pinterest:** the board page returned no readable content. Nothing from Pinterest is used.

**Shared rules for all five pieces**

- Focus ring: 2px `var(--primary-button-background)` outline, 2px offset.
- Icon-only controls get a DS `Tooltip` whose text matches the `aria-label`.
- Motion uses `ease-in-out`, 150-250ms, and is turned off under `prefers-reduced-motion`.
- Surfaces sit on `var(--page-background)`.
- No state is shown with opacity. The existing `.ui-disabled` class is only for unbuilt controls.

---

## (a) Step rail

### Prior art

| Source | Takeaway | Verdict |
|---|---|---|
| [DoorDash Merchant, Create new store](https://mobbin.com/screens/d99c8fbe-7874-4b39-ac8e-069cf9a13011) | Vertical rail; the current step has a tinted row; done steps get a green tick. | **Adopt** the vertical rail with a clear current step. **Reject** ticks: our count sub-line already says a step is done. |
| [Remote, Add a new contractor](https://mobbin.com/screens/0d2b48f4-1904-4fe9-b335-a34ca87fbb68) | Connector line, tick circles, a "50%" progress bar. | **Reject** the line and the percentage. Three steps don't need a progress meter. |
| [Workable, Create a review cycle](https://mobbin.com/screens/3d93923a-06c2-458c-80a2-06de0b5776e2) | On the Summary step the rail stays clickable for going back. | **Adopt**: the rail is the way back (AC 12). |
| [Xero, Expenses setup](https://mobbin.com/screens/5ab3da1c-901d-49b0-9c7f-6de427b9ceb8) | The disabled primary button reads "Need at least 1 account". | **Adopt**: the blocked Next button says why (AC 6), using a Tooltip. |
| [Joshua Sortino, Onboarding Progress Steps (Dribbble, search summary)](https://dribbble.com/shots/1664914-Onboarding-Progress-Steps) | Icons on steps give more context than numbers. | **Adopt**: keep the 32px icons the course wizard already uses. |

### Recommendation: keep the `.ecm-steps` anatomy and make each step a button

```
┌ Assign courses ────────────────────────────────────── [ Next ] (x) ┐
├──────────────────────┬─────────────────────────────────────────────┤
│ [Book1]  Courses     │  (step content)                             │
│          3 courses   │                                             │
│ [People] People      │                                             │
│          240 people  │                                             │
│ [Task]   Review      │                                             │
│          Check and launch                                          │
└──────────────────────┴─────────────────────────────────────────────┘
```

**Anatomy**

- **Rail:** the same as `.ecm-steps`, 300px wide. Padding is `var(--space-xl) var(--space-l)`, gap `var(--space-l)`, with a 1px `var(--border)` right edge.
- **Each step:** an icon, a title and a sub-line.
  - Icon: 32px Iconsax, `Book1` for Courses, `Profile2User` for People, `TaskSquare` for Review.
  - Title: H4 (16/700).
  - Sub-line: Paragraph M (14/400).
  - Icon to text gap is `var(--space-sm)`.
- **Header:** the wizard title "Assign courses" (H2 24/700). The primary `Button` sits top right in `size="lg"`, as in the Enrol people wizard. The `CloseButton variant="fullscreen"` sits beside it.

**States**

| State | Treatment |
|---|---|
| Current | Title and sub-line in `var(--text-selected)`; icon `variant="Bold"` in `var(--text-selected)`; `aria-current="step"`. No hover. |
| Reachable (default) | Title `var(--text-primary)`, sub-line `var(--text-secondary)`, icon Linear in `var(--text-primary)`. |
| Hover | `var(--page-background-hover)` fill, radius `var(--radius-sm)`, item padding `var(--space-s) var(--space-sm)`. Ease 150ms. |
| Focus | Shared focus ring. |
| Not reachable yet | A native `disabled` button, so Tab skips it. All text and the icon use `var(--text-disabled)`. The sub-line says what unlocks it. |

**Copy**

| Step | Sub-line |
|---|---|
| Courses | "No courses yet", "1 course", "3 courses" |
| People | "Add courses first", "No people yet", "240 people" (committed only, as in D7) |
| Review | "Select people first", "Check and launch" |

| Step | Header button | Tooltip while disabled |
|---|---|---|
| Courses | **Next** | "Add at least one course to continue" |
| People | **Next** | "Select people to continue". If picks are still a draft: "Press Select People to add your picks" |
| Review | **Launch** | none |

Wrap the disabled button in `Tooltip` rather than swapping it in and out, as `alerts-toast.md` says.

**Behaviour and accessibility**

- Markup is `<nav aria-label="Assign courses steps"><ol>` with one `<button>` per step.
- Changing step keeps all state.
- Focus moves to the step's H3 heading, which has `tabIndex={-1}`.
- The main column crossfades in 200ms.

**Deliberately left out**

- Ticks
- Connector lines
- Step numbers
- A percentage or progress bar
- A Back button. The rail is the one way back.
- A "Step 2 of 3" label

**New component needed:** `StepRail` in `src/components/`, with a doc. Today it is page-local (`.ecm-*`). The course wizard should adopt the same component. **Needs a Figma link.**

---

## (b) Reorderable course list with a keyboard alternative

### Prior art

| Source | Takeaway | Verdict |
|---|---|---|
| [Square, Rearrange menus](https://mobbin.com/screens/0a58c939-63ab-4837-a6d3-75efde14f794) | The dragged card lifts with a shadow and follows the pointer; a gap opens where it lands. | **Adopt** "lifted with a shadow", not "faded". **Reject** the open gap: an insertion line is quieter. |
| [DoorDash Merchant, Rearrange items](https://mobbin.com/screens/46a6ef2f-2db8-4796-99a9-b22b99c25452) | Reordering happens in a separate modal with Save. | **Reject**; reorder in place, as the PRD already decided for Circle. |
| [Obvious, row menu "Move up / Move down"](https://mobbin.com/screens/2717d199-6a7f-4e20-a0fb-d98fa8686c2c) | The keyboard path sits inside an overflow menu. | **Adopt** the labels. **Reject** hiding them in a menu (hidden state). |
| [Darin Senneff, Designing a reorderable list component](https://www.darins.page/articles/designing-a-reorderable-list-component) | In testing, visible up/down buttons were the fastest; drag is a "bonus". Moves ease about 0.25s and respect reduced motion. | **Adopt**: visible move buttons are the universal path. |
| [Smashing, Dragon Drop](https://www.smashingmagazine.com/2018/01/dragon-drop-accessible-list-reordering/) | Space enters a "grab" mode, then arrows move; moves are announced. | **Adopt** the announcements. **Reject** grab mode, a hidden keyboard state. |
| [Sana, Programs: staggered assignments](https://help.sana.ai/en/articles/89597-programs-staggered-assignments) | "X days after the previous step": order drives dates. | **Adopt**: the moved row shows its new start date (see c). |
| [BFM, Reordering the share options](https://builtformars.com/ux-bites/reordering-the-share-options) | Items moving under the user confuse them. | **Adopt**: rows only move on an explicit action, and the move animates. |

In-repo precedents are `SequencingBody.tsx`, which has visible `ArrowUp`/`ArrowDown` move buttons with Tooltips and an `aria-live` announcement, and `ContentList.css`, which has a 2px `var(--selected)` insertion line and no opacity.

### Recommendation: drag on the grip, visible Move up / Move down buttons, and an insertion line

```
     Course                         Enrolment          Due date      Repeat
[⠿] ┌───────────────────────────────┬──────────────────┬─────────────┬────────┐ [↑][↓] [bin]
    │ 1 [img] GDPR Essentials        │ Immediate      ▾ │ No due date▾│ Once  ▾│
    │                                │ Starts on launch │             │        │
    └───────────────────────────────┴──────────────────┴─────────────┴────────┘
════════════════════  2px var(--selected) insertion line while dragging  ═════════
[⠿] ┌ 2 [img] Fire Safety  │ After 14 days ▾ │ ...                          ┐ [↑][↓] [bin]
```

**Anatomy:** reuse the automations `CourseRow`.

- **Wrapper:** `var(--input-background-elevated)`, padding `var(--space-s)`, radius `var(--radius-sm)`.
- **Grip:** 20px.
- **Card:** `var(--cards-background)` with `var(--shadow-card)`. In dark mode it gets a 1px `var(--border)` edge instead.
- **Inside the card:** ordinal, thumbnail, title and three cells.
- **Move buttons:** an up/down pair, styled like `.iq-drawer__move-btn`. Each is a 16px Iconsax `ArrowUp`/`ArrowDown` (Linear) in a 24px `var(--radius-full)` target.
- **Remove:** the remove `Trash` button with the Tooltip "Remove course".
- **Header row:** "Course", "Enrolment", "Due date", "Repeat".

**States**

| State | Treatment |
|---|---|
| Rest | Grip `var(--text-tertiary)`, `cursor: grab`. Move buttons `var(--text-tertiary)`. |
| Hover row | Card `var(--cards-background-hover)` (existing). The grip goes to `var(--text-secondary)`. |
| Hover move button | Circular `var(--input-background-hover)`, glyph `var(--text-primary)`. |
| Focus | Move buttons and remove get the shared focus ring. The grip is not focusable (`aria-hidden`); the move buttons are its keyboard equivalent. |
| Disabled move (first ↑, last ↓) | Glyph `var(--text-disabled)`; Tooltip silenced with `disabled`. |
| Dragging (source row) | The card stays in place with `var(--cards-background-hover)`; `cursor: grabbing`. The browser draws its own drag image. **Never `opacity: 0.5`**, which the automations, Programs `CourseOutline` and `InteractiveDrawer` rows all use today. |
| Drop target | A 2px `var(--selected)` insertion line with `var(--radius-xs)`, drawn in the gap above or below the hovered row. It is a line, not a ring around a row: a ring reads as "swap". |
| Dropped | Rows ease to their new places (Framer `layout`, 250ms `ease-in-out`). Ordinals renumber, and the Enrolment cell recalculates "Starts …". Under reduced motion the change is instant. |
| One course only | The grip and move buttons are not rendered. There is nothing to reorder. |

**Copy**

- Move button `aria-label` and Tooltip: "Move up" and "Move down". The accessible name includes the course: "Move Fire Safety up".
- Remove: "Remove course".
- Live region (`role="status"`, `aria-live="polite"`, visually hidden): "Fire Safety moved to position 2 of 3. Starts 16 Oct 2026."

**Keyboard:** Tab reaches each row's ↑, ↓ and remove in order. After a move, focus stays on the same button in the moved row. If that button is now disabled because the row is at an end, focus goes to the other arrow.

**Deliberately left out**

- A grab mode
- A reorder modal
- Drag between lists
- A "Save order" button. Order applies live.
- Any row highlight after the move

**New component needed**

- `ReorderList` (or row behaviour): grip plus move buttons plus insertion line plus live region, shared by the four drag lists in the repo. It needs a doc.
- **DS gap:** the 6-dot grip is a hand-drawn SVG in four files and is not Iconsax. The Library drag-handle glyph needs confirming. **Needs a Figma link.**

---

## (c) Per-course scheduling: Enrolment, Due date, Repeat

### Prior art

| Source | Takeaway | Verdict |
|---|---|---|
| [Sana, Assigning content](https://help.sana.ai/en/articles/7501-assigning-content) | Due date "X days after it is assigned". Repeat runs "after assignment" or "after completion". | **Adopt** relative due dates and repeat-after-assignment. **Reject** after-completion for now (D12 re-enrols the same group). |
| [Sana, Programs: staggered assignments](https://help.sana.ai/en/articles/89597-programs-staggered-assignments) | Per-step "Made available" and "Due" columns. The first step counts from enrolment, later steps from the previous step. | **Adopt** the same split: course 1 counts from launch, courses 2+ from the previous course. |
| [Cornerstone, Assign Training](https://help.csod.com/help/csod_0/Content/User/Learning/Assign_Training/Assign_Training.htm) | Due: No due date, Relative, Specific date. | **Adopt** the first two; specific dates are out of scope. |
| [Todoist, date popover](https://mobbin.com/screens/8fc740cb-9b14-4405-b9e9-f1caa932e23b) | Each relative choice shows the date it resolves to. | **Adopt**: show "Starts 16 Oct 2026" under the choice and in the cell. |
| [Time2book, Repeat dropdown](https://mobbin.com/screens/de15b686-6d30-4406-b3d7-339e7bc931a2) | Repeat is a preset list ("Weekly", "Every 2 weeks"…). | **Reject**: presets can't say "every 12 months". Keep the number plus unit. |
| [Aboard, time popover](https://mobbin.com/screens/bd776ec3-c127-4406-8412-26e837a7a068) | An anchored popover with a caret and a Save button. | **Adopt** the caret anchoring. **Reject** Save: changes apply as you make them. |

### Recommendation: three cell triggers, each opening one radio popover with `InputInteger` inside

```
Enrolment ▾  (cell trigger)
┌───────────────────────────────────────────┐
│ (•) Immediate                              │
│     Starts on launch                       │
│ ( ) After a delay                          │
│     [ − 14 + ]  days after GDPR Essentials │   ← disabled until its radio is chosen
│     Starts 16 Oct 2026                     │
└───────────────────────────────────────────┘
```

**Cell trigger:** reuse `.automation-details-cell-trigger`.

- Title: Paragraph M (14/400) `var(--text-primary)`.
- Description: Paragraph S (12/400) `var(--text-secondary)`.
- Chevron: 20px `ArrowDown2` in `var(--text-tertiary)`. It rotates 180° when open, with a 150ms ease (existing).
- Hover comes from the row card.
- Focus: shared focus ring with offset `-2px`, so it sits inside the card. **The current trigger uses `all: unset`, which removes the focus ring; add one back.**

**Popover surface:** the `listbox.md` container spec.

- `var(--cards-background)`, 1px `var(--border-elevated)`, `var(--radius-sm)`, padding `var(--space-s)`.
- Shadow `var(--shadow-l)`. This replaces the raw `drop-shadow(rgba…)` in `EnrollmentPopover.css`.
- An 8px caret, top-left.
- Portalled to `<body>` and anchored to the trigger.

**Contents**

- Inside a `<fieldset>` with a visually hidden `<legend>` ("Enrolment", "Due date", "Repeat").
- Each option is a DS `Radio` with `label`, so it is a `<label>`. Today it is a `<button>` that wraps a radio with `tabIndex={-1}`, which `selection-controls.md` forbids.
- Option row: padding `var(--space-s) var(--space-sm)`, radius `var(--radius-s)`, hover `var(--cards-background-hover)`.
- Option title: Paragraph M medium (14/500) `var(--text-primary)`. Description: Paragraph M (14/400) `var(--text-secondary)`.
- The number is DS `InputInteger` with `min={1}`, replacing the hand-rolled − / +. It is **always rendered**, and `disabled` while its radio is unselected, so the panel doesn't jump and the number is kept.
- The Repeat unit is DS `Dropdown` (weeks, months).

**Copy**

| Popover | Option (title / description) | Cell summary |
|---|---|---|
| Enrolment | **Immediate** / "Starts on launch" (course 1) or "Starts with the previous course" (2+) | "Immediate" / "Starts on launch" |
| | **After a delay** / `[n]` "days after launch" (course 1) or "days after {previous course}" (2+), then "Starts {date}" | "After 14 days" / "Starts 16 Oct 2026" |
| Due date | **No due date** / "People can complete it any time" | "No due date" |
| | **Days after it starts** / `[n]` "days", then "Due {date}" | "Due in 30 days" / "Due 15 Nov 2026" |
| Repeat | **Once** / "Enrol once only" | "Once" |
| | **Recurring** / "Every `[n]` `[months ▾]`. Re-enrols the same people each time." | "Every 12 months" |

Defaults are Immediate, No due date, Once (AC 4). These replace the automations copy ("Enrol user as soon as automation is triggered", "One time only", "Never repeats"), which is wrong here.

**Behaviour and accessibility**

- The trigger has `aria-haspopup="dialog"` and `aria-expanded`. The popover has `role="dialog"` and `aria-label` set to the column name.
- On open, focus goes to the checked radio. Arrow keys move between radios (native behaviour); Tab reaches `InputInteger` and `Dropdown`.
- Escape or a click outside closes the popover and returns focus to the trigger.
- Changes apply live, and the cell summary updates as you type.
- Open and close fade over 150ms.

**Deliberately left out**

- Specific calendar dates
- Repeat-after-completion
- Save and Cancel buttons
- A "relative to" picker. The anchor is fixed by position.

**New component needed:** a DS **popover** (an anchored settings panel). No doc exists; it is page-local (`.enrollment-popover`). It can be specified as the Listbox container plus Radio rows. The three popovers then become one component with three configurations. **Needs a Figma link.**

---

## (d) Review summary cards

### Prior art

| Source | Takeaway | Verdict |
|---|---|---|
| [7shifts, Confirm package](https://mobbin.com/screens/063d1a81-7605-4541-9725-37c9af26f81b) | One sentence ("5 employees will receive…"), the item list, one primary button. | **Adopt**; closest shape. |
| [Mailchimp, Review and complete your import](https://mobbin.com/screens/ef381fc7-d2c1-42df-ae39-645d24426af2) | The headline sentence carries the totals. | **Adopt**. |
| [Figma, Upgrade review](https://mobbin.com/screens/e23d11dd-4c38-4d54-bae4-7c10a45042d6) | Line items with right-aligned figures, then a single grey "How does … work?" note. | **Adopt** right-aligned per-course counts and one explanatory Callout. |
| [lululemon, Checkout review](https://mobbin.com/screens/1b90a989-8460-400b-bbcc-1747d579961e) | An Edit link on every section. | **Reject**: the rail already goes back. Edit links double the paths. |
| [BFM, Wise: a structured payment process](https://builtformars.com/ux-bites/a-structured-payment-process) | Key figure first, then details. | **Adopt**: totals lead. |
| [Cornerstone, Confirm](https://help.csod.com/help/csod_0/Content/Learning_Assignment_Tool/Create_Learning_Assignment/Create_Learning_Assignment_-_Confirm.htm) | Read-only tiles; you change things by going back. | **Adopt** read-only. |

### Recommendation: totals sentence, one skip Callout, then an ordered `SummaryCardList`

```
Review and launch                                        (H3)
240 people will be enrolled in 3 courses.                (Paragraph L medium)
712 enrolments will be created and 8 skipped.            (Paragraph M, secondary)

┌ (i) Some enrolments will be skipped ──────────────────────────────┐
│ • 6 people are already enrolled in Fire Safety, so they'll be     │
│   skipped for that course.                                        │
│ • 2 people are already enrolled in Food Hygiene, so ...           │
│ People who have completed a course will be enrolled again.        │
└───────────────────────────────────────────────────────────────────┘

Courses
┌ (1) GDPR Essentials                                 240 to enrol ┐
│     Starts on launch · No due date · Once                        │
└──────────────────────────────────────────────────────────────────┘
┌ (2) Fire Safety                          234 to enrol · 6 skipped ┐
│     Starts 16 Oct 2026 · Due 15 Nov 2026 · Every 12 months       │
└──────────────────────────────────────────────────────────────────┘
```

**Components**

- `SummaryCardList` and `SummaryCard` from `src/pages/automations/SummaryCards.tsx`.
  - Ordinal badge: a 24px `var(--input-background-elevated)` disc with `var(--text-secondary)` text.
  - Card: `var(--cards-background)`, `var(--shadow-card)`, padding `var(--space-sm) var(--space-m)`, `var(--radius-sm)`.
  - Title: Paragraph M medium (14/500).
  - Meta: Paragraph M (14/400) `var(--text-secondary)`.
  - List gap: `var(--space-s)`.
- The **skip Callout** is `<Alert type="Callout" icon title bullets>`. It shows only when at least one pair is skipped. If there are no skips but some completions, it carries the re-enrol line alone (B2).
- Section spacing is `var(--space-l)`, as in the `.ecm-main` column.

**Per-course counts:** a new trailing slot on `SummaryCard`, Paragraph M (14/400), right-aligned.

- "240 to enrol" in `var(--text-primary)`.
- "· 6 skipped" in `var(--text-secondary)`.
- Counts use plain text, not a Badge or colour: a skip is expected, not an error.

**States:** the cards are read-only, so there is no hover, focus or disabled state. Only the header **Launch** button and the rail are interactive.

**Copy**

- H3: "Review and launch".
- Totals: "{N} people will be enrolled in {C} courses." and "{E} enrolments will be created and {S} skipped." When S is 0, the second sentence is "{E} enrolments will be created."
- Callout title: "Some enrolments will be skipped". One bullet per course: "{n} people are already enrolled in {course}, so they'll be skipped for that course."
- Re-enrol line: "People who have completed a course will be enrolled again."
- Meta strings follow the cell summaries joined by " · ", with resolved dates.

**Accessibility**

- Mark the list up as an `<ol>` so screen readers hear the order.
- Counts are inside each card's text, not only in the visual position.
- On load, focus goes to the H3.

**Deliberately left out**

- Per-section Edit links
- One row per person (scale risk)
- A breakdown by source (teams, cohorts)
- "View all" collapsing (`previewCount`): every course shows
- A second confirm modal

**New component needed:** promote `SummaryCard` and `SummaryCardList` to `src/components/` with a doc and add a `trailing` slot. Today they are page-local in automations. **Needs a Figma link.**

---

## (e) Full-screen success screen

### Prior art

| Source | Takeaway | Verdict |
|---|---|---|
| [Remote, Policy created](https://mobbin.com/screens/244d0911-b2e1-47e2-b502-294322cff706) | A title plus one specific line about what now happens ("Entitled employees can now request leave…"). | **Adopt** the specific line. **Reject** its second CTA ("Create another policy"). |
| [HubSpot, Knowledge base created](https://mobbin.com/screens/7a5b53b9-c97d-4eb3-b39e-a51d9d93a42f) | Illustration, a "Congratulations…" line, one Done button. | **Adopt** the single CTA. **Reject** the generic congratulation. |
| [Wise, All done](https://mobbin.com/screens/ed1a1970-ff4b-424a-a31e-a6bbfbfa76d2) | "ALL DONE / Your new jar is ready to use." | **Reject**: the vague copy says nothing about what was done. |
| [BFM, Argos: the order was successful](https://builtformars.com/ux-bites/the-order-was-successful) | Confetti suits infrequent actions; repeated often, it feels tacky. | **Adopt**: no confetti. Assigning courses is routine admin work. |
| [BFM, Revolut: the next action](https://builtformars.com/ux-bites/the-next-action) | Success should hand over the next useful step. | **Adopt**: the one CTA returns to Your Courses (D10). |
| [Pedro Reyes, Success Confirmation Screen (Dribbble, search summary)](https://dribbble.com/shots/25487611-Success-Confirmation-Screen-UI-Design) | Minimal: message plus one prominent CTA. | **Adopt**. |

### Recommendation: the `CourseCreatedModal` or `LaunchSuccessModal` shell, rendered in the wizard's own overlay

```
                                                     (x)
                      [72px success tick]
                       Courses assigned               (H2)
          3 courses are now assigned to 240 people.   (Paragraph L)
                    [ Back to Your Courses ]          (filled, lg)
```

**Shell:** after Launch, the wizard overlay swaps its content for the success view. There is no second overlay and no flash.

- Background: `var(--page-background)`.
- `CloseButton variant="fullscreen"` top right.
- Content centred: gap `var(--space-ml)` between blocks, `var(--space-s)` inside the text block (the empty-state rhythm).

**Content**

- `SuccessTick` (72px) from `LaunchSuccessModal`. It is a Library illustration (Figma `2423:13169`); its SVG fills are exported hexes, which is fine for an illustration asset.
- Title: H2 (24/700) `var(--text-primary)`.
- Body: Paragraph L (16/400) `var(--text-secondary)`.
- `Button` (filled, `size="lg"`).

**States**

- The button has its DS default, hover, pressed and focus states (`buttons.md`).
- There is no disabled or loading state; launch is a mock write. If engine latency is added later, use the Button `loadingLabel` on **Launch** ("Launching..."), not on this screen.

**Copy**

- Title: "Courses assigned". Use "Course assigned" for a single course. No exclamation mark; the copy skill rejects "Success!".
- Body: "{C} courses are now assigned to {N} people." Single forms: "1 course", "1 person".
- Button: **Back to Your Courses**.
- The close X and Escape do the same as the button.

**Motion:** reuse the `LaunchSuccessModal` choreography under `MotionConfig reducedMotion="user"`.

- The tick scales in with a spring.
- The text and the button rise 12px and fade in, delayed 0.15s and 0.25s.
- No confetti.

**Accessibility**

- `role="dialog"`, `aria-modal`, `aria-labelledby` pointing at the title. Focus is trapped by `useOverlayA11y`.
- Initial focus goes to **Back to Your Courses**, so the result is read and Enter completes the flow.

**Deliberately left out**

- Confetti
- A second CTA ("View enrolments" has no single destination for a multi-course assignment)
- Course name lists
- Skip recap (Review already said it)
- A follow-up toast on Your Courses (it would duplicate this screen)

**New component needed:** a shared `SuccessScreen` (or a generalised `LaunchSuccessModal`) with `title`, `message`, `actionLabel` and an opt-in `confetti` prop. Programs keeps its confetti and copy, unchanged (PRD risk). `overlays.md` names "Launch success" but has no spec. **Needs a Figma link.**

---

## Summary: new components and PM decisions

**New components or docs needed** (none exist in `docs/design-system/`; each needs a Figma link per CLAUDE.md):

1. `StepRail`
2. `ReorderList` row behaviour, plus confirming the drag-grip glyph, which is not Iconsax today
3. The anchored settings **popover**
4. `SummaryCard` with a trailing slot
5. `SuccessScreen`

**Fixes to make when reusing the prototype code**

- Remove `opacity: 0.5` from the dragged rows in `AutomationDetailsModal.css`, `CourseOutline.css` and `InteractiveDrawer.css`.
- Make popover radios `<label>` rows, not `<button>`s.
- Replace the popover's raw `drop-shadow` with `var(--shadow-l)`.
- Restore the cell trigger's focus ring.
- Replace the hand-rolled − / + with `InputInteger`.

**PM decisions**

1. **Timing anchor:** "x days after the previous course" (this brief) or "x days from today" (PRD B3). The design assumes the previous course, with course 1 counting from launch.
2. **Show resolved dates** in the Enrolment and Due date cells and on Review: recommended yes. It is the only thing that makes reordering visible.
3. **Move buttons always visible**, not revealed on hover or focus: recommended yes, for no hidden state.
4. **No ticks in the rail and no confetti on success**: recommended.
