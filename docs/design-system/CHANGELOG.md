# Design system changelog

History moved out of the component and foundation docs on 2026-10-14, when every doc was restructured to [_template.md](_template.md). Docs state only the current rule; this file keeps the story of how each rule changed. Entries are grouped by doc, newest first. Quoted notes are verbatim apart from em dashes, which are replaced with " - ".

Add new entries here, not in the docs.

## Library-wide

- 2026-10-14: Component settings rework across the Library: text and icon-swap properties, on/off variant axes turned into boolean properties only where they were pure show/hide (Toast icon, date field label, Input label and helper text, Radio label, Category New), Focus variants with a 2px cyan ring at 2px offset on interactive components, and every description rewritten with the code mapping. Variants deleted by boolean conversions: Toast 4, date field 4, Input/Radio 40, Category 4 (ids in the session notes).
- 2026-10-14: Icons renamed to exact iconsax-react names (see iconography.md).
- 2026-10-14: Figma Library light copies merged into the dark component sets: each component is now one set, and light mode comes from the variable modes on its parent frame. 41 light sets deleted; docs now cite the single set id. Kept as separate light copies pending a decision, all resolved later the same day (dark kept, light deleted; cards gained Shadow S in both modes) except Illustrations/ Assessments: Card/Lessons, Card/Resources, Card/Courses, Card/Instructor, Card/External training, Card/Marketplace, Type thumbnail, Certificate instances, Ranking leaderboard, Illustrations/ Assessments, Top nav/ App.
- 2026-10-14: Variables restricted to their proper pickers (scopes); Neutral, Primary and Secondary scales hidden from publishing. Every colour and spacing variable carries its WEB code syntax (`var(--token)`).

## [alerts-toast.md](alerts-toast.md)

