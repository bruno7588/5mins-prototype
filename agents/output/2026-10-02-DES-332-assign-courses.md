# DES-332 Assign courses (bulk course assignment)

Ticket: DES-332 · New Task · In Design Phase · Medium · no epic, no links, no comments. Prototype reference (read 2026-10-02, reference only): https://claude.ai/code/artifact/37c6364e-d651-4e68-81ac-13de18a75080

---

## 1. Context

### The problem

Today an admin who needs a group of people in several courses, for example every Front Office starter in GDPR, Fire Safety and Food Hygiene, has two poor options. They can open each course and run "Enrol people to your course" once per course, rebuilding the same audience each time, or they can create an "Existing Employee Automation", which is a rule engine dressed up for a one-off job. DES-332 gives them one flow: pick the courses, set each course's timing, pick the people, review, launch.

This is table stakes at the enterprise end of the category. Cornerstone's Learning Assignment Tool and Docebo both assign several courses to many users in one action; Sana, TalentLMS and Workday mostly work one course at a time and fall back to CSV for multi-course jobs (see Research). For compliance-heavy buyers, doing it in one pass with per-course due dates is expected, not novel.

### What the code does today

> **Updated 2026-10-08:** the course-level Enrol people wizard (rows below) now shares the Assign courses wizard: top stepper People → Dates → Sponsor → Review, footer Back / Continue, the existing-enrolments banner, `recordEnrolments` and the confetti success screen ("View Enrolments" opens the Enrolments tab). Dates use a calendar start date and a due date that is none, relative or a specific day; the sponsor (name, role) is optional. The rows below describe the earlier state.

| Area | Current behaviour | Where |
|---|---|---|
| Entry point | "Your Courses" page header has one filled `Button` "Create Course" (navigates to `/create-course`). The same header is duplicated on the list view. No "Assign Courses" button. | `src/pages/your-courses/YourCourses.tsx` (`/your-courses`), `YourCoursesList.tsx` (`/your-courses/list`); routes in `src/App.tsx` |
| Course-level enrol wizard | Full-screen overlay (`useOverlayA11y`, `CloseButton variant="fullscreen"`), title "Enrol people to your course". Left step rail: Enrol people (built), Set a date and Name a sponsor (inert, `.ui-disabled`). | `src/pages/your-courses/components/EnrolCourseModal/EnrolCourseModal.tsx` + `.css` (`.ecm-*`), opened from `CourseDetails.tsx` |
| People picker in that wizard | Collapsible Filters bar with `FilterListbox` (`groups` prop: Person = Enrolment, Team, Cohort, Region, Job Role, Is Manager; Custom Fields = Account Type, Contract Type), `FilterMultiSelect` for multi values, `Dropdown` for single. Chips All / People / Cohorts (no Teams, no Managers). DS `Table` with Name (sortable) / Team / Status (`Badge` Enrolled / Not Enrolled); enrolled rows disabled; 5 per page. Opens with "Enrolment is Not Enrolled" pre-applied. | same file; `src/pages/learning-records/components/FilterListbox/FilterListbox.tsx`, `FilterControls/FilterMultiSelect.tsx` |
| Draft vs commit | Table picks are a draft; "Select People" (outlined) commits them; header "Review & Launch" enrols the committed count straight away. There is no review screen; the parent shows a toast "N people enrolled". | `EnrolCourseModal.tsx` (`confirmedCount`), `CourseDetails.tsx` (`onEnrol`) |
| People data | 716 generated `PersonRow`s, each with `team` (string), `region`, `jobRole`, `isManager`, `cohortId` and a single `enrolled` boolean for the one course. No person × course enrolment store anywhere; no team or manager-to-report entities. | `EnrolCourseModal.tsx`; `src/data/` has only `orgUsers.ts` (12 users), automations has `mockPeople.ts` (18 users) |
| Per-course timing controls | Course rows with three popover cells: `EnrollmentPopover` (Immediate / After delay "x days after previous course enrolment"), `DueDatePopover` (none / X days after start), `FrequencyPopover` (one-time / every N weeks or months). Uses `Radio` plus hand-rolled − / + buttons. Model: `EnrollmentType` `after-delay` with `relativeTo: 'registration' \| 'previous-course'` (no "today"). | `src/pages/automations/AutomationDetailsModal.tsx` (`CourseRow`), `EnrollmentPopover.tsx`, `DueDatePopover.tsx`, `FrequencyPopover.tsx`, types in `Automations.tsx` |
| Course search | `CourseSearch`: DS `Search` over a listbox of `MOCK_COURSE_CATALOG` (5Mins and tenant courses, with source label); excludes ids already added. Separate from the Your Courses data (`courseStore.ts`, which has `published` / `draft`). | `src/pages/automations/CourseSearch.tsx`, `courseCatalog.ts` |
| Drag to reorder | Two in-repo patterns, both native HTML5 drag, no keyboard alternative: automations `CourseRow` (dragging row at `opacity: 0.5`) and Programs `CourseOutline` (dragging row ringed in `var(--selected)`). | `AutomationDetailsModal.tsx/.css`, `src/pages/programs/components/CourseOutline/` |
| Review pattern | Automations "Review automation" `ConfirmModal` restates the job in sentences with `SummaryCard` / `SummaryCardList`; existing-employee automations add "N of M people match these criteria and will be enrolled." | `AutomationDetailsModal.tsx` (DEV-4768), `src/pages/automations/SummaryCards.tsx` |
| Success screen | Programs `LaunchSuccessModal`: full-screen, confetti, "Success!" / "Your program is now live." / "Track Progress". Program-specific copy and props. | `src/pages/programs/components/LaunchSuccessModal/` |
| Existing Employee Automation | Template card on Automations, trigger `existing-users`. Code comment: "DEV-4666 retires this template into Assign courses." | `src/pages/automations/Automations.tsx` (around line 1199) |

