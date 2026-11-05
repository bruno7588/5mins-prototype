# DES-336 pre-build UX audit: external training

**Audited:** PRD `2026-11-05-DES-336-external-training-improvements.md`, journey SVG, today's screens captured from the dev server on 2026-11-05 (1440x900, light mode).
**Screens of today's state:** `agents/output/DES-336-audit-screens/`

| File | What it shows |
|---|---|
| `des336-01-admin-profile-today.png` | `/people/1`: tabs Engagement, Skills, Course Progress, Certificates; header CTAs Assign Courses, Edit Profile; "Overdue" status used for late courses |
| `des336-02-learning-records-external-today.png` | `/learning-records` External Training: free-text Training and Provider, Expiration column, table already overflows at 1440 (Result clipped, Certificate off screen) |
| `des336-03-my-team-external-today.png` | `/my-team` Learning Records > External Training: the manager's team-wide list, with Add Training |
| `des336-04-add-training-drawer-today.png` | Today's Add External Training drawer: free-text email, training and provider, certificate last, Result optional |
| `des336-05-account-settings-today.png` | `/account`: 10 tabs, External Training will be the 11th |

---

## 1. Plan

- Read the PRD, journey and decisions; capture today's surfaces the plan changes.
- Write the job for each actor (admin recording, admin setting up, manager, learner) and the stage each surface must support.
- Walk the planned screens step by step against the journey, with the Forces Model.
- Heuristic pass (Nielsen), DS fit, copy review.
- Check BFM and Mobbin evidence; rank findings by impact on progress.
- Plan check: journey coverage, ACs, Confirm stage, blockers and phase order.

## 2. Audit criteria

| Criterion | Description | Pass/Fail | Notes |
|---|---|---|---|
| Nielsen's 10 | Usability heuristics across the planned flow | Pass with issues | See section 5 |
| Apple HIG (clarity, deference) | Content first, one primary action per surface | Pass | Drawer has one primary (Add Training); profile tab CTA placement undefined (F3) |
| WCAG 2.2 AA | Keyboard, focus, status not by colour alone, labelled fields | Pass | Badges carry text; read-only manager view must also remove kebab from tab order (3.4 already says so) |
| Visual design | Hierarchy, density, table width | Fail | External Training table already overflows at 1440 today (screen 02); plan adds a badge, supporting text and an actions column (F7) |
| Interaction design | Reversibility, feedback, safe defaults | Pass with issues | Archive vs delete is well judged; renewal and duplicate feedback missing (F4, F5) |
| DS alignment | Existing components only, house rules | Pass | Every component named exists in `src/components` (Table, Dropdown searchable/multiple, Alert customIcon, AIWorkingCard, InputInteger, DatePickerField, Collapse, EmptyState, `certificates.svg`). No new component needed |
| Brand and copy | 5Mins voice, British English, Title Case buttons, sentence case elsewhere | Pass with issues | Course vs training naming drifts (section 8) |

## 3. The jobs

**Admin, recording (main job).** When a learner hands in a certificate for training done outside 5Mins, admins want to record it against the right approved course in seconds, so they can trust who is due for retraining, without retyping details or creating a duplicate or a stray spelling.
Progress: from "a PDF in my inbox and a hand-worked expiry date" to "it's on file, the due date is right, I can forget it".
Stage the drawer supports: Act, then Decide (check), then Confirm.

**Admin, setting up.** When the organisation starts tracking external training properly, admins want to define the courses and how often each must be redone once, so they can stop working out expiry dates by hand, without breaking the records already there.
Stage: Orient and Act, done once.

**Manager.** When a manager plans shifts or prepares for an audit, they want to see which of their people have external training overdue or coming due, so they can book refreshers in time, without asking the admin for a spreadsheet.
Stage: Orient then Decide, across the team, not per person.

**Learner.** When a learner wonders whether their certificate is still valid, they want to see their status and what to do about it, so they can stay compliant, without chasing their admin.
Stage: Orient then Confirm.

The PRD writes only the first job. The manager job above is the one the plan serves least (F1).

## 4. Layout and visual analysis (planned screens against today's)

