---
ticket: DES-309
summary: Course Retake & Failed Status
status: in Design Phase
generated: 2026-06-02T14:14:38.305Z
---



# PRD: Course Retake & Failed Status

## 1. Overview

Admins on the platform repeatedly ask: *"Can we automatically reset progress for users who fail a course?"* Behind this request sit two real problems. First, there is no automatic recovery path — when a learner finishes a course below the pass score, an admin must manually intervene to give them another shot, which is untenable at scale for compliance training. Second, the progress display can feel contradictory — a learner can reach 100% content completion while still burning through per-question quiz retries, and admins need to understand that state without confusion.

This spec introduces three things: (1) an **info icon** that disambiguates the "100% complete but still retrying quizzes" state, (2) a **Reset progress** primitive (usable both automatically and manually) that gives learners a fresh course attempt *within the same enrolment* — preserving due dates, start dates, and compliance cycles, and (3) an **"Attempt no" column** and admin controls to surface repeat-strugglers. The design follows the dominant industry pattern: the enrolment is durable; progress data on it gets reset; past attempts are preserved in a history log.

---

## 2. Jobs To Be Done

### Main Job

**When a learner fails a course, give them another chance to pass without disrupting the compliance/training cycle or requiring manual admin intervention.**

### Job Map

| Stage | What happens today | Pain / Workaround |
|---|---|---|
| **Define** | Admin sets up a course with a pass threshold and per-question retry limits | No ability to define what happens *after* failure — the system has no concept of "course attempt" |
| **Locate** | Admin identifies a failed learner on the enrolments table | Status model has no "Failed" state; a learner stuck below threshold looks identical to one still working — both show as "In Progress" |
| **Prepare** | Admin decides the learner needs another shot | No automated option; admin must mentally track who needs resetting |
| **Confirm** | Admin initiates a re-enrol (only existing action) | Re-enrol creates a *new* enrolment record, shifting due dates out of sync with the compliance calendar — wrong tool for the job |
| **Execute** | Re-enrol runs; learner starts on a new cycle | Compliance cycle is broken; learner is now on a personal failure-recovery schedule instead of the company's annual training calendar |
| **Monitor** | Admin checks if the learner passed on the second try | No "Attempt no" concept — admin cannot distinguish first-time learners from repeat-strugglers without memory or spreadsheets |
| **Resolve** | Compliance audit requires proof of attempts | No CourseAttemptHistory — previous attempt data is either lost (re-enrol) or invisible |

### Related Jobs

