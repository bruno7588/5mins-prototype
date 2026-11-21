# DES-366 pre-build UX audit: course validity period and Valid until dates

Audited 2026-11-20 against the PRD, research file, journey SVG and the current prototype code. Fresh reviewer: decisions in the PRD's "Decisions taken" table are treated as settled; only their UX consequences are flagged.

**Verdict: Ready after plan fixes** (see section 7).

Note on screenshots: the Playwright browser was locked by another session, so current-state evidence is taken from the code that renders each screen (file and line references given). No Figma exists yet.

---

## 1. Plan

- Read the PRD, research and journey; extract the admin's job and the seven journey steps.
- Check today's surfaces in code: `CourseSettings.tsx` (Course completion rows), `LearningRecords.tsx` (columns, FilterBar, Include toggles), `UserProfile.tsx` (row menu, `ACTION_RULES`, bulk bar, certificate column).
- Walk each step against Trigger, Orient, Decide, Act, Confirm and the forces.
- Heuristic table, BFM and Mobbin comparison, copy review.
- Findings ranked by impact on progress, then scores, recommendations and the plan check.

## 2. Audit plan

| Criterion | Description | Pass/Fail | Notes |
|---|---|---|---|
| Nielsen's 10 | Usability heuristics per step | Partial | Recognition over recall fails at Decide (step 4) |
| Apple HIG (clarity, deference, feedback) | Feedback on save and download, clear hierarchy | Pass | Toasts planned for save and bulk download |
| WCAG 2.2 AA | Date cells readable, disabled actions explained, errors in text | Pass | `ACTION_RULES` reasons give text for disabled rows; error text planned |
| Visual design | Existing tokens, `.tbl-date`, no new components | Pass | All components exist and are documented |
| Interaction design | One control pattern per section, one way to download | Partial | Blocker 3 and 6 still open; unit switch not specified |
| Accessibility of states | No colour-only meaning | Pass | Date only, no status colour (AC11) |
| Brand and copy | 5Mins voice, sentence case, Title Case buttons | Partial | Helper omits the most anxious question; one awkward external line |
| DS alignment | No improvised components | Pass | Alternative B would hit the undocumented Radio input row |

## 3. The job

> When an inspector or auditor asks for proof of training, a compliance Admin wants to see and hand over when each person's completion stops being valid, so they can show their staff are in date without working renewal dates out by hand or being caught out on inspection day.

- **Situation:** an announced inspection, or a known renewal rule ("Food Safety every 3 years").
- **Progress, from → to:** from "I think everyone is in date but I'd have to check each date against a calendar" to "I have a list of who is in date on the visit day, and the paper to prove it".
- **Stage the feature must carry most:** Decide (step 4). Set-up and export are mechanical; the anxious moment is "who runs out before the visit?".

Forces overall:
- **Push:** inspection pressure; manual spreadsheets of renewal dates.
- **Pull:** one date per completion, on screen and on paper.
- **Anxiety:** "does changing the period change people who already completed?" (step 2); "is this person really out of date, or mid-renewal?" (steps 3, 6); "does the paper match the platform?" (step 7).
- **Habit:** exporting to a spreadsheet and sorting by date there. If the platform cannot answer "who runs out before X", Admins keep this habit, and the feature becomes a CSV column.

## 4. Layout and visual analysis (planned screens)

**Layout**
- Course completion (step 2): the new row joins a stack of Checkbox rows with expanding sub-rows. Recommendation A keeps the section uniform; placing it straight after Certificate keeps the certificate-on helper next to the thing it depends on.
- Learning Records (steps 3-5): already 13 columns (`LearningRecords.tsx` 492-537). "Valid until" after "Completion date" reads naturally as a pair. The FilterBar already supports "between" date filters for Start, Due and Completion date (`DATE_FILTER_FIELD`, line 125) but the plan does not add one for Valid until.
- Course Progress (step 6): Certificate column and header button are removed in favour of row and bulk actions (Blocker 6). This trims one column and gives one way to download.

**Typography**
- Course Progress headers are Title Case ("Completion Date", `UserProfile.tsx` 659); "Valid until" in sentence case will sit beside it. House rule wins; the inconsistency is pre-existing and noted in the PRD.

**Color**
- No status colour, by decision (AC11). The dash for "no period" reuses `DateCell`. No issues.

