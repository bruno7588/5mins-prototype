# DES-332 People step: Status with several courses (B7 research)

Research for blocker B7 in `DES-332-assign-courses.md`. Checked 2026-10-02. Builds on D2 (skip per course, explained on Review), D7 (draft picks committed with "Select People"), D8 (Limited Admin scope) and D14 (only not started, in progress and overdue count as enrolled; completed people are enrolled again).

**The question:** with several courses selected, a person can be enrolled in some and not others. What does the Status column say, can the admin see which courses, which rows can be picked, what does the Enrolment filter offer and default to, and how does this line up with the skip counts on Review?

---

## 1. Prior art

| Source | What it does | Adopt / reject |
|---|---|---|
| [Cornerstone, Create Learning Assignment: Users](https://help.csod.com/help/csod_0/Content/Learning_Assignment_Tool/Create_Learning_Assignment/Create_Learning_Assignment_-_Users.htm) | "Generate Initial User List" shows, per user and per training item, the item's current transcript Status and Occurrence. By default only users without the training are assigned; "Assign New Occurrence" (optionally "only to users in the 'Complete' status") re-assigns. Assign checkboxes tick and untick automatically from these settings. | **Adopt** the rule: people who already have a course are left out of that course by default, and completed people can be assigned again (matches D2 and D14). **Reject** the per-user, per-item grid and the re-assign toggles; D14 already fixes the behaviour, so there is nothing to configure. |
| [Absorb, Import Enrollments with a CSV](https://support.absorblms.com/hc/en-us/articles/39615717602963-How-To-Import-Enrollments-with-a-CSV) (search summary; 403 on fetch) | Import option to "re-enroll users with a previous enrollment"; if off, rows for people who have already completed are ignored. | **Adopt** as confirmation that completed people being enrolled again is a normal LMS rule. Nothing on how a picker shows partial enrolment. |
| [Docebo, Enrolling users in e-learning courses](https://help.docebo.com/hc/en-us/articles/9167072863762-Enrolling-users-in-e-learning-courses) and [community: re-enrol users into a completed course](https://community.docebo.com/product-q-a-7/re-enroll-users-into-course-already-completed-10833) (search summaries; help centre 403) | Multi-course enrol from the Courses list; admins repeatedly ask how to re-enrol completed users, which suggests the existing enrolment silently blocks it. | **Reject** the silent block; it is the confusion D14 and the Review copy avoid. No partial-status pattern found. |
| Workday, TalentLMS, Sana, 360Learning (sources in the PRD Research) | One course per assignment, or multi-course only by CSV / campaign. | Nothing to learn here: with one course, the partial state never arises. |
| [Slack via U-M guide, add members of a group to a channel](https://teamdynamix.umich.edu/TDClient/30/Portal/KB/ArticleDet?ID=9144) (search summary) | After a bulk add, people already in the channel show "Couldn't invite" in red; the hover text gives the wrong reason ("already in your workspace"). | **Reject** both: reporting a harmless skip as a red failure, and putting the only explanation in a hover. Skips are expected and should read as neutral. |
| [Google Workspace, Can't add a user to a group](https://support.google.com/a/answer/9242708?hl=en) | Only tells the admin "already a member" after they try to add. | **Reject**: we already know the state, so show it before the admin picks. |
| Gmail labels on several selected emails (indeterminate checkbox) | Widely known pattern, but no official Google page describing it turned up. | Not cited. The DS has `indeterminate` on Checkbox, but it means "some children selected", not "some courses done", so it does not fit the Status cell. |
| [Mobbin: Toggl Track, Members](https://mobbin.com/screens/cdf93e6c-3f61-42bc-a8d9-3874484a3a9d) | Role column reads "Various (1)" where a member has mixed values; team cell shows "Toggl Tools (3)". | **Adopt** a summary label with a count in the cell, not every value. **Reject** "Various": it names no number of anything. |
| [Mobbin: Whop, Columns](https://mobbin.com/screens/3e10c98f-7c68-4fbf-9efa-da729b55834c) | Indeterminate "All" with a "34/45" count beside it. | **Adopt** the "N of M" form; people read it at a glance. |
| [Mobbin: Turo, Select cars](https://mobbin.com/screens/c8fb3e20-af68-4e81-8e00-457f592cffa0) | Item already covered is shown ticked and greyed, so it can't be picked twice. | **Adopt** for people enrolled in every selected course: visible, disabled, not hidden. |
| [Mobbin: Klaviyo, Add to list](https://mobbin.com/screens/4ddd466c-24ad-4c01-912b-dd2064edcac5) | Each list option shows its member count. | Context; already adopted in the PRD for teams and cohorts. |
| [Mobbin: Discord, Add members](https://mobbin.com/screens/d8f65000-9b57-4a98-880a-9e85fc2cbc7c), [Wix, Assign role](https://mobbin.com/screens/92210868-06c5-43e9-9d20-9a089b47a2eb) | Member pickers with no "already a member" state at all. | Nothing to learn. Mobbin has no screen with partial membership across several targets in a picker. |
| [Mobbin: Workable, import result](https://mobbin.com/screens/0bd3f7cb-3199-4ce0-98de-2fe47db02b83), [Remote, Summary](https://mobbin.com/screens/b8c0637d-0617-48c9-921a-2c494b1564fb), [Buffer, Scheduling complete](https://mobbin.com/screens/db8f16a0-2197-45e1-a28a-6ce1d95cc33c) | Totals first ("1 imported"), then the exception as one line with its count. All of them report after the fact, styled as errors. | **Adopt** the "headline, then one line per exception" shape for Review. **Reject** error styling and after-the-fact reporting; our skips are known before Launch. |
| [Build For Mars, Fuzzy Context](https://builtformars.com/ux-glossary/fuzzy-context) | A little context, but not enough, raises more questions than none ("not many steps left" vs "two steps left"). | **Adopt**: "Enrolled in some" alone invites "which ones?", so give the number and let the admin see the course names. |
| [Build For Mars, Delegated Decisions](https://builtformars.com/ux-glossary/delegated-decisions) | Default filters remove decisions, but a default the user did not choose shapes what they see. | **Adopt** with care: no filter pre-applied that would hide people the admin still needs (see section 3.4). |
| Build For Mars on skipped items in a bulk action, or mixed states in multi-select | No close match. | n/a |

**What the research says overall:** nobody shows partial enrolment in a picker well. The LMS tools either work one course at a time or bury it in a per-item grid (Cornerstone). The useful patterns are generic: an "N of M" summary in the cell, fully covered items shown disabled rather than hidden, and the detail once, at confirmation.

---

## 2. Candidate designs

| | A. Count badge + tooltip (recommended) | B. Course names in the cell | C. Two-state Status, detail only on Review |
|---|---|---|---|
| Status cell | "Not enrolled" / "Enrolled in 2 of 3" / "Enrolled in all" | One badge per selected course, or "Enrolled: Fire Safety, GDPR" | "Can be enrolled" / "Enrolled in all" |
| Which courses | DS `Tooltip` on the partial badge; per-course totals on Review | Always visible | Review only |
| Cost | Existing `Badge` + `Tooltip`; no new parts | Cell width grows with courses; wraps or truncates at 4+ courses and 14px Medium; scanning gets harder | Cheapest |
| Risk | Tooltip is hover/focus only, so it must stay nonessential (it is: Review carries the totals) | Busy table; truncation hides the very names it is meant to show | Hides state: the admin can't tell a fresh person from one who needs only one course, so they can't judge their selection |
| Verdict | Plain, honest, scales to any number of courses | Reject | Reject; breaks "don't hide state silently" |

An expandable row and a hover card were also considered and rejected: the DS `Table` has no expandable row and there is no hover-card component, so either would need a new component (and a Figma link) for detail the admin rarely needs.

---

## 3. Recommendation: A, count badge with tooltip

### 3.1 Status column

Status counts only the **selected** courses, and only enrolments that count as enrolled under D14 (not started, in progress, overdue). M is the number of selected courses; N is how many of them the person is enrolled in.

| Case | Label | Badge | Row |
|---|---|---|---|
| N = 0 (includes people who only completed the courses, D14) | Not enrolled | `Badge type="informative"`, `customIcon` `UserAdd` | Selectable |
| 0 < N < M | Enrolled in 2 of 3 | `Badge type="informative"`, `customIcon` `UserAdd`, wrapped in `Tooltip` | Selectable |
| N = M, M > 1 | Enrolled in all | `Badge type="success"`, `customIcon` `UserTick` | Disabled (`getRowState` returns `disabled`, `isRowSelectable` false) |
| M = 1 | Not enrolled / Enrolled | as above | as above, so one course behaves exactly like the course wizard |

Why this colour split: the badge colour answers "is there anything left to add?". Grey informative means yes, so the row can be picked; green success means no, so the row is greyed out. This reuses the two badge + icon pairs the Enrol people wizard already uses (`EnrolCourseModal.tsx`), so there is no new badge mapping. `in-progress` is avoided on purpose: "In progress" is also a learner's course status, and the two would be confused. `warning` is avoided because a partial enrolment is not a problem.

Icons are Iconsax Linear, 16px, `color="currentColor"` (iconsax-react on React 19 needs `color` passed explicitly).

### 3.2 The breakdown: a tooltip on the partial badge only

- DS `Tooltip` with `icon={false}`, the badge as its child, `position="Top"`.
- Text names the selected courses in Courses-step order, in two short sentences:
  "Enrolled in Fire Safety and GDPR. Not yet in Food Hygiene."
  With many courses, list the shorter side and count the other: "Not yet in Food Hygiene. Enrolled in the other 4."
- No tooltip on "Not enrolled" or "Enrolled in all"; the label already says everything.
- The tooltip stays nonessential, as the DS requires: the admin can complete the task without it, because Review gives exact per-course counts.

### 3.3 Selectable rule

- A row can be picked unless the person is enrolled in **every** selected course (AC 9).
- Group routes follow the same rule: "All {company} people (N)", team, manager and cohort counts include only people with at least one course to add, as the course wizard's cohort count already excludes enrolled people.
- Status is recalculated whenever the course list changes. If a committed person becomes "Enrolled in all" after the admin removes a course, they drop out of the committed count and their row shows disabled on return to People. Review states it (section 3.5), so nothing changes silently.

### 3.4 Enrolment filter

- Values, one `Dropdown` (single choice), mirroring the badge labels so the admin learns one vocabulary: **Not enrolled**, **Enrolled in some**, **Enrolled in all**. With one course: **Not enrolled**, **Enrolled**.
- Listbox description: "Filter by enrolment in the selected courses".
- **Default: no filter.** Pre-applying "Not enrolled", as the course wizard does, would hide people who still need some of the courses; with several courses that is a real loss, not a convenience. Fully enrolled people are already greyed out and can't be picked, so they need no hiding.
- The draft's "Not enrolled in any" is shortened to "Not enrolled" to match the badge; "Enrolled in all" is added so the admin can check who is left out.
- Note for the team: this differs from the course wizard's default. That is deliberate, and the course wizard is out of scope here.

### 3.5 How Review uses it

Row-level Status and Review read the same person × course data, so the numbers always add up: the skips per course on Review equal the N values on the People step, counted per course.

- Headline: "48 people, 3 courses: 131 enrolments to create."
- Per course row: "40 will be enrolled · 8 already enrolled, skipped"
- Skip reason, one Callout (`type` informative), shown only when there are skips: "Some people are already enrolled in a course, so they'll be skipped for that course only. They stay enrolled in it as they are."
- Re-enrolment line, only when relevant (B2): "6 people completed Food Hygiene before and will be enrolled again."
- Left-out line, only when relevant: "5 people in your teams and cohorts are already enrolled in every course, so they weren't added." This covers group picks and people dropped after a course was removed (3.3).
- Fully enrolled people never appear in skip counts because they can't be picked; the left-out line is where they are accounted for.

### 3.6 Edge cases

| Case | Behaviour |
|---|---|
| Person completed every selected course | Status "Not enrolled", selectable; enrolled again in each (D14). Review: "N people completed {course} before and will be enrolled again", per course. |
| Person completed one course, enrolled in another | Completed course does not count: "Enrolled in 1 of 2". Tooltip: "Enrolled in GDPR. Not yet in Fire Safety." Fire Safety is a fresh enrolment and also appears in the re-enrolment line. |
| Person enrolled in all selected courses | "Enrolled in all", green badge, row disabled, excluded from every group count; reported on Review only if they came in through a group. |
| Only one course selected | Labels "Not enrolled" / "Enrolled", filter values the same; matches the Enrol people wizard. |
| Courses changed after people were committed | Status recalculates; newly fully enrolled people drop from the committed count; Review left-out line explains. |
| Limited Admin (D8) | Sees only in-scope people. N counts every active enrolment the person has in the selected courses, whoever created it; enrolment is a fact about the learner, and ignoring it would create duplicates. The tooltip names only the selected courses, which the admin chose, so nothing outside their scope is revealed. |
| Overdue enrolment | Counts as enrolled (D14), so it is skipped. Review stays neutral; showing overdue here is out of scope. |

### 3.7 Accessibility

- The label carries the meaning; colour and icon are secondary, as `badges.md` requires.
- The partial badge needs a focusable wrapper (`tabIndex={0}`) inside the `Tooltip` child slot, with the cyan `:focus-visible` ring, so keyboard users get the tooltip on focus. `Tooltip` does not set `aria-describedby`, so give the wrapper an `aria-label` that holds the full text: "Enrolled in 2 of 3 courses. Enrolled in Fire Safety and GDPR. Not yet in Food Hygiene."
- Pressing Escape closes the tooltip (built in).
- `Badge` sets `role="status"`; in a paged table that means every page change is read aloud. Flag for engineering: Status badges in table cells should not be live regions.
- Disabled rows keep the DS disabled treatment (`--text-disabled`), and the checkbox is a disabled `Checkbox`, never hidden, so a screen reader still hears the person and the reason ("Enrolled in all").
- Review numbers are plain text, not only in badges, so they are read in order.

---

## 4. PM decisions needed

1. **Badge case.** The course wizard's badges read "Not Enrolled" / "Enrolled" (Title Case, like the DS defaults "In Progress"); this doc uses sentence case ("Not enrolled", "Enrolled in 2 of 3") per the copy rules. Pick one for both wizards.
2. **Left-out line on Review** (3.5). Recommended, because it accounts for people who came in through a team or cohort but get nothing. If you want the fewest lines, drop it; group counts already exclude them, so nothing is wrong, it just goes unexplained.
3. **Filter default differs from the course wizard** (no default here, "Not enrolled" there). Confirm you're happy for the two wizards to differ, or raise a ticket to align the course wizard later.