- **Compliance officer** needs an audit trail proving that a learner attempted a course, failed, and was given a structured opportunity to retry — all within the same assignment period.
- **Learner** needs to understand what happened (they didn't pass) and what to do next (try again) without feeling punished or confused.
- **Admin managing hundreds of enrolments** needs to quickly filter and find repeat-strugglers who may need coaching or alternative interventions, without reviewing each record individually.

### Emotional & Social Dimensions

- **Admin** wants to feel *in control* and *efficient*. They don't want to be a bottleneck in the learner's recovery path. They want to trust the system to handle the common case automatically while surfacing the edge cases that need human judgment.
- **Learner** wants to feel that failure is *recoverable*, not *terminal*. The system should frame a new attempt as a fresh opportunity, not a mark of shame. Seeing "Failed" as a permanent end-state (when auto-reset is off) should be rare and clearly explained.
- **Compliance officer** wants to feel *confident* that the audit trail is complete and immutable — that the system's records will hold up under regulatory scrutiny.

---

## 3. Goals

1. **Eliminate manual admin intervention for the common case.** When auto-reset is enabled, a learner who fails should automatically get a fresh attempt — no admin action required.
2. **Preserve compliance cycle integrity.** Reset progress must never shift a learner's start date, due date, or recurrence cycle. The enrolment record is durable.
3. **Disambiguate the "100% complete but still retrying" state.** Admins should never be confused by a learner showing 100% progress but "In Progress" status.
4. **Surface repeat-strugglers without inventing new status labels.** The "Attempt no" column + filter lets admins find learners on attempt 3, 4, 5+ for proactive coaching — without overloading the status taxonomy.
5. **Maintain a complete audit trail.** Every closed attempt is snapshotted into CourseAttemptHistory before progress resets, and old QuestionAnswer records remain queryable by attempt number.
6. **Keep the status model simple.** Three statuses only: In Progress, Passed, Failed. The info icon handles the single ambiguous case.

---

## 4. Job Stories

### Course Recovery

- **When** a learner finishes a course below the pass score with all quiz retries exhausted and auto-reset is on, **I want** the system to automatically reset their progress and open a new attempt, **so I can** avoid manually resetting dozens of failed learners in compliance training cycles.

- **When** a learner finishes a course below the pass score with all quiz retries exhausted and auto-reset is off, **I want** to see a clear "Failed" status on the enrolments table with a "Reset progress" action available, **so I can** decide whether to give them another shot or take a different intervention.

- **When** I click "Reset progress" on a learner (in any status), **I want** to see a confirmation modal that clearly states what will happen — progress archived, fresh attempt opened, dates unchanged — **so I can** be confident I'm not disrupting the enrolment cycle.

### Status Clarity

- **When** I see a learner at 100% completion but still "In Progress," **I want** an info icon that explains they're working through remaining quiz retries, **so I can** understand the state without contacting support or inspecting raw data.

- **When** I'm reviewing the enrolments table for a compliance audit, **I want** to see an "Attempt no" column showing how many times each learner has attempted the course, **so I can** identify repeat-strugglers and decide if they need coaching or alternative training.

### Learner Experience

- **When** my progress is auto-reset after a failed attempt, **I want** to receive a notification ("Your fresh attempt at [Course] is open") without first seeing a jarring "Failed" state, **so I can** feel that the system is helping me recover rather than punishing me.

- **When** my progress is reset (auto or manual), **I want** to only need to retake the quizzes — not re-consume all the content (videos, readings) — **so I can** focus my time on what I actually need to improve.

### Admin Configuration

- **When** I'm setting up a compliance course, **I want** a per-course "Auto-reset on failure" toggle (off by default), **so I can** decide on a course-by-course basis whether failed learners are automatically given another shot.

- **When** I configure auto-reset, **I want** to also set a maximum number of course attempts, **so I can** prevent infinite retry loops and escalate persistent failures to human review.

---

## 5. Requirements

### Functional Requirements

#### FR-1: Status Model (Three statuses + info icon)

- **FR-1.1:** The system SHALL display exactly three admin-facing statuses: **In Progress**, **Passed**, **Failed**.
- **FR-1.2:** Status derivation after every quiz answer submission:
  - `quizResult === true` → **Passed**
  - `quizResult === false` → check quiz attempt exhaustion (FR-1.3)
  - `quizResult === undefined` → **In Progress**
- **FR-1.3:** When `quizResult === false`:
  - If any failing question still has remaining quiz attempts → **In Progress** (show info icon if at 100% content completion)
  - If all failing questions are at `maxAttempts`:
    - If `autoResetEnabled === true` → execute Reset progress; learner becomes **In Progress** (new attempt)
    - If `autoResetEnabled === false` → **Failed**
- **FR-1.4:** When a learner is at 100% content completion but status is In Progress (quiz retries remaining), a small info icon SHALL appear next to the status badge. Hovering (mouse or keyboard) shows tooltip: *"Content completed. Learner is working through remaining quiz retries to reach the pass score."*
- **FR-1.5:** The info icon and tooltip are admin-facing only (shown on the enrolments table). The learner does not see an equivalent message.

#### FR-2: Course Attempt Concept

- **FR-2.1:** A new field `courseAttemptNumber` (integer, starting at 1) SHALL be added to the CourseEnrolment record.
- **FR-2.2:** `courseAttemptNumber` increments only when Reset progress runs (auto or manual). Per-question retries do NOT increment it.
- **FR-2.3:** A `courseAttemptNumber` field SHALL be added to QuestionAnswer records to scope answers to a specific course attempt, enabling reporting queries by attempt.

#### FR-3: Reset Progress Primitive

- **FR-3.1:** Reset progress is a single operation used by both auto-reset and the admin manual action. It SHALL:
  1. Snapshot the current enrolment state into a `CourseAttemptHistory` row (attempt number, score, completion date, close reason — `auto-reset` or `admin-reset` — and admin user ID if applicable). Per-question answers are referenced by `courseAttemptNumber` on the existing `courseEnrolmentId`, not duplicated.
  2. Reset progress fields on the existing enrolment: `progress: 0`, `quizScore: 0`, `quizResult: undefined`, `completionDate: null`, `passed: false`, `taken: false`.
  3. Increment `courseAttemptNumber` by 1.
  4. Leave `startDate`, `endDate`, `dueDate`, and recurrence untouched.
  5. Old QuestionAnswer records remain in the database, scoped by `courseAttemptNumber`; they are inactive for the new attempt.
  6. Emit an event hook for downstream listeners (notifications).
- **FR-3.2:** On reset, only quiz progress is reset. Learners do NOT need to re-consume content (videos, readings, etc.) — they retake quizzes only.

#### FR-4: Auto-Reset Trigger

- **FR-4.1:** Auto-reset fires when ALL four conditions are true:
  1. Course is at 100% content completion
  2. `quizResult === false`
  3. Every failing question has used all its per-question attempts (`attemptNumber === maxAttempts` for every question where `passed: false`)
  4. Course has `autoResetEnabled: true`
- **FR-4.2:** If conditions 1–3 hold but `autoResetEnabled === false`, the learner moves to **Failed**.
- **FR-4.3:** No math-elimination check. The system does NOT compute whether remaining retries can mathematically reach the threshold. Only attempt counts are checked.
- **FR-4.4:** Auto-reset is immediate — no cooldown window.
- **FR-4.5:** When auto-reset fires, the transient "Failed" state SHALL be suppressed in the learner-facing UI. The learner's status transitions directly from In Progress → In Progress (new attempt) without ever displaying "Failed." The notification ("Your fresh attempt at [Course] is open") provides sufficient context.

#### FR-5: Per-Course Settings

- **FR-5.1:** A new per-course setting **"Auto-reset on failure"** (toggle, default: Off). When enabled, auto-reset fires per FR-4.
- **FR-5.2:** A new per-course setting **"Maximum course attempts"** (integer, admin-defined). When the learner reaches this limit, auto-reset does not fire regardless of `autoResetEnabled`; the learner moves to **Failed** and admin must manually intervene. No system-generated warning about attempt count is needed.

#### FR-6: Admin Enrolments Table

- **FR-6.1:** A new column **"Attempt no"** SHALL be added to the enrolments table, showing `courseAttemptNumber` for each enrolment.
- **FR-6.2:** The column is sortable.
- **FR-6.3:** The column is included in the learner CSV export.
- **FR-6.4:** (Phase 3) A filter on `Attempt no ≥ N`, combinable with the Status filter, helps admins find repeat-strugglers.

#### FR-7: Admin Row-Level "Reset Progress" Action

- **FR-7.1:** A "Reset progress" action is available on each learner's row in the enrolments table, for any status (In Progress, Passed, Failed).
- **FR-7.2:** It is distinct from the existing "Re-enrol" action.
- **FR-7.3:** Clicking it shows a confirmation modal: *"Reset this learner's progress on [Course]? Their current attempt will be archived and they'll start a fresh course attempt within the same enrolment. Their start date, due date, and recurrence cycle are unchanged."*
- **FR-7.4:** The confirmation modal uses descriptive button labels (e.g., "Reset Progress" / "Cancel"), not generic "Yes" / "No."
- **FR-7.5:** The audit log records `closeReason: 'admin-reset'` and the admin user ID, distinguishing it from `closeReason: 'auto-reset'`.

#### FR-8: Notifications (Phase 3)

- **FR-8.1:** When Reset progress fires (auto or manual), the learner receives an in-app + email notification: *"Your fresh attempt at [Course] is open."*

#### FR-9: Explicit Non-Requirements

- No new status labels (e.g., "Retaking," "Pass Pending").
- No math-elimination detection mid-course.
- No cooldown window before auto-reset.
- No new enrolment record per retake.
- No changes to the existing Re-enrol action.
- No partial question resets (only resetting failed questions).
- No learner-facing "Restart course" button.
- No attempt history visibility for learners (deferred).
- No detailed attempt history view for admins (Phase 2 shows current attempt number only; detailed history deferred).
- No downstream/webhook consumers to conform to for the event hook.

---

## 6. Research & Best Practices

### Industry Pattern Validation

The design decisions in this spec are strongly validated by how mature LMS platforms handle the same problem. The core pattern — durable enrolment record with in-place progress reset and a separate attempt history log — is used by Cornerstone, Docebo, SAP Litmos, Absorb, TalentLMS, 360Learning, and Moodle.

**Absorb LMS** resets all lesson progress while archiving previous enrollments as "Historic Enrollments" with full reporting data preserved. Admin can configure auto-re-enrollment based on completion date or certificate expiry ([Re-Enrollment & Re-Certification — Absorb LMS Help Center](https://support.absorblms.com/hc/en-us/articles/219544607-Re-Enrollment-Re-Certification)). Their automatic re-enrollment uses a two-step toggle pattern (enable + configure) that is a useful reference for the "Auto-reset on failure" course setting ([How to Automate Course Re-Enrollment — Absorb LMS](https://support.absorblms.com/hc/en-us/articles/360053178033-How-To-Automate-Course-Re-Enrollment)). Absorb also consolidates training data into centralized, audit-ready reports with cascading notification patterns (learner → manager → compliance team) that could inform future phases ([Automated Compliance Reporting — Absorb LMS](https://www.absorblms.com/resources/articles/automated-compliance-reporting)).

**Docebo** provides admin-configurable reset behavior; the default for compliance is in-place progress reset on the existing enrolment. Their community reveals a critical UX pitfall: the "Renew" button archives partial progress if clicked mid-attempt, leading to data loss. Community members advocate for a confirmation message like *"You have already re-enrolled during your enrollment period. Are you sure you want to re-enroll and reset your progress?"* — directly validating our confirmation modal approach ([Resetting Learner Progress — Docebo Community](https://community.docebo.com/let-s-talk-shop-42/resetting-learner-progress-when-they-reach-a-maximum-number-of-attempts-3430)). Docebo's audit trail is an immutable log managed by Superadmins, tracking all administrative actions including enrollment and completion changes ([Docebo Audit Trail Events Details](https://help.docebo.com/hc/en-us/articles/6095145987346-Audit-trail-events-details)), and their compliance solution replaces manual tracking with automated notifications, renewal cycles, and dashboards ([How to Automate Compliance Training — Docebo](https://www.docebo.com/learning-network/blog/how-to-automate-compliance-training/)).

**Moodle's** "Interactive with multiple tries" quiz mode is the closest analog to the per-question retry mechanism already in place. Moodle resets completion state in-place with quiz attempts logged separately ([Quiz Settings — MoodleDocs](https://docs.moodle.org/502/en/Quiz_settings)). Notably, Moodle has a known bug where quiz activities with "complete on passing grade" incorrectly unlock content even when a student fails — underscoring why our status derivation logic (checking `quizResult` rather than completion percentage) is the correct approach ([Fixing Moodle's Quiz Completion Bug — InfraNext](https://infranext.co/fixing-moodles-quiz-completion-bug-when-passing-grade-conditions-fail/)). Moodle's dev team also documents the compliance danger of retroactively changing completion states — a student might have filed a certificate with regulators, and changing pass thresholds later could invalidate it — reinforcing our approach of never modifying the closed-attempt record ([Policy: Retroactive Effects of Completion Settings — MoodleDocs](https://docs.moodle.org/dev/Policy_-_Retroactive_effects_of_completion_settings)).

**Canvas** community discussions reveal that the "retake after failure" workflow is one of the most-requested and under-served features across LMS platforms ([How to Implement Course Retake — Canvas Community](https://community.canvaslms.com/t5/Canvas-Question-Forum/How-to-implement-course-retake-for-students-who-failed/m-p/493281)). **LearnDash** requires a third-party add-on for progress resets, and without a separate completion-records plugin, historical completion data is destroyed on reset — validating our decision to snapshot into CourseAttemptHistory before resetting ([Automatically Reset LearnDash Courses — WooNinjas](https://wooninjas.com/automatically-reset-learndash-courses/); [Complete Guide to Resetting Student Progress in LearnDash — WooNinjas](https://wooninjas.com/the-complete-guide-to-resetting-student-progress-in-learndash/)).

A cross-platform review confirms that automated re-enrollment/reset, audit trails, and admin notifications are table-stakes features for compliance LMS platforms in 2025–2026 ([10 Best Compliance Training Software Solutions — Docebo](https://www.docebo.com/learning-network/blog/compliance-training-solutions/)).

### Status Anti-Pattern: "Stuck In Progress"

A well-documented anti-pattern occurs when a learner fails a course but the status gets "stuck" as "In Progress" or "Resume" due to poor communication between the SCORM package and LMS on session state after failure ([Course Stuck in Resume/In-Progress — Adobe Community](https://community.adobe.com/t5/captivate-discussions/course-stuck-in-resume-inprogress-in-lms-after-failing-course/td-p/11169192)). Our info-icon approach directly addresses this: when a learner *is* legitimately "In Progress" at 100% (still has quiz retries), the icon disambiguates the state; when they've exhausted retries, they transition cleanly to Failed or auto-reset.

### Transient State Suppression (Answer to Q2)

Industry best practice and UX research converge on suppressing the transient "Failed" flash when auto-reset is enabled:

- Error state design patterns recommend that backend workflows should "tolerate minor hiccups, retry failed steps, and gracefully degrade without blocking the user journey" — then surface friendly messages at completion ([Error State Design Patterns — 2Point Agency](https://www.2pointagency.com/glossary/error-state-design-patterns-a-comprehensive-guide/)).
- Modal windows should be reserved for errors that are "super destructive or cause major blocks in the workflow." For transient states that self-resolve (like auto-reset), a non-blocking notification is more appropriate ([Error Handling UX Design Patterns — Medium/Bootcamp](https://medium.com/design-bootcamp/error-handling-ux-design-patterns-c2a5bbae5f8d)).
- The retry pattern in microservices establishes the principle that retryable conditions should not be surfaced as terminal failures ([Retry Pattern in Microservices — GeeksforGeeks](https://www.geeksforgeeks.org/system-design/retry-pattern-in-microservices/)).

The learner should never see "Failed" when auto-reset is on. The status transitions directly from In Progress → In Progress (new attempt), with a notification providing context.

### Confirmation Modal Best Practices

NNg's 8 principles for destructive-action confirmations validate the spec's approach: (1) reserve for serious consequences, (2) avoid overuse, (3) provide specificity about what will happen, (4) use descriptive button labels (not "Yes/No"), (5) enable progressive disclosure, (6) avoid default answers. The spec's confirmation copy ("Reset this learner's progress on [Course]? Their current attempt will be archived and they'll start a fresh course attempt within the same enrolment. Their start date, due date, and recurrence cycle are unchanged.") follows principles 1, 3, and 4 well ([Confirmation Dialogs — NN/g](https://www.nngroup.com/articles/confirmation-dialog/)).

### Tooltip and Indicator Pattern

NNg's tooltip guidelines specify that tooltips should never contain information vital to task completion; they're best for supplementary context, must trigger via both mouse and keyboard hover, and should be kept as microcontent ([Tooltip Guidelines — NN/g](https://www.nngroup.com/articles/tooltip-guidelines/)). The info-icon tooltip ("Content completed. Learner is working through remaining quiz retries to reach the pass score.") aligns with this — it's supplementary disambiguation, not a required action prompt.

NNg's framework distinguishes three communication methods: indicators (passive, contextual icons), validations (error messages), and notifications (system alerts). The info icon is correctly classified as an indicator; the auto-reset notification to learners is correctly a notification ([Indicators, Validations, and Notifications — NN/g](https://www.nngroup.com/articles/indicators-validations-notifications/)).

### Mobile & UX Context

LMS UI/UX design directly influences knowledge retention rates (up to 60% with custom corporate LMS), and retake flows must work seamlessly across devices given 13% CAGR mobile learning growth through 2026 ([LMS UI/UX Design — Riseapps](https://riseapps.co/lms-ui-ux-design/)). The info icon and tooltip should be tested for touch devices (long-press trigger) and small screens.

### UX References

| App | Flow / Screen | Mobbin URL | Pattern Description | Relevance |
|-----|--------------|------------|--------------------|-----------| 
| Teachable | Admin enrollment/student list | [View](https://mobbin.com/screens/3b608ec9-63a0-4e82-b915-4535ea70a9ac) | Course enrollment table with status columns and student data | Direct competitor — reference for how the enrolments table structures status, student names, and progress columns |
| Teachable | Course enrollment detail | [View](https://mobbin.com/screens/c25cf598-e61d-4150-aee2-cfe5d3a4f68c) | Enrollment data table with column headers and row actions | Reference for "Attempt no" column placement alongside existing columns |
| Teachable | Course settings panel | [View](https://mobbin.com/screens/7b6a2876-229b-40f5-b92a-31e90786b2b0) | Admin course configuration with toggles | Direct reference for "Auto-reset on failure" toggle placement in course settings |
| Teachable | Course admin settings | [View](https://mobbin.com/screens/9c100494-356e-470f-bc43-9a7d7caa63e8) | Additional course configuration options | Shows Teachable's pattern for organizing course-level settings and completion rules |
| Teachable | Course enrollment listing | [View](https://mobbin.com/screens/6e826136-4aa1-40bb-a812-847423fdc24c) | Student enrollment table with filters | Reference for filter UI — relevant to "Attempt no ≥ N" filter in Phase 3 |
| Teachable | Course completion settings | [View](https://mobbin.com/screens/fb70adbb-3f02-431a-866e-53b409f1de96) | Completion and certificate configuration | Shows where auto-reset toggle would live alongside completion/certification settings |
| Deel | Admin enrollment/user table | [View](https://mobbin.com/screens/e490327d-01e5-42c3-a4c7-c27925e5d6c1) | HR data table with status column and row actions | Shows how a SaaS admin table handles status badges with contextual actions per row |
| Deel | User management detail | [View](https://mobbin.com/screens/8fcd1acc-25fd-4d6e-8273-1eac2afe2922) | Admin detail view with status indicators | Reference for status badge + info icon pattern on individual records |
| Gusto | Admin enrollment/status table | [View](https://mobbin.com/screens/a9834b56-5fda-406a-accc-7d4ddf1b9868) | Admin table with enrollment status column | Shows how an HR/admin SaaS structures status columns in data tables |
| Fresha | Status badge with tooltip | [View](https://mobbin.com/screens/77260bad-dd3d-4ba6-8db8-cd9fefa57982) | Info tooltip on status indicator in table | Directly relevant — shows the info-icon-next-to-status-badge pattern for disambiguating states |
| Airtable | Status badge with contextual info | [View](https://mobbin.com/screens/432b23d6-8125-4c42-8583-68a7a4407266) | Status badge with supplementary info in data table | Reference for adding contextual information alongside status badges without cluttering the table |
| Remote | Status indicator with tooltip | [View](https://mobbin.com/screens/d04c9f64-c644-4b9c-8e43-93de5b2fdbc0) | Status column with info icon tooltip | HR SaaS showing status disambiguation via hover — directly relevant to the info icon at 100% In Progress |
| Remote | Admin table with actions | [View](https://mobbin.com/screens/ab52924c-333f-42fb-bc19-659aa03720e0) | Row-level actions in admin data table | Reference for how "Reset progress" row action should be positioned alongside other actions |
| Neon | Destructive action confirmation modal | [View](https://mobbin.com/screens/69939de3-465d-484d-9acf-aaabc779a391) | Confirmation dialog for irreversible action | Directly relevant to the "Reset progress" confirmation modal — shows copy and button patterns for destructive confirmations |
| GoDaddy | Destructive action confirmation | [View](https://mobbin.com/screens/e6a78ef8-d065-4a53-9fd6-321ec3a8ea3a) | Confirmation dialog with specific consequence description | Reference for describing consequences clearly in the reset confirmation modal |
| Medium | Content action confirmation | [View](https://mobbin.com/screens/ba3d02a1-c4f6-4834-ba40-26329ddd1a1a) | Confirmation modal with descriptive buttons | Shows Medium's approach to descriptive button labels per NNg guidelines |
| Podia | Course settings with toggles | [View](https://mobbin.com/screens/eba0894c-e936-451b-83ab-90ca22e1c557) | Course admin settings panel with toggle switches | Direct competitor — reference for toggle-based course settings layout |
| Squarespace | Settings configuration panel | [View](https://mobbin.com/screens/d4663073-b945-438c-a16b-bc97ad8b53bb) | Admin settings page with toggle configurations | Reference for layout of auto-reset setting alongside other configuration |
| Circle | Course/community settings | [View](https://mobbin.com/screens/e1076dd2-6fcd-454a-85e5-d5edc500cc3b) | Admin configuration panel for content settings | Shows how a learning platform structures per-course admin settings |

### Built for Mars Lessons

| Title | Type | URL | Lesson | Relevance |
|-------|------|-----|--------|-----------|
| Benchmarking the UX of 6 Delivery Companies | Case study | [View](https://builtformars.com/case-studies/ux-of-parcels) | Confusing or erroring status indicators are "damaging" to user trust. Status tracking must be unambiguous even for non-terminal states. When a temporary status is off-screen, users crave a place to store details and track progression. | Directly validates the info icon on "In Progress" at 100% — disambiguating a non-terminal but potentially confusing state prevents the trust erosion BFM identifies with unclear statuses. |
| The Art (and Science) of Creating Goals That Actually Stick (Strava) | Case study | [View](https://builtformars.com/case-studies/strava) | The best retention strategy helps users feel like they're making progress from the moment they set a goal. Status management must handle users falling behind or recovering momentum through thoughtful interface design. | Relevant to the course attempt counter and progress reset — resetting progress should frame the new attempt as a fresh opportunity, not a punishment, maintaining the learner's sense of momentum. |
| Cognitive Load | Glossary | [View](https://builtformars.com/ux-glossary/cognitive-load) | Reducing cognitive load is essential in admin interfaces — using existing, understood labels plus small indicators rather than inventing new concepts directly reduces the interpretation burden. | Validates the decision against creating new status labels like "Retaking" or "Pass Pending" — each new concept increases cognitive load for admins scanning potentially hundreds of enrollments. |
| Decision Fatigue | Glossary | [View](https://builtformars.com/ux-glossary/decision-fatigue) | Every decision point in an admin workflow costs cognitive energy. Automating the most common response to a condition reduces decision fatigue and preserves attention for edge cases. | Supports the auto-reset feature — by automating the standard response to failure (reset and retry) for compliance courses, the spec reduces per-learner decisions, preserving admin attention for the learners who actually need human intervention. |

---

## 7. Plan of Action

### Phase 1: Info Icon at 100% In Progress ([DEV-4347](https://5mins.atlassian.net/browse/DEV-4347))

*Lowest-risk change. No data model changes.*

- [ ] Update status derivation logic in `progress.ts` / `helpers.ts` to detect the "100% content complete + quiz retries remaining + `quizResult === false`" state
- [ ] Design and implement the info icon component next to the "In Progress" status badge (reference: Fresha, Remote, Airtable Mobbin patterns)
- [ ] Implement tooltip on hover (mouse + keyboard accessible): *"Content completed. Learner is working through remaining quiz retries to reach the pass score."*
- [ ] Ensure tooltip works on touch devices (long-press trigger)
- [ ] Add unit tests for the new status derivation branch
- [ ] QA: Verify info icon appears only in the correct state (100% completion, quiz retries remaining, `quizResult === false`)
- [ ] QA: Verify info icon does NOT appear when `quizResult === true` (Passed) or `quizResult === undefined` (still completing content)

### Phase 2: Auto-Reset + Attempt Tracking + Admin Reset Action ([DEV-4348](https://5mins.atlassian.net/browse/DEV-4348))

*Core data model and feature changes.*

- [ ] **Data model changes:**
  - [ ] Add `courseAttemptNumber` (integer, default 1) to `CourseEnrolment`
  - [ ] Add `courseAttemptNumber` field to `QuestionAnswer` records for attempt scoping
  - [ ] Create `CourseAttemptHistory` collection/table (fields: `courseEnrolmentId`, `attemptNumber`, `score`, `completionDate`, `closeReason`, `adminUserId`, `closedAt`)
  - [ ] Add `autoResetEnabled` (boolean, default false) to `CourseSettings`
  - [ ] Add `maxCourseAttempts` (integer, admin-defined) to `CourseSettings`
  - [ ] Write migration scripts; ensure backward compatibility (existing enrolments get `courseAttemptNumber: 1`)

- [ ] **Reset progress service:**
  - [ ] Implement the Reset progress primitive (snapshot → reset fields → increment attempt → preserve dates → emit event)
  - [ ] Ensure quiz-only reset: progress on content (videos, readings) is not reset; only quiz-related fields (`quizScore`, `quizResult`, `passed`, `taken`, per-question answers) are reset
  - [ ] Ensure old `QuestionAnswer` records remain queryable by `courseAttemptNumber`
  - [ ] Unit test: Reset preserves `startDate`, `endDate`, `dueDate`, recurrence
  - [ ] Unit test: Reset increments `courseAttemptNumber`
  - [ ] Unit test: CourseAttemptHistory row is created with correct fields
  - [ ] Unit test: `maxCourseAttempts` is respected — no reset when limit reached

- [ ] **Auto-reset trigger:**
  - [ ] Implement the four-condition check after every quiz answer submission
  - [ ] Suppress transient "Failed" state in learner-facing UI when auto-reset fires (status transitions directly to In Progress with new attempt number)
  - [ ] Unit test: Auto-reset fires when all four conditions met
  - [ ] Unit test: Auto-reset does NOT fire when `autoResetEnabled === false`
  - [ ] Unit test: Auto-reset does NOT fire when `courseAttemptNumber >= maxCourseAttempts`
  - [ ] Unit test: Learner moves to Failed when auto-reset is off and retries exhausted

- [ ] **Per-course settings UI:**
  - [ ] Add "Auto-reset on failure" toggle to course settings (reference: Teachable, Podia, Squarespace Mobbin patterns)
  - [ ] Add "Maximum course attempts" number input (visible when auto-reset is on, or always visible)
  - [ ] Default: Off / no limit

- [ ] **Admin enrolments table:**
  - [ ] Add "Attempt no" column displaying `courseAttemptNumber` (reference: Teachable enrollment table Mobbin patterns)
  - [ ] Make column sortable
  - [ ] Include in CSV export
  - [ ] Add "Reset progress" row-level action for all statuses (reference: Remote admin table Mobbin pattern)
  - [ ] Implement confirmation modal with descriptive copy and buttons (reference: Neon, GoDaddy, Medium Mobbin patterns; NNg confirmation dialog guidelines)
  - [ ] Record `closeReason` ('admin-reset') and admin user ID in CourseAttemptHistory

- [ ] **Integration tests:**
  - [ ] Happy path 1: Learner passes first try → no reset, attempt stays at 1
  - [ ] Happy path 2: Learner struggles with quiz retries, passes → no reset, info icon shown transiently at 100%
  - [ ] Non-happy path (auto-reset on): Failure → auto-reset → new attempt → learner passes
  - [ ] Non-happy path (auto-reset off): Failure → Failed status → admin manual reset → new attempt
  - [ ] Edge case: Admin resets a Passed learner → new attempt opens, quiz-only reset
  - [ ] Edge case: Learner reaches `maxCourseAttempts` → Failed, no auto-reset

### Phase 3: Notifications & Admin Filter ([DEV-4354](https://5mins.atlassian.net/browse/DEV-4354))

- [ ] Implement in-app notification for learners on Reset progress: *"Your fresh attempt at [Course] is open."*
- [ ] Implement email notification for learners on Reset progress (same copy)
- [ ] Notifications fire for both auto-reset and admin-triggered reset
- [ ] Add "Attempt no ≥ N" filter to the enrolments table, combinable with Status filter (reference: Teachable enrollment listing Mobbin pattern)
- [ ] QA: Verify filter + sort + CSV export all work together
- [ ] QA: Verify notifications are sent correctly for both trigger types

---

## 8. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Infinite retry loops** — a learner with auto-reset on and no max attempts could cycle indefinitely without learning | Wasted learner time; no compliance value; admin doesn't notice | Admin-defined `maxCourseAttempts` setting caps retries. "Attempt no" column + filter (Phase 3) surfaces repeat-strugglers for proactive coaching. |
| **Data model migration breaks existing enrolments** — adding `courseAttemptNumber` to existing records could cause null errors or reporting inconsistencies | Data integrity issues; broken reports | Migration sets `courseAttemptNumber: 1` for all existing enrolments. Backward-compatible: all existing code paths treat absence as 1. |
| **QuestionAnswer scoping by attempt number introduces query complexity** — reporting queries must now filter by `courseAttemptNumber`, and existing queries could return stale cross-attempt data | Incorrect reporting; compliance audit failures | Add `courseAttemptNumber` index; update all existing QuestionAnswer queries to scope to the current attempt; integration tests validate scoping. |
| **Transient "Failed" state leaks to learner UI** — race condition where the UI renders before auto-reset completes | Learner sees "Failed" briefly; anxiety and confusion | Status derivation should check auto-reset eligibility *before* writing "Failed" to the learner-facing state — if auto-reset conditions are met, skip the Failed state entirely and execute reset in the same transaction. |
| **Admin resets a Passed learner by mistake** — the action is available for all statuses, including Passed | Learner loses their passing record; compliance implications | Confirmation modal explicitly states consequences. CourseAttemptHistory preserves the Passed attempt record for audit. The modal copy could be enhanced for Passed learners: "This learner has already passed. Resetting will require them to retake quizzes." |
| **Info icon not discoverable on mobile / touch devices** — hover-based tooltips don't work natively on touch | Admins on tablets miss the disambiguation context | Implement long-press trigger for touch; consider making the tooltip text visible inline on small screens. Test across devices in Phase 1 QA. |
| **Auto-reset fires on overdue enrolments** — a learner past their due date fails and gets auto-reset, but the due date is already passed | Learner gets a new attempt they can't meaningfully complete before the deadline | Deferred per clarifying answers (edge case for now). Future consideration: suppress auto-reset when due date has passed, or warn admin. |
| **Confirmation modal fatigue** — admins batch-resetting many learners must click through a modal each time | Slowed admin workflow; frustration | Phase 1 scope is single-learner reset. Future: consider bulk-reset with a single confirmation ("Reset progress for N learners?") if admins request it. |
| **Audit trail gaps if event hook fails** — CourseAttemptHistory write and reset must be atomic | Lost audit data; compliance risk | Wrap snapshot + reset in a database transaction. If the snapshot fails, the reset does not proceed. |