**Interactions**
- Unit switch is unspecified: entering 35, then switching Months to Years, makes 35 years exceed the 20-year cap. The plan needs a rule (keep the number, re-validate, show the unit-specific error).
- Course Progress eligibility: `ACTION_RULES` is status-only (`UserProfile.tsx` 223). "Completed with a certificate" needs a per-course certificate flag that the mock `COURSES` and `CourseRecord` do not have today. Phase 1 must add it.
- Bulk download over a mixed selection: the file already has `outcomeToast` ("· 2 skipped", line 252). The plan's toast should reuse it rather than a new string.

System-level fixes: one date filter pattern across all record dates; one skipped-count toast pattern across bulk actions; one control pattern per settings section.

## 5. Heuristic evaluation

| Heuristic | Assessment | Severity (0-4) | Suggested fix |
|---|---|---|---|
| Visibility of system status | Save and bulk download confirm with toasts. A re-enrolled person shows a dash on the default view, which reads as "not in date" when a prior completion is still valid. | 3 | Show the latest completion's date on Course Progress (as the decision already says); point Learning Records users to Archived enrolments. |
| Match with the real world | "Valid until" is the language inspectors use. External training will share the name but recalculate differently ("new records only"). | 1 | Keep Phase 7's subtitle that states the difference. |
| User control and freedom | Turning validity off removes dates everywhere at once; no undo, but Save is explicit and the toast confirms. | 1 | None beyond the toast. |
| Consistency and standards | Checkbox row (A) matches the section; alternative B would be the only non-checkbox row and uses an undocumented input. | 2 | Pick A. |
| Error prevention | Limits defined; unit switching not. | 2 | Re-validate on unit change. |
| Recognition rather than recall | Step 4 makes the Admin hold the inspection date in mind and compare every row by eye. | 4 | Add a Valid until date filter (existing "between" control). |
| Flexibility and efficiency | Per-person bulk download now needs select-all then Actions menu instead of one header button. | 1 | Acceptable; select-all is one click. |
| Aesthetic and minimalist design | No new statuses, no new components. | 0 | None. |
| Help users recover from errors | Error copy is specific. | 0 | None. |
| Help and documentation | Helper says where the date shows, not that it rewrites past completions. | 3 | Add "Applies to past and new completions." |

## 6. BFM and Mobbin comparison