### Decisions taken

| # | Decision |
|---|---|
| D1 | Retiring the Existing Employee Automation is out of scope. The overlap is noted here only (same job; DEV-4666 is the retirement ticket referenced in code); no change to Automations. |
| D2 | A selected person already enrolled in one of the selected courses is skipped for that course only. The Review step states how many will be skipped and why. |
| D3 | The prototype artifact is reference only; this PRD may diverge where the DS or research suggests better. |
| D4 | Add a Review step before Launch: a summary of courses × people, including skipped, with a single Launch confirm, matching Review & Launch on the course enrol wizard. Flow: Courses → People → Review → Launch/success. |
| D5 | Managers: selecting a manager enrols that manager only. Their direct reports are not enrolled. |
| D6 | Closing the wizard always asks for confirmation before discarding selections. |
| D7 | People are selected first, then committed with "Select People", following the Enrol people wizard: table picks are a draft until committed. |
| D8 | Limited Admins (DES-308) only see people inside their scope in the picker. |
| D9 | Learner emails are out of scope for now. |
| D10 | The success screen button, View Enrolments, takes admins to the Active Enrolments tab of Your Courses, where the new enrolments show (changed 2026-10-08; was: back to where they started). |
| D11 | The "Assign Courses" button appears on both `/your-courses` and `/your-courses/list`. |
| D12 | A recurring course re-enrols the same group of people each time; it does not re-evaluate who matches. |
| D13 | Enrolment data is mock data in `src/data/` for the prototype. |
| D14 | People who have completed a course can be enrolled again, so they do not count as enrolled and are never skipped. Only not started, in progress and overdue enrolments count as enrolled. |
| D15 | Published courses can be assigned (5Mins and your own); drafts cannot. |
| D16 | Course order and timing replicate Automations: courses are a numbered sequence; each course enrols "Immediate" (at launch) or "After delay", x days after the previous course's enrolment; dragging a course changes the chain and so its dates. This replaces the ticket's "X days from today". |
| D17 | Multi-course Status follows `2026-10-02-DES-332-assign-courses.status-research.md`: "Not enrolled" (informative `Badge`, `UserAdd`, selectable), "Enrolled in 2 of 3" (informative `Badge` with a DS `Tooltip` naming the courses, selectable), "Enrolled in all" (success `Badge`, `UserTick`, row disabled). With one course: "Not enrolled" / "Enrolled". Badge copy is sentence case in both wizards. |
| D18 | Review keeps a line for people left out because they are already enrolled in every selected course. |
| D19 | The Enrolment filter offers "Not enrolled" / "Enrolled in some" / "Enrolled in all" with no default; the course wizard keeps its "Not enrolled" default. |
| D20 | Courses show their resulting dates, in the timing cells ("Starts 16 Oct 2026") and on Review, so reordering visibly changes dates. |
| D21 | Reorder is drag and drop only; no visible Move up / Move down buttons. Keyboard users drag with the grip (Space to pick up, arrow keys to move, Space to drop, Escape to cancel), announced to screen readers. |
| D22 | The success screen plays the confetti animation (as the Programs launch success does), respecting reduced motion. |
| D23 | Designs for the five undocumented pieces follow `agents/output/2026-10-02-DES-332-assign-courses.design-research.md`, amended by D20-D22. |

