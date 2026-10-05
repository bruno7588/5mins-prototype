---
ticket: DES-341
summary: Program enrolment automation action
status: In Design Phase
generated: 2026-09-29T18:20:22.441Z
---



# PRD: Program Enrolment Automation Action

## 1. Overview

Today, the platform's automation engine allows admins to enrol matched users into individual **courses** based on trigger-condition rules. However, there is no equivalent capability for **programs** — logical groupings of courses with their own enrolment lifecycle, drip scheduling, and progression logic. This means admins who want to route users into a program by rule must do so manually or build fragile workarounds enrolling users into each constituent course separately.

This ticket introduces a new automation **action type** — "Enrol in Program" — that sits alongside the existing "Enrol in Course" action within the current automation builder. It calls the **existing live program enrolment service** (no new enrolment logic), supports two timing modes (Immediate / Specific date), enforces idempotent enrolment (silently skipping already-enrolled users), and logs every trigger attempt to the Activity tab.

The job this feature is hired to do: **let an admin set up a rule once and trust that the right people end up in the right program, at the right time, without manual intervention or double-enrolment risk.**

---

## 2. Jobs To Be Done

### Main Job

**When I define the audience for a program, I want matching users to be automatically enrolled based on a rule, so that I don't have to manually enrol each person and can trust the system handles timing, deduplication, and logging.**

### Job Map

| Stage | What happens today (Courses) | Gap for Programs | Target state |
|-------|------------------------------|------------------|--------------|
| **Define** | Admin creates an automation with trigger + filters | No "Program" option in the action type | Admin can select "Program" as an action target alongside "Course" |
| **Locate** | Admin searches for a course to attach to the action | Course search only | A unified search that returns both courses and programs, clearly differentiated |
| **Prepare** | Admin configures Enrolment timing (Immediate / After delay), Due date, Frequency | N/A for programs | Admin configures a single Enrolment column: Immediate or Specific date (with date picker) |
| **Confirm** | Admin reviews the automation rule before saving | No program preview | Same review flow, now showing program name and enrolment timing |
| **Execute** | Engine fires on trigger match, enrols user into course | No program enrolment path | Engine calls the existing program enrolment service |
| **Monitor** | Activity tab logs each trigger (user, automation, date) | No program trigger logs | Program triggers appear in the same Activity tab with identical schema |
| **Resolve** | Duplicate enrolment prevented (course-level) | No program-level idempotency | Silently skip already-enrolled users; log the skipped trigger attempt |

### Related Jobs

- **Manage program content drip:** Drip scheduling is already handled by the live program enrolment service. This action defers to that service — drip starts from the actual enrolment date (which may be a future "Specific date").
- **Audit automation activity:** Admins need a single place (Activity tab) to verify that automations are firing correctly for both courses and programs.
- **Maintain data hygiene:** Preventing double enrolment protects reporting accuracy and avoids confusing learner experiences.

### Emotional & Social Dimensions

- **Confidence:** "I set this up once and it just works — I don't worry about people falling through the cracks."
- **Control:** "I can see every trigger in the Activity log, so I'm never in the dark about what the system did."
- **Competence:** "I look organised to stakeholders because programs are populated automatically and on schedule."
- **Trust:** "The system won't double-enrol someone — I don't have to babysit it."

---

## 3. Goals

1. **Parity with course enrolment automation:** Programs become a first-class action target in the automation builder, using the same trigger-condition-action model.
2. **Zero new enrolment logic:** The action delegates entirely to the existing live program enrolment service, including drip handling.
3. **Idempotent by default:** Re-firing an automation for an already-enrolled user silently skips enrolment but records the trigger attempt.
4. **Minimal UI surface area:** A single Enrolment dropdown (Immediate / Specific date) with progressive disclosure of a date picker — no Due date or Frequency columns for programs.
5. **Full auditability:** Every program automation trigger (successful enrolment or skipped duplicate) appears in the Activity tab.

