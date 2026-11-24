# DES-371: Scenario media for situational tests - pre-build UX audit

Audited: 2026-11-24 · Stage: before build · Reviewer: ux-auditor (fresh, no part in the PRD discussion)

Inputs: the PRD (`2026-11-24-DES-371-situational-test-scenario-media.md`), the journey SVG, the current code, the design system docs, and two screens captured today from `http://localhost:5173`:

- `2026-11-24-DES-371-ux-audit-screens/des371-01-admin-drawer-step1-brief.png` - Add Situational Test drawer, step 1 (light)
- `2026-11-24-DES-371-ux-audit-screens/des371-02-quiz-lab.png` - a question screen with `QuizHeader` at phone width (dark)

Not captured: the admin Preview (brief card and question screens). It only opens from the AI review path, and that path needs a course with lessons first; it was read from `SituationalTestPreview.tsx` instead. The Claude Design artifact was not opened; the SVG next to the PRD is the same journey.

**Verdict: Ready after plan fixes.** The job and the chosen pattern (one clip on the brief, one overlay from every question) are sound. The plan is not yet buildable in the order written, and six behaviours that decide whether learners feel safe to move on are not specified.

---

## 1. Audit steps

- Read the PRD, journey and code the plan touches; capture today's screens.
- State the job, the trigger and the progress for admin and learner.
- Walk each journey step against its job stage and the planned screen.
- Check the planned UI against the design system docs (file uploader, overlays, confirm modal, mobile).
- Run Nielsen's 10, a WCAG pass and a copy review on every planned string.
- Compare with Build For Mars and Mobbin.
- Check the plan: journey coverage, acceptance criteria, confirm stage, blockers and order.

## 2. Audit plan

| Criterion | Description | Pass/Fail | Notes |
|---|---|---|---|
| Nielsen's 10 | Status, match, control, consistency, error prevention, recognition, flexibility, minimalism, recovery, help | Partial | See section 5; weakest on status, consistency and recovery |
| WCAG 2.2 AA | 1.2.1, 1.2.2, 1.4.2, 2.1.1, 2.1.2, 2.4.3, 2.5.8 | Partial | No autoplay and keyboard are covered; the text alternative when media fails or has no captions is not |
| Visual design | Hierarchy, tokens, existing DS components only | Partial | Five undocumented pieces (Blocker 2); no rule for media size |
| Interaction design | States, reversibility, layer depth, focus return | Partial | Uploading + Save, ended clip, and Start while playing are undefined |
| Accessibility | Keyboard, focus order, screen reader, reduced motion | Partial | Escape order across stacked layers is a named risk, not a spec |
| Brand and copy | 5Mins voice, British English, button Title Case | Partial | "Brief" and "Scenario" name the same thing; size errors do not match the limits |
| Mobbin / BFM | Comparable patterns | Pass | Overlay over the question and pause when covered are well supported |

## 3. The job

**Learner.** When a question asks about a detail of a workplace scenario I watched a minute ago, I want to check that detail again, so I can answer on what happened, without losing my answer, my place or one of my attempts.

- Trigger: a question I can't answer from memory. Today the brief has gone by then.
- Progress: from guessing and hoping, to answering with the scene in front of me.
- Dominant force: anxiety. Attempts are limited (hearts in `QuizHeader`), so leaving the question feels risky.

**Admin.** When a customer hands me an acted clip for a scenario, I want to attach it to the test and see it the way my learners will, so I can publish without checking on a second device, without rebuilding the test.

- Trigger: a file arrives from outside the product.
- Progress: from "where does this go?" to "it is on the test and it plays".
- Dominant force: anxiety about publishing something learners can't play.

**Stage each surface should support**