**Layout**
- Profile (screen 01): page-level CTAs (Assign Courses, Edit Profile) sit in the person header and apply to the whole page. The plan does not say where Add Training sits on the new tab (F3).
- Learning Records (screen 02): the header CTA cluster already holds Download Report, Reports (3) and Save New Report. Adding an Add Training menu makes four CTAs; acceptable only if Add Training shows on the External Training tab alone.
- Table width: today's 10 columns overflow at 1440. The plan drops Start date and Score and adds Learner, a badge with supporting text ("Renewed 12 Mar 2026") and an actions column. The badge is the whole point of the page and must not be the column that scrolls out of view.
- Settings: three stacked sections (setting, courses, providers) on one tab is the right weight; no nested tabs.

**Typography**
- No issues in the plan. Supporting text under dates ("Renewed 12 Mar 2026") must use the Table supporting-text cell, not a custom line.

**Color**
- Due soon = Warning badge, Overdue = Error badge, One-off and Archived = Informative: matches `badges.md`. No "Valid" badge for upcoming dates is the right restraint.
- "Overdue" already means "late on an assigned 5Mins course" one tab away on the same profile (screen 01 stat card and status pill). The column header "Retraining due" disambiguates on desktop; it does not for the learner (F8).

**Interactions**
- Upload-first with "Fill In Manually" visible from the start: good, never a dead end.
- Mismatch Alert warns but never blocks: good.
- Missing: feedback that a new record renews an older one (F4), a duplicate check in the single-record drawer (F5), per-field signal of what AI filled (F6).

**System-level fixes**
- One noun for the approved item across Settings, drawer and tables (section 8).
- Retraining due column and filter on every external training table the plan touches, including My Team (F1).

## 5. Heuristic evaluation

| Heuristic | Assessment | Severity (0-4) | Suggested fix |
|---|---|---|---|
| 1 Visibility of system status | Due date shown before save and reading state are strong. The moment a record renews an overdue one is silent until the table re-sorts | 2 | Say it in the drawer and toast (F4) |
| 2 Match with the real world | Approved list, archive and retraining rules mirror how compliance teams think. "Overdue" means two things on one profile | 1 | "Retraining overdue" in learner copy (F8) |
| 3 User control and freedom | Fill In Manually, Change File, edit after save, archive not delete. Good | 0 | - |
| 4 Consistency and standards | Course vs training drifts; ACs D1-D4 clash with decisions D1-D21 in the PRD itself | 2 | One noun; rename DEV-4743 ACs to M1-M4 (F11) |
| 5 Error prevention | Duplicate single records and blank Result are not prevented; one-offs default on with an empty list lets free text back in | 3 | F2, F5, F9 |
| 6 Recognition over recall | Pick from list, provider auto-filled, read text shown as hint. Good | 0 | - |
| 7 Flexibility and efficiency | CSV plus zip and remembered names serve volume. Managers have no team-level shortcut | 3 | F1 |
| 8 Aesthetic and minimalist design | Settings and drawer are lean. Learning Records table is over-wide | 2 | F7 |
| 9 Help users recover from errors | Unreadable, no match and mismatch branches each name the fix. Good | 0 | - |
| 10 Help and documentation | Help article exists; learner gets no "what to do" when overdue | 2 | F8 |

## 6. BFM and Mobbin