---

## 4. Job Stories

### Configuration

- **When** I am building an automation rule to onboard new hires into a learning path, **I want to** select a program (not just individual courses) as the enrolment action, **so I can** route them into the full structured program with one rule instead of creating separate course enrolments.

- **When** I am choosing the enrolment timing for a program action, **I want to** pick "Immediate" or "Specific date" from a single dropdown, **so I can** decide whether users are enrolled right away or on a scheduled future date without navigating extra configuration.

- **When** I select "Specific date," **I want** a date picker to appear inline, **so I can** choose the exact enrolment date without switching screens or mentally tracking date formats.

- **When** I search for a program to add to my automation, **I want** the search results to clearly distinguish programs from courses, **so I can** confidently select the right item without confusion.

### Execution & Safety

- **When** an automation fires and the matched user is already enrolled in the target program, **I want** the system to silently skip the enrolment, **so I can** trust that no user is double-enrolled regardless of how many times the rule triggers.

- **When** I set a "Specific date" enrolment for a user who doesn't exist yet, **I want** the enrolment record to be created with the future start date and activated once the user registers, **so I can** pre-configure automations ahead of cohort arrivals.

### Monitoring

- **When** I review the Activity tab for an automation, **I want to** see every program trigger alongside course triggers (user, automation name, triggered date), **so I can** audit the automation's behaviour from a single log.

- **When** a trigger fires but enrolment is skipped due to duplication, **I want** the Activity log to still record the trigger attempt, **so I can** understand why enrolment counts differ from trigger counts.

### Eligibility

- **When** I search for programs to attach to an automation action, **I want** only enabled (active) programs to appear in the results, **so I can** avoid accidentally routing users into draft or archived programs.

---

## 5. Requirements

### Functional Requirements

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| FR-01 | The automation Actions table supports a new action type: **Program**. Admins can add program actions alongside existing course actions within the same automation. | Must have | Extends the existing Actions table; does not replace course actions. |
| FR-02 | A **program search** field allows admins to find and select a target program. Only programs with status **Enabled** are returned. | Must have | Mirror the existing course search UX. Clearly label results as "Program" to differentiate from courses (see BFM "Suggested field types" pattern). |
| FR-03 | The program action row displays a single **Enrolment** column with a dropdown: **Immediate** (default) or **Specific date**. | Must have | No Due date or Frequency columns for programs — these are course-specific. |
| FR-04 | When **Specific date** is selected, an inline **date picker** is revealed via progressive disclosure. Past dates are disabled/greyed out. | Must have | Follows NN/g and PatternFly date-input guidelines. |
| FR-05 | When the automation fires, enrolment is executed by calling the **existing live program enrolment service**. No new enrolment logic is introduced. | Must have | Drip scheduling, content release, and progression are handled by the existing service. |
| FR-06 | Enrolment is **idempotent**: if the matched user is already enrolled in the target program, the system silently skips enrolment. No error is surfaced to the admin. | Must have | Use an upsert/existence-check pattern before calling the enrolment service. |
| FR-07 | Every trigger attempt — whether it results in enrolment or a silent skip — is **logged in the Activity tab** with: user, automation name, action (program enrolment), target program, triggered date, and result (enrolled / skipped-duplicate). | Must have | Append-only log; follows the same schema as course automation triggers. |
| FR-08 | For **Specific date** enrolment, the system creates an enrolment record with a future start date. If the user does not yet exist, the enrolment activates upon user registration. | Must have | Aligns with the clarified behaviour: "The user may not exist yet; once registered they get enrolled." |
| FR-09 | The program action can coexist with course actions in the same automation. An automation may contain multiple program actions and multiple course actions. | Should have | Enables complex onboarding flows (e.g., enrol in Program A + Course X). |
| FR-10 | The program search field supports **type-ahead** with a minimum of 2 characters, consistent with the existing course search. | Should have | Performance: paginate or limit results to avoid overwhelming the dropdown. |