| Surface | Stage it should support | Where it is weak |
|---|---|---|
| Drawer, Brief (A2-A5) | Orient, Act, Confirm | Confirm covers "does it play", not "what will learners see" |
| Drawer footer and outline (A6-A7) | Confirm | On create and edit there is no confirm step at all |
| Brief card (L1-L4) | Orient, Decide | Asks for a decision (start now?) before saying the scenario stays reachable |
| Question screen (L5) | Act | The way back to the scenario depends on noticing one header control |
| Scenario overlay (L6-L7) | Orient, then back to Act | Good on paper; several player behaviours are unspecified |
| Result (L8) | Confirm | No result screen exists in the prototype and no phase builds one |

## 4. Layout and visual analysis

**Layout**

- Admin field under Brief (screenshot 01): the drawer has room, and one field under Brief is the right place. Good.
- Brief card: the plan puts media "at the card's width" between the title and the brief. The PRD's own admin guidance recommends portrait 9:16 clips. A portrait clip at card width is taller than the screen, so the brief text and "Start Situational Test" drop below the fold. This is the same reason the PRD gives for rejecting the inline card on questions.
- Web overlay: `ConfirmModal` is 560px wide. A 9:16 clip at that width is about 995px tall, taller than most laptop viewports.
- Question header (screenshot 02): at phone width `QuizHeader` already holds the format label, the attempts badge, three hearts and the close, with roughly 80px free. A text button "Scenario" beside the close does not fit next to a long label such as "Multiple choice, multiple correct", and sits next to the control that leaves the test.
- Admin Preview: the plan opens the Scenario overlay inside the Preview, which is already a modal over the drawer. With full screen that is four layers. The plan does not say whether the Preview shows the web modal or the mobile sheet.

**Typography**

- Nothing new is proposed. The brief card keeps its existing styles. The overlay title uses `SectionHeader`, which matches the house rule for overlay titles.

**Colour**

- Remove icon turns `--text-error` on hover, per the house rule. Field active and toggle rules are not affected. No issues.

**Interactions**

- Uploading while the admin keeps editing: good. What "Save & Add Questions" does at 60% is not defined.
- "Change File" with a file that fails validation: not defined whether the current media survives.
- Remove is one click with no undo. Nothing is committed, but the cost of a slip is re-uploading up to 500MB.
- Player: stopped on first frame, no autoplay, pause on close, position kept. Not defined: what a clip that has ended shows on reopen, whether "Start Situational Test" stops a playing clip, whether position resets on a retake, and the 10 second rewind that the research adopts but no phase mentions.

**System-level fixes**

1. One media slot rule for every surface (admin preview, brief card, overlay, sheet): fixed maximum height, media fitted, never cropped. `file-uploader.md` already sets a precedent of "preview up to 200px tall" for the certificate case.
2. One name for the thing learners reopen, used on the card, the control and the overlay title.
3. One player spec (video and audio) written once in the DS before any phase uses it.

## 5. Heuristic evaluation

| Heuristic | Assessment | Severity (0-4) | Suggested fix |
|---|---|---|---|
| 1. Visibility of system status | Upload percentage and in-place errors are good. Saving during an upload, and the state of a clip that has ended, are not shown. | 2 | State both rules in Phases 2 and 4 |
| 2. Match with the real world | The card is headed "Brief", the field is "Brief", the control is "Scenario". Learners look for the word they just saw. | 3 | Use one word on all three |
| 3. User control and freedom | Overlay closes three ways and keeps the answer. Remove has no undo. | 2 | Accept, or keep Remove away from Change File |
| 4. Consistency and standards | Web modal and mobile sheet follow overlays.md. Filled field departs from the documented Filled state and needs a doc. | 2 | Blocker 2 already names it; resolve before Phase 2 |
| 5. Error prevention | The hint says "max. 500MB" for every type while images stop at 10MB, so a 20MB photo fails after the hint said it was fine. | 3 | One limit per type in the hint, or one limit for all |
| 6. Recognition over recall | This is the feature's purpose and the overlay delivers it, provided learners know it exists before they start. | 3 | One line on the brief card |
| 7. Flexibility and efficiency | Position is kept; scrub is available. The 10s rewind is missing from the plan. | 1 | Add to the player spec or drop from the research verdicts |
| 8. Aesthetic and minimalist design | One field, one control, one overlay. The header is the only crowded spot. | 2 | Design the header at 375px first |
| 9. Recover from errors | "This video can't play on this device." gives no next step, and Start stays enabled into a graded test. | 3 | Point to the brief; make the brief stand alone |
| 10. Help and documentation | Helper copy on the field is useful. The guidance callout does not mention media. | 1 | One bullet in the existing callout |