- **Wise, upload an invoice** ([BFM](https://builtformars.com/ux-bites/upload-an-invoice)): says what the file must contain and "We use AI to process your document. Please check the results." The plan adopts this. What it adds for us: tell the admin which fields to check, not just that some were filled (F6).
- **Compare the Market, dynamic insurance reminder** ([BFM](https://builtformars.com/ux-bites/dynamic-insurance-reminder)): renewal date plus "(in 19 days)". A relative countdown is easier to act on than a bare date. Use it in the learner's view and the drawer's due line: "Retraining due 14 Oct 2029" is fine at 4 years out; at 40 days "Due soon · 14 Dec 2026 (in 40 days)" removes mental arithmetic (F8).
- **Monzo, incorrect recipient details** and **Slack, catching typos** (cited in the PRD): the mismatch Alert follows both correctly.
- **Mobbin:** my own search for team-level certification expiry lists returned only generic member tables, nothing usable. The PRD's retrieved [7shifts certifications](https://mobbin.com/screens/806539a9-f62a-44fd-aad4-db4283e65b31) and [Vanta tests](https://mobbin.com/screens/eb1d71b4-2b3c-4a83-8435-bdc0e7cbb9e2) both put expiry status in a cross-person list with a status filter. That is the pattern the manager is missing (F1). The PRD's [folk "Create"](https://mobbin.com/screens/88bfa6c2-d2a2-4b42-9f86-0d8bf29a02fd) supports making "Add Course to Approved List" the easy path over one-off (F2).

## 7. Findings, ranked by impact on progress

### F1. Managers can't see who in their team is due without opening every profile - severity 3

- **Job context:** a manager wants to know which of their people need a refresher booked.
- **Job stage:** Orient, across the team.
- **Observed friction:** the plan gives managers a per-person tab (3.4, step 7). Their team-wide list already exists, My Team > Learning Records > External Training (screen 03), but the plan only removes Add Training from it (Blocker 3). No phase gives it the Retraining due column, badges or the Overdue / Due soon filter that 2.9 gives admins.
- **Forces:** Anxiety (an audit is coming and they can't see the gaps) is not countered; Habit wins, so they ask the admin for an export as they do today.
- **Behavioural consequence:** managers open profiles one by one, or don't look at all; the "visible to the manager" half of the job silently fails.
- **Recommendation:** in Phase 3, make the My Team External Training list read-only with the same columns and Retraining filter as 2.9 (same Table, same `dueState`). No new screen. Add it to the journey's step 7.

### F2. With one-offs on by default and an empty list, free text comes straight back - severity 3

- **Job context:** record without creating inconsistent records (the problem statement).
- **Job stage:** Decide (no course match).
- **Observed friction:** D5 defaults one-offs to on, and seeding is out of scope, so on day one the list is empty and every existing record is a one-off. In the drawer, the no-match branch offers "Add Course to Approved List" and "Record as One-off" as equal text buttons (2.6). Record as One-off asks for a typed name and provider: exactly today's free-text form.
- **Forces:** Habit (type it and move on) beats the Pull of a clean list, because adding a course asks for duration and retraining rule the admin may not know mid-task.
- **Behavioural consequence:** admins keep typing names; the spelling split the feature exists to fix persists, now labelled "One-off".
- **Recommendation:** keep the default, but make "Add Course to Approved List" the first and filled-in option (read name pre-filled, as planned) and Record as One-off the second; in the inline course form, pre-select "No retraining" so the only required new field is duration. When the approved list is empty and one-offs are on, show a Callout in the drawer: "Your approved list is empty. Add courses in Account and Settings to keep records consistent." with Go to Settings. No new component.

### F3. The plan doesn't say where Add Training sits on the profile - severity 2

- **Job context:** record a certificate for the person in front of you.
- **Job stage:** Act.
- **Observed friction:** screen 01 header CTAs (Assign Courses, Edit Profile) belong to the whole page. 3.1 says "Add Training opens 2.1" but not where the button lives.
- **Forces:** Anxiety is low, but a page-level placement would show Add Training on Course Progress too, mixing two jobs.
- **Behavioural consequence:** builders guess; one likely guess puts a third CTA in the person header.
- **Recommendation:** put Add Training (Outlined-2) on the right of the tab's own toolbar row, above the table, shown only on External Training and only to admins. Hide it in the empty state, where the EmptyState CTA already does the job.

### F4. Renewing an overdue record has no visible payoff - severity 2

- **Job context:** the reason to record is to clear the flag.
- **Job stage:** Confirm.
- **Observed friction:** 2.5 shows the new due date; 2.8 toast is "First Aid at Work added for Sarah Chen". That the older Overdue record is now superseded only shows if the admin notices the row change (journey step 6 says "the older record stops flagging", but no copy carries it).
- **Forces:** Pull (seeing the risk cleared) is not delivered; Anxiety stays ("did it count?").
- **Behavioural consequence:** admins re-check the row or Learning Records filter to confirm.
- **Recommendation:** in the drawer, under the due line, when a passed record for the same person and course exists: "Renews the record completed 2 Mar 2024." Toast when it cleared a flag: "First Aid at Work renewed for Sarah Chen". Uses existing helper text and Toast.

### F5. The single-record drawer allows exact duplicates - severity 2

- **Job context:** "Is this already recorded?" (journey step 2's own question).
- **Job stage:** Orient, then Act.
- **Observed friction:** CSV skips same person, course and completion date (2.10). The drawer doesn't. Certificates are often emailed twice, or by both learner and manager.
- **Forces:** Anxiety about double counting, which the admin can only resolve by scanning the table.
- **Behavioural consequence:** duplicates, or admins checking the table before every upload.
- **Recommendation:** same rule as CSV. When learner, course and completion date match an existing record, show a Callout in the drawer: "Sarah Chen already has First Aid at Work completed on 14 Oct 2026." Don't block saving; the admin may be replacing the certificate, so offer Edit Existing Record as a text button.

### F6. Admins can't tell which fields AI filled - severity 2

- **Job context:** check the AI before saving.
- **Job stage:** Decide.
- **Observed friction:** D6 says fields are "flagged for the admin to check"; 2.3 delivers one Callout for the whole form. With 4-6 fields, some typed and some read, the admin must re-check everything or nothing.
- **Forces:** Anxiety ("did it read it right?" is the SVG's own step 5 question).
- **Behavioural consequence:** admins either re-check every field against the PDF (slower than typing) or trust blindly (a wrong match is worse than none, PRD risk 1).
- **Recommendation:** helper text "From the certificate" under each field AI filled, cleared when the admin edits it. `InputField`, `Dropdown` and `DatePickerField` already take helper text. Keep the single Callout.

### F7. The Learning Records table is already too wide to show the badge - severity 2

- **Observed friction:** screen 02 at 1440 clips Result and hides Certificate today. 2.9 adds a Learner column with email, a badge plus supporting text, and actions.
- **Forces:** Anxiety: the Overdue signal risks being off screen.
- **Recommendation:** order columns Learner, Training, Retraining due, Completion date, Provider, Result, Certificate, actions; drop Duration from this table (it is on the course and in the drawer). Verify at 1280 with the longest badge plus "Renewed" line.

### F8. The learner sees Overdue with no next step - severity 2

- **Job context:** learner checking whether they're still valid.
- **Job stage:** Confirm, then Decide.
- **Observed friction:** 3.5 is view-only with "Your admin adds it". An Overdue badge one tab away from course "Overdue" (screen 01) tells the learner something is wrong and gives no route forward.
- **Forces:** Anxiety raised without confidence (section 3.6: urgency without confidence).
- **Behavioural consequence:** learners message their manager or admin to ask what it means.
- **Recommendation:** learner-only line above the table when any row is Overdue or Due soon: "Book the training again, then send your new certificate to your admin." Show the relative date in the due cell for Due soon ("in 40 days"), per Compare the Market.

### F9. Blank Result is undefined - severity 2

- **Observed friction:** Result is optional today (screen 04) and in 2.1. D18 defines Not Passed; nothing says whether a blank Result gets a due date and can flag or supersede.
- **Recommendation:** default Result to Passed (Radio pre-selected); AI sets Not Passed only if the certificate says so. Then every record has a defined state.

### F10. Recording before the person has an account - severity 2

- **Observed friction:** today records are keyed on email "so records can exist before the person registers" (research file, line 14). 2.1 replaces that with a searchable people Dropdown. Hospitality new starters often hand in Food Hygiene before their 5Mins invite lands.
- **Recommendation:** decide explicitly. Simplest: the Dropdown lists pending (invited) people too, labelled "Invited". If people not yet invited must be recordable, say so and keep CSV by email as the route.

### F11. Small plan gaps

- **"Add Course to Approved List" in the drawer for limited admins.** D21 says they can't edit the list; 2.6 doesn't hide the button for them. Hide it; they get Record as One-off (if allowed) or the no-match helper "Ask a full admin to add it to the approved list."
- **Due soon for short intervals.** A course retrained every 3 months is "Due soon" from day one with a 90-day window. Cap the window at a quarter of the interval (12 months: 90 days; 3 months: about 23 days), or confirm no customer uses intervals that short.
- **AC naming clash.** DEV-4743 ACs D1-D4 share names with decisions D1-D21; Blocker 2 "Needed for D4" and Blocker 3 "Needed for D2" read as the archive and provider decisions. Rename the ACs M1-M4.
- **Day-one noise.** Every migrated record carries the One-off badge. Consider showing the One-off badge only after the approved list has at least one course.

## 8. Copy review

**Verdict:** ship after three should-fixes.

| # | Location | Severity | Issue | Suggested rewrite |
|---|---|---|---|---|
| 1 | Tables (2.9, 3.1) vs Settings and drawer | Should-fix | The approved item is "course" in Settings and the drawer, "Training" in table columns, beside a "5Mins Courses" tab where "course" means 5Mins content | Column header "Course"; keep "external training" for the record type and tab name |
| 2 | Drawer due line (2.5) vs Settings (1.3) | Should-fix | "No retraining needed" vs "No retraining" | "No retraining" in both |
| 3 | Learner sentence (3.5) | Should-fix | "Your admin adds it" and empty state "Your admin records training" use two verbs; neither says what to do when overdue | "Training you've done outside 5Mins. Your admin records it from your certificate." plus F8 line |
| 4 | Toast (2.8) | Polish | Doesn't say a flag cleared | "First Aid at Work renewed for Sarah Chen" when it supersedes (F4) |
| 5 | Unreadable Callout (2.4) | Polish | Fine; add the likely cause | "We couldn't read this certificate. Fill in the details below, or try a clearer scan." |
| 6 | Archive dialog (1.4) | Pass | Says records stay and still show due dates, which covers PRD risk "archived course still flags" | - |
| 7 | Buttons | Pass | Title Case throughout (Add Training, Fill In Manually, Change File, Save Course, Archive Course, Delete Record) | - |

British spelling, no em dashes, no exclamation marks in warnings: all pass.

## 9. Validation per flow

| Flow | Job mapped to UI? | Does it give confidence to progress? |
|---|---|---|
| Set-up (Settings) | Yes: list, rule, archive, one-off setting | Yes. Archive and rename Callouts say exactly what happens to records |
| Recording drawer | Yes | Mostly. Missing: which fields AI filled (F6), duplicate warning (F5), renewal payoff (F4) |
| Admin profile tab | Yes | Yes once CTA placement is set (F3) |
| Learning Records | Yes | Only if the badge stays on screen (F7) |
| Manager | Partly: per person only | No. The team-level question isn't answered (F1) |
| Learner | Yes, view only | No when Overdue: status without a next step (F8) |
| CSV + zip | Yes | Yes. Match step and remembered names are the right shape; heaviest build item |

No further review needed for Set-up and CSV. Re-review the drawer once F4-F6 are in.

## 10. Scores

| Screen or flow | Score | Summary |
|---|---|---|
| Set-up: Account and Settings > External Training | 8/10 | Lean, reversible, clear about what archive and rename do to records |
| Recording drawer (certificate-first) | 7/10 | Strong upload-first and branches; needs per-field AI signal, duplicate check and renewal feedback |
| Admin profile tab | 7/10 | Right place and right columns; Add Training placement undefined |
| Learning Records (admin) | 6/10 | Right columns and filter, but the table is already too wide for the badge |
| CSV + zip bulk upload | 7/10 | Good review and match model; complex, and two uploaders add load |
| Manager view | 5/10 | Per-person only; the team list managers already use gets no due states |
| Learner view | 6/10 | Shows status, but Overdue with no next step raises anxiety |

## 11. Executive summary

The plan solves the admin's recording job well: certificate first, AI that never brings free text back, a due date shown before saving, archive instead of delete, and every branch has a way out. It falls short where the job reaches other people. Managers only get a per-person view, while the team list they already use loses Add Training but gets no due states, so "who in my team needs a refresher?" still means opening profiles one by one. Learners see Overdue with nothing to do about it. Inside the drawer, three small additions turn "it saved" into "I'm sure it's right": mark the fields AI filled, warn on an exact duplicate, and say when a record renews an overdue one. Defaulting one-offs to on with an empty list risks bringing back the free text the feature exists to remove, so the drawer should steer towards adding to the approved list.

## 12. Recommendations, easiest first

1. **Rename DEV-4743 ACs to M1-M4** in the PRD, so blockers can't be misread (plan hygiene, F11).
2. **Default Result to Passed** in the drawer (F9; drawer, screen 04).
3. **Copy fixes**: "Course" column header, "No retraining" everywhere, learner sentence (section 8).
4. **Hide "Add Course to Approved List" for limited admins** (F11; drawer 2.6).
5. **"From the certificate" helper text** on AI-filled fields (F6; drawer review, journey step 5).
6. **Renewal line and toast** when a record supersedes another (F4; drawer and profile tab, journey step 6).
7. **Duplicate Callout** for same learner, course and completion date (F5; drawer, journey steps 2-3).
8. **Place Add Training in the tab toolbar**, admins only (F3; profile, screen 01).
9. **Learner next-step line and relative due date** (F8; learner profile, journey step 7).
10. **Reorder and trim Learning Records columns**, verify at 1280 (F7; screen 02).
11. **Steer the no-match branch to the approved list**, plus the empty-list Callout (F2; drawer 2.6).
12. **Decide pending people in the learner Dropdown** (F10; drawer 2.1).
13. **Cap Due soon for short intervals** or confirm none exist (F11; data model).
14. **Give My Team's External Training list the Retraining due column and filter**, read-only (F1; screen 03, journey step 7). The largest change, and the one that delivers the manager half of the job.

## 13. Plan check

**Journey coverage**

| Step | Phase | Gap |
|---|---|---|
| Set-up | 1.1-1.8 | None |
| 1 Trigger | Outside 5Mins | None |
| 2 Orient (profile tab) | 3.1 | Profile tab lands in Phase 3; Phase 2 can be verified from Learning Records (2.9), so order holds. No duplicate check (F5) |
| 3 Act (upload) | 2.1, 2.2 | Add Training placement on the profile (F3) |
| 4 Act (AI reads) | 2.3 | Prototype needs demo files per branch (2.4 says so) |
| 5 Decide (check) | 2.3-2.6 | Per-field AI signal (F6), blank Result (F9) |
| 6 Confirm (save) | 2.8, 3.1 | Renewal feedback (F4) |
| 7 Confirm (manager, learner) | 3.4, 3.5 | Manager team list not covered (F1); learner next step (F8) |

Phases serving no journey step: 1.7 (approved-list CSV) and 2.10-2.11 (records CSV) serve the bulk side path, which the journey shows as a note. Justified by the ticket. Blocker 3's read-only My Team list has no phase at all; add it to Phase 3 (F1).

**Acceptance criteria**
- All ACs map to a phase. E5 / M1-M4 are met literally (the profile tab), but E5's intent ("managers can view their team's external trainings") is better met by the team list too (F1).
- A3 and A5 conflict with D2-D4; the PRD flags it. Bruno appends to Jira.
- C2 "learner pre-selected and not changeable" is met by 3.1. With F10 unresolved, B-series recording for invited-but-not-registered people may regress from today.

**Confirm stage:** the journey ends at Confirm for the admin (toast plus row) and the learner (view). For the manager it ends at Orient: they can see status but have no way to see it across the team. With F1 and F4 it ends where each person knows it worked and can stop.

**Blockers and order**
- Blocker 1 (no AI service) is real; building the manual drawer first (2.1) before AI (2.2-2.4) is the right order and keeps recording working if AI slips.
- Blocker 2 (manager scope) is real and the guard is the right size for the prototype.
- Blocker 3 is real; widen it to "My Team keeps a read-only list with due states" (F1).
- Blocker 4 (no "add new" row in Dropdown) is handled without a new component. Good.
- Phase order lets each step be checked as it lands: list (1) → record from Learning Records (2) → profile and roles (3).

**Verdict: Ready after plan fixes**
1. Add the read-only My Team External Training list with Retraining due and filter to Phase 3 (F1).
2. Steer the no-match branch to the approved list, plus the empty-list Callout (F2).
3. Place Add Training in the profile tab toolbar (F3).
4. Add renewal feedback, the duplicate Callout and per-field AI helper text to the drawer (F4-F6).
5. Default Result to Passed; decide on invited people in the learner field (F9, F10).
6. Hide Add Course to Approved List from limited admins; rename DEV-4743 ACs to M1-M4 (F11).