**Build For Mars**
- [Dynamic insurance reminder](https://builtformars.com/ux-bites/dynamic-insurance-reminder) (retrieved this audit): Compare the Market adds "(in 19 days)" so people don't do date arithmetic. AC11 rules out relative status cues; the same need is met without a status by letting the Admin filter to "Valid until before the visit date".
- [Ending the doom scroll](https://builtformars.com/ux-bites/ending-the-doom-scroll) (retrieved this audit): GetYourGuide puts a date narrowing control in the list because users browse for a known date. The inspection date is that known date here.
- [Fuzzy Context](https://builtformars.com/ux-glossary/fuzzy-context) (cited by research): answer the obvious follow-up. The obvious follow-up at step 2 is "does this change people who already completed?", and the planned helper does not answer it.

**Mobbin** (retrieved this audit)
- [Framer CMS, "Is Between Dates" filter](https://mobbin.com/screens/fe6b13ba-87ab-46dc-b54e-a508480e4470): a date column filtered by start and end, the same shape as our FilterBar date range. Supports recommendation 5.
- [Xero quotes, Expiration date column with Filter](https://mobbin.com/screens/1269d955-9ebd-41ca-aefa-8263328cb49d): expiry shown as a plain date column, narrowed by a date filter, no status pill. Matches AC11 and recommendation 5.
- [Customer.io deliveries, date range and Export to CSV](https://mobbin.com/screens/7ed45527-6341-4643-bd25-5c2242d58a3d): filter first, then export the filtered view. The same sequence as steps 4 then 5.
- From research (not re-retrieved): [7shifts certifications](https://mobbin.com/screens/806539a9-f62a-44fd-aad4-db4283e65b31) date column plus Valid pill; adopt the column, reject the pill.

## 7. Copy review

**Verdict:** Ship after one should-fix; polish optional.

| # | Location | Severity | Issue | Suggested rewrite |
|---|---|---|---|---|
| 1 | Course completion helper (both states) | Should-fix | Says where the date shows but not that it rewrites past completions; that is the step 2 anxiety in the journey itself. | Certificate off: "Applies to past and new completions. Valid until shows in Learning Records and on Course Progress." Certificate on: "Applies to past and new completions. Valid until shows in Learning Records, on Course Progress and on certificates." |
| 2 | Unit-switch error | Should-fix | Error copy exists per unit, but nothing says it reruns on unit change. | Same strings; show "Enter a whole number from 1 to 20" as soon as Years is picked with 35 in the field. |
| 3 | Bulk download toast, mixed selection | Polish | "Downloading 3 certificates" hides rows skipped for no certificate. | Reuse `outcomeToast`: "Downloading 3 certificates · 2 skipped". |
| 4 | AddExternalTrainingDrawer | Polish | "No Valid until date for training that wasn't passed." reads awkwardly with a capitalised field name mid-phrase. | "Training that wasn't passed has no Valid until date." |
| 5 | Archived enrolments tooltip (Learning Records, line 612) | Polish | Today: "Include past enrolments from before a learner was re-enrolled." Does not tell the Admin this is where a still-valid earlier completion lives. | "Include past enrolments from before a learner was re-enrolled, with their own Valid until dates. Off by default." |

Kept as is: "Completion validity", "Completion valid for", "Off = No expiry." (mirrors "Off = 1 attempt"), "Enter a whole number from 1 to 240", "Completion validity set to 3 years", "Completion validity removed", "Only for completed courses with a certificate", "Changes apply to new records only. The 3 existing records keep their Valid until dates." Buttons ("Download Report", "Download Certificates") stay Title Case per house rule; menu items stay sentence case like the existing row menu.

## 8. Findings (ranked by impact on progress)

### F1. Decide stage has no tool: Admins compare dates by eye (severity 4)
- **Job context:** find who runs out before the inspection date.
- **Job stage:** Decide (journey step 4).
- **Observed friction:** Learning Records shows a Valid until column but no way to narrow by it. The journey marks it "Still open: no Valid until filter or sort". The FilterBar already offers "between" date filters for Start, Due and Completion date (`LearningRecords.tsx` 125).
- **Forces:** Habit dominates. Without a filter, the quickest route is Download Report and sort in a spreadsheet, which is today's workaround.
- **Behavioural consequence:** Admins export first and decide off-platform; the on-screen column becomes decoration and errors creep in on large teams.
- **Recommendation:** add a "Valid until" date filter, one entry in `DATE_FILTER_FIELD` and the filter list, in Phase 3. It is a date range, not a status, so AC11 holds. The report then exports the filtered view (step 5).

### F2. People mid-renewal look out of date by default (severity 3)
- **Job context:** know who is in date on the visit day.
- **Job stage:** Orient (steps 3 and 6).
- **Observed friction:** most of these courses renew automatically, so on any given day many people are on a fresh In Progress or Overdue enrolment while their previous completion is still valid. Learning Records hides Archived enrolments by default, so their Current row shows a dash. Blocker 4 proposes the same dash on Course Progress, although the settled decision says Course Progress shows Valid until "from the latest completion", not from the latest enrolment.
- **Forces:** Anxiety. A dash beside a person reads as "no valid training", which is the exact false alarm AC11 was written to avoid.
- **Behavioural consequence:** Admins chase or retrain people who are compliant, or distrust the column.
- **Recommendation:** resolve Blocker 4 per the decision: Course Progress shows the latest completion's Valid until on the course row whatever the current status, with the Table's supporting-text line "Previous completion" when the row isn't Completed. On Learning Records keep one date per enrolment (AC13) and update the Archived enrolments tooltip (copy item 5); journey step 3 already tells the Admin to switch it on.

### F3. Set-up asks for commitment without answering the scariest question (severity 3)
- **Job context:** set a 3-year rule once and trust it.
- **Job stage:** Act, set-up (step 2).
- **Observed friction:** the journey's own quote is "Does this change people who already completed?". Under option A, saving rewrites every existing date silently, and the planned helper only lists where the date shows.
- **Forces:** Anxiety. The Admin cannot predict the blast radius of Save.
- **Behavioural consequence:** hesitation, a support question, or a test on a dummy course.
- **Recommendation:** add "Applies to past and new completions." to both helpers (copy item 1). No warning dialog; the decision stands, the sentence simply makes it visible.

### F4. Certificate downloads have no owner on Learning Records (severity 3)
- **Job context:** hand the inspector certificates, including for leavers.
- **Job stage:** Act, evidence (step 5).
- **Observed friction:** step 5 relies on Learning Records row and bulk downloads, but Phase 6 is conditional on Blocker 2. Deactivated people are only reachable there.
- **Forces:** Push without a path; the journey promises an action the plan may not build.
- **Behavioural consequence:** Admins open each leaver elsewhere, or cannot get leaver certificates at all.
- **Recommendation:** settle Blocker 2 before build. If DES-366 does not own it, cut "certificates per row or in bulk" from step 5 and point to DEV-5171/5170.

### F5. Paper can disagree with the platform (severity 2, decision consequence)
- **Job context:** show the inspector a certificate that matches the system.
- **Job stage:** Confirm (step 7).
- **Observed friction:** option A plus stored PDFs (Blocker 1) means a previously downloaded certificate can show an old Valid until; legacy PDFs say "Date of issue", unrelated to a completion-based Valid until.
- **Forces:** Anxiety at the moment of proof.
- **Behavioural consequence:** an inspector sees two different dates for one person.
- **Recommendation:** keep AC10 gated on Blocker 1 being solved by engineering and on DEV-5167 shipping first; until then the prototype shows the live date and the release note states the limit.

### F6. Eligibility rules lack the data they need (severity 2)
- **Job context:** download one person's certificates.
- **Job stage:** Act (step 6).
- **Observed friction:** "Only for completed courses with a certificate" cannot be evaluated: `ACTION_RULES` checks status only and mock data has no certificate flag.
- **Forces:** none for the user yet; a build trap that would produce enabled actions that download nothing.
- **Recommendation:** Phase 1 adds `certificate: boolean` (and, for Learning Records, pass-score outcome) to the mock data; Phase 4 extends `allows()` with it.

### F7. Unit switching is unspecified (severity 2)
- **Job context:** enter "35 months" or "3 years".
- **Job stage:** Act (step 2).
- **Observed friction:** max differs by unit (240 vs 20); the plan does not say what happens to the number on a unit change.
- **Recommendation:** keep the number, re-validate immediately, block Save while invalid (copy item 2). Add to Phase 2 verification.

### F8. Same name, different behaviour on one page (severity 1)
- **Job stage:** Orient (step 3).
- **Observed friction:** "Valid until" on 5Mins Courses recalculates on period change; on External training it applies to new records only. The External Expiry filter still offers Overdue, Due soon, Valid.
- **Recommendation:** keep Phase 7's subtitle that states the difference; leave the filter flagged as the PRD does.

## 9. Validation

- Step 2 maps to the Completion validity row, helper and toast: correct, once F3 copy lands.
- Step 3 maps to the Valid until column and Include toggles: correct, with F2's tooltip.
- Step 4 maps to nothing in the plan today: fixed by F1.
- Steps 5-7 map to report, downloads, certificate: correct if Blocker 2 is settled (F4) and eligibility data exists (F6).

**Does this flow help the Admin feel confident enough to make progress?** Not yet. Set-up and display are sound, but the Admin cannot answer "who runs out before the visit?" on the platform, and people mid-renewal look out of date. With F1-F3 fixed, yes.

---

## 10. Scores

| Screen or flow | Score | Summary |
|---|---|---|
| Step 2 - Course settings, Completion validity | 7/10 | Familiar Checkbox pattern and clear limits; helper skips the past-completions question and unit switching is undefined. |
| Steps 3-4 - Learning Records, read and decide | 5/10 | Date is there, but deciding needs mental arithmetic and mid-renewal people show a dash. |
| Step 5 - Report and certificate export | 6/10 | Report column is solid; certificate downloads depend on an unresolved blocker. |
| Step 6 - Course Progress, one person | 7/10 | One way to download, reasons on disabled rows; Blocker 4 currently contradicts the decision text. |
| Step 7 - Certificate and confirm | 6/10 | Clear dual-date footer; stored and legacy PDFs can disagree with the platform. |
| Phase 7 - External training renaming | 7/10 | One name on one page; behaviour difference is stated in the drawer. |

## 11. Executive summary

The plan is well grounded: it reuses existing components, keeps the date-only stance consistent across settings, tables, report and certificate, and removes the duplicate download paths. Its weak point is the moment the job turns on: deciding who runs out before an inspection. The plan shows the date but gives the Admin no way to act on it except exporting to a spreadsheet, and automatic renewals mean many compliant people will show a dash. Both fixes reuse what already exists (the FilterBar date range and the decision's own "latest completion" rule). With those, one sentence of helper copy, and two blockers settled, it is ready to build.

## 12. Recommendations (easiest first)

1. **Helper copy says it applies to past completions** (step 2, F3). Plan change: Phase 2 helper strings gain "Applies to past and new completions." in both states.
2. **Mixed-selection toast reuses `outcomeToast`** (step 7, copy item 3). Plan change: Phase 4 toast reads "Downloading 3 certificates · 2 skipped" when some rows don't qualify.
3. **Archived enrolments tooltip mentions Valid until** (step 3, F2). Plan change: Phase 3 updates the tooltip copy (copy item 5).
4. **Polish the external line** (Phase 7, copy item 4). Plan change: "Training that wasn't passed has no Valid until date."
5. **Specify unit switching** (step 2, F7). Plan change: Phase 2 keeps the number on unit change, re-validates at once, Save disabled while invalid; add "35 months then Years shows the 1 to 20 error" to Verifies.
6. **Add eligibility data** (step 6, F6). Plan change: Phase 1 adds `certificate: boolean` per course (and pass outcome on `CourseRecord` for Phase 6); Phase 4 extends `allows()` with it.
7. **Add a Valid until date filter on Learning Records** (step 4, F1). Plan change: Phase 3 adds "Valid until" to `DATE_FILTER_FIELD` and the filter list using the existing "between" control; remove it from Still open and the journey's "Still open" note; step 4 becomes "filters Valid until up to the inspection date".
8. **Resolve Blocker 4 with the settled decision** (step 6, F2). Plan change: Phase 4 shows the latest completion's Valid until on every course row that has one, with supporting text "Previous completion" when the current status isn't Completed; update AC7 wording to "each course with a completion" and the journey side path "Re-enrolled, In Progress: no date".
9. **Settle Blocker 2 before build** (step 5, F4). Plan change: make Phase 6 unconditional, or cut certificate downloads from step 5 and point to DEV-5171/5170.
10. **Keep AC10 gated on engineering** (step 7, F5). Plan change: list Blocker 1 and DEV-5167 ship order as prerequisites of Phase 5 in production, not in the prototype.

---

## 13. Plan check

**Journey coverage**
- Step 1 (Trigger): off-platform, no phase needed.
- Step 2: Phase 2. Covered.
- Step 3: Phases 1, 3, 7. Covered.
- Step 4 (Decide): **no phase delivers it.** Phase 3 lists step 4 but only adds a column. Fixed by recommendation 7.
- Step 5: Phase 3 (report) covered; certificates only if Phase 6 runs (conditional). Gap until Blocker 2 is settled.
- Step 6: Phase 4. Covered, but Blocker 4 recommendation contradicts the decision (recommendation 8).
- Step 7: Phases 4, 5. Covered in the prototype; production depends on Blocker 1.
- Phase 8 (Figma) serves all steps; Phase 7 serves step 3. No orphan phases.

**Acceptance criteria**
- AC1-AC4 → step 2, Phase 2. Met; add unit-switch rule.
- AC5, AC6 → steps 3, 5, Phase 3. Met.
- AC7 → step 6, Phase 4. Met as written; wording should follow the decision (recommendation 8).
- AC8, AC9 → step 6, Phase 4. Met once eligibility data exists (recommendation 6).
- AC10 → step 7, Phase 5. Prototype can meet it; production cannot until Blocker 1 is solved.
- AC11-AC13 → Phases 1, 3, 4. Met; the new filter does not add a status.

**Confirm stage**
- The journey ends at Confirm (toast and PDF). Set-up also confirms (save toast). The Decide-to-evidence handoff gains a real confirm once the filtered view exports.

**Blockers and order**
- Blockers are real. Order fixes: pick Blocker 3 (choose A) before Phase 2; settle Blocker 4 before Phase 4; settle Blocker 2 before Phase 6; Blocker 1 is an engineering prerequisite for production AC10, not for the prototype. Phase order 1 → 5 lets each step be verified as it lands; Phase 6 should move before Phase 7 only if confirmed.

**Verdict: Ready after plan fixes** - add the Valid until date filter to Phase 3, align Blocker 4 with the "latest completion" decision, add the past-completions sentence to the helper, add certificate eligibility data and the unit-switch rule, and settle Blocker 2 before build.