### Acceptance criteria

Derived from the ticket (no formal ACs on DES-332).

1. The Your Courses page header, on both `/your-courses` and `/your-courses/list`, shows an outlined "Assign Courses" button immediately left of the filled "Create Course" button (D11).
2. "Assign Courses" opens a full-screen wizard titled "Assign courses" with three steps in order: Courses, People, Review. The full-screen close button and Escape exit it; if any course or person has been chosen, closing always asks for confirmation before discarding (D6).
3. On Courses, the admin can search for courses and add them; an added course leaves the search results and can be removed from the list.
4. Each added course has three settings: Enrolment (Immediate at launch, or a number of days after the previous course's enrolment, as in Automations, D16), Due date (No due date, or a number of days after the course starts) and Frequency (Once, or recurring every N weeks or months, re-enrolling the same group each time, D12; named as in Automations). Defaults are Immediate, No due date, Once.
5. The admin can reorder courses by drag and drop, including a keyboard drag on the grip (D21); there are no move buttons; row numbers and the "after previous course" chain update to match (D16).
6. The admin cannot move past Courses with no course added; the blocked control says why.
7. On People, the admin chooses from All / People / Teams / Managers / Cohorts chips, can add filters from a searchable "Add Filter" listbox (Team, Cohort, Region, Job Role, Is Manager, Enrolment) and sees a Name / Team / Status table with search and pagination. Picking a manager enrols that manager only, not their direct reports (D5). A Limited Admin only sees people inside their scope (D8).
8. Table picks are a draft until the admin presses "Select People", following the Enrol people wizard (D7). A person picked through more than one route (All, a team, a cohort, by name) is counted once. The step rail shows the count of committed people.
9. Status reflects all selected courses, not one course; a person already enrolled in every selected course cannot be selected.
10. Review lists every course in order with its timing summary, and per course the number of people who will be enrolled and the number skipped.
11. Review states the totals (people, enrolments to create, enrolments skipped) and the skip reason in plain words, for example "12 people are already enrolled in Fire Safety, so they'll be skipped for that course."
12. Review has a single "Launch" button. The admin can go back to Courses or People from the step rail without losing their selections.
13. Launch creates one enrolment per selected person per selected course, minus the skipped pairs, each with that course's enrolment, due date and repeat settings. Nothing is written to Automations.
14. After launch, a full-screen success screen with the confetti animation (D22) states what was assigned (courses and people counts) and its View Enrolments button takes the admin to the Active Enrolments tab (D10).
15. All copy follows the 5Mins copy rules (British English, sentence case, Title Case buttons, no em dashes); all styling uses `tokens.css` tokens; every interactive element has a visible `:focus-visible` ring; the flow works in light and dark mode.

### Out of scope

Retiring or changing the Existing Employee Automation (D1); saving an assignment as a reusable rule or draft; specific calendar dates for enrolment or due date; naming a sponsor; editing or cancelling an assignment after launch (individual enrolments stay editable on each course's Enrolments tab); CSV upload of people; learner emails and notifications (D9); programs (courses only); learner-side changes.

---

## 2. Research

Sources were checked on 2026-10-02. Two help centres (Docebo, TalentLMS) returned HTTP 403 to direct fetch; their rows rely on the search-result summaries of the linked pages and are marked as such.

### Assigning several courses to many people in one action

| Source | What it does | Verdict |
|---|---|---|
| [Cornerstone, Create Learning Assignment: Confirm](https://help.csod.com/help/csod_0/Content/Learning_Assignment_Tool/Create_Learning_Assignment/Create_Learning_Assignment_-_Confirm.htm) | Wizard Setup → Options → Schedule → Users → Confirm. Confirm shows read-only tiles (learning objects count, schedule, number of users); to change anything you go back to that step. Warns when an assignment hits more than 20% of active users. | **Adopt** the read-only review with edit-by-going-back (AC 10, 12). **Reject** the five-step depth; our three steps cover it. |
| [Cornerstone, Assign Training](https://help.csod.com/help/csod_0/Content/User/Learning/Assign_Training/Assign_Training.htm) | Due date options: No due date, Relative (days, months, years from assignment), Specific date. | **Adopt** No due date + relative days (AC 4). Specific dates stay out of scope. |
| [Docebo, Enrolling users in e-learning courses](https://help.docebo.com/hc/en-us/articles/9167072863762-Enrolling-users-in-e-learning-courses) (search summary; 403 on fetch) | Tick several courses on the Courses page, Choose action → Enroll users, then pick users, branches or groups from tabs. | **Adopt** people / groups as tabs over one table (AC 7). **Reject** the course-list multi-select entry; the ticket's dedicated "Assign Courses" entry is clearer. |
| [Docebo community, multiple users into multiple courses](https://community.docebo.com/docebo-superadmins-46/enroll-multiple-users-into-multiple-courses-from-the-user-management-page-3729) | Admins asking for multi-course × multi-user enrolment from User Management; confirms it is a recurring need. | Context only. |
| [Sana, Assigning content](https://help.sana.ai/en/articles/7501-assigning-content) | Per-course "Add learners > Users/Groups"; Repeat can trigger "after assignment" or "after completion"; learners get an email. No multi-course assignment or review step documented. | **Adopt** Repeat as a per-course setting (AC 4). Note: Sana is per course, so DES-332 goes further than our closest comparator. |
| [Sana Learn changelog](https://sanalabs.com/sana-learn-changelog) | Bulk assignments run through "Admin mode" chat with an attached CSV. | **Reject** for this ticket; conversational bulk admin is a different product bet. |
| [TalentLMS, enrol multiple users to a course](https://help.talentlms.com/hc/en-us/articles/20287329508508-How-to-enroll-multiple-users-to-a-course-at-once-in-TalentLMS) (search summary) | One course at a time; select users (max 160) → Mass actions → Enroll → confirm. Multi-course only via file import. | **Reject** the selection cap and the one-course limit. |
| [Workday, Mass Enroll in a Course (State of Nebraska guide)](https://das.nebraska.gov/personnel/docs/NE_DAS_Personnel_Workday_User_Guides-Mass_Enrollment.pdf) | Filter workers in a report, tick them, Mass Enroll, then pick one course ("only allows one course title"). | **Reject**; shows the one-course pain DES-332 removes. |
| [360Learning, Web release notes 2026](https://support.360learning.com/hc/en-us/articles/360024018232-Web-Release-Notes-2026) | "Assign groups" sorted by size; up to 20,000 learners per session; upskilling campaigns enrol people in several paths with a custom deadline. | **Adopt** showing group size next to each team / cohort (AC 7). |

### Mobbin: shipped patterns

| Source | What it does | Verdict |
|---|---|---|
| [Contra, Adding deliverables](https://mobbin.com/flows/ca8e2836-1501-484b-8af9-4eac3696700e) | Horizontal stepper, Back / Next in the header, item rows with drag handles and a trash icon. | **Adopt** handle-left, remove-right row anatomy (already ours). **Reject** the horizontal stepper; our course wizard uses a left step rail, and two wizards in one product should match. |
| [Square, Assigning items](https://mobbin.com/flows/5511c572-294f-4897-b8e2-b1b2046fa752) | Picker with search + filter adds items; the page then summarises "2 items" with names. | **Adopt** a count summary under each step name in the rail ("3 courses", "240 people"). |
| [Mailchimp, Review and complete your import](https://mobbin.com/screens/ef381fc7-d2c1-42df-ae39-645d24426af2) | Leads with one sentence ("3 contacts will be updated or added…"), then bulleted settings, one primary "Complete Import". | **Adopt** a headline sentence with the totals above the per-course list (AC 11). |
| [7shifts, Confirm package](https://mobbin.com/screens/063d1a81-7605-4541-9725-37c9af26f81b) | "5 employees will receive an onboarding package", the item list, one primary button and Back. | **Adopt**; closest shape to our Review. |
| [Klaviyo, Confirm sending information](https://mobbin.com/screens/b087856d-8b54-4198-9fb9-bd8048c57a9e) | "Estimated total audience" broken down by source list. | **Reject** the per-source breakdown; admins need per-course enrolled / skipped, not where each person came from. |
| [Calendly, Review bulk email](https://mobbin.com/screens/c8ea92b3-186c-4bf0-a25c-dd75ebb65455) | Review screen with a warning banner ("2 recipients are missing data"), then a second "Send email to 2 contacts?" modal on top. | **Adopt** a callout for the exception (skips). **Reject** the second confirm; the Review step is the confirmation (D4). |
| [Gamma, outline card handle](https://mobbin.com/screens/516d0fb7-9538-4a46-a2ec-f571f7ec7440) | Handle tooltip "Drag to move / Click to open menu": the same handle offers a non-drag way to move. | **Adopt** the idea for the keyboard alternative (AC 5); component is an open question (B5). |
| [Circle, Re-order courses](https://mobbin.com/screens/a0684ada-0fe1-410b-a8e6-f4109d3c33a7) | Reordering in a separate modal with Confirm. | **Reject**; reorder in place. |
| [Asana, Project members](https://mobbin.com/screens/09f791a4-1954-4035-bbdc-38daff566e6f), [OpenAI Platform, Add members](https://mobbin.com/screens/682331de-ae9c-45c1-8396-28407f523963), [Square, Add or remove customers](https://mobbin.com/screens/8b317877-df63-4b01-a60d-35c69b10d591) | People pickers: one field mixing people and teams (Asana); searchable checkbox list (OpenAI); running count "10 customers in this group" (Square). | **Adopt** the running count (AC 8). **Reject** Asana's single mixed field; it hides group size, which matters at 700+ people. |
| Per-item relative scheduling ("X days from today" per row) | No close match on Mobbin. | Our automations `CourseRow` is the best reference we have. |

### Build For Mars: underlying principles

| Source | Lesson | Verdict |
|---|---|---|
| [Intentional Friction (glossary)](https://builtformars.com/ux-glossary/intentional-friction) | Slowing the user down deliberately is right when an action is costly to undo. | **Adopt**: launching enrols and notifies hundreds of people, so one deliberate Review step is right. |
| [Gmail case study, "Pop-up problems"](https://builtformars.com/case-studies/gmail) | Teams forget the extra pop-ups in a journey that users still have to get through. | **Adopt**: no confirm modal on top of Review. |
| [Wise, A structured payment process](https://builtformars.com/ux-bites/a-structured-payment-process) | Show the key figure first, then the details. | **Adopt**: Review leads with totals, then per-course rows. |
| [Revolut, The next action](https://builtformars.com/ux-bites/the-next-action) | The success message suggests the next useful step. | **Adopt** for the success screen (AC 14); the destination is open (see Still open). |
| [Monzo, Undo payments](https://builtformars.com/ux-bites/undo-payments) | A short buffer after "send" so the user can undo. | **Reject** for now; it needs engine support and the Review step covers the risk. |
| Skipped items in a bulk action; bulk enrolment in learning tools | BFM had no close match. | n/a |

---

## 3. Implementation

### Blockers

| # | Blocker | Recommendation |
|---|---|---|
| B1 | **No person × course enrolment data.** Settled by D13: a deterministic mock enrolment map in `src/data/` (person id × course id × status), seeded so every demo course has some skips and some completions. | Done when the map exists; Status, skips and Launch all read from it. |
| B2 | **"Already enrolled".** Settled by D14: not started, in progress and overdue count as enrolled and are skipped; completed does not, so those people are enrolled again. | Review copy should say completed people will be re-enrolled, so the admin is not surprised. |
| B3 | **Timing anchor vs drag order.** Settled by D16: replicate Automations (`EnrollmentType` in `Automations.tsx`, `EnrollmentPopover`, `reorderCourses`). Enrolment is Immediate or x days after the previous course; order drives the chain. | Reuse the `EnrollmentType` model as is; Review shows each course's resulting start ("Immediately", "3 days after Fire Safety"). |
| B4 | **Teams and Managers have no data model.** Team is a string on each person; nothing marks who is a manager beyond the Is Manager filter. Meaning settled by D5: a manager is enrolled alone, never their reports. | Teams: list teams with member counts (derived from `team`). Managers: list people flagged as managers; selecting one adds that person only. No `managerId` link is needed. |
| B5 | **Components with no DS doc**: step rail, drag-reorder list, scheduling popover, Review summary cards, success screen. Designs settled by D23 (`2026-10-02-DES-332-assign-courses.design-research.md`); the drag grip is a hand-drawn SVG, not Iconsax. | Before production, check the Figma Library for each piece and get links for any it lacks; confirm the grip glyph. Prototype builds from the research doc. |
| B6 | **Which courses can be assigned.** Settled by D15: published courses from both sources; drafts never appear in the search. | None. |
| B7 | **Status with several courses.** Settled by D17-D19; full rationale, edge cases and accessibility notes in `agents/output/2026-10-02-DES-332-assign-courses.status-research.md`. | Partial badge needs a focusable wrapper with a full-sentence `aria-label` (Tooltip sets no `aria-describedby`); drop `Badge`'s `role="status"` inside table cells. |

### Phases

| # | Change | Verifies | ACs | Status |
|---|---|---|---|---|
| 0 | All blockers settled (D5, D13-D23); still to do before production: Figma Library check for B5; get Figma links for B5. | Decisions recorded in this doc. | all | Open |
| 1 | Pull the people step out of `EnrolCourseModal` (filters, chips, table, selection maths) into one module both wizards import, with the course list as an input. No behaviour change to the course wizard. | Course wizard on `/your-courses/course` behaves exactly as before; `npm run build` passes. | 7, 8 | Done 2026-10-02 (`PeoplePicker`, `WizardShell`, `src/data/people.ts`) |
| 2 | Add the outlined "Assign Courses" button to the Your Courses header, plus the full-screen shell (`useOverlayA11y`, `CloseButton variant="fullscreen"`, step rail Courses / People / Review with counts under each), on both `/your-courses` and `/your-courses/list`. Closing with anything chosen opens a discard confirm (`ConfirmModal`, no close X). New page classes prefixed `.acw-` (grepped, free). | Button sits left of Create Course on both routes; Escape and close exit, and ask first once anything is chosen; focus is trapped and returned. | 1, 2 | Done 2026-10-02 |
| 3 | Courses step: `CourseSearch` (published only), course rows (number, thumbnail, title, remove), three timing cells using the automations popovers and `EnrollmentType` model as they are (Immediate, or x days after previous course, D16), with `InputInteger` in place of the hand-rolled − / +, drag reorder with a keyboard alternative. Primary "Next" disabled with a `Tooltip` reason when empty. | Add, remove, set all three settings, reorder by mouse and keyboard; can't continue with no course. | 3, 4, 5, 6 | Done 2026-10-02 (`CoursesStep`, `SchedulePopover`) |
| 4 | People step: chips All / People / Teams / Managers / Cohorts (DS `Chip`), the filter set with "Enrolment", DS `Table` with multi-course Status (B7), draft picks committed with "Select People" as in the Enrol people wizard, de-duplicated committed count in the rail, managers enrolled alone, Limited Admin scope applied to the list. Uses the B1 mock map. | Picking the same person via a team and by name counts once; picks only count after Select People; fully enrolled people can't be selected; a Limited Admin sees only in-scope people. | 7, 8, 9 | Done 2026-10-02; Limited Admin scope is an `inScope` prop, unused until the prototype has a Limited Admin sign-in |
| 5 | Review step: headline totals sentence, per-course rows (order, title, timing summary via `formatCourseMeta`-style text, enrolled and skipped counts), one callout explaining skips, single "Launch" in the header. Rail steps link back with state kept. | Counts match the mock map by hand for a seeded case; going back and forward keeps selections. | 10, 11, 12 | Done 2026-10-02 (`ReviewStep`) |
| 6 | Launch: write the person × course pairs (minus skips) into the mock map with each course's settings; show the full-screen success screen reusing the `LaunchSuccessModal` pattern with assignment copy, for example "Courses assigned" / "3 courses assigned to 240 people.", whose action returns to Your Courses. Nothing touches `src/pages/automations/`. | Reopening the wizard shows the launched people as enrolled; Automations is unchanged (`git diff` on that folder is empty). | 13, 14 | Done 2026-10-02 (`src/data/enrolments.ts`; Automations folder untouched) |
| 7 | Copy pass with the 5mins-copy-review skill, token and focus audit, light and dark check, and a fresh ux-auditor review. | No raw values in new CSS; every control has a focus ring; no em dashes. | 15 | Partly done: tokens, focus rings, light and dark checked; copy-review skill and ux-auditor still to run |

### Risks to watch during build

- **Copying the automations drag state.** `CourseRow` fades the dragged row to `opacity: 0.5`, which breaks the no-opacity-states rule; use the `CourseOutline` treatment (`var(--selected)`).
- **Reusing the popovers as they are.** The copy "Enrol user as soon as automation is triggered" must say launch, not automation; the popovers also hand-roll − / +, which `input.md` forbids (use `InputInteger`).
- **Forking the people picker.** A second copy of `EnrolCourseModal`'s selection maths will drift; do phase 1 first.
- **Global CSS collisions.** Don't restyle `.ecm-*` or `.automation-details-*` from the new page; scope new rules under `.acw-`.
- **`LaunchSuccessModal` is used by Programs.** Generalising its copy or props must not change the program success screen.
- **Scale.** "All" can mean thousands of people × several courses; counts must stay correct and the Review must not render one row per person.
- **Button case.** The copy skill's word list says sentence-case buttons; the project rule (Title Case buttons) wins: "Assign Courses", "Add Filter", "Launch".

### Still open

Nothing open; B5 needs a Figma Library check before production.