## 6. Build For Mars and Mobbin

Retrieved in this audit:

- [Context Shifting](https://builtformars.com/ux-glossary/context-shifting) (BFM): people switch, they do not multitask, and the last task leaves attention behind. Supports the overlay and keeping the answer. It also argues for telling learners before they start that the scenario stays reachable, so they do not over-watch to protect themselves.
- [Swapping browsers mid call](https://builtformars.com/ux-bites/swapping-browsers-mid-call) (BFM): Google Meet reassures "this won't interrupt the meeting" on the button that looks risky. Same lesson here: the reassurance belongs before the tap, on the brief card, not only in the behaviour after it.
- [Ahead, quiz header](https://mobbin.com/screens/5967dc8e-fc20-4b10-910f-df0f675c804d) (Mobbin): a question header that carries three utility controls beside the close, all as icons. It shows the space problem is normally solved with icons; an icon alone would not say "scenario", which is why the header needs a Figma design rather than a guess.
- [Noom, context inside the quiz card](https://mobbin.com/screens/1e72c86b-e88f-4407-8fd5-f60146d6cf6a) (Mobbin): context sits inline above the options. Works for one line of text; confirms the PRD's rejection for video.

The other Mobbin and BFM links in the PRD's research tables were not re-fetched here; their verdicts read as reasonable and none of my findings depends on them.

## 7. Copy review: admin portal and learner web/mobile - scenario media

**Verdict:** ship after three should-fixes and one blocker.

| # | Location | Severity | Issue | Suggested rewrite |
|---|---|---|---|---|
| 1 | Field hint and size error (Phase 2) | Blocker | Hint and error say 500MB for every type; Blocker 3 proposes 10MB images and 50MB audio. The error would be factually wrong. | Hint per type, or errors by type: "This image is over 10MB. Choose a smaller file." |
| 2 | Question header control (Phase 4) | Should-fix | "Scenario" is a noun, and the card it reopens is headed "Brief". | "View Brief" if the card keeps "Brief"; "View Scenario" only if the card label changes too |
| 3 | Unsupported state (Phase 4) | Should-fix | "This video can't play on this device." says what happened but not what to do. | "This video can't play on this device. The brief below describes the situation." |
| 4 | Field helper (Phase 2) | Should-fix | The helper sells the media but does not ask for a brief that works without it. | "An image, audio clip, or video of the situation. Learners can return to it from every question. Keep the brief complete in case the media can't play." |
| 5 | Lists | Polish | No Oxford comma: "image, audio or video", "WAV or MP4". | "image, audio, or video"; "WAV, or MP4" |
| 6 | Drawer subtitle (existing) | Polish | "Write the brief users will be tested on" says "users"; new copy says "learners". | "Write the brief learners will be tested on" (existing string, flag only) |

Fine as written: "Scenario media" with "(optional)", "Change File", "Try Again", "Remove media", "Loading video...", "Upload failed. Check your connection and try again.", "Full screen" and "Exit full screen".

## 8. Findings, ranked by impact on progress

### F1. A learner whose media fails is sent into a graded test without the scenario

- **Job context:** understand the situation well enough to answer.
- **Job stage:** Orient, on the brief card (L2-L3, failure and unsupported branches).
- **Observed friction:** the plan keeps the brief readable and Start enabled when media fails. That only helps if the brief text carries the scenario. With an acted clip, admins will write "Watch the clip and answer". There are no captions in scope, and audio has no transcript.
- **Forces:** anxiety. Attempts are limited, and the interface offers Start without saying whether starting is safe.
- **Behavioural consequence:** learners either guess and burn an attempt, or leave and tell their manager the test is broken.
- **Recommendation:** make the brief the fallback on purpose. Keep Brief required when media is attached (it is today), add one bullet to the existing guidance callout and one sentence to the field helper asking for a brief that works without the media, and point the failure copy at the brief. No new UI.

### F2. Learners are asked to start before they know they can come back

- **Job context:** decide whether I have enough to begin.
- **Job stage:** Decide, on the brief card (L4).
- **Observed friction:** the journey's own question at L2 is "Do I have to watch this first?". Nothing on the planned card answers it. The return path is only discovered on the question screen, if the control is noticed. The PRD lists "Scenario gets missed" as a risk and defers the fix to testing.
- **Forces:** anxiety, then habit. Tests have always meant "you can't go back".
- **Behavioural consequence:** learners re-watch the whole clip before starting, or write notes, or start and never open the overlay. AC4 is then met in the design and missed in use.
- **Recommendation:** one line of supporting text on the brief card, above the button: "You can come back to this from any question." It costs nothing, removes the need for the one-time hint, and should be in Phase 3, not held for testing.

### F3. The same thing has two names

- **Job context:** find the scenario again mid-question.
- **Job stage:** Act (L5-L6).
- **Observed friction:** the card learners saw is headed "Brief" (`SituationalTestPreview.tsx`, Figma 17024:82020). The control that reopens it is "Scenario". The admin field is "Scenario media" under "Brief".
- **Forces:** habit. People look for the word they just read.
- **Behavioural consequence:** slower recognition of the one control the feature depends on.
- **Recommendation:** pick one word. The smallest change is to keep "Brief" (it is already drawn and built) and label the control "View Brief", with the overlay titled by the test title as planned. If Bruno prefers "Scenario", the card label changes too, in Figma first.

### F4. The header has no room for the control, and it sits beside the exit

- **Job context:** reopen the scenario without risk.
- **Job stage:** Act (L5-L6), phone width.
- **Observed friction:** screenshot 02 shows the header nearly full with a short label. The plan adds a text button beside the close "on every format". `QuizHeader` is a DS Quizzes component (Figma 9012:380); a new slot is a change to that component.
- **Forces:** anxiety. A control next to "Close quiz" invites the fear of leaving by mistake.
- **Behavioural consequence:** truncated labels, or a mis-tap on close during a graded attempt.
- **Recommendation:** treat this as a DS gap that needs a Figma design before Phase 4, checked at 375px with the longest format label and three hearts. Do not improvise the slot in code. Also state that the control shows on text-only tests, since the problem statement (the brief disappears) applies to them too.

### F5. No size rule for the media, so a portrait clip hides the brief and Start

- **Job context:** see the scene and the way forward together.
- **Job stage:** Orient and Decide (L2-L4), and L6 in the web modal.
- **Observed friction:** "media at the card's width" plus the recommended 9:16 format puts the brief text and Start below the fold on web and mobile, and overflows the 560px modal.
- **Forces:** anxiety. The button that says "you may start" is out of view, which reads as "you must watch".
- **Behavioural consequence:** the "no forced viewing" decision is undone by layout.
- **Recommendation:** one rule, stated once and used on all four surfaces: a media slot with a fixed maximum height, media fitted and never cropped; full screen is where it gets big. Needs to be part of the player's Figma spec (Blocker 2).

### F6. On create and edit, the admin journey ends at Act

- **Job context:** know what learners will see before saving.
- **Job stage:** Confirm (A7).
- **Observed friction:** the diagram shows "Preview" as step 7 for everyone. In the code the Preview button renders only when `review` is set (AI review). On create and edit the admin saves and the outline row is "unchanged". The AI path also needs a course with lessons before it opens.
- **Forces:** anxiety about learners meeting a broken or oddly placed clip.
- **Behavioural consequence:** the admin enrols themselves or opens the course on a phone to check, the workaround the product should remove.
- **Recommendation:** show the existing Preview button on all three paths. It is one condition in the drawer footer, no new component, and it makes journey step 7 true. This turns Blocker 4 from "leave it" into a small phase item. If Bruno prefers not to, redraw step 7 as AI review only and accept that manual tests have no learner-view check.

### F7. Upload edge cases are undefined

- **Job context:** attach the clip and get on with the brief.
- **Job stage:** Act and Confirm (A3-A6).
- **Observed friction:** three unstated rules: what Save does while a file is uploading; whether closing the drawer mid-upload triggers the unsaved-changes guard; whether a failed "Change File" keeps the current media. The size hint and error also disagree with the per-type limits (copy issue 1).
- **Forces:** anxiety about losing a long upload.
- **Behavioural consequence:** admins stop typing and watch the percentage, which defeats "keep editing while it uploads".
- **Recommendation:** add three lines to Phase 2. Simplest set: the commit button stays disabled until the upload completes; an upload in progress counts as a change for the guard; a failed change keeps the current media and shows the error in place.

### F8. Player behaviour between screens is not specified

- **Job context:** find one moment in the clip quickly.
- **Job stage:** Act (L3, L6).
- **Observed friction:** not stated: a clip that has ended and is reopened (should offer replay from the start, not a dead last frame); tapping Start while audio or video is playing (must pause, or audio carries into question 1, a WCAG 1.4.2 problem); position on a retake (should reset); position across questions (the Preview remounts each question with `key={screen}`, so position has to live above that); and the 10 second rewind adopted in the research but absent from every phase.
- **Forces:** habit. People expect a player to behave like the ones they know.
- **Behavioural consequence:** small surprises at the exact moment the learner is short on patience.
- **Recommendation:** add a short "player rules" list to Phase 4 covering these five, and extend the Phase 4 check: "play to 0:40 on Q2, close, open on Q3: 0:40, stopped".

### F9. "Answer kept" is only checked on a selected option

- **Job context:** check the scenario without redoing work.
- **Job stage:** Orient (L7).
- **Observed friction:** the verification covers a selected answer. Situational tests also use free text and drag formats (match pairs, sequencing, categorisation), where a half-built arrangement or a typed paragraph is what would be lost.
- **Forces:** anxiety, "will I lose my answer if I check?" is the journey's own quote.
- **Behavioural consequence:** one lost paragraph and the learner stops opening the overlay.
- **Recommendation:** extend the Phase 4 and 5 checks to one drag format and free text, and say that opening the overlay never uses an attempt.

### F10. Smaller points

- Remove is one click on a file that may have taken minutes to upload. Acceptable if Bruno wants the fewest parts; keep it visually apart from "Change File".
- The admin Preview stacks drawer, Preview, Scenario overlay and full screen. State which overlay the Preview shows (it frames a phone-sized stage) and add the Escape order to its check.
- The PRD says the drawer is in "course details". It opens from the course builder (`/create-course` > Course Content > Add Content > Situational Tests). The Course Content tab on `/your-courses/course` is a placeholder today. Correct the route so the build and the Figma flow start in the right place.

## 9. Validation

- Admin job to UI: A2-A5 map to the field and its states; A6 to the footer; A7 has no UI on two of three paths (F6). Mapping is otherwise correct.
- Learner job to UI: L2-L4 map to the brief card; L5-L7 to the header control and overlay; L8 maps to a result screen that does not exist in the prototype. Further review is needed once the header design and the player spec exist.

**Does each surface help the user feel confident enough to make progress?**

- Drawer field: yes for "is it attached and does it play"; not yet for "what will learners see" (F6) or "can I save now" (F7).
- Brief card: not yet. Missing: the line that says the scenario stays reachable (F2), a size rule that keeps Start in view (F5), and a brief that stands alone when media fails (F1).
- Question screen and overlay: yes in principle. Missing: one name (F3), a designed header (F4), and the player rules (F8, F9).
- Result: cannot be judged; nothing is planned.

## 10. Scores

| Flow | Score | Summary |
|---|---|---|
| Admin: attach, check, change, remove (A1-A6) | 7/10 | Right field, right place, good states; upload edge cases and limits copy are loose |
| Admin: confirm what learners see (A7) | 4/10 | Only exists on the AI review path; create and edit end at Save |
| Learner: brief card (L1-L4) | 6/10 | Sound decisions on autoplay and Start; no reassurance, no size rule, weak failure path |
| Learner: question, overlay and back (L5-L7) | 7/10 | The right pattern on both platforms; naming, header space and player rules are open |
| Learner: result (L8) | 3/10 | Drawn in the journey, absent from the prototype and the plan |
| Implementation plan | 5/10 | Phases depend on unresolved blockers and on each other in the wrong order |

## 11. Executive summary

The PRD picks the simplest pattern that does the job: one media item on the brief, never forced, reachable from every question through one overlay that keeps the answer and the position. That should stand. What is missing is confidence at three moments. Learners are asked to start before they are told they can come back, and before a failed or uncaptioned clip has a fallback. Admins on the manual path save without ever seeing the learner view. And the plan cannot be built in the order written: every phase after the first needs a video or audio player that has no design, Phase 3 depends on Phase 4, and the learner surfaces on web and mobile have a blocker but no phase. Most fixes are a line of copy or a line in the plan; two need a Figma design first (the question header and the player).

## 12. Recommendations, easiest first

1. **Add "You can come back to this from any question." to the brief card.** Reason: answers the learner's question at the decision point and makes the control expected (F2). Plan change: one line in Phases 3, 4 and 5; drop the "one-time hint" risk.
2. **Use one name: keep "Brief", label the control "View Brief".** Reason: learners look for the word they just saw (F3). Plan change: copy in Phases 3 to 5 and the journey steps L6-L7.
3. **Make the brief the stated fallback.** Reason: a failed or uncaptioned clip must not send learners into a graded test blind (F1). Plan change: one bullet in the guidance callout, the helper sentence, and the unsupported and failure copy in Phases 2 and 4.
4. **Fix the limits copy.** Reason: the hint and error are wrong for images and audio (copy issue 1). Plan change: per-type hint and errors in Phase 2, or one limit for all types in Blocker 3.
5. **Correct the route in the PRD.** Reason: the drawer lives in the course builder, not course details (F10). Plan change: the "What the code does today" table and the admin journey heading.
6. **Add the three upload rules.** Reason: admins need to know Save is safe during an upload (F7). Plan change: three lines and one check in Phase 2.
7. **Add the player rules and wider checks.** Reason: ended clip, Start while playing, retake reset, position across questions, 10s rewind, and answers kept on drag and free-text formats (F8, F9). Plan change: a short list in Phase 4, mirrored in Phase 5, with two extra verification steps.
8. **Show the existing Preview button on create and edit.** Reason: gives the admin journey a real confirm step with no new component (F6). Plan change: Blocker 4 becomes an item in Phase 3; or step 7 is redrawn as AI review only.
9. **Set one media slot rule.** Reason: a portrait clip must not push the brief and Start out of view or overflow the modal (F5). Plan change: a rule in Phases 2 to 5 and in the player's Figma spec.
10. **Design the question header in Figma before Phase 4.** Reason: no room at 375px and the control sits beside the exit (F4). Plan change: add the `QuizHeader` slot to Blocker 2's list of things that need a Figma reference; state that the control shows on text-only tests.
11. **Reorder the phases around the blockers.** Reason: see the plan check. Plan change: below.

## 13. Plan check

**Journey coverage**

| Step | Phase | Gap |
|---|---|---|
| A1 | none | Off-platform; fine |
| A2-A6 | 1, 2 | Covered |
| A7 | 3 | Only on AI review; create and edit have no phase (recommendation 8) |
| L1 | none | No phase builds the entry from the course feed on web or the tap on `MobileAssessmentCard`; Blocker 1 describes a "thin slice" but it is not a phase |
| L2-L7 | 3, 4, 5 | Covered, subject to the order problem below |
| L8 | none | The journey ends on a result; the Preview's last question keeps its own retry and no result screen is planned |
| Retake (in L1) | 4, in one sentence | Cannot be verified: no attempt or retake flow exists in the prototype |

Phase 0 serves no step, which is fine (clean-up, done). Phase 6 serves all.

**Acceptance criteria**

| AC | Steps | Phases | Can the plan meet it? |
|---|---|---|---|
| 1. Admin add, preview, replace, remove per type | A2-A6 | 1, 2 | Yes, once the players exist (Blocker 2) |
| 2. Learner image, audio, video on web and mobile | L2-L7 | 3, 4, 5 | Not as written. Phase 4 is not marked as waiting on Blocker 1, and neither platform has a phase for the feed slice. Until then the only learner surface is the admin Preview, which is one frame, not "web and mobile" |
| 3. Full-screen video | L3, L6 | 3, 4, 5 | Depends on the video player reference (Blocker 2) |
| 4. Revisit without losing place | L5-L7 | 3, 4, 5, 6 | Yes; strengthen the checks per recommendations 7 and 1 |

**Confirm stage**

- Admin: ends at Act on create and edit. Ends at Confirm only on AI review.
- Learner: the diagram ends at Confirm (result), but that screen is not in the prototype or the plan. As built, the learner journey would end at Act on the last question.

**Blockers and order**

- Blocker 1 is real and understated. It blocks Phase 4 as well as Phase 5 and needs its own phase.
- Blocker 2 is real and blocks more than the PRD says. Phases 2, 3, 4 and 5 all render a video or audio player. With "no player is designed from scratch", only Phase 1 can be built today. The sentence "admin and learner design work can start now" does not hold until the references arrive. The `QuizHeader` slot belongs on the same list.
- Blocker 3 is real but does not block the prototype; it does decide the limits copy.
- Blocker 4 is not a blocker; it is the missing confirm step (recommendation 8).
- Order: Phase 3 is verified by "opens Scenario on question 2", which is Phase 4's behaviour. It cannot land before Phase 4.

Suggested order, same work, verifiable as it lands:

1. Data (as Phase 1).
2. Resolve Blocker 2: Figma or production references for the video player, audio player, image viewer, filled field and the `QuizHeader` slot; write the DS docs.
3. Learner components built inside the admin Preview: brief card with media, header control, overlay, player rules. Preview button on all three drawer paths. This is today's Phases 3 and 4 merged, and it is checkable straight away.
4. Admin field (today's Phase 2), reusing the same players.
5. Feed slice on web, then mobile (Blocker 1 as a phase), including a decision on the result screen: build a minimal one or redraw L8 to end on the last question's feedback.
6. Mobile sheet (today's Phase 5).
7. Figma flows.

**Verdict: Ready after plan fixes.**

1. Reorder the phases as above and give Blocker 1 a phase.
2. Move the `QuizHeader` slot into Blocker 2 and get the Figma references before any player is built.
3. Decide L8: a result screen, or end the journey on the last question's feedback.
4. Give create and edit a confirm step (Preview on all paths), or redraw A7.
5. Add the missing rules: reassurance line, one name, brief as fallback, media slot size, upload rules, player rules, wider "answer kept" checks, and corrected limits copy.