- 2026-10-14: Alert and Callout buttons and the close × gained a `:focus-visible` ring (was the browser default).
- 2026-10-14: Callout default Message and Body text replaced with generic copy (the old sample had a typo).
- 2026-10-14: Figma settings rework. Alert gains Title, Message and Body text properties plus Icon glyph (Callout) and Warning glyph (Alert) swaps; its variant axes stay. Toast's Icon variant is now a Show icon boolean (Icon=False variants removed) and gains a Message text property. Tooltip gains a Text property; its Icon axis stays a variant. Figma to code tables updated; Carbon description and link removed from Tooltip.
- 2026-10-14: Toast has no action slot. The Undo action (and its `ToastAction` type, `dismiss` and `onDismiss`) was removed from `Toast.tsx`, along with the Undo on the "Resource removed" and "Assessment deleted" toasts.
- 2026-10-14: Toast Types table said "**Info** | `--border` (`#2D313D` dark) - a dark neutral pill | io5 `IoInformationCircleOutline`". Changed to `--neutral-600` and Iconsax `InfoCircle` to match `Toast.css` / `Toast.tsx` (the doc's own CSS block and Code reality section already said so); io5 kept as Figma drift.
- 2026-10-14: Toast library-gap note said "the Info fill is bound to the `Border` variable, whose *light* value (`#DFE1E6`) would make the near-white label illegible". The 2026-10-14 Library audit found the Info fill bound to `Neutral-700`; the binding claim was removed and the drift recorded in Figma to code. Rule (fixed `--neutral-600` in both modes) unchanged.
- 2026-10-14: Tooltip intro said it "appears on hover, focus, or click of a trigger". Changed to "hover or focus" to match `Tooltip.tsx` and the doc's own Behaviour section (no click handler).
- 2026-09-29: > **Updated 2026-09-29 (verified against code):** Alert title is 14px Bold and its button 16px; the stale Alert sample and CSS block are replaced by a short example of the real API; variant tables, Alert tint (16%), tooltip offset (2px), tooltip behaviour (no hover-out delay, no `aria-describedby`), the `ToastContainer` rule and the tooltip token note now match code; Toast and Tooltip shadows are `var(--shadow-l)`; ConfirmModal links point to `confirm-modal.md`.
- 2026-09-29: > **Updated 2026-09-29 (aligned to prototype usage):** padding, Alert type size and background, prop defaults, the Callout button style and the dark tooltip background now match `src/components/Alert`, `src/components/Tooltip` and `tokens.css`. The Callout button is always outlined; the underlined text button is Alert-only.
- 2026-09-29: ## React usage / > Superseded, see Usage: the older hand-written component and CSS that lived here predated `src/components/Alert` (they used a `supportingText` prop, an `.alert__description` wrapper and an underlined Callout button, none of which exist). `Alert.tsx` and `Alert.css` are the reference.
- 2026-07-03: Spec source: Figma Library (`EC26cSVe9KNTCWXvYovakw`) - Alert/Callout light `node 12060:2785`, dark `node 3658:32304`; Toast `node 5045:14119` (verified 2026-07-03).

## [avatars.md](avatars.md)

- 2026-10-15: Square avatar added (Bruno): circle for people who use the platform (learners, admins, managers), square with a 12px radius (`--radius-sm`) for companies and instructors. Code `shape` prop on Avatar; `CompanyAvatar` is now a square Avatar. Replaces the same-day interim company avatar (8px) and the lesson-feed-only exception. Not yet in the Figma Library.
- 2026-10-14: Avatar group gains a `Count` text property ("+N" bubble, maps to `remaining`); Avatar, Avatar group and Emojies descriptions rewritten to the 5Mins format and the Atlassian links removed. `Picture` stays a variant.
- 2026-09-29: > **Updated 2026-09-29 (re-verified against the Figma Library):** the "+N" counter bubble fills with `var(--border)`, not `--page-background-hover`; the no-photo fallback is the Library smiley (a `var(--border)` circle with a `var(--text-tertiary)` smile), not initials; the 24px counter bubble's ring is 0.5px; Avatar Group light node corrected to `11915:3296`.
- 2026-09-29: Spec source: Figma Library (`EC26cSVe9KNTCWXvYovakw`) - board `5453:37805`; Avatar light `11914:2605` / dark `5097:5884`, Avatar Group light `11915:3296` / dark `5097:5584` (re-verified 2026-09-29).
- 2026-09-29: **Prototype:** `src/components/Avatar/Avatar.tsx` and `src/components/AvatarGroup/AvatarGroup.tsx` (built 2026-09-29; every page avatar uses them).
- 2026-09-29: > **Code reality:** `src/components/Avatar/Avatar.tsx` implements this (2026-09-29). It replaced the table-only `.avatar-32` / `.avatar-40` classes and the page-level initials chips, which were drift from the Library.

## [badges.md](badges.md)

- 2026-10-14: Badge gains `State=Focus` variants on the five dismissible badges, with a cyan ring on the ✕ (`:focus-visible`). `Icon left` and `Icon right` stay variants; no icon swap or shared label property, because each type has its own icon and label. Description rewritten.
- 2026-10-14: **Spec source:** ... light `node 12414:9613` (verified 2026-08-26; light node id updated 2026-10-14).
- 2026-10-02: Re-verified dark 2026-10-02: adds a Hover state on dismissible badges and the io5 `IoCloseOutline` ✕.
- 2026-08-26: **Spec source:** Figma Library (`EC26cSVe9KNTCWXvYovakw`) - dark `node 5799:479`, light `node 12414:9613` (verified 2026-08-26; light node id updated 2026-10-14). Both nodes have the same structure; only the resolved text/fill tokens differ per mode.

## [bulk-action-bar.md](bulk-action-bar.md)

- 2026-09-29: (verified against code): the "no mode-aware tokens" rule narrowed to surface text and border tokens; "filled action last" and "count in every label" softened to match People, CourseDetails and MyTeam.

## [buttons.md](buttons.md)

- 2026-10-14: `semantic="ai"` is accepted only with `variant="filled"` or `"outlined"` (props type); the unstyled AI text and link combinations are gone.
- 2026-10-14: Figma Buttons `Configuration` (16 values) split into `Variant` and `Semantic`, matching the code props one-to-one. Description updated.
- 2026-10-14: Figma Buttons gained the 95 missing Small variants (Warning, Success, Danger families in filled, outlined and text, plus states), built from the Medium twins with Small spacing, radius, text style and icon size.
- 2026-10-14: Figma Buttons set gained a `Label` text property, an `Icon glyph` instance-swap property, 65 `State=Focus` variants (2px ring at 2px offset) and a description with the code mapping. Icon stays a variant because it changes padding.
- 2026-10-14: Dark-mode `--primary-button-background-pressed` is Primary-600 `#00AFC4`, matching Figma (was Primary-700 `#008393` in code). Applies to filled, outlined, text, link and AI pressed states.
- 2026-09-29: > **Updated 2026-09-29 (verified against code):** Cancel position split by container (dialogs: Cancel first; side-drawer footers: primary first); the "commit label differs from the opener" rule softened to a recommendation; the icon-only accessibility example no longer uses `<Button>` (it has no circular icon-only shape) and passes `color`.
- 2026-09-29: > **Updated 2026-09-29 (aligned to prototype usage):** Cancel is **Outlined-2**, not Outlined; modal and dialog footers use **Medium**, not Large.
- 2026-09-28: > **Updated 2026-09-28 against Library `10825:3269`.** Link is no longer "Text plus underline": it is **Medium (500), not Bold**, it takes the **Filled button's colour ladder** rather than the Text/Outlined chrome ladder, and the underline **skips descenders** (`skip-ink: auto`, it was `none`).
- 2026-09-15: Borders (2026-09-15): fill configurations (Filled, Danger, Warning, Success, AI) render **no border**; bordered configurations draw their 1px border inside the size by taking that pixel out of the padding (`--btn-bw`), so every configuration of a size matches the heights above (S 33 · M 41 · L 48). The AI hover's 2px cyan border is an inset 2px ring (1px on press), since the fill has no border to colour.
- 2026-08-26: Warning and Success were realigned to the Library variables 2026-08-26. ("Default is **Warning-600**. One darkening ladder in both modes (Figma Library variables, 2026-08-26)"; "One darkening ladder in both modes (Figma Library variables, 2026-08-26)".)
- 2026-08-11: > **Verified 2026-08-11 against Figma `8998:65562`** by sampling the rendered stroke: `rgb(19,171,202)` → `rgb(143,94,203)` → `rgb(5,201,228)` → `rgb(90,105,210)` across the top edge. Note the MCP code export flattens this stroke to its first stop and reports `border: 1px solid #00cee6` - that export is wrong, and this doc said the same thing until the pixels were checked. Figma paints a diamond gradient, so CSS uses the documented `radial-gradient(circle at top left, …)` approximation, exactly as `.btn-ai` already does for its fill.
- 2026-08-11: AI-Outlined: "**Transparent at rest** (the old 16% resting wash is gone)." and "its 1px stroke is a **gradient**, not a flat cyan (corrected 2026-08-11 - see AI-Outlined below)".
- 2026-08-04: Spec source: Figma Library (`EC26cSVe9KNTCWXvYovakw`) - parent frame `node 5453:38273` (dark board `10825:3269`, light board `12141:7567`), re-verified 2026-08-04. All colors are semantic tokens; **both light- and dark-mode resolutions are listed** because the two modes now use different state ladders.
- 2026-08-04: > **Updated 2026-08-04:** major rework of both modes -
  > 1. **Primary filled ladder is now mode-specific.** Light darkened one step (bg Primary-**700**, was 600); dark uses Primary-**500** with a **dark label** (`Neutral-800`) and goes **lighter on hover** (Primary-400).
  > 2. **Outlined resting tint is gone.** New fill ladder: **transparent at rest → tint on hover → transparent on press**. Hover tint = Primary-500 @ 16% (primary) / family-500 @ **24%** (semantic families). Disabled is transparent too (the 16% neutral fill was removed).
  > 3. **Icons are now LEADING** (before the label), not trailing. Gap 4px (S) / 8px (M, L); icon-side padding is one step tighter.
  > 4. **AI gradients are per-state and per-mode**: the gradient start follows the primary filled ladder, the end is always Blaze `#8158EC`. AI hover gains a cyan border + purple glow. AI-Outlined lost its resting wash (wash only on hover, at 24%), and its 1px stroke is a **gradient**, not a flat cyan (corrected 2026-08-11 - see AI-Outlined below).
  > 5. The semantic families (Danger, Warning, Success) all darken on hover in both modes - Warning and Success were realigned to the Library variables 2026-08-26. Only the primary filled button lightens on dark hover.
  > 6. Coverage: Loading now exists for the semantic-outlined families; semantic-text variants (Danger/Warning/Success-text) are first-class.
- 2026-08-04: > This flips the previous trailing-icon spec. Any call site that visually relies on a trailing icon should be re-checked against Figma.
- 2026-08-04: Outlined: "**Transparent at rest** (the 16% resting tint is gone)."
- 2026-08-04: **Gradient geometry (verified against rendered pixels 2026-08-04):** Figma uses a **diamond gradient centered at the button's top-left corner** ...
- 2026-08-04: Loading State: "Unchanged: the button takes the **disabled background** ..."
- 2026-08-04: Code reality: Component, `Button.css`, and the token definitions in `src/styles/tokens.css` were migrated to this spec on 2026-08-04 (mode-aware ladders, leading icons, transparent outlined rest, per-state AI gradients).
- 2026-08-04: Contrast: the light filled base darkened to Primary-700 and the dark filled base flipped to a dark label on Primary-500 - both changes exist to meet WCAG AA. Never use `--primary-500` as text on white.

## [calendar.md](calendar.md)

- 2026-10-14: Day item gains a `Day` text property, and its `State=Focus` border is rebound from `Selected` to `Primary-Button-background` to match the doc. Date field properties summarised to the new `Show label` boolean and text properties. Descriptions rewritten.
- 2026-10-07: **Updated 2026-10-07 (Figma `11529:406`):** the calendar defaults to today's date. A date field opens with today already filled in (`dd/mm/yyyy`, `--text-primary`), and the month grid opens on today's month with today selected. The `dd/mm/yyyy` placeholder only shows in date filters, which start empty: the user profile's from/to range and the automations join-date filter (which shows "Date is required" until a date is picked).
- 2026-09-29: **Updated 2026-09-29 (verified against code):** field padding is 4px 12px with an 8px gap (`DatePickerField.css`); the field label is rendered by the caller and stays `--text-secondary` in Error; outside-month days are clickable; the popover shadow is `var(--shadow-l)`; the keyboard note now reflects that focus does not move into the portalled `DatePickerField` popover; the GSAP popover animation is marked not built; the input.md cross-reference is corrected.
- 2026-09-29: **Updated 2026-09-29 (aligned to prototype usage):** the built date field (`DatePickerField`) rests on `--border-elevated`, shows its value in `--text-primary` with a `--text-disabled` placeholder, and has no hover fill (border only). The current-day ring is `--border-elevated`. Arrow-key movement between days is not built. "Code reality" now points to the shared `DatePickerField` component.
- 2026-09-16: Calendar popover `Source:      Figma Library Calendar 11529:430 (verified 2026-09-16)`
- 2026-07-03: Spec source: Figma Library (`EC26cSVe9KNTCWXvYovakw`) - date field light `12424:2601` / dark `11529:406`, day item light `11916:6094` / dark `5279:26511` (verified 2026-07-03).

## [cards.md](cards.md)

- 2026-10-14: Figma to code updated for the Library settings rework: TEXT and icon swap properties on the card sets, Card/ Category `New` is now a boolean, and every web card has a `State=Focus` variant mapped to `:focus-visible`.
- 2026-10-14: Cards carry Shadow S in both modes. Figma: Shadow S added to the dark Lesson, Resources, Courses, Instructor, External training and Marketplace sets and their light copies merged (Lesson titles bound to Text-primary); Type thumbnail merged too. Code: `--shadow-card` no longer drops to none in dark, and the Lesson grid tile now carries it (was "no shadow").
- 2026-10-13: **Pressed (2026-10-13, Bruno's ruling):** a mobile card that is tappable as a whole (`role="button"`, or the program course card's tappable variant) lightens its fill to `--cards-background-hover` while pressed (`:active`, 150ms, none under reduced motion).
- 2026-10-07: Folder card: Source: `Card/Folder`, light `12427:9698`, dark `10175:3106` (re-verified 2026-10-07).
- 2026-10-07: **Updated 2026-10-07 (Figma `10175:3106`):** hover now shrinks the whole course stack to 5/6 (240 x 164 → 200 x 137) with a smooth 300ms ease-in-out, instead of scaling layers one by one; back layer `--input-background`, middle layer `--cards-background-hover` (hover `--input-background-elevated`); count text `--text-tertiary`; the New Folder tile has a 1.5px dashed `--border-elevated` border and hovers to `--input-background`. Keyboard focus shows the hover state plus the cyan ring. Card-to-info gap is 12px (was 16px).
- 2026-09-29: **Updated 2026-09-29 (verified against code):** card focus rings are cyan `--primary-button-background`; the desktop Category card's Disabled state dims only the title and meta icons (meta labels stay `--text-secondary`); under reduced motion its hover zoom snaps rather than being removed; MobileProgramCourseCard lists all five course states; mobile card states are stated per card.
- 2026-09-29: **Updated 2026-09-29 (aligned to prototype usage):** the shared `SkillCard` is a skill-progress tile, not the skill chip (see Skill card); mobile cards render in dark mode only; the mobile For you screen reuses the Lesson grid tile; the Lesson grid tile has no shadow; the desktop Course card's empty segments use `--border-elevated` and a completed course fills them `--success-500`; the Course mobile card title clamps to 2 lines; the desktop Category card hover zooms the image inside a fixed frame and brightens the glow, and its Disabled state has no tooltip in code.
- 2026-09-29: **Updated 2026-09-29 (Figma `4603:27712`):** the tag radius is 12px on L and 8px on M and S. Six prototype tags were corrected (they used 6px, 9.1px, raw 8px, or 8px on an L tag).
- 2026-08-26: Course card: Source: `Card/Courses`, set `5132:5756` (re-verified 2026-08-26).
- 2026-08-18: Assessment card: Source: `Card/Assessments`, node `10242:2782` (Library file `EC26cSVe9KNTCWXvYovakw`), re-verified 2026-08-18. Assessment mobile list card Figma-verified 2026-08-18 against the Mobile app variants of `Card/Assessments` in dark node `10242:2782`.
- 2026-07-13: Mobile variants verified 2026-07-13 against the dark nodes. Lesson mobile list card Figma-verified 2026-07-13 against the Mobile list variants of `Card/Lessons` in dark node `5144:14181`. Course mobile card Figma-verified 2026-07-13 against the Mobile variants of `Card/Courses` in dark node `5132:5756`. Category mobile card Figma-verified 2026-07-13 against the Mobile variants of `Card/ Category` in dark node `10176:1806`. Instructor card Figma-verified 2026-07-13: `Card/Instructor`, dark `5149:27386`, light `9926:2477`. Scope: Mobile variants documented for Lesson, Assessment, Course, Category, and Instructor (Figma-verified 2026-07-13).
- 2026-07-03: The Figma source is listed only for anyone who wants to re-verify later (file `EC26cSVe9KNTCWXvYovakw`, "Library" - verified against the light/dark nodes on 2026-07-03: Lesson `11916:9353`/`5144:14181`, Assessment `12429:9793`/`10242:2782`, Course `11916:10292`/`5132:5756`, Skill `11828:5184`/`11802:3704`, Category `10574:3913`/`10176:1806`, Folder `12427:9698`/`10175:3106`, Instructor `9926:2477`/`5149:27386`).

## [chips-switcher-tabs.md](chips-switcher-tabs.md)

- 2026-10-14: Figma Content switcher item `icon left` / `icon right` axes became `Show leading icon` / `Show trailing icon` switches; 12 variants deleted.
- 2026-10-14: Figma to code updated: Chip, Content switcher item and Tab items gain `Label` TEXT properties (plus `Count` on tabs), leading and trailing icon swaps, and `State=Focus` variants; the icon axes stay variants because they change padding or gap.
- 2026-09-29: **Updated 2026-09-29 (verified against code):** a second level inside a tabbed page is chips only (a Content Switcher stays allowed for two views of one object in a drawer); tab focus ring is cyan `--primary-button-background`; the Tabs prototype examples now say which is compliant (Roles) and which drifts (Course details); tab gap confirmed at 16px.
- 2026-09-29: **Updated 2026-09-29 (aligned to prototype usage):** Chip props, radius, selected border and the two-icon case now match `src/components/Chip`; the Content Switcher selected label is Bold and the component has no icon slot. There is no shared Tabs component; pages build their own tab bars to this spec.
- 2026-07-03: Spec source (verified 2026-07-03): Chips light `12160:12109` / dark `5162:28510` · Content Switcher light `8953:10123` + item `11908:5278` / dark `7128:23859` + `8497:24186` · Tabs light `11975:2581` (an instance, not a component) + item `12134:6969` / dark `8497:24855` + `1939:18281`.

## [colors.md](colors.md)

- 2026-10-14: Added six status tint tokens (`--success-tint` etc., 16%). Every raw colour in `src/` now uses a token (`color-mix` for other opacities); pure-black shadows use Neutral-900; near-palette purples, greens and near-blacks snapped to Blaze, Success-500 and Neutral-900. Chart colours and decorative gradients are marked exceptions. `pnpm build` now fails on any new raw colour or font size.
- 2026-10-14: Dark-mode `--primary-button-background-pressed` is Primary-600 `#00AFC4`, matching Figma (was Primary-700 `#008393` in code). Applies to filled, outlined, text, link and AI pressed states.
- 2026-10-14: `--input-background-elevated` now matches Figma at 32% in both modes (was 24% in code); `tokens.css` updated.
- 2026-10-14: Restructured to the foundation template (Figma to code tables, Known drift). Corrected to match `tokens.css`: dark Warning/Success button hover and pressed (they darken with the same values as light, they do not go lighter in dark mode); `--input-background-elevated` light is 24% (was documented as 16%); `--selected-fill` is Secondary-100 light / Secondary-800 dark (was documented as `#FCF1DB` / 16% translucent); primary CTA ladder is `--primary-button-background(-hover/-pressed)` (was documented as Primary-600/700/800); overlay panels sit on `--page-background`, not `--cards-background`; border on a modal or drawer is `--border`. Added `--text-quiz` and the remaining code-only tokens. Removed the duplicated CSS token block (it said dark mode was "future" and had a wrong dark `--border`); `tokens.css` is the source.
- 2026-09-29: `--border` usage note: "Follows the Figma variable (Bruno, 2026-09-29)."
- 2026-08-04: > **Updated 2026-08-04** (Figma buttons rework): the primary ladder is now mode-specific - light darkens (700→800→900), dark starts at Primary-500 and goes **lighter** on hover. Warning/Success hovers also go lighter in dark mode. Only Danger keeps one darkening ladder in both modes. (The Warning/Success claim was wrong against both Figma and code; corrected 2026-10-14.)
- 2026-07-06: Code-only tokens: "Dark-mode values shipped in `tokens.css` on 2026-07-06 (translucent `--selected-fill(-hover)` dark stand-ins pending designer review)".
- 2026-07-03: "`src/styles/tokens.css` was aligned to this spec on 2026-07-03: full 100–900 palettes, Figma hex values, Figma token names (`--primary-button-background(-hover/-pressed)`, `--course-assessments`), and `--selected` resolving to Secondary-600 in light mode."
- undated: Frontmatter description: "Replaces the former brand-colors.md, surface-colors.md, and text-colors.md."

## [confirm-modal.md](confirm-modal.md)

- 2026-09-29: (verified against code): shadow now named as `var(--shadow-l)` (what `ConfirmModal.css` uses); the "commit label never repeats the opener" rule softened to a recommendation, matching buttons.md.

## [date-picker-field.md](date-picker-field.md)

- 2026-10-14: The date field shows the amber `--selected` border on `:focus-visible`.
- 2026-10-14: Date field ("Calendar" set) `Label` variant axis replaced by a `Show label` boolean (Label=false variants deleted); new text properties `Label`, `Value`, `Helper text` and `Month`. No Focus variant: Active is the focus look. Description rewritten.
- 2026-10-14: Date field padding is 8px 12px (`var(--space-s) var(--space-sm)`), matching Figma (was 4px 12px in doc and code); height stays 37px.
- 2026-10-14: Removed "There is no `label`, `disabled` or `minDate` prop." The component has a `minDate` prop (`DatePickerField.tsx`); the doc now lists it. There is still no `label` or `disabled` prop.
- 2026-10-07: **Updated 2026-10-07 (Figma `11529:406`):** the field defaults to today's date. Callers initialise `value` to today (or the saved date when editing one); `''` is only for date filters, which start empty: the user profile's from/to range and the automations join-date filter (which shows "Date is required" until a date is picked).
- 2026-09-29: **Updated 2026-09-29 (verified against code):** the popover's Shadow L is named as `var(--shadow-l)`, the z-index wording now gives the layer numbers, the label colour in Error is stated (stays `--text-secondary`), and a keyboard note records that focus does not enter the popover.

## [design-system-guidelines.md](design-system-guidelines.md)

- 2026-10-14: Trimmed from 574 lines to an index: global rules, doc map, quick decision tables. Foundation sections (brand, colour, typography, spacing, radius, icons, accessibility) removed after checking each rule lives in colors.md, typography.md, layout.md or iconography.md; the three-amber table and gamification usage moved to colors.md, the spacing usage column to layout.md, the Ionicons exception to iconography.md; semantic HTML / ARIA rules kept as global rules. Removed the CSS variables template blocks (tokens.css is the source). Corrected values: Medium button padding 10px 20px (was 12px 20px in the padding table); input padding 8px 12px (was 12px 16px); button radius `--radius-sm` 12px (was `--radius-s` 8px); badge pills `--radius-full` (was 40px / `--radius-sm`); `--text-warning` is Warning-600 `#E88206` light / Warning-500 dark (was `#E2A610`); `--text-success` light is Success-600 (was `#18A957`); `--control-selected` is mode-aware (was "#EDA30D both modes"); focus ring `--primary-button-background` (was `--primary-600`); primary CTA `--primary-button-background` ladder (was Primary-600/700/800); links use the Link button ladder (was `--primary-600`); page title 24px on the `<h1>`, section header 20px (was H2 / H3 sizes for page / section); success feedback is a Toast (was "Dialog (Success type)"); overdue is an Error badge (was Warning); removed non-existent tokens `--radius-none` and `--case-study-quiz` (it is `--course-assessments`); removed the responsive type steps (not implemented) and `pnpm add react-icons` (not installed).
- 2026-08-26: Body text: "Each size exists in three weights (Figma `5445:24009`, verified 2026-08-26)".
- 2026-07: Component specs: "Each component has a verified spec file (Figma-checked 2026-07)".

## [dropdown.md](dropdown.md)

- 2026-10-15: Selected menu row fill moved from `--selected` (#EDA30D in light) to `--secondary-500` (#FFBB38, both modes) so it matches the Content Switcher's selected pill (Bruno). The trigger's active border keeps `--selected`. Same change in listbox.md.
- 2026-10-14: Figma to code updated: `Label`, `Value`, `Helper message` and `Error message` TEXT properties and an `Icon` swap; focus stays the existing Active state.
- 2026-10-14: Dropdown fits its content (hug). The fixed-width (230px) light Figma copy `12113:14844` was deleted; the single set `8925:1408` serves both modes.
- 2026-10-14: Menu max height is 320px (was 240px), matching `listbox.md`; `Dropdown.css` updated.
- 2026-09-29: **Updated 2026-09-29 (verified against code):** the superseded Menu sketch (selected `--secondary-500` + `--neutral-800`, `TickCircle`) is replaced by what `Dropdown.css` draws (`--selected` / `--text-on-selected`, no tick) and the React sketch no longer renders a tick; error helper text is `--text-error`; `role="combobox"` and arrow-key navigation marked as not built; the read-only leading-icon grey now depends on `currentColor`; Dropdown and InputField now share the `--text-error` error border (ruled 2026-09-29); the menu border is now `--border-elevated`, matching Figma `9162:1042`.
- 2026-09-29: **Updated 2026-09-29 (aligned to prototype usage):** the built Dropdown supports multi-select (`multiple`, `values`, `onChangeValues`, `allLabel`, `summaryLabel`), option `description` lines, `menuClassName` and `menuAlign`, and portals its menu to `<body>`. The 2026-04-14 changelog line saying multi-select was removed no longer holds, and the "React TypeScript Implementation" sketch below predates these props; `src/components/Dropdown/Dropdown.tsx` is the reference.
- 2026-09-29: **Superseded, see Usage and `listbox.md`:** the older menu sketch that stood here (selected row `--secondary-500` + `--neutral-800`, a `TickCircle` on the selected option, `--neutral-25` fill) no longer matches the built component and has been removed.
- 2026-09-22: **2026-09-22** - Re-verified the trigger against library `8925:1408`. **Medium is 37px**: that node states no height at all, and 37px is the frame with its 1px stroke drawn inside, so the stated frame wins over padding arithmetic (the same way `lg`'s 48px does). The overview table's `41px` had no source and is gone, and the `md` CSS rule now carries the height like `sm` and `lg` do. Chevron colour is `--text-secondary`, not the value's colour. `--border-elevated` is `#DFE1E6` in light, not `#BFC2CC`. Note that node has **no size axis** - Small and Large are not in it and still need their own link.
- 2026-07-03: > **Figma source:** Library (`EC26cSVe9KNTCWXvYovakw`) - light `12113:14844` / dark `8925:1408` (verified 2026-07-03; earlier baseline node `11659:2103` <!-- TODO: node id unknown -->)
- 2026-07-03: **2026-07-03** - Re-verified against light `12113:14844` / dark `8925:1408`. Corrected: medium padding is `8px 12px` (not `8px 16px`); hover background is the translucent `--input-background` (not `--page-background-hover`); label line-height 1.5; helper gap 8px; token table now lists light/dark values.
- 2026-04-14: **2026-04-14** - Rewritten to match the Figma library (node `11659:2103` <!-- TODO: node id unknown -->). Corrected: trigger radius is `12px` (not 8px); trigger background is transparent (not filled `--surface-input`); hover bg is `--page-background-hover` (not `--surface-input-hover`); padding for medium is `8px 16px` (not `10px 16px`); state names are **Enabled / Hover / Active / Read-only**; `iconLeft` is first-class. Multi-select and searchable-within-dropdown are not in the current Figma library node and have been removed from the doc until they are added. (Superseded 2026-09-29: the built component now supports multi-select; see Usage.)

## [empty-state.md](empty-state.md)

- 2026-10-14: Figma Empty state gained Title and Description text properties; descriptions rewritten for Empty state and Illustrations Empty state.
- 2026-10-14: Removed the "code-only extension / Not a Figma variant" labels on `surface="dropzone"`. The Library audit (2026-10-14) found `Surface [Plain, Dropzone]` on `5452:37234`, so Surface now maps 1:1 in the Figma to code table. Removed text: "`surface`: `plain` (default) | `dropzone` (code-only extension)" and "### `surface=\"dropzone\"` - code-only extra / Not a Figma variant."
- 2026-09-29: > **Updated 2026-09-29 (verified against code):** the CTA rule now matches code: a single action may be the outlined button alone (Resources), a pair is outlined then filled (Content); the loading rule is softened, since there is no shared skeleton component.
- 2026-07-13: Visual Spec (Mobile): Figma-verified 2026-07-13 (variant `Device=Mobile`, dark node `5452:37381`).
- 2026-07-03: Spec source: Figma Library (`EC26cSVe9KNTCWXvYovakw`) - light `11921:5779` / dark `5452:37234` (verified 2026-07-03).

## [file-uploader.md](file-uploader.md)

- 2026-10-14: Figma File uploader gained Progress and Error message text properties and State=Focus (L, S) with the cyan focus ring; description rewritten.
- 2026-09-29: > **Updated 2026-09-29 (re-verified against Figma `11546:1560`):** icons are `DocumentUpload` (Linear; `--text-error` in Error) and `DocumentText` (Bold, Filled); the button reads "Select File" in every state, with a `--border-elevated` border and Medium / Small padding (10px 20px L, 8px 16px S), lighting to `--primary-button-background-hover` over a 16% fill on hover, including when the zone is hovered; the L main gap is 20px and the L icon-to-text gap 16px; Error is a `--danger-500` dashed border over a 16% Danger-500 wash with a Regular bulleted list (up to three, then "+N errors"); the progress arc is `--primary-600`. The zone and button have cyan focus rings, and the button no longer opens the picker twice.
- 2026-09-29: > **Updated 2026-09-29 (aligned to prototype usage):** the built component takes a single `errorMessage` (not `errors[]`), has no `onPreview` or Preview button, adds an `icon` prop, uses `ExportCurve` / `ClipboardText` glyphs, draws the Error border in `--text-error` over an 8% danger tint, gives the outlined button a 12px radius and uses a 16px main gap on L. The glyphs, error styling and gaps in this note are superseded by the Figma re-verification note below.
- 2026-09-29: > **Updated 2026-09-29 (verified against code):** frontmatter description updated (single error line, no Preview); `onChangeFile` is only called from Filled; the stale 8px button radius, token names and hover override now match `FileUploader.css`; the Preview button section and the outdated full-component sketch are removed; the progress track is `var(--border)`; the recipes compile against the real props.
- 2026-09-29: ## Full Component / > **Superseded, see Usage.** The earlier inline-styled sketch (with `errors[]`, `onPreview` and a Preview button) has been removed because it did not match the built component. Use `src/components/FileUploader/FileUploader.tsx` with `FileUploader.css` as the reference.
- 2026-07-03: > **Figma source:** Library (`EC26cSVe9KNTCWXvYovakw`) - light `12308:6617` / dark `11546:1560` (verified 2026-07-03; earlier baseline `11362-1265`)

## [filter-bar.md](filter-bar.md)

- 2026-10-14: Figma Filter bar gained Count, Filter 1-6, Filter 1-6 icon and Overflow count properties; description now points to src/components/FilterBar.
- 2026-10-08: Spec source: Figma Library (`EC26cSVe9KNTCWXvYovakw`) component set "Filter bar" `12438:2724` (added 2026-10-08), variants `State = Empty | Filled` x `Expanded = false | true`.

## [gamification.md](gamification.md)

- 2026-10-14: Illustrations/ Assessments light copy merged into the dark set (44px Lesson quiz mobile artwork kept).
- 2026-10-14: Figma Learning path gained Description and Progress text properties, Quiz/Options gained Label and Explanation text properties and desktop State=Focus; every Gamification set description rewritten.
- 2026-08-17: Assessment illustrations: Source: Figma `Illustrations/ Assessments`, frame `9120:8850` (classic six downloaded 2026-07-13, interactive four 2026-08-17).
- 2026-07-13: Skill level illustrations: Source: Figma `Illustrations/ Learning path`, frame `9120:9437` (downloaded 2026-07-13).
- 2026-07-13: Progress illustrations: Source: Figma `Illustrations/ Progress`, frame `10157:9081` (downloaded 2026-07-13).
- 2026-07-13: Certificate illustrations: Source: Figma `Illustrations/Certificate`, frame `9120:9301` (downloaded 2026-07-13).
- 2026-07-13: Gamification hero illustrations: Source: Figma `Illustrations/Gamification`, frame `11196:7607` (downloaded 2026-07-13).

## [headers.md](headers.md)

- 2026-10-14: Figma Header description rewritten; no property changes (all content lives in slots).
- 2026-10-14: Page Header titles are `<h2>` (were `<h1>`) and Section Header titles are `<h3>` (were `<h2>`). Code updated on 13 web pages and the shared `SectionHeader`; the mobile app keeps its own `<h1>` titles.
- 2026-09-29: > **Updated 2026-09-29 (verified against code):** Page Header prototype now cites Roles (24px `<h1>`) instead of User profile (20px); page tab gap is 16px; CTA gap is 16px and the Section Header section gap 16px, matching code (Figma draws 12px); the stale `SectionHeaderProps` and sample are replaced by the real prototype props; the non-existent `assets/headers.css` links are removed; focus rings are cyan `--primary-button-background`; the Section Header divider stays `--border` inside drawers and modals.
- 2026-09-29: > **Updated 2026-09-29 (aligned to prototype usage):** breadcrumb link and current rows in the Page Header typography table are now 14px Regular / 1.5, matching `Breadcrumb.css` (was 12px / 1.2).
- 2026-09-29: > Superseded, see Usage: the older `SectionHeaderProps` here (eyebrow, tabs, chips, icon, avatar) and its component sample described an API the prototype never built. The real component is `src/pages/your-courses/components/SectionHeader/SectionHeader.tsx`:
- 2026-07-03: Spec source: Figma Library (`EC26cSVe9KNTCWXvYovakw`) - light `9531:2974` / dark `7902:1018` (verified 2026-07-03).

## [iconography.md](iconography.md)

- 2026-10-14: Figma Linear `Mobile` and `Refresh` redrawn from the iconsax-react paths (Mobile centred) and renamed; every icon used in code is now findable in both styles.
- 2026-10-14: Figma Icons page renamed to exact iconsax-react names (1,969 of 2,016 glyphs, matched by path geometry, style prefix kept: `vuesax/linear/ArrowDown2`). All 88 icons used in code are findable in Bold; Linear lacks `Mobile` and `Refresh`. Some old names changed meaning by geometry (e.g. `send` is `Transmit`, `undo` is `Back`).
- 2026-10-14: Restructured to the foundation template (Figma glyph and `Icons` set to Iconsax / custom component mapping, Known drift for icon names). Icon colours moved from raw `--neutral-800/500/300` to `--text-primary/secondary/disabled` (raw neutrals don't flip in dark mode; code already uses the semantic tokens). Navigation example corrected to `navigation.md`: inactive `--text-secondary` Linear, active `--text-selected` Bold (was `--neutral-500` / `--primary-600`). Quiz example uses `--course-assessments` (`--case-study-quiz` does not exist). Ionicons exception (`IoCloseOutline`, `IoInformationCircleOutline`, inline SVG) and the explicit `color` prop rule moved in from design-system-guidelines.md / project notes. Removed the Resources links to `assets/iconography.css` and `references/usage-guidelines.md` (neither exists).
- 2026-07-13: Skill illustrations source: "Source: Figma `Icons/Skill Icon/*` + `Illustrations/Skill Hugo/*` (frame `9120:10291`, downloaded 2026-07-13)."

## [impersonation-banner.md](impersonation-banner.md)

- 2026-09-15: > **Spec source:** Figma People - Normal `9600:43180`, Warning `9601:44620`, Critical `9601:46094` (2026-09-15).

## [input.md](input.md)

- 2026-10-14: Figma Input sets reworked: Outlined Label and Helper text axes became Show label / Show helper text booleans, Radio Label became Show label; text properties (Label, Placeholder, Value, Helper text, Error message, Title, Description and placeholders) and an Icon swap on Outlined added; descriptions rewritten. Figma to code tables updated.
- 2026-10-14: `--input-background-elevated` is 32% in both modes, matching Figma (was 24%).
- 2026-10-09: **Updated 2026-10-09 (Integer re-verified against Figma `10145:10895`):** the Integer field is **37px** high, the same as the medium Dropdown (`8925:1408`), so the two line up in a row. Its 24px hover circles overhang the 8px padding instead of growing the field to 42px.
- 2026-09-29: **Updated 2026-09-29 (verified against code):** fixed the border-weight note (cards use `--border-elevated`), the card-fill hover wording (`InputField` always uses `--input-background`; callers override), light `--input-background-elevated` (24%, not 16%), the Integer resting value colour (`--text-primary`), the Radio label weight (600) and the error-timing guidance; removed raw hex fallbacks and the search example.
- 2026-09-29: **Updated 2026-09-29 (Inline re-verified against Figma `10330:4736`):** Inline is now a shared component, `InputInline`, with sizes L (Bold 32 / Regular 16) and M (Bold 20 / Regular 14). The error message sits between the title and the description, and there is no error icon (the earlier "24px Danger at the row end" is removed). Course details, Program builder and Automation details use it.
- 2026-09-29: **Updated 2026-09-29 (aligned to prototype usage):** `InputField` is a default export at `@/components/InputField/InputField` (there is no `ui/` folder), and it also takes `validation="warning"`, `onBlur` and `autoFocus`. `InputInteger` takes a `suffix` (e.g. `%`). The Import and Props sections below now match the code.
- 2026-08-25: **The label is Paragraph M semibold** (Figma `5445:24009`, 2026-08-25)
- 2026-08-20: Spec source node ids "(re-verified 2026-08-20)": set light `12114:20552` / dark `11180:1982`; Outlined `12114:20561`/`8974:24610`; Inline `12300:6403`/`10330:4736`; Radio `12114:20857`/`8974:30479`; Integer `12114:20914`/`10145:10895`.
- 2026-08-20: **2026-08-20 - field borders use `--border-elevated`.** The border token was split in two: `--border` is the quiet weight for the page ground and inside drawers and modals, and `--border-elevated` is one step stronger, used on cards and menus and for field chrome. Enabled, filled and success borders are `--border-elevated`.
  > **Disabled drops back to `--border`.** A disabled field should not hold an edge as firmly as a live one, so every disabled control - Outlined, Radio, Integer, and the Chip and Dropdown outside this doc - uses the quiet weight. The Radio, Integer, Chip and Dropdown sets all bind their disabled variants to `Border` in Figma; only the Outlined set still paints `Border-elevated`. Four-to-one - treat the Outlined disabled binding as stale, and `--border` as the rule.

## [layout.md](layout.md)

- 2026-10-14: `--shadow-card` is Shadow S in both modes (was none in dark).
- 2026-10-14: Restructured to the foundation template (Figma variable and effect style to CSS token tables, Figma only / Code only lists, Known drift). Spacing usage column moved in from design-system-guidelines.md, with `--space-ssm` corrected to Button M padding-y (Button L uses 12px) and `--space-sm` to input padding-x (inputs pad 8px 12px). Badges moved from `--radius-sm` to `--radius-full` per `badges.md`. Removed the duplicated `:root` token blocks (the spacing one was missing the 2/6/10px tokens and `--radius-l`); `tokens.css` is the source.
- 2026-09-29: > **Updated 2026-09-29 (verified against code):** Shadow L is the level for dialogs, modals, menus, dropdowns, tooltips and popovers; XL is currently unused; raw leftward Shadow L values are to be written as `var(--shadow-l)`; the shared Canonical spec line now has its own heading instead of sitting under Scrim.
- 2026-09-29: > **Updated 2026-09-29 (aligned to prototype usage):** §3 and §4 now match the code: Medium buttons pad `10px 20px` (`--space-ssm` / `--space-ml`), inputs pad `8px 12px` (`--space-s` / `--space-sm`), and buttons, dialogs and modals round at `--radius-sm` (12px), per `Button.css`, `InputField.css` and `ConfirmModal.css`.
- 2026-09-29: Shadows: "Shadow L itself is leftward in Figma, and the token matches it (re-verified 2026-09-29)."
- 2026-08-26: "XXS / XSS / SSM (2/6/10px) were added 2026-08-26 for micro spacing inside components."
- undated: Scrim code note: "`tokens.css` ships both values today."
- undated: Frontmatter description: "Replaces the former spacing.md; single source for shadow and scrim values."

## [listbox.md](listbox.md)

- 2026-10-14: Figma List items get Label, Description, Helper text and Skill icon glyph properties and State=Focus variants (2px inset ring); all on/off axes stay variants. Listbox and List items descriptions rewritten. Figma to code table updated.
- 2026-10-07: **Updated 2026-10-07 (Figma List items dark `9162:941`):** new **Integer** variant (radio + supporting text + Input integer stepper and a "day" / "days" unit, `12432:11845`), used by the Assign courses timing popover. **Selected + Hover** variants exist for every row type. **Rows with a checkbox or radio do not fill amber when selected**: the control carries the selection, hover is `--cards-background-hover` (the built `Dropdown` already does this). Checkbox rows have a 12px control-to-label gap. The Search row has Enabled, Hover, Selected (focused, amber border + clear ×) and Read-only states.
- 2026-09-29: **Updated 2026-09-29 (verified against code):** arrow-key navigation marked as not built; danger icons turn red only with `color="currentColor"`; shadow named `var(--shadow-l)`; supporting-text rows now state both built variants (`RowActionsMenu` label 500 + `--text-tertiary`, `Dropdown` label 600 + `--text-secondary`).
- 2026-09-29: **Updated 2026-09-29 (aligned to prototype usage):** the container border and group divider are now `--border-elevated` (a menu is an elevated surface; `RowActionsMenu` already draws it this way), the selected row uses the mode-aware `--selected` rather than raw `--secondary-500` (as the built Dropdown menu does), and the leading icon is `--text-primary`.
- 2026-09-16: Supporting text slot: Figma Library List items `10187:2585` (verified 2026-09-16)
- 2026-07-03: Spec source: Figma Library (`EC26cSVe9KNTCWXvYovakw`) - Listbox light `11923:3466` / dark `9162:1042`, List items light `12432:13357` / dark `9162:941` (verified 2026-07-03).
- (undated): **`dropdown.md`** - the dropdown trigger opens this listbox (its previous "extrapolated menu" section is superseded by this spec).

## [navigation.md](navigation.md)

- 2026-10-14: Figma navigation reworked: Label text properties on admin and learner menu items and Breadcrumb item, Icon swap on learner items, State=Focus variants on menu items and breadcrumb links, Show link 3/4/5 booleans on Breadcrumb (current page moved last); descriptions rewritten. Figma to code tables updated.
- 2026-10-05: `src/pages/your-courses/components/AddContentMenu/` - the Create Course Add Content picker. It replaced the right-edge rail on 2026-10-05 (user feedback: the rail icons confused admins) and is a DS listbox (listbox.md) with hover flyouts, not this menu-item language. Figma: Create Course `10210:26756`.
- 2026-09-29: > **Updated 2026-09-29 (re-verified against Figma `5385:20161`):** Exit Admin is Small; the icons are 20px `--text-primary` (Logout Bold) in 36px hover circles, 16px apart and 32px from the edge.
- 2026-09-29: > **Updated 2026-09-29 (verified against code):** the learner (Web app) shell is recorded as hand-rolled per page (`.mt-topnav` / `.mt-side`), not "not built"; the section-eyebrow claim is removed; Admin menu metrics, sub-item padding (42px / 12px) and mobile header chips now match the CSS; the program-course breadcrumb sits in `.pcd-header`; Breadcrumb focus ring is cyan `--primary-button-background`.
- 2026-09-29: > **Updated 2026-09-29 (aligned to prototype usage):** "Code reality" now matches `TopNav.tsx`: the background is `--page-background`, the Moon/Sun button toggles dark mode, and Logout opens a menu. It also records the `LeftSidebar` drift (sub-menus mount without `Collapse`, no `aria-current`, selected icons on `--secondary-600`).
- 2026-08-13: > Reversed 2026-08-13. The assembled panel (`12048:2302`) draws sub-items at `44px` left / `8px` vertical, the item component at `42px` / `12px`; this doc previously took the panel as reference. The component set - `10372:4045`, which carries the full Menu/Sub-menu × selected × Enabled/Hover matrix - is now the reference, so sub-items are **42px / 12px** and menu items share the same `12px 16px` row metrics. `LeftSidebar` follows this.
- 2026-08-13: `src/components/LeftSidebar/LeftSidebar.tsx` aligned to `10372:4045` on 2026-08-13: row metrics `12px 16px`, sub-items indented 42px, hover `--input-background`, selected `--text-selected` (was `--secondary-600`, which matched only in light mode).
- 2026-08-13: Breadcrumb code reality: three pages predate it and hand-roll the same trail with their own classes, which is how they drifted (all three had a `--text-secondary` hover and no underline until 2026-08-13). They now match the state table above.
- 2026-07-13: Mobile App Navigation Figma-verified 2026-07-13: `Top nav/ App` `1910:18375`, `Tab nav` `1324:35285` (dark nodes; semantic tokens resolve per mode).
- 2026-07-07: Breadcrumb spec source: Figma Library (`EC26cSVe9KNTCWXvYovakw`) - dark `8497:2231` / `8497:1494`, light `11935:2368` / `8517:34946` (verified 2026-07-07).
- 2026-07-03: Spec source: Figma Library (`EC26cSVe9KNTCWXvYovakw`) - Top nav light `12328:8954` / dark `5385:20137`; Side navigation light `12048:2302`, Web-app items `12048:2401`, Admin items `12048:2440` / dark `4697:13314`, `4674:25675`, `10372:4045` (verified 2026-07-03).

## [overlays.md](overlays.md)

- 2026-10-14: Figma Dialog buttons swapped from an orphaned old Buttons set to the current Buttons set (labels kept).
- 2026-10-14: Side Drawer slides in and out with `ease-in-out` (was cubic-bezier(0.32, 0.72, 0, 1) in the doc, and four different curves across the 13 page drawers); code updated on every right-hand drawer and the content that shifts with it.
- 2026-10-14: Modal entrance is scale 0.96 → 1 with `ease` over 250ms, matching the Dialog. Bottom Sheet bottom padding is `var(--space-l)` (24px) in doc and code (was 20px in the doc, 32px in code).
- 2026-10-13: (Bruno's ruling, replaces the 2026-09-29 note): a Dialog has **no** Close (×) button and does **not** close on backdrop click or Escape; the user leaves only through its action buttons. Modals and Side Drawers keep the Close (×), backdrop click and Escape. In code, `ConfirmModal`'s `closable` prop is the switch: off = Dialog, on = Modal.
- 2026-09-29: (verified against code): Side Drawer prototype pointers now name the drawers that use `useOverlayA11y` + `CloseButton` (and where `.side-drawer__*` lives); the hand-rolled `.overlay-close` CSS is replaced by `<CloseButton />`; the Dialog React sample is now `ConfirmModal` + `Button`; Modal and Side Drawer samples use `CloseButton` and `Button`; Warning and Error filled labels are `--neutral-25`; buttons use `--radius-sm` (12px); `.dialog` max-width is 100%; shadows are `var(--shadow-l)`; the drawer backdrop is `var(--scrim)`; divider hex fallbacks removed; the Accessibility table reflects `ConfirmModal`'s `alertdialog` + `aria-label`.
- 2026-09-29: (Bottom Sheet added, Figma Library `7479:106`): the mobile Bottom Sheet is a shared component, `BottomSheet`, with a `--scrim` overlay, a long decelerating rise and drag-to-dismiss.
- 2026-09-29: (aligned to prototype usage): Dialog and Side Drawer Cancel buttons are **Outlined-2** (`<Button variant="outlined-2">`), not primary Outlined; the Dialog is **560px** wide (`ConfirmModal.css`), not 345px; the Accessibility table now matches the Dialog close behaviour above.
- 2026-09-28: Full-screen close button Figma reference: Programs `4221:63780` - DS `Icons` set, `Name=close, Type=linear` instance with overrides (verified 2026-09-28).

## [program-certificate.md](program-certificate.md)

- 2026-07: Figma-verified (2026-07). Nodes: **Locked** `2495:20734`, **Unlocked card** `2510:23596` (the issued document itself is `2504:51984`, opened/downloaded via the card). File `vZnrpDkWeiDM259uLeY396`.

## [resource-card.md](resource-card.md)

- 2026-10-14: Figma to code updated: `Title` and `Meta` are TEXT properties, `Action icon` is an icon swap, and the Web/Admin card has a `State=Focus` variant that rings the action button.
- 2026-09-30: Hovering the icon shows the DS Tooltip at every size on web, including `device="mobile"` cards on desktop For You (Bruno, 2026-09-30).
- 2026-09-29: **Updated 2026-09-29 (learner cards):** the whole card downloads or opens on learner surfaces; the mobile card drops the tooltip, since there is no hover on a phone.
- 2026-09-29: **Updated 2026-09-29 (aligned to prototype usage):** the Mobile type tile is 40px (as in the code and the Anatomy table), not 56px; the code sample section is renamed "Example" so this doc has one Usage section.
- 2026-09-21: Figma source verified 2026-09-21 - the set gained Image, and External Link moved to `12230:2631`.

## [row-actions-menu.md](row-actions-menu.md)

- 2026-10-14: Figma to code table updated for the new List items Label and Description text properties and the Focus state.
- 2026-09-29: (verified against code): leading icons now `color="currentColor"` (`.ram-item-icon` supplies `--text-primary`); the unsupported "single action → Small Button" rule removed; disabled-item wording reworded; shadow named `var(--shadow-l)`; focus ring corrected to `--primary-button-background` (what `RowActionsMenu.css` uses); stale listbox `--border` bullet removed.

## [search.md](search.md)

- 2026-10-14: Figma Search set gets Placeholder and Value text properties and a rewritten description; Filled stays a variant (text colour and layout change too). Figma to code table updated.
- 2026-09-30: **On a card or menu, Search uses `--border-elevated`** (Bruno, 2026-09-30): pass `elevated`. In dark mode `--border` equals `--cards-background`, so the quiet border disappears on a card. Hover (`--border-hover`) and Active (`--selected`) are unchanged. This overrides the earlier "never elevated" note and the Figma dark set, which has no `Border-elevated` binding yet.
- 2026-09-29: **Updated 2026-09-29 (verified against code):** the clear icon is `--text-secondary` in the Token Summary and CSS sketch (the sketch also now shows the built hover and the cyan focus ring); the Do / Don't no longer mentions an `onKeyDown` prop, which does not exist.
- 2026-09-29: **Updated 2026-09-29 (clear button):** the clear (×) hover is a circular `--input-background-hover` fill with the icon moving to `--text-primary`, replacing the opacity fade; the hit area is 24px (28px at L), padded inside a negative margin so the field height is unchanged.
- 2026-09-29: **Updated 2026-09-29 (aligned to prototype usage):** every call site in the prototype uses size **M**, including page-level searches (Programs header, course list, My Team toolbar), so the size guidance in "Do / Don't" now says M is the default everywhere and L is unused. "Code reality" now reflects that the active border already uses `--selected` and lists the built props.
- 2026-09-29: Removed "Code reality" section (its props list omitted `elevated`; drift items moved to the Production table). Verbatim: `src/components/Search/Search.tsx` implements this component. The active border uses `--selected`, as specified. Remaining drift from the node: the clear glyph is an Iconsax `Add` rotated to an × instead of io5 `IoCloseOutline`, and the L radius is written as a raw `16px` rather than `var(--radius-m)`. The built props are `size`, `value`, `placeholder`, `onChange`, `onClear`, `onFocus`, `onBlur`, `className` and `ariaLabel`; `state` and `filled` in the Props table are Figma variant axes, derived from `:hover`, `:focus-within` and `value.length` rather than passed in. Sizes, padding and the other state tokens match.
- 2026-09-22: **2026-09-22** - Clear icon moved from `--text-tertiary` to `--text-secondary`, matching the close glyph on CloseButton and the dismissible badge. The border stays on `--border` (see States) - that is deliberate and was re-confirmed.
- 2026-07-03: Spec source: Figma Library (`EC26cSVe9KNTCWXvYovakw`) - light `11927:6338` / dark `697:33529` (verified 2026-07-03).

## [selection-controls.md](selection-controls.md)

- 2026-10-14: Checkbox gained its `:focus-visible` ring (2px `--primary-button-background`, 2px outside the box).
- 2026-10-21: Toggle off track is `--text-disabled` in code and docs, matching the Library (code was raw `--neutral-400`, which does not flip in dark mode).
- 2026-10-14: Figma to code updated: Checkbox and Radio gain `State=Focus` variants, Toggle gains a `State` axis (Enabled / Focus); the Checkbox focus ring is Figma only until `Checkbox.css` adds one.
- 2026-10-09: > **Updated 2026-10-09 (re-verified against Figma light `11917:3950` / dark `5001:18926`):** the Radio ring keeps its resting colour on hover (`--text-primary` unselected, `--control-selected` selected); hover adds only the `--page-background-hover` halo. The earlier `--border-hover` ring on hover had no Figma source and is removed.
- 2026-10-07: > **Updated 2026-10-07 (Figma `6339:10484`, verified against code):** the checkbox tick and minus bar are not white. They are cut out of the filled box, so the surface behind shows through: light on light pages, dark in dark mode. `Checkbox.tsx` draws the Figma shapes as single filled paths in `--selected`. Figma has no disabled-checked variant (Disabled exists only as Not checked), so a disabled box that is checked keeps the `--selected` fill; only the empty box turns `--text-disabled`.
- 2026-09-29: > **Updated 2026-09-29 (verified against code):** the Common Patterns and indeterminate examples now compile against the real Checkbox API (`checked`, `indeterminate`, `onChange()`, `disabled`; no label, name or aria-label); the unchecked checkbox border is `--text-secondary`; `--control-selected` light/dark values stated; halo radius is `var(--radius-full)`; Radio and Toggle CSS and React samples now mirror the built components (tokens, no raw hex); `className` behaviour and `size="sm"` usage corrected.
- 2026-09-29: > **Updated 2026-09-29 (aligned to prototype usage):** Toggles are used inside Save forms in the prototype (report scheduling, course settings), so the "never inside a Save form" rule is replaced by the Key rule below. `--control-selected` is `#FFBB38` in dark mode, not `#EDA30D`. The built Checkbox is a button with no label prop, draws its unchecked border in `--text-secondary` and fills with `--selected`. Toggle has a `size="sm"` variant.
- 2026-07-03: Spec source: Figma Library (`EC26cSVe9KNTCWXvYovakw`) - Checkbox light `11917:3924` / dark `6339:10484`, Radio light `11917:3950` / dark `5001:18926`, Toggle light `11917:3970` / dark `8160:364` (verified 2026-07-03).

## [stepper.md](stepper.md)

- 2026-10-14: Light sets confirmed on the 20px badge 2026-10-14 (spec source: Figma Library `EC26cSVe9KNTCWXvYovakw`, page "Stepper" `8108:4254`, doc frame `8108:5539` - light `12451:237` / dark `8108:5543`; step sets light `12468:3923` / dark `12451:95`; Stepper light `12468:4115` / dark `12451:207`).
- 2026-10-13: Re-verified against the dark sets (spec source as above).
- 2026-10-13: **2026-10-13 (Library edits)** - Smaller badge and pill: badge 20px (was 24), number 12px / 500 (was 14px / 600), pill padding 4px all round (was 4px 12px 4px 4px), step 29px high (was 32), Current label Medium 500 (was Semibold 600), count 4px after the label (was a space), Done tick 1.25px. Verified against step set `12451:95` and Stepper `12451:207` (dark).
- 2026-10-12: **2026-10-12 (Library edits)** - Upcoming ring is `--border-elevated` at rest as well as on hover (was `--border`); lines between steps are `--border-elevated` (was `--border`). Verified against Stepper `12451:207` and step set `12451:95`.
- 2026-10-09: **2026-10-09 (Library edits)** - Upcoming ring is `--border`, stepping up to `--border-elevated` on hover (was `--border-hover`); labels are Regular 400 (was Medium 500); lines are the Library Divider in `--border` (was `--border-hover`). Light set rebuilt: step set `12452:1541`, Stepper `12452:1419`, usage `12452:1378` (the two sets have since been replaced by `12468:3923` and `12468:4115`).
- 2026-10-09: **2026-10-09** - Built in the Library with Light and Dark sets. Steps not reached yet no longer use a disabled look (`--text-disabled` / `--border`); they match Upcoming and are only non-clickable.

## [table.md](table.md)

- 2026-10-14: The action icon button and the row kebab trigger gained a `:focus-visible` ring.
- 2026-10-14: Figma Table header `Checkbox` and `Icon` axes became `Show checkbox` / `Show icon` switches (gap 4px, checkbox wrapped with 8px right padding so spacing is unchanged); 6 variants deleted.
- 2026-10-14: Figma Table row gained State=Focus (unselected and selected); Table header gained Label and Icon glyph; Table data gained Label, Supporting label, Date label, Percentage, Icon glyph, Info icon and Action icon; all Table set descriptions rewritten; no on/off axis converted.
- 2026-10-14: Action column is `flex: 0 0 56px`; `.tbl-col-action` in `Table.css` updated from 52px.
- 2026-10-14: Frontmatter description and the ASCII diagram said the header is "borderless"; changed to "filled header bar" to match `Table.css` (`.tbl-head { background: var(--input-background) }`) and the body rule.
- 2026-10-06: > **Updated 2026-10-06 (re-verified against Figma table data, light `12422:2181` / dark `11766:619`):** the primary line of a two-line cell is Poppins **Medium 500** (was Semibold 600); hovered cell text is `--primary-button-background-hover` (the Figma binding; was `--text-button-hover`); thumbnails are 72×44 (was 90×44); the action-icon hover disc is `--input-background-hover` (was `--input-background`); a progress-bar cell has an 8px gap between bar and label (was 12px); a checkbox in a row hovers with a circular `--cards-background-hover` disc. Single-line cell text stays Regular 400.
- 2026-10-06: Spec source: ... cell types light `12422:2181` / dark `11766:619` (re-verified 2026-10-06).
- 2026-10-06: **Flagged, not changed (2026-10-06):** the Avatar group cell in Figma table data overlaps its 32px avatars by `-8px` ... (drift text kept in the doc under Figma to code, date removed).
- 2026-09-29: > **Updated 2026-09-29 (aligned to prototype usage):** the sort arrow in "Header types" is 16px `ArrowDown`, revealed on hover and rotated for direction, matching `UserProfile.tsx`; it was listed as a 20px arrow.
- 2026-09-29: > **Updated 2026-09-29 (verified against code):** selected rows now read `--selected-row` / `--selected-row-hover` throughout (the raw Secondary-500 12%/24% text is gone); the stale CSS block and React sample are replaced by a short example of the real `Table` API; date year is `--text-tertiary`, thumbnail 90×44, action-icon hover `--input-background`; avatar cells use `<Avatar>` / `<AvatarGroup>`; `RowActionsMenu` takes `ariaLabel`; tables in drawers and modals keep `--border`.
- 2026-09-29: > **Updated 2026-09-29 (re-verified against Figma table data `11766:619`):** selected rows use the new `--selected-row` / `--selected-row-hover` tokens (Figma `Selected-row` / `Selected-row-hover`, Secondary-500 at 16% / 24%, both modes); row and header checkboxes sit in a 24px hit area in a 48px column (was 32px in 52px); single-line cell text is Regular 400 and only the primary line of a two-line cell is Semibold 600.
- 2026-09-29: ## CSS and React / > Superseded, see Usage: the full CSS block and hand-written React component that lived here predated `src/components/Table` (raw amber selected rows, a `.sort` span, fake checkboxes, `.avatar-32` / `.avatar-40` classes, `key={i}`, no `getRowKey`). `Table.tsx` and `Table.css` are the reference; don't copy styles out of them, use the component.
- 2026-07: The header is a **filled bar** ... (Updated 2026-07 - was previously borderless/transparent.)

## [typography.md](typography.md)

- 2026-10-14: Added `--font-size-display` (48px, Figma Display). Every raw font size in `src/` now uses a token; the 60px stat numbers became 48px, 18px became 16px, 22px and 28px became 24px. 8px and 10px avatar counters and tiny labels are marked exceptions.
- 2026-10-14: Figma H6 (12) text style line height set to 120%, matching code (`h6` 1.2); the Typography page labels updated. Drift resolved.
- 2026-10-14: Restructured to the foundation template (Figma text style to CSS class and `--font-size-*` token table, Known drift for H6). The `--font-size-*` tokens now exist in `tokens.css`; the doc no longer says the prototype writes sizes as literal px. Page title corrected to 24px (H2 style, rendered as the page's `<h1>`) and section header to 20px (H3 style), per `headers.md`. Text colour class comments now name the semantic tokens.
- 2026-09-29: > **Updated 2026-09-29 (aligned to prototype usage):** heading and body colours are the semantic tokens `--text-primary` / `--text-secondary` used in `src/styles/typography.css` (were raw `--neutral-800` / `--neutral-500`, which don't flip in dark mode). The "CSS Custom Properties" list is marked as not defined in `tokens.css`.
- 2026-09-29: > **Updated 2026-09-29 (verified against code):** removed the `.text-button-*` classes (they don't exist) and the responsive size steps (not implemented, off-scale); field labels are `--text-secondary`, not tertiary; removed links to `assets/typography.css` and `references/usage-guidelines.md` (neither exists); listed the sanctioned off-scale component exceptions.
- 2026-09-29: Responsive typography: "The older tablet and mobile steps listed here (28px, 22px) were off the type scale and have been removed."
- 2026-08-26: Paragraph Medium (500): "Figma Library `5445:24009` (row `12132:2824`, verified 2026-08-26)."
- 2026-08-26: Paragraph Semibold (600): "Figma Library `5445:24009` (row `6634:1291`, verified 2026-08-26)."