---

## 6. Research & Best Practices

### Synthesis

The automation builder follows the well-established **trigger → condition → action** pattern documented by [UI Patterns' Rule Builder reference](https://ui-patterns.com/patterns/rule-builder) and exemplified in the [DelightChat automation rules case study](https://shrutichaturvedi98.medium.com/designing-automation-rules-in-delightchat-892a03b2e9e0). The existing course enrolment action already conforms to this structure; adding a "Program" action type is a natural extension rather than a new paradigm.

**Progressive disclosure** is the dominant UX principle for this feature. [NN/g's cognitive load article](https://www.nngroup.com/articles/4-principles-reduce-cognitive-load/) identifies it as one of four key principles, and [PatternFly's date picker guidelines](https://www.patternfly.org/components/date-and-time/date-picker/design-guidelines/) specifically recommend showing date fields only when a scheduling option is selected. This directly informs the Enrolment dropdown design: default to "Immediate," and reveal the date picker only when "Specific date" is chosen.

For date input itself, [NN/g's date-input guidelines](https://www.nngroup.com/articles/date-input/) advise that calendar pickers work well for dates within a year of the present — appropriate here since program enrolment dates are typically near-future. Past dates should be disabled and greyed out to prevent illogical scheduling.

**Idempotency** is critical. The [eLearning Industry article on LMS automation](https://elearningindustry.com/choosing-the-right-automation-approach-for-your-lms-ecosystem) warns explicitly that rerunning a workflow must not double-enrol a learner, recommending "already processed" checks and idempotent API calls. The [Dev.to article on idempotency patterns](https://dev.to/aloknecessary/idempotency-in-distributed-systems-design-patterns-beyond-retry-safely-k66) provides concrete implementation guidance: upsert operations (INSERT or UPDATE if exists) are naturally idempotent, and a two-phase reservation pattern (atomically insert as IN_PROGRESS, then update to COMPLETED) eliminates race conditions during concurrent triggers — relevant if bulk imports match thousands of users simultaneously.

**Audit logging** requirements are informed by [AppMaster's audit logging guide](https://appmaster.io/blog/audit-logging-internal-tools-activity-feed), which recommends an append-only event log with actor, timestamp, action type, target entity, and JSON payload. For automation-triggered actions, the actor_type should be `system` with the automation name as the actor label. [GS Consulting's audit trail guidance](https://gsconsultingllc.com/insights/building-audit-trails-automated-workflows) reinforces this with structured fields (event ID, correlation ID, workflow name, step, result) and append-only, restricted-write patterns.

The **competitive landscape** confirms this feature's necessity: [Kajabi already offers native automation rules tied to enrolment](https://zapier.com/blog/kajabi-vs-teachable/) with triggers based on quiz outcomes and assignment submissions, plus drip-release content. Teachable and Thinkific offer varying levels of program-level automation. Parity here is table stakes.

### UX References

| App | Flow / Screen | URL | Pattern | Relevance |
|-----|--------------|-----|---------|-----------|
| Contractbook | Automation rule builder with action config | [View](https://mobbin.com/screens/69c87003-6f25-4214-9597-346982c51977) | Trigger-condition-action rule builder with dropdown configuration | Direct parallel to the automation builder where the new program action will be added |
| Coda | Automation action configuration | [View](https://mobbin.com/screens/91c18f06-72a8-4440-81f7-d4ace2d322be) | Automation rule setup with action type selection and conditional fields | Shows how a SaaS tool structures action configuration within a rule builder |
| Calendly | Scheduling configuration with date/time options | [View](https://mobbin.com/screens/9ef6225d-5ae2-40e1-bb9c-cc25c65e4497) | Scheduling form with timing options and date picker | Reference for immediate vs scheduled timing selection in a configuration panel |
| ClickUp | Automation action dropdown and rule builder | [View](https://mobbin.com/screens/a46d689b-a3fc-46fc-bba6-652fde9bdbe6) | Automation builder with action type selection | Pattern for adding new action types alongside existing ones in a rule builder |
| Kit | Automation rule builder with action config | [View](https://mobbin.com/screens/d1a77063-7b00-4c6e-852a-879f095085e0) | Email/action automation configuration | Shows how an action row is configured with timing within an automation |
| Kajabi | Enrolment scheduling admin panel | [View](https://mobbin.com/screens/6dde802e-25ed-4ac1-ad8a-9f6625b61ea8) | LMS-style admin configuration for enrolment | Directly relevant: Kajabi is a course/program platform with enrolment scheduling |
| Teachable | Enrolment configuration in admin | [View](https://mobbin.com/screens/ad1ce4b9-6b3f-4869-917d-bcdc28351f01) | Course/program admin setup with scheduling | Competitor LMS enrolment configuration pattern |
| Gusto | Scheduling config with immediate/date options | [View](https://mobbin.com/screens/780e913a-4dc8-4c11-a5c0-e0d64b8b22f2) | Admin panel with timing selection (now vs specific date) | Pattern for "immediate vs specific date" dropdown with conditional date picker reveal |
| Podia | Enrolment/membership admin config | [View](https://mobbin.com/screens/5e1327bc-13f0-40ab-8536-5d8984413f34) | Course platform admin enrolment settings | Competitor LMS enrolment flow reference |

### Built for Mars Lessons

| Title | Type | URL | Lesson | Relevance |
|-------|------|-----|--------|-----------|
| Avoiding duplicate payments | UX bite | [View](https://builtformars.com/ux-bites/avoiding-duplicate-payments) | Capital One detects and surfaces duplicate automatic payment conflicts, asking users to confirm or skip. | Directly relevant to idempotency: when the automation fires for an already-enrolled user, the system should silently skip but log the trigger — the right call for non-interactive automated actions. |
| Wait, is this a duplicate? | UX bite | [View](https://builtformars.com/ux-bites/wait-is-this-a-duplicate) | Monzo warns users of identical transfers, showing time since last identical action. | Reinforces "records a trigger" requirement: even when skipping a duplicate enrolment, the attempt should be logged for auditability. |
| Hiding the advanced onboarding | UX bite | [View](https://builtformars.com/ux-bites/hiding-the-advanced-onboarding) | Stuff hides advanced options behind a collapsible section (progressive disclosure). | Supports the date picker pattern: default to "Immediate" and only reveal the date picker on "Specific date" selection, keeping the action row compact. |
| Suggested field types | UX bite | [View](https://builtformars.com/ux-bites/suggested-field-types) | Notion suggests field types based on context, reducing configuration cognitive load. | When adding a new action row, the search/selector should clearly differentiate programs from courses with type labels or icons to prevent selection errors. |
| Progressively disclosing an upsell | UX bite | [View](https://builtformars.com/ux-bites/progressively-disclosing-an-upsell) | Impulse reveals options only after the user has context, avoiding information overload. | Confirms that the date picker should appear only after "Specific date" is chosen, not before — keeping the configuration row clean. |

---

## 7. Plan of Action

### Phase 1: Design & Specification

- [ ] Finalise UI mockups for the program action row in the Actions table, showing: program search field, single Enrolment dropdown (Immediate / Specific date), and conditionally revealed date picker.
- [ ] Design the program search component — type-ahead, "Program" type label/icon differentiation, filtered to enabled programs only.
- [ ] Specify the Activity log schema extension for program triggers (enrolled / skipped-duplicate result types).
- [ ] Document the API contract for the new action type: payload shape, validation rules (enabled program, valid future date), and response codes.
- [ ] Conduct design review with engineering to validate feasibility of reusing the existing program enrolment service without modification.

### Phase 2: Backend Implementation

- [ ] Extend the automation action model to support a `program` action type alongside the existing `course` type.
- [ ] Implement the program enrolment action handler that calls the existing live program enrolment service.
- [ ] Implement idempotency check: before calling the enrolment service, query whether the user is already enrolled in the target program; if so, skip and log.
- [ ] Handle the "Specific date" case: create an enrolment record with a future start date; ensure the existing service activates it upon user registration if the user doesn't yet exist.
- [ ] Handle concurrent/bulk trigger scenarios: use an upsert or two-phase reservation pattern to prevent race conditions when many users match simultaneously.
- [ ] Extend the Activity log to record program automation triggers with the specified fields (user, automation, program, date, result).
- [ ] Add validation: reject action configuration if the selected program is not enabled (status check at save time and at trigger time).

### Phase 3: Frontend Implementation

- [ ] Add "Program" as an action type option in the automation Actions table (alongside "Course").
- [ ] Build the program search component with type-ahead, enabled-only filtering, and clear "Program" labelling.
- [ ] Implement the Enrolment dropdown (Immediate / Specific date) with progressive disclosure of the date picker.
- [ ] Disable past dates in the date picker; default to Immediate.
- [ ] Display program automation triggers in the Activity tab using the same row format as course triggers.
- [ ] Ensure the force-trigger drawer (manual trigger for selected users) works with program actions.

### Phase 4: Testing & QA

- [ ] Unit tests for the program enrolment action handler: successful enrolment, idempotent skip, future-date creation, non-existent user handling.
- [ ] Unit tests for validation: disabled/archived program rejection, past date rejection.
- [ ] Integration tests: end-to-end automation trigger → program enrolment → Activity log entry.
- [ ] Concurrency/load test: simulate bulk import matching thousands of users to verify no double-enrolments under race conditions.
- [ ] UI tests: action row rendering, progressive disclosure of date picker, program search filtering, Activity tab display.
- [ ] Regression tests: confirm existing course enrolment automations are unaffected.

### Phase 5: Release & Rollout

- [ ] Feature flag the program action type for staged rollout.
- [ ] Update admin-facing documentation / help centre with the new action type.
- [ ] Monitor Activity logs post-launch for unexpected skip rates or errors.
- [ ] Collect admin feedback on the configuration UX after initial rollout cohort.

---

## 8. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Race conditions during bulk triggers** cause double-enrolment despite idempotency checks. | High — data integrity violation, corrupted reporting. | Use upsert or two-phase reservation pattern at the database level, as recommended by the [idempotency patterns article](https://dev.to/aloknecessary/idempotency-in-distributed-systems-design-patterns-beyond-retry-safely-k66). Include concurrency load tests in QA. |
| **Program status changes after automation is saved** (e.g., program is disabled/archived between config and trigger). | Medium — trigger fires against an invalid program, causing errors or silent failure. | Validate program status at trigger time (not just save time). Log a clear error in the Activity tab if the program is no longer enabled. |
| **"Specific date" enrolment for non-existent users** creates orphaned records if the user never registers. | Low — data clutter, minor storage cost. | Document expected behaviour. Consider a periodic cleanup job (out of scope for this ticket but flagged for future backlog). |
| **Admin confusion between courses and programs** in the search/selector. | Medium — wrong item selected, users enrolled in incorrect content. | Clearly differentiate programs from courses with type labels or icons in search results, per the BFM "Suggested field types" pattern. |
| **Existing program enrolment service cannot handle high-throughput batch calls** from automation triggers. | Medium — timeouts, partial enrolment of a matched cohort. | Profile the enrolment service under load before launch. Implement retry with backoff for transient failures; queue-based processing for large batches if needed. |
| **Activity log volume increases significantly** with program triggers added. | Low — performance degradation of Activity tab queries over time. | Append-only log with proper indexing. Paginate the Activity tab UI. Consider archival policy for old entries (future backlog). |